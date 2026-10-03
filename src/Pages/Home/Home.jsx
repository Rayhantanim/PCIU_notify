import React from 'react';
import { Link } from 'react-router-dom';
import car from '../../assets/image 125.png'
/* ─────────────────────── Icon Set ─────────────────────── */
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="2" strokeLinecap="round">
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
    <path d="M3 17V9l2-5h14l2 5v8" />
    <path d="M5 9h14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <circle cx="12" cy="15" r="2.5" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const StarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3 6.5 7 1-5 4.9 1.2 7L12 18l-6.2 3.4L7 14.4 2 9.5l7-1L12 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const EmergencyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

const ShareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3" />
    <path d="M3 21v-1a6 6 0 0 1 12 0v1" />
    <circle cx="17" cy="9" r="3" />
    <path d="M15 21v-1a6 6 0 0 1 6-6" />
  </svg>
);

const SosIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const SupportIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
  </svg>
);

const SwapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4v14M7 4l-3 3M7 4l3 3M17 20V6M17 20l3-3M17 20l-3-3" />
  </svg>
);

/* ─────────────────────── Quick Action Tile ─────────────────────── */
const QuickAction = ({ icon, label }) => (
  <button className="flex flex-col items-center justify-center gap-2 bg-white border border-[#E5E7EB] rounded-xl py-5 px-3 hover:border-[#8EB800] hover:shadow-sm transition">
    {icon}
    <span className="text-[13px] font-medium text-[#1D1D1D]">{label}</span>
  </button>
);

/* ─────────────────────── Safety Tile ─────────────────────── */
const SafetyTile = ({ icon, label }) => (
  <button className="flex flex-col items-center justify-center gap-2 bg-white border border-[#E5E7EB] rounded-xl py-5 px-3 hover:border-[#8EB800] hover:shadow-sm transition">
    {icon}
    <span className="text-[13px] font-medium text-[#1D1D1D]">{label}</span>
  </button>
);

/* ─────────────────────── Main Component ─────────────────────── */
const Home = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* ── Header ─────────────────────────────────── */}
      <header className="w-full bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
          <button className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition">
            <MenuIcon />
          </button>

          <h1 className="text-[40px] font-bold tracking-tight select-none">
            <span className="text-[#1D1D1D]">zy</span>
            <span className="text-[#8EB800]">Go</span>
          </h1>

          <button className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition">
            <BellIcon />
          </button>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
          {/* ── LEFT COLUMN ───────────────────────── */}
          <section className="flex flex-col gap-8">
            {/* Search card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
              <h2 className="text-[22px] font-bold text-[#1D1D1D] mb-6">
                Where are you going?
              </h2>

              <div className="relative flex flex-col gap-3">
                {/* Pickup */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#8EB800] ring-4 ring-[#E8F5C8]" />
                  <input
                    type="text"
                    placeholder="Current location"
                    defaultValue=""
                    className="w-full pl-12 pr-4 py-4 bg-white border border-[#D6D9DE] rounded-xl text-[15px] text-[#1D1D1D] placeholder:text-[#9CA3AF] outline-none focus:border-[#8EB800] focus:ring-2 focus:ring-[#E8F5C8] transition"
                  />
                </div>

                {/* Dotted line connector */}
                <div className="absolute left-[21px] top-[46px] bottom-[46px] w-px border-l border-dashed border-[#C7CAD1]" />

                {/* Destination */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-sm bg-[#8EB800]" />
                  <input
                    type="text"
                    placeholder="Where to go?"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-[#D6D9DE] rounded-xl text-[15px] text-[#1D1D1D] placeholder:text-[#9CA3AF] outline-none focus:border-[#8EB800] focus:ring-2 focus:ring-[#E8F5C8] transition"
                  />
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction icon={<CarIcon />} label="Ride Now" />
              <QuickAction icon={<CalendarIcon />} label="Schedule" />
              <QuickAction icon={<HistoryIcon />} label="Ride history" />
              <QuickAction icon={<StarIcon />} label="Save Place" />
            </div>

            {/* Safety First */}
            <div>
              <h3 className="text-[18px] font-semibold text-[#1D1D1D] mb-4">
                Safety First
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SafetyTile icon={<ChatIcon />} label="In-App Chat" />
                <SafetyTile icon={<EmergencyIcon />} label="Emergency" />
                <SafetyTile icon={<ShareIcon />} label="Share Trip" />
                <SafetyTile icon={<SosIcon />} label="Sos" />
              </div>
            </div>
          </section>

          {/* ── RIGHT COLUMN ──────────────────────── */}
          <section className="flex flex-col gap-8">
            {/* Promo card */}
            <div className="relative bg-[#EAF4FF] bg-opacity-60 rounded-2xl overflow-hidden p-8 min-h-[320px] flex flex-col justify-between">
            


              {/* Text */}
              <div className="relative z-10 max-w-[280px]">
                <h3 className="text-[26px] font-extrabold text-[#1D1D1D] leading-tight">
                  Affordable Rides,
                  <br />
                  <span className="text-[#8EB800]">Everytime</span>
                </h3>
                <p className="text-[13px] text-[#4B5563] mt-3">
                  Safe, Reliable, Always with you.
                </p>
                <button className="mt-6 bg-[#8EB800] hover:bg-[#7aa300] text-white font-semibold text-[14px] px-6 py-3 rounded-xl shadow-sm transition">
                  Book Ride
                </button>
              </div>

              <img src={car} alt="zyGo car" className="w-full h-full object-contain drop-shadow-xl" />
               
            </div>
          </section>
        </div>
      </main>

      {/* ── Bottom Nav (desktop-friendly floating bar) ─────────────── */}
      <nav className="sticky bottom-0 w-full bg-white border-t border-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-8 py-3 flex items-center justify-around">
          <Link to="/" className="flex flex-col items-center gap-1 text-[#8EB800]">
            <HomeIcon />
            <span className="text-[12px] font-medium">Home</span>
          </Link>
          <Link to="/activity" className="flex flex-col items-center gap-1 text-[#6B7280] hover:text-[#8EB800] transition">
            <ActivityIcon />
            <span className="text-[12px] font-medium">Activity</span>
          </Link>
          <Link to="/support" className="flex flex-col items-center gap-1 text-[#6B7280] hover:text-[#8EB800] transition">
            <SupportIcon />
            <span className="text-[12px] font-medium">Support</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-[#6B7280] hover:text-[#8EB800] transition">
            <ProfileIcon />
            <span className="text-[12px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Home;