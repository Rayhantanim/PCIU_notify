import React from 'react';
import img from '../../assets/image 107.jpg';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* ── Background image ─────────────────────────────────── */}
      <img
  className="absolute inset-0 w-full h-full object-cover object-center z-0"
  src={img}
  alt="Driver in car"
/>

      {/* ── Gradient overlays for depth ──────────────────────── */}
      {/* Darkens the top and bottom, keeps the middle visible */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      {/* Slight vignette on the sides so content pops */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.55)_100%)]" />

      {/* ── Content wrapper ──────────────────────────────────── */}
      <div className="relative z-20 min-h-screen flex flex-col justify-between items-center px-6 md:px-12 lg:px-16 xl:px-24 py-6 md:py-8">
        {/* ── Top Row: ENG + globe (right aligned) ─────────── */}
        <div className="w-full flex justify-end">
          <button className="flex items-center gap-2 text-white text-sm md:text-base font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] hover:opacity-90 transition">
            <span>ENG</span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path
                d="M19.843 7.582C20.6039 8.92999 21.0025 10.4521 21 12C21 12.778 20.901 13.533 20.716 14.253C20.2159 16.1843 19.0886 17.8948 17.511 19.116C15.9335 20.3372 13.995 20.9999 12 21M4.157 7.582C3.42 8.887 3 10.395 3 12C2.99933 12.76 3.09475 13.517 3.284 14.253C3.78408 16.1843 4.91141 17.8948 6.48898 19.116C8.06654 20.3372 10.005 20.9999 12 21M12 21C14.485 21 16.5 16.97 16.5 12C16.5 7.03 14.485 3 12 3M12 21C9.515 21 7.5 16.97 7.5 12C7.5 7.03 9.515 3 12 3M20.716 14.253C18.0492 15.7314 15.0492 16.5048 12 16.5C8.838 16.5 5.867 15.685 3.284 14.253M12 3C13.5962 2.99933 15.1639 3.42336 16.5422 4.22856C17.9205 5.03377 19.0597 6.19117 19.843 7.582M12 3C10.4038 2.99933 8.83608 3.42336 7.45781 4.22856C6.07954 5.03377 4.94031 6.19117 4.157 7.582M19.843 7.582C17.6657 9.46793 14.8805 10.5041 12 10.5C9.002 10.5 6.26 9.4 4.157 7.582"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* ── Bottom Block: Logo + Button + Legal ──────────── */}
        <div className="w-full flex flex-col items-center gap-6 md:gap-8 pb-6 md:pb-10">
          {/* zyGo Logo — large, centered */}
          <svg
            viewBox="0 0 254 108"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[220px] md:w-[320px] lg:w-[380px] xl:w-[440px] h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          >
            <path
              d="M-0.000195157 62.7L29.2598 38.5H-0.000195157V23.1H55.2198V38.5L25.7398 62.7H55.2198V78.1H-0.000195157V62.7ZM116.819 23.1V50.6C116.819 66.33 103.949 79.2 88.2189 79.2C72.4889 79.2 59.6189 66.33 59.6189 50.6V23.1H75.0189V50.6C75.0189 57.86 80.9589 63.8 88.2189 63.8C95.4789 63.8 101.419 57.86 101.419 50.6V23.1H116.819ZM101.419 79.2H116.819C116.819 94.93 103.949 107.8 88.2189 107.8C72.4889 107.8 59.6189 94.93 59.6189 79.2H75.0189C75.0189 86.46 80.9589 92.4 88.2189 92.4C95.4789 92.4 101.419 86.46 101.419 79.2ZM121.172 39.6C121.172 17.71 138.882 -2.86102e-05 160.772 -2.86102e-05C173.532 -2.86102e-05 184.862 6.04997 192.122 15.4L179.692 24.53C175.292 18.92 168.362 15.4 160.772 15.4C147.462 15.4 136.572 26.29 136.572 39.6C136.572 56.76 148.122 64.79 158.902 64.79C168.142 64.79 176.722 58.85 176.722 47.85V39.6H192.122V78.1H176.722V74.47C171.222 77.55 164.842 79.09 158.352 79.09C140.092 79.09 121.172 66.55 121.172 39.6ZM196.474 50.6C196.474 34.87 209.344 22 225.074 22C240.804 22 253.674 34.87 253.674 50.6C253.674 66.33 240.804 79.2 225.074 79.2C209.344 79.2 196.474 66.33 196.474 50.6ZM211.874 50.6C211.874 57.86 217.814 63.8 225.074 63.8C232.334 63.8 238.274 57.86 238.274 50.6C238.274 43.34 232.334 37.4 225.074 37.4C217.814 37.4 211.874 43.34 211.874 50.6Z"
              fill="#8EB800"
            />
          </svg>

          {/* Get Started pill button — wide and rounded */}
          <Link
            to="/phone-signup"
            className="group w-full max-w-[420px] md:max-w-[560px] lg:max-w-[640px] h-14 md:h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition shadow-2xl"
          >
            <span className="flex items-center gap-3 text-[#1D1D1D] font-medium text-base md:text-lg">
              Get Started
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1"
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="#1D1D1D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>

          {/* Legal line */}
          <div className="text-center text-white text-xs md:text-sm leading-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-lg">
            By using this app you agree to
            <br />
            <span className="underline underline-offset-4 cursor-pointer hover:text-white/90">
              Privacy policies and Terms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;