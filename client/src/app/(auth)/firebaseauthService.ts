import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { firebaseConfig } from "./firebase.config";
import { MouseEventHandler } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from 'axios'; // Import axios for making HTTP requests
import { useRouter } from "next/navigation";

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

// Login with email and password
// export const login = async (email: string, password: string): Promise<User> => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;
    
//     // Get Firebase ID token
//     const token = await user.getIdToken();
//     // console.log(user);
//     // Save user details to MongoDB
//     // await axios.post('http://localhost:5000/users/login', {
//     //   uid: user.uid,
//     //   email: user.email,
//     //   displayName: user.displayName || email.split('@')[0],
//     //   photoURL: user.photoURL || '',
//     // });

//     // Save token in local storage
//     localStorage.setItem('token', token);
    
//     return user;
//   } catch (error) {
//     console.error("Login error", error);
//     throw error;
//   }
// };

// Log in with Google
export const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // const router = useRouter();
    const user = result.user;
    // console.log(user);
    
    // Save user details to MongoDB
    const res = await axios.post('http://localhost:5000/users/login', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
    // console.log(res.data.token);
    // Save token in local storage
    localStorage.setItem('token', res.data.token);
    return {true:true,user:res.data._id};
    // console.log('User:', user);

  } catch (error) {
    console.error('Error during Google login:', error);
  }
};

// Log out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Log out error", error);
    throw error;
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void): void => {
  onAuthStateChanged(auth, callback);
};