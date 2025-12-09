/**
 * Firebase Cloud Messaging (FCM) API
 * 
 * Handles FCM token management for push notifications
 * Backend manages tokens per device (iOS, Android, Web)
 */

import { createApi } from '@/src/shared/utils/api';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

// ==================== TYPES ====================

export interface FCMToken {
  token: string;
  device: 'android' | 'ios' | 'web';
  deviceId: string;
  createdAt?: string;
  lastUsed?: string;
}

export interface SaveFCMTokenRequest {
  token: string;
  device: 'android' | 'ios' | 'web';
  deviceId: string;
}

export interface SaveFCMTokenResponse {
  success: boolean;
  message: string;
  data: {
    totalDevices: number;
  };
}

export interface RemoveFCMTokenRequest {
  token: string;
}

export interface RemoveFCMTokenResponse {
  success: boolean;
  message: string;
  data: {
    remainingDevices: number;
  };
}

export interface GetFCMTokensResponse {
  success: boolean;
  data: {
    tokens: FCMToken[];
    totalDevices: number;
  };
}

export interface RemoveAllFCMTokensResponse {
  success: boolean;
  message: string;
  data: {
    removedCount: number;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Save FCM device token
 * POST /users/fcm-token
 * 
 * Save or update Firebase Cloud Messaging token for push notifications.
 * Supports multiple devices per user (iOS, Android, Web).
 */
export const saveFCMToken = async (
  data: SaveFCMTokenRequest
): Promise<SaveFCMTokenResponse> => {
  try {
    console.log('📱 Saving FCM token:', {
      device: data.device,
      deviceId: data.deviceId,
      tokenPreview: data.token.substring(0, 20) + '...'
    });

    const response = await api.post<SaveFCMTokenResponse>(
      '/users/fcm-token',
      data
    );

    console.log('✅ FCM token saved successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to save FCM token:', error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error('Authentication required to save FCM token');
    }
    
    // Handle validation errors
    if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || 'Invalid FCM token data');
    }
    
    throw new Error(
      error?.response?.data?.message || 'Failed to save FCM token. Please try again.'
    );
  }
};

/**
 * Remove specific FCM device token
 * DELETE /users/fcm-token
 * 
 * Remove a specific FCM token from user's registered devices.
 * Used when user logs out from a device or token becomes invalid.
 */
export const removeFCMToken = async (
  data: RemoveFCMTokenRequest
): Promise<RemoveFCMTokenResponse> => {
  try {
    console.log('🗑️ Removing FCM token:', {
      tokenPreview: data.token.substring(0, 20) + '...'
    });

    const response = await api.delete<RemoveFCMTokenResponse>(
      '/users/fcm-token',
      { data }
    );

    console.log('✅ FCM token removed successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to remove FCM token:', error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error('Authentication required to remove FCM token');
    }
    
    // Handle not found errors
    if (error?.response?.status === 404) {
      throw new Error('FCM token not found');
    }
    
    throw new Error(
      error?.response?.data?.message || 'Failed to remove FCM token. Please try again.'
    );
  }
};

/**
 * Get all FCM tokens for user
 * GET /users/fcm-tokens
 * 
 * Retrieve all registered FCM device tokens for the authenticated user.
 * Shows all devices where user can receive push notifications.
 */
export const getFCMTokens = async (): Promise<GetFCMTokensResponse> => {
  try {
    console.log('📋 Fetching FCM tokens...');

    const response = await api.get<GetFCMTokensResponse>('/users/fcm-tokens');

    console.log('✅ FCM tokens retrieved:', {
      totalDevices: response.data.data.totalDevices,
      tokens: response.data.data.tokens.length
    });

    return response.data;
  } catch (error: any) {
    // Silent warning for non-critical FCM operations
    if (error?.response?.status === 401) {
      console.warn('⚠️ 401 Unauthorized: /users/fcm-tokens');
      // Don't throw - return empty result to prevent app crashes
      return {
        success: false,
        data: {
          tokens: [],
          totalDevices: 0
        },
        message: 'Authentication required to fetch FCM tokens'
      } as any;
    }
    
    console.warn('⚠️ Failed to fetch FCM tokens (non-critical):', error.message);
    
    // Return empty result instead of throwing for non-auth errors
    return {
      success: false,
      data: {
        tokens: [],
        totalDevices: 0
      },
      message: error?.response?.data?.message || 'Failed to fetch FCM tokens'
    } as any;
  }
};

/**
 * Remove all FCM tokens for user
 * DELETE /users/fcm-tokens/all
 * 
 * Remove all registered FCM device tokens for the authenticated user.
 * Useful when user wants to stop receiving push notifications on all devices.
 */
export const removeAllFCMTokens = async (): Promise<RemoveAllFCMTokensResponse> => {
  try {
    console.log('🗑️ Removing all FCM tokens...');

    const response = await api.delete<RemoveAllFCMTokensResponse>(
      '/users/fcm-tokens/all'
    );

    console.log('✅ All FCM tokens removed:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to remove all FCM tokens:', error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error('Authentication required to remove FCM tokens');
    }
    
    throw new Error(
      error?.response?.data?.message || 'Failed to remove all FCM tokens. Please try again.'
    );
  }
};
