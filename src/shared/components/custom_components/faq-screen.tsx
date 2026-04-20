import MyToDooWebView from '@/src/shared/components/MyToDooWebView';
import React from 'react';

/**
 * FAQ Screen - Now powered by WebView
 * 
 * Loads the Frequently Asked Questions page from WebView backend.
 * This is a public endpoint (no authentication required).
 * 
 * Endpoint: /FrequentlyAskedQuestions (public)
 * URL: https://uat-webview.mytodoo.com/FrequentlyAskedQuestions
 */
interface FAQScreenProps {
  visible: boolean;
  onClose: () => void;
  onContactSupport?: () => void;
}

const FAQScreen: React.FC<FAQScreenProps> = ({ visible, onClose, onContactSupport }) => {
  if (!visible) return null;
  
  return (
    <MyToDooWebView
      endpoint="/FrequentlyAskedQuestions"
      title="Frequently Asked Questions"
      requiresAuth={false}
      onBack={onClose}
    />
  );
};

export default FAQScreen;
