import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function StudentDashboard() {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noticeFilter, setNoticeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // Get user info from localStorage (set during login)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    
    setUserInfo({ userId, role, firstName, lastName });
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [userInfo]);

  useEffect(() => {
    filterNotices();
  }, [noticeFilter, searchTerm, notices]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all notices from your backend
      const noticesRes = await axios.get("https://pciu-notify-backend.vercel.app/api/notices");
      
      // Filter notices for students based on audience field
      let studentNotices = noticesRes.data;
      if (userInfo?.role === "student") {
        studentNotices = noticesRes.data.filter(notice => {
          // Show notice if audience is empty, includes 'all', or includes 'student'
          return !notice.audience || 
                 notice.audience.length === 0 || 
                 notice.audience.includes("all") || 
                 notice.audience.includes("student");
        });
      }
      
      setNotices(studentNotices);
      setFilteredNotices(studentNotices);
      
      // Fetch today's classes (you'll need to create this endpoint)
      try {
        const classesRes = await axios.get("https://pciu-notify-backend.vercel.app/api/classes/today");
        setTodayClasses(classesRes.data);
      } catch (error) {
        console.log("Classes endpoint not ready yet");
        setTodayClasses([]);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const filterNotices = () => {
    let filtered = [...notices];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notice => 
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by priority/recent
    if (noticeFilter === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(notice => new Date(notice.createdAt) >= sevenDaysAgo);
    } else if (noticeFilter === "important") {
      filtered = filtered.filter(notice => notice.priority === "high" || notice.isPinned === true);
    }
    
    setFilteredNotices(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {userInfo?.firstName || "Student"}!
        </h1>
        <p className="text-gray-600">Here's what's happening today</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Notices Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-gray-800">📢 Notices</h2>
            <div className="flex gap-2">
              <select
                value={noticeFilter}
                onChange={(e) => setNoticeFilter(e.target.value)}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-300"
              >
                <option value="all">All Notices</option>
                <option value="recent">Last 7 Days</option>
                <option value="important">Important</option>
              </select>
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-500 border border-gray-300"
              />
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notices found</p>
            ) : (
              filteredNotices.map((notice) => (
                <div key={notice._id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        {(notice.priority === "high" || notice.isPinned) && "⚠️ "}
                        {notice.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notice.description}</p>
                      {notice.category && (
                        <span className="text-xs text-gray-500 mt-1 inline-block bg-gray-200 px-2 py-1 rounded">
                          {notice.category}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Classes Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 Today's Schedule</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No classes scheduled for today</p>
                <p className="text-sm text-gray-400 mt-2">Check back tomorrow!</p>
              </div>
            ) : (
              todayClasses.map((classItem, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">{classItem.subjectName}</h3>
                      <p className="text-sm text-gray-600">👨‍🏫 {classItem.teacherName}</p>
                      <p className="text-sm text-gray-600">🏠 Room: {classItem.roomNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{classItem.startTime} - {classItem.endTime}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}