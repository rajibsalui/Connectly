import {
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { firebaseConfig } from "./firebase.config";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from 'axios';
import { config } from '@/config/config';
// import { useAuth } from "@/context/AuthContext";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Sign up error", error);
    throw error;
  }
};

// Sign in with Google
export const handleGoogleLogin = async () => {
  try {
    // const { getUser } = useAuth();
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Get the ID token
    const idToken = await user.getIdToken();

    // Add retry logic for 429 errors
    const maxRetries = 3;
    let retryCount = 0;
    let response;

    while (retryCount < maxRetries) {
      try {
        response = await axios.post(`${config.serverUrl}/auth/firebase`, {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            providerData: user.providerData
          }
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        break; // If successful, exit the retry loop
      } catch (error: any) {
        if (error.response?.status === 429 && retryCount < maxRetries - 1) {
          retryCount++;
          // Exponential backoff: wait longer between each retry
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          continue;
        }
        throw error; // If not a 429 error or max retries reached, rethrow
      }
    }

    if (!response || !response.data.success) {
      throw new Error(response?.data?.message || 'Failed to authenticate with backend');
    }

    // Save JWT token from our backend
    localStorage.setItem('token', response.data.token);
    // getUser(response.data.user.id);
    
    console.log('Firebase authentication successful:', response.data.user);
    return {
      success: true,
      user: response.data.user,
      token: response.data.token
    };

  } catch (error) {
    console.error('Firebase authentication error:', error);
    throw error;
  }
};

// Log out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
    localStorage.removeItem('token');
    
    // Notify backend about logout
    await axios.post(`${config.serverUrl}/api/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void): void => {
  onAuthStateChanged(auth, callback);
};