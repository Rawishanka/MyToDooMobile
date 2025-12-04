/**
 * Network Error Handler Utility
 * Silently handles network errors and provides consistent error responses
 * without cluttering console logs
 */

export interface NetworkErrorResponse {
  isNetworkError: boolean;
  error: any;
  shouldShowAlert: boolean;
  userMessage: string;
}

/**
 * Check if error is a network-related error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || error.toString();
  const errorCode = error.code || error.response?.status;

  return (
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ENOTFOUND' ||
    errorCode === 'ERR_NETWORK' ||
    errorCode === 'ETIMEDOUT' ||
    errorCode === 'NETWORK_ERROR' ||
    errorMessage?.includes('Network Error') ||
    errorMessage?.includes('Network request failed') ||
    errorMessage?.includes('Network error') ||
    error.name === 'TypeError' && errorMessage?.includes('Network request failed')
  );
};

/**
 * Handle API errors silently - returns error info without console.error logs
 */
export const handleApiError = (error: any, context: string): NetworkErrorResponse => {
  const isNetwork = isNetworkError(error);

  // Only log in development mode and only as warnings
  if (__DEV__ && isNetwork) {

  }

  return {
    isNetworkError: isNetwork,
    error,
    shouldShowAlert: isNetwork,
    userMessage: isNetwork
      ? 'Unable to connect. Please check your internet connection.'
      : 'Something went wrong. Please try again.',
  };
};

/**
 * Get user-friendly error message based on context
 */
export const getContextualErrorMessage = (context: 'tasks' | 'offers' | 'chat' | 'payment' | 'profile' | 'general'): string => {
  const messages = {
    tasks: 'Unable to load tasks. Check your internet connection.',
    offers: 'Unable to load offers. Check your network and try again.',
    chat: 'Unable to connect to chat. Please check your internet.',
    payment: 'No internet connection. Payment cannot continue.',
    profile: 'Unable to load profile. Please check your connection.',
    general: 'Unable to connect to server. Try again when you have internet.',
  };

  return messages[context] || messages.general;
};
