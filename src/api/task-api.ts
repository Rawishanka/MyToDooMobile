// 🎯 **COMPREHENSIVE TASK API INTEGRATION**
// This file contains ALL task-related API endpoints from your API documentation

import { createApi } from "@/src/shared/utils/api";
import { handleAuthenticationError } from '@/src/shared/utils/auth-utils';
import { autoLoginForDevelopment } from '@/src/shared/utils/dev-auth';
import { isNetworkError } from '@/src/shared/utils/networkErrorHandler';
import { useAuthStore } from "@/src/store/auth-task-store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { createCDNFile, uploadFileSafe, uploadQuestionAttachments, uploadReviewAttachments, uploadTaskImages } from "./cdn-api";
import API_CONFIG from "./config";
import { MockApiService } from "./mock-api";
import {
    AllOffersResponse,
    CreateOfferRequest,
    CreateOfferResponse,
    CreateTaskRequest,
    CreateTaskResponse,
    MyTasksParams,
    PaymentStatusResponse,
    SingleTaskResponse,
    Task,
    TaskCompletionStatusResponse,
    TaskFilterParams,
    TaskFilterResponse,
    TaskOffersResponse,
    TaskSearchParams,
    TasksResponse,
    UpdateTaskRequest
} from "./types/tasks";

// 🔧 **AUTHENTICATION HELPER FUNCTIONS**

/**
 * Ensures user is authenticated for API operations
 * Automatically handles development auto-login
 */
async function ensureAuthentication(): Promise<{ success: boolean; token?: string; message?: string }> {
  const authState = useAuthStore.getState();
  
  // Check auth store first
  if (authState.token && authState.isAuthenticated) {
    return { success: true, token: authState.token };
  }
  
  // Check AsyncStorage for stored token
  try {
    const storedToken = await AsyncStorage.getItem('token');
    if (storedToken) {
      console.log("🔄 Found stored token, syncing to auth store");
      // Restore auth state if we have a stored token
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          await authState.setAuthData(storedToken, user, 3600);
          return { success: true, token: storedToken };
        } catch {
          console.warn("⚠️ Failed to parse stored user, using auto-login");
        }
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("⚠️ Error accessing AsyncStorage:", error);
    }
  }
  
  // Try development auto-login
  if (__DEV__ || API_CONFIG.DEVELOPMENT_MODE) {
    try {
      console.log("🔧 Development mode: Attempting auto-login");
      await autoLoginForDevelopment();
      
      // Re-check auth state after auto-login
      const newAuthState = useAuthStore.getState();
      if (newAuthState.token && newAuthState.isAuthenticated) {
        return { success: true, token: newAuthState.token };
      }
    } catch (error) {
      if (__DEV__) {
        console.warn("⚠️ Auto-login failed:", error);
      }
    }
  }
  
  return { 
    success: false, 
    message: "Authentication required. Please log in to continue."
  };
}

/**
 * Handles authentication errors and attempts retry
 */
async function handleAuthErrorAndRetry(): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    console.log("🔄 Handling authentication error...");
    
    // Clear invalid auth data
    await useAuthStore.getState().clearAuth();
    
    // Try to re-authenticate in development mode
    if (__DEV__ || API_CONFIG.DEVELOPMENT_MODE) {
      await autoLoginForDevelopment();
      const authState = useAuthStore.getState();
      if (authState.token && authState.isAuthenticated) {
        return { success: true, token: authState.token };
      }
    }
    
    // If not development or auto-login failed, handle globally
    handleAuthenticationError(new Error("Authentication expired"), false);
    
    return { 
      success: false, 
      message: "Authentication session expired. Please log in again."
    };
  } catch (error) {
    if (__DEV__) {
      console.warn("⚠️ Error handling auth retry:", error);
    }
    return { 
      success: false, 
      message: "Failed to refresh authentication."
    };
  }
}

// 🔧 **API HELPER FUNCTION**
function getApi() {
  // API_CONFIG.BASE_URL already handles the env variable and fallback
  return createApi(API_CONFIG.BASE_URL);
}

/**
 * 📁 Get Categories from Database
 * Endpoint: GET /api/categories
 * Fetches categories from the database category collection
 */
export async function getCategories(): Promise<{ success: boolean; data: any[] }> {
  const api = getApi();
  try {
    console.log("📁 Fetching categories from database...");
    const response = await api.get('/categories');
    console.log("✅ Get categories success:", response.data);
    
    // Handle the actual API response format
    if (response.data.success && Array.isArray(response.data.data)) {
      // Return full category objects with locationType
      return {
        success: true,
        data: response.data.data
      };
    } else if (Array.isArray(response.data)) {
      // If direct array of categories
      return { success: true, data: response.data };
    } else {
      throw new Error('Invalid categories response format');
    }
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Get categories failed:", error);
    }
    
    // Fallback to predefined categories if API fails
    if (__DEV__) {
      console.warn("🔄 Using fallback categories due to API error");
    }
    const fallbackCategories = [
      'Appliance installation and repair',
      'Auto Michanic and Electrician',
      'Buliding Maintatance and Renovations',
      'Business and Accounting',
      'Carpentry',
      'Cleaning and Organising',
      'Removalist',
      'Education and Tutoring',
      'Electrical',
      'Event Planning',
      'Furniture repair and Flatpack Assemply',
      'Gardening and Landscaping',
      'Graphic Design',
      'Handyman and Handywomen',
      'Health & Fitness',
      'IT & Tech',
      'Legal Services',
      'Marketting and Advertising',
      'Music and Entertainment',
      'Painting',
      'Pet Care',
      'Photography',
      'Plumbing',
      'Something Else',
      'Web & App Development',
      'Personal Assistance',
      'Tours and Transport',
      'Delivery',
      'Realestate',
    ];
    
    return {
      success: true,
      data: fallbackCategories
    };
  }
}

/**
 * 📁 Get Categories by Location Type
 * Endpoint: GET /api/categories/by-location?type={locationType}
 * Fetches categories filtered by location type (In-person, Online, or Both)
 */
