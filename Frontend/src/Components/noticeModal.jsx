import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaEdit, FaTimes, FaCalendarAlt, FaUser, FaUsers, FaFlag, FaFolder, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const NoticeModal = ({ 
  notice, 
  isOpen, 
  onClose, 
  onLike, 
  onCommentSubmit, 
  onCommentEdit, 
  onCommentDelete, 
  currentUser,
  likingInProgress = new Set()
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [localNotice, setLocalNotice] = useState(notice);
  const previousNoticeRef = useRef(notice);

  useEffect(() => {
    if (notice && JSON.stringify(notice) !== JSON.stringify(previousNoticeRef.current)) {
      setLocalNotice(notice);
      previousNoticeRef.current = notice;
    }
  }, [notice]);

  useEffect(() => {
    if (isOpen && notice) {
      setLocalNotice(notice);
      setNewComment('');
      setEditingCommentId(null);
    }
  }, [isOpen, notice]);

  if (!isOpen || !localNotice) return null;

  const isLiked = () => {
    if (!currentUser?.userId || !localNotice?.likesArray) return false;
    return localNotice.likesArray.some(like => like?.toString() === currentUser.userId?.toString());
  };

  const isProcessing = likingInProgress.has(localNotice._id);

  const handleLikeClick = () => {
    if (isProcessing) return; 
    onLike(localNotice._id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    const success = await onCommentSubmit(localNotice._id, newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    await onCommentEdit(localNotice._id, commentId, editingCommentText);
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteComment = async (commentId) => {
    Swal.fire({
      title: "Delete comment?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await onCommentDelete(localNotice._id, commentId);
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
    } catch {
      return "Invalid date";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "exam": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "event": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "academic": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "urgent": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const canEditComment = (comment) => {
    return comment.userId === currentUser?.userId;
  };

  const cleanContent = (content) => {
    if (!content) return "";
    return content.replace(/<[^>]*>/g, "");
  };

  // Get the role from the logged-in user (currentUser)
  const getUserRole = () => {
    console.log("👤 Current User:", currentUser);
    console.log("👤 User Role:", currentUser?.role);
    
    if (currentUser?.role) {
      return currentUser.role;
    }
    
    // Fallback to localStorage if currentUser doesn't have role
    const storedRole = localStorage.getItem("role");
    console.log("📦 Role from localStorage:", storedRole);
    
    if (storedRole) {
      return storedRole;
    }
    
    return "staff"; // Default fallback
  };

  const userRole = getUserRole();
  console.log("🎯 Final userRole for signature:", userRole);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-none shadow-2xl max-h-[90vh] overflow-y-auto">
          
          {/* Close Button - Top Right Corner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Close"
          >
            <FaTimes size={20} />
          </button>

          {/* University Letterhead */}
          <div className="text-center pt-8 pb-4 border-b border-gray-300 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wide">
              Port City International University
            </h1>
            <p className="text-gray-600 dark:text-gray-400 italic mt-1">
              Excellence in Higher Education
            </p>
            <div className="mt-2 inline-block bg-red-600 text-white px-4 py-1 text-sm font-semibold tracking-wide">
              GOVT. & UGC APPROVED
            </div>
          </div>

          {/* Notice Title - Centered NOTICE */}
          <div className="text-center py-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-700 inline-block px-8 pb-2">
              NOTICE
            </h2>
          </div>

          {/* Notice Content */}
          <div className="px-8 pb-8">
            
            {/* Reference No, Date, To, From, Subject */}
            <div className="space-y-2 mb-6 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-semibold">Ref No:</span> {localNotice.refNo || `PCIU/REG ${formatDate(localNotice.createdAt).split(',')[0].slice(0,3)} ${formatDate(localNotice.createdAt).split(',')[0].slice(-2)}/01 (281)`}
              </p>
              <p>
                <span className="font-semibold">Date:</span> {formatDate(localNotice.createdAt)}
              </p>
              <p>
                <span className="font-semibold">To:</span> All concerned
              </p>
              <p>
                <span className="font-semibold">From:</span> {localNotice.createdBy || "Office of the Registrar"}
              </p>
              <p className="pt-2">
                <span className="font-semibold">Subject:</span> {localNotice.title}
              </p>
            </div>

            {/* Notice Body */}
            <div className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300 space-y-4">
              {cleanContent(localNotice.description || localNotice.content).split('\n').map((paragraph, idx) => (
                paragraph.trim() && <p key={idx} className="text-justify">{paragraph}</p>
              ))}
            </div>

            {/* Signature Block - Based on logged-in user's role */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex ">
                <div className="text-left">
                  
                  {/* TEACHER: Only show name and university (NO Sincerely) */}
                  {userRole === "teacher" && (
                    <>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                        {currentUser?.name || localNotice.createdBy || "Faculty Member"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Port City International University
                      </p>
                    </>
                  )}
                  
                  {/* STAFF: Show Sincerely + Name + University */}
                  {userRole === "staff" && (
                    <>
                      <p className="text-gray-600 dark:text-gray-400">Sincerely,</p>
                      <div className="mt-4">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                          {currentUser?.name || localNotice.createdBy || "Staff Member"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Port City International University
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* ADMIN / REGISTRAR / DEPUTY REGISTRAR: Show Sincerely + Deputy Registrar + University */}
                  {(userRole === "admin" || userRole === "registrar" || userRole === "deputy-registrar") && (
                    <>
                      <p className="text-gray-600 dark:text-gray-400">Sincerely,</p>
                      <div className="mt-4">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                          Deputy Registrar
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Port City International University
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* Default (if role is unknown) - Show as Staff */}
                  {!["teacher", "staff", "admin", "registrar", "deputy-registrar"].includes(userRole) && (
                    <>
                      <p className="text-gray-600 dark:text-gray-400">Sincerely,</p>
                      <div className="mt-4">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                          {currentUser?.name || localNotice.createdBy || "Staff Member"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Port City International University
                        </p>
                      </div>
                    </>
                  )}
                  
                </div>
              </div>
            </div>

            {/* Info Badges */}
            <div className="mt-8 flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${getCategoryColor(localNotice.category)}`}>
                <FaFolder className="text-xs" />
                {localNotice.category || "General"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <FaFlag className="text-xs" />
                Priority: <span className="capitalize">{localNotice.priority || "Normal"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <FaUsers className="text-xs" />
                Audience: {localNotice.audience && localNotice.audience.length > 0 
                  ? localNotice.audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")
                  : "All"}
              </span>
            </div>
          </div>

          {/* Like Button Section */}
          <div className="px-8 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLikeClick}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-200 text-sm ${
                isProcessing ? 'opacity-50 cursor-wait' : ''
              } ${
                isLiked()
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isLiked() ? <FaHeart /> : <FaRegHeart />
              )}
              <span>{localNotice.likes || 0} {localNotice.likes === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="px-8 py-5 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaComment className="text-blue-500" /> 
              Comments ({localNotice.comments?.length || 0})
            </h3>
            
            {/* Add Comment */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none transition-all"
              />
              <button
                onClick={handleAddComment}
                className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                Post Comment
              </button>
            </div>
            
            {/* Comments List */}
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {localNotice.comments && localNotice.comments.length > 0 ? (
                localNotice.comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    {editingCommentId === comment._id ? (
                      <div>
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEditComment(comment._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentText('');
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {comment.userName?.charAt(0).toUpperCase() || "A"}
                              </div>
                              <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                {comment.userName || "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatCommentDate(comment.createdAt)}
                                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                  <span className="ml-2 text-xs italic">(edited)</span>
                                )}
                              </p>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm ml-9">{comment.text}</p>
                          </div>
                          {canEditComment(comment) && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditComment(comment._id, comment.text)}
                                className="text-blue-500 hover:text-blue-600 transition-colors"
                                title="Edit comment"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                                title="Delete comment"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <FaComment className="text-4xl mx-auto mb-3 opacity-50" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;