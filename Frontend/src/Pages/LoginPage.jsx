import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import pciubg from "../assets/pciubg.png";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

// ACTUAL Firebase configuration
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
const auth = getAuth(app);

export default function LoginPage() {
  const API = "https://pciunotifybackend.onrender.com";
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("email");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isIdValid, setIsIdValid] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingId, setCheckingId] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [idExists, setIdExists] = useState(null);
  
  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        redirectBasedOnRole(user.role);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  useEffect(() => {
    const checkEmailExists = async () => {
      if (!email || email.length < 5) {
        setIsEmailValid(true);
        setEmailExists(null);
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setIsEmailValid(false);
        setEmailExists(null);
        return;
      }
      
      setIsEmailValid(true);
      setCheckingEmail(true);
      
      try {
        const response = await axios.post(`${API}/api/check-email`, { email });
        setEmailExists(response.data.exists);
      } catch (error) {
        console.error("Error checking email:", error);
        setEmailExists(null);
      } finally {
        setCheckingEmail(false);
      }
    };
    
    const timeoutId = setTimeout(checkEmailExists, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  useEffect(() => {
    const checkIdExists = async () => {
      if (!userId || userId.length < 5) {
        setIsIdValid(true);
        setIdExists(null);
        return;
      }
      
      setIsIdValid(true);
      setCheckingId(true);
      
      try {
        const cleanId = userId.replace(/\s/g, "");
        const response = await axios.post(`${API}/api/check-id`, { id: cleanId });
        setIdExists(response.data.exists);
      } catch (error) {
        console.error("Error checking ID:", error);
        setIdExists(null);
      } finally {
        setCheckingId(false);
      }
    };
    
    const timeoutId = setTimeout(checkIdExists, 500);
    return () => clearTimeout(timeoutId);
  }, [userId]);

  const formatId = (value) => {
    let cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    let part1 = cleaned.slice(0, 3);
    let part2 = cleaned.slice(3, 6);
    let part3 = cleaned.slice(6, 11);
    let formatted = part1;
    if (part2) formatted += " " + part2;
    if (part3) formatted += " " + part3;
    return formatted;
  };

  const redirectBasedOnRole = (role) => {
    if (role === "student") {
      navigate("/dashboard/overview");
    } else if (role === "teacher") {
      navigate("/dashboard/dashboardindex");
    } else if (role === "staff") {
      navigate("/dashboard/staffnotice");
    } else {
      navigate("/dashboard/allnotices");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let payload;
      
      if (loginMode === "email") {
        if (!emailExists) {
          setError("Email not registered. Please check your email or sign up.");
          setLoading(false);
          return;
        }
        payload = { email, password };
      } else {
        if (!idExists) {
          setError("ID not registered. Please check your ID or sign up.");
          setLoading(false);
          return;
        }
        const cleanId = userId.replace(/\s/g, "");
        payload = { id: cleanId, password };
      }

      const res = await axios.post(`${API}/api/login`, payload);

      if (res.data.success) {
        const user = res.data.user;
        
        localStorage.setItem("token", res.data.token || res.data.accessToken);
        localStorage.setItem("userId", user.userId || user._id);
        localStorage.setItem("email", user.email);
        localStorage.setItem("firstName", user.firstName);
        localStorage.setItem("lastName", user.lastName);
        localStorage.setItem("fullName", `${user.firstName} ${user.lastName}`.trim());
        localStorage.setItem("role", user.role);
        localStorage.setItem("department", user.department || "");
        localStorage.setItem("section", user.section || "");
        localStorage.setItem("studentId", user.studentId || user.userId || "");
        
        localStorage.setItem("user", JSON.stringify({
          userId: user.userId || user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
          section: user.section,
          studentId: user.studentId
        }));

        Swal.fire({
          title: `Welcome back, ${user.firstName}!`,
          icon: "success",
          draggable: true,
          timer: 2000,
          showConfirmButton: false
        });
        
        redirectBasedOnRole(user.role);
      } else {
        setError(res.data.message || "Invalid credentials.");
        toast.error(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Simple Firebase password reset function
  const handleForgotPassword = async () => {
    setResetError("");
    setResetSuccess(false);
    
    if (!resetEmail) {
      setResetError("Please enter your email address");
      return;
    }
    
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, resetEmail, {
        url: 'https://pciu-notify.web.app/login', // Change to your actual domain
        handleCodeInApp: true
      });
      
      setResetSuccess(true);
      toast.success("Reset link sent to your email!");
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setResetError("No account found with this email");
      } else if (error.code === 'auth/invalid-email') {
        setResetError("Please enter a valid email");
      } else if (error.code === 'auth/too-many-requests') {
        setResetError("Too many attempts. Try again later.");
      } else {
        setResetError("Failed to send reset email. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetEmail("");
    setResetError("");
    setResetSuccess(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${pciubg})` }}
      />
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-8 py-10 max-w-md w-full mx-4 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Login</h2>

          <div className="flex justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => {
                setLoginMode("email");
                setError("");
                setEmail("");
                setPassword("");
                setEmailExists(null);
              }}
              className={`px-4 py-2 rounded-2xl transition-all ${
                loginMode === "email"
                  ? "bg-white text-black"
                  : "border border-white text-white hover:bg-white/10"
              }`}
            >
              Login with Email
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode("id");
                setError("");
                setUserId("");
                setPassword("");
                setIdExists(null);
              }}
              className={`px-4 py-2 rounded-2xl transition-all ${
                loginMode === "id"
                  ? "bg-white text-black"
                  : "border border-white text-white hover:bg-white/10"
              }`}
            >
              Login with ID
            </button>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginMode === "email" ? (
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  required
                  className={`px-4 py-2 rounded-lg bg-white/20 border text-white w-full placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
                    email && emailExists === false
                      ? "border-red-500 focus:ring-red-400"
                      : email && emailExists === true
                      ? "border-green-500 focus:ring-green-400"
                      : "border-white/30 focus:ring-blue-400"
                  }`}
                />
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="CSE 031 08177"
                  value={userId}
                  onChange={(e) => setUserId(formatId(e.target.value))}
                  maxLength={13}
                  required
                  className={`px-4 py-2 rounded-lg bg-white/20 border text-white w-full placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
                    userId && idExists === false
                      ? "border-red-500 focus:ring-red-400"
                      : userId && idExists === true
                      ? "border-green-500 focus:ring-green-400"
                      : "border-white/30 focus:ring-blue-400"
                  }`}
                />
              </div>
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white w-full placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-300 hover:text-white"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>

            {error && (
              <span className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">
                {error}
              </span>
            )}

            <button
              type="submit"
              disabled={loading || (loginMode === "email" ? emailExists !== true : idExists !== true)}
              className="mt-4 px-6 py-3 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-gray-300 hover:text-white underline text-sm"
            >
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-white underline text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Reset Password</h3>
              <button onClick={closeForgotModal} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {resetError}
              </div>
            )}

            {resetSuccess ? (
              <div>
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  <p className="font-semibold mb-1">Email Sent! ✉️</p>
                  <p className="text-sm">Check {resetEmail} for reset link.</p>
                </div>
                <button
                  onClick={() => setResetSuccess(false)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Try another email
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Enter your email to receive a password reset link.</p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <button
                  onClick={handleForgotPassword}
                  disabled={loading || !resetEmail}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}