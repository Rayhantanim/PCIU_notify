import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ───────────────────────── Icons ───────────────────────── */

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ContactSupportIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4v-4H6a2 2 0 0 1-2-2z" />
    <path d="M9 9h.01M12 9h.01M15 9h.01" strokeWidth="2.5" />
  </svg>
);

const ReportDriverIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21V4" />
    <path d="M4 4h13l-2 4 2 4H4" />
  </svg>
);

const LostFoundIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2" />
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M3 13h18" />
  </svg>
);

const RefundIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D1D1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

/* ───────────────────────── Quick Action Tile ───────────────────────── */
const QuickAction = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 bg-white border border-[#E5E7EB] rounded-2xl py-6 px-4 hover:border-[#8EB800] hover:shadow-md transition min-h-[140px]"
  >
    {icon}
    <span className="text-[14px] font-medium text-[#1D1D1D] text-center leading-tight">
      {label}
    </span>
  </button>
);

/* ───────────────────────── Complaint Row ───────────────────────── */
const ComplaintRow = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-5 px-2 hover:bg-[#F9FAFB] rounded-lg transition text-left"
  >
    <span className="text-[15px] text-[#1D1D1D]">{label}</span>
    <ChevronRight />
  </button>
);

/* ───────────────────────── Request Card ───────────────────────── */
const RequestCard = ({ title, id, date, status, statusColor }) => (
  <button className="w-full flex items-center justify-between py-5 text-left hover:bg-[#F9FAFB] rounded-lg transition px-2">
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="text-[15px] font-semibold text-[#1D1D1D]">{title}</span>
        <span className="text-[14px] text-[#9CA3AF]">#{id}</span>
      </div>
      <span className="text-[13px] text-[#9CA3AF]">{date}</span>
    </div>
    <span className={`text-[14px] font-semibold ${statusColor}`}>{status}</span>
  </button>
);

/* ───────────────────────── Main Component ───────────────────────── */
const Support = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions = [
    { icon: <ContactSupportIcon />, label: 'Contact Support' },
    { icon: <ReportDriverIcon />, label: 'Report Driver' },
    { icon: <LostFoundIcon />, label: 'Lost & Found' },
    { icon: <RefundIcon />, label: 'Refund Request' },
  ];

  const complaints = [
    'Wrong fare charged',
    'Driver didn’t arrive on time',
    'Safety concern',
    'Lost items',
    'Poor vehicle condition',
  ];

  const requests = [
    {
      title: 'Refund request',
      id: '0001',
      date: 'Today, 12 : 00 am',
      status: 'In Process',
      statusColor: 'text-[#F59E0B]',
    },
    {
      title: 'Lost & Found',
      id: '0101',
      date: '10/04/2026 , 12 : 00 am',
      status: 'Received',
      statusColor: 'text-[#8EB800]',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="w-full border-b border-[#F0F1F3]">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition"
          >
            <BackIcon />
          </button>
          <h1 className="flex-1 text-center text-[26px] md:text-[28px] font-extrabold text-[#1D1D1D] tracking-tight">
            Help &amp; Support
          </h1>
          {/* Spacer so the title truly centers */}
          <div className="w-10" />
        </div>
      </header>

      {/* ── Search Bar ───────────────────────────────────────── */}
      <div className="w-full max-w-[1400px] mx-auto px-8 pt-8">
        <div className="relative max-w-[640px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help"
            className="w-full pl-6 pr-14 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-[15px] text-[#1D1D1D] placeholder:text-[#9CA3AF] outline-none focus:border-[#8EB800] focus:ring-2 focus:ring-[#E8F5C8] transition"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
        </div>
      </div>

      {/* ── Main Content Grid ────────────────────────────────── */}
      <main className="w-full max-w-[1400px] mx-auto px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ─── LEFT COLUMN ─────────────────────────────────── */}
          <section className="lg:col-span-7 flex flex-col gap-10">

            {/* Quick Actions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] font-extrabold text-[#1D1D1D] tracking-tight">
                  Quick Actions
                </h2>
                <button className="text-[14px] font-medium text-[#6B7280] hover:text-[#8EB800] transition">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((a) => (
                  <QuickAction key={a.label} icon={a.icon} label={a.label} />
                ))}
              </div>
            </div>

            {/* Popular Complaints */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[22px] font-extrabold text-[#1D1D1D] tracking-tight">
                  Popular Complaints
                </h2>
                <button className="text-[14px] font-medium text-[#6B7280] hover:text-[#8EB800] transition">
                  View All
                </button>
              </div>
              <div className="flex flex-col divide-y divide-[#F0F1F3]">
                {complaints.map((c) => (
                  <ComplaintRow key={c} label={c} />
                ))}
              </div>
            </div>
          </section>

          {/* ─── RIGHT COLUMN ────────────────────────────────── */}
          <section className="lg:col-span-5 flex flex-col gap-6">

            {/* Requests */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[22px] font-extrabold text-[#1D1D1D] tracking-tight">
                  Requests
                </h2>
                <button className="text-[14px] font-medium text-[#6B7280] hover:text-[#8EB800] transition">
                  View All
                </button>
              </div>
              <div className="flex flex-col divide-y divide-[#F0F1F3]">
                {requests.map((r) => (
                  <RequestCard key={r.id} {...r} />
                ))}
              </div>
            </div>

            {/* Chat With Support button */}
            <button className="w-full bg-[#8EB800] hover:bg-[#7aa300] text-white font-semibold text-[16px] py-5 rounded-full shadow-md transition mt-4">
              Chat With Support
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Support;