export async function getCategoriesByLocation(locationType: string): Promise<{ success: boolean; locationType: string; data: any[] }> {
  const api = getApi();
  try {
    console.log(`📁 Fetching categories for location type: ${locationType}`);
    const response = await api.get(`/categories/by-location?type=${locationType}`);
    console.log("✅ Get categories by location success:", response.data);
    
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Get categories by location failed:", error);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (!isNetworkError(error) && __DEV__) {
        console.warn("⚠️ Get categories by location failed - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

// 🌟 **PHASE 1: CORE TASK FEATURES**

/**
 * 📋 Get All Tasks (Browse/Discover)
 * Endpoint: GET /api/tasks/
 * Auth: No
 */
export async function getAllTasks(): Promise<TasksResponse> {
  // Check if we should use mock API only
  if (API_CONFIG.USE_MOCK_ONLY) {
    console.log("🎭 Using Mock API only (development mode)");
    return await MockApiService.getAllTasks();
  }
  
  const api = getApi();
  try {
    console.log("🔍 Fetching all tasks with pagination support...");
    
    // Start with a reasonable limit to get most tasks in first request
    const response = await api.get('/tasks?limit=50&page=1');
    console.log("✅ Get all tasks - First page response:", {
      total: response.data.total,
      count: response.data.count,
      pages: response.data.pages,
      currentPage: response.data.currentPage,
      dataLength: response.data.data?.length
    });
    
    let allTasksData = [...(response.data.data || [])];
    
    // Check if we have pagination and need to fetch more pages
    if (response.data.pages && response.data.pages > 1) {
      console.log(`📄 Found ${response.data.pages} pages, fetching remaining ${response.data.pages - 1} pages...`);
      
      // Fetch remaining pages
      for (let page = 2; page <= response.data.pages; page++) {
        try {
          console.log(`📄 Fetching page ${page}...`);
          const pageResponse = await api.get(`/tasks?limit=50&page=${page}`);
          if (pageResponse.data.data && pageResponse.data.data.length > 0) {
            allTasksData.push(...pageResponse.data.data);
            console.log(`✅ Page ${page}: Added ${pageResponse.data.data.length} tasks`);
          }
        } catch (pageError) {
          console.warn(`⚠️ Failed to fetch page ${page}:`, pageError);
        }
      }
      
      console.log(`✅ Successfully fetched all ${allTasksData.length} tasks from ${response.data.pages} pages`);
      
      // 🔧 FIX: Parse location for each task if returned as string (same as getMyTasks)
      allTasksData.forEach((task: any) => {
        if (task.location && typeof task.location === 'string') {
          try {
            task.location = JSON.parse(task.location);
            console.log('📍 AllTasks (multi-page): Parsed location for task:', task._id);
          } catch {
            console.warn('⚠️ AllTasks (multi-page): Could not parse location for task:', task._id);
          }
        }
      });
      
      // Return combined results
      return {
        ...response.data,
        data: allTasksData,
        count: allTasksData.length,
        total: response.data.total
      };
    }
    
    console.log(`✅ Single page response: ${allTasksData.length} tasks`);
    
    // 🔧 FIX: Parse location for each task if returned as string (same as getMyTasks)
    if (allTasksData && Array.isArray(allTasksData)) {
      allTasksData.forEach((task: any) => {
        if (task.location && typeof task.location === 'string') {
          try {
            task.location = JSON.parse(task.location);
            console.log('📍 AllTasks: Parsed location for task:', task._id);
          } catch {
            console.warn('⚠️ AllTasks: Could not parse location for task:', task._id, 'Location:', task.location);
          }
        }
      });
    }
    
    return {
      ...response.data,
      data: allTasksData
    };
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Get all tasks failed:", error);
    }
    
    throw error;
  }
}

/**
 * 🎯 Filter Tasks with Advanced Options
 * Endpoint: GET /api/tasks/filter
 * Auth: No - Supports comprehensive filtering and sorting
 * Fallback: Uses /api/tasks/ if filter endpoint fails
 */
export async function getFilteredTasks(params?: TaskFilterParams): Promise<TaskFilterResponse> {
  // Check if we should use mock API only
  if (API_CONFIG.USE_MOCK_ONLY) {
    console.log("🎭 Using Mock API only (development mode) - falling back to getAllTasks");
    const mockResponse = await MockApiService.getAllTasks();
    // Convert to filter response format
    return {
      success: mockResponse.success,
      data: mockResponse.data || [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockResponse.data?.length || 0,
        itemsPerPage: mockResponse.data?.length || 20,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }
  
  const api = getApi();
  
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.lat !== undefined) queryParams.append('lat', params.lat.toString());
    if (params?.lng !== undefined) queryParams.append('lng', params.lng.toString());
    if (params?.radius !== undefined) queryParams.append('radius', params.radius.toString());
    if (params?.categories) queryParams.append('categories', params.categories);
    if (params?.minBudget !== undefined) queryParams.append('minBudget', params.minBudget.toString());
    if (params?.maxBudget !== undefined) queryParams.append('maxBudget', params.maxBudget.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.locationType) queryParams.append('locationType', params.locationType);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/tasks/filter${queryString ? `?${queryString}` : ''}`;
    
    console.log("🎯 Filtering tasks with params:", params);
    console.log("🔍 Filter URL:", url);
    
    const response = await api.get(url);
    console.log("✅ Filter tasks response:", {
      success: response.data.success,
      dataLength: response.data.data?.length,
      pagination: response.data.pagination
    });
    
    // 🔧 FIX: Parse location for each task if returned as string (same as getMyTasks)
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      response.data.data.forEach((task: any) => {
        if (task.location && typeof task.location === 'string') {
          try {
            task.location = JSON.parse(task.location);
            console.log('📍 FilteredTasks: Parsed location for task:', task._id);
          } catch {
            console.warn('⚠️ FilteredTasks: Could not parse location for task:', task._id);
          }
        }
      });
    }
    
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Filter endpoint failed:", error);
    }
    
    // If filter endpoint fails (500 error or not found), fallback to getAllTasks with client-side filtering
    if (error.response?.status === 500 || error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      console.log("🔄 Filter endpoint not available, falling back to getAllTasks with client-side filtering");
      
      try {
        // Use the working getAllTasks endpoint
        const fallbackResponse = await getAllTasks();
        let filteredTasks = fallbackResponse.data || [];
        
        // Apply client-side filters based on params
        if (params) {
          // Search filter
          if (params.search) {
            const searchLower = params.search.toLowerCase();
            filteredTasks = filteredTasks.filter((task: any) =>
              task.title.toLowerCase().includes(searchLower) ||
              task.details.toLowerCase().includes(searchLower)
            );
          }
          
          // Category filter
          if (params.categories) {
            const categoryLower = params.categories.toLowerCase();
            filteredTasks = filteredTasks.filter((task: any) =>
              task.categories.some((cat: string) => cat.toLowerCase().includes(categoryLower))
            );
          }
          
          // Price range filters
          if (params.minBudget !== undefined) {
            filteredTasks = filteredTasks.filter((task: any) => task.budget >= params.minBudget!);
          }
          if (params.maxBudget !== undefined) {
            filteredTasks = filteredTasks.filter((task: any) => task.budget <= params.maxBudget!);
          }
          
          // Status filter
          if (params.status) {
            filteredTasks = filteredTasks.filter((task: any) => task.status === params.status);
          }
          
          // Location type filter
          if (params.locationType) {
            if (params.locationType === 'Online') {
              filteredTasks = filteredTasks.filter((task: any) =>
                task.location?.address?.toLowerCase().includes('online') ||
                task.location?.address?.toLowerCase().includes('remote')
              );
            } else if (params.locationType === 'In-person') {
              filteredTasks = filteredTasks.filter((task: any) =>
                !task.location?.address?.toLowerCase().includes('online') &&
                !task.location?.address?.toLowerCase().includes('remote')
              );
            }
          }
          
          // Basic sorting (client-side)
          if (params.sortBy) {
            switch (params.sortBy) {
              case 'highest-budget':
              case 'price-high':
                filteredTasks.sort((a: any, b: any) => b.budget - a.budget);
                break;
              case 'lowest-budget':
              case 'price-low':
                filteredTasks.sort((a: any, b: any) => a.budget - b.budget);
                break;
              case 'newest':
              case 'latest':
                filteredTasks.sort((a: any, b: any) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
              case 'oldest':
                filteredTasks.sort((a: any, b: any) => 
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                break;
              // Note: 'closest' sorting would require GPS coordinates and distance calculation
              // For now, we'll leave these unsorted or sort by date as fallback
              default:
                filteredTasks.sort((a: any, b: any) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
            }
          }
        }
        
        console.log("✅ Fallback filter complete:", {
          originalCount: fallbackResponse.data?.length,
          filteredCount: filteredTasks.length,
          filters: params
        });
        
        // Convert to filter response format
        return {
          success: true,
          data: filteredTasks,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: filteredTasks.length,
            itemsPerPage: filteredTasks.length,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
        
      } catch (fallbackError) {
        console.error("❌ Fallback getAllTasks also failed:", fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
}

/**
 * ➕ Create New Task
 * Endpoint: POST /api/tasks/
 * Auth: Required
 */
export async function createTask(taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
  const api = getApi();
  try {
    console.log("📝 Creating task:", taskData);
    
    // 🚀 CONSOLE LOG THE COMPLETE REQUEST BODY (CREATE TASK)
    console.log("🚀 === COMPLETE TASK CREATION REQUEST BODY (CREATE TASK) ===");
    console.log(JSON.stringify(taskData, null, 2));
    console.log("🚀 === END REQUEST BODY ===");
    
    const response = await api.post('/tasks', taskData);
    console.log("✅ Create task success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Create task failed:", error);
    throw error;
  }
}

/**
 * ➕ Post Task with Images via CDN upload-safe
 * Flow: Upload images to CDN first → get URLs → POST /api/tasks with image_urls
 * Auth: Required - Images go through OCR content validation
 */
export async function postTaskWithImages(taskData: CreateTaskRequest, imageUris: string[] = []): Promise<CreateTaskResponse> {
  const api = getApi();
  try {
    console.log("🚀 === POST TASK WITH IMAGES (CDN UPLOAD-SAFE) ===");
    console.log("📤 imageUris count:", imageUris.length);

    let taskDataToSend = { ...taskData };

    if (imageUris.length > 0) {
      console.log("📸 Uploading images to CDN via upload-safe (OCR validated)...");

      // Step 1: Upload all images via CDN upload-safe
      const { urls, rejected } = await uploadTaskImages(imageUris);

      if (rejected.length > 0) {
        console.warn(`⚠️ ${rejected.length} image(s) rejected by OCR:`, rejected);
      }

      if (urls.length === 0 && imageUris.length > 0) {
        throw new Error("All images were rejected by content policy. Please use appropriate images.");
      }

      // Step 2: Set image_urls for backend (new CDN flow)
      taskDataToSend.image_urls = urls;
      delete taskDataToSend.images; // Remove old images field

      console.log(`✅ ${urls.length} image(s) uploaded to CDN. Posting task with image_urls...`);
    }

    // Step 3: POST task with image_urls
    console.log("🚀 === COMPLETE TASK CREATION REQUEST BODY ===");
    console.log(JSON.stringify(taskDataToSend, null, 2));

    const response = await api.post('/tasks', taskDataToSend, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("✅ Task posted successfully:", response.data);
    return response.data;
  } catch (error: any) {
    // 📦 OFFLINE MODE: If CDN upload or task post failed due to network,
    // queue the task data (without images) for offline sync
    if (error?.isNetworkError || isNetworkError(error)) {
      console.log("📦 [Offline] Network error during task posting — queuing task for offline sync");
      
      // Import offline storage to queue manually (CDN uploads can't be replayed)
      const { addToOfflineQueue } = require('@/src/services/offline/offlineStorage');
      
      // Queue task data WITHOUT images (images can't be uploaded offline)
      const taskDataWithoutImages = { ...taskData };
      delete taskDataWithoutImages.images;
      
      const title = taskData.title || 'Untitled Task';
      
      await addToOfflineQueue({
        type: 'CREATE_TASK' as const,
        method: 'POST' as const,
        url: '/tasks',
        data: JSON.stringify(taskDataWithoutImages),
        description: `Post Task: ${title}`,
        maxRetries: 3,
        priority: 2,
      });
      
      // Return a fake success so the UI treats it as successful
      // The real POST will happen when we sync
      return {
        success: true,
        isOfflineQueued: true,
        message: "Task saved offline. It will be posted when you reconnect.",
        data: { ...taskDataWithoutImages, _id: `offline_${Date.now()}`, status: 'pending_sync' },
      } as any;
    }

    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Task posting failed:", error?.response?.status, error?.message);
    }

    if (error?.response?.status === 401) {
      if (error.isAuthError) {
        throw new Error(error.message || "Authentication expired. Please login again to continue.");
      }
      throw error;
    }
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid task data";
      throw new Error(`Validation Error: ${errorMessage}`);
    }
    if (error?.response?.status === 413) {
      throw new Error("Images are too large. Please reduce image size and try again.");
    }

    throw error;
  }
}

/**
 * ➕ Post Task (Primary method)
 * Endpoint: POST /api/tasks/
 * Auth: Required - This is the main endpoint that stores tasks properly
 */
export async function postTask(taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
  const api = getApi();
  try {
    console.log("📝 Posting task to main endpoint:", taskData);
    
    // 🚀 CONSOLE LOG THE COMPLETE REQUEST BODY (REGULAR POST TASK)
    console.log("🚀 === COMPLETE TASK CREATION REQUEST BODY (REGULAR POST) ===");
    console.log(JSON.stringify(taskData, null, 2));
    console.log("🚀 === END REQUEST BODY ===");
    
    const response = await api.post('/tasks', taskData);
    console.log("✅ Post task success:", response.data);
    return response.data;
  } catch (error: any) {
    // Enhanced error logging for debugging
    console.error("❌ Post task failed with detailed error:");
    console.error("Status:", error?.response?.status);
    console.error("Status Text:", error?.response?.statusText);
    console.error("Response Data:", error?.response?.data);
    console.error("Request Data:", taskData);
    console.error("Request Headers:", error?.config?.headers);
    console.error("Full Error:", error);
    
    // Check for authentication errors with special handling
    if (error?.response?.status === 401) {
      console.error("❌ Post task failed - Authentication required (401)");
      
      // If this is an auth error from the interceptor, provide user-friendly message
      if (error.isAuthError) {
        throw new Error(error.message || "Authentication expired. Please login again to continue.");
      }
      
      // Otherwise, it's a regular 401 that should be handled by interceptor
      throw error;
    }
    
    // Check for validation errors  
    if (error?.response?.status === 400) {
      console.error("❌ Post task failed - Bad Request (400)");
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid task data";
      throw new Error(`Validation Error: ${errorMessage}`);
    }
    
    console.error("❌ Task posting failed:", error);
    throw error;
  }
}

/**
 * ⭐ Post Task with CDN Upload-Safe (Primary method)
 * Flow: Upload images to CDN first → get URLs → POST /api/tasks with image_urls
 * Auth: Required - Images validated via OCR content policy
 */
export async function postTaskDirect(taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
  const api = getApi();
  try {
    console.log("🚀 === POST TASK DIRECT (CDN UPLOAD-SAFE) ===");
    console.log("📤 images count:", taskData.images?.length || 0);

    const hasImages = taskData.images && taskData.images.length > 0;
    let taskDataToSend = { ...taskData };

    if (hasImages) {
      const imageUris = taskData.images!;
      console.log(`📸 Uploading ${imageUris.length} image(s) to CDN via upload-safe...`);

      // Step 1: Upload all images via CDN upload-safe (OCR validated)
      const { urls, rejected } = await uploadTaskImages(imageUris);

      if (rejected.length > 0) {
        console.warn(`⚠️ ${rejected.length} image(s) rejected by content policy:`, rejected);
      }

      if (urls.length === 0 && imageUris.length > 0) {
        throw new Error("All images were rejected by content policy. Please use appropriate images.");
      }

      // Step 2: Replace images with image_urls for new CDN flow
      taskDataToSend.image_urls = urls;
      delete taskDataToSend.images;

      console.log(`✅ ${urls.length}/${imageUris.length} image(s) uploaded to CDN successfully`);
    } else {
      // No images, remove images field to keep payload clean
      delete taskDataToSend.images;
    }

    // Step 3: POST task as JSON with image_urls
    console.log("📤 Posting task to /tasks...");
    console.log("📋 Task data:", JSON.stringify(taskDataToSend, null, 2));

    const response = await api.post('/tasks', taskDataToSend, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("✅ Task posted successfully:", response.data);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Task posting failed:", error?.response?.status, error?.message);
    }

    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    } else if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "Bad request. Please check your task data and try again.";
      throw new Error(errorMessage);
    } else if (error?.response?.status === 413) {
      throw new Error("Images are too large. Please choose smaller images and try again.");
    }

    throw error;
  }
}

/**
 * 🔍 Search Tasks (OPTIMIZED - Direct Search API)
 * Endpoint: GET /api/tasks/search
 * Auth: Required
 * Note: Uses dedicated search endpoint with query parameters: q, category, location, minBudget, maxBudget
 */
export async function searchTasks(params: TaskSearchParams): Promise<TasksResponse> {
  const api = getApi();
  try {
    console.log("🔍 [searchTasks] Calling /tasks/search with params:", params);
    
    // Build query parameters for /tasks/search endpoint
    const queryParams = new URLSearchParams();
    
    // Required 'q' parameter - search query
    const searchQuery = params.q || params.search || '';
    if (searchQuery.trim()) {
      queryParams.append('q', searchQuery.trim());
    }
    
    // Optional filters matching backend API spec
    if (params.category) {
      queryParams.append('category', params.category);
    }
    
    if (params.location) {
      queryParams.append('location', params.location);
    }
    
    if (params.minBudget !== undefined && params.minBudget > 0) {
      queryParams.append('minBudget', params.minBudget.toString());
    }
    
    if (params.maxBudget !== undefined && params.maxBudget < 10000) {
      queryParams.append('maxBudget', params.maxBudget.toString());
    }
    
    const endpoint = `/tasks/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("🔍 [searchTasks] Calling endpoint:", endpoint);
    
    const response = await api.get<{
      success: boolean;
      data: Task[];
      count: number;
      filters?: {
        appliedCategories: string[];
        appliedFilters: string[];
        appliedPriceRange: { min: number | null; max: number | null };
      };
    }>(endpoint);
    
    console.log("✅ [searchTasks] Search successful:", {
      count: response.data.count,
      resultsLength: response.data.data?.length || 0,
      searchQuery: searchQuery.trim()
    });
    
    // Return in TasksResponse format
    return {
      success: response.data.success,
      count: response.data.count || response.data.data?.length || 0,
      total: response.data.count || response.data.data?.length || 0,
      pages: 1,
      currentPage: 1,
      data: response.data.data || []
    };
    
  } catch (error: any) {
    console.error("❌ [searchTasks] Search API error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    
    // For other errors, return empty results (faster than fallback chains)
    console.warn("⚠️ Search failed, returning empty results");
    return {
      success: false,
      count: 0,
      total: 0,
      pages: 0,
      currentPage: 1,
      data: []
    };
  }
}

/**
 * 🎯 Filter Tasks (for Sort and Filter UI actions)
 * Endpoint: GET /api/tasks/filter
 * Auth: No
 */
export async function filterTasks(params: TaskFilterParams): Promise<TaskFilterResponse> {
  const api = getApi();
  try {
    console.log("🎯 Filtering tasks with params:", params);
    
    // Build query parameters for the filter endpoint
    const searchParams = new URLSearchParams();
    
    if (params.sortBy) {
      searchParams.append('sortBy', params.sortBy);
    }
    
    if (params.lat !== undefined) {
      searchParams.append('lat', params.lat.toString());
    }
    
    if (params.lng !== undefined) {
      searchParams.append('lng', params.lng.toString());
    }
    
    if (params.radius !== undefined) {
      searchParams.append('radius', params.radius.toString());
    }
    
    if (params.categories && params.categories.trim()) {
      searchParams.append('categories', params.categories);
    }
    
    if (params.minBudget !== undefined) {
      searchParams.append('minBudget', params.minBudget.toString());
    }
    
    if (params.maxBudget !== undefined) {
      searchParams.append('maxBudget', params.maxBudget.toString());
    }
    
    if (params.status) {
      searchParams.append('status', params.status);
    } else {
      searchParams.append('status', 'open'); // Default to open tasks
    }
    
    if (params.locationType) {
      searchParams.append('locationType', params.locationType);
    }
    
    if (params.search && params.search.trim()) {
      searchParams.append('search', params.search.trim());
    }
    
    if (params.page !== undefined) {
      searchParams.append('page', params.page.toString());
    } else {
      searchParams.append('page', '1');
    }
    
    if (params.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    } else {
      searchParams.append('limit', '20');
    }

    // Try multiple endpoints to work around backend routing conflicts
    const endpoints = [
      `/tasks/filter?${searchParams.toString()}`,      // Primary endpoint
      `/filter/tasks?${searchParams.toString()}`,      // Alternative routing
      `/tasks/filter-all?${searchParams.toString()}`,  // Alternative name
    ];
    
    // Add search endpoint with correct parameters (search API has different params)
    const searchParams2 = new URLSearchParams();
    if (params.search && params.search.trim()) {
      searchParams2.append('q', params.search.trim());
    }
    if (params.categories && params.categories.trim()) {
      searchParams2.append('category', params.categories.trim());
    }
    if (params.minBudget !== undefined) {
      searchParams2.append('minBudget', params.minBudget.toString());
    }
    if (params.maxBudget !== undefined) {
      searchParams2.append('maxBudget', params.maxBudget.toString());
    }
    if (params.locationType) {
      searchParams2.append('location', params.locationType);
    }
    
    endpoints.push(`/tasks/search?${searchParams2.toString()}`); // Search as final fallback
    
    let response: any;
    let lastError: any;
    
    for (let i = 0; i < endpoints.length; i++) {
      try {
        console.log(`🔗 Trying Filter API endpoint ${i + 1}:`, endpoints[i]);
        response = await api.get<any>(endpoints[i]);
        
        if (response.data && response.data.success) {
          console.log(`✅ Filter API succeeded with endpoint ${i + 1}:`, {
            success: response.data.success,
            hasData: !!response.data.data,
            dataLength: response.data.data?.length,
            responseKeys: Object.keys(response.data)
          });
          break;
        } else {
          console.log(`⚠️ Endpoint ${i + 1} returned unsuccessful response:`, {
            success: response.data?.success,
            hasData: !!response.data?.data,
            responseData: response.data
          });
        }
      } catch (error: any) {
        console.log(`❌ Endpoint ${i + 1} failed:`, error?.response?.status, error?.message);
        lastError = error;
        
        // If this is the routing conflict error, continue to next endpoint
        if (error?.response?.status === 500 && 
            (error?.response?.data?.message?.includes('Cast to ObjectId failed') ||
             error?.response?.data?.message?.includes('filter'))) {
          console.warn(`🚨 Detected routing conflict on endpoint ${i + 1}, trying next...`);
          continue;
        }
      }
    }
    
    if (!response || !response.data || !response.data.success) {
      console.log("❌ All endpoints failed or returned unsuccessful response:", {
        hasResponse: !!response,
        hasData: !!response?.data,
        success: response?.data?.success,
        lastError: lastError?.message
      });
      throw lastError || new Error('All filter endpoints failed');
    }
    
    // Handle different response formats
    if (response.data && response.data.success) {
      // Check if this is a search response (TasksResponse) that needs conversion
      if ('count' in response.data && 'total' in response.data && !('pagination' in response.data)) {
        console.log("✅ Search API succeeded, converting to filter format", {
          totalItems: response.data.total,
          count: response.data.count,
          dataLength: response.data.data?.length
        });
        
        // Convert TasksResponse to TaskFilterResponse
        const filterResponse: TaskFilterResponse = {
          success: true,
          data: response.data.data || [],
          pagination: {
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.pages || 1,
            totalItems: response.data.total || response.data.count || 0,
            itemsPerPage: response.data.data?.length || 20,
            hasNextPage: (response.data.currentPage || 1) < (response.data.pages || 1),
            hasPreviousPage: (response.data.currentPage || 1) > 1
          }
        };
        
        // 🔧 FIX: Parse location for each task if returned as string
        filterResponse.data.forEach((task: any) => {
          if (task.location && typeof task.location === 'string') {
            try {
              task.location = JSON.parse(task.location);
              console.log('📍 filterTasks (search): Parsed location for task:', task._id);
            } catch {
              console.warn('⚠️ filterTasks (search): Could not parse location for task:', task._id);
            }
          }
        });
        
        return filterResponse;
      } 
      // This is already a filter response
      else if ('pagination' in response.data) {
        console.log("✅ Filter API succeeded", {
          totalItems: response.data.pagination?.totalItems,
          currentPage: response.data.pagination?.currentPage,
          totalPages: response.data.pagination?.totalPages,
        });
        
        // 🔧 FIX: Parse location for each task if returned as string
        if (response.data.data && Array.isArray(response.data.data)) {
          response.data.data.forEach((task: any) => {
            if (task.location && typeof task.location === 'string') {
              try {
                task.location = JSON.parse(task.location);
                console.log('📍 filterTasks (filter): Parsed location for task:', task._id);
              } catch {
                console.warn('⚠️ filterTasks (filter): Could not parse location for task:', task._id);
              }
            }
          });
        }
        
        return response.data;
      }
      // Handle edge case where response format is unexpected
      else {
        console.log("✅ API succeeded with unknown format, adapting", {
          responseKeys: Object.keys(response.data),
          dataLength: response.data.data?.length
        });
        
        const filterResponse: TaskFilterResponse = {
          success: true,
          data: response.data.data || [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.data?.length || 0,
            itemsPerPage: response.data.data?.length || 20,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
        
        // 🔧 FIX: Parse location for each task if returned as string
        filterResponse.data.forEach((task: any) => {
          if (task.location && typeof task.location === 'string') {
            try {
              task.location = JSON.parse(task.location);
              console.log('📍 filterTasks (unknown): Parsed location for task:', task._id);
            } catch {
              console.warn('⚠️ filterTasks (unknown): Could not parse location for task:', task._id);
            }
          }
        });
        
        return filterResponse;
      }
    } else {
      console.warn("⚠️ API returned unsuccessful response");
      throw new Error("API returned unsuccessful response");
    }

  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Filter API failed:", {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data
      });
      
      // Check for backend routing conflict (ObjectId casting error)
      if (error?.response?.status === 500 && 
          (error?.response?.data?.message?.includes('Cast to ObjectId failed') ||
           error?.response?.data?.message?.includes('filter'))) {
        console.warn('🚨 BACKEND ROUTING CONFLICT: /tasks/filter is being treated as /tasks/:id');
        console.warn('Backend needs: router.get("/filter", ...) BEFORE router.get("/:id", ...)');
      }
    }
    
    // Return empty successful response on error
    if (error?.response?.status || error?.message?.includes('failed')) {
      return {
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }
    // If we get here, something unexpected happened
    throw error;
  }
}

/**
 * 👤 Get My Tasks
 * Endpoint: GET /api/tasks/my-tasks
 * Auth: Required
 */
export async function getMyTasks(params?: MyTasksParams): Promise<{ success: boolean; data: Task[] }> {
  const api = getApi();
  try {
    console.log("👤 Fetching my tasks with params:", params);
    
    // Try my-tasks endpoint first, fallback to general tasks endpoint
    try {
      const searchParams = new URLSearchParams();
      if (params?.section) searchParams.append('section', params.section);
      if (params?.subsection) searchParams.append('subsection', params.subsection);
      if (params?.role) searchParams.append('role', params.role);
      
      const response = await api.get(`/tasks/my-tasks?${searchParams.toString()}`);
      console.log("✅ Get my tasks response:", response.data);
      
      // 🔧 FIX: Parse location for each task if returned as string
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((task: any) => {
          if (task.location && typeof task.location === 'string') {
            try {
              task.location = JSON.parse(task.location);
              console.log('📍 MyTasks: Parsed location for task:', task._id);
            } catch {
              console.warn('⚠️ MyTasks: Could not parse location for task:', task._id);
            }
          }
        });
      }
      
      // Check if we got actual data, if not fall back to general endpoint
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      } else {
        console.log("📝 my-tasks endpoint returned empty data, using general tasks endpoint");
        throw new Error("Empty data from my-tasks endpoint");
      }
    } catch {
      console.log("📝 my-tasks endpoint not available or empty, using general tasks endpoint");
      // Fallback to general tasks endpoint - use getAllTasks function
      const tasksResponse = await getAllTasks();
      console.log("✅ Get my tasks fallback success:", { success: true, data: tasksResponse.data });
      return { success: true, data: tasksResponse.data };
    }
  } catch (error: any) {
    // Development fallback - if server is not available, use mock data
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ENOTFOUND') {
      console.warn("🔄 Server not available, using development mode with mock my tasks");
      console.log("✅ Mock my tasks data for development");
      
      // Create mock my tasks response that matches API format
      const mockMyTasks = {
        success: true,
        data: [
          {
            _id: "dev-task-" + Date.now(),
            title: "Sample Development Task",
            categories: ["General", "Development"],
            dateType: "Easy",
            dateRange: {
              start: new Date().toISOString(),
              end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            time: "Anytime",
            location: {
              address: "Remote/Online",
              coordinates: {}
            },
            details: "This is a sample task created for development testing",
            budget: 150,
            currency: "LKR",
            images: [],
            status: "open",
            createdBy: {
              _id: "dev-user-123",
              firstName: "Dev",
              lastName: "User",
              email: "dev@example.com",
              rating: 4
            },
            statusHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
            taskBudget: 150,
            taskCurrency: "LKR",
            formattedTaskBudget: "Rs.150",
            formattedBudget: "Rs.150",
            canComplete: false,
            completionButtonText: null,
            completionAction: null,
            userRole: "creator",
            showCompleteButton: false,
            showCancelButton: false,
            actions: {
              canEdit: true,
              canCancel: true,
              canView: true,
              canComplete: false
            }
          }
        ]
      };
      
      return mockMyTasks;
    }
    
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Get my tasks failed:", error);
    }
    throw error;
  }
}

