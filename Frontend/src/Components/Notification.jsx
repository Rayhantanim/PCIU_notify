import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { toast } from "react-toastify";
import axios from "axios";

export default function Notification() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [socket, setSocket] = useState(null);

  // const API = "http://localhost:5000";
  const API = "https://pciunotifybackend.onrender.com";
  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/api/notifications`);
      const unreadCount = res.data.filter(n => !n.read).length;
      setCount(unreadCount);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Fallback to static data
      setNotifications([
        {
          id: 1,
          title: "Welcome to PCIU Notice Board",
          message: "Stay updated with latest notices",
          time: new Date().toISOString(),
          read: false,
          type: "info"
        },
        {
          id: 2,
          title: "New Notice Available",
          message: "Check out the latest announcements",
          time: new Date().toISOString(),
          read: false,
          type: "notice"
        }
      ]);
      setCount(2);
    }
  };

  // Socket connection for real-time notifications
  useEffect(() => {
    const newSocket = io(API);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
    });

    newSocket.on("newNotice", (notice) => {
      // Add new notification
      const newNotification = {
        id: Date.now(),
        title: notice.title || "New Notice",
        message: notice.message || "A new notice has been posted",
        time: new Date().toISOString(),
        read: false,
        type: "notice"
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(`📢 ${newNotification.title}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    return () => newSocket.disconnect();
  }, [API]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking as read:", err);
      // Fallback: update locally
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.post(`${API}/api/notifications/mark-all-read`);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      // Fallback: update locally
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setCount(0);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API}/api/notifications/${id}`);
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      setCount(updated.filter(n => !n.read).length);
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Error deleting notification:", err);
      // Fallback: delete locally
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      setCount(updated.filter(n => !n.read).length);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    
    return date.toLocaleDateString();
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch(type) {
      case "notice":
        return "📢";
      case "alert":
        return "⚠️";
      case "success":
        return "✅";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <div 
        className="relative cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Badge 
          badgeContent={count} 
          color="error"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#f44336",
              color: "white",
              fontSize: "10px",
              height: "18px",
              minWidth: "18px",
            }
          }}
        >
          <NotificationsIcon 
            sx={{ 
              fontSize: 28, 
              color: open ? "#3578f5" : "#666",
              transition: "color 0.3s"
            }} 
          />
        </Badge>
      </div>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 className="text-white font-semibold text-lg">
              Notifications
              {count > 0 && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                  {count} unread
                </span>
              )}
            </h3>
            {count > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-white text-sm hover:text-gray-200 transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <NotificationsIcon sx={{ fontSize: 48, color: "#ccc" }} />
                <p className="mt-2">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                    !notif.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">
                            {getNotificationIcon(notif.type)}
                          </span>
                          <h4 className="font-semibold text-gray-800">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {notif.message}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          {formatTime(notif.time)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                setOpen(false);
                // Navigate to notifications page if needed
                // navigate("/notifications");
              }}
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}