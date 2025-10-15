// 🎯 **CORE TASK INTERFACE**
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

// 💰 **CURRENCY INFO INTERFACE**
export interface CurrencyInfo {
  amount: number;
  currency: string;
  formatted: string;
}

// ⚡ **TASK ACTIONS INTERFACE**
export interface TaskActions {
  canComplete: boolean;
  canCancel: boolean;
  canEdit: boolean;
  canView: boolean;
}

// 🔥 **TASK OFFER INTERFACE**
export interface TaskOffer {
  _id: string;
  taskId: string;
  taskCreatorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  taskTakerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
  };
  offer: {
    amount: number;
    currency: string;
    message: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// 📝 **CREATE TASK REQUEST**
export interface CreateTaskRequest {
  title: string;
  category: string[];
  dateType: string;
  dateRange?: {
    start: string;
    end: string;
  };
  time: string;
  location: string;
  details: string;
  budget: number;
  currency: string;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// 🔄 **UPDATE TASK REQUEST**
export interface UpdateTaskRequest {
  title?: string;
  details?: string;
  budget?: number;
  status?: string;
  category?: string[];
  dateType?: string;
  time?: string;
  location?: string;
  currency?: string;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// 💫 **CREATE OFFER REQUEST**
export interface CreateOfferRequest {
  amount: number;
  message: string;
}

// 🔍 **SEARCH PARAMS**
export interface TaskSearchParams {
  search?: string;
  categories?: string[];
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  filters?: string[];
  sort?: string;
}

// 📊 **API RESPONSES**
export interface TasksResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: Task[];
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

// 📋 **MY TASKS PARAMS**
export interface MyTasksParams {
  section?: string;
  subsection?: string;
  role?: string;
}