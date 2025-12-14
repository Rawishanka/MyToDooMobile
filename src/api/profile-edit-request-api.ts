// API functions for profile edit request management
import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

// ==========================================
// TYPES
// ==========================================

export interface ProfileEditRequestData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    suburb?: string;
  };
  bio?: string;
}

export interface ProfileEditRequestResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

export interface ProfileEditStatusData {
  hasPendingRequest: boolean;
  canEdit: boolean;
  request?: {
    requestId: string;
    requestedChanges: ProfileEditRequestData;
    createdAt: string;
    expiresAt: string;
  };
}

export interface ProfileEditStatusResponse {
  success: boolean;
  data: ProfileEditStatusData;
}

export interface ProfileEditHistoryItem {
  requestId: string;
  requestedChanges: ProfileEditRequestData;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
}

export interface ProfileEditHistoryResponse {
  success: boolean;
  data: ProfileEditHistoryItem[];
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Submit a profile edit request for admin approval
 * @param requestData - Profile fields to be edited
 * @returns Promise with request submission response
 */
export async function submitProfileEditRequest(
  requestData: ProfileEditRequestData
): Promise<ProfileEditRequestResponse> {
  try {
    console.log('📡 [Profile Edit API] Submitting request to /users/profile-edit/request');
    console.log('📡 [Profile Edit API] Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await api.post<ProfileEditRequestResponse>(
      '/users/profile-edit/request',
      requestData
    );
    
    console.log('✅ [Profile Edit API] Response received:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('❌ [Profile Edit API] Error submitting profile edit request:', error);
    console.error('❌ [Profile Edit API] Error details:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url,
      method: error?.config?.method,
    });
    throw error;
  }
}

/**
 * Check if the current user has a pending profile edit request
 * @returns Promise with edit status information
 */
export async function getProfileEditStatus(): Promise<ProfileEditStatusResponse> {
  try {
    console.log('📡 [Profile Edit API] Checking edit status at /users/profile-edit/status');
    const response = await api.get<ProfileEditStatusResponse>(
      '/users/profile-edit/status'
    );
    console.log('✅ [Profile Edit API] Status response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('❌ [Profile Edit API] Error fetching profile edit status:', error);
    console.error('❌ [Profile Edit API] Status check failed:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
}

/**
 * Get profile edit request history for the current user
 * @param limit - Maximum number of records to return (default: 10)
 * @returns Promise with request history
 */
export async function getProfileEditHistory(
  limit: number = 10
): Promise<ProfileEditHistoryResponse> {
  try {
    const response = await api.get<ProfileEditHistoryResponse>(
      `/users/profile-edit/history?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching profile edit history:', error);
    throw error;
  }
}
