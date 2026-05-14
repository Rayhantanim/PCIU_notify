import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../Context/ThemeContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://pciunotifybackend.onrender.com/api';

const AdminOverView = () => {
  const { isDarkMode } = useTheme();
  
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
  const [allUsers, setAllUsers] = useState([]);
  const [allNotices, setAllNotices] = useState([]);

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, statsRes, noticesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/dashboard-stats`).catch(() => ({ data: {} })),
        axios.get(`${API_BASE_URL}/notices`, { headers: { 'user-role': 'admin' } }).catch(() => ({ data: [] }))
      ]);

      const users = usersRes.data || [];
      const notices = noticesRes.data || [];
      setAllUsers(users);
      setAllNotices(notices);
      
      processUserStats(users);
      processUserGrowth(users);
      
      if (statsRes.data) {
        setStats(prev => ({
          ...prev,
          totalStudents: statsRes.data.totalStudents || prev.totalStudents,
          totalTeachers: statsRes.data.totalTeachers || prev.totalTeachers,
          totalStaff: statsRes.data.totalStaff || prev.totalStaff,
        }));
      }

      processNoticeStats(notices);
      processRecentNotices(notices);
      processUpcomingExpiries(notices);
      processRecentActivities(users, notices);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      useSampleData();
    } finally {
      setLoading(false);
    }
  };

  const processUserStats = (users) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    const staff = users.filter(u => u.role === 'staff');
    const active = users.filter(u => u.isActive !== false);
    
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

  const processNoticeStats = (notices) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const publishedToday = notices.filter(n => {
      const created = new Date(n.createdAt);
      return created >= today;
    }).length;
    
    const pendingNotices = notices.filter(n => n.status === 'draft').length;
    const expiredNotices = notices.filter(n => n.expiryDate && new Date(n.expiryDate) < now).length;
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

  const processRecentNotices = (notices) => {
    const sorted = notices
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentNotices(sorted);
  };

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

  const processRecentActivities = (users, notices) => {
    const activities = [];
    
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate))
      .slice(0, 5);
    
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user_created',
        icon: '👤',
        color: isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
        message: `${user.firstName} ${user.lastName} registered as ${user.role}`,
        time: user.createdAt || user.joinDate,
        user: user
      });
    });
    
    const recentNoticesList = notices
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    recentNoticesList.forEach(notice => {
      activities.push({
        id: `notice-${notice._id}`,
        type: 'notice_created',
        icon: '📢',
        color: isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
        message: `Notice published: "${notice.title}"`,
        time: notice.createdAt,
        notice: notice
      });
    });
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivities(activities.slice(0, 10));
  };

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

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 172800) return 'Yesterday';
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Action Handlers
  const handleDeleteUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Delete User',
      text: `Are you sure you want to delete ${userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${userId}`);
        toast.success(`${userName} deleted successfully`, {
          theme: isDarkMode ? 'dark' : 'light',
        });
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to delete user', {
          theme: isDarkMode ? 'dark' : 'light',
        });
      }
    }
  };

  const handleDeleteNotice = async (noticeId, noticeTitle) => {
    const result = await Swal.fire({
      title: 'Delete Notice',
      text: `Are you sure you want to delete "${noticeTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/notices/${noticeId}`);
        toast.success('Notice deleted successfully', {
          theme: isDarkMode ? 'dark' : 'light',
        });
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to delete notice', {
          theme: isDarkMode ? 'dark' : 'light',
        });
      }
    }
  };

  const handleEditNotice = async (notice) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Notice',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title" value="${notice.title}">
        <textarea id="swal-description" class="swal2-textarea" placeholder="Description">${notice.description?.replace(/<[^>]*>/g, '') || ''}</textarea>
        <select id="swal-category" class="swal2-select">
          <option value="general" ${notice.category === 'general' ? 'selected' : ''}>General</option>
          <option value="academic" ${notice.category === 'academic' ? 'selected' : ''}>Academic</option>
          <option value="exam" ${notice.category === 'exam' ? 'selected' : ''}>Exam</option>
          <option value="event" ${notice.category === 'event' ? 'selected' : ''}>Event</option>
          <option value="urgent" ${notice.category === 'urgent' ? 'selected' : ''}>Urgent</option>
        </select>
        <select id="swal-priority" class="swal2-select">
          <option value="low" ${notice.priority === 'low' ? 'selected' : ''}>Low</option>
          <option value="medium" ${notice.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="high" ${notice.priority === 'high' ? 'selected' : ''}>High</option>
          <option value="urgent" ${notice.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: document.getElementById('swal-title').value,
          description: document.getElementById('swal-description').value,
          category: document.getElementById('swal-category').value,
          priority: document.getElementById('swal-priority').value,
        };
      },
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });

    if (formValues) {
      try {
        await axios.put(`${API_BASE_URL}/notices/${notice._id}`, formValues);
        toast.success('Notice updated successfully', {
          theme: isDarkMode ? 'dark' : 'light',
        });
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to update notice', {
          theme: isDarkMode ? 'dark' : 'light',
        });
      }
    }
  };

  const handleResetSystem = async () => {
    const result = await Swal.fire({
      title: 'Reset System?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reset!',
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      toast.info('System reset functionality will be implemented with backend', {
        theme: isDarkMode ? 'dark' : 'light',
      });
    }
  };

  const StatCard = ({ title, value, icon, color, subtext, trend, borderColor }) => (
    <div className={`rounded-xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    } border shadow-sm hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${color.bg}`}>
          {icon}
        </div>
        {trend && <span className={`text-xs ${trend.color}`}>{trend.text}</span>}
      </div>
      <h3 className={`text-2xl font-bold ${color.text}`}>{value}</h3>
      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      {subtext && <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtext}</p>}
    </div>
  );

  if (loading && stats.totalUsers === 0) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard Overview</h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Welcome back! Here's what's happening today - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color={{ bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' }}
            subtext={`${stats.activeUsers} active`}
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            icon="🎓"
            color={{ bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' }}
            subtext={`+${stats.newStudentsToday} today`}
          />
          <StatCard
            title="Teachers"
            value={stats.totalTeachers}
            icon="👨‍🏫"
            color={{ bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' }}
            subtext={`+${stats.newTeachersToday} today`}
          />
          <StatCard
            title="Staff"
            value={stats.totalStaff}
            icon="💼"
            color={{ bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' }}
          />
          <StatCard
            title="Published Today"
            value={noticeStats.publishedToday}
            icon="📢"
            color={{ bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' }}
          />
          <StatCard
            title="Urgent Notices"
            value={noticeStats.urgentNotices}
            icon="🚨"
            color={{ bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }}
          />
        </div>

        {/* Stats Grid - Row 2 - Gradient Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-sm text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">📋</div>
              <span className="text-blue-100 text-xs">All time</span>
            </div>
            <h3 className="text-3xl font-bold">{noticeStats.totalNotices}</h3>
            <p className="text-blue-100 text-sm">Total Notices</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl shadow-sm text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">📅</div>
              <span className="text-purple-100 text-xs">+{noticeStats.noticesThisWeek}</span>
            </div>
            <h3 className="text-3xl font-bold">{noticeStats.noticesThisWeek}</h3>
            <p className="text-purple-100 text-sm">This Week</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 rounded-xl shadow-sm text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">📌</div>
            </div>
            <h3 className="text-3xl font-bold">{noticeStats.pinnedNotices}</h3>
            <p className="text-yellow-100 text-sm">Pinned Notices</p>
          </div>

          <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-5 rounded-xl shadow-sm text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">⚠️</div>
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
          {/* User Growth Chart */}
          <div className={`lg:col-span-2 rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                User Growth (Last 7 Days)
              </h3>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                New registrations
              </span>
            </div>
            
            <div className="flex items-end justify-between gap-2" style={{ height: '200px' }}>
              {userGrowth.map((day, index) => {
                const maxCount = Math.max(...userGrowth.map(d => d.count), 1);
                const height = (day.count / maxCount) * 150;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center">
                      <span className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {day.count}
                      </span>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                        style={{ height: `${height}px`, minHeight: day.count > 0 ? '20px' : '4px' }}
                      ></div>
                    </div>
                    <span className={`text-xs mt-2 transform -rotate-45 origin-top-left whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {day.date.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Total this week: <strong className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                    {userGrowth.reduce((sum, day) => sum + day.count, 0)}
                  </strong>
                </span>
                <span className="text-green-600">
                  ↑ {((userGrowth.reduce((sum, day) => sum + day.count, 0) / 7).toFixed(1))} avg/day
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Quick Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Student-Teacher Ratio</p>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.totalTeachers > 0 ? Math.min((stats.totalStudents / stats.totalTeachers / 20) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stats.totalTeachers > 0 ? (stats.totalStudents / stats.totalTeachers).toFixed(1) : '0'}:1
                  </span>
                </div>
              </div>

              <div>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Users</p>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              <div>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Notice Activity</p>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((noticeStats.noticesThisWeek / 7) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {noticeStats.noticesThisWeek} this week
                  </span>
                </div>
              </div>
            </div>

            <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                User Distribution
              </h4>
              <div className="flex h-4 rounded-full overflow-hidden">
                <div className="bg-blue-500 transition-all" style={{ width: `${stats.totalUsers > 0 ? (stats.totalStudents / stats.totalUsers) * 100 : 0}%` }}></div>
                <div className="bg-purple-500 transition-all" style={{ width: `${stats.totalUsers > 0 ? (stats.totalTeachers / stats.totalUsers) * 100 : 0}%` }}></div>
                <div className="bg-orange-500 transition-all" style={{ width: `${stats.totalUsers > 0 ? (stats.totalStaff / stats.totalUsers) * 100 : 0}%` }}></div>
              </div>
              <div className="flex flex-wrap justify-between mt-2 text-xs gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Students ({stats.totalStudents})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Teachers ({stats.totalTeachers})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Staff ({stats.totalStaff})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent Activity Feed */}
          <div className={`lg:col-span-2 rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Recent Activity
              </h3>
              <button 
                onClick={handleResetSystem}
                className={`text-sm px-3 py-1 rounded-lg transition ${
                  isDarkMode 
                    ? 'text-red-400 hover:bg-red-900/30' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                Reset System
              </button>
            </div>
            
            <div className="space-y-1">
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {activity.message}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {timeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Expiries & Quick Actions */}
          <div className="space-y-6">
            {/* Upcoming Expiries */}
            <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                ⏰ Upcoming Expiries
                {upcomingExpiries.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs">
                    {upcomingExpiries.length}
                  </span>
                )}
              </h3>
              
              {upcomingExpiries.length > 0 ? (
                <div className="space-y-3">
                  {upcomingExpiries.map(notice => (
                    <div key={notice._id} className={`p-3 rounded-lg border ${
                      isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'
                    }`}>
                      <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {notice.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-red-500">
                          Expires: {formatDate(notice.expiryDate)}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {Math.ceil((new Date(notice.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">✅</div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    No upcoming expiries
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => window.location.href = '/dashboard/usermanagement'}
                  className={`p-3 rounded-lg transition text-center ${
                    isDarkMode 
                      ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400' 
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <span className="text-2xl block mb-1">➕</span>
                  <span className="text-xs font-medium">Add User</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/dashboard/noticemanagement'}
                  className={`p-3 rounded-lg transition text-center ${
                    isDarkMode 
                      ? 'bg-green-900/30 hover:bg-green-900/50 text-green-400' 
                      : 'bg-green-50 hover:bg-green-100 text-green-700'
                  }`}
                >
                  <span className="text-2xl block mb-1">📢</span>
                  <span className="text-xs font-medium">New Notice</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/dashboard/departmentmanagement'}
                  className={`p-3 rounded-lg transition text-center ${
                    isDarkMode 
                      ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-400' 
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                  }`}
                >
                  <span className="text-2xl block mb-1">🏛️</span>
                  <span className="text-xs font-medium">Add Dept</span>
                </button>
                <button 
                  onClick={() => {
                    toast.info('Reports feature coming soon', {
                      theme: isDarkMode ? 'dark' : 'light',
                    });
                  }}
                  className={`p-3 rounded-lg transition text-center ${
                    isDarkMode 
                      ? 'bg-orange-900/30 hover:bg-orange-900/50 text-orange-400' 
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700'
                  }`}
                >
                  <span className="text-2xl block mb-1">📊</span>
                  <span className="text-xs font-medium">Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverView;