import MyToDooWebView from '@/src/shared/components/MyToDooWebView';
import React from 'react';

/**
 * Insurance Protection Screen - Now powered by WebView
 * 
 * Loads the Insurance Protection page from WebView backend.
 * This is a public endpoint (no authentication required).
 * 
 * Endpoint: /InsuranceProtection (public)
 * Live URL: https://webview.mytodoo.com/InsuranceProtection
 */
export default function InsuranceProtection({ onBack }) {
  return (
    <MyToDooWebView
      endpoint="/InsuranceProtection"
      title="Insurance Protection"
      requiresAuth={false}
      onBack={onBack}
    />
  );
}
