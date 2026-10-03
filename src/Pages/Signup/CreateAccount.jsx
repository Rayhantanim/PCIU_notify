import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // 🆕 added useLocation
import axios from 'axios';

const CreateAccount = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 🆕

  // 🆕 Read phone passed from /phone-signup
  const preselectedPhone = location.state?.phone || '';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: preselectedPhone, // 🆕 prefill
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Live password checks
  const passwordChecks = useMemo(() => ({
    length:    formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number:    /[0-9]/.test(formData.password),
  }), [formData.password]);

  const passwordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.number;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Password must be at least 8 characters and include one uppercase letter and one number.');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Signing up with:', {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
      });

      const { data } = await axios.post(`${API}/api/auth/signup`, {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Signup success:', data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/home');
    } catch (err) {
      console.error('❌ Signup error:', err.response?.data || err.message);
      setError(
        err.response?.data?.message || err.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('Google sign-in is not available. Please use email/password.');
  };

  const RequirementRow = ({ label, met }) => (
    <div
      className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${
        met ? 'text-[#8EB800]' : 'text-[#9CA3AF]'
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {met ? (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </>
        )}
      </svg>
      {label}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex justify-center px-4 py-8">
      <div className="w-full max-w-[500px] flex flex-col">
        {/* Header section */}
        <div className="relative flex items-center justify-center pb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 text-[#1D1D1D] hover:opacity-70 transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-[26px] font-bold text-[#1D1D1D] tracking-tight">Create Account</h1>
            <p className="text-[#8E95A0] text-[14px]">
              Sign up to get started with <span className="text-[#8EB800] font-medium">zyGo</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1D1D1D]">Full Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/4 text-[#8EB800]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                autoFocus={!!preselectedPhone}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-lg outline-none focus:ring-1 focus:ring-[#8EB800] focus:border-[#8EB800] text-[#1D1D1D] text-sm placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          {/* 🆕 Phone — prefilled from /phone-signup */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1D1D1D] flex items-center justify-between">
              <span>Phone number</span>
              {preselectedPhone && (
                <span className="text-[11px] text-[#8EB800] font-medium">
                  ✓ From previous step
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/4 text-[#8EB800]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
              <input
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                readOnly={!!preselectedPhone}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-1 focus:ring-[#8EB800] focus:border-[#8EB800] text-[#1D1D1D] text-sm placeholder:text-[#9CA3AF] ${
                  preselectedPhone
                    ? 'bg-gray-50 border-[#E5E7EB] cursor-not-allowed'
                    : 'bg-white border-[#E5E7EB]'
                }`}
              />
              {preselectedPhone && (
                <button
                  type="button"
                  onClick={() => navigate('/phone-signup')}
                  className="absolute right-3 top-1/4 text-[11px] text-[#8EB800] font-semibold hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1D1D1D]">Email ( Optional )</label>
            <div className="relative">
              <span className="absolute left-3 top-1/4 text-[#8EB800]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </span>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-lg outline-none focus:ring-1 focus:ring-[#8EB800] focus:border-[#8EB800] text-[#1D1D1D] text-sm placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1D1D1D]">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/4 text-[#8EB800]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                name="password"
                type="password"
                placeholder="Enter your Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-lg outline-none focus:ring-1 focus:ring-[#8EB800] focus:border-[#8EB800] text-[#1D1D1D] text-sm placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="flex flex-col gap-1.5 mt-1">
            <RequirementRow label="At least 8 characters" met={passwordChecks.length} />
            <RequirementRow label="One uppercase letter" met={passwordChecks.uppercase} />
            <RequirementRow label="One number" met={passwordChecks.number} />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8EB800] text-white font-semibold py-3 rounded-md hover:bg-[#7aa300] transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="relative flex items-center py-2 mt-1">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-[#9CA3AF] text-xs tracking-wider">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex-1 bg-[#F3F4F6] text-[#1877F2] text-[14px] font-medium py-3 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.97-5.97z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 bg-[#F3F4F6] text-[#1D1D1D] text-[14px] font-medium py-3 rounded-md flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.9014 12.6656C17.8953 10.4751 19.0447 8.94637 20.897 7.84357C19.9228 6.48476 18.4384 5.60114 16.9273 5.5389C15.4017 5.47666 13.8207 6.34494 13.0739 6.34494C12.3099 6.34494 10.9929 5.62457 9.73951 5.64697C7.59744 5.66937 5.6053 6.88437 4.43497 8.79922C2.0457 12.662 3.83121 18.3714 6.1147 21.5283C7.25644 23.0693 8.59381 24.8012 9.8598 24.7727C11.0989 24.7442 11.5732 23.9087 13.0534 23.9087C14.5181 23.9087 14.9602 24.7727 16.2588 24.7442C17.5915 24.7157 18.8023 23.1233 19.944 21.5676C21.2749 19.7975 21.8464 18.0484 21.8732 17.9762C21.8522 17.969 17.9075 16.5838 17.9014 12.6656ZM13.4454 4.61577C14.3358 3.62034 14.8917 2.29109 14.7302 0.961838C13.6077 0.975638 12.1895 1.66259 11.2591 2.62751C10.4337 3.48228 9.73397 4.85047 9.9218 6.1316C11.141 6.23442 12.5455 5.59114 13.4454 4.61577Z" />
              </svg>
              Apple
            </button>
          </div>

          <div className="text-center text-[14px] text-[#1D1D1D] mt-4 pb-4">
            Already have an account ?{' '}
            <Link to="/login" className="text-[#8EB800] font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;