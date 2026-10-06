import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Img from '../../assets/forgetPass.png';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const inputsRef = useRef([]);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /* ── Redirect if no phone ────────────────────────── */
  useEffect(() => {
    if (!phone) {
      navigate('/forgetPass', { replace: true });
    }
  }, [phone, navigate]);

  /* ── Countdown ────────────────────────────────────── */
  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  /* ── Focus first box on mount ───────────────────── */
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  /* ── Handle digit input ─────────────────────────── */
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');
    setInfo('');

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* ── Keyboard navigation ────────────────────────── */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* ── Paste ───────────────────────────────────────── */
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 4);
    if (!text) return;

    const next = ['', '', '', ''];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    inputsRef.current[Math.min(text.length, 3)]?.focus();
  };

  /* ── Verify ──────────────────────────────────────── */
  const handleVerify = async (e) => {
    e?.preventDefault();
    setError('');
    setInfo('');

    const code = otp.join('');
    if (code.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/verify-otp`, {
        phone,
        code,
      });

      console.log('✅ OTP verified');

      navigate('/reset-password', {
        state: { phone, resetToken: data.resetToken },
      });
    } catch (err) {
      console.error('❌ verify-otp error:', err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Invalid or expired code'
      );
      setOtp(['', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend ──────────────────────────────────────── */
  const handleResend = async () => {
    if (!canResend || resending) return;
    setError('');
    setInfo('');

    setResending(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/send-otp`, { phone });

      console.log('📤 OTP resent to', phone);
      if (data.devCode) {
        console.log('🔐 DEV OTP code:', data.devCode);
      }

      setOtp(['', '', '', '']);
      inputsRef.current[0]?.focus();
      setSeconds(30);
      setCanResend(false);
      setInfo('A new code has been sent.');
    } catch (err) {
      console.error('❌ resend error:', err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to resend OTP'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* ═══ LEFT: Form column ═══════════════════════ */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 py-10 lg:px-16 lg:py-14">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="self-start text-[#1D1D1D] hover:opacity-70 transition p-2 -ml-2"
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

        {/* Center content block */}
        <div className="flex-1 flex flex-col justify-center max-w-[460px] w-full mx-auto lg:mx-0">
          {/* Heading */}
          <h1 className="text-[22px] lg:text-[26px] font-bold text-[#1D1D1D] tracking-tight leading-snug">
            Enter the 4-digit code sent you at
          </h1>
          <p className="text-[22px] lg:text-[26px] font-bold text-[#1D1D1D] tracking-tight mt-1">
            {phone}
          </p>

          {/* OTP boxes */}
          <form onSubmit={handleVerify} className="mt-10">
            <div
              className="flex items-center justify-center lg:justify-start gap-4 lg:gap-5"
              onPaste={handlePaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className={`w-[64px] h-[64px] lg:w-[72px] lg:h-[72px] rounded-xl bg-[#EFEFEF] text-center text-[24px] font-bold text-[#1D1D1D] outline-none border-2 transition disabled:opacity-60
                    ${
                      digit
                        ? 'border-[#8EB800] bg-white'
                        : 'border-transparent focus:border-[#8EB800] focus:bg-white'
                    }`}
                />
              ))}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center lg:text-left mt-4">
                {error}
              </div>
            )}
            {info && !error && (
              <div className="text-[#7DA600] text-sm text-center lg:text-left mt-4">
                {info}
              </div>
            )}

            {/* Resend OTP */}
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || resending}
              className={`w-full mt-8 py-4 rounded-xl text-white font-semibold text-[16px] transition shadow-sm
                ${
                  canResend && !resending
                    ? 'bg-[#7DA600] hover:bg-[#6F9400]'
                    : 'bg-[#A8C46B] cursor-not-allowed'
                }`}
            >
              {resending
                ? 'Sending...'
                : canResend
                ? 'Resend OTP'
                : `Resend OTP in ${seconds}s`}
            </button>

            {/* Login with password */}
            <Link
              to="/login"
              className="block w-full mt-4 py-4 rounded-xl text-center text-[#1D1D1D] font-semibold text-[16px] bg-[#FAFAFA] hover:bg-[#F0F0F0] transition"
            >
              Login with password
            </Link>
          </form>
        </div>

        {/* Bottom row: Back + Next */}
        <div className="w-full max-w-[460px] mx-auto lg:mx-0 flex items-center justify-between mt-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-[60px] h-[60px] rounded-full bg-[#EFEFEF] flex items-center justify-center hover:bg-[#E0E0E0] transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="#1D1D1D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.some((d) => !d)}
            className="flex items-center gap-3 px-7 py-4 rounded-full bg-[#7DA600] text-white font-semibold text-[16px] hover:bg-[#6F9400] transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Next'}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ═══ RIGHT: Illustration column ══════════════ */}
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
              Almost there.
            </h2>
            <p className="text-[15px] text-[#4B5563] mt-2">
              Enter the code we sent to verify it's really you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;