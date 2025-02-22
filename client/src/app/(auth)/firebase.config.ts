// firebase configuration


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth,GoogleAuthProvider,signInWithPopup} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBLWFUbj_xjkctzZ3qm0uTSfmqfzPJdBVE",
  authDomain: "connectly-e0f52.firebaseapp.com",
  projectId: "connectly-e0f52",
  storageBucket: "connectly-e0f52.firebasestorage.app",
  messagingSenderId: "408515393877",
  appId: "1:408515393877:web:a0aadaa1213e187fc9d7dc",
  measurementId: "G-68PHSTECQB"
};

