// Stripe Connect API - Payout Account Management

import API_CONFIG from '@/src/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface StripeAccountStatus {
  accountId: string;
  status: 'pending' | 'active' | 'restricted' | 'disabled';
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

export interface StripeAccountCreateResponse {
  accountId: string;
  status: 'pending' | 'active' | 'restricted' | 'disabled';
}

export interface StripeAccountLinkResponse {
  url: string;
}

export interface StripePayout {
  payoutId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'in_transit' | 'canceled' | 'failed';
  arrivalDate: number;
  created: number;
  description: string;
  metadata: {
    taskerId: string;
    taskId: string;
    paymentId: string;
  };
}

export interface StripePayoutHistoryResponse {
  payouts: StripePayout[];
  count: number;
}

class StripeConnectAPIService {
  private baseURL = API_CONFIG.BASE_URL;

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  /**
   * GET /stripe/connect/status
   * Get Stripe Connect account status
   */
  async getAccountStatus(): Promise<StripeAccountStatus> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/stripe/connect/status`, {
        method: 'GET',
        headers,
      });

      if (response.status === 404) {
        // No account exists - this is expected, not an error
        // Throw specific error object that will be caught by React Query
        const notFoundError: any = new Error('No Stripe Connect account found');
        notFoundError.status = 404;
        notFoundError.isExpected = true;
        throw notFoundError;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(errorData.message || 'Failed to get account status');
        error.status = response.status;
        throw error;
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      // Only log actual errors, not 404 or network errors (which are expected)
      if (error?.status !== 404 && !error?.isExpected && error?.message !== 'Network request failed') {
        console.error('❌ Get account status error:', error);
      }
      throw error;
    }
  }

  /**
   * POST /stripe/connect/account
   * Create Stripe Connect Express account
   */
  async createAccount(): Promise<StripeAccountCreateResponse> {
    try {
      console.log('📤 Creating Stripe Connect account...');
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/stripe/connect/account`, {
        method: 'POST',
        headers,
      });

      console.log('📥 Create account response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        
        console.error('❌ Create account API error:', {
          status: response.status,
          error: errorData,
        });
        
        // Handle 400 - account already exists
        if (response.status === 400 && errorData.data) {
          console.log('ℹ️ Account already exists, returning existing account');
          return errorData.data; // Return existing account info
        }
        
        const error: any = new Error(errorData.message || 'Failed to create account');
        error.status = response.status;
        error.details = errorData;
        throw error;
      }

      const result = await response.json();
      console.log('✅ Account created successfully:', result.data);
      return result.data;
    } catch (error: any) {
      console.error('❌ Create account error:', {
        message: error.message,
        status: error.status,
        details: error.details,
      });
      throw error;
    }
  }

  /**
   * POST /stripe/connect/account-link
   * Get onboarding link for account setup
   */
  async getAccountLink(returnUrl: string, refreshUrl: string): Promise<string> {
    try {
      console.log('📤 Getting account link with params:', {
        returnUrl,
        refreshUrl,
        endpoint: `${this.baseURL}/stripe/connect/account-link`,
      });
      
      const headers = await this.getAuthHeaders();
      const requestBody = {
        returnUrl,
        refreshUrl,
      };
      
      console.log('📦 Request body:', requestBody);
      
      const response = await fetch(`${this.baseURL}/stripe/connect/account-link`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Account link response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        
        console.error('❌ Account link API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        
        const error: any = new Error(errorData.message || 'Failed to generate account link');
        error.status = response.status;
        error.details = errorData;
        throw error;
      }

      const result = await response.json();
      console.log('✅ Got account link:', {
        hasUrl: !!result.data?.url,
        urlPreview: result.data?.url?.substring(0, 50) + '...',
      });
      return result.data.url;
    } catch (error: any) {
      console.error('❌ Get account link error:', {
        message: error.message,
        status: error.status,
        details: error.details,
      });
      throw error;
    }
  }

  /**
   * GET /stripe/connect/payouts
   * Get payout history
   */
  async getPayoutHistory(limit: number = 10): Promise<StripePayoutHistoryResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/stripe/connect/payouts?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      if (response.status === 404) {
        throw { status: 404, message: 'No Stripe Connect account found' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get payout history');
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error('❌ Get payout history error:', error);
      throw error;
    }
  }

  /**
   * DELETE /stripe/connect/account
   * Delete/deactivate Stripe Connect account
   */
  async deleteAccount(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/stripe/connect/account`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('❌ Delete account error:', error);
      throw error;
    }
  }
}

export const StripeConnectAPI = new StripeConnectAPIService();
export default StripeConnectAPI;
