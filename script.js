
const API_URL = 'https://script.google.com/macros/s/AKfycbwk1ptgpIOGR4Ft3tm6ahgNqgFtN6wwqbQZC7jgYN7XeBfhtVp_cqQ6wJFyLztCsW1U/exec';



let allData = [], filteredData = [];

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

async function loadData(){
  document.getElementById('results').innerHTML = '<div class="loading">✨ Loading…</div>';
  try {
    const res = await fetch(API_URL);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    const parsed = parseData(rows);
    allData = aggregateByRestaurant(parsed);
    populateFilters();
    filterData();
    updateLastUpdate();
  } catch(err) {
    console.error(err);
    document.getElementById('results').innerHTML = `
      <div class="no-results">
        <h2>😕 ${err.message}</h2>
      </div>`;
  }
}

function parseData(rows){
  return rows.map((r,i) => {
    // Extract prices by exact header names
    const priceSol = parseFloat(r['How much did you pay (S/.)?'] || 0);
    const priceUsd = parseFloat(r['How much did you pay (USD $ )?'] || 0);
    
    // Determine city
    const cityCols = [
      'Which city in Amazonas','Which city in Ancash','Which city in Apirimac',
      'Which city in Arequipa','Which city in Ayacucho','Which city in Cajamarca',
      'Which city in Callao','Which city in Cusco','Which city in Huancavelica',
      'Which city in Huanuco','Which city in Ica','Which city in Junin',
      'Which city in La Libertad','Which city in Lambayeque','Where in Lima',
      'Which city in Loreto','Which city in Madre de Dios','Which city in Moquegua',
      'Which city in Pasco','Which city in Piura','Which city in Puno',
      'Which city in San Martin','Which city in Tacna','Which city in Tumbes',
      'Which city in Ucayali','City'
    ];
    let city = '';
    for(let c of cityCols){
      if(r[c] && String(r[c]).trim()!==''){
        city = String(r[c]).trim();
        break;
      }
    }
    
    return {
      place:    String(r['Name of Place'] || '').trim(),
      category: String(r['Category:'] || '').trim(),
      country:  String(r['Country'] || '').trim(),
      region:   String(r['Department'] || r['Region/State'] || '').trim(),
      city:     city,
      rating:   parseFloat(r['What is your rating?'] || 0),
      priceSol,
      priceUsd,
      notes:    String(r['Notes'] || '').trim()
    };
  }).filter(x=>x.place);
}

function aggregateByRestaurant(data){
  const grouped = {};
  data.forEach(item=>{
    // Normalize place+city keys
    const np = item.place.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,'')
      .replace(/\s+/g,'').trim();
    const nc = item.city.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,'')
      .replace(/\s+/g,'').trim();
    const key = np+'|||'+nc;
    if(!grouped[key]){
      grouped[key]={
        place:item.place,country:item.country,
        region:item.region,city:item.city,
        category:item.category,ratings:[],
        pricesS:[],pricesU:[],notes:[],
        reviewCount:0
      };
    }
    let g=grouped[key];
    if(item.rating>0)   g.ratings.push(item.rating);
    if(item.priceSol>0) g.pricesS.push(item.priceSol);
    if(item.priceUsd>0) g.pricesU.push(item.priceUsd);
    if(item.notes)      g.notes.push(item.notes);
    g.reviewCount++;
    // merge categories
    let cats=new Set((g.category+','+item.category).split(',').map(c=>c.trim()).filter(Boolean));
    g.category=Array.from(cats).join(', ');
  });
  return Object.values(grouped).map(g=>{
    const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
    const r=avg(g.ratings), s=avg(g.pricesS), u=avg(g.pricesU);
    const price = g.country==='Peru'? s : u;
    const symbol= g.country==='Peru'? 'S/.' : '$';
    return {
      place:g.place,country:g.country,region:g.region,city:g.city,
      category:g.category,rating:r,price:price,currency:symbol,
      reviewCount:g.reviewCount,notes:g.notes.join(' | ')
    };
  });
}

function populateFilters(){
  const cs=new Set(), rs=new Set(), xs=new Set(), ts=new Set();
  allData.forEach(i=>{
    if(i.country) cs.add(i.country);
    if(i.region)  rs.add(i.region);
    if(i.city)    xs.add(i.city);
    i.category.split(',').forEach(c=>ts.add(c.trim()));
  });
  selFill('countryFilter',cs);
  selFill('regionFilter',rs);
  selFill('cityFilter',xs);
  selFill('categoryFilter',ts);
}

function selFill(id,set){
  let arr=[...set].filter(Boolean).sort(); arr.unshift('All');
  document.getElementById(id).innerHTML = arr.map(v=>`<option>${v}</option>`).join('');
}

