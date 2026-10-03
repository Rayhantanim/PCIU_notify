import React, { useState } from 'react';
import loginImg from '../../assets/Login.jpg';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: '', // phone or email
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const payload = {
    identifier: formData.identifier.trim(),
    password: formData.password,
  };

  console.log('📤 Sending login request to:', `${API}/api/auth/login`);
  console.log('📦 Payload:', payload);

  try {
    const { data } = await axios.post(`${API}/api/auth/login`, payload);

    console.log('✅ Login response:', data);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    console.log('💾 Saved to localStorage:', {
      token: data.token?.slice(0, 20) + '...',
      user: data.user,
    });

    navigate('/home');
  } catch (err) {
    console.error('❌ Login failed:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message,
    });

    setError(
      err.response?.data?.message ||
        err.message ||
        'Unable to log in. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-[420px] flex flex-col items-center gap-6">
        {/* Header: Logo & Tagline */}
        <div className="flex flex-col items-center gap-2">
          <svg
            viewBox="0 0 254 108"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[140px] h-auto"
          >
            <path
              d="M-0.000195157 62.7L29.2598 38.5H-0.000195157V23.1H55.2198V38.5L25.7398 62.7H55.2198V78.1H-0.000195157V62.7ZM116.819 23.1V50.6C116.819 66.33 103.949 79.2 88.2189 79.2C72.4889 79.2 59.6189 66.33 59.6189 50.6V23.1H75.0189V50.6C75.0189 57.86 80.9589 63.8 88.2189 63.8C95.4789 63.8 101.419 57.86 101.419 50.6V23.1H116.819ZM101.419 79.2H116.819C116.819 94.93 103.949 107.8 88.2189 107.8C72.4889 107.8 59.6189 94.93 59.6189 79.2H75.0189C75.0189 86.46 80.9589 92.4 88.2189 92.4C95.4789 92.4 101.419 86.46 101.419 79.2ZM121.172 39.6C121.172 17.71 138.882 -2.86102e-05 160.772 -2.86102e-05C173.532 -2.86102e-05 184.862 6.04997 192.122 15.4L179.692 24.53C175.292 18.92 168.362 15.4 160.772 15.4C147.462 15.4 136.572 26.29 136.572 39.6C136.572 56.76 148.122 64.79 158.902 64.79C168.142 64.79 176.722 58.85 176.722 47.85V39.6H192.122V78.1H176.722V74.47C171.222 77.55 164.842 79.09 158.352 79.09C140.092 79.09 121.172 66.55 121.172 39.6ZM196.474 50.6C196.474 34.87 209.344 22 225.074 22C240.804 22 253.674 34.87 253.674 50.6C253.674 66.33 240.804 79.2 225.074 79.2C209.344 79.2 196.474 66.33 196.474 50.6ZM211.874 50.6C211.874 57.86 217.814 63.8 225.074 63.8C232.334 63.8 238.274 57.86 238.274 50.6C238.274 43.34 232.334 37.4 225.074 37.4C217.814 37.4 211.874 43.34 211.874 50.6Z"
              fill="#8EB800"
            />
          </svg>

          <p className="text-[#5c626d] text-[13px] tracking-wide font-medium mt-1">
            Move together. Arrive better.
          </p>
        </div>

        <div className="w-full h-[180px] flex justify-center items-center mb-2">
          <img
            src={loginImg}
            alt="City illustration"
            className="w-full h-full object-contain opacity-60"
          />
        </div>

        {/* Form Title */}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-[22px] font-bold text-[#1D1D1D] tracking-tight">
            Welcome back
          </h2>
          <p className="text-[#8E95A0] text-[15px]">Log in to continue</p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
          {/* Phone/Email Input */}
          <div className="relative w-full">
            <span className="absolute left-4 top-1/4 text-[#8EB800]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <input
              name="identifier"
              type="text"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Phone number or email"
              required
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#BED75D] rounded-lg outline-none focus:ring-2 focus:ring-[#8EB800] focus:border-transparent text-[#1D1D1D] text-sm placeholder:text-[#A2A9B4]"
            />
          </div>

          {/* Password Input */}
          <div className="relative w-full">
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-white border border-[#BED75D] rounded-lg outline-none focus:ring-2 focus:ring-[#8EB800] focus:border-transparent text-[#1D1D1D] text-sm placeholder:text-[#A2A9B4]"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="w-full text-right mt-[-6px]">
            <Link
              to="/forgetPass"
              className="text-[#8EB800] text-xs font-medium hover:underline tracking-wide"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Log In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8EB800] text-white font-semibold py-3 rounded-md hover:bg-[#7aa300] transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          {/* OR Divider */}
          <div className="relative flex py-2 items-center w-full my-1">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs tracking-widest uppercase">
              OR
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Social Buttons (Google & Apple) */}
          <div className="flex w-full gap-4 mt-1">
            <button
              type="button"
              className="flex-1 bg-[#F3F4F6] text-[#1D1D1D] text-sm font-medium py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.97-5.97z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              className="flex-1 bg-[#F3F4F6] text-[#1D1D1D] text-sm font-medium py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.9014 12.6656C17.8953 10.4751 19.0447 8.94637 20.897 7.84357C19.9228 6.48476 18.4384 5.60114 16.9273 5.5389C15.4017 5.47666 13.8207 6.34494 13.0739 6.34494C12.3099 6.34494 10.9929 5.62457 9.73951 5.64697C7.59744 5.66937 5.6053 6.88437 4.43497 8.79922C2.0457 12.662 3.83121 18.3714 6.1147 21.5283C7.25644 23.0693 8.59381 24.8012 9.8598 24.7727C11.0989 24.7442 11.5732 23.9087 13.0534 23.9087C14.5181 23.9087 14.9602 24.7727 16.2588 24.7442C17.5915 24.7157 18.8023 23.1233 19.944 21.5676C21.2749 19.7975 21.8464 18.0484 21.8732 17.9762C21.8522 17.969 17.9075 16.5838 17.9014 12.6656ZM13.4454 4.61577C14.3358 3.62034 14.8917 2.29109 14.7302 0.961838C13.6077 0.975638 12.1895 1.66259 11.2591 2.62751C10.4337 3.48228 9.73397 4.85047 9.9218 6.1316C11.141 6.23442 12.5455 5.59114 13.4454 4.61577Z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Footer Sign Up Link */}
          <div className="w-full text-center text-[14px] text-[#555] mt-3">
            New to zyGo?{' '}
            <Link to="/signup" className="text-[#8EB800] font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;