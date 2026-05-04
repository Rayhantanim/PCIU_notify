import React, { useEffect, useState } from "react";
import noticeImg from "../assets/notice.png";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import { RiPushpinLine } from "react-icons/ri";
import { FaSearch, FaFilter, FaCalendarAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
import NoticeModal from "../components/NoticeModal";
import { noticeService } from "../services/noticeService";

const AllNotices = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [myNotices, setMyNotices] = useState([]);
  const [otherNotices, setOtherNotices] = useState([]);
  const [editingNotice, setEditingNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("my");
  
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
  
  const API = "https://pciunotifybackend.onrender.com";

  // Get logged-in user info
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const fullName = localStorage.getItem("fullName") || `${firstName} ${lastName}`;
  
  // Current user object for modal
  const currentUser = {
    name: fullName,
    userId: localStorage.getItem("userId") || localStorage.getItem("_id") || "user_" + Date.now(),
    email: localStorage.getItem("email") || "",
    firstName: firstName,
    lastName: lastName
  };

  // Categories for filtering
  const categories = ["All", "general", "academic", "exam", "event", "urgent"];

  // Fetch notices
  useEffect(() => {
    fetchNotices();
  }, []);

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [notices, selectedCategory, searchQuery, startDate, endDate, activeTab]);

  const fetchNotices = async () => {
    try {
      const res = await fetch(`${API}/api/notices`);
      const data = await res.json();
      setNotices(data);

      // Separate my notices and others
      const myNoticesList = data.filter((notice) => {
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

      const otherNoticesList = data.filter(
        (notice) => !myNoticesList.find((my) => my._id === notice._id)
      );

      setMyNotices(myNoticesList);
      setOtherNotices(otherNoticesList);
      
      // Reset to first page when data changes
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
  };

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
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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
          fetchNotices();
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
        
        fetchNotices();
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

  const handleLike = async (noticeId) => {
    try {
      await noticeService.likeNotice(noticeId, currentUser.userId);
      fetchNotices(); // Refresh to get updated likes
    } catch (error) {
      console.error("Failed to like notice:", error);
      toast.error("Failed to like notice");
    }
  };

  const handleCommentSubmit = async (noticeId, text) => {
    if (!text.trim()) return;

    const commentData = {
      text: text.trim(),
      userId: currentUser.userId,
      userName: currentUser.name,
      userEmail: currentUser.email,
      createdAt: new Date().toISOString()
    };
    
    try {
      await noticeService.addComment(noticeId, commentData);
      fetchNotices(); // Refresh to get updated comments
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleCommentEdit = async (noticeId, commentId, text) => {
    try {
      await noticeService.editComment(noticeId, commentId, text, currentUser.userId);
      fetchNotices();
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Failed to edit comment:", error);
      toast.error("Failed to edit comment");
    }
  };

  const handleCommentDelete = async (noticeId, commentId) => {
    try {
      await noticeService.deleteComment(noticeId, commentId, currentUser.userId);
      fetchNotices();
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
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
        return "bg-red-100 text-red-700";
      case "event":
        return "bg-purple-100 text-purple-700";
      case "academic":
        return "bg-blue-100 text-blue-700";
      case "urgent":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  const NoticeCard = ({ notice, showActions = false, onClick }) => (
    <div 
      className="w-full border-2 border-gray-200 rounded-xl p-5 my-3 hover:shadow-xl transition-all duration-300 bg-white cursor-pointer hover:border-blue-300"
      onClick={() => onClick(notice)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Title & Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(notice.priority)}`}></span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(notice.category)}`}>
              {notice.category || "General"}
            </span>
            {notice.isPinned && (
              <span className="text-yellow-500"><RiPushpinLine /></span>
            )}
            {notice.audience && notice.audience.length > 0 && (
              <span className="text-xs flex items-center gap-1 text-gray-500">
                <IoPeopleSharp /> {notice.audience.join(", ")}
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
            {notice.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {notice.description?.replace(/<[^>]*>/g, "").substring(0, 120)}
            {notice.description?.replace(/<[^>]*>/g, "").length > 120 ? "..." : ""}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📅 {formatDate(notice.createdAt)}</span>
            <span>❤️ {notice.likes || 0} likes</span>
            <span>💬 {notice.comments?.length || 0} comments</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <img className="w-10 h-10 rounded-full object-cover" src={noticeImg} alt="" />
              <div>
                <p className="text-sm font-medium text-gray-800">{notice.createdBy || "Unknown"}</p>
                <p className="text-xs text-gray-400">{formatDate(notice.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(notice);
            }}
            className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
          >
            <MdEdit /> Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(notice._id);
            }}
            className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
          >
            <RiDeleteBin6Line /> Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Notice Board</h1>
          <p className="text-blue-100">Manage and view all announcements</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setActiveTab("my");
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
              activeTab === "my"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300"
            }`}
          >
            My Notices ({myNotices.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("all");
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
              activeTab === "all"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300"
            }`}
          >
            All Notices ({notices.length})
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <FaFilter /> Filters
            </button>
            
            {(selectedCategory !== "All" || startDate || endDate) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-red-600 hover:text-red-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat === "All" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Notices List */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === "my" ? "My Notices" : "All Notices"}
              </h2>
              <p className="text-gray-500">
                Showing {filteredNotices.length} of {activeTab === "my" ? myNotices.length : notices.length} notices
              </p>
            </div>

            {filteredNotices.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">No notices found</p>
                {(searchQuery || selectedCategory !== "All" || startDate || endDate) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-700 underline"
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
                      // EDIT MODE
                      <div className="border-2 border-blue-500 rounded-xl p-6 my-4 bg-blue-50">
                        <h3 className="text-lg font-semibold mb-4">Edit Notice</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              name="title"
                              value={editForm.title}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              name="description"
                              value={editForm.description?.replace(/<[^>]*>/g, "")}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              rows="4"
                              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select
                                name="category"
                                value={editForm.category}
                                onChange={handleEditChange}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                              >
                                <option value="">Select Category</option>
                                <option value="general">General</option>
                                <option value="academic">Academic</option>
                                <option value="exam">Exam</option>
                                <option value="event">Event</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                              <select
                                name="priority"
                                value={editForm.priority}
                                onChange={handleEditChange}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                            <div className="flex gap-4">
                              {["students", "teachers", "staff", "all"].map((a) => (
                                <label key={a} className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    name="audience"
                                    value={a}
                                    checked={editForm.audience.includes(a)}
                                    onChange={handleEditChange}
                                    className="rounded"
                                  />
                                  <span className="capitalize">{a}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                              type="date"
                              name="expiryDate"
                              value={editForm.expiryDate}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleSaveEdit(notice._id)}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                              💾 Save Changes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <NoticeCard 
                        notice={notice} 
                        showActions={activeTab === "my"} 
                        onClick={openModal}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Pagination */}
            {filteredNotices.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notice Modal */}
      <NoticeModal
        notice={selectedNotice}
        isOpen={isModalOpen}
        onClose={closeModal}
        onLike={handleLike}
        onCommentSubmit={handleCommentSubmit}
        onCommentEdit={handleCommentEdit}
        onCommentDelete={handleCommentDelete}
        currentUser={currentUser}
      />
    </div>
  );
};

export default AllNotices;