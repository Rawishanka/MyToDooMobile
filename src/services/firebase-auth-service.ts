/**
 * Firebase Authentication Service
 * Handles Google Sign-In using Firebase Auth
 */

import Constants from 'expo-constants';

// Detect if we're in native build or Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

let auth: any = null;

// Initialize Firebase Auth - Don't initialize at module load to avoid crashes
// We'll initialize when needed instead
if (!isExpoGo) {
  try {
    const firebaseAuth = require('@react-native-firebase/auth').default;
    // Don't call firebaseAuth() here - it might fail if not configured
    // We'll check and initialize when signInWithGoogle is called
    auth = firebaseAuth;
    console.log('🔥 Firebase Auth module loaded (will initialize on demand)');
  } catch (error) {
    console.log('⚠️ Firebase Auth module not available');
    auth = null;
  }
}

/**
 * Sign in with Google using Firebase Auth
 * Returns Firebase ID Token to send to backend
 */
export const signInWithGoogle = async (): Promise<string> => {
  if (!auth) {
    throw new Error('Firebase Auth not available. Please use APK build for Google Sign-In.');
  }

  try {
    // Import Google Sign-In
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    
    console.log('🔐 Configuring Google Sign-In with Firebase...');
    
    // Configure Google Sign-In with Web Client ID from google-services.json
    // IMPORTANT: Use the Web Client ID (client_type: 3) from Firebase Console
    // This is the OAuth 2.0 Web Client ID, NOT the Android Client ID
    const WEB_CLIENT_ID = '697863453994-r06h8627i1m4v66vv84113scanvpg1pv.apps.googleusercontent.com';
    
    try {
      await GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        scopes: ['email', 'profile'],
        offlineAccess: true, // Needed to get server auth code for backend
      });
      console.log('✅ Google Sign-In configured with Web Client ID');
    } catch (configError) {
      console.log('ℹ️ Google Sign-In config warning (will proceed):', configError);
    }

    console.log('🔐 Starting Google Sign-In flow...');

    // Check if device supports Google Play services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign in with Google (v13+ returns { type, data } structure)
    const signInResult = await GoogleSignin.signIn();
    console.log('✅ Google Sign-In result:', { 
      type: signInResult.type,
      hasData: !!signInResult.data,
      hasUser: !!signInResult.data?.user,
      userEmail: signInResult.data?.user?.email 
    });

    // Handle the new API structure in v13+
    if (signInResult.type === 'cancelled') {
      throw new Error('Google Sign-In was cancelled');
    }

    if (signInResult.type !== 'success' || !signInResult.data) {
      throw new Error('Google Sign-In failed. Please try again.');
    }

    const { data } = signInResult;
    console.log('✅ Got Google user info:', data.user?.email);

    // Get Google ID Token from the data object
    const idToken = data.idToken;
    if (!idToken) {
      console.error('❌ No idToken in response. Full data:', data);
      throw new Error('Failed to get Google ID Token from Google Sign-In');
    }
    console.log('✅ Got Google ID Token from Google');

    // Try to sign in to Firebase with the Google credential
    try {
      // Initialize Firebase Auth instance
      const authInstance = auth();
      
      // Create a Firebase credential with the Google ID token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('✅ Created Firebase credential');

      // Sign in to Firebase with the credential
      const userCredential = await authInstance.signInWithCredential(googleCredential);
      console.log('✅ Signed in to Firebase:', userCredential.user.email);

      // Get Firebase ID Token to send to backend
      const firebaseIdToken = await userCredential.user.getIdToken();
      console.log('✅ Got Firebase ID Token to send to backend');

      return firebaseIdToken;
    } catch (firebaseError: any) {
      console.log('⚠️ Firebase Auth sign-in failed, using Google ID Token directly:', firebaseError?.message);
      // Fallback: If Firebase Auth fails, send the Google ID Token directly to backend
      // The backend can verify this token with Firebase Admin SDK
      return idToken;
    }
  } catch (error: any) {
    console.error('❌ Google Sign-In Error:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      name: error?.name
    });
    
    // Handle Google Sign-In specific errors
    if (error.code === '12501') {
      // User cancelled
      throw new Error('Google Sign-In was cancelled');
    } else if (error.code === '12500') {
      // Sign in failed
      throw new Error('Google Sign-In failed. Please ensure you have Google Play Services installed.');
    } else if (error.code === '7') {
      // Network error
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.message?.includes('DEVELOPER_ERROR')) {
      throw new Error('Google Sign-In configuration error. Please contact support.');
    }
    
    // Re-throw with a user-friendly message
    throw new Error(error.message || 'Unable to complete Google Sign-In. Please try again.');
  }
};

/**
 * Sign out from Firebase Auth
 */
export const signOutFromFirebase = async (): Promise<void> => {
  if (!auth) {
    console.log('⚠️ Firebase Auth not available');
    return;
  }

  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    
    // Get Firebase Auth instance
    const authInstance = auth();
    
    // Sign out from Firebase
    await authInstance.signOut();
    
    // Sign out from Google
    if (await GoogleSignin.isSignedIn()) {
      await GoogleSignin.signOut();
    }
    
    console.log('✅ Signed out from Firebase and Google');
  } catch (error) {
    console.error('❌ Sign out error:', error);
  }
};

export default {
  signInWithGoogle,
  signOutFromFirebase,
};
