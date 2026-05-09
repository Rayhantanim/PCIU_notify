import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminOverView = () => {
  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    totalUsers: 0,
    activeUsers: 0,
    newStudentsToday: 0,
    newTeachersToday: 0
  });

  const [noticeStats, setNoticeStats] = useState({
    totalNotices: 0,
    publishedToday: 0,
    pendingNotices: 0,
    expiredNotices: 0,
    pinnedNotices: 0,
    urgentNotices: 0,
    noticesThisWeek: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [upcomingExpiries, setUpcomingExpiries] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, statsRes, noticesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/dashboard-stats`).catch(() => ({ data: {} })),
        axios.get(`${API_BASE_URL}/notices`, { headers: { 'user-role': 'admin' } }).catch(() => ({ data: [] }))
      ]);

      // Process users data
      const users = usersRes.data || [];
      processUserStats(users);
      processUserGrowth(users);
      
      // Process stats from backend
      if (statsRes.data) {
        setStats(prev => ({
          ...prev,
          totalStudents: statsRes.data.totalStudents || prev.totalStudents,
          totalTeachers: statsRes.data.totalTeachers || prev.totalTeachers,
          totalStaff: statsRes.data.totalStaff || prev.totalStaff,
        }));
      }

      // Process notices
      const notices = noticesRes.data || [];
      processNoticeStats(notices);
      processRecentNotices(notices);
      processUpcomingExpiries(notices);
      
      // Generate recent activities
      processRecentActivities(users, notices);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Use sample data as fallback
      useSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Process user statistics
  const processUserStats = (users) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    const staff = users.filter(u => u.role === 'staff');
    const active = users.filter(u => u.isActive !== false);
    
    // New users today
    const newStudentsToday = students.filter(u => {
      const created = new Date(u.createdAt || u.joinDate);
      return created >= today;
    }).length;
    
    const newTeachersToday = teachers.filter(u => {
      const created = new Date(u.createdAt || u.joinDate);
      return created >= today;
    }).length;

    setStats(prev => ({
      ...prev,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalStaff: staff.length,
      totalUsers: users.length,
      activeUsers: active.length,
      newStudentsToday,
      newTeachersToday
    }));
  };

  // Process notice statistics
  const processNoticeStats = (notices) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const publishedToday = notices.filter(n => {
      const created = new Date(n.createdAt);
      return created >= today;
    }).length;
    
    const pendingNotices = notices.filter(n => n.status === 'draft').length;
    
    const expiredNotices = notices.filter(n => {
      return n.expiryDate && new Date(n.expiryDate) < now;
    }).length;
    
    const pinnedNotices = notices.filter(n => n.isPinned).length;
    
    const urgentNotices = notices.filter(n => n.priority === 'urgent' || n.priority === 'high').length;
    
    const noticesThisWeek = notices.filter(n => {
      const created = new Date(n.createdAt);
      return created >= weekAgo;
    }).length;

    setNoticeStats({
      totalNotices: notices.length,
      publishedToday,
      pendingNotices,
      expiredNotices,
      pinnedNotices,
      urgentNotices,
      noticesThisWeek
    });
  };

  // Process recent notices
  const processRecentNotices = (notices) => {
    const sorted = notices
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentNotices(sorted);
  };

  // Process upcoming expiries
  const processUpcomingExpiries = (notices) => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcoming = notices
      .filter(n => {
        if (!n.expiryDate) return false;
        const expiry = new Date(n.expiryDate);
        return expiry > now && expiry <= nextWeek;
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 5);
    
    setUpcomingExpiries(upcoming);
  };

  // Process user growth data (last 7 days)
  const processUserGrowth = (users) => {
    const now = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const count = users.filter(u => {
        const created = new Date(u.createdAt || u.joinDate);
        return created >= date && created < nextDate;
      }).length;
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        count
      });
    }
    
    setUserGrowth(days);
  };

  // Process recent activities
  const processRecentActivities = (users, notices) => {
    const activities = [];
    
    // Recent user registrations
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate))
      .slice(0, 5);
    
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user_created',
        icon: '👤',
        color: 'bg-blue-100 text-blue-800',
        message: `${user.firstName} ${user.lastName} registered as ${user.role}`,
        time: user.createdAt || user.joinDate,
        user: user
      });
    });
    
    // Recent notices
    const recentNoticesList = notices
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    recentNoticesList.forEach(notice => {
      activities.push({
        id: `notice-${notice._id}`,
        type: 'notice_created',
        icon: '📢',
        color: 'bg-green-100 text-green-800',
        message: `Notice published: "${notice.title}"`,
        time: notice.createdAt,
        notice: notice
      });
    });
    
    // Sort all activities by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    setRecentActivities(activities.slice(0, 10));
  };

  // Sample data fallback
  const useSampleData = () => {
    setStats({
      totalStudents: 1250,
      totalTeachers: 85,
      totalStaff: 45,
      totalUsers: 1380,
      activeUsers: 1320,
      newStudentsToday: 12,
      newTeachersToday: 2
    });

    setNoticeStats({
      totalNotices: 156,
      publishedToday: 3,
      pendingNotices: 5,
      expiredNotices: 23,
      pinnedNotices: 4,
      urgentNotices: 2,
      noticesThisWeek: 18
    });

    setRecentActivities([
      { id: '1', type: 'user_created', icon: '👤', color: 'bg-blue-100 text-blue-800', message: 'John Doe registered as student', time: new Date(Date.now() - 15 * 60000) },
      { id: '2', type: 'notice_created', icon: '📢', color: 'bg-green-100 text-green-800', message: 'Notice published: "Final Exam Schedule"', time: new Date(Date.now() - 30 * 60000) },
      { id: '3', type: 'user_created', icon: '👤', color: 'bg-blue-100 text-blue-800', message: 'Jane Smith registered as teacher', time: new Date(Date.now() - 45 * 60000) },
      { id: '4', type: 'notice_created', icon: '📢', color: 'bg-green-100 text-green-800', message: 'Notice published: "Holiday Notice"', time: new Date(Date.now() - 60 * 60000) },
      { id: '5', type: 'user_updated', icon: '✏️', color: 'bg-yellow-100 text-yellow-800', message: 'Updated department for Sarah Ahmed', time: new Date(Date.now() - 120 * 60000) },
      { id: '6', type: 'notice_expired', icon: '⏰', color: 'bg-red-100 text-red-800', message: 'Notice expired: "Workshop Registration"', time: new Date(Date.now() - 180 * 60000) },
      { id: '7', type: 'user_created', icon: '👤', color: 'bg-blue-100 text-blue-800', message: 'Robert Johnson registered as staff', time: new Date(Date.now() - 240 * 60000) }
    ]);

    setUserGrowth([
      { date: 'Mon, Jan 15', count: 5 },
      { date: 'Tue, Jan 16', count: 8 },
      { date: 'Wed, Jan 17', count: 12 },
      { date: 'Thu, Jan 18', count: 7 },
      { date: 'Fri, Jan 19', count: 15 },
      { date: 'Sat, Jan 20', count: 3 },
      { date: 'Sun, Jan 21', count: 2 }
    ]);
  };

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 172800) return 'Yesterday';
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get trend indicator
  const getTrend = (value, type) => {
    if (value > 10) {
      return (
        <span className="text-green-500 text-xs flex items-center gap-1">
          ↑ High
        </span>
      );
    } else if (value > 5) {
      return (
        <span className="text-blue-500 text-xs flex items-center gap-1">
          → Moderate
        </span>
      );
    }
    return (
      <span className="text-gray-500 text-xs flex items-center gap-1">
        ↓ Low
      </span>
    );
  };

  if (loading && stats.totalUsers === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening today - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
              👥
            </div>
            {getTrend(stats.activeUsers, 'users')}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-xs text-gray-400 mt-1">{stats.activeUsers} active</p>
        </div>

        {/* Students */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
              🎓
            </div>
            <span className="text-green-500 text-xs">+{stats.newStudentsToday}</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-600">{stats.totalStudents}</h3>
          <p className="text-gray-500 text-sm">Students</p>
          <p className="text-xs text-gray-400 mt-1">{stats.newStudentsToday} new today</p>
        </div>

        {/* Teachers */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
              👨‍🏫
            </div>
            <span className="text-green-500 text-xs">+{stats.newTeachersToday}</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-600">{stats.totalTeachers}</h3>
          <p className="text-gray-500 text-sm">Teachers</p>
          <p className="text-xs text-gray-400 mt-1">{stats.newTeachersToday} new today</p>
        </div>

        {/* Staff */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">
              💼
            </div>
          </div>
          <h3 className="text-2xl font-bold text-orange-600">{stats.totalStaff}</h3>
          <p className="text-gray-500 text-sm">Staff</p>
        </div>

        {/* Published Today */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
              📢
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-600">{noticeStats.publishedToday}</h3>
          <p className="text-gray-500 text-sm">Published Today</p>
        </div>

        {/* Urgent Notices */}
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-xl">
              🚨
            </div>
          </div>
          <h3 className="text-2xl font-bold text-red-600">{noticeStats.urgentNotices}</h3>
          <p className="text-gray-500 text-sm">Urgent Notices</p>
        </div>
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Notices */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-sm text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">
              📋
            </div>
            <span className="text-blue-100 text-xs">All time</span>
          </div>
          <h3 className="text-3xl font-bold">{noticeStats.totalNotices}</h3>
          <p className="text-blue-100 text-sm">Total Notices</p>
        </div>

        {/* This Week */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl shadow-sm text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">
              📅
            </div>
            <span className="text-purple-100 text-xs">+{noticeStats.noticesThisWeek}</span>
          </div>
          <h3 className="text-3xl font-bold">{noticeStats.noticesThisWeek}</h3>
          <p className="text-purple-100 text-sm">This Week</p>
        </div>

        {/* Pinned */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 rounded-xl shadow-sm text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">
              📌
            </div>
          </div>
          <h3 className="text-3xl font-bold">{noticeStats.pinnedNotices}</h3>
          <p className="text-yellow-100 text-sm">Pinned Notices</p>
        </div>

        {/* Pending/Expired */}
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-5 rounded-xl shadow-sm text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">
              ⚠️
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-bold">{noticeStats.pendingNotices}</h3>
            <span className="text-gray-300">/</span>
            <h3 className="text-3xl font-bold">{noticeStats.expiredNotices}</h3>
          </div>
          <p className="text-gray-300 text-sm">Pending / Expired</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart (Left - 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">User Growth (Last 7 Days)</h3>
            <span className="text-sm text-gray-500">New registrations</span>
          </div>
          
          <div className="flex items-end justify-between gap-2" style={{ height: '200px' }}>
            {userGrowth.map((day, index) => {
              const maxCount = Math.max(...userGrowth.map(d => d.count), 1);
              const height = (day.count / maxCount) * 150;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-700 mb-1">
                      {day.count}
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${height}px`, minHeight: day.count > 0 ? '20px' : '4px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {day.date.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Total this week: <strong className="text-gray-800">
                  {userGrowth.reduce((sum, day) => sum + day.count, 0)}
                </strong>
              </span>
              <span className="text-green-600">
                ↑ {((userGrowth.reduce((sum, day) => sum + day.count, 0) / 7).toFixed(1))} avg/day
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary (Right - 1 column) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Summary</h3>
          
          <div className="space-y-4">
            {/* Student-Teacher Ratio */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Student-Teacher Ratio</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats.totalTeachers > 0 ? Math.min((stats.totalStudents / stats.totalTeachers / 20) * 100, 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {stats.totalTeachers > 0 ? (stats.totalStudents / stats.totalTeachers).toFixed(1) : '0'}:1
                </span>
              </div>
            </div>

            {/* Active Users */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Active Users</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            {/* Notice Activity */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Notice Activity</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min((noticeStats.noticesThisWeek / 7) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {noticeStats.noticesThisWeek} this week
                </span>
              </div>
            </div>
          </div>

          {/* Distribution Pie (Simple representation) */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">User Distribution</h4>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500"
                style={{ width: `${stats.totalUsers > 0 ? (stats.totalStudents / stats.totalUsers) * 100 : 0}%` }}
              ></div>
              <div 
                className="bg-purple-500"
                style={{ width: `${stats.totalUsers > 0 ? (stats.totalTeachers / stats.totalUsers) * 100 : 0}%` }}
              ></div>
              <div 
                className="bg-orange-500"
                style={{ width: `${stats.totalUsers > 0 ? (stats.totalStaff / stats.totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Students ({stats.totalStudents})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-600">Teachers ({stats.totalTeachers})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-gray-600">Staff ({stats.totalStaff})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">View All</span>
          </div>
          
          <div className="space-y-1">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`w-9 h-9 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Expiries & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Expiries */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              ⏰ Upcoming Expiries
              {upcomingExpiries.length > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                  {upcomingExpiries.length}
                </span>
              )}
            </h3>
            
            {upcomingExpiries.length > 0 ? (
              <div className="space-y-3">
                {upcomingExpiries.map(notice => (
                  <div key={notice._id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm font-medium text-gray-800 truncate">{notice.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-red-500">
                        Expires: {formatDate(notice.expiryDate)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {Math.ceil((new Date(notice.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm">No upcoming expiries</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-center">
                <span className="text-2xl block mb-1">➕</span>
                <span className="text-xs text-blue-700 font-medium">Add User</span>
              </button>
              <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-center">
                <span className="text-2xl block mb-1">📢</span>
                <span className="text-xs text-green-700 font-medium">New Notice</span>
              </button>
              <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-center">
                <span className="text-2xl block mb-1">🏛️</span>
                <span className="text-xs text-purple-700 font-medium">Add Dept</span>
              </button>
              <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-center">
                <span className="text-2xl block mb-1">📊</span>
                <span className="text-xs text-orange-700 font-medium">Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverView;