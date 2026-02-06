import React, { useState } from "react";
import loginPic from '../../assets/Login.png'
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Box, TextField } from "@mui/material";

import { Link, useNavigate } from "react-router-dom";

/* API URL from frontend .env */
const API = import.meta.env.VITE_API_URL;

/* Email validation regex */
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* Debounce function to prevent excessive API calls */
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const Login = () => {

  const navigate = useNavigate();

  /* Form State */
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  /* Validation States */
  const [emailError, setEmailError] = useState("");
  const [emailStatus, setEmailStatus] = useState(""); // "exists", "notfound", ""
  const [passwordStatus, setPasswordStatus] = useState("");

  /* Check if email exists (debounced) */
  const checkEmail = async (email) => {
    if (!email || !validateEmail(email)) {
      setEmailStatus("");
      return;
    }

    try {
      const res = await axios.get(`${API}/check-email/${email}`);
      if (res.data.exists) setEmailStatus("exists");
      else setEmailStatus("notfound");
    } catch (err) {
      console.log("Email check error:", err);
    }
  };

  const debouncedCheckEmail = debounce(checkEmail, 500);

  /* Handle Input Changes */
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      if (!validateEmail(value)) {
        setEmailError("Invalid email format");
        setEmailStatus("");
      } else {
        setEmailError("");
        debouncedCheckEmail(value);
      }
    }

    if (name === "password") {
      if (value.length < 6) setPasswordStatus("Password too short");
      else setPasswordStatus("");
    }
  };

  /* Handle Submit */
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error("Invalid email address!");
      return;
    }

    if (emailStatus === "notfound") {
      toast.error("Email is not registered!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    try {

      setLoading(true);
      const res = await axios.post(`${API}/login`, formData);

      toast.success(res.data.message);

      /* Save user to localStorage */
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      if (err.response?.data?.message === "Invalid password") {
        setPasswordStatus("Wrong password");
      }
      toast.error(err.response?.data?.message || "Login failed");
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-[#E6F0F4] px-4">

      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-center rounded-3xl gap-8 bg-white shadow-lg p-6">

        {/* Left Image */}
        <div className="hidden md:block w-full bg-[#E4E3E8] rounded-3xl overflow-hidden">
          <img
            className="w-full"
            src={loginPic}
            alt=""
          />

        </div>

        {/* Right Form */}
        <div className="w-full flex flex-col justify-center">
          <h2 className="text-center font-semibold text-4xl mb-6">Login</h2>

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="flex flex-col items-center"
            sx={{ "& > :not(style)": { m: 1, width: "100%", maxWidth: "400px" } }}
          >
            {/* Email */}
            <TextField
              name="email"
              label="Email"
              type="email"
              onChange={handleChange}
              required
              error={Boolean(emailError) || emailStatus === "notfound"}
              helperText={
                emailError
                  ? emailError
                  : emailStatus === "exists"
                  ? "Email registered"
                  : emailStatus === "notfound"
                  ? "Email not registered"
                  : ""
              }
            />

            {/* Password */}
            <TextField
              name="password"
              label="Password"
              type="password"
              onChange={handleChange}
              required
              error={passwordStatus === "Wrong password"}
              helperText={passwordStatus}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="text-white w-[500px] h-14 mt-4 bg-[#263640] rounded-2xl"
            >
              {loading ? "Logging in..." : "Submit"}
            </button>

          </Box>

          {/* Signup Link */}
          <p className="mt-3 text-center text-sm text-gray-600">
            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-medium text-red-600 hover:text-red-500"
            >
              Sign up
            </Link>

          </p>

        </div>

      </div>

      {/* Toast */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default Login;
