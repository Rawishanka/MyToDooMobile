/**
 * Currency utilities for geo-based currency detection and formatting
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
}

/**
 * Map of countries to their currency information
 */
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
 * Default currency to use when country cannot be determined
 */
const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', symbol: '$' };

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
 * Format amount with currency symbol
 * @param amount - Numeric amount
 * @param currencyInfo - Currency information
 * @returns Formatted string (e.g., "$100", "₹500", "Rs 750")
 */
export const formatCurrency = (amount: number, currencyInfo: CurrencyInfo): string => {
  // For currencies with symbol before amount
  const symbolBeforeAmount = ['$', '£', '€', '¥', '₹', 'R$', 'Fr', '₽', '₪', '₺', 'R', '₦'];
  
  if (symbolBeforeAmount.includes(currencyInfo.symbol)) {
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }
  
  // For currencies with symbol after amount (or space separated)
  return `${currencyInfo.symbol} ${amount.toFixed(2)}`;
};
