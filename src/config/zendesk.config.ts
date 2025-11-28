/**
 * Zendesk Configuration
 * 
 * This file contains all Zendesk-related configuration for the MyToDoo app.
 * Update these values with your actual Zendesk account details.
 */

export const ZENDESK_CONFIG = {
  /**
   * Your Zendesk subdomain
   * Example: If your Zendesk URL is https://mytodoo.zendesk.com
   * then your subdomain is 'mytodoo'
   */
  subdomain: 'mytodo',
  
  /**
   * Help Center locale (language)
   * Common options: 'en-us', 'en-gb', 'en-au', etc.
   */
  locale: 'en-us',
  
  /**
   * Full Help Center URL
   * This is automatically constructed from subdomain and locale
   */
  get helpCenterUrl(): string {
    return `https://${this.subdomain}.zendesk.com/hc/${this.locale}`;
  },
  
  /**
   * Specific article URLs (optional)
   * You can add direct links to specific help articles here
   */
  articles: {
    gettingStarted: '/articles/how-to-get-started',
    payments: '/articles/payment-information',
    cancellations: '/articles/tasker-cancellations',
    // Add more article paths as needed
  },
  
  /**
   * Category URLs (optional)
   * Direct links to specific help categories
   */
  categories: {
    customer: '/categories/i-am-a-customer',
    tasker: '/categories/i-am-a-tasker',
    guidelines: '/categories/airtasker-guidelines',
    // Add more category paths as needed
  },
};

/**
 * Helper function to get a specific article URL
 */
export const getArticleUrl = (articleKey: keyof typeof ZENDESK_CONFIG.articles): string => {
  return `${ZENDESK_CONFIG.helpCenterUrl}${ZENDESK_CONFIG.articles[articleKey]}`;
};

/**
 * Helper function to get a specific category URL
 */
export const getCategoryUrl = (categoryKey: keyof typeof ZENDESK_CONFIG.categories): string => {
  return `${ZENDESK_CONFIG.helpCenterUrl}${ZENDESK_CONFIG.categories[categoryKey]}`;
};

/**
 * Search query URL
 */
export const getSearchUrl = (query: string): string => {
  return `${ZENDESK_CONFIG.helpCenterUrl}/search?query=${encodeURIComponent(query)}`;
};
