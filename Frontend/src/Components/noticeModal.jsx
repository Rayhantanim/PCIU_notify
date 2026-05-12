import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
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

  // Force update localNotice whenever notice prop changes
  useEffect(() => {
    if (notice && JSON.stringify(notice) !== JSON.stringify(previousNoticeRef.current)) {
      console.log("🔄 Updating modal with new notice data:", notice._id);
      setLocalNotice(notice);
      previousNoticeRef.current = notice;
    }
  }, [notice]);

  // Reset when modal opens with fresh data
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

  // Custom date formatter
  const formatDate = (dateString) => {
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
      
      return `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{localNotice.title}</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Meta Info */}
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(localNotice.priority)}`}></span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(localNotice.category)}`}>
                  {localNotice.category || "General"}
                </span>
                {localNotice.audience && localNotice.audience.length > 0 && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                    📢 For: {localNotice.audience.join(", ")}
                  </span>
                )}
                {localNotice.department && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                    🏛️ {localNotice.department}
                  </span>
                )}
                {localNotice.section && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                    📚 {localNotice.section}
                  </span>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {localNotice.description || localNotice.content}
                </p>
              </div>
              
              {/* Author and Date */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                    {localNotice.createdBy?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{localNotice.createdBy || "Admin"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(localNotice.createdAt)}</p>
                  </div>
                </div>
                {localNotice.expiryDate && (
                  <div className="text-sm text-orange-500 dark:text-orange-400">
                    ⏰ Expires: {formatDate(localNotice.expiryDate)}
                  </div>
                )}
              </div>
              
              {/* Like Button */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b dark:border-gray-700">
                <button
                  onClick={handleLikeClick}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isProcessing ? 'opacity-50 cursor-wait' : ''
                  } ${
                    isLiked()
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    isLiked() ? <FaHeart /> : <FaRegHeart />
                  )}
                  <span>{localNotice.likes || 0} {localNotice.likes === 1 ? 'like' : 'likes'}</span>
                </button>
              </div>
              
              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaComment /> Comments ({localNotice.comments?.length || 0})
                </h3>
                
                {/* Add Comment */}
                <div className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  />
                  <button
                    onClick={handleAddComment}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Post Comment
                  </button>
                </div>
                
                {/* Comments List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {localNotice.comments && localNotice.comments.length > 0 ? (
                    localNotice.comments.map((comment) => (
                      <div key={comment._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        {editingCommentId === comment._id ? (
                          <div>
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              rows="2"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white resize-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSaveEditComment(comment._id)}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingCommentText('');
                                }}
                                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {comment.userName || "Anonymous"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                  {formatDate(comment.createdAt)}
                                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                    <span className="ml-2 text-xs">(edited)</span>
                                  )}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                              </div>
                              {canEditComment(comment) && (
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => handleEditComment(comment._id, comment.text)}
                                    className="text-blue-500 hover:text-blue-600 transition-colors"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="text-red-500 hover:text-red-600 transition-colors"
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
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;