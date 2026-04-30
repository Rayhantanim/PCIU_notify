import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Hero from "../Components/Hero";
import NoticeTabs from "../Components/NoticeCategory";
import Notices from "../Components/Notices";
import { toast } from "react-toastify";

export default function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");

    if (!userId) {
      navigate("/login");
      toast.error("Please login to continue");
      return;
    }

    setUserName(`${firstName || ""} ${lastName || ""}`.trim() || "User");
    setUserRole(role || "student");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2232/2232688.png" 
                alt="Logo" 
                className="w-10 h-10"
              />
              <span className="text-white font-bold text-xl">PCIU Notice Board</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-white hidden md:block">
                Welcome, {userName} ({userRole})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full">
        <Hero />
      </div>

      {/* Dashboard Quick Links */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          
          {/* Routine Link */}
          <Link to="/dashboard/routine">
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl cursor-pointer transition-all hover:scale-105 hover:bg-white/20">
              <img 
                className="w-16 h-16" 
                src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" 
                alt="Routine" 
              />
              <h1 className="text-white text-lg font-semibold">Routine</h1>
            </div>
          </Link>

          {/* Profile Link */}
          <Link to="/dashboard/profile">
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl cursor-pointer transition-all hover:scale-105 hover:bg-white/20">
              <img 
                className="w-16 h-16" 
                src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" 
                alt="Profile" 
              />
              <h1 className="text-white text-lg font-semibold">Profile</h1>
            </div>
          </Link>

          {/* Notices Link */}
          <Link to="/dashboard/notices">
            <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl cursor-pointer transition-all hover:scale-105 hover:bg-white/20">
              <img 
                className="w-16 h-16" 
                src="https://cdn-icons-png.flaticon.com/512/6195/6195792.png" 
                alt="Notices" 
              />
              <h1 className="text-white text-lg font-semibold">All Notices</h1>
            </div>
          </Link>

          {/* Role-specific Dashboard Link */}
          {userRole === "student" && (
            <Link to="/dashboard/overview">
              <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl cursor-pointer transition-all hover:scale-105 hover:bg-white/20">
                <img 
                  className="w-16 h-16" 
                  src="https://cdn-icons-png.flaticon.com/512/1828/1828970.png" 
                  alt="Dashboard" 
                />
                <h1 className="text-white text-lg font-semibold">Student Dashboard</h1>
              </div>
            </Link>
          )}

          {userRole === "teacher" && (
            <Link to="/dashboard/dashboardindex">
              <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl cursor-pointer transition-all hover:scale-105 hover:bg-white/20">
                <img 
                  className="w-16 h-16" 
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                  alt="Dashboard" 
                />
                <h1 className="text-white text-lg font-semibold">Teacher Dashboard</h1>
              </div>
            </Link>
          )}

          {userRole === "staff" && (
            <Link to="/dashboard/view">
              <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl cursor-pointer transition-all hover:scale-105 hover:bg-white/20">
                <img 
                  className="w-16 h-16" 
                  src="https://cdn-icons-png.flaticon.com/512/846/846793.png" 
                  alt="Dashboard" 
                />
                <h1 className="text-white text-lg font-semibold">Staff Dashboard</h1>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Notice Categories */}
      <div className="container mx-auto px-4 py-8">
        <NoticeTabs />
      </div>

      {/* Latest Notices */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Latest Notices
          </h2>
          <Notices />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 PCIU Notice Board. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}