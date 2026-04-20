import MyToDooWebView from '@/src/shared/components/MyToDooWebView';
import React from 'react';

/**
 * Privacy Policy Screen - Now powered by WebView
 * 
 * Loads the Privacy Policy page from WebView backend.
 * This is a public endpoint (no authentication required).
 * 
 * Endpoint: /PrivacyPolicy (public)
 * Live URL: https://webview.mytodoo.com/PrivacyPolicy
 */
interface PrivacyPolicyScreenProps {
  onBack?: () => void;
}

export default function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  return (
    <MyToDooWebView
      endpoint="/PrivacyPolicy"
      title="Privacy Policy"
      requiresAuth={false}
      onBack={onBack}
    />
  );
}
