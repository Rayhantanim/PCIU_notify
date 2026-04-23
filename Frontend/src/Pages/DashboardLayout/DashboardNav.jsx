import { useState, useRef, useEffect } from "react";
import SimpleBadge from "../../Components/Notification";

const DashboardNav = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // close dropdown when clicking outside
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
    
    localStorage.removeItem("token");

   
    window.location.href = "/login";
  };

  return (
    <div className="flex justify-between mx-20">
      {/* Left */}
      <div className="flex items-center gap-10 my-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="w-80 h-12 flex items-center px-4 rounded-full bg-white">
          <img
            className="w-6 h-6 mr-2"
            src="https://img.icons8.com/ios_filled/512/search--v2.png"
            alt=""
          />
          <input
            type="text"
            placeholder="Search"
            className="outline-none w-full bg-transparent"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-10 my-4">
        <SimpleBadge />

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-full"
          >
            <img
              className="w-8 h-8"
              src="https://www.svgrepo.com/show/316857/profile-simple.svg"
              alt="profile"
            />
            <span>Profile</span>
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2">
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              >
                My Profile
              </button>

              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              >
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded"
              >
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