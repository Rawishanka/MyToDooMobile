// 🏷️ **CATEGORIES API INTEGRATION**
// This file handles category-related API operations

import { createApi } from "@/utils/api";
import API_CONFIG from "./config";

// 🔧 **API HELPER FUNCTION**
function getApi() {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.1.3:5001/api";
  return createApi(baseUrl);
}

// 🏷️ **CATEGORY TYPES**
export interface Category {
  name: string;
  count: number;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  total: number;
}

/**
 * 🏷️ Get All Categories
 * Fetches categories from the dedicated categories collection in the database
 */
export async function getAllCategories(): Promise<CategoriesResponse> {
  // Check if we should use mock API only
  if (API_CONFIG.USE_MOCK_ONLY) {
    console.log("🎭 Using Mock Categories (development mode)");
    return getMockCategories();
  }

  const api = getApi();
  try {
    console.log("🏷️ Fetching categories from database...");
    
    // Try to get categories from dedicated endpoint first
    try {
      const categoriesResponse = await api.get('/categories');
      console.log("✅ Categories from /api/categories:", categoriesResponse.data);
      
      if (categoriesResponse.data && categoriesResponse.data.data) {
        const dbCategories = categoriesResponse.data.data;
        
        // Convert database categories to our format
        const categories: Category[] = dbCategories.map((cat: any) => ({
          name: cat.name || cat.title || 'Unknown Category',
          count: cat.count || 0
        }));

        console.log("✅ Database categories loaded:", {
          totalCategories: categories.length,
          categories: categories.map(c => `${c.name} (${c.count})`)
        });

        return {
          success: true,
          data: categories,
          total: categories.length
        };
      }
    } catch (categoriesError) {
      console.log("⚠️ /api/categories endpoint not available, trying to extract from tasks...");
    }
    
    // Fallback: Extract categories from tasks if dedicated endpoint doesn't exist
    const response = await api.get('/tasks?limit=100&page=1');
    
    if (response.data && response.data.data) {
      const tasks = response.data.data;
      
      // Extract and count categories
      const categoryMap = new Map<string, number>();
      
      tasks.forEach((task: any) => {
        if (task.categories && Array.isArray(task.categories)) {
          task.categories.forEach((category: string) => {
            const categoryName = category.trim();
            if (categoryName) {
              categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
            }
          });
        }
      });

      // Convert to array and sort by count (most popular first)
      const categories: Category[] = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      console.log("✅ Categories extracted from tasks:", {
        totalCategories: categories.length,
        categories: categories.map(c => `${c.name} (${c.count})`)
      });

      return {
        success: true,
        data: categories,
        total: categories.length
      };
    }

    // Fallback to default categories if no tasks found
    return getDefaultCategories();
    
  } catch (error: any) {
    console.error("❌ Get categories failed:", error);
    
    // Check for network connection errors - use mock service as fallback
    if (error.code === 'ERR_NETWORK' || 
        error.message === 'Network Error' || 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND') {
      console.warn("🎭 Network failed - Using Mock Categories");
      return getMockCategories();
    }
    
    // Return default categories on other errors
    return getDefaultCategories();
  }
}

/**
 * 🎭 Mock Categories for Development
 */
function getMockCategories(): CategoriesResponse {
  const mockCategories: Category[] = [
    { name: 'Home & Garden', count: 15 },
    { name: 'Cleaning', count: 12 },
    { name: 'Technology', count: 8 },
    { name: 'Design & Creative', count: 6 },
    { name: 'Business', count: 5 },
    { name: 'Admin & Data', count: 4 },
    { name: 'Writing & Translation', count: 3 },
    { name: 'Delivery', count: 3 },
    { name: 'Tutoring', count: 2 }
  ];

  return {
    success: true,
    data: mockCategories,
    total: mockCategories.length
  };
}

/**
 * 🔄 Default Categories Fallback
 */
function getDefaultCategories(): CategoriesResponse {
  const defaultCategories: Category[] = [
    { name: 'Home & Garden', count: 0 },
    { name: 'Design & Creative', count: 0 },
    { name: 'Technology', count: 0 },
    { name: 'Cleaning', count: 0 },
    { name: 'Admin & Data', count: 0 },
    { name: 'Business', count: 0 },
    { name: 'Writing & Translation', count: 0 }
  ];

  return {
    success: true,
    data: defaultCategories,
    total: defaultCategories.length
  };
}

// 🚀 **EXPORT ALL FUNCTIONS**
export const CategoriesAPI = {
  getAllCategories,
};

export default CategoriesAPI;