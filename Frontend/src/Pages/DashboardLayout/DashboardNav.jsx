import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SimpleBadge from "../../Components/Notification";
import RealTimeNotification from "../../Components/RealTimeNotification";
import Swal from "sweetalert2";
import ProfileEditModal from "../../Components/ProfileEditModal";
import { useTheme } from "../../context/ThemeContext";
// import ChangePasswordModal from "../../Components/ChangePasswordModal";

const DashboardNav = () => {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userData, setUserData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Get user info from localStorage
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const fullName = localStorage.getItem("fullName");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");
    const department = localStorage.getItem("department");
    const section = localStorage.getItem("section");
    const studentId = localStorage.getItem("studentId");
    const teacherId = localStorage.getItem("teacherId");
    const staffId = localStorage.getItem("staffId");
    
    // Set user data for profile
    setUserData({
      _id: userId,
      firstName: firstName || "",
      lastName: lastName || "",
      fullName: fullName || `${firstName} ${lastName}`,
      email: email || "",
      role: role || "",
      department: department || "",
      section: section || "",
      studentId: studentId || "",
      teacherId: teacherId || "",
      staffId: staffId || "",
    });
    
    if (fullName) {
      setUserName(fullName);
    } else if (firstName && lastName) {
      setUserName(`${firstName} ${lastName}`);
    } else if (firstName) {
      setUserName(firstName);
    } else {
      setUserName("User");
    }

    // Set user role
    if (role) {
      setUserRole(role.toLowerCase());
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    if (updatedUser.firstName) localStorage.setItem("firstName", updatedUser.firstName);
    if (updatedUser.lastName) localStorage.setItem("lastName", updatedUser.lastName);
    if (updatedUser.department) localStorage.setItem("department", updatedUser.department);
    if (updatedUser.section) localStorage.setItem("section", updatedUser.section);
    if (updatedUser.phone) localStorage.setItem("phone", updatedUser.phone);
    
    const fullName = `${updatedUser.firstName} ${updatedUser.lastName}`.trim();
    localStorage.setItem("fullName", fullName);
    
    loadUserData();
    toast.success("Profile updated successfully!", {
      theme: isDarkMode ? "dark" : "light",
    });
  };

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
    localStorage.clear();
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Logout Successfully",
      showConfirmButton: false,
      timer: 1500,
      background: isDarkMode ? "#1f2937" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
    });
    navigate("/login");
  };

  const handleMyProfile = () => {
    setOpen(false);
    setShowProfileModal(true);
  };

  const handleChangePassword = () => {
    setOpen(false);
    setShowPasswordModal(true);
  };

  const handleSettings = () => {
    setOpen(false);
    navigate("/dashboard/settings");
  };

  const handleRoutine = () => {
    navigate("/dashboard/routine");
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (userName && userName !== "User") {
      return userName.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    if (isDarkMode) {
      switch (userRole) {
        case "student":
          return "bg-blue-900/50 text-blue-300 ring-1 ring-blue-700";
        case "teacher":
          return "bg-cyan-900/50 text-cyan-300 ring-1 ring-cyan-700";
        case "staff":
          return "bg-sky-900/50 text-sky-300 ring-1 ring-sky-700";
        default:
          return "bg-gray-700 text-gray-300 ring-1 ring-gray-600";
      }
    } else {
      switch (userRole) {
        case "student":
          return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
        case "teacher":
          return "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200";
        case "staff":
          return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
        default:
          return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
      }
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
          } shadow-md`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className={`${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
      } border-b sticky top-0 z-40 transition-colors duration-200`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            
            {/* Left Section - Logo for mobile */}
            <div className="flex items-center gap-3">
              {/* Mobile Logo */}
              <div className="lg:hidden">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  PCIU Notify
                </h1>
              </div>
            </div>

            {/* Center - Logo (Desktop only) */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                PCIU Notify
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Routine Button - Only for students */}
              {userRole === "student" && (
                <button
                  onClick={handleRoutine}
                  className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                    isDarkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-500'
                      : 'bg-blue-500 text-white hover:bg-blue-600 border border-blue-400'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium">Routine</span>
                </button>
              )}

              <RealTimeNotification />

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setOpen(!open)}
                  className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  } border shadow-sm hover:shadow-md`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {getUserInitial()}
                  </div>
                  <span className={`hidden sm:inline font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {userName.length > 20 ? userName.substring(0, 20) + '...' : userName}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${open ? "rotate-180" : ""} ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Dropdown Menu */}
                {open && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
                  }`}>
                    <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {getUserInitial()}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {userName}
                          </p>
                          <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {localStorage.getItem("email") || "user@example.com"}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${getRoleBadgeColor()}`}>
                        {userRole || "User"}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleMyProfile}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Edit Profile
                    </button>

                    <button
                      onClick={handleChangePassword}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Change Password
                    </button>

                    <button
                      onClick={handleSettings}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>

                    <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>
                    
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
                          : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                      }`}
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
        </div>
      </div>

      {/* Mobile Routine Button - Bottom Floating */}
      {userRole === "student" && (
        <button
          onClick={handleRoutine}
          className="sm:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Routine</span>
        </button>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <ProfileEditModal
          isOpen={showProfileModal}
          user={userData}
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {/* Change Password Modal */}
      {/* <ChangePasswordModal
        isOpen={showPasswordModal}
        userId={userData?._id}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          // Optional: Force logout after password change
          // handleLogout();
        }}
      /> */}
    </>
  );
};

export default DashboardNav;