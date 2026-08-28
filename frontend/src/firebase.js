import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isConfigured = Boolean(rawApiKey && !rawApiKey.includes('DummyKey') && rawApiKey.startsWith('AIzaSy'));

// Firebase Configuration — loads from environment variables if present
const firebaseConfig = isConfigured ? {
  apiKey: rawApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillnexus-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillnexus-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillnexus-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
} : null;

// Only initialize if a valid API key is present
let auth = null;
let googleProvider = null;

if (firebaseConfig) {
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
}

export { auth, googleProvider };

/**
 * Helper to trigger Google Sign-In popup with Firebase if configured,
 * otherwise signal to fallback to backend OAuth route.
 */
export const signInWithGoogle = async () => {
  try {
    if (!auth || !googleProvider) {
      // Fallback to server-side Google OAuth
      window.location.href = '/api/auth/google';
      return {
        success: false,
        fallback: true,
        error: 'Redirecting to Google OAuth authentication...'
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
    console.warn('Firebase Google Sign-In redirected to server OAuth:', error.message);
    window.location.href = '/api/auth/google';
    return {
      success: false,
      fallback: true,
      error: error.message || 'Google sign-in failed with Firebase'
    };
  }
};

export default auth;
