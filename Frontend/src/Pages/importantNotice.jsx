import React, { useEffect, useState } from "react";
import { MdNotificationImportant } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";

const ImportantNotice = () => {
  const { isDarkMode } = useTheme();
  const [notices, setNotices] = useState([]);
  const API = "https://pciunotifybackend.onrender.com";

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API}/api/notices`);
        const data = await res.json();

        // 🔥 only urgent notices
        const urgentNotices = data.filter(
          (notice) => notice.priority === "urgent"
        );

        setNotices(urgentNotices);
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
                ⚠️ Please check these notices carefully
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
            {notices.map((notice, index) => (
              <div
                key={notice._id}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
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

                  {/* Description */}
                  <div className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div dangerouslySetInnerHTML={{ 
                      __html: notice.description || 'No description provided' 
                    }} />
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

                    {/* Audience Badges */}
                    {notice.audience && notice.audience.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {notice.audience.map((aud) => (
                          <span
                            key={aud}
                            className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode 
                                ? 'bg-purple-900/30 text-purple-400 border border-purple-800'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            👥 {aud}
                          </span>
                        ))}
                      </div>
                    )}
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
            <p>❗ Urgent notices require immediate attention. Please review them carefully and take necessary action.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportantNotice;