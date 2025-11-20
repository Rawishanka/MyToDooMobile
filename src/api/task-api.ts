// 🎯 **COMPREHENSIVE TASK API INTEGRATION**
// This file contains ALL task-related API endpoints from your API documentation

import { createApi } from "@/src/shared/utils/api";
import { handleAuthenticationError } from '@/src/shared/utils/auth-utils';
import { autoLoginForDevelopment } from '@/src/shared/utils/dev-auth';
import { useAuthStore } from "@/src/store/auth-task-store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
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
          authState.setAuthData(storedToken, user, 3600);
          return { success: true, token: storedToken };
        } catch (e) {
          console.warn("⚠️ Failed to parse stored user, using auto-login");
        }
      }
    }
  } catch (error) {
    console.error("❌ Error accessing AsyncStorage:", error);
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
      console.error("❌ Auto-login failed:", error);
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
    console.error("❌ Error handling auth retry:", error);
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
    console.error("❌ Get categories failed:", error);
    
    // Fallback to predefined categories if API fails
    console.warn("🔄 Using fallback categories due to API error");
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
    console.error("❌ Get categories by location failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Get categories by location failed - Authentication required (401)");
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
      
      // Return combined results
      return {
        ...response.data,
        data: allTasksData,
        count: allTasksData.length,
        total: response.data.total
      };
    }
    
    console.log(`✅ Single page response: ${allTasksData.length} tasks`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Get all tasks failed:", error);
    
    // Check for network connection errors - use mock service as fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn("🎭 Network failed - Using Mock API for getAllTasks");
      return await MockApiService.getAllTasks();
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
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Filter endpoint failed:", error);
    
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
        
        // Last resort: use mock data
        console.warn("🎭 Using Mock API as final fallback");
        const mockResponse = await MockApiService.getAllTasks();
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
 * ➕ Post Task with Binary Images
 * Endpoint: POST /api/tasks/
 * Auth: Required - Enhanced version that handles binary image data in JSON
 */
export async function postTaskWithImages(taskData: CreateTaskRequest, imageUris: string[] = []): Promise<CreateTaskResponse> {
  const api = getApi();
  try {
    console.log("🚀 === POST TASK WITH IMAGES FUNCTION STARTED ===");
    console.log("📤 postTaskWithImages called with:");
    console.log("📤 taskData:", JSON.stringify(taskData, null, 2));
    console.log("📤 imageUris parameter:", JSON.stringify(imageUris, null, 2));
    console.log("📤 imageUris.length:", imageUris.length);
    console.log("📤 imageUris type:", typeof imageUris);
    console.log("📤 imageUris isArray:", Array.isArray(imageUris));
    
    if (imageUris.length > 0) {
      console.log("📤 Processing images - starting conversion to base64...");
    } else {
      console.log("📤 No images to process - imageUris is empty or undefined");
    }
    
    console.log("📤 Posting task with images:", imageUris.length);

    if (imageUris.length > 0) {
      // Convert images to binary data in parallel for better performance
      const imagePromises = imageUris.map(async (uri, i) => {
        const filename = uri.split('/').pop() || `image_${i}.jpg`;
        
        try {
          // Validate the file exists and is accessible
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) {
            throw new Error(`File does not exist: ${uri}`);
          }

          // Read the file as base64 binary data
          const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
          });
          
          // Validate base64 data
          if (!base64Data || base64Data.length === 0) {
            throw new Error(`Failed to read file data: ${filename}`);
          }
          
          const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
          
          let mimeType = 'image/jpeg';
          switch (extension) {
            case 'png':
              mimeType = 'image/png';
              break;
            case 'gif':
              mimeType = 'image/gif';
              break;
            case 'webp':
              mimeType = 'image/webp';
              break;
            default:
              mimeType = 'image/jpeg';
              break;
          }

          // Create data URI with binary data
          const dataUri = `data:${mimeType};base64,${base64Data}`;
          
          console.log(`🖼️ Image ${i + 1} conversion successful:`, {
            filename,
            mimeType,
            originalFileSize: fileInfo.size,
            base64DataLength: base64Data.length,
            dataUriLength: dataUri.length,
            dataUriPreview: `${dataUri.substring(0, 100)}...`
          });
          
          return dataUri;
        } catch (fileError) {
          console.error(`❌ Failed to read image ${i + 1}:`, fileError);
          throw new Error(`Failed to read image ${filename}: ${fileError}`);
        }
      });

      // Wait for all images to be processed in parallel
      const binaryImages = await Promise.all(imagePromises);
      console.log(`✅ Converted ${binaryImages.length} images to base64`);
      
      // VALIDATE ALL IMAGES BEFORE SENDING
      console.log("🔍 Validating converted images...");
      binaryImages.forEach((img, index) => {
        const isValidDataUri = img.startsWith('data:image/') && img.includes(';base64,');
        const base64Part = img.split(';base64,')[1];
        const isValidBase64 = base64Part && base64Part.length > 0;
        
        console.log(`🔍 Image ${index + 1} validation:`, {
          isValidDataUri,
          isValidBase64,
          length: img.length,
          mimeType: img.split(';')[0],
          base64Length: base64Part?.length || 0
        });
        
        if (!isValidDataUri || !isValidBase64) {
          console.error(`❌ Image ${index + 1} is INVALID!`, {
            preview: img.substring(0, 100),
            hasDataPrefix: img.startsWith('data:'),
            hasBase64Marker: img.includes(';base64,')
          });
        }
      });
      
      const imageSizes = binaryImages.map(img => img.length / 1024);
      const totalSizeKB = imageSizes.reduce((sum, size) => sum + size, 0);
      const totalSizeMB = totalSizeKB / 1024;
      
      console.log(`📊 Image data sizes:`, imageSizes.map(size => `${size.toFixed(2)}KB`));
      console.log(`📊 Total payload size: ${totalSizeKB.toFixed(2)}KB (${totalSizeMB.toFixed(2)}MB)`);
      
      // Warn if images might be too large
      if (totalSizeMB > 10) {
        console.warn(`⚠️ WARNING: Total image size is ${totalSizeMB.toFixed(2)}MB - this might exceed backend limits!`);
        console.warn(`⚠️ Consider implementing image compression before upload`);
      }

      // Create enhanced task data with binary images in JSON - EXACTLY like the required format
      const taskDataWithImages = {
        ...taskData,
        images: binaryImages
      };
      
      console.log(`📤 Sending task to backend WITH ${binaryImages.length} images`);
      console.log(`📤 REQUEST BODY - images field:`, {
        imagesCount: taskDataWithImages.images?.length,
        firstImagePreview: taskDataWithImages.images?.[0]?.substring(0, 100),
        imagesSizes: taskDataWithImages.images?.map((img: string) => `${(img.length / 1024).toFixed(2)}KB`)
      });
      console.log(`📤 FULL REQUEST BODY STRUCTURE:`, {
        title: taskDataWithImages.title,
        category: taskDataWithImages.category,
        details: taskDataWithImages.details,
        budget: taskDataWithImages.budget,
        currency: taskDataWithImages.currency,
        dateType: taskDataWithImages.dateType,
        date: taskDataWithImages.date,
        time: taskDataWithImages.time,
        locationType: taskDataWithImages.locationType,
        location: taskDataWithImages.location,
        coordinates: taskDataWithImages.coordinates,
        imagesCount: taskDataWithImages.images?.length,
        imagesPreview: taskDataWithImages.images?.map((img: string) => `${img.substring(0, 50)}...`)
      });
      
      // 🚨 LOG THE COMPLETE REQUEST BODY FOR DEBUGGING
      console.log("🚨 === COMPLETE REQUEST BODY BEING SENT TO BACKEND ===");
      console.log("🚨 Request URL: POST /tasks");
      console.log("🚨 Request Headers:", {
        'Content-Type': 'application/json'
      });
      console.log("🚨 Request Body Size:", JSON.stringify(taskDataWithImages).length, "characters");
      console.log("🚨 Request Body Size:", (JSON.stringify(taskDataWithImages).length / 1024).toFixed(2), "KB");
      console.log("🚨 Request Body Size:", (JSON.stringify(taskDataWithImages).length / 1024 / 1024).toFixed(2), "MB");
      console.log("🚨 FULL REQUEST BODY (COMPLETE):");
      console.log(JSON.stringify(taskDataWithImages, null, 2));
      console.log("🚨 === END OF REQUEST BODY ===");
      
      const response = await api.post('/tasks', taskDataWithImages, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("✅ Task posted successfully - Backend response:");
      console.log("📦 Response status:", response.status);
      console.log("📦 Response headers:", response.headers);
      console.log("📦 Response data (FULL):", JSON.stringify(response.data, null, 2));
      console.log("🖼️ Images in response:", response.data?.data?.images?.length || 0);
      
      // CRITICAL CHECK: Did backend save the images?
      if (binaryImages.length > 0 && (!response.data?.data?.images || response.data.data.images.length === 0)) {
        console.error("🚨 🚨 🚨 CRITICAL: IMAGES WERE SENT BUT NOT SAVED BY BACKEND! 🚨 🚨 🚨");
        console.error("🚨 Sent images count:", binaryImages.length);
        console.error("🚨 Backend saved images count:", response.data?.data?.images?.length || 0);
        console.error("🚨 Full backend response data:", JSON.stringify(response.data, null, 2));
        console.error("🚨 This indicates a BACKEND ISSUE - images are being received but not saved to database!");
        console.error("🚨 Check backend logs for image processing errors!");
      } else if (binaryImages.length > 0 && response.data?.data?.images && response.data.data.images.length > 0) {
        console.log("✅ SUCCESS: Images were properly saved by backend!");
        console.log("✅ Sent:", binaryImages.length, "images");
        console.log("✅ Backend saved:", response.data.data.images.length, "images");
        console.log("✅ Backend image URLs:", response.data.data.images);
      }
      
      return response.data;
    } else {
      // No images, use regular JSON upload
      const response = await api.post('/tasks', taskData);
      console.log("✅ Task posted successfully");
      return response.data;
    }
  } catch (error: any) {
    console.error("❌ Task posting failed:", error?.response?.status);
    console.error("❌ Error details:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
      config: {
        url: error?.config?.url,
        method: error?.config?.method,
        headers: error?.config?.headers,
        dataLength: error?.config?.data?.length
      }
    });
    
    // Check for authentication errors with special handling
    if (error?.response?.status === 401) {
      if (error.isAuthError) {
        throw new Error(error.message || "Authentication expired. Please login again to continue.");
      }
      throw error;
    }
    
    // Check for validation errors  
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid task data";
      console.error("❌ Backend validation error:", errorMessage);
      throw new Error(`Validation Error: ${errorMessage}`);
    }
    
    // Check for file upload errors
    if (error?.response?.status === 413) {
      console.error("❌ Payload too large error - images are too big");
      throw new Error("Images are too large. Please reduce image size and try again.");
    }
    
    // Check for server errors that might indicate image processing issues
    if (error?.response?.status >= 500) {
      console.error("❌ Server error - might be related to image processing");
      console.error("❌ This could indicate backend issues with image handling");
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
    
    // Check for network connection errors - use mock service as fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error("❌ Network connection failed - Using mock service as fallback");
      console.warn("🎭 Switching to Mock API for development");
      return await MockApiService.postTask(taskData);
    }
    
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
 * ⭐ Post Task with Direct Format (Matches Backend JSON exactly)
 * Endpoint: POST /api/tasks/
 * Auth: Required - Sends task data in the exact format backend expects
 */
