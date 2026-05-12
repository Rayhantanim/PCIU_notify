import React, { useEffect, useState, useCallback } from "react";
import noticeImg from "../assets/notice.png";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import { RiPushpinLine } from "react-icons/ri";
import { FaSearch, FaFilter, FaCalendarAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import Swal from 'sweetalert2';
import NoticeModal from "../Components/NoticeModal";
import { noticeService } from "../services/noticeService";
import { useTheme } from "../context/ThemeContext";

const API = "http://localhost:5000";

const AllNotices = () => {
  const { isDarkMode } = useTheme();
  const [notices, setNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [myNotices, setMyNotices] = useState([]);
  const [otherNotices, setOtherNotices] = useState([]);
  const [editingNotice, setEditingNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [noticeError, setNoticeError] = useState(null);
  const [likingInProgress, setLikingInProgress] = useState(new Set()); // Track likes in progress

  // Modal state
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    audience: [],
    department: "",
    section: "",
    expiryDate: "",
  });
  
  // Get logged-in user info
  const role = localStorage.getItem("role") || "";
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const fullName = localStorage.getItem("fullName") || `${firstName} ${lastName}`;
  const userId = localStorage.getItem("userId") || localStorage.getItem("_id");
  const userEmail = localStorage.getItem("email") || "";
  
  // Get current student info from localStorage
  const currentStudent = {
    department: localStorage.getItem("department") || "",
    section: localStorage.getItem("section") || ""
  };
  
  // Current user object for modal
  const currentUser = {
    name: fullName,
    userId: userId,
    email: userEmail,
    firstName: firstName,
    lastName: lastName
  };

  // Categories for filtering
  const categories = ["All", "general", "academic", "exam", "event", "urgent"];

  // Helper function to sort notices by date
  const sortNoticesByDate = (noticesList) => {
    return [...noticesList].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };
// Add to AllNotices.jsx - This ensures the modal gets updated notice data
useEffect(() => {
  if (selectedNotice && isModalOpen) {
    // Find the latest version of this notice from current state
    const updatedNotice = notices.find(n => n._id === selectedNotice._id) ||
                          allNotices.find(n => n._id === selectedNotice._id) ||
                          filteredNotices.find(n => n._id === selectedNotice._id);
    
    if (updatedNotice && updatedNotice !== selectedNotice) {
      setSelectedNotice(updatedNotice);
    }
  }
}, [notices, allNotices, filteredNotices, selectedNotice?._id, isModalOpen]);
  // Helper function to check if user liked a notice
  const hasUserLiked = useCallback((notice) => {
    if (!userId || !notice || !notice.likesArray) return false;
    return notice.likesArray.some(likeId => likeId?.toString() === userId?.toString());
  }, [userId]);

  // Fetch notices - wrap in useCallback to avoid recreation
  const fetchNotices = useCallback(async () => {
    try {
      setLoadingNotices(true);
      setNoticeError(null);
      
      if (!noticeService || typeof noticeService.getNotices !== 'function') {
        throw new Error('Notice service not properly initialized');
      }
      
      const data = await noticeService.getNotices();
      
      if (!Array.isArray(data)) { 
        setNoticeError('Invalid data format'); 
        setLoadingNotices(false); 
        return; 
      }

      let transformedNotices = data.map(notice => {
        let noticeSection = notice.section;
        if (noticeSection && !noticeSection.includes('-') && notice.department) {
          noticeSection = `${notice.department}-${noticeSection}`;
        }
        
        // Handle likes - keep as array for like checking
        let likesArray = [];
        let likesCount = 0;
        if (Array.isArray(notice.likes)) {
          likesArray = notice.likes.map(like => like?.toString());
          likesCount = likesArray.length;
        } else if (typeof notice.likes === 'number') {
          likesCount = notice.likes;
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
          likes: likesCount,
          likesArray: likesArray, // Store the actual array for like checking
          comments: (notice.comments || []).map(c => ({ ...c, _id: c._id || c.id })),
          attachment: notice.attachment, 
          isPinned: notice.isPinned,
          expiryDate: notice.expiryDate, 
          author: notice.author || notice.createdBy || 'Admin',
          createdBy: notice.createdBy
        };
      });

      // Separate my notices and others (only for non-student roles)
      if (role !== "student") {
        const myNoticesList = transformedNotices.filter((notice) => {
          if (!notice.createdBy || !fullName) return false;
          const createdByLower = notice.createdBy.toLowerCase().trim();
          const fullNameLower = fullName.toLowerCase().trim();

          if (createdByLower === fullNameLower) return true;

          const nameParts = fullNameLower.split(" ");
          if (nameParts.length === 2) {
            const reversedName = `${nameParts[1]} ${nameParts[0]}`;
            if (createdByLower === reversedName) return true;
          }

          return false;
        });
        setMyNotices(myNoticesList);
      }
      
      // Apply student filters if needed
      let filteredNotices = transformedNotices;
      if (role === "student" && currentStudent?.department) {
        filteredNotices = transformedNotices.filter(notice => {
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
      }

      const sortedNotices = sortNoticesByDate(filteredNotices);
      setAllNotices(sortedNotices);
      setNotices(sortedNotices);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error in fetchNotices:", error);
      setNoticeError(error.message);
      toast.error("Failed to fetch notices: " + error.message);
    } finally {
      setLoadingNotices(false);
    }
  }, [fullName, role, currentStudent.department, currentStudent.section]);

  // Fetch notices on mount
  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [notices, selectedCategory, searchQuery, startDate, endDate, activeTab, myNotices]);

  const applyFilters = () => {
    let sourceNotices = activeTab === "my" ? myNotices : notices;
    
    let filtered = [...sourceNotices];
    
    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(notice => 
        notice.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notice => 
        notice.title?.toLowerCase().includes(query) ||
        notice.description?.toLowerCase().includes(query) ||
        notice.createdBy?.toLowerCase().includes(query)
      );
    }
    
    // Date range filter
    if (startDate) {
      filtered = filtered.filter(notice => {
        const noticeDate = new Date(notice.createdAt).toISOString().split('T')[0];
        return noticeDate >= startDate;
      });
    }
    
    if (endDate) {
      filtered = filtered.filter(notice => {
        const noticeDate = new Date(notice.createdAt).toISOString().split('T')[0];
        return noticeDate <= endDate;
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredNotices(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setShowFilters(false);
  };

  const handleDelete = async (noticeId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API}/api/notice/${noticeId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          Swal.fire({
            title: "Deleted!",
            text: "Your notice has been deleted.",
            icon: "success"
          });
          await fetchNotices();
        } else {
          const data = await res.json();
          toast.error(data.message || "Failed to delete notice");
        }
      } catch (err) {
        console.error("Error deleting notice:", err);
        toast.error("Error deleting notice: " + err.message);
      }
    }
  };

  const handleSaveEdit = async (noticeId) => {
    if (!editForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editForm.description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      const res = await fetch(`${API}/api/notice/${noticeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "Notice updated successfully!",
          icon: "success",
          draggable: true
        });
        
        await fetchNotices();
        setEditingNotice(null);
      } else {
        toast.error(data.message || "Failed to update notice");
      }
    } catch (err) {
      console.error("Error updating notice:", err);
      toast.error("Error updating notice: " + err.message);
    }
  };

  const handleEditClick = (notice) => {
    setEditingNotice(notice._id);
    setEditForm({
      title: notice.title || "",
      description: notice.description || "",
      category: notice.category || "",
      priority: notice.priority || "medium",
      audience: notice.audience || [],
      department: notice.department || "",
      section: notice.section || "",
      expiryDate: notice.expiryDate ? notice.expiryDate.split("T")[0] : "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "audience") {
      let updated = [...editForm.audience];
      if (checked) {
        updated.push(value);
      } else {
        updated = updated.filter((item) => item !== value);
      }
      setEditForm({ ...editForm, audience: updated });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleCancelEdit = () => {
    setEditingNotice(null);
  };

  // Modal handlers
  const openModal = (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotice(null);
  };

 // Professional like handler with disable state and persistent like
const handleLike = async (noticeId) => {
  if (!userId) {
    toast.error("Please login to like notices");
    return;
  }
  
  // Prevent multiple clicks while processing
  if (likingInProgress.has(noticeId)) {
    return;
  }
  
  // Find current notice to check like status BEFORE API call
  const currentNotice = notices.find(n => n._id === noticeId);
  if (!currentNotice) return;
  
  const wasLiked = hasUserLiked(currentNotice);
  
  // Mark this notice as being processed
  setLikingInProgress(prev => new Set(prev).add(noticeId));
  
  try {
    const result = await noticeService.likeNotice(noticeId, userId);
    
    if (result.success) {
      // Update all state arrays by finding the notice and toggling like
      const updateNoticeLikes = (notice) => {
        if (notice._id === noticeId) {
          // Use wasLiked from before API call
          const newLikesCount = wasLiked ? notice.likes - 1 : notice.likes + 1;
          const newLikesArray = wasLiked 
            ? (notice.likesArray || []).filter(id => id?.toString() !== userId?.toString())
            : [...(notice.likesArray || []), userId];
          
          return {
            ...notice,
            likes: newLikesCount,
            likesArray: newLikesArray
          };
        }
        return notice;
      };
      
      // Update all state arrays for consistency
      setNotices(prev => prev.map(updateNoticeLikes));
      setAllNotices(prev => prev.map(updateNoticeLikes));
      setFilteredNotices(prev => prev.map(updateNoticeLikes));
      if (role !== "student") {
        setMyNotices(prev => prev.map(updateNoticeLikes));
      }
      
      // Show appropriate toast message based on wasLiked (before API call)
      if (wasLiked) {
        toast.success("💔 Unliked successfully");
      } else {
        toast.success("❤️ Liked successfully");
      }
    } else {
      toast.error(result.message || "Failed to update like");
    }
  } catch (error) {
    console.error("Failed to like notice:", error);
    toast.error("Failed to update like");
  } finally {
    // Remove the processing flag
    setLikingInProgress(prev => {
      const newSet = new Set(prev);
      newSet.delete(noticeId);
      return newSet;
    });
  }
};
  const handleCommentSubmit = async (noticeId, text) => {
    if (!text.trim()) {
      toast.error("Comment cannot be empty");
      return false;
    }
    
    if (!userId) {
      toast.error("Please login to comment");
      return false;
    }

    const commentData = {
      text: text.trim(),
      userId: userId,
      userName: currentUser.name,
      userEmail: currentUser.email,
      createdAt: new Date().toISOString()
    };
    
    try {
      const result = await noticeService.addComment(noticeId, commentData);
      if (result.success) {
        // Immediately update local state to show comment without refresh
        const newComment = {
          _id: result.comment?._id || Date.now().toString(),
          text: text.trim(),
          userId: userId,
          userName: currentUser.name,
          userEmail: currentUser.email,
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
        
        setNotices(prev => prev.map(updateComments));
        setAllNotices(prev => prev.map(updateComments));
        setFilteredNotices(prev => prev.map(updateComments));
        
        toast.success("💬 Comment added successfully");
        return true;
      } else {
        toast.error(result.message || "Failed to add comment");
        return false;
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
      return false;
    }
  };

  const handleCommentEdit = async (noticeId, commentId, text) => {
    if (!text.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    try {
      const result = await noticeService.editComment(noticeId, commentId, text, userId);
      if (result.success) {
        const updateComments = (notice) => {
          if (notice._id === noticeId) {
            return {
              ...notice,
              comments: notice.comments.map(comment => 
                comment._id === commentId 
                  ? { ...comment, text: text.trim(), updatedAt: new Date().toISOString() }
                  : comment
              )
            };
          }
          return notice;
        };
        
        setNotices(prev => prev.map(updateComments));
        setAllNotices(prev => prev.map(updateComments));
        setFilteredNotices(prev => prev.map(updateComments));
        
        toast.success("✏️ Comment updated successfully");
      } else {
        toast.error(result.message || "Failed to edit comment");
      }
    } catch (error) {
      console.error("Failed to edit comment:", error);
      toast.error("Failed to edit comment");
    }
  };

  const handleCommentDelete = async (noticeId, commentId) => {
    const result = await Swal.fire({
      title: "Delete comment?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await noticeService.deleteComment(noticeId, commentId, userId);
        if (deleteResult.success) {
          const updateComments = (notice) => {
            if (notice._id === noticeId) {
              return {
                ...notice,
                comments: notice.comments.filter(comment => comment._id !== commentId)
              };
            }
            return notice;
          };
          
          setNotices(prev => prev.map(updateComments));
          setAllNotices(prev => prev.map(updateComments));
          setFilteredNotices(prev => prev.map(updateComments));
          
          toast.success("🗑️ Comment deleted successfully");
        } else {
          toast.error(deleteResult.message || "Failed to delete comment");
        }
      } catch (error) {
        console.error("Failed to delete comment:", error);
        toast.error("Failed to delete comment");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "exam":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "event":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "academic":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "urgent":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = filteredNotices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const NoticeCard = ({ notice, showActions = false, onClick }) => {
    const isLiked = hasUserLiked(notice);
    const isProcessing = likingInProgress.has(notice._id);
    
    return (
      <div 
        className={`w-full border-2 rounded-xl p-5 my-3 hover:shadow-xl transition-all duration-300 cursor-pointer ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-800 hover:border-blue-500' 
            : 'border-gray-200 bg-white hover:border-blue-300'
        }`}
        onClick={() => onClick(notice)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(notice.priority)}`}></span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(notice.category)}`}>
                {notice.category || "General"}
              </span>
              {notice.isPinned && <span className="text-yellow-500"><RiPushpinLine /></span>}
              {notice.audience && notice.audience.length > 0 && (
                <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <IoPeopleSharp /> {notice.audience.join(", ")}
                </span>
              )}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {notice.title}
            </h3>
            <p className={`text-sm line-clamp-2 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {notice.description?.replace(/<[^>]*>/g, "").substring(0, 120)}
            </p>
            <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <span>📅 {formatDate(notice.createdAt)}</span>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleLike(notice._id);
                }}
                disabled={isProcessing}
                className={`flex items-center gap-1 transition-all duration-200 ${
                  isProcessing ? 'opacity-50 cursor-wait' : ''
                } ${
                  isLiked 
                    ? 'text-red-500' 
                    : isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />
                )}
                <span>{notice.likes || 0} {notice.likes === 1 ? 'like' : 'likes'}</span>
              </button>
              <span>💬 {notice.comments?.length || 0} {notice.comments?.length === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <img className="w-10 h-10 rounded-full object-cover" src={noticeImg} alt="" />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {notice.createdBy || "Unknown"}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(notice.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showActions && (
          <div className={`flex justify-end gap-2 mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <button onClick={(e) => { e.stopPropagation(); handleEditClick(notice); }}
              className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}>
              <MdEdit /> Edit
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(notice._id); }}
              className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}>
              <RiDeleteBin6Line /> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loadingNotices) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading notices...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (noticeError) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`text-center p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Error Loading Notices</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{noticeError}</p>
          <button
            onClick={fetchNotices}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">📢 Notice Board</h1>
          <p className="text-blue-50">Stay updated with the latest announcements</p>
        </div>

        {/* Tabs - Only show "All Notices" for students */}
        <div className="flex gap-4 mb-6">
          {role !== "student" && (
            <button 
              onClick={() => { setActiveTab("my"); setSelectedCategory("All"); setSearchQuery(""); }}
              className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
                activeTab === "my" 
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md" 
                  : isDarkMode 
                    ? "bg-gray-800 text-gray-300 border border-gray-700 hover:border-blue-500" 
                    : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300"
              }`}
            >
              📝 My Notices ({myNotices.length})
            </button>
          )}
          <button 
            onClick={() => { setActiveTab("all"); setSelectedCategory("All"); setSearchQuery(""); }}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
              activeTab === "all" 
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md" 
                : isDarkMode 
                  ? "bg-gray-800 text-gray-300 border border-gray-700 hover:border-blue-500" 
                  : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300"
            }`}
          >
            📋 All Notices ({notices.length})
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className={`rounded-xl shadow-sm border p-4 mb-6 transition-all duration-200 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  placeholder="🔍 Search by title, description, or author..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-slate-300 text-slate-900'
                  }`} 
                />
              </div>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FaFilter /> Filters
            </button>
            {(selectedCategory !== "All" || startDate || endDate) && (
              <button 
                onClick={clearFilters} 
                className="px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {showFilters && (
            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-700'
                    }`} 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-700'
                    }`} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                  : isDarkMode 
                    ? "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:border-blue-500"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-blue-300"
              }`}
            >
              {cat === "All" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Notices List */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {activeTab === "my" ? "📝 My Notices" : "📋 All Notices"}
              </h2>
              <p className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>
                Showing {filteredNotices.length} of {activeTab === "my" ? myNotices.length : notices.length} notices
              </p>
            </div>

            {filteredNotices.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>No notices found</p>
                {(searchQuery || selectedCategory !== "All" || startDate || endDate) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {currentNotices.map((notice) => (
                  <div key={notice._id}>
                    {editingNotice === notice._id ? (
                      <div className={`border-2 border-blue-400 rounded-xl p-6 my-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50/50'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>✏️ Edit Notice</h3>
                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Title</label>
                            <input type="text" name="title" value={editForm.title} onChange={handleEditChange}
                              className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-slate-300 text-slate-700'
                              }`} />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Description</label>
                            <textarea name="description" value={editForm.description?.replace(/<[^>]*>/g, "")}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows="4"
                              className={`w-full border rounded-xl p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-slate-300 text-slate-700'
                              }`} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Category</label>
                              <select name="category" value={editForm.category} onChange={handleEditChange}
                                className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                  isDarkMode 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-slate-300 text-slate-700'
                                }`}>
                                <option value="">Select Category</option>
                                <option value="general">General</option>
                                <option value="academic">Academic</option>
                                <option value="exam">Exam</option>
                                <option value="event">Event</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Priority</label>
                              <select name="priority" value={editForm.priority} onChange={handleEditChange}
                                className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                  isDarkMode 
                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                    : 'bg-white border-slate-300 text-slate-700'
                                }`}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Audience</label>
                            <div className="flex gap-4">
                              {["students", "teachers", "staff", "all"].map((a) => (
                                <label key={a} className="flex items-center gap-1 cursor-pointer">
                                  <input type="checkbox" name="audience" value={a}
                                    checked={editForm.audience.includes(a)} onChange={handleEditChange}
                                    className="rounded border-slate-300 text-blue-500 focus:ring-blue-500" />
                                  <span className={`capitalize ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{a}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Expiry Date</label>
                            <input type="date" name="expiryDate" value={editForm.expiryDate} onChange={handleEditChange}
                              className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-slate-300 text-slate-700'
                              }`} />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button onClick={() => handleSaveEdit(notice._id)}
                              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md">
                              💾 Save Changes
                            </button>
                            <button onClick={handleCancelEdit}
                              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                                isDarkMode 
                                  ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600' 
                                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                              }`}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <NoticeCard notice={notice} showActions={activeTab === "my"} onClick={openModal} />
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Pagination */}
            {filteredNotices.length > 0 && totalPages > 1 && (
              <div className={`flex justify-center items-center gap-2 mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                <button onClick={goToPreviousPage} disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? isDarkMode 
                        ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                        : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}>
                  ← Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i));
                    return (
                      <button key={pageNum} onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                          currentPage === pageNum 
                            ? 'bg-blue-500 text-white shadow-sm' 
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={goToNextPage} disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentPage === totalPages
                      ? isDarkMode 
                        ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                        : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <NoticeModal
        notice={selectedNotice}
        isOpen={isModalOpen}
        onClose={closeModal}
        onLike={handleLike}
        onCommentSubmit={handleCommentSubmit}
        onCommentEdit={handleCommentEdit}
        onCommentDelete={handleCommentDelete}
        currentUser={currentUser}
         likingInProgress={likingInProgress}
      />
    </div>
  );
};

export default AllNotices;