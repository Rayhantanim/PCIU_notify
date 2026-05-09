// components/NoticeModal.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const NoticeModal = ({ 
  notice, 
  isOpen, 
  onClose, 
  onLike, 
  onCommentSubmit, 
  onCommentEdit,
  onCommentDelete,
  currentUser 
}) => {
  const [modalComment, setModalComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [localLikes, setLocalLikes] = useState(0);
  const [localComments, setLocalComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);

  // Initialize local state from notice prop
  React.useEffect(() => {
    if (notice) {
      setLocalLikes(notice.likes || 0);
      setLocalComments(notice.comments || []);
    }
  }, [notice]);

  if (!isOpen || !notice) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const handleLike = async () => {
    if (hasLiked) {
      toast.info("You already liked this notice");
      return;
    }
    
    if (onLike) {
      setHasLiked(true);
      setLocalLikes(prev => prev + 1);
      await onLike(notice._id);
    }
  };

  const handleCommentSubmit = async () => {
    if (modalComment.trim() && onCommentSubmit) {
      const newComment = {
        _id: Date.now().toString(),
        text: modalComment.trim(),
        userName: currentUser?.name || 'Anonymous',
        userEmail: currentUser?.email,
        userId: currentUser?.userId,
        createdAt: new Date().toISOString()
      };
      
      // Optimistic update
      setLocalComments(prev => [...prev, newComment]);
      setModalComment('');
      
      try {
        await onCommentSubmit(notice._id, modalComment.trim());
      } catch (error) {
        // Revert on error
        setLocalComments(prev => prev.filter(c => c._id !== newComment._id));
        toast.error("Failed to post comment");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  const startEdit = (comment, index) => {
    setEditingCommentId(comment._id || index);
    setEditingText(comment.text);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const saveEdit = async (commentId, index) => {
    if (editingText.trim() && onCommentEdit) {
      // Optimistic update
      setLocalComments(prev => prev.map(comment => 
        (comment._id === commentId || index === comment._id) 
          ? { ...comment, text: editingText.trim(), editedAt: new Date().toISOString() }
          : comment
      ));
      
      try {
        await onCommentEdit(notice._id, commentId, editingText.trim());
        cancelEdit();
      } catch (error) {
        // Revert on error
        const originalComment = (notice.comments || []).find(c => c._id === commentId);
        if (originalComment) {
          setLocalComments(prev => prev.map(comment => 
            (comment._id === commentId) ? originalComment : comment
          ));
        }
        toast.error("Failed to edit comment");
      }
    }
  };

  const handleEditKeyPress = (e, commentId, index) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(commentId, index);
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      // Optimistic update
      setLocalComments(prev => prev.filter(comment => comment._id !== commentId));
      
      try {
        await onCommentDelete(notice._id, commentId);
      } catch (error) {
        // Revert on error
        const deletedComment = (notice.comments || []).find(c => c._id === commentId);
        if (deletedComment) {
          setLocalComments(prev => [...prev, deletedComment]);
        }
        toast.error("Failed to delete comment");
      }
    }
  };

  const isOwnComment = (comment) => {
    if (!currentUser) return false;
    return comment.userId === currentUser.userId || 
           comment.userEmail === currentUser.email ||
           comment.userName === currentUser.name;
  };

  // Render HTML content safely
  const renderContent = () => {
    const content = notice.description || notice.content || 'No content available';
    return { __html: content };
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              notice.category === 'Exam' ? 'bg-red-100 text-red-700' :
              notice.category === 'Event' ? 'bg-purple-100 text-purple-700' :
              notice.category === 'Academic' ? 'bg-blue-100 text-blue-700' :
              notice.category === 'Holiday' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {notice.category || 'General'}
            </span>
            {notice.isPinned && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                📌 Pinned
              </span>
            )}
            {notice.isNew && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                New
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{notice.title}</h2>
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{notice.author || notice.createdBy || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(notice.createdAt)}</span>
            </div>
            {notice.section && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{notice.section}</span>
              </div>
            )}
            {notice.department && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{notice.department}</span>
              </div>
            )}
          </div>
          
          {/* Description/Content - Using dangerouslySetInnerHTML to preserve formatting */}
          <div className="prose max-w-none mb-6">
            <div 
              className="text-gray-700 leading-relaxed notice-content"
              dangerouslySetInnerHTML={renderContent()}
              style={{ 
                wordBreak: 'break-word',
                lineHeight: '1.6'
              }}
            />
          </div>
          
          {/* Attachment if exists */}
          {notice.attachment && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Attachment:</span>
                <a 
                  href={notice.attachment} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Attachment
                </a>
              </div>
            </div>
          )}
          
          {/* Like and Comment Actions */}
          <div className="flex items-center gap-6 mb-6 pt-2 border-t border-gray-100">
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center gap-2 transition-colors duration-200 group ${
                hasLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${hasLiked ? 'fill-red-500' : ''}`} fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="font-medium">{localLikes} Likes</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">{localComments.length} Comments</span>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comments ({localComments.length})
            </h4>
            
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {localComments.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No comments yet. Be the first to comment!</p>
              ) : (
                localComments.map((comment, idx) => (
                  <div key={comment._id || idx} className="bg-gray-50 rounded-lg p-3">
                    {editingCommentId === (comment._id || idx) ? (
                      // Edit mode
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, comment._id, idx)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(comment._id, idx)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm text-gray-800">
                                {comment.userName || comment.userEmail || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                              {comment.editedAt && (
                                <span className="text-xs text-gray-400 italic">
                                  (edited)
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                              {comment.text}
                            </p>
                          </div>
                          {isOwnComment(comment) && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => startEdit(comment, idx)}
                                className="text-gray-400 hover:text-blue-500 transition p-1"
                                title="Edit comment"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(comment._id)}
                                className="text-gray-400 hover:text-red-500 transition p-1"
                                title="Delete comment"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Add Comment */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={modalComment}
                onChange={(e) => setModalComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!modalComment.trim()}
                className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2 rounded-xl transition-all duration-200 ${
                  !modalComment.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;