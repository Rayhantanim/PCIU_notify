import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ride from '../../assets/image 128.png';

/* ───────────────────────── Icons ───────────────────────── */
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const SupportIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M16 6l-4-4-4 4M12 2v15" />
  </svg>
);

const EditIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const PinIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CancelIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const DistanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h4M17 12h4M12 3v4M12 17v4" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const FareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8EB800" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#8EB800">
    <path d="M12 2l3 6.5 7 1-5 4.9 1.2 7L12 18l-6.2 3.4L7 14.4 2 9.5l7-1L12 2z" />
  </svg>
);

/* ───────────────────────── Tabs ───────────────────────── */
const Tabs = ({ active, onChange }) => {
  const tabs = ['Current Ride', 'Upcoming', 'Past Ride'];
  return (
    <div className="flex gap-3 p-2 bg-[#F4FBE8] rounded-2xl">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-6 py-3 rounded-xl text-[14px] font-semibold transition whitespace-nowrap ${
            active === t
              ? 'bg-white text-[#8EB800] shadow-sm'
              : 'bg-white/60 text-[#1D1D1D] hover:bg-white'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

/* ───────────────────────── Ride Actions Tile ───────────────────────── */
const ActionTile = ({ icon, label, danger }) => (
  <button
    className={`flex flex-col items-center justify-center gap-3 bg-white border border-[#E5E7EB] rounded-xl py-6 px-4 hover:border-[#8EB800] hover:shadow-sm transition min-h-[120px] ${
      danger ? 'hover:border-red-300' : ''
    }`}
  >
    {icon}
    <span className={`text-[13px] font-medium ${danger ? 'text-red-500' : 'text-[#1D1D1D]'}`}>
      {label}
    </span>
  </button>
);

/* ───────────────────────── Detail Row ───────────────────────── */
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-4 border-b border-[#F0F1F3] last:border-b-0">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-[14px] text-[#4B5563]">{label}</span>
    </div>
    <span className="text-[14px] font-medium text-[#1D1D1D]">{value}</span>
  </div>
);

/* ───────────────────────── Main Component ───────────────────────── */
const RideManagement = () => {
  const [activeTab, setActiveTab] = useState('Current Ride');

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="w-full bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
          <button className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition">
            <BackIcon />
          </button>

          <h1 className="text-[36px] font-bold tracking-tight select-none">
            <span className="text-[#1D1D1D]">zy</span>
            <span className="text-[#8EB800]">Go</span>
          </h1>

          <button className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition">
            <SupportIcon />
          </button>
        </div>
      </header>

      {/* ── Page Title ───────────────────────────────────────── */}
      <div className="w-full max-w-[1400px] mx-auto px-8 pt-8">
        <h2 className="text-[28px] font-extrabold text-[#1D1D1D] tracking-tight">
          Ride Management
        </h2>
        <p className="text-[15px] text-[#6B7280] mt-1">
          Track, manage and take control your rides.
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="w-full max-w-[1400px] mx-auto px-8 pt-6">
        <Tabs active={activeTab} onChange={setActiveTab} />
      </div>

      {/* ── Main Grid ────────────────────────────────────────── */}
      <main className="w-full max-w-[1400px] mx-auto px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT: Status + Route (span 5) ─────────────── */}
          <section className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
            <h3 className="text-[24px] font-extrabold text-[#8EB800]">
              On The Way
            </h3>
            <p className="text-[14px] text-[#6B7280] mt-1">Arriving in</p>
            <p className="text-[32px] font-extrabold text-[#1D1D1D] leading-tight mt-1">
              5 min
            </p>
            <p className="text-[14px] text-[#6B7280]">(0.2 km away)</p>

            {/* ✅ FIXED: Illustration now fills the container */}
            <div className="relative my-6 h-[280px] lg:h-[320px] rounded-xl bg-gradient-to-br from-[#EAF7D4] to-[#F4FBE8] overflow-hidden">
              <img
                src={ride}
                alt="Ride illustration"
                className="absolute inset-0 w-full h-full object-contain object-center p-4"
              />
            </div>

            {/* Route stops */}
            <div className="relative flex flex-col gap-6 mt-4">
              <div className="absolute left-[9px] top-[26px] bottom-[26px] border-l border-dashed border-[#C7CAD1]" />

              <div className="relative flex items-start gap-4">
                <span className="w-5 h-5 rounded-full bg-[#8EB800] ring-4 ring-[#E8F5C8] shrink-0 mt-1" />
                <div>
                  <p className="text-[14px] font-semibold text-[#1D1D1D]">Pick up</p>
                  <p className="text-[13px] text-[#6B7280]">
                    123 Green Street, Springfield
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <span className="w-5 h-5 rounded-full border-2 border-[#8EB800] bg-white shrink-0 mt-1" />
                <div>
                  <p className="text-[14px] font-semibold text-[#1D1D1D]">Destination</p>
                  <p className="text-[13px] text-[#6B7280]">
                    456 Business Ave, Springfield
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── MIDDLE: Driver + Actions (span 3) ─────────── */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#DFF0BE] flex items-center justify-center text-[#8EB800] shrink-0">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-[#1D1D1D] truncate">
                      Mrtin Smith
                    </p>
                    <span className="flex items-center gap-1 text-[13px] font-semibold text-[#1D1D1D]">
                      <StarIcon /> 4.5
                    </span>
                  </div>
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5 truncate">
                    Toyota Corolla • White ( ND22GB )
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-5">
                <button className="w-11 h-11 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F4FBE8] hover:border-[#8EB800] transition">
                  <PhoneIcon />
                </button>
                <button className="w-11 h-11 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F4FBE8] hover:border-[#8EB800] transition">
                  <ChatIcon />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[18px] font-bold text-[#1D1D1D] mb-3">
                Ride Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <ActionTile icon={<ShareIcon />} label="Share Ride" />
                <ActionTile icon={<EditIcon />} label="Edit Ride" />
                <ActionTile icon={<PinIcon />} label="Add Stop" />
                <ActionTile icon={<CancelIcon />} label="Cancel" danger />
              </div>
            </div>
          </section>

          {/* ── RIGHT: Details (span 4) ───────────────────── */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
              <h3 className="text-[18px] font-bold text-[#1D1D1D] mb-4">
                Ride Details
              </h3>

              <div className="flex flex-col">
                <DetailRow
                  icon={<ClockIcon />}
                  label="Ride Time"
                  value="Today, 09:00 AM"
                />
                <DetailRow
                  icon={<DistanceIcon />}
                  label="Distance"
                  value="12.5 km"
                />
                <DetailRow
                  icon={<FareIcon />}
                  label="Fare"
                  value="$12.50"
                />
                <DetailRow
                  icon={<CardIcon />}
                  label="Payment Method"
                  value="VISA •••• 4242"
                />
              </div>

              <button className="mt-6 w-full flex items-center justify-center gap-2 text-[#8EB800] font-semibold text-[15px] hover:gap-3 transition-all">
                View Fare Breakdown
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RideManagement;