/**
 * 🤝 Get My Offers
 * Endpoint: GET /api/tasks/my-offers
 * Auth: Required
 */
export async function getMyOffers(params?: MyTasksParams): Promise<{ success: boolean; data: Task[] }> {
  const api = getApi();
  try {
    console.log("🤝 Fetching my offers with params:", params);

    const searchParams = new URLSearchParams();
    if (params?.section) searchParams.append('section', params.section);

    const response = await api.get(`/tasks/my-offers?${searchParams.toString()}`);
    console.log("✅ Get my offers response:", response.data);

    // Return whatever data we got (including empty array)
    if (response.data && response.data.data !== undefined) {
      console.log(`✅ my-offers returned ${response.data.data.length} offers`);
      return response.data;
    } else {
      console.log("📝 my-offers endpoint returned no data field");
      return { success: true, data: [] };
    }
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Get my offers failed:", error?.response?.status, error?.message);
    }
    // Re-throw the error so React Query can handle retries properly
    // Do NOT silently return empty - that hides real auth/network errors
    throw error;
  }
}

// 🌟 **PHASE 2: TASK DETAILS & MANAGEMENT**

/**
 * 📖 Get Single Task Details
 * Endpoint: GET /api/tasks/:id
 * Auth: No
 */
export async function getTaskById(taskId: string): Promise<SingleTaskResponse> {
  const api = getApi();
  try {
    console.log("📖 Fetching task details for ID:", taskId);
    const response = await api.get(`/tasks/${taskId}`);
    console.log("✅ Get task details success");
    
    // Image debugging
    const taskData = response.data?.data;
    const imagesCount = taskData?.images?.length || 0;
    
    if (imagesCount > 0) {
      console.log(`✅ Task "${taskData?.title}" has ${imagesCount} image(s)`);
      // Log first image sample for verification
      const firstImage = taskData.images[0];
      const imageType = typeof firstImage === 'string' ? 'URL' : 'Object';
      console.log(`📸 First image type: ${imageType}`);
    } else if (taskData?.images && Array.isArray(taskData.images)) {
      console.warn(`⚠️ Task "${taskData?.title}" has empty images array - check backend`);
    }
    
    // 🔧 FIX: Parse location if it's returned as a string from backend
    if (taskData && taskData.location) {
      if (typeof taskData.location === 'string') {
        try {
          console.log('📍 GET: Location returned as string, parsing:', taskData.location);
          taskData.location = JSON.parse(taskData.location);
          console.log('📍 GET: Parsed location:', taskData.location);
        } catch {
          console.warn('⚠️ GET: Could not parse location string, keeping as-is');
        }
      }
    }
    
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Get task details failed:", {
        taskId,
        status: error?.response?.status,
        message: error?.message,
        data: error?.response?.data
      });
    }
    
    // Handle 400 errors - bad request (invalid task ID, etc.)
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || `Invalid task ID or task not found: ${taskId}`;
      if (!isNetworkError(error) && __DEV__) {
        console.warn("⚠️ Get task details failed - Bad request (400):", errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (!isNetworkError(error) && __DEV__) {
        console.warn("⚠️ Get task details failed - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

/**
 * ✏️ Update Task
 * Endpoint: PUT /api/tasks/:id
 * Auth: Required
 */
export async function updateTask(taskId: string, updates: UpdateTaskRequest): Promise<{ success: boolean; data: Task }> {
  const api = getApi();
  try {
    console.log("✏️ Starting update task operation...");
    console.log("📋 Task ID:", taskId);
    console.log("📝 Updates payload:", JSON.stringify(updates, null, 2));
    console.log("🌐 API Base URL:", API_CONFIG.BASE_URL);
    console.log("🔗 Full update URL:", `${API_CONFIG.BASE_URL}/tasks/${taskId}`);
    
    // Validate taskId format (MongoDB ObjectId is 24 hex characters)
    if (!taskId || !/^[0-9a-fA-F]{24}$/.test(taskId)) {
      throw new Error(`Invalid task ID format: ${taskId}`);
    }
    
    // Ensure authentication
    const authResult = await ensureAuthentication();
    if (!authResult.success) {
      console.error("❌ Authentication failed for update operation");
      throw new Error(authResult.message || "Authentication required. Please log in to update tasks.");
    }

    console.log("🔐 Authentication confirmed for update operation");
    
    // Make PUT request to /tasks/:id endpoint
    const response = await api.put(`/tasks/${taskId}`, updates);
    console.log("✅ Update task API response:", JSON.stringify(response.data, null, 2));
    console.log("✅ Update task HTTP status:", response.status);
    
    if (!response.data || !response.data.success) {
      throw new Error("Update failed - server returned unsuccessful response");
    }
    
    // 🔧 FIX: Ensure location is properly parsed if returned as string
    if (response.data.data && response.data.data.location) {
      if (typeof response.data.data.location === 'string') {
        try {
          console.log('📍 Location returned as string, parsing:', response.data.data.location);
          response.data.data.location = JSON.parse(response.data.data.location);
          console.log('📍 Parsed location:', response.data.data.location);
        } catch {
          console.warn('⚠️ Could not parse location string, keeping as-is');
        }
      }
    }
    
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Update task failed - Full error details:");
      console.warn("   - Error message:", error?.message);
      console.warn("   - HTTP status:", error?.response?.status);
      console.warn("   - Response data:", JSON.stringify(error?.response?.data, null, 2));
      console.warn("   - Request URL:", error?.config?.url);
      console.warn("   - Request method:", error?.config?.method);
      console.warn("   - Request payload:", JSON.stringify(updates, null, 2));
    }
    
    // Handle validation errors (400)
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error;
      if (__DEV__) {
        console.log("❌ Update task validation error (400):", errorMessage);
      }
      throw new Error(errorMessage || "Invalid task data. Please check your inputs.");
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Update task - Authentication required (401)");
      }
      
      // Try to handle auth error and retry once
      const retryResult = await handleAuthErrorAndRetry();
      if (retryResult.success) {
        console.log("🔄 Retrying update after auth refresh");
        return updateTask(taskId, updates); // Retry once with fresh auth
      }
      
      throw new Error("Authentication expired. Please log in again to continue.");
    }
    
    // Handle not found errors
    if (error?.response?.status === 404) {
      if (__DEV__) {
        console.log("❌ Update task - Task not found (404)");
      }
      throw new Error("Task not found. It may have been deleted.");
    }
    
    // Handle permission denied errors
    if (error?.response?.status === 403) {
      if (__DEV__) {
        console.log("❌ Update task - Permission denied (403)");
      }
      throw new Error("You don't have permission to update this task.");
    }
    
    // Handle server errors
    if (error?.response?.status >= 500) {
      if (__DEV__) {
        console.log("❌ Update task - Server error:", error?.response?.status);
        console.log("🔄 Server error detected, using development fallback");
      }
      
      // Development fallback for server errors
      if (__DEV__ || API_CONFIG.DEVELOPMENT_MODE) {
        console.log("🎭 Using mock update operation due to server error");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock updated task response
        const mockUpdatedTask = {
          _id: taskId,
          title: updates.title || "Updated Task",
          details: updates.details || "Updated description",
          budget: updates.budget || 0,
          currency: updates.currency || "LKR",
          time: updates.time || "Anytime",
          date: updates.date || new Date().toISOString(),
          dateType: updates.dateType || "Easy",
          dateRange: {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          location: updates.location || { address: "Updated location", coordinates: { lat: 0, lng: 0 } },
          status: "open",
          categories: updates.category ? [updates.category] : ["General"],
          images: updates.images || [],
          createdBy: {
            _id: "mock-user",
            firstName: "Mock",
            lastName: "User",
            email: "mock@example.com",
            rating: 5
          },
          statusHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        };
        
        return {
          success: true,
          data: mockUpdatedTask as Task
        };
      }
      
      throw new Error("Server error. Please try again later.");
    }
    
    // Check if this is a "method not allowed" or "endpoint not found" error
    if (error?.response?.status === 405 || error?.response?.status === 404) {
      console.warn("⚠️ PUT endpoint may not be implemented on backend server");
      console.warn("🔄 Falling back to mock update for development");
      
      // Development fallback: simulate successful update
      if (__DEV__ || API_CONFIG.DEVELOPMENT_MODE) {
        console.log("🎭 Using mock update operation for development");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock updated task response
        const mockUpdatedTask = {
          _id: taskId,
          title: updates.title || "Updated Task",
          details: updates.details || "Updated description", // Task uses 'details' field
          budget: updates.budget || 0,
          currency: updates.currency || "LKR",
          time: updates.time || "Anytime",
          date: updates.date || new Date().toISOString(),
          dateType: updates.dateType || "Easy",
          dateRange: {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          },
          location: updates.location || { address: "Updated location", coordinates: { lat: 0, lng: 0 } },
          status: "open",
          categories: ["General"],
          images: updates.images || [],
          createdBy: {
            _id: "mock-user",
            firstName: "Mock",
            lastName: "User",
            email: "mock@example.com",
            rating: 5
          },
          statusHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        };
        
        return {
          success: true,
          data: mockUpdatedTask as Task
        };
      }
      
      throw new Error("Update functionality is not available. Backend PUT endpoint needs to be implemented.");
    }
    
    // Network errors (server not available)
    if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error') || error?.code === 'ENOTFOUND') {
      console.warn("🔄 Server not available, using development mode with mock update");
      
      if (__DEV__ || API_CONFIG.DEVELOPMENT_MODE) {
        console.log("🎭 Using mock update operation (server unavailable)");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock updated task response
        const mockUpdatedTask = {
          _id: taskId,
          title: updates.title || "Updated Task",
          details: updates.details || "Updated description", // Task uses 'details' field
          budget: updates.budget || 0,
          currency: updates.currency || "LKR",
          time: updates.time || "Anytime",
          date: updates.date || new Date().toISOString(),
          dateType: updates.dateType || "Easy",
          dateRange: {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          },
          location: updates.location || { address: "Updated location", coordinates: { lat: 0, lng: 0 } },
          status: "open",
          categories: ["General"],
          images: updates.images || [],
          createdBy: {
            _id: "mock-user",
            firstName: "Mock",
            lastName: "User",
            email: "mock@example.com",
            rating: 5
          },
          statusHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        };
        
        return {
          success: true,
          data: mockUpdatedTask as Task
        };
      }
      
      throw new Error("Cannot connect to server. Please check your internet connection and try again.");
    }
    
    // Catch-all error handler with development fallback
    if (__DEV__) {
      console.log("❌ Update task - Unexpected error:", error?.message);
    }
    
    // Provide development fallback for any other errors
    if (__DEV__ || API_CONFIG.DEVELOPMENT_MODE) {
      console.warn("🎭 Unexpected error occurred, using development fallback");
      
      // Create mock updated task response
      const mockUpdatedTask = {
        _id: taskId,
        title: updates.title || "Updated Task",
        details: updates.details || "Updated description",
        budget: updates.budget || 0,
        currency: updates.currency || "LKR",
        time: updates.time || "Anytime",
        date: updates.date || new Date().toISOString(),
        dateType: updates.dateType || "Easy",
        dateRange: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        location: updates.location || { address: "Updated location", coordinates: { lat: 0, lng: 0 } },
        status: "open",
        categories: updates.category ? [updates.category] : ["General"],
        images: updates.images || [],
        createdBy: {
          _id: "mock-user",
          firstName: "Mock",
          lastName: "User",
          email: "mock@example.com",
          rating: 5
        },
        statusHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      };
      
      return {
        success: true,
        data: mockUpdatedTask as Task
      };
    }
    
    throw new Error(error?.message || "An unexpected error occurred while updating the task.");
  }
}

/**
 * ✏️ Update Task With Images
 * Flow: Upload new images to CDN first → get URLs → PUT /api/tasks/:id with JSON
 * Auth: Required
 */
export async function updateTaskWithImages(
  taskId: string, 
  updates: UpdateTaskRequest, 
  newImageUris: string[] = [],
  existingImages: string[] = [],
  replaceImages: boolean = false
): Promise<{ success: boolean; data: Task }> {
  const api = getApi();
  try {
    console.log("✏️🖼️ Starting update task with images (CDN upload-safe)...");
    console.log("📋 Task ID:", taskId);
    console.log("🖼️ New image URIs:", newImageUris.length);
    console.log("🖼️ Existing images:", existingImages.length);
    console.log("🔄 Replace images:", replaceImages);
    
    // Validate taskId format (MongoDB ObjectId is 24 hex characters)
    if (!taskId || !/^[0-9a-fA-F]{24}$/.test(taskId)) {
      throw new Error(`Invalid task ID format: ${taskId}`);
    }
    
    // Ensure authentication
    const authResult = await ensureAuthentication();
    if (!authResult.success) {
      console.error("❌ Authentication failed for update operation");
      throw new Error(authResult.message || "Authentication required. Please log in to update tasks.");
    }

    console.log("🔐 Authentication confirmed for update with images operation");
    
    // Build JSON request body
    const requestBody: any = { ...updates };
    
    // Handle location
    if (updates.location) {
      if (typeof updates.location === 'object' && updates.location.coordinates) {
        requestBody.coordinates = updates.location.coordinates;
      }
    }
    
    // Upload new images via CDN upload-safe
    let newImageUrls: string[] = [];
    if (newImageUris.length > 0) {
      console.log("📤 Uploading new images via CDN upload-safe...");
      const { urls, rejected } = await uploadTaskImages(newImageUris, taskId);
      newImageUrls = urls;
      if (rejected.length > 0) {
        console.warn(`⚠️ ${rejected.length} image(s) rejected by OCR:`, rejected);
      }
      console.log(`✅ ${urls.length}/${newImageUris.length} new image(s) uploaded to CDN`);
    }
    
    // Combine existing and new image URLs
    if (replaceImages) {
      requestBody.image_urls = newImageUrls;
    } else {
      requestBody.image_urls = [...existingImages, ...newImageUrls];
    }
    requestBody.replaceImages = replaceImages;
    
    console.log("📤 Sending JSON update request...");
    console.log("📋 Request body:", JSON.stringify(requestBody, null, 2));
    
    const response = await api.put(`/tasks/${taskId}`, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log("✅ Update task with images API response:", JSON.stringify(response.data, null, 2));
    console.log("🖼️ Images in response:", response.data?.data?.images?.length || 0);
    
    if (!response.data || !response.data.success) {
      throw new Error("Update failed - server returned unsuccessful response");
    }
    
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Update task with images failed - Full error details:");
      console.warn("   - Error message:", error?.message);
      console.warn("   - HTTP status:", error?.response?.status);
      console.warn("   - Response data:", JSON.stringify(error?.response?.data, null, 2));
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Update task with images - Authentication required (401)");
      }
      const retryResult = await handleAuthErrorAndRetry();
      if (retryResult.success) {
        console.log("🔄 Retrying update with images after auth refresh");
        return updateTaskWithImages(taskId, updates, newImageUris, existingImages, replaceImages);
      }
      throw new Error("Authentication expired. Please log in again to continue.");
    }
    
    // Handle other errors
    if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || "Invalid task data. Please check your inputs.");
    }
    if (error?.response?.status === 404) {
      throw new Error("Task not found. It may have been deleted.");
    }
    if (error?.response?.status === 403) {
      throw new Error("You don't have permission to update this task.");
    }
    
    throw new Error(error?.message || "An unexpected error occurred while updating the task.");
  }
}

/**
 * 🗑️ Delete Task
 * Endpoint: DELETE /api/tasks/:id
 * Auth: Required
 */
export async function deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
  const api = getApi();
  try {
    console.log("🗑️ Starting delete task operation...");
    console.log("📋 Task ID:", taskId);
    console.log("🌐 API Base URL:", API_CONFIG.BASE_URL);
    console.log("🔗 Full delete URL:", `${API_CONFIG.BASE_URL}/tasks/${taskId}`);
    
    // Ensure authentication
    const authResult = await ensureAuthentication();
    if (!authResult.success) {
      console.error("❌ Authentication failed for delete operation");
      return {
        success: false,
        message: authResult.message || "Authentication required. Please log in to delete tasks."
      };
    }

    console.log("🔐 Authentication confirmed for delete operation");
    
    const response = await api.delete(`/tasks/${taskId}`);
    console.log("✅ Delete task API response:", response.data);
    console.log("✅ Delete task HTTP status:", response.status);
    
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Delete task failed - Full error details:");
      console.warn("   - Error message:", error?.message);
      console.warn("   - HTTP status:", error?.response?.status);
      console.warn("   - Response data:", error?.response?.data);
      console.warn("   - Request URL:", error?.config?.url);
      console.warn("   - Request method:", error?.config?.method);
      console.warn("   - Request headers:", error?.config?.headers);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Delete task - Authentication required (401)");
      }
      
      // Try to handle auth error and retry once
      const retryResult = await handleAuthErrorAndRetry();
      if (retryResult.success) {
        console.log("🔄 Retrying delete after auth refresh");
        return deleteTask(taskId); // Retry once with fresh auth
      }
      
      return {
        success: false,
        message: "Authentication expired. Please log in again to continue."
      };
    }
    
    // Handle other HTTP errors
    if (error?.response?.status === 404) {
      console.warn("⚠️ Task not found - treating as already deleted");
      return {
        success: true,
        message: "Task was already deleted or not found."
      };
    }
    
    if (error?.response?.status === 403) {
      if (__DEV__) {
        console.log("❌ Delete task - Permission denied (403)");
      }
      return {
        success: false,
        message: "You don't have permission to delete this task."
      };
    }
    
    if (error?.response?.status >= 500) {
      if (__DEV__) {
        console.log("❌ Delete task - Server error:", error?.response?.status);
      }
      return {
        success: false,
        message: "Server error. Please try again later."
      };
    }
    
    // Check if this is a "method not allowed" or "endpoint not found" error
    if (error?.response?.status === 405 || error?.response?.status === 404) {
      console.warn("⚠️ DELETE endpoint may not be implemented on backend server");
      console.warn("🔄 Falling back to mock delete for development");
      
      // Development fallback: simulate successful delete
      if (__DEV__ || API_CONFIG.DEVELOPMENT_MODE) {
        console.log("🎭 Using mock delete operation for development");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          message: "Task deleted successfully (development mode - backend DELETE endpoint not implemented)"
        };
      }
      
      return {
        success: false,
        message: "Delete functionality is not available. Backend DELETE endpoint needs to be implemented."
      };
    }
    
    // Network errors (server not available)
    if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error') || error?.code === 'ENOTFOUND') {
      console.warn("🔄 Server not available, using development mode with mock delete");
      
      if (__DEV__ || API_CONFIG.DEVELOPMENT_MODE) {
        console.log("🎭 Using mock delete operation (server unavailable)");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          message: "Task deleted successfully (development mode - server unavailable)"
        };
      }
      
      return {
        success: false,
        message: "Cannot connect to server. Please check your internet connection and try again."
      };
    }
    
    return {
      success: false,
      message: error?.message || "An unexpected error occurred while deleting the task."
    };
  }
}

