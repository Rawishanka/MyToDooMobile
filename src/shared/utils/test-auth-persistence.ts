/**
 * Testing utilities for auth persistence in Expo development
 * 
 * HOW TO TEST IN EXPO:
 * 1. Login to the app
 * 2. Shake device or press Ctrl+M (Android) / Cmd+D (iOS) to open dev menu
 * 3. Tap "Reload" or press R in terminal
 * 4. App should stay logged in and go directly to tabs
 * 
 * MANUAL TESTING:
 * Import these functions in any screen and call them
 */

import { useAuthStore } from '@/src/store/auth-task-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Check current auth state in both AsyncStorage and Zustand store
 */
export async function checkAuthPersistence() {
  console.log('========================================');
  console.log('🔍 AUTH PERSISTENCE TEST');
  console.log('========================================');
  
  // Check Zustand store
  const authState = useAuthStore.getState();
  console.log('📦 Zustand Store:');
  console.log('  - isAuthenticated:', authState.isAuthenticated);
  console.log('  - hasToken:', !!authState.token);
  console.log('  - hasUser:', !!authState.user);
  console.log('  - token preview:', authState.token?.substring(0, 30) + '...');
  console.log('  - user email:', authState.user?.email);
  
  // Check AsyncStorage
  try {
    const storedToken = await AsyncStorage.getItem('token');
    const storedUser = await AsyncStorage.getItem('user');
    const storedExpiresIn = await AsyncStorage.getItem('expiresIn');
    
    console.log('💾 AsyncStorage:');
    console.log('  - token:', storedToken ? storedToken.substring(0, 30) + '...' : 'NOT FOUND');
    console.log('  - user:', storedUser ? JSON.parse(storedUser).email : 'NOT FOUND');
    console.log('  - expiresIn:', storedExpiresIn || 'NOT FOUND');
    
    // Check if they match
    const userMatch = storedUser && authState.user && 
      JSON.parse(storedUser).email === authState.user.email;
    const tokenMatch = storedToken === authState.token;
    
    console.log('✅ Sync Status:');
    console.log('  - Token match:', tokenMatch ? '✅' : '❌');
    console.log('  - User match:', userMatch ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Error reading AsyncStorage:', error);
  }
  
  console.log('========================================');
  
  return {
    zustand: {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token,
      hasUser: !!authState.user,
    },
    asyncStorage: {
      hasToken: !!(await AsyncStorage.getItem('token')),
      hasUser: !!(await AsyncStorage.getItem('user')),
    }
  };
}

/**
 * Simulate app reload (like in Expo Fast Refresh)
 */
export async function simulateAppReload() {
  console.log('🔄 Simulating app reload...');
  console.log('Clearing Zustand store (simulating memory clear)...');
  
  // Clear only Zustand store, not AsyncStorage (simulates reload)
  const { token: oldToken } = useAuthStore.getState();
  useAuthStore.setState({
    token: null,
    user: null,
    expiresIn: null,
    isAuthenticated: false,
  });
  
  console.log('✅ Zustand cleared');
  console.log('💾 AsyncStorage should still have data');
  
  // Check AsyncStorage
  const storedToken = await AsyncStorage.getItem('token');
  console.log('Token in AsyncStorage:', storedToken ? '✅ Still there' : '❌ Missing');
  
  console.log('');
  console.log('Now AuthProvider should restore from AsyncStorage on next render...');
  console.log('Check if app stays logged in!');
  
  return {
    oldToken: oldToken?.substring(0, 20) + '...',
    asyncStorageHasToken: !!storedToken,
  };
}

/**
 * Clear all auth data (like logout)
 */
export async function clearAllAuthData() {
  console.log('🧹 Clearing all auth data...');
  
  const { clearAuth } = useAuthStore.getState();
  await clearAuth();
  
  console.log('✅ All auth data cleared');
  console.log('App should show welcome/login screen');
}

/**
 * Test the complete auth flow
 */
export async function testAuthFlow() {
  console.log('');
  console.log('========================================');
  console.log('🧪 COMPLETE AUTH FLOW TEST');
  console.log('========================================');
  console.log('');
  
  console.log('Step 1: Check initial state');
  await checkAuthPersistence();
  console.log('');
  
  console.log('Step 2: Simulate app reload (Expo Fast Refresh)');
  await simulateAppReload();
  console.log('');
  
  console.log('Step 3: Wait 1 second for AuthProvider to restore...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('');
  
  console.log('Step 4: Check if auth was restored');
  const result = await checkAuthPersistence();
  console.log('');
  
  if (result.zustand.isAuthenticated && result.asyncStorage.hasToken) {
    console.log('✅ ✅ ✅ AUTH PERSISTENCE WORKING! ✅ ✅ ✅');
  } else {
    console.log('❌ ❌ ❌ AUTH PERSISTENCE FAILED! ❌ ❌ ❌');
  }
  
  console.log('========================================');
}

// Export for easy access in dev console
if (__DEV__) {
  (global as any).testAuth = {
    check: checkAuthPersistence,
    reload: simulateAppReload,
    clear: clearAllAuthData,
    fullTest: testAuthFlow,
  };
  
  console.log('');
  console.log('📋 Auth Testing Tools Available!');
  console.log('Use in dev console:');
  console.log('  - testAuth.check()     - Check current auth state');
  console.log('  - testAuth.reload()    - Simulate app reload');
  console.log('  - testAuth.clear()     - Clear all auth data');
  console.log('  - testAuth.fullTest()  - Run complete test');
  console.log('');
}