export async function postTaskDirect(taskDataWithImages: CreateTaskRequest): Promise<CreateTaskResponse> {
  const api = getApi();
  try {
    console.log("🚀 === POST TASK DIRECT (EXACT BACKEND FORMAT) ===");
    console.log("📦 postTaskDirect called with task data:");
    console.log("📦 Request Body Size:", JSON.stringify(taskDataWithImages).length, "characters");
    console.log("📦 Request Body Size:", (JSON.stringify(taskDataWithImages).length / 1024).toFixed(2), "KB");
    console.log("📦 Images included:", taskDataWithImages.images?.length || 0);
    
    if (taskDataWithImages.images && taskDataWithImages.images.length > 0) {
      console.log("🔍 Validating images in task data...");
      taskDataWithImages.images.forEach((img, index) => {
        const isValidDataUri = img.startsWith('data:image/') && img.includes(';base64,');
        const base64Part = img.split(';base64,')[1];
        const isValidBase64 = base64Part && base64Part.length > 0;
        
        console.log(`🔍 Image ${index + 1} validation:`, {
          isValidDataUri,
          isValidBase64,
          length: img.length,
          mimeType: img.split(';')[0],
        });
      });
    }
    
    // 🚨 LOG THE COMPLETE REQUEST BODY FOR DEBUGGING
    console.log("🚨 === COMPLETE REQUEST BODY (DIRECT FORMAT) ===");
    console.log("🚨 Request URL: POST /tasks");
    console.log("🚨 Request Headers:", {
      'Content-Type': 'application/json'
    });
    console.log("🚨 FULL REQUEST BODY (COMPLETE):");
    console.log(JSON.stringify(taskDataWithImages, null, 2));
    console.log("🚨 === END OF REQUEST BODY ===");
    
    const response = await api.post('/tasks', taskDataWithImages, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log("✅ Task posted successfully (DIRECT) - Backend response:");
    console.log("📦 Response status:", response.status);
    console.log("📦 Response data (FULL):", JSON.stringify(response.data, null, 2));
    console.log("🖼️ Images in response:", response.data?.data?.images?.length || 0);
    
    // CRITICAL CHECK: Did backend save the images?
    if (taskDataWithImages.images && taskDataWithImages.images.length > 0 && (!response.data?.data?.images || response.data.data.images.length === 0)) {
      console.error("🚨 🚨 🚨 CRITICAL: IMAGES WERE SENT BUT NOT SAVED BY BACKEND! 🚨 🚨 🚨");
      console.error("🚨 Sent images count:", taskDataWithImages.images.length);
      console.error("🚨 Backend saved images count:", response.data?.data?.images?.length || 0);
      console.error("🚨 This indicates a BACKEND ISSUE - images are being received but not processed correctly!");
    } else if (taskDataWithImages.images && taskDataWithImages.images.length > 0 && response.data?.data?.images && response.data.data.images.length > 0) {
      console.log("✅ SUCCESS: Images were properly saved by backend!");
      console.log("✅ Sent:", taskDataWithImages.images.length, "images");
      console.log("✅ Backend saved:", response.data.data.images.length, "images");
    }
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Task posting failed (DIRECT):", error?.response?.status);
    console.error("❌ Error details:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    
    // Check for authentication errors with special handling
    if (error?.response?.status === 401) {
      if (error.isAuthError) {
        throw new Error(error.message || "Authentication expired. Please login again to continue.");
      }
      throw error;
    }
    
    // Check for validation errors  
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Invalid task data";
      console.error("❌ Backend validation error:", errorMessage);
      throw new Error(`Validation Error: ${errorMessage}`);
    }
    
    // Check for file upload errors
    if (error?.response?.status === 413) {
      console.error("❌ Payload too large error - images are too big");
      throw new Error("Images are too large. Please reduce image size and try again.");
    }
    
    throw error;
  }
}

/**
 * 🔍 Search Tasks
 * Endpoint: GET /api/tasks/search
 * Auth: No
 */
export async function searchTasks(params: TaskSearchParams): Promise<TasksResponse> {
  const api = getApi();
  try {
    console.log("🔍 Searching tasks with params:", params);
    
    // Try multiple GET approaches only (POST is not supported)
    const getApproaches = [
      // Approach 1: Standard search with all parameters
      () => {
        const searchParams = new URLSearchParams();
        
        if (params.search || params.q) {
          searchParams.append('q', params.search || params.q!);
        }
        if (params.category) {
          searchParams.append('category', params.category);
        }
        if (params.categories && params.categories.length > 0) {
          searchParams.append('category', params.categories[0]);
        }
        if (params.location) {
          searchParams.append('location', params.location);
        }
        if (params.minBudget !== undefined && params.minBudget > 0) {
          searchParams.append('minBudget', params.minBudget.toString());
        }
        if (params.maxBudget !== undefined && params.maxBudget < 10000) {
          searchParams.append('maxBudget', params.maxBudget.toString());
        }
        if (params.sort) {
          searchParams.append('sort', params.sort);
        }
        
        searchParams.append('page', '1');
        searchParams.append('limit', '20');
        
        return `/tasks/search?${searchParams.toString()}`;
      },
      
      // Approach 2: Minimal parameters (just sort)
      () => {
        const searchParams = new URLSearchParams();
        if (params.sort) {
          searchParams.append('sort', params.sort);
        } else {
          searchParams.append('sort', 'latest');
        }
        return `/tasks/search?${searchParams.toString()}`;
      },
      
      // Approach 3: Just basic search endpoint without parameters
      () => {
        return `/tasks/search`;
      },
      
      // Approach 4: Fallback to general tasks endpoint
      () => {
        console.log('🔄 Trying general /tasks endpoint as fallback');
        return `/tasks`;
      }
    ];

    // Try each GET approach
    for (let i = 0; i < getApproaches.length; i++) {
      try {
        const url = getApproaches[i]();
        console.log(`🔍 Trying GET approach ${i + 1}:`, url);
        console.log(`🔍 Full endpoint: ${api.defaults.baseURL}${url}`);
        const response = await api.get(url);
        
        console.log("✅ Search tasks success with approach", i + 1, ":", response.data);
        return response.data;
        
      } catch (approachError: any) {
        console.log(`❌ GET Approach ${i + 1} failed:`, approachError.response?.status, approachError.message);
        console.log(`❌ Error response data:`, approachError.response?.data);
        console.log(`❌ Error config:`, approachError.config?.url);
        
        // If this isn't the last approach, try the next one
        if (i < getApproaches.length - 1) {
          continue;
        }
        
        // If all GET approaches failed, throw the last error
        throw approachError;
      }
    }
    
  } catch (error: any) {
    console.error("❌ All search approaches failed:", error);
    console.error("❌ Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Check for network connection errors - use mock service as fallback
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn("🎭 Network failed - Using Mock API for searchTasks");
      return await MockApiService.searchTasks(params);
    }
    
    // Try the filter endpoint as final fallback
    console.warn("🔄 Search API failed completely, trying filter API as final fallback...");
    try {
      const filterParams: TaskFilterParams = {
        sortBy: params.sort as 'latest' | 'newest' | 'oldest' | 'highest-budget' | 'lowest-budget' | 'earliest' | 'price-high' | 'price-low' | undefined,
        categories: params.category,
        search: params.q || params.search,
        minBudget: params.minBudget,
        maxBudget: params.maxBudget,
        locationType: params.location as 'In-person' | 'Online' | undefined,
        page: 1,
        limit: 20
      };
      const filterResult = await getFilteredTasks(filterParams);
      console.log("✅ Filter API fallback succeeded");
      
      // Convert TaskFilterResponse to TasksResponse
      const tasksResponse: TasksResponse = {
        success: filterResult.success,
        count: filterResult.data.length,
        total: filterResult.pagination.totalItems,
        pages: filterResult.pagination.totalPages,
        currentPage: filterResult.pagination.currentPage,
        data: filterResult.data
      };
      
      return tasksResponse;
    } catch (filterError) {
      console.error("❌ Filter API fallback also failed:", filterError);
      console.warn("🎭 Using Mock API as final fallback");
      return await MockApiService.searchTasks(params);
    }
  }
  
  // This should never be reached due to the try-catch structure above
  throw new Error("All search approaches failed");
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
        
        return filterResponse;
      } 
      // This is already a filter response
      else if ('pagination' in response.data) {
        console.log("✅ Filter API succeeded", {
          totalItems: response.data.pagination?.totalItems,
          currentPage: response.data.pagination?.currentPage,
          totalPages: response.data.pagination?.totalPages,
        });
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
        
        return filterResponse;
      }
    } else {
      console.warn("⚠️ API returned unsuccessful response");
      throw new Error("API returned unsuccessful response");
    }

  } catch (error: any) {
    console.error("❌ Filter API failed:", {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    });
    
    // Check for backend routing conflict (ObjectId casting error)
    if (error?.response?.status === 500 && 
        (error?.response?.data?.message?.includes('Cast to ObjectId failed') ||
         error?.response?.data?.message?.includes('filter'))) {
      console.error('🚨 BACKEND ROUTING CONFLICT: /tasks/filter is being treated as /tasks/:id');
      console.error('Backend needs: router.get("/filter", ...) BEFORE router.get("/:id", ...)');
    }
    
    // Only fallback to mock if we actually have an error that prevents getting data
    if (error?.response?.status || error?.message?.includes('failed')) {
      console.warn("🎭 Using Mock API for filterTasks due to API failure");
      try {
        const mockResponse = await MockApiService.filterTasks(params);
        console.log("✅ Mock API succeeded", {
          totalItems: mockResponse.pagination?.totalItems,
          dataLength: mockResponse.data?.length
        });
        return mockResponse;
      } catch (mockError) {
        console.error("❌ Mock API also failed for filterTasks:", mockError);
        
        // Final fallback: return empty successful response
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
      
      // Check if we got actual data, if not fall back to general endpoint
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      } else {
        console.log("📝 my-tasks endpoint returned empty data, using general tasks endpoint");
        throw new Error("Empty data from my-tasks endpoint");
      }
    } catch (myTasksError) {
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
    
    console.error("❌ Get my tasks failed:", error);
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
    
    // Try my-offers endpoint first, fallback to general tasks endpoint
    try {
      const searchParams = new URLSearchParams();
      if (params?.section) searchParams.append('section', params.section);
      
      const response = await api.get(`/tasks/my-offers?${searchParams.toString()}`);
      console.log("✅ Get my offers response:", response.data);
      
      // Check if we got actual data, if not fall back to general endpoint
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      } else {
        console.log("📝 my-offers endpoint returned empty data, using general tasks endpoint");
        throw new Error("Empty data from my-offers endpoint");
      }
    } catch (myOffersError) {
      console.log("📝 my-offers endpoint not available or empty, using general tasks endpoint");
      // Fallback to general tasks endpoint - use getAllTasks function
      const tasksResponse = await getAllTasks();
      console.log("✅ Get my offers fallback success:", { success: true, data: tasksResponse.data });
      return { success: true, data: tasksResponse.data };
    }
  } catch (error) {
    console.error("❌ Get my offers failed:", error);
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
    
    // Enhanced logging for image debugging
    const taskData = response.data?.data;
    console.log("🔍 === TASK FETCH IMAGE DEBUG ===");
    console.log("🔍 Response status:", response.status);
    console.log("🔍 Response has data:", !!response.data);
    console.log("🔍 Response.data has data:", !!response.data?.data);
    console.log("🔍 Task ID:", taskId);
    console.log("🔍 Task title:", taskData?.title || 'No title');
    console.log("🔍 Task created at:", taskData?.createdAt || 'No date');
    console.log("🔍 TASK DATA STRUCTURE:", {
      hasData: !!taskData,
      hasImages: !!taskData?.images,
      imagesLength: taskData?.images?.length || 0,
      imagesType: typeof taskData?.images,
      isArray: Array.isArray(taskData?.images),
      allKeys: taskData ? Object.keys(taskData) : 'No data'
    });
    
    // CRITICAL: Log the exact images field value
    console.log("🔍 === EXACT IMAGES FIELD ANALYSIS ===");
    console.log("🔍 taskData.images exact value:", taskData?.images);
    console.log("🔍 taskData.images JSON:", JSON.stringify(taskData?.images, null, 2));
    console.log("🔍 taskData.images stringified:", String(taskData?.images));
    console.log("🔍 === END EXACT IMAGES ANALYSIS ===");
    
    // Check if images exist in different possible fields
    const possibleImageFields = ['images', 'image', 'photos', 'pictures', 'attachments', 'files'];
    possibleImageFields.forEach(field => {
      if (taskData?.[field]) {
        console.log(`🔍 Found ${field} field:`, {
          type: typeof taskData[field],
          isArray: Array.isArray(taskData[field]),
          length: taskData[field]?.length,
          value: Array.isArray(taskData[field]) ? taskData[field].slice(0, 2) : taskData[field]
        });
      }
    });
    
    if (taskData?.images && taskData.images.length > 0) {
      console.log("🖼️ === IMAGES DETAILED ANALYSIS ===");
      taskData.images.forEach((img: any, index: number) => {
        console.log(`📸 Image ${index + 1}/${taskData.images.length}:`, {
          type: typeof img,
          isString: typeof img === 'string',
          isObject: typeof img === 'object',
          length: typeof img === 'string' ? img.length : 'N/A',
          preview: typeof img === 'string' ? img.substring(0, 100) + '...' : 'Not string',
          keys: typeof img === 'object' ? Object.keys(img) : 'N/A',
          hasUrl: typeof img === 'object' && img?.url,
          hasData: typeof img === 'object' && img?.data,
          isDataUri: typeof img === 'string' && img.startsWith('data:'),
          isHttpUri: typeof img === 'string' && img.startsWith('http'),
          fullObject: typeof img === 'object' ? JSON.stringify(img, null, 2) : 'N/A'
        });
      });
      
      console.log("🔍 === RAW IMAGES ARRAY (FULL) ===");
      console.log(JSON.stringify(taskData.images, null, 2));
      console.log("🔍 === END RAW IMAGES ===");
    } else {
      console.error("🚨 ❌ ❌ ❌ CRITICAL: Backend returned NO IMAGES! ❌ ❌ ❌ 🚨");
      console.error("🚨 This means one of the following:");
      console.error("🚨 1. Images were not saved to database during task creation");
      console.error("🚨 2. Images are saved but not returned in API response"); 
      console.error("🚨 3. Images are in a different field than 'images'");
      console.error("🚨 4. Database/backend issue with image storage");
      
      if (taskData?.images && Array.isArray(taskData.images) && taskData.images.length === 0) {
        console.error("🚨 CONFIRMED: Images field exists but is EMPTY ARRAY []");
        console.error("🚨 This specifically means images were not saved during task creation");
      }
      
      console.error("🚨 Check backend logs to see if images were received during task posting");
      console.error("🚨 Full task data keys:", taskData ? Object.keys(taskData) : 'No data');
    }
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Get task details failed:", {
      taskId,
      status: error?.response?.status,
      message: error?.message,
      data: error?.response?.data
    });
    
    // Handle 400 errors - bad request (invalid task ID, etc.)
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || `Invalid task ID or task not found: ${taskId}`;
      console.error("❌ Get task details failed - Bad request (400):", errorMessage);
      throw new Error(errorMessage);
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Get task details failed - Authentication required (401)");
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
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Update task failed - Full error details:");
    console.error("   - Error message:", error?.message);
    console.error("   - HTTP status:", error?.response?.status);
    console.error("   - Response data:", JSON.stringify(error?.response?.data, null, 2));
    console.error("   - Request URL:", error?.config?.url);
    console.error("   - Request method:", error?.config?.method);
    console.error("   - Request payload:", JSON.stringify(updates, null, 2));
    
    // Handle validation errors (400)
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error;
      console.error("❌ Update task failed - Validation error (400):", errorMessage);
      throw new Error(errorMessage || "Invalid task data. Please check your inputs.");
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Update task failed - Authentication required (401)");
      
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
      console.error("❌ Update task failed - Task not found (404)");
      throw new Error("Task not found. It may have been deleted.");
    }
    
    // Handle permission denied errors
    if (error?.response?.status === 403) {
      console.error("❌ Update task failed - Permission denied (403)");
      throw new Error("You don't have permission to update this task.");
    }
    
    // Handle server errors
    if (error?.response?.status >= 500) {
      console.error("❌ Update task failed - Server error:", error?.response?.status);
      console.warn("🔄 Server error detected, using development fallback");
      
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
    console.error("❌ Update task failed with unexpected error:", error?.message);
    
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
 * 🗑️ Delete Task
 * Endpoint: DELETE /api/tasks/:id
 * Auth: Required
 */
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
    console.error("❌ Delete task failed - Full error details:");
    console.error("   - Error message:", error?.message);
    console.error("   - HTTP status:", error?.response?.status);
    console.error("   - Response data:", error?.response?.data);
    console.error("   - Request URL:", error?.config?.url);
    console.error("   - Request method:", error?.config?.method);
    console.error("   - Request headers:", error?.config?.headers);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Delete task failed - Authentication required (401)");
      
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
      console.error("❌ Delete task failed - Permission denied (403)");
      return {
        success: false,
        message: "You don't have permission to delete this task."
      };
    }
    
    if (error?.response?.status >= 500) {
      console.error("❌ Delete task failed - Server error:", error?.response?.status);
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
    console.error("❌ Get task offers failed:", error);
    
    // Handle authentication errors - return empty offers instead of throwing
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.warn("⚠️ Get task offers failed - Authentication required, returning empty offers");
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
    console.error("❌ Create offer failed:", error);
    console.error("❌ Error details:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error.message,
      requestData: offerData
    });
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Create offer failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle validation errors (400 Bad Request)
    if (error?.response?.status === 400) {
      console.error("❌ Create offer failed - Bad Request (400)");
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
 */
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
    try {
      const response = await api.post(`/tasks/${taskId}/offers/${offerId}/accept`, {});
      console.log("✅ Accept offer success:", response.data);
      return response.data;
    } catch (acceptError: any) {
      console.log("⚠️ Accept endpoint failed with empty body, trying with user data:", {
        status: acceptError?.response?.status,
        data: acceptError?.response?.data,
        message: acceptError.message
      });
      
      // If empty body fails, try with minimal user data
      if (acceptError?.response?.status === 500 || acceptError?.response?.status === 400) {
        console.log("🔄 Trying with minimal user data");
        const requestBody = {
          role: "poster",
          userId: userId || ""
        };
        
        try {
          const retryResponse = await api.post(`/tasks/${taskId}/offers/${offerId}/accept`, requestBody);
          console.log("✅ Accept offer success with user data:", retryResponse.data);
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
        role: "poster",
        userId: userId || "",
        serviceType: taskCategory ? mapCategoryToServiceType(taskCategory) : undefined
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
    console.error("❌ Update offer failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Update offer failed - Authentication required (401)");
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
          
          // Transform offers to include task information
          const enrichedOffers = taskOffers.map((offer: any) => ({
            _id: offer._id,
            taskId: {
              _id: task._id,
              title: task.title,
              categories: task.categories || []
            },
            taskCreatorId: task.createdBy || offer.taskCreatorId,
            taskTakerId: offer.taskTakerId,
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
    console.error("❌ Get all offers failed:", error);
    
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
    console.error("❌ Get completion status failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Get completion status failed - Authentication required (401)");
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
    const response = await api.patch(`/tasks/${taskId}/complete`);
    console.log("✅ Complete task success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Complete task failed:", error);
    console.error("❌ Error response:", error?.response?.data);
    console.error("❌ Error status:", error?.response?.status);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Complete task failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle 400 Bad Request with backend message
    if (error?.response?.status === 400) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      console.error("❌ Complete task failed - Bad Request (400):", backendMessage);
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
    console.error("❌ Complete task (alt) failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Complete task (alt) failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
  }
}

/**
 * ❌ Cancel Task
 * Endpoint: PUT /api/tasks/:taskId/cancel
 * Auth: Required
 */
export async function cancelTask(taskId: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("❌ Canceling task:", taskId);
    const response = await api.put(`/tasks/${taskId}/cancel`);
    console.log("✅ Cancel task success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Cancel task failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Cancel task failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
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
    console.error("❌ Get payment status failed:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Get payment status failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw error;
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
    console.error("❌ Get task questions failed:", error);
    
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
 * Endpoint: POST /api/tasks/:taskId/questions
 * Auth: Required
 */
export async function postTaskQuestion(taskId: string, question: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("❓ Posting question for task:", taskId, question);
    const response = await api.post(`/tasks/${taskId}/questions`, { question });
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
 * Endpoint: POST /api/tasks/:taskId/questions/:questionId/answer
 * Auth: Required
 */
export async function answerTaskQuestion(taskId: string, questionId: string, answer: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("💬 Answering question:", { taskId, questionId, answer });
    
    // Try the primary answer endpoint first
    try {
      const response = await api.post(`/tasks/${taskId}/questions/${questionId}/answer`, { answer });
      console.log("✅ Answer task question success:", response.data);
      return response.data;
    } catch (primaryError: any) {
      console.warn("⚠️ Primary answer endpoint failed, trying alternative:", primaryError?.response?.status);
      
      // If 404, try alternative endpoint patterns
      if (primaryError?.response?.status === 404) {
        console.log("🔄 Trying alternative endpoint: PUT /tasks/:taskId/questions/:questionId");
        
        try {
          // Try updating the question directly with answer
          const altResponse = await api.put(`/tasks/${taskId}/questions/${questionId}`, { 
            answer,
            status: 'answered',
            answeredAt: new Date().toISOString()
          });
          console.log("✅ Answer task question success (alt method):", altResponse.data);
          return altResponse.data;
        } catch (altError: any) {
          console.warn("⚠️ Alternative endpoint also failed, trying PATCH method");
          
          // Try PATCH method as final fallback
          const patchResponse = await api.patch(`/tasks/${taskId}/questions/${questionId}`, { 
            answer,
            status: 'answered',
            answeredAt: new Date().toISOString()
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
          } catch (taskQuestionError) {
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
  deleteTask,
  
  // Phase 3: Offer System
  getTaskOffers,
  getAllOffers,
  createOffer,
  acceptOffer,
  updateOffer,
  
  // Phase 4: Completion Flow
  getTaskCompletionStatus,
  completeTask,
  completeTaskAlt,
  cancelTask,
  updateTaskStatus,
  acceptTask,
  
  // Phase 5: Advanced Features
  completePayment,
  getPaymentStatus,
  getTaskQuestions,
  getAllPublicQuestions,
  postTaskQuestion,
  answerTaskQuestion,
  getUserTasks,
};

export default TaskAPI;