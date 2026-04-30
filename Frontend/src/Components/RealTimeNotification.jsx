import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import axios from "axios";

export default function RealTimeNotification() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const API = "http://localhost:5000";

  // Fetch existing notifications from database
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log("📥 Fetching existing notifications...");
      const res = await axios.get(`${API}/api/notifications`);
      console.log("✅ Fetched notifications:", res.data);
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

  // Initialize socket
  useEffect(() => {
    if (!socketRef.current) {
      console.log("🔄 Creating socket connection...");
      
      socketRef.current = io(API, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected! ID:", socketRef.current.id);
        setIsConnected(true);
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setIsConnected(false);
      });

      socketRef.current.on("newNotice", (notice) => {
        console.log("📢 New notice received in frontend:", notice);
        
        // Add to notifications list
        const newNotification = {
          _id: notice.id,
          noticeId: notice.noticeId,
          title: notice.title,
          message: notice.message,
          createdAt: notice.time || new Date(),
          read: false,
          type: notice.type,
          createdBy: notice.createdBy,
          role: notice.role
        };
        
        setNotifications(prev => {
          // Check if already exists
          const exists = prev.some(n => n._id === newNotification._id);
          if (exists) return prev;
          return [newNotification, ...prev];
        });
        
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.info(`📢 ${notice.title}`, {
          position: "top-right",
          autoClose: 5000,
          onClick: () => setOpen(true)
        });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

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
      toast.success("All notifications marked as read");
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
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Error deleting notification:", err);
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

  return (
    <div className="relative">
      {/* Bell Icon */}
      <div
        className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition"
        onClick={() => setOpen(!open)}
      >
        <Badge badgeContent={unreadCount} color="error" overlap="circular">
          <NotificationsIcon sx={{ fontSize: 24, color: "#555" }} />
        </Badge>
      </div>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-white/80 text-xs mt-1">{unreadCount} unread</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-white text-sm hover:text-gray-200 transition"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <NotificationsIcon sx={{ fontSize: 48, color: "#ccc" }} />
                <p className="text-gray-500 mt-2">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                    !notif.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => markAsRead(notif._id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">
                            {notif.type === "staff-notice" ? "👔" : "📢"}
                          </span>
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                        <p className="text-gray-400 text-xs mt-2">
                          {formatTime(notif.createdAt)}
                        </p>
                        {notif.createdBy && (
                          <p className="text-gray-400 text-xs mt-1">
                            By: {notif.createdBy}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}