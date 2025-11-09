// Firebase Configuration for Chat Functionality (React Native Firebase)

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

// Firebase config from user requirements
const firebaseConfig = {
  apiKey: "AIzaSyDndTrD2iZ9HMKR3AdW2iHMRsnWSfCXs2A",
  authDomain: "todo-851bd.firebaseapp.com",
  projectId: "todo-851bd",
  storageBucket: "todo-851bd.appspot.com",
  messagingSenderId: "49137682132",
  appId: "1:49137682132:web:3764dd2a81ebb32fccdd41",
};

// Initialize Firebase (if not already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

// Export Firestore instance
export const db = firestore();

export default firebase;