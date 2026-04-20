import { useAuthStore } from '@/src/store/auth-task-store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

interface MyToDooWebViewProps {
  /**
   * The endpoint path to load (e.g., "/TermsAndConditions", "/payment-details")
   */
  endpoint: string;
  
  /**
   * Title to display in the header
   */
  title: string;
  
  /**
   * Whether this endpoint requires authentication token injection
   * Set to true for protected routes like /payment-details
   */
  requiresAuth?: boolean;
  
  /**
   * Optional callback when back button is pressed
   */
  onBack?: () => void;
}

/**
 * Reusable WebView component for MyToDoo web pages
 * 
 * Base URLs:
 * - LIVE: https://webview.mytodoo.com
 * - UAT: https://uat-webview.mytodoo.com
 * 
 * Public Endpoints (no auth required):
 * - /TermsAndConditions
 * - /PrivacyPolicy
 * - /InsuranceProtection
 * - /CommunityGuideline
 * - /FrequentlyAskedQuestions
 * 
 * Protected Endpoints (requires auth token):
 * - /payment-details
 */
const MyToDooWebView: React.FC<MyToDooWebViewProps> = ({
  endpoint,
  title,
  requiresAuth = false,
  onBack
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { token: storeToken } = useAuthStore();
  const [authToken, setAuthToken] = useState<string | null>(storeToken);
  const [tokenLoading, setTokenLoading] = useState(requiresAuth);

  // Load token from AsyncStorage if store token is null (app just opened)
  useEffect(() => {
    if (!requiresAuth) {
      setTokenLoading(false);
      return;
    }

    const loadToken = async () => {
      // Use store token if available
      if (storeToken) {
        setAuthToken(storeToken);
        setTokenLoading(false);
        return;
      }
      // Fallback: read directly from AsyncStorage
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          console.log('🔑 WebView: token loaded from AsyncStorage');
          setAuthToken(storedToken);
        } else {
          console.warn('⚠️ WebView: no token found for protected route');
        }
      } catch (e) {
        console.error('❌ WebView: error reading token from AsyncStorage', e);
      } finally {
        setTokenLoading(false);
      }
    };

    loadToken();
  }, [requiresAuth, storeToken]);

  // Sync if store token updates later
  useEffect(() => {
    if (storeToken) {
      setAuthToken(storeToken);
    }
  }, [storeToken]);
  
  // Use env var for WebView base URL (UAT: uat-webview.mytodoo.com, LIVE: webview.mytodoo.com)
  const BASE_URL = process.env.EXPO_PUBLIC_WEBVIEW_BASE_URL || 'https://webview.mytodoo.com';
  
  // Build URL - pass token as query param for protected routes (most reliable on iOS)
  const fullUrl = requiresAuth && authToken
    ? `${BASE_URL}${endpoint}?token=${encodeURIComponent(authToken)}`
    : `${BASE_URL}${endpoint}`;
  
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  
  const getInjectedJavaScript = () => {
    if (!requiresAuth || !authToken) {
      return '';
    }
    
    // Inject token BOTH ways for maximum compatibility:
    // 1. window.APP_AUTH_TOKEN (used by web page JS)
    // 2. document cookie as backup
    return `
      (function() {
        window.APP_AUTH_TOKEN = '${authToken}';
        try {
          document.cookie = 'APP_AUTH_TOKEN=${encodeURIComponent(authToken)}; path=/';
        } catch(e) {}
        console.log('✅ Auth token injected via JS');
      })();
      true;
    `;
  };
  
  // Show loading spinner while fetching token for protected routes
  if (tokenLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052A2" />
          <Text style={styles.loadingText}>Loading {title}...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052A2" />
          <Text style={styles.loadingText}>Loading {title}...</Text>
        </View>
      )}
      
      {/* WebView */}
      <WebView
        source={{ uri: fullUrl }}
        key={fullUrl}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setLoading(false);
        }}
        // Inject authentication token for protected routes
        injectedJavaScriptBeforeContentLoaded={getInjectedJavaScript()}
        // Enable JavaScript
        javaScriptEnabled={true}
        // Enable DOM storage
        domStorageEnabled={true}
        // Start in loading state
        startInLoadingState={true}
        // Allow mixed content (HTTP in HTTPS)
        mixedContentMode="compatibility"
        // iOS specific
        {...(Platform.OS === 'ios' && {
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        })}
        // Android specific
        {...(Platform.OS === 'android' && {
          javaScriptCanOpenWindowsAutomatically: false,
          setSupportMultipleWindows: false,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default MyToDooWebView;
