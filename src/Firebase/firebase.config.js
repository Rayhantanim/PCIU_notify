import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1xTKuiUPvEAk-HifZCmq-MCFWyqwBpO4",
  authDomain: "ride-sharing-e739d.firebaseapp.com",
  projectId: "ride-sharing-e739d",
  storageBucket: "ride-sharing-e739d.firebasestorage.app",
  messagingSenderId: "1078544329451",
  appId: "1:1078544329451:web:f831ebb990b9f2fca1ecae",
  measurementId: "G-M1H75CF061"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;