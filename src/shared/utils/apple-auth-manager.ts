/**
 * PROFESSIONAL APPLE AUTHENTICATION MANAGER
 * Backend-integrated implementation using iOS Keychain
 * 
 * Following Apple Developer best practices:
 * - Privacy first
 * - Backend token-based authentication
 * - Credential state synchronization with iOS Settings
 * - Credential revocation handling
 */

import { useAuthStore } from '@/src/store/auth-task-store';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Check if a stored Apple credential is still valid with Apple's servers
 * This is called on app launch to verify the user hasn't revoked access
 * 
 * If valid, the user will already have a backend token in auth store from previous session
 * If invalid, we clear the session
 */
export async function verifyAppleCredentialState(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    console.log('⏭️ Apple Auth verification skipped (not iOS)');
    return false;
  }

  try {
    console.log('🔍 Checking for stored Apple user ID...');
    
    // Get stored Apple user ID from Keychain
    const appleUserId = await SecureStore.getItemAsync('apple_user_id', { keychainService: 'com.mytodoo.mytodoolive' });
    
    if (!appleUserId) {
      console.log('ℹ️ No stored Apple user ID found');
      return false;
    }
    
    console.log('🔍 Verifying Apple credential state for user:', appleUserId);
    
    // Check credential state with Apple's servers
    const credentialState = await AppleAuthentication.getCredentialStateAsync(appleUserId);
    
    if (credentialState === AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED) {
      // ✅ User is still verified by Apple
      console.log('✅ Apple credential still valid');
      
      // Check if we have a valid backend token in auth store
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && authState.token) {
        console.log('✅ User already has valid backend token - session intact');
        return true;
      } else {
        console.warn('⚠️ Apple credential valid but no backend token - user needs to sign in again');
        await clearAppleSession();
        return false;
      }
    } else {
      // ❌ User revoked access or credential expired
      console.warn('⚠️ Apple credential no longer valid - clearing session');
      await clearAppleSession();
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying Apple credential state:', error);
    return false;
  }
}

/**
 * Listen for Apple credential revocation
 * Called when user removes app from Apple ID settings
 */
export function setupAppleCredentialListener(): () => void {
  if (Platform.OS !== 'ios') {
    return () => {}; // No-op cleanup function
  }

  console.log('👂 Setting up Apple credential revocation listener');
  
  const subscription = AppleAuthentication.addRevokeListener(async () => {
    console.warn('🚨 Apple credentials revoked! Logging user out...');
    
    // Clear Apple session data
    await clearAppleSession();
    
    // Clear app auth state (this clears backend token)
    const authState = useAuthStore.getState();
    await authState.clearAuth();
    
    console.log('✅ User logged out due to Apple credential revocation');
  });

  // Return cleanup function
  return () => {
    console.log('🧹 Cleaning up Apple credential listener');
    subscription.remove();
  };
}

/**
 * Clear all Apple session data from device
 */
async function clearAppleSession(): Promise<void> {
  try {
    console.log('🧹 Clearing Apple session data...');
    
    // Remove Apple user ID from Keychain
    await SecureStore.deleteItemAsync('apple_user_id', { keychainService: 'com.mytodoo.mytodoolive' });
    
    console.log('✅ Apple session data cleared');
  } catch (error) {
    console.error('❌ Error clearing Apple session:', error);
  }
}
