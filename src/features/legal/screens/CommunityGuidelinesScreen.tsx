import MyToDooWebView from '@/src/shared/components/MyToDooWebView';
import React from 'react';

/**
 * Community Guidelines Screen - Now powered by WebView
 * 
 * Loads the Community Guidelines page from WebView backend.
 * This is a public endpoint (no authentication required).
 * 
 * Endpoint: /CommunityGuideline (public)
 * URL: https://uat-webview.mytodoo.com/CommunityGuideline
 */
interface CommunityGuidelinesScreenProps {
  onBack?: () => void;
}

export default function CommunityGuidelinesScreen({ onBack }: CommunityGuidelinesScreenProps) {
  return (
    <MyToDooWebView
      endpoint="/CommunityGuideline"
      title="Community Guidelines"
      requiresAuth={false}
      onBack={onBack}
    />
  );
}
