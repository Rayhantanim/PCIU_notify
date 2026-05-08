import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlertDialog from "../Dialogue";
import { FaChalkboardTeacher } from "react-icons/fa";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [recentNotices, setRecentNotices] = useState([]);
  const [stats, setStats] = useState({
    totalNotices: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
  });
  const [loading, setLoading] = useState(true);

  const API = "https://pciunotifybackend.onrender.com";

  // Get user info from localStorage
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const fullName = localStorage.getItem("fullName") || `${firstName} ${lastName}`;
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats
        const statsRes = await fetch(`${API}/api/dashboard-stats`);
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch all notices
        const noticesRes = await fetch(`${API}/api/notices`);
        const noticesData = await noticesRes.json();
        
        console.log("All notices:", noticesData.length);
        console.log("Logged in as:", fullName);
        
        // Filter notices created by this teacher
        const myNotices = noticesData.filter(notice => {
          if (!notice.createdBy || !fullName) return false;
           console.log(notice.createdBy)
          const createdByLower = notice.createdBy.toLowerCase().trim();
          const fullNameLower = fullName.toLowerCase().trim();
          
          // Direct match: "mumu israt" === "mumu israt"
          if (createdByLower === fullNameLower) return true;
          
          // Check reversed name: "israt mumu" === "mumu israt" reversed
          const nameParts = fullNameLower.split(' ');
          if (nameParts.length === 2) {
            const reversedName = `${nameParts[1]} ${nameParts[0]}`;
            if (createdByLower === reversedName) return true;
          }
          
          // Check if createdBy contains first name or last name
          if (firstName && createdByLower.includes(firstName.toLowerCase())) return true;
          if (lastName && createdByLower.includes(lastName.toLowerCase())) return true;
          
          return false;
        });
        
        console.log(`Found ${myNotices.length} notices created by ${fullName}`);
       
        // Get latest 5 notices
        setRecentNotices(myNotices.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <div className="px-20 py-6 border-b border-white/10 backdrop-blur-md bg-white">
        <h1 className="text-2xl font-bold flex items-center gap-2"> <FaChalkboardTeacher/> Teacher Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {fullName || "Teacher"}
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* STATS SECTION */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="p-5 rounded-2xl bg-white border border-white/10 hover:border-white/20 transition">
            <h2 className="text-sm text-gray-400">My Notices</h2>
            <p className="text-2xl font-bold mt-2">
              {loading ? '...' : recentNotices.length}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-white/10 hover:border-white/20 transition">
            <h2 className="text-sm text-gray-400">Total Students</h2>
            <p className="text-2xl font-bold mt-2">
              {loading ? '...' : stats.totalStudents}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-white/10 hover:border-white/20 transition">
            <h2 className="text-sm text-gray-400">Total All Notices</h2>
            <p className="text-2xl font-bold mt-2">
              {loading ? '...' : stats.totalNotices}
            </p>
          </div>

        </div>

        {/* ACTION CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Upload Notice */}
          <div className="p-6 bg-white border border-white/10 rounded-2xl  transition">
            <h3 className="text-lg font-semibold mb-2">📝 Upload Notice</h3>
            <p className="text-sm text-gray-400">
              Publish notices for students and staff instantly.
            </p>
            <div className="mt-4">
              <AlertDialog />
            </div>
          </div>

          {/* Manage Routine */}
          <div className="p-6 bg-white border border-white/10 rounded-2xl transition">
            <h3 className="text-lg font-semibold mb-2">📅 Manage Routine</h3>
            <p className="text-sm text-gray-400">
              Update class schedules and timing system.
            </p>
            <button className="mt-4 w-full px-4 py-2 font-bold text-black rounded-xl text-sm bg-gray-200 transition">
              Edit Routine
            </button>
          </div>

          {/* Students */}
          <div className="p-6 bg-white border border-white/10 rounded-2xl transition">
            <h3 className="text-lg font-semibold mb-2">👨‍🎓 Students</h3>
            <p className="text-sm text-gray-400">
              View and manage enrolled students.
            </p>
            <button className="mt-4 w-full px-4 py-2 font-bold text-black rounded-xl text-sm bg-gray-200 transition">
              View Students
            </button>
          </div>

        </div>

        {/* RECENT ACTIVITY */}
        <div className="p-6 bg-white border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📌 My Recent Notices</h2>
            <button 
              onClick={() => navigate('/dashboard/allnotices')}
              className="text-lg font-bold text-blue-600 hover:text-blue-400 transition"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/4 mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentNotices.length > 0 ? (
            <ul className="space-y-4 ">
              {recentNotices.map((notice) => (
                <li 
                  key={notice._id} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white border transition cursor-pointer"
                >
                  {/* Priority Indicator */}
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    notice.priority === 'urgent' ? 'bg-red-500' :
                    notice.priority === 'high' ? 'bg-orange-500' :
                    notice.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></span>
                  
                  <div className="flex-1 min-w-0">
  {/* Title Row */}
  <div className="flex items-center gap-3 flex-wrap mb-2">
    <h3 className="font-semibold text-gray-900 text-base truncate hover:text-blue-600 transition-colors">
      {notice.title}
    </h3>
    
    {/* Pinned Badge */}
    {notice.isPinned && (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 10-2 0v3a1 1 0 102 0V3zM6.05 7.05a1 1 0 111.414-1.414L10 8.172l2.536-2.536a1 1 0 111.414 1.414L11.414 9.586V15a1 1 0 11-2 0V9.586L6.05 7.05z"/>
        </svg>
        Pinned
      </span>
    )}
    
    {/* Priority Badge */}
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
      notice.priority === 'urgent' 
        ? 'bg-red-50 text-red-700 border-red-200' 
        : notice.priority === 'high'
        ? 'bg-orange-50 text-orange-700 border-orange-200'
        : notice.priority === 'medium'
        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
        : 'bg-green-50 text-green-700 border-green-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        notice.priority === 'urgent' 
          ? 'bg-red-500' 
          : notice.priority === 'high'
          ? 'bg-orange-500'
          : notice.priority === 'medium'
          ? 'bg-yellow-500'
          : 'bg-green-500'
      }`}></span>
      {notice.priority}
    </span>
  </div>
  
  {/* Meta Information */}
  <div className="flex items-center gap-6 text-xs text-gray-500 mb-2">
    <div className="flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>{formatDate(notice.createdAt)}</span>
    </div>
    
    <div className="flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <span className="capitalize">{notice.category}</span>
    </div>
    
    <div className="flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>{notice.createdBy || "Unknown"}</span>
    </div>

    {notice.audience && notice.audience.length > 0 && (
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="capitalize">{notice.audience.join(', ')}</span>
      </div>
    )}
  </div>
  
  {/* Description */}
  {notice.description && (
    <div className="mt-2 pl-1 border-l-2 border-gray-200">
      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
        {notice.description.replace(/<[^>]*>/g, '').substring(0, 120)}
        {notice.description.replace(/<[^>]*>/g, '').length > 120 ? '...' : ''}
      </p>
    </div>
  )}
  
  {/* Expiry Date if exists */}
  {notice.expiryDate && (
    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Expires: {formatDate(notice.expiryDate)}</span>
    </div>
  )}
</div>

                  {notice.attachment && (
                    <span className="text-gray-500" title="Has attachment">📎</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">You haven't published any notices yet</p>
              <p className="text-sm text-gray-500 mt-1">Click "Upload Notice" to create your first notice</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}