import {
  extractReferralCodeFromUrl,
  setPendingReferralCode,
} from '@/src/api/referral-api';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

/**
 * Deep Link Handler Component
 * Handles incoming deep links like mytodoomobile://reset-password?token=xxx&email=xxx
 * and invite links like https://uat.mytodoo.com/invite?ref=CODE
 */
export function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('📱 App opened with deep link:', initialUrl);
        handleDeepLink(initialUrl);
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('📱 Received deep link while app running:', url);
      handleDeepLink(url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    try {
      console.log('🔗 Processing URL:', url);

      const { hostname, path, queryParams } = Linking.parse(url);

      console.log('🔍 Parsed URL:', { hostname, path, queryParams });

      const referralFromUrl =
        (queryParams?.ref as string) ||
        (queryParams?.referralCode as string) ||
        extractReferralCodeFromUrl(url);
      const isInviteLink =
        hostname === 'invite' ||
        path === 'invite' ||
        path?.includes('/invite') ||
        url.includes('/invite') ||
        !!(queryParams?.ref || queryParams?.referralCode);

      if (isInviteLink && referralFromUrl) {
        await setPendingReferralCode(String(referralFromUrl));
        console.log('🎁 Stored pending referral code from deep link');
        setTimeout(() => {
          router.push('/(auth)/signup' as any);
        }, 100);
        return;
      }

      const isResetPassword =
        hostname === 'reset-password' ||
        path === 'reset-password' ||
        path?.includes('/reset-password') ||
        url.includes('reset-password');

      if (isResetPassword) {
        const token = queryParams?.token as string;
        const email = queryParams?.email as string;

        console.log('🔐 Reset password detected:', {
          token: token?.substring(0, 10) + '...',
          email,
        });

        if (token) {
          const params = new URLSearchParams();
          params.append('token', token);
          if (email) {
            params.append('email', email);
          }

          setTimeout(() => {
            router.push(`/(auth)/set-new-password?${params.toString()}` as any);
          }, 100);
        } else {
          console.warn('⚠️ Reset password link missing token');
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
      } else if (hostname === 'task' || path?.startsWith('task/')) {
        const taskId = path?.replace('task/', '') || hostname;
        if (taskId) {
          console.log('✅ Navigating to task:', taskId);
          router.push(`/task-detail?id=${taskId}` as any);
        }
      }
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  };

  return null;
}
