// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXod9G2nVE_mtBZ4E4I6OeRtfnz5MCBFA",
  authDomain: "pciu-notify.firebaseapp.com",
  projectId: "pciu-notify",
  storageBucket: "pciu-notify.firebasestorage.app",
  messagingSenderId: "617571879607",
  appId: "1:617571879607:web:fa47059bf8335b0582db32",
  measurementId: "G-72M0D6D1E1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;