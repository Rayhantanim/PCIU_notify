import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlertDialog from "../Dialogue";

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

  const API = "http://localhost:5000";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">

      {/* HEADER */}
      <div className="px-20 py-6 border-b border-white/10 backdrop-blur-md bg-white/5">
        <h1 className="text-2xl font-bold">👨‍🏫 Teacher Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {fullName || "Teacher"}
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* STATS SECTION */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition">
            <h2 className="text-sm text-gray-400">My Notices</h2>
            <p className="text-2xl font-bold mt-2">
              {loading ? '...' : recentNotices.length}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition">
            <h2 className="text-sm text-gray-400">Total Students</h2>
            <p className="text-2xl font-bold mt-2">
              {loading ? '...' : stats.totalStudents}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition">
            <h2 className="text-sm text-gray-400">Total All Notices</h2>
            <p className="text-2xl font-bold mt-2">
              {loading ? '...' : stats.totalNotices}
            </p>
          </div>

        </div>

        {/* ACTION CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Upload Notice */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold mb-2">📝 Upload Notice</h3>
            <p className="text-sm text-gray-400">
              Publish notices for students and staff instantly.
            </p>
            <div className="mt-4">
              <AlertDialog />
            </div>
          </div>

          {/* Manage Routine */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold mb-2">📅 Manage Routine</h3>
            <p className="text-sm text-gray-400">
              Update class schedules and timing system.
            </p>
            <button className="mt-4 w-full px-4 py-2 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition">
              Edit Routine
            </button>
          </div>

          {/* Students */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold mb-2">👨‍🎓 Students</h3>
            <p className="text-sm text-gray-400">
              View and manage enrolled students.
            </p>
            <button className="mt-4 w-full px-4 py-2 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition">
              View Students
            </button>
          </div>

        </div>

        {/* RECENT ACTIVITY */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📌 My Recent Notices</h2>
            <button 
              onClick={() => navigate('/dashboard/allnotices')}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
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
            <ul className="space-y-4">
              {recentNotices.map((notice) => (
                <li 
                  key={notice._id} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition cursor-pointer"
                >
                  {/* Priority Indicator */}
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    notice.priority === 'urgent' ? 'bg-red-500' :
                    notice.priority === 'high' ? 'bg-orange-500' :
                    notice.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-white truncate">
                        {notice.title}
                      </h3>
                      {notice.isPinned && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                          📌 Pinned
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        notice.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        notice.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        notice.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {notice.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>📅 {formatDate(notice.createdAt)}</span>
                      <span>📂 {notice.category}</span>
                      <span>✍️ {notice.createdBy}</span>
                    </div>
                    
                    {notice.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {notice.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                        {notice.description.replace(/<[^>]*>/g, '').length > 100 ? '...' : ''}
                      </p>
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