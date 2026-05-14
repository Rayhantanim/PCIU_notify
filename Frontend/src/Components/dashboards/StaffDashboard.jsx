import React, { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { FaFileAlt, FaUsers, FaChalkboardTeacher, FaUserTie, FaCalendarAlt, FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa";
import { MdNotificationsActive, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { useTheme } from "../../Context/ThemeContext";

export default function StaffDashboard() {
  const { isDarkMode } = useTheme();
  const API = "https://pciunotifybackend.onrender.com";

  const [stats, setStats] = useState({
    notices: 0,
    students: 0,
    teachers: 0,
    staff: 0,
    previousNotices: 0,
    previousStudents: 0,
    previousTeachers: 0,
    previousStaff: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('line'); // line, bar, pie

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/dashboard-stats`);
        const data = await res.json();
        console.log(data);

        setStats({
          notices: data.totalNotices || 0,
          students: data.totalStudents || 0,
          teachers: data.totalTeachers || 0,
          staff: data.totalStaff || 0,
          previousNotices: data.previousNotices || 0,
          previousStudents: data.previousStudents || 0,
          previousTeachers: data.previousTeachers || 0,
          previousStaff: data.previousStaff || 0,
        });

        setChartData(data.noticeTrend || generateMockData());
      } catch (err) {
        console.log(err);
        setChartData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const generateMockData = () => {
    return [
      { date: 'Jan 1', notices: 12, engagement: 85 },
      { date: 'Jan 2', notices: 19, engagement: 92 },
      { date: 'Jan 3', notices: 15, engagement: 88 },
      { date: 'Jan 4', notices: 22, engagement: 95 },
      { date: 'Jan 5', notices: 18, engagement: 90 },
      { date: 'Jan 6', notices: 25, engagement: 96 },
      { date: 'Jan 7', notices: 20, engagement: 93 },
    ];
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const StatCard = ({ title, value, previous, icon: Icon, color }) => {
    const growth = calculateGrowth(value, previous);
    const isPositive = growth > 0;
    
    return (
      <div className={`rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:shadow-gray-900/50' 
          : 'bg-white border-gray-100 hover:shadow-blue-100'
      } border shadow-sm`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-xl ${color.bg} ${isDarkMode ? color.darkBg : color.lightBg}`}>
            <Icon className={`w-5 h-5 ${color.text}`} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive 
              ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
              : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
          }`}>
            {isPositive ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
            <span>{Math.abs(growth)}%</span>
          </div>
        </div>
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {value.toLocaleString()}
        </h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          vs previous period
        </p>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg p-3 shadow-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {label}
          </p>
          {payload.map((p, idx) => (
            <p key={idx} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartColors = {
    line: isDarkMode ? '#60a5fa' : '#3b82f6',
    line2: isDarkMode ? '#34d399' : '#10b981',
    bar: isDarkMode ? '#818cf8' : '#6366f1',
    bar2: isDarkMode ? '#34d399' : '#10b981',
    pie: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a']
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Staff Dashboard</h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Welcome back! Here's what's happening with your institution today.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                <FaCalendarAlt className="text-blue-200" />
                <span className="text-white text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`rounded-2xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} animate-pulse`}>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard 
              title="Total Notices" 
              value={stats.notices} 
              previous={stats.previousNotices}
              icon={MdNotificationsActive}
              color={{ 
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                lightBg: 'bg-blue-50',
                darkBg: 'bg-blue-500/20',
                text: 'text-blue-600 dark:text-blue-400'
              }}
            />
            <StatCard 
              title="Total Students" 
              value={stats.students} 
              previous={stats.previousStudents}
              icon={FaUsers}
              color={{ 
                bg: 'bg-green-50 dark:bg-green-900/20',
                lightBg: 'bg-green-50',
                darkBg: 'bg-green-500/20',
                text: 'text-green-600 dark:text-green-400'
              }}
            />
            <StatCard 
              title="Total Teachers" 
              value={stats.teachers} 
              previous={stats.previousTeachers}
              icon={FaChalkboardTeacher}
              color={{ 
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                lightBg: 'bg-purple-50',
                darkBg: 'bg-purple-500/20',
                text: 'text-purple-600 dark:text-purple-400'
              }}
            />
            <StatCard 
              title="Total Staff" 
              value={stats.staff} 
              previous={stats.previousStaff}
              icon={FaUserTie}
              color={{ 
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                lightBg: 'bg-orange-50',
                darkBg: 'bg-orange-500/20',
                text: 'text-orange-600 dark:text-orange-400'
              }}
            />
          </div>
        )}

        {/* Chart Section */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Chart Header */}
          <div className={`px-6 py-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <FaChartLine className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Notice Activity Trend
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Last 7 days performance
                </p>
              </div>
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChart('line')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                  selectedChart === 'line'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Line Chart
              </button>
              <button
                onClick={() => setSelectedChart('bar')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                  selectedChart === 'bar'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Bar Chart
              </button>
            </div>
          </div>

          {/* Chart Content */}
          <div className="p-6">
            {chartData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📊</div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No data available for the selected period
                </p>
              </div>
            ) : (
              <div className="h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedChart === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                      />
                      <XAxis 
                        dataKey="date" 
                        stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      />
                      <YAxis 
                        stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="notices" 
                        stroke={chartColors.line} 
                        strokeWidth={2}
                        dot={{ fill: chartColors.line, strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                        name="Notices"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke={chartColors.line2} 
                        strokeWidth={2}
                        dot={{ fill: chartColors.line2, strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                        name="Engagement %"
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                      />
                      <XAxis 
                        dataKey="date" 
                        stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      />
                      <YAxis 
                        stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      />
                      <Bar 
                        dataKey="notices" 
                        fill={chartColors.bar} 
                        name="Notices"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar 
                        dataKey="engagement" 
                        fill={chartColors.bar2} 
                        name="Engagement %"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart Footer Stats */}
          {chartData.length > 0 && (
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Notices</p>
                  <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {chartData.reduce((sum, item) => sum + item.notices, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Daily Notices</p>
                  <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {(chartData.reduce((sum, item) => sum + item.notices, 0) / chartData.length).toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Peak Day</p>
                  <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {Math.max(...chartData.map(item => item.notices))}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Engagement</p>
                  <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {(chartData.reduce((sum, item) => sum + (item.engagement || 0), 0) / chartData.length).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          <div className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
            isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'
          } border shadow-sm`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <MdNotificationsActive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Notices</h3>
            </div>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              View and manage all recent announcements
            </p>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
              View All →
            </button>
          </div>

          <div className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
            isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-gray-200 hover:border-green-300'
          } border shadow-sm`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <FaUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Manage Users</h3>
            </div>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Add, edit, or remove students, teachers, and staff
            </p>
            <button className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
              Manage →
            </button>
          </div>

          <div className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
            isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-300'
          } border shadow-sm`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FaFileAlt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Reports</h3>
            </div>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Generate and download institution reports
            </p>
            <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">
              Generate →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}