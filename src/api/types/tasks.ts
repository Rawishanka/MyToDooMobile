// // 🎯 **CORE TASK INTERFACE**
// export interface Task {
//   _id: string;
//   title: string;
//   categories: string[];
//   dateType: string;
//   dateRange: {
//     start: string;
//     end: string;
//     };
//   time: string;
//   location: {
//     address: string;
//     coordinates: {
//       type: string;
//       coordinates: [number, number];
//     } | {};
//   };
//   details: string;
//   budget: number;
//   currency: string;
//   images: string[];
//   status: string;
//   createdBy: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     rating: number;
//     email?: string;
//     name?: string;
//     verified?: boolean;
//   };
//   statusHistory: any[];
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
//   offerCount?: number;
//   offers?: TaskOffer[];
  
//   // Extended fields from API responses
//   formattedDate?: string;
//   formattedBudget?: string;
//   formattedTaskBudget?: string;
//   taskBudget?: number;
//   taskCurrency?: string;
//   taskCurrencyInfo?: CurrencyInfo;
//   currencyInfo?: CurrencyInfo;
//   budgetInfo?: CurrencyInfo;
//   canComplete?: boolean;
//   completionButtonText?: string | null;
//   completionAction?: string | null;
//   userRole?: string;
//   showCompleteButton?: boolean;
//   showCancelButton?: boolean;
//   actions?: TaskActions;
// }

// // 💰 **CURRENCY INFO INTERFACE**
// export interface CurrencyInfo {
//   amount: number;
//   currency: string;
//   formatted: string;
// }

// // ⚡ **TASK ACTIONS INTERFACE**
// export interface TaskActions {
//   canComplete: boolean;
//   canCancel: boolean;
//   canEdit: boolean;
//   canView: boolean;
// }

// // 🔥 **TASK OFFER INTERFACE**
// export interface TaskOffer {
//   _id: string;
//   taskId: string;
//   taskCreatorId: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//   };
//   taskTakerId: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     rating: number;
//   };
//   offer: {
//     amount: number;
//     currency: string;
//     message: string;
//   };
//   status: string;
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
// }

// // 📝 **CREATE TASK REQUEST**
// export interface CreateTaskRequest {
//   title: string;
//   category: string[];
//   dateType: string;
//   dateRange?: {
//     start: string;
//     end: string;
//   };
//   time: string;
//   location: string;
//   details: string;
//   budget: number;
//   currency: string;
//   images?: string[];
//   coordinates?: {
//     lat: number;
//     lng: number;
//   };
// }

// // 🔄 **UPDATE TASK REQUEST**
// export interface UpdateTaskRequest {
//   title?: string;
//   details?: string;
//   budget?: number;
//   status?: string;
//   category?: string[];
//   dateType?: string;
//   time?: string;
//   location?: string;
//   currency?: string;
//   images?: string[];
//   coordinates?: {
//     lat: number;
//     lng: number;
//   };
// }

// // 💫 **CREATE OFFER REQUEST**
// export interface CreateOfferRequest {
//   amount: number;
//   message: string;
// }

// // 🔍 **SEARCH PARAMS**
// export interface TaskSearchParams {
//   search?: string;
//   categories?: string[];
//   location?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   filters?: string[];
//   sort?: string;
// }

// // 📊 **API RESPONSES**
// export interface TasksResponse {
//   success: boolean;
//   count: number;
//   total: number;
//   pages: number;
//   currentPage: number;
//   data: Task[];
// }

// export interface SingleTaskResponse {
//   success: boolean;
//   data: Task;
//   user?: {
//     _id: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     phone: string;
//     password: string;
//     skills: string[];
//     rating: number;
//     completedTasks: number;
//     isVerified: boolean;
//     verified: boolean;
//     role: string;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
//   };
// }

// export interface TaskOffersResponse {
//   success: boolean;
//   data: Task & {
//     offers: TaskOffer[];
//     offerCount: number;
//   };
// }

// export interface CreateTaskResponse {
//   success: boolean;
//   data: Task;
// }

// export interface CreateOfferResponse {
//   success: boolean;
//   data: TaskOffer;
// }

// export interface TaskCompletionStatusResponse {
//   success: boolean;
//   data: {
//     taskId: string;
//     status: string;
//     canComplete: boolean;
//     completionButtonText: string | null;
//     userRole: string;
//   };
// }

// export interface PaymentStatusResponse {
//   success: boolean;
//   data: any[];
// }

// // 📋 **MY TASKS PARAMS**
// export interface MyTasksParams {
//   section?: string;
//   subsection?: string;
//   role?: string;
// }

// 🎯 *CORE TASK INTERFACE*
export interface Task {
  _id: string;
  title: string;
  categories: string[];
  dateType: string;
  dateRange: {
    start: string;
    end: string;
    };
  time: string;
  location: {
    address: string;
    coordinates: {
      type: string;
      coordinates: [number, number];
    } | {};
  };
  details: string;
  budget: number;
  currency: string;
  images: string[];
  status: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
    email?: string;
    name?: string;
    verified?: boolean;
    avatar?: string; // Base64 image data
    profilePicture?: string;
  };
  statusHistory: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  offerCount?: number;
  offers?: TaskOffer[];
  
  // Extended fields from API responses
  formattedDate?: string;
  formattedBudget?: string;
  formattedTaskBudget?: string;
  taskBudget?: number;
  taskCurrency?: string;
  taskCurrencyInfo?: CurrencyInfo;
  currencyInfo?: CurrencyInfo;
  budgetInfo?: CurrencyInfo;
  canComplete?: boolean;
  completionButtonText?: string | null;
  completionAction?: string | null;
  userRole?: string;
  showCompleteButton?: boolean;
  showCancelButton?: boolean;
  actions?: TaskActions;
}

