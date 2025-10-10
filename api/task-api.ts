// 🎯 **COMPREHENSIVE TASK API INTEGRATION**
// This file contains ALL task-related API endpoints from your API documentation

import { createApi } from "@/utils/api";
import API_CONFIG from "./config";
import { 
  Task, 
  TasksResponse, 
  SingleTaskResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  TaskOffersResponse,
  CreateOfferRequest,
  CreateOfferResponse,
  TaskSearchParams,
  MyTasksParams,
  TaskCompletionStatusResponse,
  PaymentStatusResponse
} from "./types/tasks";

// 🔧 **API HELPER FUNCTION**
function getApi() {
  const baseUrl = API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'undefined'
    ? API_CONFIG.BASE_URL
    : "http://192.168.8.135:5001/api";
  return createApi(baseUrl);
}

// 🌟 **PHASE 1: CORE TASK FEATURES**

/**
 * 📋 Get All Tasks (Browse/Discover)
 * Endpoint: GET /api/tasks/
 * Auth: No
 */
export async function getAllTasks(): Promise<TasksResponse> {
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
  } catch (error) {
    console.error("❌ Get all tasks failed:", error);
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
    const response = await api.post('/tasks', taskData);
    console.log("✅ Create task success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Create task failed:", error);
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
 * 🔍 Search Tasks
 * Endpoint: GET /api/tasks/search
 * Auth: No
 */
export async function searchTasks(params: TaskSearchParams): Promise<TasksResponse> {
  const api = getApi();
  try {
    console.log("🔍 Searching tasks with params:", params);
    
    // Build query string
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.categories) searchParams.append('categories', params.categories.join(','));
    if (params.location) searchParams.append('location', params.location);
    if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.filters) {
      params.filters.forEach(filter => searchParams.append('filters', filter));
    }
    if (params.sort) searchParams.append('sort', params.sort);
    
    const response = await api.get(`/tasks/search?${searchParams.toString()}`);
    console.log("✅ Search tasks success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Search tasks failed:", error);
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
    console.log("✅ Get task details success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Get task details failed:", error);
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
    console.log("✏️ Updating task:", taskId, updates);
    const response = await api.put(`/tasks/${taskId}`, updates);
    console.log("✅ Update task success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Update task failed:", error);
    throw error;
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
    console.log("🗑️ Deleting task:", taskId);
    const response = await api.delete(`/tasks/${taskId}`);
    console.log("✅ Delete task success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Delete task failed:", error);
    throw error;
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
    console.log("✅ Get task offers success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Get task offers failed:", error);
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
    const response = await api.post(`/tasks/${taskId}/offers`, offerData);
    console.log("✅ Create offer success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Create offer failed:", error);
    throw error;
  }
}

/**
 * ✅ Accept Offer
 * Endpoint: POST /api/tasks/:taskId/offers/:offerId/accept
 * Auth: Required
 */
export async function acceptOffer(taskId: string, offerId: string): Promise<{ success: boolean; data: any }> {
  const api = getApi();
  try {
    console.log("✅ Accepting offer:", { taskId, offerId });
    const response = await api.post(`/tasks/${taskId}/offers/${offerId}/accept`);
    console.log("✅ Accept offer success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Accept offer failed:", error);
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
  } catch (error) {
    console.error("❌ Update offer failed:", error);
    throw error;
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
  } catch (error) {
    console.error("❌ Get completion status failed:", error);
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
  } catch (error) {
    console.error("❌ Complete task failed:", error);
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
  } catch (error) {
    console.error("❌ Complete task (alt) failed:", error);
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
  } catch (error) {
    console.error("❌ Cancel task failed:", error);
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
  } catch (error) {
    console.error("❌ Update task status failed:", error);
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
  } catch (error) {
    console.error("❌ Accept task failed:", error);
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
  } catch (error) {
    console.error("❌ Complete payment failed:", error);
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
  } catch (error) {
    console.error("❌ Get payment status failed:", error);
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
  } catch (error) {
    console.error("❌ Get task questions failed:", error);
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
  } catch (error) {
    console.error("❌ Post task question failed:", error);
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
    const response = await api.post(`/tasks/${taskId}/questions/${questionId}/answer`, { answer });
    console.log("✅ Answer task question success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Answer task question failed:", error);
    throw error;
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
  createTask,
  postTask,
  searchTasks,
  getMyTasks,
  getMyOffers,
  
  // Phase 2: Task Management
  getTaskById,
  updateTask,
  deleteTask,
  
  // Phase 3: Offer System
  getTaskOffers,
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
  postTaskQuestion,
  answerTaskQuestion,
  getUserTasks,
};

export default TaskAPI;