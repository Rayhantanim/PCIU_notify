import React from 'react';
import Img from '../assets/forgetPass.png';
import { Link } from 'react-router-dom'; // Optional: import if using react-router

const ForgetPass = () => {
  return (
    <div className="min-h-screen bg-white flex justify-center items-center p-4">
      {/* Mobile Card Container */}
      <div className="relative w-full max-w-[420px] bg-white flex flex-col items-center pt-4 pb-0 min-h-[650px]">
        
        {/* Top Left: Back Button */}
        <div className="w-full flex justify-start pl-2 pt-1 mb-6">
          <button className="text-[#1D1D1D] hover:opacity-70 transition p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Center: Exact 3-Tier Lock & Shield Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-[130px] h-[130px] flex items-center justify-center">
            {/* Outer Pale Green Ring */}
            <div className="absolute w-full h-full rounded-full bg-[#E6F1D9]"></div>
            
            {/* Middle Lighter Green Ring */}
            <div className="absolute w-[104px] h-[104px] rounded-full bg-[#D1E5B6]"></div>
            
            {/* Inner Solid Green Circle */}
            <div className="absolute w-[82px] h-[82px] rounded-full bg-[#82A800] flex items-center justify-center overflow-hidden">
              
              {/* White Shield SVG */}
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="white"/>
                <path d="M12 20C12 20 18 17 18 11.5V6L12 3.5L6 6V11.5C6 17 12 20 12 20Z" fill="white"/>
                
                {/* Green Padlock Inside Shield */}
                <rect x="9" y="9.5" width="6" height="4" rx="1" fill="#82A800"/>
                <path d="M9 9V7.5C9 5.84315 10.3431 4.5 12 4.5C13.6569 4.5 15 5.84315 15 7.5V9" stroke="#82A800" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Titles & Subtitles */}
        <div className="w-full flex flex-col items-center gap-2 mb-8 px-6">
          <h2 className="text-[24px] font-bold text-[#1D1D1D] tracking-tight">
            Forgot Password?
          </h2>
          <p className="text-[#8E95A0] text-[14px] text-center leading-[1.5] px-4">
            Enter your registered phone number and we'll <br /> send you a verification code to reset your <br /> password
          </p>
        </div>

        {/* Input Field */}
        <div className="w-full px-6 flex flex-col gap-1.5 mb-6">
          <label className="text-[13px] font-bold text-[#1D1D1D] pl-1">Phone number</label>
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8EB800]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            <input 
              type="tel" 
              placeholder="Enter your phone number" 
              className="w-full pl-12 pr-4 py-[14px] bg-white border border-[#E5E7EB] rounded-xl outline-none focus:ring-1 focus:ring-[#8EB800] focus:border-[#8EB800] text-[#1D1D1D] text-[14px] placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Reset Button */}
        <button className="w-full px-6">
          <div className="w-full bg-[#7DA600] text-white font-bold py-3.5 rounded-full text-[16px] hover:bg-[#6F9400] transition shadow-sm">
            Reset
          </div>
        </button>

        {/* Bottom City Illustration */}
        <div className="w-full h-[160px] mt-auto relative flex items-end justify-center overflow-hidden bg-transparent">
          <img 
            src={Img}
            alt="City greenery vector" 
            className="w-full h-full object-cover object-bottom"
          />
        </div>

      </div>
    </div>
  );
};

export default ForgetPass;