// 💰 *CURRENCY INFO INTERFACE*
export interface CurrencyInfo {
  amount: number;
  currency: string;
  formatted: string;
}

// ⚡ *TASK ACTIONS INTERFACE*
export interface TaskActions {
  canComplete: boolean;
  canCancel: boolean;
  canEdit: boolean;
  canView: boolean;
}

// 🔥 *TASK OFFER INTERFACE*
export interface TaskOffer {
  _id: string;
  taskId: string;
  taskCreatorId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  taskTakerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
  };
  // Alternative structure used by the API
  taskTaker?: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
    avatar?: string;
    name?: string;
    completedTasks?: number;
  };
  // Nested offer structure
  offer?: {
    amount: number;
    currency: string;
    message: string;
  };
  // Direct properties (alternative structure)
  amount?: number;
  currency?: string;
  message?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// 📝 *CREATE TASK REQUEST*
export interface CreateTaskRequest {
  title: string;
  category: string; // ✅ Backend expects singular 'category' as string
  dateType: string;
  date?: string; // ✅ Added date field for backend
  dateRange?: {
    start: string;
    end: string;
  };
  time: string;
  location: string; // ✅ MUST be string - backend expects location.trim()
  coordinates?: {
    lat: number;
    lng: number;
  }; // ✅ Separate coordinates field - FIXED: Use lat/lng to match backend
  locationType?: 'In-person' | 'Online' | 'Both'; // ✅ Added locationType field
  details: string; // ✅ Backend expects 'details' not 'description'
  budget: number;
  currency: string;
  images?: string[];
  
  // ✅ Moving task specific fields
  isMovingTask?: boolean;
  movingDetails?: {
    pickupLocation: {
      address: string;
      postalCode?: string;
    };
    dropoffLocation: {
      address: string;
      postalCode?: string;
    };
  };
}

// 🔄 *UPDATE TASK REQUEST* - Matches PUT /api/tasks/:id endpoint
export interface UpdateTaskRequest {
  title?: string;
  details?: string; // Backend expects 'details' not 'description' (confirmed from API responses)
  budget?: number;
  currency?: string;
  time?: string;
  date?: string; // ISO date string (YYYY-MM-DD)
  dateType?: 'Easy' | 'DoneBy' | 'DoneOn'; // Backend expects: Easy, DoneBy, DoneOn
  location?: {
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // GeoJSON format: [longitude, latitude]
    };
  };
  status?: string;
  category?: string; // Backend expects singular 'category' as string
  locationType?: 'In-person' | 'Online' | 'Both';
  images?: string[];
}

// 💫 *CREATE OFFER REQUEST*
export interface CreateOfferRequest {
  amount: number;
  currency?: string;
  message: string;
}

// 🔍 *SEARCH PARAMS* (for /tasks/search endpoint)
export interface TaskSearchParams {
  q?: string;              // Search query parameter as per API spec
  category?: string;       // Single category parameter as per API spec  
  location?: string;
  minBudget?: number;      // minBudget parameter as per API spec
  maxBudget?: number;      // maxBudget parameter as per API spec
  filters?: string[];
  sort?: string;
  status?: string | string[];
  // Legacy support for existing code
  search?: string;         // Will be mapped to 'q'
  categories?: string[];   // Will be mapped to 'category'
  minPrice?: number;       // Will be mapped to 'minBudget'
  maxPrice?: number;       // Will be mapped to 'maxBudget'
}

// 🎯 *TASK FILTER PARAMS* (for /tasks/filter endpoint)
export interface TaskFilterParams {
  sortBy?: 'price-high' | 'price-low' | 'price-high-to-low' | 'price-low-to-high' | 'highest-budget' | 'lowest-budget' | 'earliest' | 'latest' | 'newest' | 'oldest' | 'nearest' | 'closest';
  lat?: number;
  lng?: number;
  radius?: number;
  categories?: string; // Comma-separated category names
  minBudget?: number;
  maxBudget?: number;
  status?: 'open' | 'todo' | 'done' | 'completed' | 'cancelled' | 'expired' | 'overdue';
  locationType?: 'In-person' | 'Online';
  search?: string;
  page?: number;
  limit?: number;
}

// 📊 *API RESPONSES*
export interface TasksResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: Task[];
}

// 🎯 *TASK FILTER RESPONSE* (for /tasks/filter endpoint)
export interface TaskFilterResponse {
  success: boolean;
  data: Task[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SingleTaskResponse {
  success: boolean;
  data: Task;
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    skills: string[];
    rating: number;
    completedTasks: number;
    isVerified: boolean;
    verified: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface TaskOffersResponse {
  success: boolean;
  data: Task & {
    offers: TaskOffer[];
    offerCount: number;
  };
}

export interface CreateTaskResponse {
  success: boolean;
  data: Task;
}

export interface CreateOfferResponse {
  success: boolean;
  data: TaskOffer;
}

export interface AllOffersResponse {
  success: boolean;
  data: {
    _id: string;
    taskId: {
      _id: string;
      title: string;
      categories: string[];
    };
    taskCreatorId: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    taskTakerId: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      rating?: number;
      completedTasks?: number;
      completionRate?: string;
    };
    offer: {
      amount: number;
      currency: string;
      message: string;
    };
    status: string;
    createdAt: string;
    updatedAt?: string;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TaskCompletionStatusResponse {
  success: boolean;
  data: {
    taskId: string;
    status: string;
    canComplete: boolean;
    completionButtonText: string | null;
    userRole: string;
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  data: any[];
}

// 📋 *MY TASKS PARAMS*
export interface MyTasksParams {
  section?: string;
  subsection?: string;
  role?: string;
}