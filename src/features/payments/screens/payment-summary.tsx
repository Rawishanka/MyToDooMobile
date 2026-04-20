import MyToDooWebView from '@/src/shared/components/MyToDooWebView';
import { Stack } from 'expo-router';
import React from 'react';

/**
 * Payment Summary Screen - Now powered by WebView
 * 
 * This screen loads the payment-details page from the WebView backend
 * which displays payment information for both Taskers and Posters.
 * 
 * The WebView backend handles all payment logic, API calls, and UI rendering.
 * The mobile app just needs to inject the authentication token.
 * 
 * Endpoint: /payment-details (protected - requires auth token)
 * Live URL: https://webview.mytodoo.com/payment-details
 */
export default function PaymentSummaryScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: "",
          headerShown: false,
        }} 
      />
      <MyToDooWebView
        endpoint="/payment-details"
        title="Payment Summary"
        requiresAuth={true}
      />
    </>
  );
}
