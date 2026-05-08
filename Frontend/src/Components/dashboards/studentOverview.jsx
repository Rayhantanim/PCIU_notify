import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import NoticeModal from '../noticeModal';
import { noticeService } from '../../services/noticeService.js';

const StudentOverview = () => {
  // ================== STATE ==================
  const [notices, setNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [noticeError, setNoticeError] = useState(null);
  
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

  // Get current student from localStorage/session
  const [currentStudent, setCurrentStudent] = useState({
    name: "",
    rollNo: "",
    section: "",
    department: "",
    email: "",
    userId: ""
  });

  const DAYS_ORDER = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  // ================== LOAD CURRENT STUDENT INFO ==================
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      let section = user.section || 'CSE-31C';
      if (!section.includes('-') && user.department) {
        section = `${user.department}-${section}`;
      }
      
      setCurrentStudent({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Student',
        rollNo: user.studentId || user.email,
        section: section,
        department: user.department || 'CSE',
        email: user.email,
        userId: user.userId || user._id || user.id
      });
    } else {
      setCurrentStudent({
        name: "Test Student",
        rollNo: "2023-CSE-001",
        section: "CSE-31C",
        department: "CSE",
        email: "student@example.com",
        userId: "test_user_001"
      });
    }
  }, []);

  // ================== FETCH NOTICES FROM API ==================
  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);
      setNoticeError(null);
      
      const data = await noticeService.getNotices();
      
      if (!Array.isArray(data)) {
        console.error('API did not return an array:', data);
        setNoticeError('Invalid data format from server');
        setLoadingNotices(false);
        return;
      }
      
      // Transform API data
      let transformedNotices = data.map(notice => {
        let noticeSection = notice.section;
        if (noticeSection && !noticeSection.includes('-') && notice.department) {
          noticeSection = `${notice.department}-${noticeSection}`;
        }
        
        return {
          _id: notice._id,
          id: notice._id,
          title: notice.title,
          description: notice.description || notice.content,
          content: notice.content || notice.description,
          publishedDate: notice.createdAt ? notice.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          createdAt: notice.createdAt,
          category: notice.category || 'General',
          isNew: notice.createdAt ? (new Date() - new Date(notice.createdAt)) < 7 * 24 * 60 * 60 * 1000 : false,
          priority: notice.priority,
          audience: notice.audience || [],
          department: notice.department,
          section: noticeSection,
          likes: notice.likes || 0,
          comments: (notice.comments || []).map(comment => ({
            ...comment,
            _id: comment._id || comment.id
          })),
          attachment: notice.attachment,
          isPinned: notice.isPinned,
          expiryDate: notice.expiryDate,
          author: notice.author || notice.createdBy || 'Admin'
        };
      });
      
      // Filter notices based on student's department and section
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
      
      // Sort: pinned first, then by date
      filteredNotices.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setAllNotices(filteredNotices);
      setNotices(filteredNotices);
      setCurrentPage(1);
      
    } catch (error) {
      console.error('Error fetching notices:', error);
      setNoticeError(error.message);
    } finally {
      setLoadingNotices(false);
    }
  };
  
  useEffect(() => {
    if (currentStudent.section) {
      fetchNotices();
    }
  }, [currentStudent.section, currentStudent.department]);

  // ================== APPLY FILTERS ==================
  useEffect(() => {
    if (allNotices.length === 0) return;
    
    let filtered = [...allNotices];
    
    if (filterCategory !== 'All') {
      filtered = filtered.filter(notice => notice.category === filterCategory);
    }
    
    if (showOnlyNew) {
      filtered = filtered.filter(notice => notice.isNew);
    }
    
    if (showOnlyRecent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(notice => new Date(notice.createdAt) >= sevenDaysAgo);
    }
    
    setNotices(filtered);
    setCurrentPage(1);
  }, [filterCategory, showOnlyNew, showOnlyRecent, allNotices]);

  // ================== LIKE HANDLER WITH DATABASE ==================
  const handleLike = async (noticeId) => {
    try {
      // Optimistic update
      const updateLikes = (prev) =>
        prev.map((notice) =>
          notice._id === noticeId ? { ...notice, likes: (notice.likes || 0) + 1 } : notice
        );
      
      setNotices(updateLikes);
      setAllNotices(updateLikes);
      
      if (selectedNotice && selectedNotice._id === noticeId) {
        setSelectedNotice(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      }
      
      // API call
      await noticeService.likeNotice(noticeId, currentStudent.userId);
      
    } catch (error) {
      console.error('Failed to like notice:', error);
      // Revert optimistic update on error
      fetchNotices();
    }
  };

  // ================== COMMENT HANDLERS WITH DATABASE ==================
  const handleCommentSubmit = async (noticeId, text) => {
    if (!text.trim()) return;

    const commentData = {
      text: text.trim(),
      userId: currentStudent.userId,
      userName: currentStudent.name,
      userEmail: currentStudent.email,
      createdAt: new Date().toISOString()
    };
    
    try {
      // Optimistic update
      const newComment = { ...commentData, _id: `temp_${Date.now()}` };
      
      const updateComments = (prev) =>
        prev.map((notice) =>
          notice._id === noticeId
            ? { ...notice, comments: [...(notice.comments || []), newComment] }
            : notice
        );
      
      setNotices(updateComments);
      setAllNotices(updateComments);
      
      if (selectedNotice && selectedNotice._id === noticeId) {
        setSelectedNotice(prev => ({ 
          ...prev, 
          comments: [...(prev.comments || []), newComment] 
        }));
      }
      
      // API call
      const result = await noticeService.addComment(noticeId, commentData);
      
      // Refresh to get actual data from server
      await fetchNotices();
      
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Revert optimistic update
      await fetchNotices();
    }
  };

  const handleCommentEdit = async (noticeId, commentId, text) => {
    try {
      const updateComments = (prev) =>
        prev.map((notice) =>
          notice._id === noticeId
            ? {
                ...notice,
                comments: (notice.comments || []).map(comment =>
                  (comment._id === commentId)
                    ? { ...comment, text, editedAt: new Date().toISOString() }
                    : comment
                )
              }
            : notice
        );
      
      // Optimistic update
      setNotices(updateComments);
      setAllNotices(updateComments);
      
      if (selectedNotice && selectedNotice._id === noticeId) {
        setSelectedNotice(prev => ({
          ...prev,
          comments: (prev.comments || []).map(comment =>
            (comment._id === commentId)
              ? { ...comment, text, editedAt: new Date().toISOString() }
              : comment
          )
        }));
      }
      
      // API call
      await noticeService.editComment(noticeId, commentId, text, currentStudent.userId);
      
    } catch (error) {
      console.error('Failed to edit comment:', error);
      await fetchNotices();
    }
  };

  const handleCommentDelete = async (noticeId, commentId) => {
    try {
      const updateComments = (prev) =>
        prev.map((notice) =>
          notice._id === noticeId
            ? {
                ...notice,
                comments: (notice.comments || []).filter(comment => comment._id !== commentId)
              }
            : notice
        );
      
      // Optimistic update
      setNotices(updateComments);
      setAllNotices(updateComments);
      
      if (selectedNotice && selectedNotice._id === noticeId) {
        setSelectedNotice(prev => ({
          ...prev,
          comments: (prev.comments || []).filter(comment => comment._id !== commentId)
        }));
      }
      
      // API call
      await noticeService.deleteComment(noticeId, commentId, currentStudent.userId);
      
    } catch (error) {
      console.error('Failed to delete comment:', error);
      await fetchNotices();
    }
  };

  // ================== MODAL HANDLERS ==================
  const openModal = (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotice(null);
  };

  // ================== LOAD CLASSES FROM EXCEL FILE ==================
  useEffect(() => {
    const loadClassesFromExcel = async () => {
      try {
        setLoadingClasses(true);
        setClassError(null);
        
        const response = await fetch('/pciu.xlsx');
        
        if (!response.ok) {
          throw new Error('Excel file not found');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(firstSheet);
        
        const transformedClasses = excelData.map((row, index) => {
          let section = row.Section || row.section;
          if (section && !section.includes('-') && (row.Department || row.department)) {
            const dept = row.Department || row.department;
            section = `${dept}-${section}`;
          }
          
          return {
            id: index + 1,
            day: row.Day || row.day,
            department: row.Department || row.department,
            section: section,
            courseCode: row["course code"] || row.courseCode,
            courseName: row["course name"] || row.courseName,
            teacher: row.Teacher || row.teacher,
            time: row.Time || row.time,
            room: row.Room || row.room,
          };
        }).filter(cls => cls.day && cls.section);
        
        const sectionClasses = transformedClasses.filter(cls => {
          return cls.section === currentStudent.section;
        });
        
        setClasses(sectionClasses);
      } catch (error) {
        console.error('Error loading Excel file:', error);
        setClassError(error.message);
        const mockClasses = [
          { id: 1, day: "Saturday", time: "10:00 AM - 11:30 AM", courseName: "Web Development", courseCode: "CSE 301", room: "Room 401", section: "CSE-31C", department: "CSE", teacher: "Dr. Smith" },
          { id: 2, day: "Saturday", time: "11:45 AM - 1:15 PM", courseName: "Database Management", courseCode: "CSE 302", room: "Room 402", section: "CSE-31C", department: "CSE", teacher: "Prof. Johnson" },
          { id: 3, day: "Sunday", time: "09:00 AM - 10:30 AM", courseName: "Operating Systems", courseCode: "CSE 303", room: "Room 405", section: "CSE-31C", department: "CSE", teacher: "Dr. Williams" },
          { id: 4, day: "Sunday", time: "10:45 AM - 12:15 PM", courseName: "Computer Networks", courseCode: "CSE 304", room: "Room 403", section: "CSE-31C", department: "CSE", teacher: "Prof. Brown" },
          { id: 5, day: "Monday", time: "02:00 PM - 03:30 PM", courseName: "Software Engineering", courseCode: "CSE 305", room: "Room 302", section: "CSE-31C", department: "CSE", teacher: "Dr. Davis" },
        ];
        setClasses(mockClasses);
      } finally {
        setLoadingClasses(false);
      }
    };
    
    if (currentStudent.section) {
      loadClassesFromExcel();
    }
  }, [currentStudent.section]);

  // ================== PAGINATION ==================
  const indexOfLastNotice = currentPage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);
  const totalPages = Math.ceil(notices.length / noticesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ================== GET CLASSES FOR SELECTED DAY ==================
  const getClassesForSelectedDay = () => {
    const selectedDay = DAYS_ORDER[currentDayIndex];
    const dayClasses = classes.filter(cls => cls.day === selectedDay);
    
    const sortedClasses = dayClasses.sort((a, b) => {
      const timeA = a.time?.split(' - ')[0] || a.time;
      const timeB = b.time?.split(' - ')[0] || b.time;
      return timeA?.localeCompare(timeB) || 0;
    });
    
    return sortedClasses;
  };
  
  // ================== NAVIGATION HANDLERS ==================
  const goToPreviousDay = () => {
    setCurrentDayIndex(prev => (prev === 0 ? DAYS_ORDER.length - 1 : prev - 1));
  };
  
  const goToNextDay = () => {
    setCurrentDayIndex(prev => (prev === DAYS_ORDER.length - 1 ? 0 : prev + 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const foundIndex = DAYS_ORDER.findIndex(day => day === dayName);
    setCurrentDayIndex(foundIndex !== -1 ? foundIndex : 0);
  };
  
  const todayClasses = getClassesForSelectedDay();
  const currentDay = DAYS_ORDER[currentDayIndex];
  
  const categories = ['All', ...new Set(allNotices.map(notice => notice.category))];

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-blue-100 mt-2">
                {currentStudent.name} • {currentStudent.rollNo}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
              <p className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs text-blue-200 mt-1">
                {currentStudent.department} • Section: {currentStudent.section}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ================== NOTICES SECTION ================== */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
                      <p className="text-sm text-gray-500">{notices.length} notices available</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => setShowOnlyNew(!showOnlyNew)}
                      className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                        showOnlyNew 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🔥 New
                    </button>
                    
                    <button
                      onClick={() => setShowOnlyRecent(!showOnlyRecent)}
                      className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                        showOnlyRecent 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📅 Recent
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Notices List - Simplified view */}
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {loadingNotices ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500">Loading announcements...</p>
                  </div>
                ) : noticeError ? (
                  <div className="text-center py-12 text-red-500">
                    <p>Error: {noticeError}</p>
                    <button onClick={() => fetchNotices()} className="mt-4 text-blue-500 underline">
                      Try Again
                    </button>
                  </div>
                ) : currentNotices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-500">No announcements found</p>
                  </div>
                ) : (
                  currentNotices.map((notice) => (
                    <div 
                      key={notice._id} 
                      className="group cursor-pointer"
                      onClick={() => openModal(notice)}
                    >
                      <div className={`bg-white rounded-xl border p-5 transition-all duration-200 hover:shadow-lg hover:border-blue-200 ${
                        notice.isPinned 
                          ? 'border-yellow-400 shadow-md' 
                          : 'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Title and tags row */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {notice.isPinned && (
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                  📌 Pinned
                                </span>
                              )}
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                notice.category === 'Exam' ? 'bg-red-100 text-red-700' :
                                notice.category === 'Event' ? 'bg-purple-100 text-purple-700' :
                                notice.category === 'Academic' ? 'bg-blue-100 text-blue-700' :
                                notice.category === 'Holiday' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {notice.category}
                              </span>
                              {notice.isNew && (
                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                  New
                                </span>
                              )}
                              <span className="text-xs text-gray-400 ml-auto">
                                {formatDate(notice.createdAt)}
                              </span>
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                              {notice.title}
                            </h3>
                            
                            {/* Author and stats row */}
                            <div className="flex items-center justify-between flex-wrap gap-3 mt-1">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{notice.author || 'Admin'}</span>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-gray-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                  </svg>
                                  <span className="font-medium">{notice.likes || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <span className="font-medium">{notice.comments?.length || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Arrow indicator */}
                          <div className="ml-3 text-gray-400 group-hover:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Pagination */}
              {!loadingNotices && notices.length > 0 && totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-xl text-sm transition-all ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
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
                      className={`px-4 py-2 rounded-xl text-sm transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Showing {indexOfFirstNotice + 1} - {Math.min(indexOfLastNotice, notices.length)} of {notices.length} notices
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* ================== CLASS ROUTINE SECTION ================== */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Class Routine</h2>
                    <p className="text-indigo-100 text-sm">{currentStudent.section}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Day Navigation */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <button
                    onClick={goToPreviousDay}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-gray-800">{currentDay}</div>
                    <button
                      onClick={goToToday}
                      className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-medium"
                    >
                      Today
                    </button>
                  </div>
                  
                  <button
                    onClick={goToNextDay}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                {/* Classes List - Fixed height */}
                <div className="space-y-3 h-[400px] overflow-y-auto">
                  {loadingClasses ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : classError ? (
                    <div className="text-center py-8 text-red-500">
                      <p className="text-sm">{classError}</p>
                    </div>
                  ) : todayClasses.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                      <div className="text-5xl mb-3">🎉</div>
                      <p className="text-gray-600 font-medium">No classes today</p>
                      <p className="text-sm text-gray-400 mt-1">Enjoy your day off!</p>
                    </div>
                  ) : (
                    todayClasses.map((cls, index) => (
                      <div key={cls.id || index} className="group">
                        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm">
                                {cls.time?.split(' - ')[0]?.split(':')[0] || '10'}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 text-base truncate">{cls.courseName}</h3>
                              <p className="text-sm text-gray-500 font-mono mt-0.5">{cls.courseCode}</p>
                              {cls.teacher && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 truncate">
                                  <span>👨‍🏫</span> {cls.teacher}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="truncate">{cls.time}</span>
                                </span>
                                <span className="flex items-center gap-1 text-gray-500">
                                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span className="truncate">{cls.room}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {!loadingClasses && classes.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">
                      Total {classes.length} classes this week
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================== REUSABLE NOTICE MODAL ================== */}
      <NoticeModal
        notice={selectedNotice}
        isOpen={isModalOpen}
        onClose={closeModal}
        onLike={handleLike}
        onCommentSubmit={handleCommentSubmit}
        onCommentEdit={handleCommentEdit}
        onCommentDelete={handleCommentDelete}
        currentUser={currentStudent}
      />
    </div>
  );
};

export default StudentOverview;