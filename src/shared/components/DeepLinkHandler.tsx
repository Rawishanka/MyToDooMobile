import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

/**
 * Deep Link Handler Component
 * Handles incoming deep links like mytodoomobile://reset-password?token=xxx&email=xxx
 */
export function DeepLinkHandler() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Handle initial URL when app is opened from a deep link
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // Handle URL changes while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      
      // Parse the URL
      const { hostname, path, queryParams } = Linking.parse(url);
      

      // Handle reset-password deep link
      // Supports multiple formats:
      // - mytodoomobile://reset-password?token=xxx&email=xxx
      // - https://mytodoomobile.com/reset-password?token=xxx&email=xxx
      // - /reset-password?token=xxx&email=xxx
      const isResetPassword = 
        hostname === 'reset-password' || 
        path === 'reset-password' ||
        path?.includes('/reset-password') ||
        url.includes('reset-password');

      if (isResetPassword) {
        const token = queryParams?.token as string;
        const email = queryParams?.email as string;


        if (token) {
          
          // Build URL with query params
          const params = new URLSearchParams();
          params.append('token', token);
          if (email) {
            params.append('email', email);
          }

          // Small delay to ensure app is fully loaded
          setTimeout(() => {
            router.push(`/(auth)/set-new-password?${params.toString()}` as any);
          }, 100);
        } else {
          Alert.alert(
            'Invalid Link',
            'This password reset link is invalid. Please request a new one.',
            [
              {
                text: 'OK',
                onPress: () => router.push('/(auth)/forgot-password' as any),
              },
            ]
          );
        }
      }
      
      // You can add more deep link handlers here for other routes
      // Example: mytodoomobile://task/123
      else if (hostname === 'task' || path?.startsWith('task/')) {
        const taskId = path?.replace('task/', '') || hostname;
        if (taskId) {
          router.push(`/task-detail?id=${taskId}` as any);
        }
      }
    } catch (error) {
    }
  };

  return null; // This component doesn't render anything
}
