import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
  } from "firebase/auth";
  import { auth } from "./firebase.config";
  
  // Sign up with email and password
  export const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Sign up error", error);
      throw error;
    }
  };
  
  // Log in with email and password
  export const logIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Log in error", error);
      throw error;
    }
  };
  
  // Log out
  export const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Log out error", error);
      throw error;
    }
  };
  
  // Listen to auth state changes
  export const listenToAuthState = (callback) => {
    onAuthStateChanged(auth, callback);
  };
  