/**
 * 🗑️ Delete Offer
 * Endpoint: DELETE /api/tasks/:taskId/offers/:offerId
 * Auth: Required - Only the user who created the offer can delete it
 */
export async function deleteOffer(
  taskId: string,
  offerId: string
): Promise<{ success: boolean; message: string }> {
  const api = getApi();
  try {
    console.log(`🗑️ Deleting offer ${offerId} from task ${taskId}...`);
    const response = await api.delete(`/tasks/${taskId}/offers/${offerId}`);
    console.log('✅ Delete offer API response:', response.data);
    return {
      success: true,
      message: response.data?.message || 'Offer deleted successfully',
    };
  } catch (error: any) {
    console.warn('⚠️ Delete offer failed:', error?.message);
    if (error?.response?.status === 400) {
      return { success: false, message: error.response.data?.message || 'Cannot delete accepted offer.' };
    }
    if (error?.response?.status === 401) {
      return { success: false, message: 'Authentication required. Please log in again.' };
    }
    if (error?.response?.status === 404) {
      return { success: false, message: 'Offer not found. It may have already been deleted.' };
    }
    return { success: false, message: error?.message || 'Failed to delete offer. Please try again.' };
  }
}

// 🌟 **PHASE 3: OFFER SYSTEM**

/**
 * 👀 Get Task Offers
 * Endpoint: GET /api/tasks/:id/offers
 * Auth: No
 */
export async function getTaskOffers(taskId: string): Promise<TaskOffersResponse> {
  const api = getApi();
  try {
    console.log("👀 Fetching offers for task:", taskId);
    const response = await api.get(`/tasks/${taskId}/offers`);
    console.log("✅ Get task offers success:", JSON.stringify(response.data, null, 2));
    
    // Log specific offer structure for debugging
    if (response.data?.data?.offers?.length > 0) {
      console.log("🔍 First offer structure:", JSON.stringify(response.data.data.offers[0], null, 2));
    }
    
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Get task offers failed:", error);
    }
    
    // Handle authentication errors - return empty offers instead of throwing
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (!isNetworkError(error) && __DEV__) {
        console.warn("⚠️ Get task offers failed - Authentication required, returning empty offers");
      }
      console.warn("💡 Please login again to view offers");
      return {
        success: false,
        data: {
          _id: taskId,
          offers: [],
          offerCount: 0
        } as any
      };
    }
    
    // Handle network errors - return empty offers
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn("⚠️ Network error while fetching task offers, returning empty offers");
      return {
        success: false,
        data: {
          _id: taskId,
          offers: [],
          offerCount: 0
        } as any
      };
    }
    
    // For other errors, still throw to maintain existing behavior for real errors
    throw error;
  }
}

/**
 * 💰 Create Offer on Task
 * Endpoint: POST /api/tasks/:id/offers
 * Auth: Required
 */
export async function createOffer(taskId: string, offerData: CreateOfferRequest): Promise<CreateOfferResponse> {
  const api = getApi();
  try {
    console.log("💰 Creating offer for task:", taskId, offerData);
    
    // Clean the offer data - remove currency if it might cause issues
    const cleanOfferData = {
      amount: offerData.amount,
      message: offerData.message
      // Temporarily removing currency to see if that's causing the 400 error
    };
    
    console.log("📤 Sending clean offer data:", cleanOfferData);
    
    const response = await api.post(`/tasks/${taskId}/offers`, cleanOfferData);
    console.log("✅ Create offer success:", response.data);
    return response.data;
  } catch (error: any) {
    // Handle 500 errors - SPECIAL CASE: Offer might have been created despite error
    if (error?.response?.status === 500) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || '';
      
      // Check if this is a duplicate chat error (offer was created successfully)
      if (errorMessage.includes('duplicate key') || errorMessage.includes('E11000')) {
        console.log("⚠️ 500 error due to duplicate chat, but offer was likely created");
        console.log("✅ Treating as successful offer creation (chat already exists)");
        
        // Return a success response - the offer was created, chat already exists
        return {
          success: true,
          message: 'Offer submitted successfully',
          data: {
            taskId: taskId,
            // We don't have the offer ID, but that's okay - the UI will refetch
          }
        } as unknown as CreateOfferResponse;
      }
      
      // For other 500 errors, throw with better message
      if (__DEV__) {
        console.log("❌ Create offer - Server Error (500)");
      }
      throw new Error("Server error while processing your offer. Please check if it was submitted.");
    }
    
    // Only log non-network errors in development (after we've handled special cases)
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Create offer failed:", error);
      console.warn("⚠️ Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error.message,
        requestData: offerData
      });
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Create offer - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle validation errors (400 Bad Request)
    if (error?.response?.status === 400) {
      if (__DEV__) {
        console.log("❌ Create offer - Bad Request (400)");
      }
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          "Invalid offer data. Please check your amount and message.";
      throw new Error(`Validation Error: ${errorMessage}`);
    }
    
    throw error;
  }
}

/**
 * 🔄 Map Category Display Name to ServiceType Enum
 * Maps user-friendly category names to backend enum values
 * Backend expects exact category display names, not kebab-case
 * @deprecated Currently unused but kept for potential future use
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapCategoryToServiceType(categoryName: string): string {
  // Create mapping for common variations and typos to standardized display names
  const categoryMappings: { [key: string]: string } = {
    // Handle typos and variations in category names - return exact display names
    'Building Maintenance and Renovations': 'Building Maintenance and Renovations',
    'Buliding Maintatance and Renovations': 'Building Maintenance and Renovations', // Handle typos
    'Appliance installation and repair': 'Appliance installation and repair',
    'Auto Michanic and Electrician': 'Auto Michanic and Electrician',
    'Auto Mechanic and Electrician': 'Auto Michanic and Electrician', // Normalize to backend format
    'Business and Accounting': 'Business and Accounting',
    'Carpentry': 'Carpentry',
    'Cleaning and Organising': 'Cleaning and Organising',
    'Removalist': 'Removalist',
    'Education and Tutoring': 'Education and Tutoring',
    'Electrical': 'Electrical',
    'Event Planning': 'Event Planning',
    'Furniture repair and Flatpack Assemply': 'Furniture repair and Flatpack Assemply',
    'Gardening and Landscaping': 'Gardening and Landscaping',
    'Graphic Design': 'Graphic Design',
    'Handyman and Handywomen': 'Handyman and Handywomen',
    'Health & Fitness': 'Health & Fitness',
    'IT & Tech': 'IT & Tech',
    'Legal Services': 'Legal Services',
    'Marketting and Advertising': 'Marketting and Advertising',
    'Marketing and Advertising': 'Marketting and Advertising', // Normalize to backend format
    'Music and Entertainment': 'Music and Entertainment',
    'Painting': 'Painting',
    'Pet Care': 'Pet Care',
    'Photography': 'Photography',
    'Plumbing': 'Plumbing',
    'Something Else': 'Something Else',
    'Web & App Development': 'Web & App Development',
    'Personal Assistance': 'Personal Assistance',
    'Tours and Transport': 'Tours and Transport',
    'Delivery': 'Delivery',
    'Realestate': 'Realestate',
  };
  
  // Return mapped value or return the original category name
  return categoryMappings[categoryName] || categoryName;
}

/**
 * ✅ Accept Offer
 * Endpoint: POST /api/tasks/:taskId/offers/:offerId/accept
 * Auth: Required
 */
