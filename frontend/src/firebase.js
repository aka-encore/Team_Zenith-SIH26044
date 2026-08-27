import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


// Firebase Configuration — loads from frontend env or uses defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForFallbackSetup12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillnexus-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillnexus-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillnexus-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};


// Safely initialize Firebase app
let auth = null;
let googleProvider = null;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (e) {
  console.warn('Firebase initialization notice:', e.message);
}

export { auth, googleProvider };


/**
 * Helper to trigger Google Sign-In popup with Firebase
 */
export const signInWithGoogle = async () => {
  try {
    if (!auth || !googleProvider) {
      return {
        success: false,
        error: 'Firebase not initialized. Falling back to server OAuth.'
      };
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL,
        idToken
      }
    };
  } catch (error) {
    console.error('Firebase Google Sign-In Error:', error);
    return {
      success: false,
      error: error.message || 'Google sign-in failed with Firebase'
    };
  }
};

export default auth;
