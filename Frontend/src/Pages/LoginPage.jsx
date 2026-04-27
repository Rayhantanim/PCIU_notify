import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pciubg from "../assets/pciubg.png";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

export default function LoginPage() {
  const API = "http://localhost:5000";
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("email");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Format ID (CSE03108177 → CSE 031 08177)
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let payload;
      
      if (loginMode === "email") {
        payload = { email, password };
      } else {
        payload = { id: userId, password };
      }

      const res = await axios.post(`${API}/api/login`, payload);
      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.success) {
        const user = res.data.user;
        
        // Save to localStorage
        localStorage.setItem("userId", user.userId || user._id);
        localStorage.setItem("email", user.email);
        localStorage.setItem("firstName", user.firstName);
        localStorage.setItem("lastName", user.lastName);
        localStorage.setItem("fullName", `${user.firstName} ${user.lastName}`);
        localStorage.setItem("role", user.role);
        
        toast.success(`Welcome back, ${user.firstName}! 🎉`);
        
        // Navigate based on role
        if (user.role === "student") {
          navigate("/dashboard/overview");
        } else if (user.role === "teacher") {
          navigate("/dashboard/dashboardindex");
        } else if (user.role === "staff") {
          navigate("/dashboard/view");
        }
      } else {
        setError(res.data.message || "Login failed");
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response) {
        // Server responded with error
        const message = err.response.data?.message || "Login failed";
        setError(message);
        toast.error(message);
      } else if (err.request) {
        // Request made but no response
        setError("Cannot connect to server. Please check if backend is running.");
        toast.error("Server connection failed");
      } else {
        setError(err.message || "An error occurred");
        toast.error(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${pciubg})` }}
      />
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Login Box */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-8 py-10 max-w-md w-full mx-4 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Login</h2>

          {/* Toggle */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => {
                setLoginMode("email");
                setError("");
                setEmail("");
                setPassword("");
              }}
              className={`px-4 py-2 rounded-2xl ${
                loginMode === "email"
                  ? "bg-white text-black"
                  : "border border-white text-white"
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
              }}
              className={`px-4 py-2 rounded-2xl ${
                loginMode === "id"
                  ? "bg-white text-black"
                  : "border border-white text-white"
              }`}
            >
              Login with ID
            </button>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email / ID */}
            {loginMode === "email" ? (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <input
                type="text"
                placeholder="CSE 031 08177"
                value={userId}
                onChange={(e) => setUserId(formatId(e.target.value))}
                maxLength={13}
                required
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}

            {/* Password */}
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

            {/* Error */}
            {error && (
              <span className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">
                {error}
              </span>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-3 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-gray-300 hover:text-white underline text-sm"
            >
              Don't have an account? Register
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
    </div>
  );
}