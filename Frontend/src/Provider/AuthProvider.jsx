import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  GoogleAuthProvider
} from "firebase/auth";
import app from "../Firebase/Firebase.init";
import useaxiosPublic from "../Hooks/useAxiosPublic";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const provider = new GoogleAuthProvider(); // ✅ fixed
  const auth = getAuth(app);
  const axiosPublic = useaxiosPublic();

  const userRegister = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const userLogin = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const updateUserProfile = (name, photourl) => {
    setLoading(true);
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photourl,
    });
  };

  const userLogOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, provider); // ✅ now defined
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe; // ✅ fixed cleanup
  }, [auth]);

  const authInfo = {
    user,
    loading,
    userRegister,
    userLogin,
    updateUserProfile,
    userLogOut,
    googleSignIn,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;