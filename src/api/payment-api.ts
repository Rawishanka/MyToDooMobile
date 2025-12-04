import { createApi } from '../shared/utils/api';
import API_CONFIG from './config';

const api = createApi(API_CONFIG.BASE_URL);

// Stripe Payment API Types
export interface CreatePaymentIntentRequest {
  taskId: string;
  offerId: string;
  amount: number;
  currency?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  breakdown: {
    budgetAmount: number;
    serviceFee: number;
    totalCharge: number;
    taskerWillReceive: number;
    currency: string;
  };
  serviceFeeDetails: {
    reason: string;
    percentage: number;
    minFee: number;
    maxFee: number;
  };
  paymentId: string;
}

export interface VerifyPaymentRequest {
  paymentIntentId: string;
  taskId: string;
  offerId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    paymentStatus: 'succeeded' | 'failed' | 'pending';
    paymentIntentId: string;
    transactionId?: string;
  };
}

export interface CompletePaymentRequest {
  paymentIntentId: string;
  taskId: string;
  offerId: string;
}

export interface CompletePaymentResponse {
  success: boolean;
  data: {
    taskId: string;
    offerId: string;
    status: 'accepted';
    paymentDetails: {
      transactionId: string;
      amount: number;
      serviceFee: number;
      totalAmount: number;
      paidAt: string;
    };
  };
}

export interface ServiceFeeRequest {
  amount: number;
  currency?: string;
}

export interface ServiceFeeResponse {
  success: boolean;
  calculation: {
    budgetAmount: number;
    serviceFee: number;
    totalAmount: number;
    currency: string;
    breakdown: any;
  };
}

/**
 * 💳 Create Payment Intent
 * Endpoint: POST /api/payments/create-intent
 * Auth: Required
 */
export async function createPaymentIntent(
  paymentData: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  try {

    // Request body format: { taskId, offerId, amount, currency }
    const requestBody = {
      taskId: paymentData.taskId,
      offerId: paymentData.offerId,
      // Include amount and currency to ensure backend uses correct values
      amount: paymentData.amount,
      currency: paymentData.currency || 'LKR'
    };
    
    const response = await api.post('/payments/create-intent', requestBody);

    return response.data;
  } catch (error: any) {

    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle validation errors
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "Invalid payment data provided.";
      throw new Error(errorMessage);
    }
    
    // Handle server errors
    if (error?.response?.status >= 500) {

      throw new Error("Payment service is temporarily unavailable. Please try again later.");
    }
    
    throw new Error(error?.response?.data?.message || "Failed to create payment intent. Please try again.");
  }
}

/**
 * ✅ Verify Payment
 * Endpoint: POST /api/payments/verify
 * Auth: Required
 */
export async function verifyPayment(
  verificationData: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  try {

    const response = await api.post('/payments/verify', verificationData);

    return response.data;
  } catch (error: any) {

    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle payment not found errors
    if (error?.response?.status === 404) {
      throw new Error("Payment not found. Please try creating a new payment.");
    }
    
    // Handle payment failed errors
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "Payment verification failed.";
      throw new Error(errorMessage);
    }
    
    throw new Error(error?.response?.data?.message || "Failed to verify payment. Please try again.");
  }
}

/**
 * 🎯 Complete Task & Release Payment
 * Endpoint: POST /api/payments/complete/:taskId
 * Auth: Required
 */
export async function completeTaskPayment(
  taskId: string,
  completionData: CompletePaymentRequest
): Promise<CompletePaymentResponse> {
  try {

    const response = await api.post(`/payments/complete/${taskId}`, completionData);

    return response.data;
  } catch (error: any) {

    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle not found errors
    if (error?.response?.status === 404) {
      throw new Error("Task or payment not found. Please verify the details.");
    }
    
    // Handle conflict errors (task already completed)
    if (error?.response?.status === 409) {
      throw new Error("Task has already been completed or payment already processed.");
    }
    
    throw new Error(error?.response?.data?.message || "Failed to complete task payment. Please try again.");
  }
}

/**
 * 📊 Calculate Service Fee
 * Endpoint: POST /api/service-fee/calculate
 * Auth: Required
 */
export async function calculateServiceFee(
  feeData: ServiceFeeRequest
): Promise<ServiceFeeResponse> {
  try {

    const response = await api.post('/service-fee/calculate', feeData);

    return response.data;
  } catch (error: any) {
    // Check if this is an expected error that should use fallback
    const isExpectedFallbackError = 
      error?.response?.status === 403 || 
      error?.response?.status === 404 || 
      error?.response?.status === 503;
    
    // Only log errors for unexpected failures
    if (!isExpectedFallbackError) {

    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle validation errors
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "Invalid amount provided for fee calculation.";
      throw new Error(errorMessage);
    }
    
    // Fallback calculation if API is not available or returns 403/404/503
    if (isExpectedFallbackError) {
      const statusCode = error?.response?.status;
      const reason = statusCode === 403 ? 'Forbidden (admin only)' : 
                     statusCode === 404 ? 'Endpoint not found' : 
                     'Service unavailable';
      
      
      const amount = feeData.amount;
      const serviceFee = Math.round(amount * 0.10 * 100) / 100; // 10% fee
      const totalAmount = amount + serviceFee;
      
      return {
        success: true,
        calculation: {
          budgetAmount: amount,
          serviceFee,
          totalAmount,
          currency: feeData.currency || 'USD',
          breakdown: {},
        },
      };
    }
    
    throw new Error(error?.response?.data?.message || "Failed to calculate service fee. Please try again.");
  }
}

/**
 * 🧪 Test Service Fee Calculation
 * Endpoint: GET /api/service-fee/test
 * Auth: Required
 * Runs backend service fee calculation tests
 */
export async function testServiceFeeCalculation(): Promise<{
  success: boolean;
  testOutput: string;
}> {
  try {

    const response = await api.get('/service-fee/test');

    return response.data;
  } catch (error: any) {

    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    throw new Error(error?.response?.data?.message || "Failed to run service fee tests.");
  }
}

/**
 * 🔄 Retry Payment Intent
 * Helper function to retry failed payment intents
 */
export async function retryPaymentIntent(
  originalIntentId: string,
  paymentData: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  try {

    // First try to get the status of the original intent
    const verifyResponse = await verifyPayment({
      paymentIntentId: originalIntentId,
      taskId: paymentData.taskId,
      offerId: paymentData.offerId,
    });
    
    // If the original payment is still pending or failed, create a new one
    if (verifyResponse.data.paymentStatus === 'failed') {

      return await createPaymentIntent(paymentData);
    }
    
    // If succeeded, throw error since payment is already complete
    if (verifyResponse.data.paymentStatus === 'succeeded') {
      throw new Error("Payment has already been completed successfully.");
    }
    
    // If pending, return the original intent (would need to retrieve client secret)
    throw new Error("Original payment is still pending. Please wait or contact support.");
    
  } catch (error: any) {

    throw error;
  }
}

/**
 * 📊 Get Service Fee Configuration
 * Endpoint: GET /api/service-fee/config
 * Auth: Required
 * Returns current service fee configuration
 */
export async function getServiceFeeConfig(): Promise<{
  success: boolean;
  config: {
    BASE_PERCENTAGE: number;
    MIN_FEE_USD: number;
    MAX_FEE_USD: number;
    CURRENCY_RATES: Record<string, number>;
    minFees: Record<string, number>;
    maxFees: Record<string, number>;
  };
}> {
  try {

    const response = await api.get('/service-fee/config');

    return response.data;
  } catch (error: any) {
    // Suppress console errors for expected 403 (non-admin users)
    const isExpectedError = error?.response?.status === 403;
    
    if (!isExpectedError) {



    } else {
    }
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle forbidden errors (non-admin user) - throw specific error
    if (error?.response?.status === 403) {
      throw new Error("Admin access required to view service fee configuration.");
    }
    
    throw new Error(error?.response?.data?.message || "Failed to fetch service fee configuration.");
  }
}

/**
 * ⚙️ Update Service Fee Configuration (Admin Only)
 * Endpoint: PUT /api/service-fee/config
 * Auth: Required (Admin only)
 * Updates service fee configuration
 */
export async function updateServiceFeeConfig(configData: {
  BASE_PERCENTAGE?: number;
  MIN_FEE_USD?: number;
  MAX_FEE_USD?: number;
}): Promise<{
  success: boolean;
  message: string;
  config: {
    BASE_PERCENTAGE: number;
    MIN_FEE_USD: number;
    MAX_FEE_USD: number;
    CURRENCY_RATES: Record<string, number>;
    minFees: Record<string, number>;
    maxFees: Record<string, number>;
  };
}> {
  try {

    const response = await api.put('/service-fee/config', configData);

    return response.data;
  } catch (error: any) {




    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle forbidden errors (non-admin user)
    if (error?.response?.status === 403) {
      throw new Error("Only administrators can update service fee configuration.");
    }
    
    // Handle validation errors
    if (error?.response?.status === 400) {
      const errorMsg = error?.response?.data?.message || "Invalid configuration data.";
      throw new Error(errorMsg);
    }
    
    throw new Error(error?.response?.data?.message || "Failed to update service fee configuration.");
  }
}

// Export all payment functions
export {
  createPaymentIntent as default
};

