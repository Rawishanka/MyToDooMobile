/**
 * Help & Support API
 * 
 * Public API endpoints for fetching help articles and FAQs
 * Articles are managed through admin panel and displayed in the app
 */

import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

// 🔧 **API HELPER FUNCTION**
function getApi() {
  // API_CONFIG.BASE_URL already handles the env variable and fallback
  return createApi(API_CONFIG.BASE_URL);
}

// 🏷️ **HELP & SUPPORT TYPES**

export interface HelpArticle {
  _id: string;
  question: string;
  answer: string;
  category: string;
  role: 'all' | 'poster' | 'tasker';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface HelpSupportResponse {
  status: string;
  data: HelpArticle[];
}

/**
 * 📖 Get Help Articles (Public)
 * Endpoint: GET /api/help-support
 * Auth: No (Public endpoint)
 * 
 * Retrieve active help articles for public view
 * 
 * @param role - Filter by user role (poster, tasker, or undefined for all)
 * @param category - Filter by category (optional)
 * @returns Promise<HelpSupportResponse>
 */
export async function getHelpArticles(params?: {
  role?: 'poster' | 'tasker';
  category?: string;
}): Promise<HelpSupportResponse> {
  const api = getApi();
  
  try {
    console.log("📖 Fetching help articles with params:", params);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.role) {
      queryParams.append('role', params.role);
    }
    if (params?.category) {
      queryParams.append('category', params.category);
    }
    
    const queryString = queryParams.toString();
    const url = `/help-support${queryString ? `?${queryString}` : ''}`;
    
    console.log("🌐 API URL:", url);
    
    const response = await api.get(url);
    
    console.log("✅ Help articles fetched successfully:", {
      total: response.data?.data?.length || 0,
      categories: [...new Set(response.data?.data?.map((article: HelpArticle) => article.category) || [])]
    });
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch help articles:", error);
    
    // Return empty data on error instead of throwing
    // This allows the UI to gracefully handle errors
    return {
      status: 'error',
      data: []
    };
  }
}

/**
 * 🗂️ Group Help Articles by Category
 * Helper function to organize articles into categories
 * 
 * @param articles - Array of help articles
 * @returns Object with categories as keys and articles as values
 */
export function groupArticlesByCategory(articles: HelpArticle[]): Record<string, HelpArticle[]> {
  const grouped: Record<string, HelpArticle[]> = {};
  
  articles.forEach(article => {
    if (!grouped[article.category]) {
      grouped[article.category] = [];
    }
    grouped[article.category].push(article);
  });
  
  // Sort articles within each category by order
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => a.order - b.order);
  });
  
  return grouped;
}

/**
 * 🔍 Search Help Articles
 * Helper function to filter articles by search query
 * 
 * @param articles - Array of help articles
 * @param query - Search query string
 * @returns Filtered array of articles
 */
export function searchHelpArticles(articles: HelpArticle[], query: string): HelpArticle[] {
  if (!query || query.trim() === '') {
    return articles;
  }
  
  const searchLower = query.toLowerCase().trim();
  
  return articles.filter(article => 
    article.question.toLowerCase().includes(searchLower) ||
    article.answer.toLowerCase().includes(searchLower) ||
    article.category.toLowerCase().includes(searchLower)
  );
}

/**
 * 📊 Get Category Statistics
 * Helper function to get article count per category
 * 
 * @param articles - Array of help articles
 * @returns Array of categories with article counts
 */
export function getCategoryStats(articles: HelpArticle[]): Array<{ category: string; count: number }> {
  const grouped = groupArticlesByCategory(articles);
  
  return Object.entries(grouped)
    .map(([category, articles]) => ({
      category,
      count: articles.length
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

// ==========================================
// 📧 SUPPORT REQUEST API FUNCTIONS
// ==========================================

// 🏷️ **SUPPORT REQUEST TYPES**

export interface SupportCategoriesResponse {
  success: boolean;
  categories: string[];
}

export interface SupportContactRequest {
  fullName: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

export interface SupportContactResponse {
  success: boolean;
  message: string;
  supportToken: string;
  requestId: string;
}

export interface SupportStatusData {
  supportToken: string;
  category: string;
  subject: string;
  message?: string;
  fullName?: string;
  email?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  resolvedAt?: string;
  adminResponse?: string;
  responseAt?: string;
}

export interface SupportStatusResponse {
  success: boolean;
  data: SupportStatusData;
}

/**
 * 🗂️ Get Support Categories
 * Endpoint: GET /api/support/categories
 * Auth: No (Public endpoint)
 * 
 * Retrieve available support categories
 * 
 * @returns Promise<SupportCategoriesResponse>
 */
export async function getSupportCategories(): Promise<SupportCategoriesResponse> {
  const api = getApi();
  
  try {
    console.log("🗂️ Fetching support categories...");
    
    const response = await api.get('/support/categories');
    
    console.log("✅ Support categories fetched:", response.data.categories);
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch support categories:", error);
    // Return default categories on error
    return {
      success: false,
      categories: [
        'General Inquiry',
        'Task Related Issues',
        'Payment & Billing',
        'Account Issues',
        'Technical Support',
        'Report a Problem',
        'Other'
      ]
    };
  }
}

/**
 * 📧 Submit Support Request
 * Endpoint: POST /api/support/contact
 * Auth: Optional (works for both authenticated and guest users)
 * 
 * Submit a support request (Send us a Message)
 * 
 * @param data - Support contact request data
 * @returns Promise<SupportContactResponse>
 */
export async function submitSupportRequest(data: SupportContactRequest): Promise<SupportContactResponse> {
  const api = getApi();
  
  try {
    console.log("📧 Submitting support request:", {
      fullName: data.fullName,
      email: data.email,
      category: data.category,
      subject: data.subject,
      messageLength: data.message.length
    });
    
    const response = await api.post('/support/contact', data);
    
    console.log("✅ Support request submitted successfully:", {
      supportToken: response.data.supportToken,
      requestId: response.data.requestId
    });
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to submit support request:", error);
    throw error;
  }
}

/**
 * 🔍 Get Support Request Status
 * Endpoint: GET /api/support/status/{token}
 * Auth: No (Public endpoint)
 * 
 * Check support request status by token
 * 
 * @param token - Support request token (e.g., SUP-M2XYZ-A1B2C3D4)
 * @returns Promise<SupportStatusResponse>
 */
export async function getSupportStatus(token: string): Promise<SupportStatusResponse> {
  const api = getApi();
  
  try {
    console.log("🔍 Checking support request status for token:", token);
    
    const response = await api.get(`/support/status/${token}`);
    
    console.log("✅ Support status retrieved:", {
      token: response.data.data?.supportToken,
      status: response.data.data?.status
    });
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to get support status:", error);
    throw error;
  }
}
