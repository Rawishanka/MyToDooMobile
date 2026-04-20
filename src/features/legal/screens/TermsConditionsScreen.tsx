import MyToDooWebView from '@/src/shared/components/MyToDooWebView';
import React from 'react';

/**
 * Terms & Conditions Screen - Now powered by WebView
 * 
 * Loads the Terms and Conditions page from WebView backend.
 * This is a public endpoint (no authentication required).
 * 
 * Endpoint: /TermsAndConditions (public)
 * URL: https://uat-webview.mytodoo.com/TermsAndConditions
 */
interface TermsConditionsScreenProps {
  onBack?: () => void;
}

export default function TermsConditionsScreen({ onBack }: TermsConditionsScreenProps) {
  return (
    <MyToDooWebView
      endpoint="/TermsAndConditions"
      title="Terms & Conditions"
      requiresAuth={false}
      onBack={onBack}
    />
  );
}
