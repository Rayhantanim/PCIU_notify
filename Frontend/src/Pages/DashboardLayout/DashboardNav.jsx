import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SimpleBadge from "../../Components/Notification";
import RealTimeNotification from "../../Components/RealTimeNotification";
import Swal from "sweetalert2";

const DashboardNav = () => {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const fullName = localStorage.getItem("fullName");
    
    if (fullName) {
      setUserName(fullName);
    } else if (firstName && lastName) {
      setUserName(`${firstName} ${lastName}`);
    } else if (firstName) {
      setUserName(firstName);
    } else {
      setUserName("User");
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    
    // Show success message
Swal.fire({
  position: "top-end",
  icon: "success",
  title: "Logout Successfully",
  showConfirmButton: false,
  timer: 1500
});
    
    // Navigate to login page
    navigate("/login");
  };

  const handleMyProfile = () => {
    setOpen(false);
    navigate("/dashboard/profile");
  };

  const handleSettings = () => {
    setOpen(false);
    navigate("/dashboard/settings");
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (userName && userName !== "User") {
      return userName.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="flex justify-between mx-20">
      {/* Left */}
      <div className="flex items-center gap-10 my-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="w-80 h-12 flex items-center px-4 rounded-full bg-white shadow-sm">
          <img
            className="w-5 h-5 mr-2 opacity-60"
            src="https://img.icons8.com/ios_filled/512/search--v2.png"
            alt="search"
          />
          <input
            type="text"
            placeholder="Search..."
            className="outline-none w-full bg-transparent"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-10 my-4">
        <RealTimeNotification></RealTimeNotification>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 cursor-pointer bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {getUserInitial()}
            </div>
            <span className="font-medium text-gray-700">{userName}</span>
            <svg
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown Menu */}
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-xl overflow-hidden z-50 border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{localStorage.getItem("email") || "user@example.com"}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  Role: {localStorage.getItem("role") || "User"}
                </p>
              </div>
              
              <button
                onClick={handleMyProfile}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>

              <button
                onClick={handleSettings}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <div className="border-t border-gray-100"></div>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardNav;