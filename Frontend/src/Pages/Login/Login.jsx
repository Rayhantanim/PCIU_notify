import React, { useState } from "react";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Box,
  TextField,
} from "@mui/material";

import { Link, useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  /* State */
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  /* Handle Change */
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  /* Submit */
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields are required!");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/login",
        formData
      );

      toast.success(res.data.message);

      /* Save user (optional) */
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

    } catch (err) {

      toast.error(
        err.response?.data?.message || "Login Failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-[#E6F0F4]">

      <div className="w-3/4 h-auto flex justify-center rounded-4xl gap-20 bg-white">

        {/* Left Image */}
        <div className="w-full bg-[#E4E3E8] rounded-4xl">

          <img
            className="w-full"
            src="https://static.vecteezy.com/system/resources/thumbnails/004/112/232/small/forgot-password-and-account-login-for-web-page-protection-security-key-access-system-in-smartphone-or-computer-flat-illustration-vector.jpg"
            alt=""
          />

        </div>

        {/* Right Form */}
        <div className="w-full">

          <h2 className="text-center font-semibold text-5xl my-8">
            Login
          </h2>

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="flex flex-col items-center"
            sx={{ "& > :not(style)": { m: 1, width: "500px" } }}
          >

            {/* Email */}
            <TextField
              name="email"
              label="Email"
              type="email"
              onChange={handleChange}
              required
            />

            {/* Password */}
            <TextField
              name="password"
              label="Password"
              type="password"
              onChange={handleChange}
              required
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
          <p className="mt-2 text-center text-sm text-gray-600">

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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />

    </div>
  );
};

export default Login;
