import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { toast } from "react-toastify";
import axios from "axios";
import { useTheme } from "../Context/ThemeContext";

export default function RealTimeNotification() {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const API = "https://pciunotifybackend.onrender.com";

  // Fetch existing notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userRole = localStorage.getItem("role");
      const res = await axios.get(`${API}/api/notifications`, {
        headers: { 'User-Role': userRole }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Initialize socket - runs only once
  useEffect(() => {
    if (!isInitialized) {
      console.log("🔄 Initializing socket connection...");
      
      const newSocket = io(API, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      socketRef.current = newSocket;
      setIsInitialized(true);
      
      newSocket.on("connect", () => {
        console.log("✅ Socket connected! ID:", newSocket.id);
        setIsConnected(true);
      });
      
      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
      });
      
      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setIsConnected(false);
      });
      
      newSocket.on("newNotice", (notice) => {
        const userRole = localStorage.getItem("role");
        
        let shouldShow = false;
        if (userRole === "student") {
          shouldShow = notice.audience === "students" || notice.audience === "all";
        } else if (userRole === "teacher") {
          shouldShow = notice.audience === "teachers" || notice.audience === "all";
        } else if (userRole === "staff") {
          shouldShow = notice.audience === "staff" || notice.audience === "all";
        } else {
          shouldShow = true;
        }
        
        if (shouldShow) {
          const newNotification = {
            _id: notice.id || Date.now(),
            noticeId: notice.noticeId,
            title: notice.title,
            message: notice.message,
            createdAt: notice.time || new Date(),
            read: false,
            type: notice.type,
            audience: notice.audience,
            createdBy: notice.createdBy
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast.info(`📢 ${notice.title}`, {
            position: "top-right",
            autoClose: 5000,
            onClick: () => setOpen(true),
            theme: isDarkMode ? "dark" : "light",
          });
        }
      });
    }
    
    return () => {
      if (socketRef.current && isInitialized) {
        console.log("🔄 Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [API, isInitialized, isDarkMode]);

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.post(`${API}/api/notifications/mark-all-read`);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read", {
        theme: isDarkMode ? "dark" : "light",
      });
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API}/api/notifications/${id}`);
      const updated = notifications.filter(n => n._id !== id);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read).length);
      toast.success("Notification deleted", {
        theme: isDarkMode ? "dark" : "light",
      });
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Delete all read notifications
  const deleteAllRead = async () => {
    const readNotifications = notifications.filter(n => n.read);
    if (readNotifications.length === 0) {
      toast.info("No read notifications to delete", {
        theme: isDarkMode ? "dark" : "light",
      });
      return;
    }
    
    try {
      for (const notif of readNotifications) {
        await axios.delete(`${API}/api/notifications/${notif._id}`);
      }
      const updated = notifications.filter(n => !n.read);
      setNotifications(updated);
      toast.success(`Deleted ${readNotifications.length} read notifications`, {
        theme: isDarkMode ? "dark" : "light",
      });
    } catch (err) {
      console.error("Error deleting read notifications:", err);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "staff-notice":
        return "👔";
      case "teacher-notice":
        return "👨‍🏫";
      case "student-notice":
        return "🎓";
      default:
        return "📢";
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Arctic White Clean Blue Theme */}
      <div
        className={`relative cursor-pointer p-2 rounded-full transition-all duration-200 ${
          open 
            ? isDarkMode 
              ? 'bg-gray-700' 
              : 'bg-blue-50'
            : isDarkMode
              ? 'hover:bg-gray-800'
              : 'hover:bg-gray-50'
        }`}
        onClick={() => setOpen(!open)}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error" 
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '10px',
              height: '18px',
              minWidth: '18px',
            }
          }}
        >
          <NotificationsIcon 
            sx={{ 
              fontSize: 24, 
              color: isDarkMode ? '#94a3b8' : '#3b82f6',
              transition: 'color 0.2s'
            }} 
          />
        </Badge>
        
        {/* Connection status indicator */}
        {isConnected && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-800"></div>
        )}
      </div>

      {/* Notification Dropdown - Arctic White Clean Blue Theme */}
      {open && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          
          <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-2xl z-50 overflow-hidden transition-all duration-200 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
          }`}>
            {/* Header - Clean Blue Gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-blue-100 text-xs mt-0.5">
                      {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition text-white text-xs flex items-center gap-1"
                      title="Mark all as read"
                    >
                      <DoneAllIcon sx={{ fontSize: 16 }} />
                      <span className="hidden sm:inline">All read</span>
                    </button>
                  )}
                  {notifications.some(n => n.read) && (
                    <button
                      onClick={deleteAllRead}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition text-white text-xs flex items-center gap-1"
                      title="Delete read notifications"
                    >
                      <DeleteSweepIcon sx={{ fontSize: 16 }} />
                      <span className="hidden sm:inline">Clear read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🔔</div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No notifications yet
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    New announcements will appear here
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`border-b transition-all duration-200 cursor-pointer ${
                      !notif.read 
                        ? isDarkMode 
                          ? 'bg-blue-900/20 border-blue-800/50 hover:bg-blue-900/30' 
                          : 'bg-blue-50/80 border-blue-100 hover:bg-blue-100/80'
                        : isDarkMode
                          ? 'border-gray-700 hover:bg-gray-700/50'
                          : 'border-gray-100 hover:bg-gray-50'
                    }`}
                    onClick={() => markAsRead(notif._id)}
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-lg sm:text-xl">
                              {getNotificationIcon(notif.type)}
                            </span>
                            <h4 className={`font-semibold text-sm sm:text-base truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                                New
                              </span>
                            )}
                          </div>
                          <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {notif.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <p className={`text-[10px] sm:text-xs flex items-center gap-1 ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              <span>🕐</span>
                              {formatTime(notif.createdAt)}
                            </p>
                            {notif.createdBy && (
                              <p className={`text-[10px] sm:text-xs flex items-center gap-1 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                <span>👤</span>
                                {notif.createdBy}
                              </p>
                            )}
                            {notif.audience && (
                              <p className={`text-[10px] sm:text-xs flex items-center gap-1 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                <span>🎯</span>
                                {notif.audience}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif._id);
                          }}
                          className={`p-1 rounded-lg transition flex-shrink-0 ${
                            isDarkMode 
                              ? 'text-gray-500 hover:text-red-400 hover:bg-gray-700' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                          }`}
                          title="Delete notification"
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={`px-4 py-3 text-center border-t ${
                isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
              }`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Click on notification to mark as read
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}