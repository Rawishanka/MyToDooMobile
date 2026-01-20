/**
 * Firebase Configuration - Hybrid Mode
 * 
 * Project: mytodoo-e4cdb
 * 
 * SMART DETECTION:
 * - Expo Go: Uses Expo Notifications (no native modules needed)
 * - APK Build: Uses React Native Firebase (full native FCM)
 * 
 * This allows development in Expo Go AND production with native Firebase!
 */

import Constants from 'expo-constants';

// Firebase config from mytodoo-e4cdb project (LIVE)
export const firebaseConfig = {
  apiKey: "AIzaSyAT-WR-wfJ1VkDyoYj3wmucrQdHfnVsdtQ",
  authDomain: "mytodoo-e4cdb.firebaseapp.com",
  projectId: "mytodoo-e4cdb",
  storageBucket: "mytodoo-e4cdb.firebasestorage.app",
  messagingSenderId: "685356682007",
  appId: "1:685356682007:android:43492ad2af1792850f8552",
};

// Detect if we're in Expo Go or native build
const isExpoGo = Constants.appOwnership === 'expo';

let firebase: any = null;
let db: any = null;
let fcm: any = null;
let auth: any = null;

// Try to load React Native Firebase (only works in native builds)
if (!isExpoGo) {
  try {
    const firebaseApp = require('@react-native-firebase/app').default;
    const firebaseFirestore = require('@react-native-firebase/firestore').default;
    const firebaseMessaging = require('@react-native-firebase/messaging').default;

    // Initialize Firebase (if not already initialized)
    if (!firebaseApp.apps.length) {
      firebaseApp.initializeApp(firebaseConfig);
      console.log('🔥 React Native Firebase initialized (Native Build)');
    } else {
      firebaseApp.app();
      console.log('🔥 Using existing React Native Firebase instance');
    }

    firebase = firebaseApp;
    db = firebaseFirestore();
    fcm = firebaseMessaging();
    
    // Try to load Firebase Auth module (but don't initialize yet to avoid crashes)
    try {
      const firebaseAuth = require('@react-native-firebase/auth').default;
      auth = firebaseAuth; // Store the module, not the instance
      console.log('🔥 Firebase Auth module loaded (will initialize on demand)');
    } catch (authError) {
      console.log('ℹ️ Firebase Auth module not available - Google Sign-In will be disabled');
      auth = null;
    }
  } catch (error) {
    console.log('⚠️ React Native Firebase not available - using Expo mode');
    console.error('Firebase initialization error:', error);
  }
} else {
  console.log('📱 Running in Expo Go - Firebase native modules not available');
}

export { auth, db, fcm };
export default firebase;