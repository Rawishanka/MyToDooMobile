/**
 * Currency utilities for geo-based currency detection and formatting
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
}

/**
 * Get currency symbol by currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  // Map common currency codes to symbols
  const currencySymbols: Record<string, string> = {
    'AUD': '$',
    'LKR': 'Rs',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'NZD': '$',
    'CAD': '$',
    'SGD': '$',
    'MYR': 'RM',
    'IDR': 'Rp',
    'THB': '฿',
    'PHP': '₱',
    'VND': '₫',
    'INR': '₹',
    'PKR': '₨',
    'BDT': '৳',
    'JPY': '¥',
    'CNY': '¥',
    'KRW': '₩',
    'HKD': '$',
    'MXN': '$',
    'BRL': 'R$',
  };
  
  return currencySymbols[currencyCode] || '$';
};
const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  // Asia-Pacific
  'Australia': { code: 'AUD', symbol: '$' },
  'New Zealand': { code: 'NZD', symbol: '$' },
  'Singapore': { code: 'SGD', symbol: '$' },
  'Malaysia': { code: 'MYR', symbol: 'RM' },
  'Indonesia': { code: 'IDR', symbol: 'Rp' },
  'Thailand': { code: 'THB', symbol: '฿' },
  'Philippines': { code: 'PHP', symbol: '₱' },
  'Vietnam': { code: 'VND', symbol: '₫' },
  'India': { code: 'INR', symbol: '₹' },
  'Sri Lanka': { code: 'LKR', symbol: 'Rs' },
  'Pakistan': { code: 'PKR', symbol: '₨' },
  'Bangladesh': { code: 'BDT', symbol: '৳' },
  'Japan': { code: 'JPY', symbol: '¥' },
  'China': { code: 'CNY', symbol: '¥' },
  'South Korea': { code: 'KRW', symbol: '₩' },
  'Hong Kong': { code: 'HKD', symbol: '$' },
  
  // Americas
  'United States': { code: 'USD', symbol: '$' },
  'USA': { code: 'USD', symbol: '$' },
  'Canada': { code: 'CAD', symbol: '$' },
  'Mexico': { code: 'MXN', symbol: '$' },
  'Brazil': { code: 'BRL', symbol: 'R$' },
  'Argentina': { code: 'ARS', symbol: '$' },
  'Chile': { code: 'CLP', symbol: '$' },
  'Colombia': { code: 'COP', symbol: '$' },
  
  // Europe
  'United Kingdom': { code: 'GBP', symbol: '£' },
  'UK': { code: 'GBP', symbol: '£' },
  'Germany': { code: 'EUR', symbol: '€' },
  'France': { code: 'EUR', symbol: '€' },
  'Italy': { code: 'EUR', symbol: '€' },
  'Spain': { code: 'EUR', symbol: '€' },
  'Netherlands': { code: 'EUR', symbol: '€' },
  'Belgium': { code: 'EUR', symbol: '€' },
  'Austria': { code: 'EUR', symbol: '€' },
  'Switzerland': { code: 'CHF', symbol: 'Fr' },
  'Sweden': { code: 'SEK', symbol: 'kr' },
  'Norway': { code: 'NOK', symbol: 'kr' },
  'Denmark': { code: 'DKK', symbol: 'kr' },
  'Poland': { code: 'PLN', symbol: 'zł' },
  'Russia': { code: 'RUB', symbol: '₽' },
  
  // Middle East
  'United Arab Emirates': { code: 'AED', symbol: 'د.إ' },
  'UAE': { code: 'AED', symbol: 'د.إ' },
  'Saudi Arabia': { code: 'SAR', symbol: 'ر.س' },
  'Kuwait': { code: 'KWD', symbol: 'د.ك' },
  'Qatar': { code: 'QAR', symbol: 'ر.ق' },
  'Israel': { code: 'ILS', symbol: '₪' },
  'Turkey': { code: 'TRY', symbol: '₺' },
  
  // Africa
  'South Africa': { code: 'ZAR', symbol: 'R' },
  'Nigeria': { code: 'NGN', symbol: '₦' },
  'Kenya': { code: 'KES', symbol: 'Sh' },
  'Egypt': { code: 'EGP', symbol: '£' },
};

/**
 * Default currency to use - AUSTRALIA-ONLY APP
 * Always use AUD (Australian Dollars) as the default currency
 */
