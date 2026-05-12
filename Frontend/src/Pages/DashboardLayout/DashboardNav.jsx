import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SimpleBadge from "../../Components/Notification";
import RealTimeNotification from "../../Components/RealTimeNotification";
import Swal from "sweetalert2";
import ProfileEditModal from "../../Components/ProfileEditModal";
// import ChangePasswordModal from "../../Components/ChangePasswordModal";

const DashboardNav = () => {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userData, setUserData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
    // Update localStorage with new data
    if (updatedUser.firstName) localStorage.setItem("firstName", updatedUser.firstName);
    if (updatedUser.lastName) localStorage.setItem("lastName", updatedUser.lastName);
    if (updatedUser.department) localStorage.setItem("department", updatedUser.department);
    if (updatedUser.section) localStorage.setItem("section", updatedUser.section);
    if (updatedUser.phone) localStorage.setItem("phone", updatedUser.phone);
    
    const fullName = `${updatedUser.firstName} ${updatedUser.lastName}`.trim();
    localStorage.setItem("fullName", fullName);
    
    // Reload user data
    loadUserData();
    
    toast.success("Profile updated successfully!");
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
    // Clear all user data from localStorage
    localStorage.clear();
    
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
    switch (userRole) {
      case "student":
        return "bg-green-100 text-green-700";
      case "teacher":
        return "bg-blue-100 text-blue-700";
      case "staff":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mx-20">
        {/* Left Section */}
        <div className="flex items-center gap-10 my-4">
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

        {/* Center - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PCIU Notify
          </h1>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-10 my-4">
          {/* Routine Button - Only for students */}
          {userRole === "student" && (
            <button
              onClick={handleRoutine}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Routine</span>
            </button>
          )}

          <RealTimeNotification />

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
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl overflow-hidden z-50 border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {getUserInitial()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{localStorage.getItem("email") || "user@example.com"}</p>
                    </div>
                  </div>
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${getRoleBadgeColor()}`}>
                    {userRole || "User"}
                  </span>
                </div>
                
                <button
                  onClick={handleMyProfile}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </button>

                <button
                  onClick={handleChangePassword}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
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