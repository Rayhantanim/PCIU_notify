import React, { useEffect, useState } from "react";
import { MdNotificationImportant } from "react-icons/md";
import { useTheme } from "../Context/ThemeContext";
import NoticeModal from "../Components/NoticeModal"; // Import your existing NoticeModal
import { noticeService } from "../services/noticeService"; // Import noticeService for like/comment functionality

const ImportantNotice = () => {
  const { isDarkMode } = useTheme();
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(new Set());
  const API = "https://pciunotifybackend.onrender.com";

  // Get logged-in user info
  const userId = localStorage.getItem("userId") || localStorage.getItem("_id");
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const fullName = localStorage.getItem("fullName") || `${firstName} ${lastName}`;
  const userEmail = localStorage.getItem("email") || "";
  const userRole = localStorage.getItem("role") || "";

  const currentUser = {
    name: fullName,
    userId: userId,
    email: userEmail,
    firstName: firstName,
    lastName: lastName,
    role: userRole
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API}/api/notices`);
        const data = await res.json();

        // 🔥 only urgent notices
        const urgentNotices = data.filter(
          (notice) => notice.priority === "urgent"
        );

        // Transform notices to include likesArray
        const transformedNotices = urgentNotices.map(notice => ({
          ...notice,
          likesArray: Array.isArray(notice.likes) ? notice.likes : [],
          likes: Array.isArray(notice.likes) ? notice.likes.length : (notice.likes || 0)
        }));

        setNotices(transformedNotices);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotices();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openModal = (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotice(null);
  };

  // Like handler
  const handleLike = async (noticeId) => {
    if (!userId) {
      toast.error("Please login to like notices");
      return;
    }
    
    if (likingInProgress.has(noticeId)) return;
    
    const currentNotice = notices.find(n => n._id === noticeId);
    if (!currentNotice) return;
    
    const wasLiked = currentNotice.likesArray?.some(like => like?.toString() === userId?.toString());
    
    setLikingInProgress(prev => new Set(prev).add(noticeId));
    
    try {
      const result = await noticeService.likeNotice(noticeId, userId);
      
      if (result.success) {
        const updateNoticeLikes = (notice) => {
          if (notice._id === noticeId) {
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
        
        setNotices(prev => prev.map(updateNoticeLikes));
        
        if (wasLiked) {
          toast.success("💔 Unliked successfully");
        } else {
          toast.success("❤️ Liked successfully");
        }
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

  // Comment handlers
  const handleCommentSubmit = async (noticeId, text) => {
    if (!text.trim()) return false;
    
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
        toast.success("💬 Comment added successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add comment:", error);
      return false;
    }
  };

  const handleCommentEdit = async (noticeId, commentId, text) => {
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
        toast.success("✏️ Comment updated successfully");
      }
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleCommentDelete = async (noticeId, commentId) => {
    try {
      const result = await noticeService.deleteComment(noticeId, commentId, userId);
      if (result.success) {
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
        toast.success("🗑️ Comment deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg shadow-red-200 dark:shadow-red-900/30 p-6 mb-8 text-white">
          <div className="flex items-center gap-3">
            <MdNotificationImportant className="text-3xl" />
            <div>
              <h1 className="text-3xl font-bold">Important Notices</h1>
              <p className="text-red-100 mt-1">Urgent announcements that require immediate attention</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className={`rounded-xl p-4 mb-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Total Urgent Notices:
              </span>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {notices.length}
              </span>
            </div>
            {notices.length > 0 && (
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ⚠️ Click on any notice to view details
              </div>
            )}
          </div>
        </div>

        {notices.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className="text-6xl mb-4">✅</div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No urgent notices found</p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>All caught up! No critical announcements at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice._id}
                onClick={() => openModal(notice)}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800 border-l-4 border-red-500 hover:border-orange-500' 
                    : 'bg-white border-l-4 border-red-500 hover:border-blue-600'
                } shadow-sm hover:shadow-xl ${isDarkMode ? 'hover:shadow-gray-900/50' : 'hover:shadow-blue-200'}`}
              >
                {/* Priority Badge - Top Right Corner */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold animate-pulse ${
                    isDarkMode 
                      ? 'bg-red-900/50 text-red-400 border border-red-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    URGENT
                  </span>
                </div>

                <div className="p-6 pr-24">
                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {notice.title}
                  </h3>

                  {/* Description Preview */}
                  <div className={`mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {notice.description?.replace(/<[^>]*>/g, "").substring(0, 150)}
                    {notice.description?.replace(/<[^>]*>/g, "").length > 150 ? "..." : ""}
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap justify-between items-center gap-4 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        📅 {formatDate(notice.createdAt)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        📁 {notice.category || "General"}
                      </span>
                      {notice.department && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          🏢 {notice.department}
                        </span>
                      )}
                      {notice.createdBy && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          👤 {notice.createdBy}
                        </span>
                      )}
                    </div>

                    {/* Like & Comment Count */}
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        ❤️ {notice.likes || 0}
                      </span>
                      <span className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        💬 {notice.comments?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Expiry Warning */}
                  {notice.expiryDate && new Date(notice.expiryDate) < new Date() && (
                    <div className={`mt-3 p-2 rounded-lg text-sm ${
                      isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      ⚠️ This notice has expired
                    </div>
                  )}
                </div>

                {/* Animated border effect on hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-2xl pointer-events-none transition-all duration-300"></div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        {notices.length > 0 && (
          <div className={`mt-8 p-4 rounded-xl text-center text-sm ${
            isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
          } shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <p>❗ Urgent notices require immediate attention. Click on any notice to view full details, like, and comment.</p>
          </div>
        )}
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
        likingInProgress={likingInProgress}
      />
    </div>
  );
};

export default ImportantNotice;