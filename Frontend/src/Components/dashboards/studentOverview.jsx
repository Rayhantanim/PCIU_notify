import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import NoticeModal from '../noticeModal';
import { noticeService } from '../../services/noticeService.js';
import { MdClass } from "react-icons/md";
import { useTheme } from '../../Context/ThemeContext';

const StudentOverview = () => {
  const { isDarkMode } = useTheme();
  
  // ================== STATE ==================
  const [notices, setNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [noticeError, setNoticeError] = useState(null);
  const [likingInProgress, setLikingInProgress] = useState(new Set());

  // Modal state
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [noticesPerPage] = useState(5);

  const [classes, setClasses] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const daysOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    const foundIndex = daysOrder.findIndex(day => day === dayName);
    return foundIndex !== -1 ? foundIndex : 0;
  });
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classError, setClassError] = useState(null);

  const API = "https://pciunotifybackend.onrender.com";

  const [currentStudent, setCurrentStudent] = useState({
    name: "", rollNo: "", section: "", department: "", email: "", userId: ""
  });

  const DAYS_ORDER = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  // Helper function to check if user liked a notice
  const hasUserLiked = (notice) => {
    if (!currentStudent.userId || !notice || !notice.likesArray) return false;
    return notice.likesArray.some(likeId => likeId?.toString() === currentStudent.userId?.toString());
  };

  // ================== SORTING ==================
  const sortNoticesByDate = (noticesArray) => {
    if (!noticesArray || noticesArray.length === 0) return [];
    return [...noticesArray].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateB - dateA;
    });
  };

  // Sync modal with latest notice data when notices change
  useEffect(() => {
    if (selectedNotice && isModalOpen) {
      const latestNotice = allNotices.find(n => n._id === selectedNotice._id) ||
                          notices.find(n => n._id === selectedNotice._id);
      
      if (latestNotice && JSON.stringify(latestNotice) !== JSON.stringify(selectedNotice)) {
        setSelectedNotice(latestNotice);
      }
    }
  }, [allNotices, notices, selectedNotice?._id, isModalOpen]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ================== LOAD STUDENT ==================
  useEffect(() => {
    const userData = localStorage.getItem('user');
   
    if (userData) {
      const user = JSON.parse(userData);
      let section = user.section || 'CSE-31C';
      if (!section.includes('-') && user.department) section = `${user.department}-${section}`;
      if (!section.includes('-') && user.department) {
        section = `${user.department}-${section}`;
      }
        
      setCurrentStudent({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Student',
        rollNo: user.studentId || user.email,
        section,
        department: user.department || 'CSE',
        email: user.email,
        userId: user.userId || user._id || user.id
      });
       
    } else {
      setCurrentStudent({
        name: "Test Student", rollNo: "2023-CSE-001", section: "CSE-31C",
        department: "CSE", email: "student@example.com", userId: "test_user_001"
      });
    }
  }, []);

  // ================== FETCH NOTICES FROM API ==================
  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);
      setNoticeError(null);
      const data = await noticeService?.getNotices();
      if (!Array.isArray(data)) { setNoticeError('Invalid data format'); setLoadingNotices(false); return; }

      let transformedNotices = data.map(notice => {
        let noticeSection = notice.section;
        if (noticeSection && !noticeSection.includes('-') && notice.department)
          noticeSection = `${notice.department}-${noticeSection}`;
        
        // Handle likes array
        let likesArray = [];
        let likesCount = 0;
        if (Array.isArray(notice.likes)) {
          likesArray = notice.likes;
          likesCount = notice.likes.length;
        } else if (typeof notice.likes === 'number') {
          likesCount = notice.likes;
        }
        
        return {
          _id: notice._id, id: notice._id, title: notice.title,
          description: notice.description || notice.content,
          content: notice.content || notice.description,
          publishedDate: notice.createdAt ? notice.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          createdAt: notice.createdAt,
          category: notice.category || 'General',
          isNew: notice.createdAt ? (new Date() - new Date(notice.createdAt)) < 7 * 24 * 60 * 60 * 1000 : false,
          priority: notice.priority, audience: notice.audience || [],
          department: notice.department, section: noticeSection,
          likes: likesCount,
          likesArray: likesArray,
          comments: (notice.comments || []).map(c => ({ ...c, _id: c._id || c.id })),
          attachment: notice.attachment, isPinned: notice.isPinned,
          expiryDate: notice.expiryDate, author: notice.author || notice.createdBy || 'Admin',
          createdBy: notice.createdBy
        };
      });

      let filteredNotices = transformedNotices.filter(notice => {
        if (notice.audience && notice.audience.length > 0) {
          const audienceIncludesStudent = notice.audience.some(
            a => a.toLowerCase() === 'students' || a.toLowerCase() === 'student'
          );
          if (!audienceIncludesStudent) return false;
          if (notice.department && notice.department !== currentStudent.department) return false;
          if (notice.section && notice.section !== currentStudent.section) return false;
          return true;
        }
        return true;
      });

      const sortedNotices = sortNoticesByDate(filteredNotices);
      setAllNotices(sortedNotices);
      setNotices(sortedNotices);
      setCurrentPage(1);
    } catch (error) {
      setNoticeError(error.message);
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    if (currentStudent.section) fetchNotices();
  }, [currentStudent.section, currentStudent.department]);

  // ================== FILTERS ==================
  useEffect(() => {
    if (allNotices.length === 0) return;
    let filtered = [...allNotices];
    if (filterCategory !== 'All') filtered = filtered.filter(n => n.category === filterCategory);
    if (showOnlyNew) filtered = filtered.filter(n => n.isNew);
    if (showOnlyRecent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(n => new Date(n.createdAt) >= sevenDaysAgo);
    }
    setNotices(sortNoticesByDate(filtered));
    setCurrentPage(1);
  }, [filterCategory, showOnlyNew, showOnlyRecent, allNotices]);

  // ================== LIKE ==================
  const handleLike = async (noticeId) => {
    if (!currentStudent.userId) {
      console.error("No user ID found");
      return;
    }
    
    if (likingInProgress.has(noticeId)) return;
    
    // Find current notice to check like status BEFORE API call
    const currentNotice = allNotices.find(n => n._id === noticeId) || notices.find(n => n._id === noticeId);
    if (!currentNotice) return;
    
    const wasLiked = hasUserLiked(currentNotice);
    
    setLikingInProgress(prev => new Set(prev).add(noticeId));
    
    try {
      const result = await noticeService.likeNotice(noticeId, currentStudent.userId);
      
      if (result.success) {
        const updateNoticeLikes = (notice) => {
          if (notice._id === noticeId) {
            const newLikesCount = wasLiked ? notice.likes - 1 : notice.likes + 1;
            const newLikesArray = wasLiked 
              ? (notice.likesArray || []).filter(id => id?.toString() !== currentStudent.userId?.toString())
              : [...(notice.likesArray || []), currentStudent.userId];
            
            return {
              ...notice,
              likes: newLikesCount,
              likesArray: newLikesArray
            };
          }
          return notice;
        };
        
        // Update all state arrays
        setAllNotices(prev => sortNoticesByDate(prev.map(updateNoticeLikes)));
        setNotices(prev => sortNoticesByDate(prev.map(updateNoticeLikes)));
        
        // Update selectedNotice if this notice is currently open in modal
        if (selectedNotice && selectedNotice._id === noticeId) {
          setSelectedNotice(prev => {
            const newLikesCount = wasLiked ? prev.likes - 1 : prev.likes + 1;
            const newLikesArray = wasLiked 
              ? (prev.likesArray || []).filter(id => id?.toString() !== currentStudent.userId?.toString())
              : [...(prev.likesArray || []), currentStudent.userId];
            
            return {
              ...prev,
              likes: newLikesCount,
              likesArray: newLikesArray
            };
          });
        }
        
        toast.success(wasLiked ? "💔 Unliked" : "❤️ Liked");
      }
    } catch (error) {
      console.error("Failed to like notice:", error);
    } finally {
      setLikingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(noticeId);
        return newSet;
      });
    }
  };

  // ================== COMMENTS ==================
  const handleCommentSubmit = async (noticeId, text) => {
    if (!text.trim()) return false;
    
    const commentData = {
      text: text.trim(),
      userId: currentStudent.userId,
      userName: currentStudent.name,
      userEmail: currentStudent.email,
      createdAt: new Date().toISOString()
    };
    
    try {
      const result = await noticeService.addComment(noticeId, commentData);
      
      if (result.success) {
        const newComment = {
          _id: result.comment?._id || Date.now().toString(),
          text: text.trim(),
          userId: currentStudent.userId,
          userName: currentStudent.name,
          userEmail: currentStudent.email,
          createdAt: new Date().toISOString()
        };
        
        const updateComments = (notice) => {
          if (notice._id === noticeId) {
            return {
              ...notice,
              comments: [...(notice.comments || []), newComment]
            };
          }
          return notice;
        };
        
        // Update all state arrays
        setAllNotices(prev => sortNoticesByDate(prev.map(updateComments)));
        setNotices(prev => sortNoticesByDate(prev.map(updateComments)));
        
        // Update selectedNotice if this notice is currently open in modal
        if (selectedNotice && selectedNotice._id === noticeId) {
          setSelectedNotice(prev => ({
            ...prev,
            comments: [...(prev.comments || []), newComment]
          }));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add comment:", error);
      return false;
    }
  };

  const handleCommentEdit = async (noticeId, commentId, text) => {
    if (!text.trim()) return;
    
    try {
      const result = await noticeService.editComment(noticeId, commentId, text, currentStudent.userId);
      
      if (result.success) {
        const updateComments = (notice) => {
          if (notice._id === noticeId) {
            return {
              ...notice,
              comments: (notice.comments || []).map(c => 
                c._id === commentId ? { ...c, text: text.trim(), updatedAt: new Date().toISOString() } : c
              )
            };
          }
          return notice;
        };
        
        // Update all state arrays
        setAllNotices(prev => sortNoticesByDate(prev.map(updateComments)));
        setNotices(prev => sortNoticesByDate(prev.map(updateComments)));
        
        // Update selectedNotice if this notice is currently open in modal
        if (selectedNotice && selectedNotice._id === noticeId) {
          setSelectedNotice(prev => ({
            ...prev,
            comments: (prev.comments || []).map(c => 
              c._id === commentId ? { ...c, text: text.trim(), updatedAt: new Date().toISOString() } : c
            )
          }));
        }
      }
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleCommentDelete = async (noticeId, commentId) => {
    try {
      const result = await noticeService.deleteComment(noticeId, commentId, currentStudent.userId);
      
      if (result.success) {
        const updateComments = (notice) => {
          if (notice._id === noticeId) {
            return {
              ...notice,
              comments: (notice.comments || []).filter(c => c._id !== commentId)
            };
          }
          return notice;
        };
        
        // Update all state arrays
        setAllNotices(prev => sortNoticesByDate(prev.map(updateComments)));
        setNotices(prev => sortNoticesByDate(prev.map(updateComments)));
        
        // Update selectedNotice if this notice is currently open in modal
        if (selectedNotice && selectedNotice._id === noticeId) {
          setSelectedNotice(prev => ({
            ...prev,
            comments: (prev.comments || []).filter(c => c._id !== commentId)
          }));
        }
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // ================== MODAL ==================
  const openModal = (notice) => { setSelectedNotice(notice); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedNotice(null); };

  // ================== LOAD CLASSES ==================
  useEffect(() => {
    const loadClassesFromExcel = async () => {
      try {
        setLoadingClasses(true);
        setClassError(null);
        const response = await fetch('/pciu.xlsx');
        if (!response.ok) throw new Error('Excel file not found');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(firstSheet);
        const transformedClasses = excelData.map((row, index) => {
          let section = row.Section || row.section;
          if (section && !section.includes('-') && (row.Department || row.department))
            section = `${row.Department || row.department}-${section}`;
          return {
            id: index + 1, day: row.Day || row.day,
            department: row.Department || row.department, section,
            courseCode: row["course code"] || row.courseCode,
            courseName: row["course name"] || row.courseName,
            teacher: row.Teacher || row.teacher,
            time: row.Time || row.time, room: row.Room || row.room,
          };
        }).filter(cls => cls.day && cls.section);
        setClasses(transformedClasses.filter(cls => cls.section === currentStudent.section));
      } catch (error) {
        setClassError(error.message);
        setClasses([
          { id: 1, day: "Saturday", time: "10:00 AM - 11:30 AM", courseName: "Web Development", courseCode: "CSE 301", room: "Room 401", section: "CSE-31C", department: "CSE", teacher: "Dr. Smith" },
          { id: 2, day: "Saturday", time: "11:45 AM - 1:15 PM", courseName: "Database Management", courseCode: "CSE 302", room: "Room 402", section: "CSE-31C", department: "CSE", teacher: "Prof. Johnson" },
          { id: 3, day: "Sunday", time: "09:00 AM - 10:30 AM", courseName: "Operating Systems", courseCode: "CSE 303", room: "Room 405", section: "CSE-31C", department: "CSE", teacher: "Dr. Williams" },
          { id: 4, day: "Sunday", time: "10:45 AM - 12:15 PM", courseName: "Computer Networks", courseCode: "CSE 304", room: "Room 403", section: "CSE-31C", department: "CSE", teacher: "Prof. Brown" },
          { id: 5, day: "Monday", time: "02:00 PM - 03:30 PM", courseName: "Software Engineering", courseCode: "CSE 305", room: "Room 302", section: "CSE-31C", department: "CSE", teacher: "Dr. Davis" },
        ]);
      } finally {
        setLoadingClasses(false);
      }
    };
    if (currentStudent.section) loadClassesFromExcel();
  }, [currentStudent.section]);

  // ================== PAGINATION ==================
  const indexOfLastNotice = currentPage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);
  const totalPages = Math.ceil(notices.length / noticesPerPage);
  const paginate = (n) => setCurrentPage(n);
  const goToPreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  // ================== CLASSES FOR DAY ==================
  const getClassesForSelectedDay = () => {
    const selectedDay = DAYS_ORDER[currentDayIndex];
    return classes
      .filter(cls => cls.day === selectedDay)
      .sort((a, b) => (a.time?.split(' - ')[0] || '').localeCompare(b.time?.split(' - ')[0] || ''));
  };

  const goToPreviousDay = () => setCurrentDayIndex(prev => prev === 0 ? DAYS_ORDER.length - 1 : prev - 1);
  const goToNextDay = () => setCurrentDayIndex(prev => prev === DAYS_ORDER.length - 1 ? 0 : prev + 1);
  const goToToday = () => {
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const found = DAYS_ORDER.findIndex(d => d === dayName);
    setCurrentDayIndex(found !== -1 ? found : 0);
  };

  const todayClasses = getClassesForSelectedDay();
  const currentDay = DAYS_ORDER[currentDayIndex];
  const categories = ['All', ...new Set(allNotices.map(n => n.category))];

  // ================== HELPERS ==================
  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const getCategoryStyle = (category) => {
    if (isDarkMode) {
      switch (category) {
        case 'Exam':     return 'bg-blue-900/30 text-blue-400 ring-1 ring-blue-700';
        case 'Event':    return 'bg-cyan-900/30 text-cyan-400 ring-1 ring-cyan-700';
        case 'Academic': return 'bg-sky-900/30 text-sky-400 ring-1 ring-sky-700';
        case 'Holiday':  return 'bg-indigo-900/30 text-indigo-400 ring-1 ring-indigo-700';
        default:         return 'bg-gray-700 text-gray-300 ring-1 ring-gray-600';
      }
    } else {
      switch (category) {
        case 'Exam':     return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
        case 'Event':    return 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200';
        case 'Academic': return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200';
        case 'Holiday':  return 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200';
        default:         return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
      }
    }
  };

  const newNoticesCount = allNotices.filter(n => n.isNew).length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'} ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>

      {/* ===== HEADER ===== */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} border-b shadow-sm`}>
        <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Top row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-base sm:text-lg font-semibold text-white flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
              >
                {currentStudent.name ? getInitials(currentStudent.name) : '?'}
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Welcome back</p>
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currentStudent.name || 'Student'}
                </h1>
                <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{currentStudent.rollNo}</p>
              </div>
            </div>

            {/* Date chip */}
            <div className={`rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-center ${isDarkMode ? 'bg-gray-600 border-gray-600' : 'bg-gradient-to-br from-blue-500 to-indigo-100 border-slate-200'} border shadow-sm`}>
              <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-700'}`}>
                {currentStudent.department} • {currentStudent.section}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
            {[
              { label: 'Classes / week', value: classes.length, icon: '📖', color: 'text-blue-600', darkColor: 'text-blue-400', bg: 'bg-blue-50', darkBg: 'bg-blue-900/20', border: 'border-blue-100', darkBorder: 'border-blue-800' },
              { label: 'Total notices', value: notices.length, icon: '📋', color: 'text-cyan-600', darkColor: 'text-cyan-400', bg: 'bg-cyan-50', darkBg: 'bg-cyan-900/20', border: 'border-cyan-100', darkBorder: 'border-cyan-800' },
              { label: 'New notices', value: newNoticesCount, icon: '🆕', color: 'text-sky-600', darkColor: 'text-sky-400', bg: 'bg-sky-50', darkBg: 'bg-sky-900/20', border: 'border-sky-100', darkBorder: 'border-sky-800' },
            ].map((stat) => (
              <div key={stat.label}
                className={`rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center border shadow-sm ${
                  isDarkMode ? `${stat.darkBg} ${stat.darkBorder}` : `${stat.bg} ${stat.border}`
                }`}>
                <p className="text-base sm:text-lg mb-0.5">{stat.icon}</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? stat.darkColor : stat.color}`}>{stat.value}</p>
                <p className={`text-[10px] sm:text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ===== NOTICES ===== */}
          <div className="flex-1">
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
            }`}>

              {/* Section header */}
              <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b flex flex-wrap justify-between items-center gap-4 ${
                isDarkMode ? 'border-gray-700' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Announcements</h2>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{notices.length} notices available</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-slate-300 text-slate-700'
                    } border`}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>

                  <button
                    onClick={() => setShowOnlyNew(!showOnlyNew)}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-xl font-medium transition-all duration-200 border ${
                      showOnlyNew
                        ? isDarkMode
                          ? 'bg-sky-900/50 text-sky-400 border-sky-700'
                          : 'bg-sky-100 text-sky-700 border-sky-300'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    🔄 New
                  </button>

                  <button
                    onClick={() => setShowOnlyRecent(!showOnlyRecent)}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-xl font-medium transition-all duration-200 border ${
                      showOnlyRecent
                        ? isDarkMode
                          ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                          : 'bg-blue-100 text-blue-700 border-blue-300'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    📅 Recent
                  </button>
                </div>
              </div>

              {/* Notice list */}
              <div className="p-4 sm:p-5 space-y-3 max-h-[600px] overflow-y-auto">
                {loadingNotices ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-500"></div>
                    <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Loading announcements…</p>
                  </div>
                ) : noticeError ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 text-sm">Error: {noticeError}</p>
                    <button onClick={fetchNotices} className="mt-3 text-blue-600 text-sm underline font-medium">Try Again</button>
                  </div>
                ) : currentNotices.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl sm:text-5xl mb-3">📭</div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>No announcements found</p>
                  </div>
                ) : (
                  currentNotices.map((notice) => (
                    <div
                      key={notice._id}
                      onClick={() => openModal(notice)}
                      className={`group cursor-pointer rounded-xl border p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${
                        notice.isPinned
                          ? isDarkMode
                            ? 'bg-amber-900/30 border-amber-800 hover:border-amber-600'
                            : 'bg-amber-50 border-amber-200 hover:border-amber-400'
                          : isDarkMode
                            ? 'bg-gray-800 border-gray-700 hover:border-blue-600'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Badges row */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                            {notice.isPinned && (
                              <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ring-1 ${
                                isDarkMode 
                                  ? 'bg-amber-900/50 text-amber-400 ring-amber-700'
                                  : 'bg-amber-100 text-amber-700 ring-amber-200'
                              }`}>
                                📌 Pinned
                              </span>
                            )}
                            <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${getCategoryStyle(notice.category)}`}>
                              {notice.category}
                            </span>
                            {notice.isNew && (
                              <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ring-1 animate-pulse ${
                                isDarkMode 
                                  ? 'bg-sky-900/50 text-sky-400 ring-sky-700'
                                  : 'bg-sky-100 text-sky-700 ring-sky-200'
                              }`}>
                                New
                              </span>
                            )}
                            <span className={`text-[10px] sm:text-xs ml-auto ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                              {formatTimeAgo(notice.createdAt)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className={`text-sm sm:text-base font-semibold mb-2 transition-colors truncate ${
                            isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'
                          }`}>
                            {notice.title}
                          </h3>

                          {/* Meta */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {notice.author || 'Admin'}
                            </div>
                            <div className={`flex items-center gap-3 text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                {notice.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {notice.comments?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-1 transition-colors ${
                          isDarkMode ? 'text-gray-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {!loadingNotices && notices.length > 0 && totalPages > 1 && (
                <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col items-center gap-3 ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all border ${
                        currentPage === 1
                          ? isDarkMode
                            ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white shadow-sm'
                                : isDarkMode
                                  ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all border ${
                        currentPage === totalPages
                          ? isDarkMode
                            ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <p className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                    {indexOfFirstNotice + 1}–{Math.min(indexOfLastNotice, notices.length)} of {notices.length} notices
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ===== CLASS ROUTINE ===== */}
          <div className="lg:w-96">
            <div className={`rounded-2xl border shadow-sm overflow-hidden sticky top-8 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
            }`}>

              {/* Routine header */}
              <div className="px-4 sm:px-6 py-4 sm:py-5" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-white/20">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white">Class Routine</h2>
                    <p className="text-blue-100 text-[10px] sm:text-xs">{currentStudent.section}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {/* Day navigation */}
                <div className={`flex items-center justify-between gap-2 mb-5 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'
                }`}>
                  <button onClick={goToPreviousDay}
                    className={`p-1 rounded-lg transition-colors border shadow-sm ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-gray-600' 
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    }`}>
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <p className={`font-bold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{currentDay}</p>
                    <button onClick={goToToday} className="text-blue-600 text-[10px] sm:text-xs hover:text-blue-700 font-semibold mt-0.5">
                      Today
                    </button>
                  </div>

                  <button onClick={goToNextDay}
                    className={`p-1 rounded-lg transition-colors border shadow-sm ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-gray-600' 
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    }`}>
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Classes */}
                <div className="space-y-3 h-[350px] sm:h-[400px] overflow-y-auto pr-1">
                  {loadingClasses ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : todayClasses.length === 0 ? (
                    <div className={`text-center py-10 sm:py-14 rounded-xl border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎉</div>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>No classes today</p>
                      <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Enjoy your day off!</p>
                    </div>
                  ) : (
                    todayClasses.map((cls, index) => (
                      <div key={cls.id || index}
                        className={`rounded-xl p-3 sm:p-4 transition-all duration-200 flex items-start gap-2 sm:gap-3 ${
                          isDarkMode 
                            ? 'bg-gray-700 border border-gray-600 hover:border-blue-500' 
                            : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }`}>

                        {/* Time badge */}
                        <div
                          className="flex-shrink-0 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-center min-w-[44px] sm:min-w-[52px] shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
                        >
                          <p className="text-white font-bold text-sm sm:text-base leading-none">
                            {cls.time?.split(' - ')[0]?.split(':')[0] || '10'}
                          </p>
                          <p className="text-blue-100 text-[10px] sm:text-xs mt-0.5">
                            {cls.time?.includes('AM') ? 'AM' : 'PM'}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-xs sm:text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {cls.courseName}
                          </h3>
                          <p className="text-blue-600 text-[10px] sm:text-xs font-mono mt-0.5">{cls.courseCode}</p>
                          {cls.teacher && (
                            <p className={`text-[10px] sm:text-xs mt-1.5 truncate ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                              👨‍🏫 {cls.teacher}
                            </p>
                          )}
                          <div className={`flex flex-wrap gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            <span className="flex items-center gap-1">
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {cls.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {cls.room}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {!loadingClasses && classes.length > 0 && (
                  <div className={`mt-4 pt-3 sm:pt-4 border-t text-center ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                    <p className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                      {classes.length} total classes this week
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      <NoticeModal
        notice={selectedNotice}
        isOpen={isModalOpen}
        onClose={closeModal}
        onLike={handleLike}
        onCommentSubmit={handleCommentSubmit}
        onCommentEdit={handleCommentEdit}
        onCommentDelete={handleCommentDelete}
        currentUser={currentStudent}
        likingInProgress={likingInProgress}
      />
    </div>
  );
};

export default StudentOverview;