
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
const pricePEN = parseFloat(r['How much did you pay (PEN S/.)?'] || 0);
const priceUSD = parseFloat(r['How much did you pay (USD $)?'] || 0);
const pricePYG = parseFloat(r['How much did you pay (PYG ₲)?'] || 0);
const priceGYD = parseFloat(r['How much did you pay (GYD G$)?'] || 0);

const customPrice = parseFloat(r['How much did you pay?'] || 0);
const customCurrency = String(r['What currency did you report?'] || '').trim();
    
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
  place: String(r['Name of Place'] || '').trim(),
  category: String(r['Category:'] || '').trim(),
  country: String(r['Country'] || '').trim(),
  region: String(r['Department'] || r['Region/State'] || '').trim(),
  city: city,
  rating: parseFloat(r['What is your rating?'] || 0),

  pricePEN,
  priceUSD,
  pricePYG,
  priceGYD,
  customPrice,
  customCurrency,

  notes: String(r['Notes'] || '').trim()
};
  }).filter(x=>x.place);
}
function normalizePlaceName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\bc\d+\b/g, '')
    .replace(/\blocal\s*\d+\b/g, '')
    .replace(/\bsede\b/g, '')
    .replace(/\bsucursal\b/g, '')
    .replace(/\s+/g, '')   // ← remove ALL spaces
    .trim();
}

function namesMatch(a, b) {
  const na = normalizePlaceName(a);
  const nb = normalizePlaceName(b);

  return (
    na === nb ||
    na.includes(nb) ||
    nb.includes(na)
  );
}

console.log(
  namesMatch(
    "La Chola Sangucheria",
    "La Chola Sangucheria Cajamarquina C4"
  )
);
function aggregateByRestaurant(data){
  const grouped = [];

  data.forEach(item => {

const existing = grouped.find(g =>
  g.country.toLowerCase() === item.country.toLowerCase() &&
  g.region.toLowerCase() === item.region.toLowerCase() &&
  namesMatch(g.place, item.place)
);

    
    let g;

    if (existing) {
      g = existing;
    } else {
      g = {
        place: item.place,
        country: item.country,
        region: item.region,
        city: item.city,
        category: item.category,
        ratings: [],
        pricesPEN: [],
        pricesUSD: [],
        pricesPYG: [],
        pricesGYD: [],
        customPrices: [],
        customCurrencies: [],
        notes: [],
        reviewCount: 0
      };

      grouped.push(g);
    }

    if (item.rating > 0) g.ratings.push(item.rating);
if (item.pricePEN > 0) g.pricesPEN.push(item.pricePEN);
if (item.priceUSD > 0) g.pricesUSD.push(item.priceUSD);
if (item.pricePYG > 0) g.pricesPYG.push(item.pricePYG);
if (item.priceGYD > 0) g.pricesGYD.push(item.priceGYD);

if (item.customPrice > 0) {
  g.customPrices.push(item.customPrice);

  if (item.customCurrency) {
    g.customCurrencies.push(item.customCurrency);
  }
}
    if (item.notes) g.notes.push(item.notes);

    g.reviewCount++;

    const cats = new Set(
      (g.category + ',' + item.category)
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)
    );

    g.category = Array.from(cats).join(', ');
  });

  return grouped.map(g => {
    const avg = arr =>
      arr.length
        ? arr.reduce((a, b) => a + b, 0) / arr.length
        : 0;

    const rating = avg(g.ratings);
      const penPrice = avg(g.pricesPEN);
      const usdPrice = avg(g.pricesUSD);
      const pygPrice = avg(g.pricesPYG);
      const gydPrice = avg(g.pricesGYD);
      const customPrice = avg(g.customPrices);

  
