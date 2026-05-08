import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import pciubg from "../assets/pciubg.png";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useAuth from "../Hooks/useAuth";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import app from "../Firebase/Firebase.init"; // Import the already initialized Firebase app

export default function LoginPage() {
  const API = "http://localhost:5000";
  // const API = "https://pciunotifybackend.onrender.com";
  const navigate = useNavigate();
  const { userLogin, userLogOut } = useAuth();

  const auth = getAuth(app);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }

    setResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset link sent to your email!");
      setShowForgotModal(false);
      setResetEmail("");
    } catch (err) {
      console.error("Password reset error:", err);
      toast.success("If an account exists, a reset link will be sent");
      setShowForgotModal(false);
      setResetEmail("");
    } finally {
      setResetting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Login with Firebase
      const userCredential = await userLogin(email, password);
      console.log("Firebase login success:", userCredential.user.uid);
      
      // Step 2: Check email verification
      if (!userCredential.user.emailVerified) {
        await userLogOut();
        Swal.fire({
          title: "Email Not Verified",
          text: "Please verify your email before logging in. Would you like to resend the verification email?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Resend",
          cancelButtonText: "Cancel"
        }).then(async (result) => {
          if (result.isConfirmed) {
            await userCredential.user.sendEmailVerification();
            toast.success("Verification email sent!");
          }
        });
        setLoading(false);
        return;
      }
      
// Step 3: Get user data from backend
console.log("Fetching user from backend for email:", email);
const response = await axios.post(`${API}/api/login`, {
  email: email
});

console.log("Backend response:", response.data);

if (response.data.success) {
  const user = response.data.user;  // ✅ only one 'user'

  localStorage.setItem("userId", user._id);
  localStorage.setItem("email", user.email);
  localStorage.setItem("firstName", user.firstName);
  localStorage.setItem("lastName", user.lastName);
  localStorage.setItem("fullName", `${user.firstName} ${user.lastName}`);
  localStorage.setItem("role", user.role);
  localStorage.setItem("firebaseUid", userCredential.user.uid);
  localStorage.setItem("token", userCredential.user.accessToken || "firebase-token");

  Swal.fire({
    title: `Welcome back, ${user.firstName}!`,
    icon: "success",
    timer: 1500,
    showConfirmButton: false
  });

  if (user.role === "student") {
    navigate("/dashboard/overview");
  } else if (user.role === "teacher") {
    navigate("/dashboard/dashboardindex");
  } else if (user.role === "staff") {
    navigate("/dashboard/staffnotice");
  } else if (user.role === "admin") {
    navigate("/dashboard/adminoverview");
  } 
  else {
    navigate("/");
  }
}
    } catch (err) {
      console.error("Login error:", err);
      console.log("Error response:", err.response?.data);
      
      if (err.response?.status === 404) {
        setError("User not found in database. Please register first.");
        toast.error("User not found");
      } else if (err.response?.status === 400) {
        setError("Invalid request. Please check your email.");
        toast.error("Invalid request");
      } else if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
            setError("User not found. Please register first.");
            toast.error("User not found");
            break;
          case "auth/wrong-password":
            setError("Invalid password");
            toast.error("Invalid password");
            break;
          case "auth/invalid-email":
            setError("Invalid email address");
            toast.error("Invalid email");
            break;
          default:
            setError(err.message);
            toast.error(err.message);
        }
      } else {
        setError("Network error. Please try again.");
        toast.error("Network error");
      }
    } finally {
      setLoading(false);
    }
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

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

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

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-blue-300 hover:text-blue-200 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <span className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">
                {error}
              </span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-3 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2">
            <div className="text-gray-300 text-sm">
              Don't have an account? <Link to="/" className="text-white hover:underline">Register</Link>
            </div>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Reset Password</h3>
            <p className="text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Email Address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                >
                  {resetting ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetEmail("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}