const DEFAULT_CURRENCY: CurrencyInfo = { code: 'AUD', symbol: '$' };

/**
 * Extract country name from location address string
 * Address format examples:
 * - "Australind, Western Australia, Australia"
 * - "Colombo, Sri Lanka"
 * - "New York, NY, USA"
 */
export const extractCountryFromAddress = (address?: string): string | null => {
  if (!address) return null;
  
  // Split by comma and get the last part (usually the country)
  const parts = address.split(',').map(part => part.trim());
  if (parts.length === 0) return null;
  
  const lastPart = parts[parts.length - 1];
  return lastPart;
};

/**
 * Get currency information based on task location
 * @param location - Task location object with address field
 * @returns Currency info (code and symbol)
 */
export const getCurrencyFromLocation = (location?: { address?: string }): CurrencyInfo => {
  if (!location?.address) {
    return DEFAULT_CURRENCY;
  }
  
  const country = extractCountryFromAddress(location.address);
  if (!country) {
    return DEFAULT_CURRENCY;
  }
  
  // Try exact match first
  if (COUNTRY_CURRENCY_MAP[country]) {
    return COUNTRY_CURRENCY_MAP[country];
  }
  
  // Try case-insensitive partial match
  const countryLower = country.toLowerCase();
  for (const [key, value] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (key.toLowerCase().includes(countryLower) || countryLower.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Return default if no match found
  return DEFAULT_CURRENCY;
};

/**
 * Format amount with currency symbol and thousand separators
 * @param amount - Numeric amount
 * @param currencyInfo - Currency information
 * @returns Formatted string (e.g., "$1,000", "₹5,500", "Rs 7,500")
 */
export const formatCurrency = (amount: number, currencyInfo: CurrencyInfo): string => {
  // Round amount to 2 decimal places and format with thousand separators
  const roundedAmount = Math.round(amount * 100) / 100;
  const formattedAmount = roundedAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  // For currencies with symbol before amount
  const symbolBeforeAmount = ['$', '£', '€', '¥', '₹', 'R$', 'Fr', '₽', '₪', '₺', 'R', '₦'];
  
  if (symbolBeforeAmount.includes(currencyInfo.symbol)) {
    return `${currencyInfo.symbol}${formattedAmount}`;
  }
  
  // For currencies with symbol after amount (or space separated)
  return `${currencyInfo.symbol} ${formattedAmount}`;
};

/**
 * Get currency based on user's current location for auto geo-location
 * This uses the detected country from useLocationCountry hook
 * @param userCountryInfo - Country info from useLocationCountry hook
 * @returns Currency info based on user's current location
 */
export const getCurrencyFromUserLocation = (userCountryInfo: { currency: string }): CurrencyInfo => {
  const symbol = getCurrencySymbol(userCountryInfo.currency);
  return {
    code: userCountryInfo.currency,
    symbol: symbol
  };
};

/**
 * Format amount with currency based on user's current location (auto geo-location)
 * @param amount - Numeric amount
 * @param userCountryInfo - Country info from useLocationCountry hook
 * @returns Formatted string with user's local currency
 */
export const formatCurrencyForUserLocation = (amount: number, userCountryInfo: { currency: string }): string => {
  const currencyInfo = getCurrencyFromUserLocation(userCountryInfo);
  return formatCurrency(amount, currencyInfo);
};

/**
 * Format number with thousand separators
 * @param amount - Numeric amount
 * @param options - Formatting options
 * @returns Formatted string with commas (e.g., "1,000", "15,000")
 */
export const formatNumber = (
  amount: number, 
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    forceDecimals?: boolean;
  } = {}
): string => {
  // Round amount to ensure precision
  const roundedAmount = Math.round(amount * 100) / 100;
  
  // If forceDecimals is true, always show 2 decimal places
  const minDecimals = options.forceDecimals ? 2 : (options.minimumFractionDigits ?? 0);
  const maxDecimals = options.maximumFractionDigits ?? 2;
  
  return roundedAmount.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
};

/**
 * Minimum budget amounts for different currencies
 * Equivalent to approximately $20 USD
 */
const MINIMUM_BUDGET_MAP: Record<string, number> = {
  'USD': 20,
  'AUD': 20,      // ~$20 USD
  'NZD': 35,      // ~$20 USD
  'LKR': 6000,    // ~$20 USD (1 USD ≈ 300 LKR)
  'SGD': 27,      // ~$20 USD
  'MYR': 90,      // ~$20 USD
  'IDR': 315000,  // ~$20 USD
  'THB': 700,     // ~$20 USD
  'PHP': 1100,    // ~$20 USD
  'VND': 500000,  // ~$20 USD
  'INR': 1650,    // ~$20 USD
  'PKR': 5600,    // ~$20 USD
  'BDT': 2200,    // ~$20 USD
  'JPY': 3000,    // ~$20 USD
  'CNY': 145,     // ~$20 USD
  'KRW': 27000,   // ~$20 USD
  'HKD': 155,     // ~$20 USD
  'CAD': 28,      // ~$20 USD
  'MXN': 340,     // ~$20 USD
  'BRL': 100,     // ~$20 USD
  'GBP': 16,      // ~$20 USD
  'EUR': 19,      // ~$20 USD
  'CHF': 18,      // ~$20 USD
  'SEK': 215,     // ~$20 USD
  'NOK': 215,     // ~$20 USD
  'DKK': 140,     // ~$20 USD
  'ZAR': 370,     // ~$20 USD
};

/**
 * Get minimum budget for a currency
 * @param currencyCode - Currency code (e.g., 'USD', 'LKR', 'AUD')
 * @returns Minimum budget amount
 */
export const getMinimumBudget = (currencyCode: string): number => {
  return MINIMUM_BUDGET_MAP[currencyCode] || 20;
};

/**
 * Get default budget amount (same as minimum)
 * @param currencyCode - Currency code
 * @returns Default budget amount
 */
export const getDefaultBudget = (currencyCode: string): number => {
  return getMinimumBudget(currencyCode);
};

/**
 * Maximum price range amounts for different currencies
 * Used for filter price range sliders
 */
const MAX_PRICE_MAP: Record<string, number> = {
  'USD': 10000,
  'AUD': 10000,    // $10,000 AUD
  'NZD': 15000,    // $15,000 NZD
  'LKR': 1000000,  // Rs 1,000,000 LKR
  'SGD': 13500,    // $13,500 SGD
  'MYR': 45000,    // RM 45,000 MYR
  'IDR': 157500000, // Rp 157,500,000 IDR
  'THB': 350000,   // ฿350,000 THB
  'PHP': 550000,   // ₱550,000 PHP
  'VND': 250000000, // ₫250,000,000 VND
  'INR': 825000,   // ₹825,000 INR
  'PKR': 2800000,  // ₨2,800,000 PKR
  'BDT': 1100000,  // ৳1,100,000 BDT
  'JPY': 1500000,  // ¥1,500,000 JPY
  'CNY': 72500,    // ¥72,500 CNY
  'KRW': 13500000, // ₩13,500,000 KRW
  'HKD': 77500,    // $77,500 HKD
  'CAD': 14000,    // $14,000 CAD
  'MXN': 170000,   // $170,000 MXN
  'BRL': 50000,    // R$50,000 BRL
  'GBP': 8000,     // £8,000 GBP
  'EUR': 9500,     // €9,500 EUR
  'CHF': 9000,     // Fr 9,000 CHF
  'SEK': 107500,   // 107,500 kr SEK
  'NOK': 107500,   // 107,500 kr NOK
  'DKK': 70000,    // 70,000 kr DKK
  'ZAR': 185000,   // R185,000 ZAR
};

/**
 * Get maximum price for filter range based on currency
 * @param currencyCode - Currency code (e.g., 'USD', 'LKR', 'AUD')
 * @returns Maximum price amount for the currency
 */
export const getMaxPriceForCurrency = (currencyCode: string): number => {
  return MAX_PRICE_MAP[currencyCode] || 10000;
};
