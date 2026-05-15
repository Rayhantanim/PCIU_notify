import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { FaChalkboardTeacher, FaEdit, FaTrash, FaUserGraduate, FaCalendarAlt, FaClock, FaBook, FaUsers, FaBuilding, FaUser, FaDoorOpen, FaCode, FaInfoCircle } from "react-icons/fa";
import { MdClose, MdNotificationsActive } from "react-icons/md";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useTheme } from "../Context/ThemeContext";
import AlertDialog from "../Components/Dialogue";

// ============== NOTICE MODAL COMPONENT ==============
const NoticeModal = ({ notice, onClose }) => {
  const { isDarkMode } = useTheme();
  if (!notice) return null;
  
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
        <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notice.title}</h2>
            {notice.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                📌 Pinned
              </span>
            )}
          </div>
          <button onClick={onClose} className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
            <MdClose size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className={`flex flex-wrap gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <span className="flex items-center gap-1">👤 {notice.createdBy}</span>
            <span className="flex items-center gap-1">📅 {formatDate(notice.createdAt)}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              notice.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              notice.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {notice.priority}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {notice.category}
            </span>
          </div>
          
          {notice.audience && notice.audience.length > 0 && (
            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="font-semibold">Audience:</span>
              <div className="flex gap-2">
                {notice.audience.map(aud => (
                  <span key={aud} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {aud}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
            <div dangerouslySetInnerHTML={{ __html: notice.description || 'No description provided' }} 
              className={`prose max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
          </div>
          
          {notice.attachment && (
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Attachment:</h4>
              <a href={notice.attachment} target="_blank" rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                📎 View Attachment
              </a>
            </div>
          )}
          
          {notice.expiryDate && (
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ⏰ Expires: {formatDate(notice.expiryDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============== EDIT NOTICE MODAL COMPONENT ==============
const EditNoticeModal = ({ isOpen, notice, onClose, onUpdate }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'normal',
    audience: [],
    expiryDate: ''
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || '',
        description: notice.description || '',
        category: notice.category || 'general',
        priority: notice.priority || 'normal',
        audience: notice.audience || [],
        expiryDate: notice.expiryDate?.split('T')[0] || ''
      });
    }
  }, [notice]);

  if (!isOpen || !notice) return null;
  
  const audienceOptions = ['students', 'teachers', 'staff', 'all'];
  const categoryOptions = ['academic', 'exam', 'event', 'holiday', 'general'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleAudience = (option) => {
    setFormData(prev => ({
      ...prev,
      audience: prev.audience.includes(option)
        ? prev.audience.filter(a => a !== option)
        : [...prev.audience, option]
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Notice</h2>
          <button 
            type="button"
            onClick={onClose} 
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <MdClose size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {categoryOptions.map(opt => (
                  <option key={opt} value={opt} className="capitalize">{opt}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {priorityOptions.map(opt => (
                  <option key={opt} value={opt} className="capitalize">{opt}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Audience</label>
            <div className="flex gap-3 flex-wrap">
              {audienceOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.audience.includes(opt)}
                    onChange={() => toggleAudience(opt)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Update Notice
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============== MAIN STAFF DASHBOARD COMPONENT ==============
export default function StaffDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [recentNotices, setRecentNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [stats, setStats] = useState({
    totalNotices: 0,
    totalStudents: 0,
    totalTeachers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const API = "https://pciunotifybackend.onrender.com";

  // Get user info from localStorage
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const fullName = localStorage.getItem("fullName") || `${firstName} ${lastName}`;
  const department = localStorage.getItem("department") || "";

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const noticesRes = await fetch(`${API}/api/notices`);
      const noticesData = await noticesRes.json();
      
      const myNotices = noticesData.filter(notice => {
        if (!notice.createdBy || !fullName) return false;
        return notice.createdBy.toLowerCase().trim() === fullName.toLowerCase().trim();
      });
      
      setAllNotices(myNotices);
      setRecentNotices(myNotices.slice(0, 5));
      
      setStats(prev => ({
        ...prev,
        totalNotices: noticesData.length
      }));
      
      const studentsRes = await fetch(`${API}/api/students`);
      const studentsData = await studentsRes.json();
      setStats(prev => ({
        ...prev,
        totalStudents: (studentsData.students || studentsData).length
      }));
      
      const teachersRes = await fetch(`${API}/api/teachers`);
      const teachersData = await teachersRes.json();
      setStats(prev => ({
        ...prev,
        totalTeachers: (teachersData.teachers || teachersData).length
      }));
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [fullName]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleViewNotice = (notice) => {
    setSelectedNotice(notice);
    setShowNoticeModal(true);
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setShowEditModal(true);
  };

  const handleUpdateNotice = async (formData) => {
    try {
      const response = await fetch(`${API}/api/notice/${editingNotice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        fetchDashboardData();
        setShowEditModal(false);
        setEditingNotice(null);
        Swal.fire({ title: "Success!", text: "Notice updated successfully", icon: "success", timer: 2000, showConfirmButton: false });
      } else {
        toast.error("Failed to update notice");
      }
    } catch (err) {
      console.error("Error updating notice:", err);
      toast.error("Error updating notice");
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API}/api/notice/${noticeId}`, { method: 'DELETE' });
        if (response.ok) {
          fetchDashboardData();
          Swal.fire({ title: "Deleted!", text: "Your notice has been deleted.", icon: "success" });
        } else {
          toast.error("Failed to delete notice");
        }
      } catch (err) {
        console.error("Error deleting notice:", err);
        toast.error("Error deleting notice");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 p-6 mb-8 text-white">
        <div className="px-6 md:px-20 py-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaChalkboardTeacher className="text-3xl" />
            Staff Dashboard
          </h1>
          <p className="text-blue-100 mt-2">Welcome back, {fullName || "Staff"} 👋</p>
          {department && <p className="text-blue-200 text-sm mt-1">Department: {department}</p>}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>My Notices</p>
                <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{loading ? '...' : allNotices.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MdNotificationsActive className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Students</p>
                <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{loading ? '...' : stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaUserGraduate className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Teachers</p>
                <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{loading ? '...' : stats.totalTeachers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaUser className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Notices</p>
                <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{loading ? '...' : stats.totalNotices}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MdNotificationsActive className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* ACTION CARDS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📝 Create Notice</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Publish notices for students, teachers, and staff instantly.</p>
            <div className="mt-4">
              <AlertDialog onNoticeUpload={fetchDashboardData} />
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>👨‍🎓 Students</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>View and manage enrolled students.</p>
            <button 
              onClick={() => navigate('/dashboard/allstudent')}
              className={`mt-4 w-full px-4 py-2 font-semibold rounded-xl text-sm transition ${
                isDarkMode 
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              View Students
            </button>
          </div>

          <div className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>👨‍🏫 Teachers</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>View and manage faculty members.</p>
            <button 
              onClick={() => navigate('/dashboard/allteacher')}
              className={`mt-4 w-full px-4 py-2 font-semibold rounded-xl text-sm transition ${
                isDarkMode 
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              View Teachers
            </button>
          </div>
        </div>

        {/* RECENT NOTICES SECTION */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <MdNotificationsActive className="text-blue-600" />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>📌 My Recent Notices</h2>
            </div>
            <button 
              onClick={() => navigate('/dashboard/staffnotice')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              View All →
            </button>
          </div>

          <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className={`h-4 rounded w-3/4 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-3 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  </div>
                ))}
              </div>
            ) : recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <div key={notice._id} className={`p-6 transition cursor-pointer ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => handleViewNotice(notice)}>
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className={`font-semibold text-base transition-colors ${isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'}`}>
                          {notice.title}
                        </h3>
                        {notice.isPinned && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            📌 Pinned
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                          notice.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                          notice.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          notice.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {notice.priority}
                        </span>
                      </div>
                      <div className={`flex flex-wrap items-center gap-4 text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>📅 {formatDate(notice.createdAt)}</span>
                        <span>🏷️ {notice.category}</span>
                        {notice.audience && notice.audience.length > 0 && (
                          <span>👥 {notice.audience.join(', ')}</span>
                        )}
                      </div>
                      {notice.description && (
                        <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {notice.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {notice.description.replace(/<[^>]*>/g, '').length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditNotice(notice); }}
                        className={`p-2 transition ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`}
                        title="Edit Notice"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNotice(notice._id); }}
                        className={`p-2 transition ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
                        title="Delete Notice"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>You haven't published any notices yet</p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>Click "Create Notice" to publish your first notice</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNoticeModal && <NoticeModal notice={selectedNotice} onClose={() => setShowNoticeModal(false)} />}
      {showEditModal && (
        <EditNoticeModal 
          isOpen={showEditModal}
          notice={editingNotice}
          onClose={() => { setShowEditModal(false); setEditingNotice(null); }}
          onUpdate={handleUpdateNotice}
        />
      )}
    </div>
  );
}