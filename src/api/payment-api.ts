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
  data: {
    originalAmount: number;
    serviceFee: number;
    totalAmount: number;
    feePercentage: number;
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
    console.log("💳 Creating Stripe payment intent:", paymentData);
    
    // Request body format: { taskId, offerId, amount, currency }
    const requestBody = {
      taskId: paymentData.taskId,
      offerId: paymentData.offerId,
      // Include amount and currency to ensure backend uses correct values
      amount: paymentData.amount,
      currency: paymentData.currency || 'LKR'
    };
    
    const response = await api.post('/payments/create-intent', requestBody);
    console.log("✅ Payment intent created successfully:", response.data);
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to create payment intent:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Payment intent creation failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle validation errors
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "Invalid payment data provided.";
      console.error("❌ Payment intent creation failed - Validation error (400):", errorMessage);
      throw new Error(errorMessage);
    }
    
    // Handle server errors
    if (error?.response?.status >= 500) {
      console.error("❌ Payment intent creation failed - Server error:", error?.response?.status);
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
    console.log("✅ Verifying payment:", verificationData);
    
    const response = await api.post('/payments/verify', verificationData);
    console.log("✅ Payment verified successfully:", response.data);
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to verify payment:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Payment verification failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle payment not found errors
    if (error?.response?.status === 404) {
      console.error("❌ Payment verification failed - Payment not found (404)");
      throw new Error("Payment not found. Please try creating a new payment.");
    }
    
    // Handle payment failed errors
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "Payment verification failed.";
      console.error("❌ Payment verification failed - Bad request (400):", errorMessage);
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
    console.log("🎯 Completing task payment:", { taskId, completionData });
    
    const response = await api.post(`/payments/complete/${taskId}`, completionData);
    console.log("✅ Task payment completed successfully:", response.data);
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to complete task payment:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Task payment completion failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle not found errors
    if (error?.response?.status === 404) {
      console.error("❌ Task payment completion failed - Task/Payment not found (404)");
      throw new Error("Task or payment not found. Please verify the details.");
    }
    
    // Handle conflict errors (task already completed)
    if (error?.response?.status === 409) {
      console.error("❌ Task payment completion failed - Conflict (409)");
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
    console.log("📊 Calculating service fee:", feeData);
    
    const response = await api.post('/service-fee/calculate', feeData);
    console.log("✅ Service fee calculated successfully:", response.data);
    
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to calculate service fee:", error);
    
    // Handle authentication errors
    if (error?.response?.status === 401 || error?.isAuthError) {
      console.error("❌ Service fee calculation failed - Authentication required (401)");
      throw new Error(error.message || "Authentication expired. Please login again to continue.");
    }
    
    // Handle validation errors
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "Invalid amount provided for fee calculation.";
      console.error("❌ Service fee calculation failed - Validation error (400):", errorMessage);
      throw new Error(errorMessage);
    }
    
    // Fallback calculation if API is not available
    if (error?.response?.status === 404 || error?.response?.status === 503 || error?.response?.status === 403) {
      console.log("⚠️ Service fee API not available - using fallback calculation (10%)");
      
      const amount = feeData.amount;
      const serviceFee = Math.round(amount * 0.10 * 100) / 100; // 10% fee
      const totalAmount = amount + serviceFee;
      
      return {
        success: true,
        data: {
          originalAmount: amount,
          serviceFee,
          totalAmount,
          feePercentage: 10,
        },
      };
    }
    
    throw new Error(error?.response?.data?.message || "Failed to calculate service fee. Please try again.");
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
    console.log("🔄 Retrying payment intent:", { originalIntentId, ...paymentData });
    
    // First try to get the status of the original intent
    const verifyResponse = await verifyPayment({
      paymentIntentId: originalIntentId,
      taskId: paymentData.taskId,
      offerId: paymentData.offerId,
    });
    
    // If the original payment is still pending or failed, create a new one
    if (verifyResponse.data.paymentStatus === 'failed') {
      console.log("🔄 Original payment failed, creating new intent");
      return await createPaymentIntent(paymentData);
    }
    
    // If succeeded, throw error since payment is already complete
    if (verifyResponse.data.paymentStatus === 'succeeded') {
      throw new Error("Payment has already been completed successfully.");
    }
    
    // If pending, return the original intent (would need to retrieve client secret)
    throw new Error("Original payment is still pending. Please wait or contact support.");
    
  } catch (error: any) {
    console.error("❌ Failed to retry payment intent:", error);
    throw error;
  }
}

// Export all payment functions
export {
    createPaymentIntent as default
};

