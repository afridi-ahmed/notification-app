// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiJCOq9bShQSiS53-G2uMtNowq2yuQz6U",
  authDomain: "rn-notificationapp.firebaseapp.com",
  projectId: "rn-notificationapp",
  storageBucket: "rn-notificationapp.appspot.com",
  messagingSenderId: "129098729567",
  appId: "1:129098729567:web:b05f01ad8f5d85075af3ea",
  measurementId: "G-GKVW5P5S2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);