function setupEventListeners(){
  document.getElementById('searchBox').oninput      = filterData;
  document.getElementById('countryFilter').onchange = ()=>{
    populateRegion();filterData();
  };
  function populateRegion(){
    const cf=document.getElementById('countryFilter').value;
    const rs=new Set(allData.filter(i=>cf==='All'||i.country===cf).map(i=>i.region));
    selFill('regionFilter',rs);
    populateCity();
  }
  function populateCity(){
    const cf=document.getElementById('countryFilter').value;
    const rf=document.getElementById('regionFilter').value;
    const xs=new Set(allData.filter(i=>
      (cf==='All'||i.country===cf) &&
      (rf==='All'||i.region===rf)
    ).map(i=>i.city));
    selFill('cityFilter',xs);
  }
  document.getElementById('regionFilter').onchange = ()=>{
    populateCity();filterData();
  };
  document.getElementById('cityFilter').onchange     = filterData;
  document.getElementById('categoryFilter').onchange = filterData;
  document.getElementById('sortBy').onchange         = filterData;
  document.getElementById('clearFilters').onclick    = ()=> {
    ['searchBox','countryFilter','regionFilter','cityFilter','categoryFilter']
      .forEach(id=>document.getElementById(id).value='All');
    document.getElementById('searchBox').value='';
    document.getElementById('sortBy').value='rating-desc';
    filterData();
  };
}

function filterData(){
  const txt=document.getElementById('searchBox').value.toLowerCase(),
        cf=document.getElementById('countryFilter').value,
        rf=document.getElementById('regionFilter').value,
        tif=document.getElementById('cityFilter').value,
        catf=document.getElementById('categoryFilter').value,
        sb=document.getElementById('sortBy').value;
  
  filteredData=allData.filter(i=>{
    const matchSearch = !txt ||
      i.place.toLowerCase().includes(txt)||
      i.city.toLowerCase().includes(txt)||
      i.region.toLowerCase().includes(txt)||
      i.country.toLowerCase().includes(txt)||
      i.notes.toLowerCase().includes(txt)||
      i.category.toLowerCase().includes(txt);
    const matchCountry = cf==='All'||i.country===cf;
    const matchRegion  = rf==='All'||i.region===rf;
    const matchCity    = tif==='All'||i.city===tif;
    const matchCat     = catf==='All'||i.category.split(',').map(c=>c.trim()).includes(catf);
    return matchSearch && matchCountry && matchRegion && matchCity && matchCat;
  });
  
  filteredData.sort((a,b)=>{
    switch(sb){
      case 'rating-desc': return b.rating-a.rating;
      case 'rating-asc':  return a.rating-b.rating;
      case 'price-asc':   return a.price-b.price;
      case 'price-desc':  return b.price-a.price;
      case 'name-asc':    return a.place.localeCompare(b.place);
      case 'reviews-desc':return b.reviewCount-a.reviewCount;
      default: return 0;
    }
  });
  renderResults();
}

function renderResults(){
  const res=document.getElementById('results'),
        stat=document.getElementById('stats');
  stat.textContent=`Showing ${filteredData.length} of ${allData.length} places`;
  if(!filteredData.length){
    res.innerHTML=`<div class="no-results">
      <h2>🔍 No restaurants found</h2>
      <p>Try adjusting your filters</p>
    </div>`;
    return;
  }
  res.innerHTML = filteredData.map(item=>`
    <div class="card">
      <div class="card-header">
        <div class="place-name">${escapeHtml(item.place)}</div>
        <div class="rating-badge">${item.rating?item.rating.toFixed(1):'N/A'} ⭐</div>
      </div>
      <div class="location-info">
        ${item.country?`<div class="location-row">🌎 ${escapeHtml(item.country)}</div>`:''}
        ${item.region?`<div class="location-row">🗺️ ${escapeHtml(item.region)}</div>`:''}
        ${item.city?`<div class="location-row">📍 ${escapeHtml(item.city)}</div>`:''}
      </div>
      ${item.category?`<div class="tags">${item.category.split(',').map(c=>
        `<span class="tag">${escapeHtml(c.trim())}</span>`).join('')}</div>`:''}
      <div class="price-reviews">
        <div class="price">${item.currency} ${item.price.toFixed(2)}</div>
        <div class="reviews">${item.reviewCount} review${item.reviewCount!==1?'s':''}</div>
      </div>
      ${item.notes?`<div class="notes">${escapeHtml(item.notes)}</div>`:''}
    </div>
  `).join('');
}

function escapeHtml(t){
  let d=document.createElement('div');d.textContent=String(t);return d.innerHTML;
}

function updateLastUpdate(){
  document.getElementById('lastUpdate').textContent=new Date().toLocaleString();
}

setInterval(loadData,300000);
