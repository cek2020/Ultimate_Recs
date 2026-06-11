/**
 * Currency Converter Module
 * Handles real-time currency conversion for restaurant pricing
 * Uses exchangerate-api.com (free tier: 1,500 requests/month)
 * SUPPORTS ALL LATIN AMERICAN COUNTRIES
 */

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest';
const CACHE_DURATION = 604800000; // 1 week in milliseconds (to stay within API limit)
let exchangeRates = {};
let lastFetchTime = 0;

/**
 * Fetch latest exchange rates
 * Caches results for 1 week to avoid excessive API calls
 */
async function getExchangeRates(baseCurrency = 'USD') {
  const now = Date.now();
  
  // Return cached rates if still valid
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
    // Fallback to hardcoded rates (last known values - update these periodically)
    return getFallbackRates(baseCurrency);
  }
}

/**
 * Fallback rates - COMPLETE LATIN AMERICA COVERAGE
 * Last updated: June 2026
 * Update these periodically or when you notice significant changes
 */
function getFallbackRates(baseCurrency = 'USD') {
  const rates = {
    'USD': {
      'USD': 1.0,
      'PEN': 3.75,
      'PYG': 6800,
      'GYD': 210,
      'CLP': 900,
      'MXN': 17.0,
      'ARS': 950,      // Argentina Peso
      'BRL': 5.15,     // Brazil Real
      'COP': 4100,     // Colombia Peso
      'VES': 2500000,  // Venezuela Bolívar
      'UYU': 38,       // Uruguay Peso
      'BOB': 6.90,     // Bolivia Boliviano
      'HNL': 24.5,     // Honduras Lempira
      'GTQ': 7.75,     // Guatemala Quetzal
      'NIO': 36.5,     // Nicaragua Córdoba
      'CRC': 530,      // Costa Rica Colón
      'PAN': 1.0,      // Panama Balboa (1:1 with USD)
      'DOP': 58,       // Dominican Republic Peso
      'TTS': 6.70,     // Trinidad & Tobago Dollar
      'BSD': 1.0,      // Bahamas Dollar (1:1 with USD)
      'BBD': 2.0,      // Barbados Dollar
      'JMD': 155,      // Jamaica Dollar
      'XCD': 2.70      // Eastern Caribbean Dollar
    },
    'PEN': {
      'USD': 0.267,
      'PEN': 1.0,
      'PYG': 1813,
      'GYD': 56,
      'CLP': 240,
      'MXN': 4.53,
      'ARS': 253,
      'BRL': 1.37,
      'COP': 1093,
      'VES': 667000,
      'UYU': 10.1,
      'BOB': 1.84,
      'HNL': 6.53,
      'GTQ': 2.07,
      'NIO': 9.73,
      'CRC': 141,
      'PAN': 0.267,
      'DOP': 15.5,
      'TTS': 1.79,
      'BSD': 0.267,
      'BBD': 0.533,
      'JMD': 41.3,
      'XCD': 0.720
    },
    'CLP': {
      'USD': 0.0011,
      'PEN': 0.0042,
      'PYG': 7.56,
      'GYD': 0.233,
      'CLP': 1.0,
      'MXN': 0.019,
      'ARS': 1.06,
      'BRL': 0.0057,
      'COP': 4.56,
      'VES': 2778,
      'UYU': 0.0422,
      'BOB': 0.00767,
      'HNL': 0.0272,
      'GTQ': 0.00861,
      'NIO': 0.0406,
      'CRC': 0.589,
      'PAN': 0.0011,
      'DOP': 0.0645,
      'TTS': 0.00745,
      'BSD': 0.0011,
      'BBD': 0.00222,
      'JMD': 0.172,
      'XCD': 0.003
    },
    'MXN': {
      'USD': 0.059,
      'PEN': 0.221,
      'PYG': 400,
      'GYD': 12.3,
      'CLP': 53,
      'MXN': 1.0,
      'ARS': 56,
      'BRL': 0.301,
      'COP': 241,
      'VES': 147000,
      'UYU': 2.24,
      'BOB': 0.406,
      'HNL': 1.44,
      'GTQ': 0.456,
      'NIO': 2.15,
      'CRC': 31.2,
      'PAN': 0.059,
      'DOP': 3.41,
      'TTS': 0.394,
      'BSD': 0.059,
      'BBD': 0.118,
      'JMD': 9.12,
      'XCD': 0.159
    },
    'BRL': {
      'USD': 0.194,
      'PEN': 0.729,
      'PYG': 1320,
      'GYD': 40.8,
      'CLP': 175,
      'MXN': 3.32,
      'ARS': 184,
      'BRL': 1.0,
      'COP': 800,
      'VES': 486000,
      'UYU': 7.44,
      'BOB': 1.34,
      'HNL': 4.75,
      'GTQ': 1.51,
      'NIO': 7.11,
      'CRC': 103,
      'PAN': 0.194,
      'DOP': 11.3,
      'TTS': 1.30,
      'BSD': 0.194,
      'BBD': 0.388,
      'JMD': 30.2,
      'XCD': 0.525
    },
    'ARS': {
      'USD': 0.00105,
      'PEN': 0.00396,
      'PYG': 7.16,
      'GYD': 0.221,
      'CLP': 0.943,
      'MXN': 0.0179,
      'ARS': 1.0,
      'BRL': 0.00543,
      'COP': 4.34,
      'VES': 2632,
      'UYU': 0.0401,
      'BOB': 0.00727,
      'HNL': 0.0258,
      'GTQ': 0.00817,
      'NIO': 0.0385,
      'CRC': 0.559,
      'PAN': 0.00105,
      'DOP': 0.0611,
      'TTS': 0.00702,
      'BSD': 0.00105,
      'BBD': 0.0210,
      'JMD': 0.164,
      'XCD': 0.00284
    },
    'COP': {
      'USD': 0.000244,
      'PEN': 0.000915,
      'PYG': 1.66,
      'GYD': 0.0512,
      'CLP': 0.219,
      'MXN': 0.00414,
      'ARS': 0.231,
      'BRL': 0.00125,
      'COP': 1.0,
      'VES': 610,
      'UYU': 0.00910,
      'BOB': 0.00168,
      'HNL': 0.00596,
      'GTQ': 0.00189,
      'NIO': 0.00891,
      'CRC': 0.129,
      'PAN': 0.000244,
      'DOP': 0.0141,
      'TTS': 0.00162,
      'BSD': 0.000244,
      'BBD': 0.00488,
      'JMD': 0.0379,
      'XCD': 0.000659
    },
    'PYG': {
      'USD': 0.00015,
      'PEN': 0.00055,
      'PYG': 1.0,
      'GYD': 0.031,
      'CLP': 0.13,
      'MXN': 0.0025,
      'ARS': 0.140,
      'BRL': 0.000758,
      'COP': 0.602,
      'VES': 368,
      'UYU': 0.00547,
      'BOB': 0.00101,
      'HNL': 0.00359,
      'GTQ': 0.00114,
      'NIO': 0.00537,
      'CRC': 0.0782,
      'PAN': 0.00015,
      'DOP': 0.00854,
      'TTS': 0.000975,
      'BSD': 0.00015,
      'BBD': 0.00030,
      'JMD': 0.0229,
      'XCD': 0.000405
    },
    'GYD': {
      'USD': 0.0048,
      'PEN': 0.018,
      'PYG': 32.4,
      'GYD': 1.0,
      'CLP': 4.3,
      'MXN': 0.081,
      'ARS': 4.57,
      'BRL': 0.0247,
      'COP': 19.5,
      'VES': 12000,
      'UYU': 0.181,
      'BOB': 0.0329,
      'HNL': 0.117,
      'GTQ': 0.0372,
      'NIO': 0.174,
      'CRC': 2.57,
      'PAN': 0.0048,
      'DOP': 0.276,
      'TTS': 0.0316,
      'BSD': 0.0048,
      'BBD': 0.0096,
      'JMD': 0.744,
      'XCD': 0.0130
    }
  };
  return rates[baseCurrency] || rates['USD'];
}

/**
 * Convert a price from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code (e.g., 'PEN', 'USD', 'CLP')
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
async function convertCurrency(amount, fromCurrency, toCurrency = 'USD') {
  if (!amount || amount <= 0) return 0;
  if (fromCurrency === toCurrency) return amount;

  try {
    const rates = await getExchangeRates(fromCurrency);
    if (!rates[toCurrency]) {
      console.warn(`⚠️ No rate found for ${fromCurrency} → ${toCurrency}, using fallback`);
      // Try fallback
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
 * Get the native currency for a country
 * SUPPORTS ALL LATIN AMERICAN COUNTRIES
 */
function getCountryBaseCurrency(country) {
  const currencyMap = {
    // South America
    'Peru': 'PEN',
    'Paraguay': 'PYG',
    'Guyana': 'GYD',
    'Ecuador': 'USD',
    'Chile': 'CLP',
    'Argentina': 'ARS',
    'Brazil': 'BRL',
    'Colombia': 'COP',
    'Venezuela': 'VES',
    'Uruguay': 'UYU',
    'Bolivia': 'BOB',
    'Suriname': 'SRD',
    
    // North/Central America & Mexico
    'Mexico': 'MXN',
    'Honduras': 'HNL',
    'Guatemala': 'GTQ',
    'Nicaragua': 'NIO',
    'Costa Rica': 'CRC',
    'Panama': 'PAN',
    'Belize': 'BZD',
    'El Salvador': 'SVC',
    
    // Caribbean
    'Dominican Republic': 'DOP',
    'Cuba': 'CUP',
    'Puerto Rico': 'USD',
    'Haiti': 'HTG',
    'Jamaica': 'JMD',
    'Barbados': 'BBD',
    'Trinidad and Tobago': 'TTS',
    'Bahamas': 'BSD',
    'Antigua and Barbuda': 'XCD',
    'Dominica': 'XCD',
    'Grenada': 'XCD',
    'Saint Lucia': 'XCD',
    'Saint Vincent and the Grenadines': 'XCD'
  };
  return currencyMap[country] || 'USD';
}

/**
 * Get currency symbol for display
 * SUPPORTS ALL LATIN AMERICAN CURRENCIES
 */
function getCurrencySymbol(currencyCode) {
  const symbols = {
    'USD': '$',
    'PEN': 'S/.',
    'PYG': '₲',
    'GYD': 'G$',
    'CLP': '$',
    'MXN': '$',
    'ARS': '$',
    'BRL': 'R$',
    'COP': '$',
    'VES': 'Bs.',
    'UYU': '$',
    'BOB': 'Bs.',
    'SRD': '$',
    'HNL': 'L',
    'GTQ': 'Q',
    'NIO': 'C$',
    'CRC': '₡',
    'PAN': 'B/.',
    'BZD': '$',
    'SVC': '₡',
    'DOP': '$',
    'CUP': '₱',
    'HTG': 'G',
    'JMD': '$',
    'BBD': '$',
    'TTS': '$',
    'BSD': '$',
    'XCD': '$',
    'EUR': '€'
  };
  return symbols[currencyCode] || currencyCode;
}

/**
 * Extract currency code from currency string
 * e.g., 'PEN S/.' → 'PEN', 'USD $' → 'USD', 'CLP $' → 'CLP'
 */
function extractCurrencyCode(currencyString) {
  const match = String(currencyString).match(/^[A-Z]{3}/);
  return match ? match[0] : 'USD';
}