export async function acceptOffer(taskId: string, offerId: string, userId?: string, taskCategory?: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("✅ Accepting offer:", { taskId, offerId, userId, taskCategory });
    
    // Try empty body first as API documentation doesn't specify request body requirements
    console.log("📤 Accept offer - trying with empty body");
    
    // Try the specific accept endpoint first
    let acceptResponse;
    try {
      const response = await api.post(`/tasks/${taskId}/offers/${offerId}/accept`, {});
      console.log("✅ Accept offer success:", response.data);
      acceptResponse = response.data;
      
      // After successfully accepting, reject all other pending offers
      try {
        console.log("🚫 Rejecting other pending offers...");
        const rejectionResult = await rejectOtherOffers(taskId, offerId);
        console.log(`✅ Rejected ${rejectionResult.rejectedCount} other offer(s)`);
      } catch (rejectError) {
        // Don't fail the acceptance if rejection fails
        if (__DEV__) {
          console.log('⚠️ Failed to reject other offers (continuing anyway):', rejectError);
        }
      }
      
      return acceptResponse;
    } catch (acceptError: any) {
      console.log("⚠️ Accept endpoint failed with empty body, trying with user data:", {
        status: acceptError?.response?.status,
        data: acceptError?.response?.data,
        message: acceptError.message
      });
      
      // If empty body fails, try with minimal user data (DO NOT send serviceType - causes validation errors)
      if (acceptError?.response?.status === 500 || acceptError?.response?.status === 400) {
        console.log("🔄 Trying with minimal user data (no serviceType)");
        const requestBody = {
          userId: userId || ""
        };
        
        try {
          const retryResponse = await api.post(`/tasks/${taskId}/offers/${offerId}/accept`, requestBody);
          console.log("✅ Accept offer success with user data:", retryResponse.data);
          
          // Reject other offers after successful acceptance
          try {
            console.log("🚫 Rejecting other pending offers...");
            const rejectionResult = await rejectOtherOffers(taskId, offerId);
            console.log(`✅ Rejected ${rejectionResult.rejectedCount} other offer(s)`);
          } catch (rejectError) {
            if (__DEV__) {
              console.log('⚠️ Failed to reject other offers:', rejectError);
            }
          }
          
          return retryResponse.data;
        } catch (retryError: any) {
          console.log("❌ Accept endpoint failed again:", retryError?.response?.data);
          throw retryError;
        }
      }
      
      // If accept endpoint fails with 404, try updating offer status to 'accepted'
      if (acceptError?.response?.status === 404) {
        console.log("🔄 Attempting alternative approach: updating offer status to 'accepted'");
        const statusUpdateBody = {
          status: 'accepted',
          role: "poster",
          userId: userId || ""
        };
        const updateResponse = await api.put(`/tasks/${taskId}/offers/${offerId}`, statusUpdateBody);
        console.log("✅ Accept offer via status update success:", updateResponse.data);
        
        // Reject other offers after successful acceptance
        try {
          console.log("🚫 Rejecting other pending offers...");
          const rejectionResult = await rejectOtherOffers(taskId, offerId);
          console.log(`✅ Rejected ${rejectionResult.rejectedCount} other offer(s)`);
        } catch (rejectError) {
          if (__DEV__) {
            console.log('⚠️ Failed to reject other offers:', rejectError);
          }
        }
        
        return updateResponse.data;
      }
      
      throw acceptError;
    }
  } catch (error: any) {
    console.log("❌ Accept offer failed:", {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
      requestBody: {
        userId: userId || ""
        // Note: Not sending serviceType as it causes backend validation errors
      }
    });
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.log("❌ Accept offer failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle 400 errors with more specific messages
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "Bad request - invalid offer data";
      console.log("❌ Accept offer failed - Bad request (400):", errorMessage);
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

/**
 * 🚫 Reject Other Offers
 * Rejects all pending offers except the accepted one and sends notifications
 * Endpoint: PUT /api/tasks/:taskId/offers/:offerId (status: rejected)
 * Auth: Required
 */
export async function rejectOtherOffers(taskId: string, acceptedOfferId: string): Promise<{ success: boolean; rejectedCount: number }> {
  const api = getApi();
  try {
    console.log("🚫 Rejecting other offers for task:", { taskId, acceptedOfferId });
    
    // Get all offers for this task
    const offersResponse = await getTaskOffers(taskId);
    const allOffers = offersResponse.data?.offers || [];
    
    // Filter pending offers (exclude the accepted one)
    const pendingOffers = allOffers.filter((offer: any) => 
      offer._id !== acceptedOfferId && offer.status === 'pending'
    );
    
    if (pendingOffers.length === 0) {
      console.log("✅ No other pending offers to reject");
      return { success: true, rejectedCount: 0 };
    }
    
    console.log(`🚫 Rejecting ${pendingOffers.length} pending offer(s)`);
    
    // Reject each pending offer
    const rejectionPromises = pendingOffers.map(async (offer: any) => {
      try {
        // Update offer status to rejected
        const response = await api.put(`/tasks/${taskId}/offers/${offer._id}`, {
          status: 'rejected'
        });
        
        console.log(`✅ Rejected offer ${offer._id} for user ${offer.user?._id || offer.taskTakerId?._id}`);
        
        // Send notification to the user whose offer was rejected
        // Backend should handle this, but we'll try to trigger it via webhook
        try {
          const userId = offer.user?._id || offer.taskTakerId?._id || offer.taskTaker?._id;
          if (userId) {
            await api.post('/notifications/webhook', {
              type: 'OFFER_REJECTED',
              title: 'Offer Not Accepted',
              message: `Unfortunately, another offer has been accepted for this task. Thank you for your interest.`,
              recipient: userId,
              priority: 'NORMAL',
              task: taskId,
              offer: offer._id
            });
            console.log(`📧 Notification sent to user ${userId} for rejected offer`);
          }
        } catch (notifError) {
          // Don't fail the rejection if notification fails
          if (__DEV__) {
            console.log('⚠️ Failed to send rejection notification:', notifError);
          }
        }
        
        return response.data;
      } catch (error) {
        if (__DEV__) {
          console.log(`⚠️ Failed to reject offer ${offer._id}:`, error);
        }
        throw error;
      }
    });
    
    await Promise.all(rejectionPromises);
    
    console.log(`✅ Successfully rejected ${pendingOffers.length} offer(s)`);
    return { success: true, rejectedCount: pendingOffers.length };
    
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.log("⚠️ Failed to reject other offers:", error?.message);
    }
    throw error;
  }
}

/**
 * ✏️ Update Offer
 * Endpoint: PUT /api/tasks/:taskId/offers/:offerId
 * Auth: Required
 */
export async function updateOffer(taskId: string, offerId: string, updates: Partial<CreateOfferRequest>): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("✏️ Updating offer:", { taskId, offerId, updates });
    const response = await api.put(`/tasks/${taskId}/offers/${offerId}`, updates);
    console.log("✅ Update offer success:", response.data);
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.log("⚠️ Update offer failed:", error?.message);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Update offer - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

/**
 * 🌍 Get All Offers
 * Since /api/offers/all endpoint doesn't exist, we aggregate offers from all tasks
 * Auth: Required
 * Description: Fetches all tasks and extracts their offers
 */
export async function getAllOffers(params?: {
  taskId?: string;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
}): Promise<AllOffersResponse> {
  const api = getApi();
  try {
    console.log("🌍 Fetching all offers by aggregating from tasks...");
    
    // Since /api/offers/all doesn't exist, we'll fetch all tasks and extract their offers
    const tasksResponse = await api.get('/tasks?limit=100&page=1');
    const tasks = tasksResponse.data?.data || [];
    
    console.log(`📊 Fetched ${tasks.length} tasks to extract offers`);
    
    // Aggregate all offers from all tasks
    const allOffers: any[] = [];
    
    for (const task of tasks) {
      // If task has offers, fetch them individually
      if (task.offerCount && task.offerCount > 0) {
        try {
          const taskOffersResponse = await api.get(`/tasks/${task._id}/offers`);
          const taskOffers = taskOffersResponse.data?.data?.offers || [];
          
          // Transform offers to include FULL task information (needed for Tasker's Todoo Tasks tab)
          const enrichedOffers = taskOffers.map((offer: any) => ({
            _id: offer._id,
            taskId: task._id, // Keep backward compatibility
            task: task, // Include FULL task object with status for filtering
            taskCreatorId: task.createdBy || offer.taskCreatorId,
            taskTakerId: offer.taskTakerId,
            taskTaker: offer.taskTaker || offer.taskTakerId,
            offer: {
              amount: offer.amount || offer.offer?.amount || 0,
              currency: offer.currency || offer.offer?.currency || 'SGD',
              message: offer.message || offer.offer?.message || ''
            },
            amount: offer.amount || offer.offer?.amount || 0,
            currency: offer.currency || offer.offer?.currency || 'SGD',
            message: offer.message || offer.offer?.message || '',
            status: offer.status || 'pending',
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt
          }));
          
          allOffers.push(...enrichedOffers);
        } catch (offerError) {
          console.warn(`⚠️ Could not fetch offers for task ${task._id}:`, offerError);
        }
      }
    }
    
    console.log(`✅ Successfully aggregated ${allOffers.length} offers from ${tasks.length} tasks`);
    
    // Apply filtering if taskId parameter is provided
    let filteredOffers = allOffers;
    if (params?.taskId) {
      filteredOffers = allOffers.filter(offer => offer.taskId._id === params.taskId);
      console.log(`🔍 Filtered to ${filteredOffers.length} offers for task ${params.taskId}`);
    }
    
    // Apply sorting
    if (params?.sortBy) {
      filteredOffers.sort((a, b) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        const order = params.order === 'asc' ? 1 : -1;
        return aValue > bValue ? order : -order;
      });
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOffers = filteredOffers.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedOffers,
      pagination: {
        total: filteredOffers.length,
        page: page,
        limit: limit,
        pages: Math.ceil(filteredOffers.length / limit)
      }
    };
    
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.log("⚠️ Get all offers failed:", error?.message || error);
    }
    
    // Handle authentication errors - return empty data instead of throwing
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.warn("⚠️ Get all offers failed - Authentication required, returning empty data");
      console.warn("💡 Please login again to view offers");
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: params?.limit || 50,
          pages: 0
        }
      };
    }
    
    // Handle network errors - return empty data
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn("⚠️ Network error while fetching offers, returning empty data");
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: params?.limit || 50,
          pages: 0
        }
      };
    }
    
    // For other errors, return empty data instead of crashing
    console.warn("⚠️ Unexpected error fetching offers, returning empty data");
    return {
      success: false,
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: params?.limit || 50,
        pages: 0
      }
    };
  }
}

// 🌟 **PHASE 4: TASK COMPLETION FLOW**

/**
 * 📊 Get Task Completion Status
 * Endpoint: GET /api/tasks/:taskId/completion-status
 * Auth: Required
 */
export async function getTaskCompletionStatus(taskId: string): Promise<TaskCompletionStatusResponse> {
  const api = getApi();
  try {
    console.log("📊 Getting completion status for task:", taskId);
    const response = await api.get(`/tasks/${taskId}/completion-status`);
    console.log("✅ Get completion status success:", response.data);
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.log("⚠️ Get completion status failed:", error?.message);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Get completion status - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

/**
 * ✅ Complete Task (PATCH)
 * Endpoint: PATCH /api/tasks/:taskId/complete
 * Auth: Required
 */
export async function completeTask(taskId: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("✅ Completing task:", taskId);

    // Idempotent: task may already be marked complete (stale UI or duplicate tap)
    try {
      const taskDetails = await getTaskById(taskId);
      const task = taskDetails.data;
      if (task?.status === 'pending_completion') {
        console.log("✅ Task already pending_completion — no further action needed");
        return { success: true, data: task };
      }
    } catch {
      console.log("⚠️ Could not fetch task details, proceeding with direct completion...");
    }

    const response = await api.patch(`/tasks/${taskId}/complete`);
    console.log("✅ Complete task success:", response.data);
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.log("⚠️ Complete task failed:", error?.message);
      console.log("⚠️ Error response:", error?.response?.data);
      console.log("⚠️ Error status:", error?.response?.status);
    }
    
    // Handle specific error about offer status validation
    if (error?.response?.data?.message?.includes('Offer validation failed')) {
      if (__DEV__) {
        console.log("❌ Offer validation error - trying alternative completion approach");
      }
      
      // Try the PUT method instead of PATCH
      try {
        const altResponse = await api.put(`/tasks/${taskId}/complete`);
        console.log("✅ Complete task success (PUT method):", altResponse.data);
        return altResponse.data;
      } catch (altError: any) {
        console.error("❌ Alternative completion method also failed:", altError?.response?.data);
        
        // If both methods fail, try updating task status directly
        try {
          const statusResponse = await api.patch(`/tasks/${taskId}`, {
            status: 'completed'
          });
          console.log("✅ Complete task success (direct status update):", statusResponse.data);
          return statusResponse.data;
        } catch (statusError: any) {
          console.error("❌ Direct status update also failed:", statusError?.response?.data);
          throw error; // Throw the original error
        }
      }
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Complete task - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle 400 Bad Request with backend message
    if (error?.response?.status === 400) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error || '';
      if (__DEV__) {
        console.log("❌ Complete task - Bad Request (400):", backendMessage);
      }

      // Backend rejects when status is already pending_completion (todo required).
      // Treat as success if the task did transition — avoids false error after partial update.
      if (
        typeof backendMessage === 'string' &&
        backendMessage.includes('pending_completion') &&
        backendMessage.includes('todo')
      ) {
        try {
          const refreshed = await getTaskById(taskId);
          if (refreshed.data?.status === 'pending_completion') {
            console.log("✅ Task is pending_completion — treating mark-complete as success");
            return { success: true, data: refreshed.data };
          }
        } catch {
          // fall through to throw
        }
      }

      throw new Error(backendMessage || "Cannot complete task. Please check the task status.");
    }
    
    throw error;
  }
}

/**
 * ✅ Complete Task (PUT - Alternative)
 * Endpoint: PUT /api/tasks/:taskId/complete
 * Auth: Required
 */
