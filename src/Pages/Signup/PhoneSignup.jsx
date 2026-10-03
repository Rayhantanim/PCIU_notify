// PhoneSignup.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import carImg from '../../assets/yellow.jpg';
import { countries, isoToFlagEmoji } from '../../data/countries';

const PhoneSignup = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.iso === 'GB') || countries[0]
  );
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCountryList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizePhone = (raw) => {
    const trimmed = raw.trim();
    if (trimmed.startsWith('+')) return trimmed;
    const digits = trimmed.replace(/\D/g, '').replace(/^0+/, '');
    if (!digits) return '';
    return `${selectedCountry.dial}${digits}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const normalized = normalizePhone(phone);
    const digitsOnly = normalized.replace(/\D/g, '');

    if (digitsOnly.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    // 🆕 Navigate to CreateAccount, passing phone via router state
    navigate('/signup', {
      state: { phone: normalized },
    });
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial.includes(countrySearch)
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8 pb-12 px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-5">
        {/* Top Car Image */}
        <div className="w-full h-44 flex justify-center items-center mb-2">
          <img
            src={carImg}
            alt="Yellow Car"
            className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)]"
          />
        </div>

        <h2 className="text-center text-[#1D1D1D] text-xl font-bold tracking-tight">
          Enter your number
        </h2>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="relative w-full" ref={dropdownRef}>
            <div className="flex w-full bg-[#F3F4F6] rounded-xl overflow-hidden border border-gray-100 focus-within:ring-2 focus-within:ring-[#8EB800] transition-all">
              <button
                type="button"
                onClick={() => setShowCountryList((s) => !s)}
                className="flex items-center px-4 gap-2 bg-[#F3F4F6] border-r border-gray-200 cursor-pointer select-none hover:bg-gray-100 transition"
              >
                <span className="text-lg leading-none">
                  {isoToFlagEmoji(selectedCountry.iso)}
                </span>
                <span className="text-gray-700 text-xs font-medium">
                  {selectedCountry.dial}
                </span>
                <span className="text-gray-500 text-[10px]">▼</span>
              </button>

              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="788 619 4745"
                required
                className="flex-1 bg-transparent text-[#1D1D1D] font-medium p-4 focus:outline-none text-sm"
              />
            </div>

            {showCountryList && (
              <div className="absolute z-20 top-full left-0 mt-2 w-full max-h-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full px-3 py-2 text-sm bg-gray-50 rounded-md outline-none focus:ring-1 focus:ring-[#8EB800]"
                  />
                </div>
                <ul className="max-h-56 overflow-y-auto">
                  {filteredCountries.length === 0 && (
                    <li className="px-4 py-3 text-sm text-gray-400 text-center">
                      No matches
                    </li>
                  )}
                  {filteredCountries.map((c) => (
                    <li key={c.iso}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setShowCountryList(false);
                          setCountrySearch('');
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition ${
                          c.iso === selectedCountry.iso ? 'bg-[#F7FBE8]' : ''
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-lg leading-none">
                            {isoToFlagEmoji(c.iso)}
                          </span>
                          <span className="text-[#1D1D1D]">{c.name}</span>
                        </span>
                        <span className="text-gray-500 text-xs font-medium">
                          {c.dial}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-[#8EB800] text-white font-semibold py-3.5 rounded-full shadow-md hover:bg-[#7aa100] transition duration-200 text-base"
          >
            Select
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative flex py-1 items-center w-full my-1">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <Link
          to="/login"
          className="w-full bg-white border border-gray-300 text-[#1D1D1D] font-medium py-3.5 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.97-5.97z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </Link>

        <button className="w-full bg-white border border-gray-300 text-[#1D1D1D] font-medium py-3.5 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition duration-200">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            <path fill="#FFF" d="M16.671 15.49l.532-3.47h-3.328V9.74c0-.949.465-1.874 1.956-1.874h1.523V4.913s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.673H7.078v3.47h3.047v8.385c.613.1 1.238.15 1.875.15s1.262-.05 1.875-.15V15.49h2.796z"/>
          </svg>
          Continue with Facebook
        </button>

        <p className="text-[11px] leading-5 text-center text-gray-500 mt-2 px-2 tracking-wide">
          By signing up, you agree to our <a href="#" className="text-[#8EB800] font-medium hover:underline">Terms &amp; Conditions</a>, acknowledge our <a href="#" className="text-[#8EB800] font-medium hover:underline">Privacy Policy</a>, and confirm that you're over 18. We may send promotions related to our services – you can unsubscribe anytime in Communication Settings under your profile.
        </p>
      </div>
    </div>
  );
};

export default PhoneSignup;