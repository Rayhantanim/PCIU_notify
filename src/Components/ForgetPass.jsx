import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Img from '../assets/forgetPass.png';

const ForgetPass = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/api/auth/send-otp`, {
        phone: phone.trim(),
      });

      console.log('📤 OTP sent to', phone);
      if (data.devCode) {
        console.log('🔐 DEV OTP code:', data.devCode);
      }

      navigate('/verify-otp', { state: { phone: phone.trim() } });
    } catch (err) {
      console.error('❌ send-otp error:', err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── LEFT: Form column ───────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-10 lg:px-16">
        <div className="w-full max-w-[460px] flex flex-col">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="self-start text-[#1D1D1D] hover:opacity-70 transition p-2 -ml-2 mb-10"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 3-tier lock & shield icon */}
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <div className="relative w-[110px] h-[110px] lg:w-[130px] lg:h-[130px] flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full bg-[#E6F1D9]" />
              <div className="absolute w-[84px] h-[84px] lg:w-[104px] lg:h-[104px] rounded-full bg-[#D1E5B6]" />
              <div className="absolute w-[66px] h-[66px] lg:w-[82px] lg:h-[82px] rounded-full bg-[#82A800] flex items-center justify-center overflow-hidden">
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-1"
                >
                  <path
                    d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                    fill="white"
                  />
                  <path
                    d="M12 20C12 20 18 17 18 11.5V6L12 3.5L6 6V11.5C6 17 12 20 12 20Z"
                    fill="white"
                  />
                  <rect x="9" y="9.5" width="6" height="4" rx="1" fill="#82A800" />
                  <path
                    d="M9 9V7.5C9 5.84315 10.3431 4.5 12 4.5C13.6569 4.5 15 5.84315 15 7.5V9"
                    stroke="#82A800"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Titles */}
          <div className="w-full flex flex-col lg:items-start items-center gap-3 mb-10">
            <h1 className="text-[26px] lg:text-[32px] font-bold text-[#1D1D1D] tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-[#8E95A0] text-[14px] lg:text-[15px] leading-relaxed text-center lg:text-left">
              Enter your registered phone number and we'll send you a
              verification code to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#1D1D1D] pl-1">
                Phone number
              </label>
              <div className="relative w-full">
                <span className="absolute left-4 top-2/3 -translate-y-1/2 text-[#8EB800]">
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+447886194745"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5E7EB] rounded-xl outline-none focus:ring-1 focus:ring-[#8EB800] focus:border-[#8EB800] text-[#1D1D1D] text-[15px] placeholder:text-[#9CA3AF] disabled:opacity-60"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center lg:text-left">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7DA600] text-white font-bold py-4 rounded-full text-[16px] hover:bg-[#6F9400] transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Reset'}
            </button>

            <div className="text-center text-[14px] text-[#6B7280] mt-2">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-[#8EB800] font-semibold hover:underline"
              >
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* ── RIGHT: Illustration column ───────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#F4FBE8] via-[#EAF7D4] to-[#DCEFB6] items-center justify-center relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-white/30" />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-white/20" />

        <div className="relative z-10 w-full max-w-[560px] px-10 flex flex-col items-center gap-8">
          <img
            src={Img}
            alt="City greenery vector"
            className="w-full h-auto object-contain drop-shadow-xl"
          />

          <div className="text-center">
            <h2 className="text-[26px] font-extrabold text-[#1D1D1D] tracking-tight">
              Move together. Arrive better.
            </h2>
            <p className="text-[15px] text-[#4B5563] mt-2">
              Recover your account in a few simple steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPass;