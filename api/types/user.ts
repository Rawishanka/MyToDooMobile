export interface User {
  _id: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password?: string; // Should not be exposed to frontend
  skills?: string[];
  rating?: number;
  completedTasks?: number;
  isVerified?: boolean;
  verified?: boolean;
  role: string;
  verification?: {
    ratifyId?: {
      status?: string | null;
    };
  };
  profilePicture?: string;
  location?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  expiresIn: number;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}