export async function completeTaskAlt(taskId: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("✅ Completing task (alt):", taskId);
    const response = await api.put(`/tasks/${taskId}/complete`);
    console.log("✅ Complete task (alt) success:", response.data);
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.log("⚠️ Complete task (alt) failed:", error?.message);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Complete task (alt) - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

/**
 * ✅ Confirm Task Completion (PATCH)
 * Endpoint: PATCH /api/tasks/:taskId/confirm-completion
 * Auth: Required
 * Only the task poster (creator) can confirm completion.
 * Task must be in "pending_completion" status.
 * Upon confirmation:
 * - Task status changes to "completed"
 * - Payment is captured and released from escrow
 * - Payout is created and sent to the tasker's Stripe Connect account
 * - Receipts are generated for both parties
 * - FCM notifications are sent to both poster and tasker
 */
export async function confirmTaskCompletion(taskId: string): Promise<{ success: boolean; data: any; message?: string }> {
  const api = getApi();
  try {
    console.log("✅ Confirming task completion:", taskId);
    const response = await api.patch(`/tasks/${taskId}/confirm-completion`);
    console.log("✅ Confirm task completion success:", response.data);
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.log("⚠️ Confirm task completion failed:", error?.message);
      console.log("⚠️ Error response:", error?.response?.data);
      console.log("⚠️ Error status:", error?.response?.status);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Confirm task completion - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle 400 Bad Request (invalid task ID)
    if (error?.response?.status === 400) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      if (__DEV__) {
        console.log("❌ Confirm task completion - Bad Request (400):", backendMessage);
      }
      throw new Error(backendMessage || "Invalid task ID or task not ready for confirmation.");
    }
    
    // Handle 403 Forbidden (only poster can confirm)
    if (error?.response?.status === 403) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      if (__DEV__) {
        console.log("❌ Confirm task completion - Forbidden (403):", backendMessage);
      }
      throw new Error(backendMessage || "Only the task poster can confirm completion.");
    }
    
    // Handle 404 Not Found (task not found or not pending completion)
    if (error?.response?.status === 404) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      if (__DEV__) {
        console.log("❌ Confirm task completion - Not Found (404):", backendMessage);
      }
      throw new Error(backendMessage || "Task not found or not pending completion.");
    }
    
    throw error;
  }
}

/**
 * ✅ Confirm Task Completion (PUT - Alternative)
 * Endpoint: PUT /api/tasks/:taskId/confirm-completion
 * Auth: Required
 * Alternative endpoint for frontend compatibility
 */
export async function confirmTaskCompletionAlt(taskId: string): Promise<{ success: boolean; data: any; message?: string }> {
  const api = getApi();
  try {
    console.log("✅ Confirming task completion (PUT):", taskId);
    const response = await api.put(`/tasks/${taskId}/confirm-completion`);
    console.log("✅ Confirm task completion (PUT) success:", response.data);
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.log("⚠️ Confirm task completion (PUT) failed:", error?.message);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) {
        console.log("❌ Confirm task completion (PUT) - Authentication required (401)");
      }
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle 403 Forbidden
    if (error?.response?.status === 403) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      throw new Error(backendMessage || "Only the task poster can confirm completion.");
    }
    
    // Handle 404 Not Found
    if (error?.response?.status === 404) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      throw new Error(backendMessage || "Task not found or not pending completion.");
    }
    
    throw error;
  }
}

/**
 * 📋 Get Cancellation Reasons
 * Endpoint: GET /api/tasks/cancellation-reasons?type=poster|tasker
 * Auth: No - Public endpoint
 */
export async function getCancellationReasons(type: 'poster' | 'tasker'): Promise<{ success: boolean; data: any[] }> {
  const api = getApi();
  try {
    console.log("📋 Getting cancellation reasons for:", type);
    const response = await api.get(`/tasks/cancellation-reasons?type=${type}`);
    console.log("✅ Get cancellation reasons success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Get cancellation reasons failed:", error);
    
    // Return empty array on failure rather than throwing
    return { success: false, data: [] };
  }
}

/**
 * ❌ Cancel Task (Legacy - for pre-payment cancellation)
 * Endpoint: PUT /api/tasks/:taskId/cancel
 * Auth: Required
 */
export async function cancelTask(taskId: string, reason?: string, reasonId?: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("❌ Canceling task:", taskId);
    console.log("   Reason:", reason);
    console.log("   Reason ID:", reasonId);
    
    const payload: any = {};
    if (reason) payload.reason = reason;
    if (reasonId) payload.reasonId = reasonId;
    
    const response = await api.put(`/tasks/${taskId}/cancel`, payload);
    console.log("✅ Cancel task success:", response.data);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Cancel task failed:", error?.message);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) console.warn("⚠️ Cancel task failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

/**
 * 📝 Create Cancellation Request (Post-Payment)
 * Endpoint: POST /api/tasks/:taskId/cancel-request
 * Auth: Required
 * Used when: Poster or Tasker wants to cancel a task AFTER payment has been made
 */
export async function createCancellationRequest(taskId: string, reason: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("📝 Creating cancellation request for task:", taskId);
    console.log("   Reason:", reason);
    
    const response = await api.post(`/tasks/${taskId}/cancel-request`, { reason });
    console.log("✅ Cancellation request created successfully:", response.data);
    console.log("   Request ID:", response.data?.data?._id);
    console.log("   Requester ID:", response.data?.data?.requesterId);
    console.log("   📊 FULL RESPONSE DATA:", JSON.stringify(response.data, null, 2));
    console.log("   🎯 Task data in response:", response.data?.data?.task);
    console.log("   🎯 Task status after request:", response.data?.data?.task?.status);
    console.log("   🎯 Request status:", response.data?.data?.status);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Create cancellation request failed:", error?.message);
      console.warn("   Error status:", error?.response?.status);
      console.warn("   Task ID:", taskId);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) console.warn("⚠️ Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle duplicate request errors (400) - may happen if request already exists
    if (error?.response?.status === 400) {
      const errorMsg = error?.response?.data?.message || "Bad request";
      console.error("❌ Bad request (400):", errorMsg);
      throw new Error(errorMsg);
    }
    
    throw error;
  }
}

/**
 * 🔍 Get Cancellation Request (Post-Payment)
 * Endpoint: GET /api/tasks/:taskId/cancel-request
 * Auth: Required
 * Used when: Check if there's a pending cancellation request for a task
 */
export async function getCancellationRequest(taskId: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("🔍 Getting cancellation request for task:", taskId);
    
    const response = await api.get(`/tasks/${taskId}/cancel-request`);
    console.log("✅ Cancellation request retrieved:", response.data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    // 400, 401, 404 are all expected/non-critical for this background polling query
    const isExpectedError = status === 400 || status === 401 || status === 404 || error?.isAuthError;
    
    if (!isExpectedError && __DEV__) {
      console.warn("⚠️ Get cancellation request unexpected error:", error?.message);
    }
    
    // Return null for auth errors (401) - token may have just expired, don't crash the UI
    if (status === 401 || error?.isAuthError) {
      if (__DEV__) console.log("ℹ️ Cancellation request - auth required (401), returning null silently");
      return { success: true, data: null };
    }
    
    // Return null data if no cancellation request found (404)
    if (status === 404) {
      return { success: true, data: null };
    }
    
    // Handle 400 Bad Request - Backend returns this when no cancellation request exists
    if (status === 400) {
      return { success: true, data: null };
    }
    
    throw error;
  }
}

/**
 * ✅ Respond to Cancellation Request (Post-Payment)
 * Endpoint: PUT /api/tasks/cancel-requests/:requestId/respond
 * Auth: Required
 * Used when: Other party accepts or rejects the cancellation request
 */
export async function respondToCancellationRequest(requestId: string, action: 'accept' | 'reject'): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("✅ Responding to cancellation request:", requestId);
    console.log("   Action:", action);
    
    const response = await api.put(`/tasks/cancel-requests/${requestId}/respond`, { action });
    console.log("✅ Cancellation request response successful:", response.data);
    console.log("   Task ID:", response.data?.data?.task?._id);
    console.log("   New status:", response.data?.data?.task?.status);
    return response.data;
  } catch (error: any) {
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Respond to cancellation request failed:", error?.message);
      console.warn("   Error status:", error?.response?.status);
      console.warn("   Request ID:", requestId);
      console.warn("   Action:", action);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      if (__DEV__) console.warn("⚠️ Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle not found errors (404) - request may have been already processed
    if (error?.response?.status === 404) {
      const errorMsg = error?.response?.data?.message || "Cancellation request not found or already processed";
      console.error("❌ Not found (404):", errorMsg);
      throw new Error(errorMsg);
    }
    
    // Handle bad request errors (400) - invalid action or request state
    if (error?.response?.status === 400) {
      const errorMsg = error?.response?.data?.message || "Invalid request";
      console.error("❌ Bad request (400):", errorMsg);
      throw new Error(errorMsg);
    }
    
    throw error;
  }
}

/**
 * ♻️ Reopen unserviced task (poster)
 * Endpoint: PUT/PATCH /api/tasks/:taskId/reopen
 * Auth: Required
 */
export async function reopenUnservicedTask(taskId: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log('♻️ Reopening unserviced task:', taskId);
    try {
      const response = await api.put(`/tasks/${taskId}/reopen`);
      console.log('✅ Reopen task success (PUT):', response.data);
      return response.data;
    } catch (putError: any) {
      if (putError?.response?.status === 404 || putError?.response?.status === 405) {
        const response = await api.patch(`/tasks/${taskId}/reopen`);
        console.log('✅ Reopen task success (PATCH):', response.data);
        return response.data;
      }
      throw putError;
    }
  } catch (error: any) {
    console.error('❌ Reopen unserviced task failed:', error);
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || 'Authentication expired. Please login again to continue.');
    }
    throw new Error(error?.response?.data?.message || error?.message || 'Failed to reopen task');
  }
}

/**
 * 🔄 Update Task Status
 * Endpoint: PUT /api/tasks/:id/status
 * Auth: Required
 */
