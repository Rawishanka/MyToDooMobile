// 🏷️ **CATEGORIES API INTEGRATION**
// This file handles category-related API operations

import { createApi } from "@/src/shared/utils/api";
import { isNetworkError } from "@/src/shared/utils/networkErrorHandler";
import API_CONFIG from "./config";

// 🔧 **API HELPER FUNCTION**
function getApi() {
  // API_CONFIG.BASE_URL already handles the env variable and fallback
  return createApi(API_CONFIG.BASE_URL);
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
    return getMockCategories();
  }

  const api = getApi();
  try {
    // Try to get categories from dedicated endpoint first
    try {
      const categoriesResponse = await api.get("/categories");

      if (categoriesResponse.data && categoriesResponse.data.data) {
        const dbCategories = categoriesResponse.data.data;

        // Convert database categories to our format
        const categories: Category[] = dbCategories.map((cat: any) => ({
          name: cat.name || cat.title || "Unknown Category",
          count: cat.count || 0,
        }));

        return {
          success: true,
          data: categories,
          total: categories.length,
        };
      }
    } catch (categoriesError) {}

    // Fallback: Extract categories from tasks if dedicated endpoint doesn't exist
    const response = await api.get("/tasks?limit=100&page=1");

    if (response.data && response.data.data) {
      const tasks = response.data.data;

      // Extract and count categories
      const categoryMap = new Map<string, number>();

      tasks.forEach((task: any) => {
        if (task.categories && Array.isArray(task.categories)) {
          task.categories.forEach((category: string) => {
            const categoryName = category.trim();
            if (categoryName) {
              categoryMap.set(
                categoryName,
                (categoryMap.get(categoryName) || 0) + 1
              );
            }
          });
        }
      });

      // Convert to array and sort by count (most popular first)
      const categories: Category[] = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return {
        success: true,
        data: categories,
        total: categories.length,
      };
    }

    // Fallback to default categories if no tasks found
    return getDefaultCategories();
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
    }

    // Check for network connection errors or timeouts - use mock service as fallback
    if (
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.message === "Network Error" ||
      error.message?.includes("timeout") ||
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND"
    ) {
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
    { name: "Appliance installation and repair", count: 0 },
    { name: "Auto Michanic and Electrician", count: 0 },
    { name: "Buliding Maintatance and Renovations", count: 0 },
    { name: "Business and Accounting", count: 0 },
    { name: "Carpentry", count: 0 },
    { name: "Cleaning and Organising", count: 0 },
    { name: "Removalist", count: 0 },
    { name: "Education and Tutoring", count: 0 },
    { name: "Electrical", count: 0 },
    { name: "Event Planning", count: 0 },
    { name: "Furniture repair and Flatpack Assemply", count: 0 },
    { name: "Gardening and Landscaping", count: 0 },
    { name: "Graphic Design", count: 0 },
    { name: "Handyman and Handywomen", count: 0 },
    { name: "Health & Fitness", count: 0 },
    { name: "IT & Tech", count: 0 },
    { name: "Legal Services", count: 0 },
    { name: "Marketting and Advertising", count: 0 },
    { name: "Music and Entertainment", count: 0 },
    { name: "Painting", count: 0 },
    { name: "Pet Care", count: 0 },
    { name: "Photography", count: 0 },
    { name: "Plumbing", count: 0 },
    { name: "Something Else", count: 0 },
    { name: "Web & App Development", count: 0 },
    { name: "Personal Assistance", count: 0 },
    { name: "Tours and Transport", count: 0 },
    { name: "Delivery", count: 0 },
    { name: "Realestate", count: 0 },
  ];

  return {
    success: true,
    data: mockCategories,
    total: mockCategories.length,
  };
}

/**
 * 🔄 Default Categories Fallback
 */
function getDefaultCategories(): CategoriesResponse {
  const defaultCategories: Category[] = [
    { name: "Appliance installation and repair", count: 0 },
    { name: "Auto Michanic and Electrician", count: 0 },
    { name: "Buliding Maintatance and Renovations", count: 0 },
    { name: "Business and Accounting", count: 0 },
    { name: "Carpentry", count: 0 },
    { name: "Cleaning and Organising", count: 0 },
    { name: "Removalist", count: 0 },
    { name: "Education and Tutoring", count: 0 },
    { name: "Electrical", count: 0 },
    { name: "Event Planning", count: 0 },
    { name: "Furniture repair and Flatpack Assemply", count: 0 },
    { name: "Gardening and Landscaping", count: 0 },
    { name: "Graphic Design", count: 0 },
    { name: "Handyman and Handywomen", count: 0 },
    { name: "Health & Fitness", count: 0 },
    { name: "IT & Tech", count: 0 },
    { name: "Legal Services", count: 0 },
    { name: "Marketting and Advertising", count: 0 },
    { name: "Music and Entertainment", count: 0 },
    { name: "Painting", count: 0 },
    { name: "Pet Care", count: 0 },
    { name: "Photography", count: 0 },
    { name: "Plumbing", count: 0 },
    { name: "Something Else", count: 0 },
    { name: "Web & App Development", count: 0 },
    { name: "Personal Assistance", count: 0 },
    { name: "Tours and Transport", count: 0 },
    { name: "Delivery", count: 0 },
    { name: "Realestate", count: 0 },
  ];

  return {
    success: true,
    data: defaultCategories,
    total: defaultCategories.length,
  };
}

// 🚀 **EXPORT ALL FUNCTIONS**
export const CategoriesAPI = {
  getAllCategories,
};

export default CategoriesAPI;
