import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pciubg from "../assets/pciubg.png";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
// const API = "http://localhost:5000";
  const API = "http://localhost:5000";

  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("id");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Format ID (CSE03108177 → CSE 031 08177)
  const formatId = (value) => {
   // Remove everything except letters & numbers
    let cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    // Split parts
    let part1 = cleaned.slice(0, 3); // CSE
    let part2 = cleaned.slice(3, 6); // 031
    let part3 = cleaned.slice(6, 11); // 08177
    let formatted = part1;
    if (part2) formatted += " " + part2;
    if (part3) formatted += " " + part3;

    return formatted;
  };

  // ✅ Debounce check
  useEffect(() => {
    const timeout = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timeout);
  }, [userId, email, loginMode]);

  const checkAvailability = async () => {
    try {
      if (loginMode === "id" && userId) {
        const res = await axios.post(
          `${API}/api/check-id`,
          { id: userId }
        );
        if (!res.data.available) setError("ID not found");
        else setError("");
      }

      if (loginMode === "email" && email) {
        const res = await axios.post(
        `${API}/api/check-email`,
          { email }
        );
        if (!res.data.available) setError("Email not found");
        else setError("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const payload = loginMode === "id"
      ? { id: userId, password }
      : { email, password };

    const res = await axios.post(`${API}/api/login`, payload);
    console.log("LOGIN RESPONSE:", res.data);

    if (res.data.success) {
      const user = res.data.user; // Fix: use res.data.user instead of undefined 'data'
      
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("email", user.email);
      localStorage.setItem("firstName", user.firstName);
      localStorage.setItem("lastName", user.lastName);
      localStorage.setItem("fullName", `${user.firstName} ${user.lastName}`);
      localStorage.setItem("role", user.role);
      
      console.log("User data:", user);
      console.log("Last name:", user.lastName);
      
      // Navigate based on role
      if (user.role === "student") navigate("/dashboard/overview");
      else if (user.role === "teacher") navigate("/dashboard/dashboardindex");
      else if (user.role === "staff") navigate("/dashboard/view");
    } else {
      setError(res.data.message || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError(err.response?.data?.message || "Server error. Try again later.");
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
              onClick={() => {
                setLoginMode("id");
                setError("");
              }}
              className={`px-4 py-2 rounded-2xl ${
                loginMode === "id"
                  ? "bg-white text-black"
                  : "border border-white text-white"
              }`}
            >
              Login with ID
            </button>

            <button
              onClick={() => {
                setLoginMode("email");
                setError("");
              }}
              className={`px-4 py-2 rounded-2xl ${
                loginMode === "email"
                  ? "bg-white text-black"
                  : "border border-white text-white"
              }`}
            >
              Login with Email
            </button>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* ID / Email */}
            {loginMode === "id" ? (
              <input
                type="text"
                placeholder="CSE 031 08177"
                value={userId}
                onChange={(e) =>
                  setUserId(formatId(e.target.value))
                }
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
              />
            ) : (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white"
              />
            )}

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white w-full"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-2 text-sm text-gray-300"
              >
                {showPassword ? <VisibilityOff/> : <Visibility/>}
              </button>
            </div>

            {/* Error */}
            {error && (
              <span className="text-red-400 text-sm">
                {error}
              </span>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-3 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="mt-4 text-gray-300 hover:text-white underline"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}