export async function updateTaskStatus(taskId: string, status: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("🔄 Updating task status:", { taskId, status });
    const response = await api.put(`/tasks/${taskId}/status`, { status });
    console.log("✅ Update task status success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Update task status failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Update task status failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

/**
 * 🤝 Accept Task
 * Endpoint: POST /api/tasks/:id/accept
 * Auth: Required
 */
export async function acceptTask(taskId: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("🤝 Accepting task:", taskId);
    const response = await api.post(`/tasks/${taskId}/accept`);
    console.log("✅ Accept task success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Accept task failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Accept task failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

// 🌟 **PHASE 5: ADVANCED FEATURES**

/**
 * 💳 Complete Payment
 * Endpoint: POST /api/tasks/:taskId/complete-payment
 * Auth: Required
 */
export async function completePayment(taskId: string, paymentData?: any): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("💳 Completing payment for task:", taskId);
    const response = await api.post(`/tasks/${taskId}/complete-payment`, paymentData || {});
    console.log("✅ Complete payment success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Complete payment failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Complete payment failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

/**
 * 📊 Get Payment Status
 * Endpoint: GET /api/tasks/my-tasks/payment-status
 * Auth: Required
 */
export async function getPaymentStatus(): Promise<PaymentStatusResponse> {
  const api = getApi();
  try {
    console.log("📊 Getting payment status...");
    const response = await api.get('/tasks/my-tasks/payment-status');
    console.log("✅ Get payment status success:", response.data);
    return response.data;
  } catch (error: any) {
    // Handle 404 gracefully (endpoint not available)
    if (error?.response?.status === 404) {
      console.log("ℹ️ Payment status endpoint not available (404) - using fallback");
      return { success: false, data: [] }; // Return empty data instead of throwing
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Get payment status failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Only log other errors, don't throw for better UX
    console.log("ℹ️ Payment status failed:", error?.response?.status, "- using fallback data");
    return { success: false, data: [] };
  }
}

/**
 * 💰 Get Payments for Tasker
 * Endpoint: GET /api/payments/tasker
 * Auth: Required
 */
export async function getTaskerPayments(): Promise<{ success: boolean; payments: any[] }> {
  const api = getApi();
  try {
    console.log("💰 Getting tasker payments...");
    const response = await api.get('/payments/tasker');
    console.log("✅ Get tasker payments success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Get tasker payments failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Return empty data for other errors
    return { success: false, payments: [] };
  }
}

/**
 * 💵 Get Payments for Poster
 * Endpoint: GET /api/payments/poster
 * Auth: Required
 */
export async function getPosterPayments(): Promise<{ success: boolean; payments: any[] }> {
  const api = getApi();
  try {
    console.log("💵 Getting poster payments...");
    const response = await api.get('/payments/poster');
    console.log("✅ Get poster payments success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Get poster payments failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Return empty data for other errors
    return { success: false, payments: [] };
  }
}

/**
 * ❓ Get Task Questions
 * Endpoint: GET /api/tasks/:taskId/questions
 * Auth: No
 */
export async function getTaskQuestions(taskId: string): Promise<{ success: boolean; data: any[] }> {
  const api = getApi();
  try {
    console.log("❓ Getting questions for task:", taskId);
    const response = await api.get(`/tasks/${taskId}/questions`);
    console.log("✅ Get task questions success:", response.data);
    return response.data;
  } catch (error: any) {
    // Only log non-network errors in development
    if (!isNetworkError(error) && __DEV__) {
      console.warn("⚠️ Get task questions failed:", error);
    }
    
    // Handle authentication errors (even though this endpoint doesn't require auth)
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Get questions failed - Authentication issue (401)");
      // Don't throw auth error for GET endpoint, just return empty array
      return { success: false, data: [] };
    }
    
    // Handle not found errors
    if (error?.response?.status === 404) {
      console.log("ℹ️ No questions found for task:", taskId);
      return { success: true, data: [] };
    }
    
    throw error;
  }
}

/**
 * ❓ Post Question on Task
 * Flow: Upload images to CDN first → get URLs → POST /api/tasks/:taskId/questions with image_urls
 * Auth: Required
 */
export async function postTaskQuestion(
  taskId: string, 
  question: string, 
  files?: { uri: string; name: string; type: string }[]
): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("❓ Posting question for task:", taskId, "Files:", files?.length || 0);
    
    // Build request body as JSON
    const requestBody: any = { question };

    // Upload files via CDN upload-safe if provided
    if (files && files.length > 0) {
      console.log(`📸 Uploading ${files.length} question attachment(s) via CDN upload-safe...`);
      const imageUrls = await uploadQuestionAttachments(files, taskId);
      if (imageUrls.length > 0) {
        requestBody.image_urls = imageUrls;
      }
      console.log(`✅ ${imageUrls.length}/${files.length} attachment(s) uploaded to CDN`);
    }
    
    const response = await api.post(`/tasks/${taskId}/questions`, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log("✅ Post task question success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Post task question failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Post question failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle validation errors  
    if (error?.response?.status === 400) {
      console.error("❌ Post question failed - Bad Request (400)");
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid question data";
      throw new Error(`Validation Error: ${errorMessage}`);
    }
    
    throw error;
  }
}

/**
 * 💬 Answer Task Question
 * Flow: Upload images to CDN first → get URLs → POST with image_urls
 * Auth: Required
 */
export async function answerTaskQuestion(
  taskId: string, 
  questionId: string, 
  answer: string,
  files?: { uri: string; name: string; type: string }[]
): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("💬 Answering question:", { taskId, questionId, answer, filesCount: files?.length || 0 });
    
    // Build request body as JSON
    const requestBody: any = { answer };

    // Upload files via CDN upload-safe if provided
    if (files && files.length > 0) {
      console.log(`📸 Uploading ${files.length} answer attachment(s) via CDN upload-safe...`);
      const imageUrls = await uploadQuestionAttachments(files, taskId);
      if (imageUrls.length > 0) {
        requestBody.image_urls = imageUrls;
      }
      console.log(`✅ ${imageUrls.length}/${files.length} attachment(s) uploaded to CDN`);
    }
    
    // Try the primary answer endpoint first
    try {
      const response = await api.post(`/tasks/${taskId}/questions/${questionId}/answer`, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log("✅ Answer task question success:", response.data);
      return response.data;
    } catch (primaryError: any) {
      console.warn("⚠️ Primary answer endpoint failed, trying alternative:", primaryError?.response?.status);
      
      // If 404, try alternative endpoint patterns
      if (primaryError?.response?.status === 404) {
        console.log("🔄 Trying alternative endpoint: PUT /tasks/:taskId/questions/:questionId");
        
        try {
          const altResponse = await api.put(`/tasks/${taskId}/questions/${questionId}`, requestBody, {
            headers: { 'Content-Type': 'application/json' },
          });
          console.log("✅ Answer task question success (alt method):", altResponse.data);
          return altResponse.data;
        } catch {
          console.warn("⚠️ Alternative endpoint also failed, trying PATCH method");
          
          const patchResponse = await api.patch(`/tasks/${taskId}/questions/${questionId}`, requestBody, {
            headers: { 'Content-Type': 'application/json' },
          });
          console.log("✅ Answer task question success (patch method):", patchResponse.data);
          return patchResponse.data;
        }
      } else {
        throw primaryError;
      }
    }
  } catch (error: any) {
    console.error("❌ Answer task question failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Answer task question failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle not found errors
    if (error?.response?.status === 404) {
      console.error("❌ Answer endpoint not found - Question or task may not exist");
      throw new Error("Could not find the question to answer. Please refresh and try again.");
    }
    
    throw error;
  }
}

/**
 * 🌍 Get All Public Questions
 * Endpoint: GET /api/questions/public (aggregated from all tasks)
 * Auth: No - Public questions visible to all users
 */
export async function getAllPublicQuestions(): Promise<{ success: boolean; data: any[] }> {
  const api = getApi();
  try {
    console.log("🌍 Getting all public questions...");
    
    // Try the public questions endpoint first
    try {
      const response = await api.get('/questions/public');
      console.log("✅ Get public questions success:", response.data);
      return response.data;
    } catch (endpointError: any) {
      // If public endpoint doesn't exist, aggregate from tasks
      if (endpointError?.response?.status === 404) {
        console.log("📝 Public questions endpoint not available, aggregating from tasks...");
        
        const tasksResponse = await api.get('/tasks?limit=50');
        const tasks = tasksResponse.data?.data || [];
        
        const allQuestions: any[] = [];
        
        for (const task of tasks) {
          try {
            const questionsResponse = await api.get(`/tasks/${task._id}/questions`);
            const taskQuestions = questionsResponse.data?.data || [];
            
            // Add task context to each question
            const questionsWithContext = taskQuestions.map((q: any) => ({
              ...q,
              taskId: task._id,
              taskTitle: task.title,
              taskLocation: task.location?.address || 'Location not specified',
              taskBudget: task.formattedBudget || `${task.currency} ${task.budget}`,
              taskCategory: task.categories?.[0] || 'General',
              taskCreatedBy: task.createdBy, // Add task creator info
              isPublic: true
            }));
            
            allQuestions.push(...questionsWithContext);
          } catch {
            console.log(`Failed to get questions for task ${task._id}, skipping...`);
          }
        }
        
        // Sort by creation date (newest first)
        allQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log(`✅ Aggregated ${allQuestions.length} public questions from ${tasks.length} tasks`);
        return { success: true, data: allQuestions };
      }
      throw endpointError;
    }
  } catch (error: any) {
    console.error("❌ Get public questions failed:", error);
    
    // Return empty array on failure rather than throwing
    return { success: false, data: [] };
  }
}

/**
 * 👤 Get User Tasks
 * Endpoint: GET /api/tasks/user/:userId
 * Auth: Required
 */
export async function getUserTasks(userId: string): Promise<{ success: boolean; data: Task[] }> {
  const api = getApi();
  try {
    console.log("👤 Getting tasks for user:", userId);
    const response = await api.get(`/tasks/user/${userId}`);
    console.log("✅ Get user tasks success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Get user tasks failed:", error);
    throw error;
  }
}

// ⭐ **PHASE 6: REVIEWS & RATINGS**

/**
 * ⭐ Check if current user can review a task
 * Endpoint: GET /api/tasks/:taskId/can-review
 * Auth: Required
 */
export async function checkCanReview(taskId: string): Promise<{ 
  success: boolean; 
  data: { 
    canReview: boolean; 
    revieweeId?: string;
    revieweeRole?: 'tasker' | 'poster';
    message?: string;
    reason?: string;
    existingReview?: any;
  } 
}> {
  const api = getApi();
  try {
    console.log("⭐ Checking if user can review task:", taskId);
    
    const response = await api.get(`/tasks/${taskId}/can-review`);
    
    console.log("✅ Can review check success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Can review check failed:", error);
    console.error("❌ Error response data:", error?.response?.data);
    throw error;
  }
}

/**
 * ⭐ Submit Review for Task
 * Flow: Upload attachments to CDN first → get URLs → POST with attachment_urls
 * Auth: Required
 */
export async function submitTaskReview(params: {
  taskId: string;
  rating: number;
  reviewText?: string;
  attachments?: any[]; // Array of file objects { uri, name, type }
}): Promise<{ success: boolean; data: any; message?: string }> {
  const api = getApi();
  try {
    console.log("⭐ Submitting review for task:", params.taskId);
    console.log("⭐ Review parameters:", {
      taskId: params.taskId,
      rating: params.rating,
      hasReviewText: !!params.reviewText,
      attachmentsCount: params.attachments?.length || 0
    });
    
    // Build request body as JSON
    const requestBody: any = {
      rating: params.rating,
    };
    
    if (params.reviewText) {
      requestBody.reviewText = params.reviewText;
    }
    
    // Upload attachments via CDN upload-safe if provided
    if (params.attachments && params.attachments.length > 0) {
      console.log(`📎 Uploading ${params.attachments.length} review attachment(s) via CDN upload-safe...`);
      const attachmentUrls = await uploadReviewAttachments(params.attachments, params.taskId);
      if (attachmentUrls.length > 0) {
        requestBody.attachment_urls = attachmentUrls;
      }
      console.log(`✅ ${attachmentUrls.length}/${params.attachments.length} attachment(s) uploaded to CDN`);
    }
    
    console.log("📝 Review request body:", JSON.stringify(requestBody, null, 2));
    
    const response = await api.post(`/tasks/${params.taskId}/reviews`, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log("✅ Submit review success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Submit review failed:", error);
    console.error("❌ Error response data:", error?.response?.data);
    console.error("❌ Error status:", error?.response?.status);
    
    // Extract error message from response
    const errorMessage = error?.response?.data?.error || 
                        error?.response?.data?.message || 
                        error?.message ||
                        'Failed to submit review';
    
    console.error("❌ Final error message:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * ⭐ Get Tasker Reviews
 * Endpoint: GET /api/reviews/tasker
 * Auth: Required
 */
export async function getTaskerReviews(params?: {
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("⭐ Getting tasker reviews with params:", params);
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/reviews/tasker${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("🌐 API URL:", url);
    
    const response = await api.get(url);
    
    console.log("✅ Get tasker reviews RAW response:", JSON.stringify(response.data, null, 2));
    console.log("📊 Reviews count:", response.data?.data?.reviews?.length || 0);
    console.log("📊 Rating stats:", response.data?.data?.ratingStats);
    
    return response.data;
  } catch (error) {
    console.error("❌ Get tasker reviews failed:", error);
    throw error;
  }
}

/**
 * ⭐ Get Poster Reviews
 * Endpoint: GET /api/reviews/poster
 * Auth: Required
 */
export async function getPosterReviews(params?: {
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("⭐ Getting poster reviews with params:", params);
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/reviews/poster${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("🌐 API URL:", url);
    
    const response = await api.get(url);
    
    console.log("✅ Get poster reviews RAW response:", JSON.stringify(response.data, null, 2));
    console.log("📊 Reviews count:", response.data?.data?.reviews?.length || 0);
    console.log("📊 Rating stats:", response.data?.data?.ratingStats);
    
    return response.data;
  } catch (error) {
    console.error("❌ Get poster reviews failed:", error);
    throw error;
  }
}

/**
 * ⭐ Get Reviews for Specific Task
 * Endpoint: GET /api/tasks/:taskId/reviews
 * Auth: Required
 * Returns all reviews for a specific task
 */
export async function getTaskReviews(taskId: string): Promise<{ 
  success: boolean; 
  data: any[] 
}> {
  const api = getApi();
  try {
    console.log("⭐ Getting reviews for task:", taskId);
    
    const response = await api.get(`/tasks/${taskId}/reviews`);
    
    console.log("✅ Get task reviews success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Get task reviews failed:", error);
    throw error;
  }
}

// 🚀 **EXPORT ALL FUNCTIONS**
export const TaskAPI = {
  // Phase 1: Core Features
  getAllTasks,
  getFilteredTasks,
  createTask,
  postTask,
  postTaskWithImages, // New function for binary image upload
  postTaskDirect, // ✅ NEW: Direct posting with exact backend format
  searchTasks,
  filterTasks, // New filter API for Sort/Filter UI
  getMyTasks,
  getMyOffers,
  
  // Categories
  getCategories,
  getCategoriesByLocation,
  
  // Phase 2: Task Management
  getTaskById,
  updateTask,
  updateTaskWithImages, // Update task with image upload support
  deleteTask,
  
  // Phase 3: Offer System
  getTaskOffers,
  getAllOffers,
  createOffer,
  acceptOffer,
  rejectOtherOffers,
  updateOffer,
  deleteOffer,
  
  // Phase 4: Completion Flow
  getTaskCompletionStatus,
  completeTask,
  completeTaskAlt,
  confirmTaskCompletion, // NEW: Poster confirms task completion (PATCH)
  confirmTaskCompletionAlt, // NEW: Poster confirms task completion (PUT)
  getCancellationReasons, // NEW: Get cancellation reasons
  cancelTask, // Legacy: Pre-payment cancellation
  createCancellationRequest, // NEW: Post-payment cancellation request
  getCancellationRequest, // NEW: Get pending cancellation request
  respondToCancellationRequest, // NEW: Accept/Reject cancellation request
  reopenUnservicedTask,
  updateTaskStatus,
  acceptTask,
  
  // Phase 5: Advanced Features
  completePayment,
  getPaymentStatus,
  getTaskerPayments,
  getPosterPayments,
  getTaskQuestions,
  getAllPublicQuestions,
  postTaskQuestion,
  answerTaskQuestion,
  getUserTasks,
  
  // Phase 6: Reviews & Ratings
  checkCanReview,
  submitTaskReview,
  getTaskReviews,
  getTaskerReviews,
  getPosterReviews,
};

export default TaskAPI;