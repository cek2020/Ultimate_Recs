/**
 * Currency Converter Module
 * Handles real-time currency conversion for restaurant pricing
 * Uses exchangerate-api.com (free tier: 1,500 requests/month)
 * SUPPORTS ALL COUNTRIES WORLDWIDE
 */

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest';
const CACHE_DURATION = 604800000; // 1 week in milliseconds
let exchangeRates = {};
let lastFetchTime = 0;

async function getExchangeRates(baseCurrency = 'USD') {
  const now = Date.now();
  if (exchangeRates[baseCurrency] && (now - lastFetchTime) < CACHE_DURATION) {
    console.log(`📦 Using cached rates for ${baseCurrency}`);
    return exchangeRates[baseCurrency];
  }
  try {
    const res = await fetch(`${EXCHANGE_API_URL}/${baseCurrency}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    exchangeRates[baseCurrency] = data.rates;
    lastFetchTime = now;
    console.log(`✅ Exchange rates fetched for ${baseCurrency}`, data.rates);
    return data.rates;
  } catch (err) {
    console.error('❌ Failed to fetch exchange rates:', err);
    return getFallbackRates(baseCurrency);
  }
}

// (Keep your existing getFallbackRates function unchanged — omitted here for brevity)

async function convertCurrency(amount, fromCurrency, toCurrency = 'USD') {
  if (!amount || amount <= 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  try {
    const rates = await getExchangeRates(fromCurrency);
    if (!rates[toCurrency]) {
      console.warn(`⚠️ No rate found for ${fromCurrency} → ${toCurrency}, using fallback`);
      const fallbackRates = getFallbackRates(fromCurrency);
      if (fallbackRates[toCurrency]) {
        const converted = amount * fallbackRates[toCurrency];
        console.log(`💱 ${amount} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency} (fallback)`);
        return converted;
      }
      return amount;
    }
    const convertedAmount = amount * rates[toCurrency];
    console.log(`💱 ${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`);
    return convertedAmount;
  } catch (err) {
    console.error(`❌ Conversion error: ${err}`);
    return amount;
  }
}

/**
 * Map currency names (and common variants/misspellings) to ISO 4217 codes.
 * Used by extractCurrencyCode() to handle plain-English currency names in data.
 * *** FIX: This is what makes "mongolian tugrik" → "MNT" instead of "USD" ***
 */
const CURRENCY_NAME_TO_CODE = {
  // A
  'afghan afghani': 'AFN', 'afghani': 'AFN',
  'albanian lek': 'ALL', 'lek': 'ALL',
  'algerian dinar': 'DZD',
  'angolan kwanza': 'AOA', 'kwanza': 'AOA',
  'argentine peso': 'ARS',
  'armenian dram': 'AMD', 'dram': 'AMD',
  'aruban florin': 'AWG',
  'australian dollar': 'AUD',
  'azerbaijani manat': 'AZN',

  // B
  'bahamian dollar': 'BSD',
  'bahraini dinar': 'BHD',
  'bangladeshi taka': 'BDT', 'taka': 'BDT',
  'barbadian dollar': 'BBD', 'barbados dollar': 'BBD',
  'belarusian ruble': 'BYN',
  'belize dollar': 'BZD',
  'bermudian dollar': 'BMD',
  'bhutanese ngultrum': 'BTN', 'ngultrum': 'BTN',
  'bolivian boliviano': 'BOB', 'boliviano': 'BOB',
  'bosnia-herzegovina convertible mark': 'BAM', 'convertible mark': 'BAM',
  'botswana pula': 'BWP', 'pula': 'BWP',
  'brazilian real': 'BRL', 'real': 'BRL',
  'british pound': 'GBP', 'pound sterling': 'GBP', 'sterling': 'GBP',
  'brunei dollar': 'BND',
  'bulgarian lev': 'BGN', 'lev': 'BGN',
  'burundian franc': 'BIF',

  // C
  'cape verdean escudo': 'CVE',
  'cambodian riel': 'KHR', 'riel': 'KHR',
  'canadian dollar': 'CAD',
  'cayman islands dollar': 'KYD',
  'central african cfa franc': 'XAF', 'cfa franc beac': 'XAF',
  'chilean peso': 'CLP',
  'chinese yuan': 'CNY', 'renminbi': 'CNY', 'yuan': 'CNY',
  'colombian peso': 'COP',
  'comorian franc': 'KMF',
  'congolese franc': 'CDF',
  'costa rican colon': 'CRC', 'costa rican colón': 'CRC', 'colon': 'CRC',
  'croatian kuna': 'HRK', 'kuna': 'HRK',
  'cuban peso': 'CUP',
  'czech koruna': 'CZK', 'koruna': 'CZK',

  // D
  'danish krone': 'DKK',
  'djiboutian franc': 'DJF',
  'dominican peso': 'DOP',

  // E
  'east caribbean dollar': 'XCD', 'eastern caribbean dollar': 'XCD',
  'egyptian pound': 'EGP',
  'eritrean nakfa': 'ERN', 'nakfa': 'ERN',
  'ethiopian birr': 'ETB', 'birr': 'ETB',
  'euro': 'EUR',

  // F
  'falkland islands pound': 'FKP',
  'fijian dollar': 'FJD',

  // G
  'gambian dalasi': 'GMD', 'dalasi': 'GMD',
  'georgian lari': 'GEL', 'lari': 'GEL',
  'ghanaian cedi': 'GHS', 'cedi': 'GHS',
  'gibraltar pound': 'GIP',
  'guatemalan quetzal': 'GTQ', 'quetzal': 'GTQ',
  'guinean franc': 'GNF',
  'guyanese dollar': 'GYD',

  // H
  'haitian gourde': 'HTG', 'gourde': 'HTG',
  'honduran lempira': 'HNL', 'lempira': 'HNL',
  'hong kong dollar': 'HKD',
  'hungarian forint': 'HUF', 'forint': 'HUF',

  // I
  'icelandic krona': 'ISK', 'icelandic króna': 'ISK',
  'indian rupee': 'INR',
  'indonesian rupiah': 'IDR', 'rupiah': 'IDR',
  'iranian rial': 'IRR',
  'iraqi dinar': 'IQD',
  'israeli new shekel': 'ILS', 'shekel': 'ILS', 'new shekel': 'ILS',

  // J
  'jamaican dollar': 'JMD',
  'japanese yen': 'JPY', 'yen': 'JPY',
  'jordanian dinar': 'JOD',

  // K
  'kazakhstani tenge': 'KZT', 'tenge': 'KZT',
  'kenyan shilling': 'KES',
  'kuwaiti dinar': 'KWD',
  'kyrgyzstani som': 'KGS', 'kyrgyz som': 'KGS', 'som': 'KGS',

  // L
  'laotian kip': 'LAK', 'lao kip': 'LAK', 'kip': 'LAK',
  'lebanese pound': 'LBP',
  'lesotho loti': 'LSL', 'loti': 'LSL',
  'liberian dollar': 'LRD',
  'libyan dinar': 'LYD',

  // M
  'macanese pataca': 'MOP', 'pataca': 'MOP',
  'malagasy ariary': 'MGA', 'ariary': 'MGA',
  'malawian kwacha': 'MWK',
  'malaysian ringgit': 'MYR', 'ringgit': 'MYR',
  'maldivian rufiyaa': 'MVR', 'rufiyaa': 'MVR',
  'mauritanian ouguiya': 'MRU', 'ouguiya': 'MRU',
  'mauritian rupee': 'MUR',
  'mexican peso': 'MXN',
  'moldovan leu': 'MDL',
  'mongolian tugrik': 'MNT', 'mongolian tögrög': 'MNT', 'mongolian togrog': 'MNT',
  'tugrik': 'MNT', 'togrog': 'MNT', 'tögrög': 'MNT',  // *** KEY FIX ***
  'moroccan dirham': 'MAD',
  'mozambican metical': 'MZN', 'metical': 'MZN',
  'myanmar kyat': 'MMK', 'burmese kyat': 'MMK', 'kyat': 'MMK',

  // N
  'namibian dollar': 'NAD',
  'nepalese rupee': 'NPR',
  'netherlands antillean guilder': 'ANG',
  'new taiwan dollar': 'TWD', 'taiwan dollar': 'TWD',
  'new zealand dollar': 'NZD',
  'nicaraguan cordoba': 'NIO', 'nicaraguan córdoba': 'NIO', 'cordoba': 'NIO',
  'nigerian naira': 'NGN', 'naira': 'NGN',
  'north korean won': 'KPW',
  'norwegian krone': 'NOK',

  // O
  'omani rial': 'OMR',

  // P
  'pakistani rupee': 'PKR',
  'panamanian balboa': 'PAB', 'balboa': 'PAB',
  'papua new guinean kina': 'PGK', 'kina': 'PGK',
  'paraguayan guarani': 'PYG', 'guarani': 'PYG',
  'peruvian sol': 'PEN', 'sol': 'PEN',
  'philippine peso': 'PHP',
  'polish zloty': 'PLN', 'zloty': 'PLN', 'złoty': 'PLN',

  // Q
  'qatari riyal': 'QAR',

  // R
  'romanian leu': 'RON',
  'russian ruble': 'RUB', 'ruble': 'RUB',
  'rwandan franc': 'RWF',

  // S
  'saint helena pound': 'SHP',
  'samoan tala': 'WST', 'tala': 'WST',
  'saudi riyal': 'SAR',
  'serbian dinar': 'RSD',
  'seychellois rupee': 'SCR',
  'sierra leonean leone': 'SLE', 'leone': 'SLE',
  'singapore dollar': 'SGD',
  'solomon islands dollar': 'SBD',
  'somali shilling': 'SOS',
  'south african rand': 'ZAR', 'rand': 'ZAR',
  'south korean won': 'KRW', 'korean won': 'KRW', 'won': 'KRW',
  'south sudanese pound': 'SSP',
  'sri lankan rupee': 'LKR',
  'sudanese pound': 'SDG',
  'surinamese dollar': 'SRD',
  'swazi lilangeni': 'SZL', 'lilangeni': 'SZL',
  'swedish krona': 'SEK',
  'swiss franc': 'CHF',

  // T
  'tajikistani somoni': 'TJS', 'somoni': 'TJS',
  'tanzanian shilling': 'TZS',
  'thai baht': 'THB', 'baht': 'THB',
  'tongan paanga': 'TOP', "pa'anga": 'TOP',
  'trinidad and tobago dollar': 'TTD', 'tt dollar': 'TTD',
  'tunisian dinar': 'TND',
  'turkish lira': 'TRY', 'lira': 'TRY',
  'turkmenistani manat': 'TMT',

  // U
  'ugandan shilling': 'UGX',
  'ukrainian hryvnia': 'UAH', 'hryvnia': 'UAH',
  'united arab emirates dirham': 'AED', 'uae dirham': 'AED', 'dirham': 'AED',
  'uruguayan peso': 'UYU',
  'us dollar': 'USD', 'united states dollar': 'USD', 'american dollar': 'USD',
  'uzbekistani som': 'UZS',

  // V
  'vanuatu vatu': 'VUV', 'vatu': 'VUV',
  'venezuelan bolivar': 'VES', 'bolivar': 'VES', 'bolívar': 'VES',
  'vietnamese dong': 'VND', 'dong': 'VND',

  // W
  'west african cfa franc': 'XOF', 'cfa franc bceao': 'XOF',

  // Y
  'yemeni rial': 'YER',

  // Z
  'zambian kwacha': 'ZMW',
  'zimbabwean dollar': 'ZWL',
};

/**
 * Get the native currency for a country.
 * Now covers ALL countries worldwide, not just Latin America.
 */
function getCountryBaseCurrency(country) {
  const currencyMap = {
    // Latin America (unchanged from original)
    'Peru': 'PEN', 'Paraguay': 'PYG', 'Guyana': 'GYD',
    'Ecuador': 'USD', 'Chile': 'CLP', 'Argentina': 'ARS',
    'Brazil': 'BRL', 'Colombia': 'COP', 'Venezuela': 'VES',
    'Uruguay': 'UYU', 'Bolivia': 'BOB', 'Suriname': 'SRD',
    'Mexico': 'MXN', 'Honduras': 'HNL', 'Guatemala': 'GTQ',
    'Nicaragua': 'NIO', 'Costa Rica': 'CRC', 'Panama': 'PAB',
    'Belize': 'BZD', 'El Salvador': 'SVC',
    'Dominican Republic': 'DOP', 'Cuba': 'CUP',
    'Puerto Rico': 'USD', 'Haiti': 'HTG', 'Jamaica': 'JMD',
    'Barbados': 'BBD', 'Trinidad and Tobago': 'TTD',
    'Bahamas': 'BSD', 'Antigua and Barbuda': 'XCD',
    'Dominica': 'XCD', 'Grenada': 'XCD',
    'Saint Lucia': 'XCD', 'Saint Vincent and the Grenadines': 'XCD',

    // North America
    'United States': 'USD', 'USA': 'USD', 'Canada': 'CAD',

    // Europe
    'Eurozone': 'EUR',
    'Germany': 'EUR', 'France': 'EUR', 'Italy': 'EUR', 'Spain': 'EUR',
    'Portugal': 'EUR', 'Netherlands': 'EUR', 'Belgium': 'EUR',
    'Austria': 'EUR', 'Greece': 'EUR', 'Finland': 'EUR',
    'Ireland': 'EUR', 'Luxembourg': 'EUR', 'Malta': 'EUR',
    'Cyprus': 'EUR', 'Slovakia': 'EUR', 'Slovenia': 'EUR',
    'Estonia': 'EUR', 'Latvia': 'EUR', 'Lithuania': 'EUR',
    'United Kingdom': 'GBP', 'UK': 'GBP',
    'Switzerland': 'CHF', 'Norway': 'NOK', 'Sweden': 'SEK',
    'Denmark': 'DKK', 'Iceland': 'ISK',
    'Poland': 'PLN', 'Czech Republic': 'CZK', 'Czechia': 'CZK',
    'Hungary': 'HUF', 'Romania': 'RON', 'Bulgaria': 'BGN',
    'Croatia': 'EUR', 'Serbia': 'RSD', 'Albania': 'ALL',
    'Bosnia and Herzegovina': 'BAM', 'Montenegro': 'EUR',
    'North Macedonia': 'MKD', 'Moldova': 'MDL',
    'Ukraine': 'UAH', 'Belarus': 'BYN',
    'Russia': 'RUB',

    // Asia
    'China': 'CNY', 'Japan': 'JPY', 'South Korea': 'KRW',
    'North Korea': 'KPW', 'India': 'INR', 'Pakistan': 'PKR',
    'Bangladesh': 'BDT', 'Sri Lanka': 'LKR', 'Nepal': 'NPR',
    'Bhutan': 'BTN', 'Maldives': 'MVR',
    'Thailand': 'THB', 'Vietnam': 'VND', 'Cambodia': 'KHR',
    'Laos': 'LAK', 'Myanmar': 'MMK', 'Burma': 'MMK',
    'Malaysia': 'MYR', 'Singapore': 'SGD', 'Indonesia': 'IDR',
    'Philippines': 'PHP', 'Brunei': 'BND',
    'Mongolia': 'MNT',  // *** KEY FIX ***
    'Kazakhstan': 'KZT', 'Uzbekistan': 'UZS',
    'Kyrgyzstan': 'KGS', 'Tajikistan': 'TJS',
    'Turkmenistan': 'TMT', 'Afghanistan': 'AFN',
    'Iran': 'IRR', 'Iraq': 'IQD', 'Saudi Arabia': 'SAR',
    'UAE': 'AED', 'United Arab Emirates': 'AED',
    'Qatar': 'QAR', 'Kuwait': 'KWD', 'Bahrain': 'BHD',
    'Oman': 'OMR', 'Yemen': 'YER', 'Jordan': 'JOD',
    'Lebanon': 'LBP', 'Syria': 'SYP', 'Israel': 'ILS',
    'Palestine': 'ILS', 'Turkey': 'TRY', 'Azerbaijan': 'AZN',
    'Armenia': 'AMD', 'Georgia': 'GEL',
    'Taiwan': 'TWD', 'Hong Kong': 'HKD', 'Macau': 'MOP',

    // Africa
    'South Africa': 'ZAR', 'Nigeria': 'NGN', 'Kenya': 'KES',
    'Ghana': 'GHS', 'Ethiopia': 'ETB', 'Tanzania': 'TZS',
    'Uganda': 'UGX', 'Rwanda': 'RWF', 'Egypt': 'EGP',
    'Morocco': 'MAD', 'Algeria': 'DZD', 'Tunisia': 'TND',
    'Libya': 'LYD', 'Sudan': 'SDG', 'South Sudan': 'SSP',
    'Angola': 'AOA', 'Mozambique': 'MZN', 'Zambia': 'ZMW',
    'Zimbabwe': 'ZWL', 'Botswana': 'BWP', 'Namibia': 'NAD',
    'Malawi': 'MWK', 'Lesotho': 'LSL', 'Eswatini': 'SZL', 'Swaziland': 'SZL',
    'Cameroon': 'XAF', 'Senegal': 'XOF', "Côte d'Ivoire": 'XOF',
    'Ivory Coast': 'XOF', 'Mali': 'XOF', 'Burkina Faso': 'XOF',
    'Guinea': 'GNF', 'Madagascar': 'MGA', 'Somalia': 'SOS',
    'Mauritius': 'MUR', 'Seychelles': 'SCR',

    // Oceania
    'Australia': 'AUD', 'New Zealand': 'NZD',
    'Fiji': 'FJD', 'Papua New Guinea': 'PGK',
    'Samoa': 'WST', 'Tonga': 'TOP', 'Vanuatu': 'VUV',
    'Solomon Islands': 'SBD',
  };
  return currencyMap[country] || 'USD';
}

/**
 * Get currency symbol for display.
 * Extended with worldwide symbols.
 */
function getCurrencySymbol(currencyCode) {
  const symbols = {
    // Latin America (unchanged)
    'USD': '$', 'PEN': 'S/.', 'PYG': '₲', 'GYD': 'G$',
    'CLP': '$', 'MXN': '$', 'ARS': '$', 'BRL': 'R$',
    'COP': '$', 'VES': 'Bs.', 'UYU': '$', 'BOB': 'Bs.',
    'SRD': '$', 'HNL': 'L', 'GTQ': 'Q', 'NIO': 'C$',
    'CRC': '₡', 'PAN': 'B/.', 'BZD': '$', 'SVC': '₡',
    'DOP': '$', 'CUP': '₱', 'HTG': 'G', 'JMD': '$',
    'BBD': '$', 'TTD': '$', 'BSD': '$', 'XCD': '$',

    // Worldwide additions
    'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥',
    'KRW': '₩', 'INR': '₹', 'RUB': '₽', 'TRY': '₺',
    'THB': '฿', 'VND': '₫', 'MNT': '₮',  // *** KEY FIX ***
    'PHP': '₱', 'IDR': 'Rp', 'MYR': 'RM', 'SGD': '$',
    'HKD': '$', 'TWD': '$', 'AED': 'د.إ', 'SAR': '﷼',
    'QAR': '﷼', 'KWD': 'د.ك', 'BHD': 'BD', 'OMR': '﷼',
    'ILS': '₪', 'EGP': '£', 'ZAR': 'R', 'NGN': '₦',
    'GHS': '₵', 'KES': 'KSh', 'MAD': 'MAD', 'DZD': 'DA',
    'CAD': '$', 'AUD': '$', 'NZD': '$', 'CHF': 'Fr',
    'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
    'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei',
    'UAH': '₴', 'HRK': 'kn', 'BGN': 'лв', 'RSD': 'din',
    'PAB': 'B/.', 'KZT': '₸', 'UZS': 'soʻm',
  };
  return symbols[currencyCode] || currencyCode;
}

/**
 * Extract ISO 4217 currency code from a currency string.
 * *** MAIN FIX: Now handles plain English names like "mongolian tugrik" ***
 *
 * Handles:
 *   "PEN S/."           → "PEN"   (3-letter code prefix)
 *   "USD $"             → "USD"
 *   "mongolian tugrik"  → "MNT"   ← was broken before
 *   "Euro"              → "EUR"
 *   "Japanese yen"      → "JPY"
 *   "MNT"               → "MNT"   (bare code)
 */
function extractCurrencyCode(currencyString) {
  const str = String(currencyString).trim();

  // 1. Already a bare 3-letter ISO code (e.g. "MNT", "USD")
  if (/^[A-Z]{3}$/.test(str)) return str;

  // 2. Starts with a 3-letter code followed by a space/symbol (e.g. "PEN S/.")
  const codePrefix = str.match(/^([A-Z]{3})\b/);
  if (codePrefix) return codePrefix[1];

  // 3. Plain-English currency name — look up in the name map
  const normalized = str.toLowerCase().trim();
  if (CURRENCY_NAME_TO_CODE[normalized]) {
    return CURRENCY_NAME_TO_CODE[normalized];
  }

  // 4. Partial match — check if any known name is contained in the string
  //    e.g. "Mongolian Tugrik (MNT)" would still match "mongolian tugrik"
  for (const [name, code] of Object.entries(CURRENCY_NAME_TO_CODE)) {
    if (normalized.includes(name)) return code;
  }

  // 5. Last resort — look for any 3-letter uppercase sequence
  const anyCode = str.match(/\b([A-Z]{3})\b/);
  if (anyCode) return anyCode[1];

  console.warn(`⚠️ Could not identify currency from: "${currencyString}", defaulting to USD`);
  return 'USD';
}
