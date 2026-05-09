import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import AlertDialog from "../Dialogue";
import { FaChalkboardTeacher, FaEdit, FaTrash, FaUserGraduate, FaCalendarAlt, FaClock, FaBook, FaUsers, FaBuilding, FaUser, FaDoorOpen, FaCode, FaInfoCircle } from "react-icons/fa";
import { MdClose, MdNotificationsActive } from "react-icons/md";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// ============== NOTICE MODAL COMPONENT ==============
const NoticeModal = ({ notice, onClose }) => {
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
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{notice.title}</h2>
            {notice.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                📌 Pinned
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <MdClose size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
              {notice.category}
            </span>
          </div>
          
          {notice.audience && notice.audience.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
          
          <div className="border-t border-gray-200 pt-4">
            <div dangerouslySetInnerHTML={{ __html: notice.description || 'No description provided' }} 
              className="prose max-w-none text-gray-700" />
          </div>
          
          {notice.attachment && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold mb-2">Attachment:</h4>
              <a href={notice.attachment} target="_blank" rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                📎 View Attachment
              </a>
            </div>
          )}
          
          {notice.expiryDate && (
            <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Notice</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <MdClose size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions.map(opt => (
                  <option key={opt} value={opt} className="capitalize">{opt}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map(opt => (
                  <option key={opt} value={opt} className="capitalize">{opt}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
            <div className="flex gap-3 flex-wrap">
              {audienceOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.audience.includes(opt)}
                    onChange={() => toggleAudience(opt)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============== ROUTINE DETAIL MODAL ==============
const RoutineDetailModal = ({ classItem, onClose }) => {
  if (!classItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaBook className="text-white" />
            <h2 className="text-xl font-bold text-white">Class Details</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <MdClose size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="font-bold text-gray-900 text-lg">{classItem.courseName}</h3>
            <p className="text-sm text-gray-500 font-mono">{classItem.courseCode}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <FaCalendarAlt className="text-blue-500 w-5" />
              <span className="font-medium">Day:</span>
              <span>{classItem.day}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <FaClock className="text-blue-500 w-5" />
              <span className="font-medium">Time:</span>
              <span>{classItem.time}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <FaDoorOpen className="text-blue-500 w-5" />
              <span className="font-medium">Room:</span>
              <span>{classItem.room || "N/A"}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <FaBuilding className="text-blue-500 w-5" />
              <span className="font-medium">Department:</span>
              <span>{classItem.department || "N/A"}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <FaUsers className="text-blue-500 w-5" />
              <span className="font-medium">Section:</span>
              <span>{classItem.section || "N/A"}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <FaUser className="text-blue-500 w-5" />
              <span className="font-medium">Teacher:</span>
              <span>{classItem.teacher}</span>
            </div>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== MAIN TEACHER DASHBOARD COMPONENT ==============
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [recentNotices, setRecentNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [stats, setStats] = useState({
    totalNotices: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Routine/Course states
  const [myCourses, setMyCourses] = useState([]);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [routineLoading, setRoutineLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('');
  const [availableDays, setAvailableDays] = useState([]);
  const [routineFilter, setRoutineFilter] = useState('today');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  const API = "https://pciunotifybackend.onrender.com";

  // Get user info from localStorage
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const fullName = localStorage.getItem("fullName") || `${firstName} ${lastName}`;
  const department = localStorage.getItem("department") || "";

  // Helper function to convert time to comparable value
  const convertTimeToComparable = (timeStr) => {
    if (!timeStr || timeStr.trim() === '') return '9999';
    const time = timeStr.trim().toLowerCase();
    let startTime = '';
    
    if (time.includes('-')) {
      startTime = time.split('-')[0].trim();
    } else if (time.includes('to')) {
      startTime = time.split('to')[0].trim();
    } else {
      startTime = time;
    }
    
    let isPM = false;
    if (startTime.includes('pm')) {
      isPM = true;
      startTime = startTime.replace('pm', '').trim();
    }
    startTime = startTime.replace('am', '').trim();
    
    let hour = 0, minute = 0;
    if (startTime.includes(':')) {
      const [h, m] = startTime.split(':');
      hour = parseInt(h, 10);
      minute = parseInt(m, 10);
    } else {
      hour = parseInt(startTime, 10);
    }
    
    if (isPM && hour !== 12) hour += 12;
    return hour * 100 + minute;
  };

  // Load routine from Excel file
  const loadRoutineData = useCallback(async () => {
    setRoutineLoading(true);
    try {
      const response = await fetch('/pciu.xlsx');
      if (!response.ok) {
        throw new Error('Routine file not found');
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet);
      
      console.log("Excel data loaded:", data.length, "rows");
      
      // Filter classes for the logged-in teacher
      const teacherClasses = data.filter(row => {
        const teacherName = row.teacher || "";
        return teacherName.toLowerCase().includes(fullName.toLowerCase()) ||
               fullName.toLowerCase().includes(teacherName.toLowerCase());
      });
      
      console.log("Classes for teacher:", teacherClasses.length);
      
      // Transform data
      const transformedClasses = teacherClasses.map(row => ({
        day: row.Day || row.day || "",
        department: row.Department || row.department || "",
        section: row.Section || row.section || "",
        courseCode: row["course code"] || row.courseCode || row.code || "",
        courseName: row["course name"] || row.courseName || row.name || "",
        teacher: row.teacher || row.Teacher || "",
        time: row.time || row.Time || "",
        room: row.room || row.Room || "",
      })).filter(c => c.day && c.courseCode);
      
      // Sort by time
      const sortedClasses = transformedClasses.sort((a, b) => {
        return convertTimeToComparable(a.time) - convertTimeToComparable(b.time);
      });
      
      // Extract unique courses
      const courseMap = new Map();
      sortedClasses.forEach(cls => {
        if (!courseMap.has(cls.courseCode)) {
          courseMap.set(cls.courseCode, {
            code: cls.courseCode,
            name: cls.courseName,
            section: cls.section,
            department: cls.department,
            schedule: [{
              day: cls.day,
              time: cls.time,
              room: cls.room
            }]
          });
        } else {
          const existing = courseMap.get(cls.courseCode);
          existing.schedule.push({
            day: cls.day,
            time: cls.time,
            room: cls.room
          });
        }
      });
      
      setMyCourses(Array.from(courseMap.values()));
      
      // Group by day for weekly schedule
      const daysOrder = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const groupedByDay = {};
      
      sortedClasses.forEach(cls => {
        if (!groupedByDay[cls.day]) {
          groupedByDay[cls.day] = [];
        }
        groupedByDay[cls.day].push(cls);
      });
      
      // Sort each day's classes by time
      for (let day in groupedByDay) {
        groupedByDay[day] = groupedByDay[day].sort((a, b) => {
          return convertTimeToComparable(a.time) - convertTimeToComparable(b.time);
        });
      }
      
      setWeeklySchedule(groupedByDay);
      
      const days = Object.keys(groupedByDay).sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
      setAvailableDays(days);
      
      // Set today's schedule
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todaysClasses = groupedByDay[today] || [];
      setTodaysSchedule(todaysClasses);
      setSelectedDay(days[0] || today);
      
    } catch (err) {
      console.error("Error loading routine:", err);
      toast.error("Failed to load routine data");
    } finally {
      setRoutineLoading(false);
    }
  }, [fullName]);

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
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [fullName]);

  useEffect(() => {
    fetchDashboardData();
    loadRoutineData();
  }, [fetchDashboardData, loadRoutineData]);

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

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
    setShowRoutineModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    return timeStr;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="px-6 md:px-20 py-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaChalkboardTeacher className="text-3xl" />
            Teacher Dashboard
          </h1>
          <p className="text-blue-100 mt-2">Welcome back, {fullName || "Teacher"} 👋</p>
          {department && <p className="text-blue-200 text-sm mt-1">Department: {department}</p>}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">My Notices</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : allNotices.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MdNotificationsActive className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaUserGraduate className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">My Courses</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{routineLoading ? '...' : myCourses.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaBook className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today's Classes</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{routineLoading ? '...' : todaysSchedule.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FaCalendarAlt className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* ROUTINE & COURSES SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toggle Buttons */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setRoutineFilter('today')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all ${
                routineFilter === 'today'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaCalendarAlt className="inline mr-2" /> Today's Schedule
            </button>
            <button
              onClick={() => setRoutineFilter('weekly')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all ${
                routineFilter === 'weekly'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaCalendarAlt className="inline mr-2" /> Weekly Schedule
            </button>
            <button
              onClick={() => setRoutineFilter('courses')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all ${
                routineFilter === 'courses'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaBook className="inline mr-2" /> My Courses
            </button>
          </div>

          <div className="p-6">
            {/* Today's Schedule */}
            {routineFilter === 'today' && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Click on any class to view details</p>
                </div>
                
                {routineLoading ? (
                  <div className="text-center py-8">Loading schedule...</div>
                ) : todaysSchedule.length > 0 ? (
                  <div className="space-y-3">
                    {todaysSchedule.map((cls, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleClassClick(cls)}
                        className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                              <FaCode className="text-blue-600 text-2xl" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg">{cls.courseName}</h4>
                            <p className="text-sm text-gray-500 font-mono">{cls.courseCode}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">⏰ {formatTime(cls.time)}</span>
                              <span className="flex items-center gap-1">🏠 {cls.room || "N/A"}</span>
                              <span className="flex items-center gap-1">👥 {cls.section || "N/A"}</span>
                            </div>
                          </div>
                          <FaInfoCircle className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="text-gray-600 font-medium">No classes scheduled for today</p>
                    <p className="text-sm text-gray-400 mt-1">Enjoy your day off!</p>
                  </div>
                )}
              </>
            )}

            {/* Weekly Schedule */}
            {routineFilter === 'weekly' && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📅 Weekly Class Schedule</h3>
                  <p className="text-sm text-gray-500 mt-1">Click on any class to view details</p>
                </div>
                
                {routineLoading ? (
                  <div className="text-center py-8">Loading schedule...</div>
                ) : Object.keys(weeklySchedule).length > 0 ? (
                  <div className="space-y-6">
                    {availableDays.map(day => (
                      <div key={day} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className={`px-4 py-2 font-semibold text-white ${
                          day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) 
                            ? 'bg-green-600' 
                            : 'bg-blue-600'
                        }`}>
                          {day} {day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && '(Today)'}
                          <span className="text-xs ml-2 opacity-80">({weeklySchedule[day]?.length || 0} classes)</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {weeklySchedule[day]?.map((cls, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => handleClassClick(cls)}
                              className="p-3 hover:bg-gray-50 transition cursor-pointer"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-800">{cls.courseName}</span>
                                  <span className="text-xs text-gray-500 ml-2">({cls.courseCode})</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span>⏰ {formatTime(cls.time)}</span>
                                  <span>🏠 {cls.room || "N/A"}</span>
                                  <span>👥 {cls.section || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!weeklySchedule[day] || weeklySchedule[day].length === 0) && (
                            <div className="p-4 text-center text-gray-400 text-sm">No classes</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No schedule found for you</p>
                  </div>
                )}
              </>
            )}

            {/* My Courses */}
            {routineFilter === 'courses' && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📚 My Courses</h3>
                  <p className="text-sm text-gray-500 mt-1">Courses assigned to you this semester</p>
                </div>
                
                {routineLoading ? (
                  <div className="text-center py-8">Loading courses...</div>
                ) : myCourses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {myCourses.map((course, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{course.name}</h4>
                            <p className="text-sm text-gray-500 font-mono">Code: {course.code}</p>
                          </div>
                          {course.section && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              Section {course.section}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Schedule:</p>
                          {course.schedule.map((sch, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                              <FaCalendarAlt className="text-gray-400 text-xs" />
                              <span className="font-medium w-24">{sch.day}</span>
                              <FaClock className="text-gray-400 text-xs" />
                              <span>{formatTime(sch.time)}</span>
                              <span className="text-gray-400">Room: {sch.room || "N/A"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No courses assigned yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ACTION CARDS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <h3 className="text-lg font-semibold mb-2">📝 Upload Notice</h3>
            <p className="text-sm text-gray-500">Publish notices for students and staff instantly.</p>
            <div className="mt-4">
              <AlertDialog onNoticeUpload={fetchDashboardData} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <h3 className="text-lg font-semibold mb-2">📅 View Full Routine</h3>
            <p className="text-sm text-gray-500">View complete class schedule and timetable.</p>
            <button 
              onClick={() => navigate('/dashboard/routine')}
              className="mt-4 w-full px-4 py-2 font-semibold text-white rounded-xl text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition"
            >
              Open Routine Viewer
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <h3 className="text-lg font-semibold mb-2">👨‍🎓 Students</h3>
            <p className="text-sm text-gray-500">View and manage enrolled students.</p>
            <button 
              onClick={() => navigate('/dashboard/allstudent')}
              className="mt-4 w-full px-4 py-2 font-semibold text-gray-700 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition"
            >
              View Students
            </button>
          </div>
        </div>

        {/* RECENT NOTICES SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdNotificationsActive className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">📌 My Recent Notices</h2>
            </div>
            <button 
              onClick={() => navigate('/dashboard/allnotices')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              View All →
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <div key={notice._id} className="p-6 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => handleViewNotice(notice)}>
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-semibold text-gray-900 text-base hover:text-blue-600 transition-colors">
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
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2">
                        <span>📅 {formatDate(notice.createdAt)}</span>
                        <span>🏷️ {notice.category}</span>
                        {notice.audience && notice.audience.length > 0 && (
                          <span>👥 {notice.audience.join(', ')}</span>
                        )}
                      </div>
                      {notice.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notice.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {notice.description.replace(/<[^>]*>/g, '').length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditNotice(notice); }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition"
                        title="Edit Notice"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNotice(notice._id); }}
                        className="p-2 text-gray-500 hover:text-red-600 transition"
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
                <p className="text-gray-400">You haven't published any notices yet</p>
                <p className="text-sm text-gray-500 mt-1">Click "Upload Notice" to create your first notice</p>
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
      {showRoutineModal && (
        <RoutineDetailModal 
          classItem={selectedClass}
          onClose={() => setShowRoutineModal(false)}
        />
      )}
    </div>
  );
}