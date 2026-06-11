/**
 * Currency Converter Module
 * Handles real-time currency conversion for restaurant pricing
 * Uses exchangerate-api.com (free tier: 1,500 requests/month)
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
    console.log(`✅ Exchange rates fetched for ${baseCurrency}`);
    return data.rates;
  } catch (err) {
    console.error('❌ Failed to fetch exchange rates:', err);
    // Fallback to hardcoded rates (last known values - update these periodically)
    return getFallbackRates(baseCurrency);
  }
}

/**
 * Fallback rates in case API fails
 * Last updated: June 2026
 * Update these periodically or when you notice significant changes
 */
function getFallbackRates(baseCurrency = 'USD') {
  const rates = {
    'USD': {
      'PEN': 3.75,
      'PYG': 6800,
      'GYD': 210,
      'CLP': 900,
      'MXN': 17.0,
      'USD': 1.0
    },
    'PEN': {
      'USD': 0.267,
      'PEN': 1.0,
      'PYG': 1813,
      'GYD': 56,
      'CLP': 240,
      'MXN': 4.53
    },
    'PYG': {
      'USD': 0.00015,
      'PEN': 0.00055,
      'PYG': 1.0,
      'GYD': 0.031,
      'CLP': 0.13,
      'MXN': 0.0025
    },
    'GYD': {
      'USD': 0.0048,
      'PEN': 0.018,
      'PYG': 32.4,
      'GYD': 1.0,
      'CLP': 4.3,
      'MXN': 0.081
    },
    'CLP': {
      'USD': 0.0011,
      'PEN': 0.0042,
      'PYG': 7.56,
      'GYD': 0.233,
      'CLP': 1.0,
      'MXN': 0.019
    },
    'MXN': {
      'USD': 0.059,
      'PEN': 0.221,
      'PYG': 400,
      'GYD': 12.3,
      'CLP': 53,
      'MXN': 1.0
    }
  };
  return rates[baseCurrency] || rates['USD'];
}

/**
 * Convert a price from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code (e.g., 'PEN', 'USD')
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
async function convertCurrency(amount, fromCurrency, toCurrency = 'USD') {
  if (!amount || amount <= 0) return 0;
  if (fromCurrency === toCurrency) return amount;

  try {
    const rates = await getExchangeRates(fromCurrency);
    if (!rates[toCurrency]) {
      console.warn(`⚠️ No rate found for ${fromCurrency} → ${toCurrency}`);
      return amount;
    }
    const convertedAmount = amount * rates[toCurrency];
    return convertedAmount;
  } catch (err) {
    console.error(`❌ Conversion error: ${err}`);
    return amount;
  }
}

/**
 * Get the native currency for a country
 */
function getCountryBaseCurrency(country) {
  const currencyMap = {
    'Peru': 'PEN',
    'Paraguay': 'PYG',
    'Guyana': 'GYD',
    'Ecuador': 'USD', // Ecuador officially uses USD
    'Chile': 'CLP',
    'Mexico': 'MXN'
  };
  return currencyMap[country] || 'USD';
}

/**
 * Get currency symbol for display
 */
function getCurrencySymbol(currencyCode) {
  const symbols = {
    'USD': '$',
    'PEN': 'S/.',
    'PYG': '₲',
    'GYD': 'G$',
    'CLP': '$',
    'MXN': '$',
    'EUR': '€'
  };
  return symbols[currencyCode] || currencyCode;
}

/**
 * Extract currency code from currency string
 * e.g., 'PEN S/.' → 'PEN', 'USD $' → 'USD'
 */
function extractCurrencyCode(currencyString) {
  const match = String(currencyString).match(/^[A-Z]{3}/);
  return match ? match[0] : 'USD';
}
