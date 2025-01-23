// firebase configuration


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHdQDDW5x08Q-1qSSvD7rdxtXVxEk12Po",
  authDomain: "express-backend-a461b.firebaseapp.com",
  projectId: "express-backend-a461b",
  storageBucket: "express-backend-a461b.firebasestorage.app",
  messagingSenderId: "656684837712",
  appId: "1:656684837712:web:a611d006d05123a6fcda55",
  measurementId: "G-03L2HRQ0R0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);