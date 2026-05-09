import React, { useEffect, useState, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../../assets/pciulogo.png'

const DashboardMenu = () => {
  const [role, setRole] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    console.log("role", userRole);
    setRole(userRole);
  }, []);

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest('button')) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Common class for menu items
  const menuItemClass = "flex justify-start items-center gap-4 py-3 px-6 rounded-xl m-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-md";
  
  // Active class for NavLink
  const activeClass = "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg";
  const inactiveClass = "text-gray-700 hover:text-blue-600";

  // // Define menu items based on role
  // const getMenuItems = () => {
  //   const menuItems = {
  //     student: [
  //       { path: '/dashboard/overview', label: 'Overview', icon: 'https://www.svgrepo.com/show/459022/dashboard.svg' },
  //       { path: '/dashboard/allnotices', label: 'All Notices', icon: 'https://www.pngmart.com/files/8/Notice-PNG-Picture.png' },
  //       { path: '/dashboard/impnotices', label: 'Important Notices', icon: 'https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label' },
  //       // { path: '/dashboard/allstudent', label: 'Students', icon: 'https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png' },
  //       // { path: '/dashboard/allteacher', label: 'Teacher', icon: 'https://cdn-icons-png.flaticon.com/512/1373/1373779.png' },
  //       { path: '/dashboard/settings', label: 'Settings', icon: 'https://cdn-icons-png.flaticon.com/512/3524/3524659.png' }
  //     ],
  //     teacher: [
  //       { path: '/dashboard/dashboardindex', label: 'Dashboard', icon: 'https://www.svgrepo.com/show/459022/dashboard.svg' },
  //       { path: '/dashboard/allnotices', label: 'All Notices', icon: 'https://www.pngmart.com/files/8/Notice-PNG-Picture.png' },
  //       { path: '/dashboard/impnotices', label: 'Important Notices', icon: 'https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label' },
  //       { path: '/dashboard/department', label: 'Department', icon: 'https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png' },
  //       { path: '/dashboard/routine', label: 'Routine', icon: 'https://cdn-icons-png.flaticon.com/512/1373/1373779.png' },
  //       { path: '/profile', label: 'Home', icon: 'https://cdn-icons-png.flaticon.com/512/3524/3524659.png' }
  //     ],
  //     staff: [
  //       { path: '/dashboard/view', label: 'Overview', icon: 'https://www.svgrepo.com/show/459022/dashboard.svg' },
  //       { path: '/dashboard/staffnotice', label: 'All Notices', icon: 'https://www.pngmart.com/files/8/Notice-PNG-Picture.png' },
  //       { path: '/dashboard/allstudent', label: 'Students', icon: 'https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png' },
  //       { path: '/dashboard/allteacher', label: 'Teacher', icon: 'https://cdn-icons-png.flaticon.com/512/1373/1373779.png' },
  //       { path: '/dashboard/allstaff', label: 'Staff', icon: 'https://cdn-icons-png.flaticon.com/512/1373/1373779.png' }
  //     ]
  //   };
  // Render menu items based on role
  const renderMenuItems = () => {
    // Admin Menu
    if (role === "admin") {
      return (
        <div className="space-y-1">
          <NavLink 
            to='/dashboard/adminoverview' 
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />
              <h1 className='text-base font-medium'>Overview</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/usermanagement"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />
              <h1 className='text-base font-medium'>User Management</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/noticemanagement"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label" alt="" />
              <h1 className='text-base font-medium'>Notice Management</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/departmentmanagement"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />
              <h1 className='text-base font-medium'>Department Management</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/allteacher"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
              <h1 className='text-base font-medium'>Teacher</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/settings"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="" />
              <h1 className='text-base font-medium'>Settings</h1>
            </div>
          </NavLink>
        </div>
      );
    }
    if (role === "student") {
      return (
        <div className="space-y-1">
          <NavLink 
            to='/dashboard/overview' 
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />
              <h1 className='text-base font-medium'>Overview</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/allnotices"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />
              <h1 className='text-base font-medium'>All Notices</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/impnotices"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label" alt="" />
              <h1 className='text-base font-medium'>Important Notices</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/allstudent"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />
              <h1 className='text-base font-medium'>Students</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/allteacher"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
              <h1 className='text-base font-medium'>Teacher</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/settings"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="" />
              <h1 className='text-base font-medium'>Settings</h1>
            </div>
          </NavLink>
        </div>
      );
    }

    // Teacher Menu
    if (role === "teacher") {
      return (
        <div className="space-y-1">
          <NavLink 
            to='/dashboard/dashboardindex' 
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />
              <h1 className='text-base font-medium'>Dashboard</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/allnotices"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />
              <h1 className='text-base font-medium'>All Notices</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/impnotices"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label" alt="" />
              <h1 className='text-base font-medium'>Important Notices</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/department"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />
              <h1 className='text-base font-medium'>Department</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/routine"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
              <h1 className='text-base font-medium'>Routine</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/profile"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="" />
              <h1 className='text-base font-medium'>Home</h1>
            </div>
          </NavLink>
        </div>
      );
    }

    // Staff Menu
    if (role === "staff") {
      return (
        <div className="space-y-1">
          <NavLink 
            to='/dashboard/view' 
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />
              <h1 className='text-base font-medium'>Overview</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/staffnotice"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />
              <h1 className='text-base font-medium'>All Notices</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/allstudent"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />
              <h1 className='text-base font-medium'>Students</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/allteacher"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
              <h1 className='text-base font-medium'>Teacher</h1>
            </div>
          </NavLink>

          <NavLink 
            to="/dashboard/allstaff"
            className={({ isActive }) => 
              `${menuItemClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <div className='flex justify-start items-center gap-4 w-full'>     
              <img className='w-6 h-6' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
              <h1 className='text-base font-medium'>Staff</h1>
            </div>
          </NavLink>
        </div>
      );
    }

    // Default loading state or no role
    return (
      <div className='text-center text-gray-500 mt-10'>
        Loading menu...
      </div>
    );
  };

  return (
    <div className='relative'>
      {/* Toggle button */}
      <button 
        onClick={toggleSidebar}
        className={`fixed top-20 z-50 p-2.5 rounded-xl bg-white shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl ${
          isSidebarOpen ? 'left-[320px]' : 'left-4'
        }`}
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {isSidebarOpen ? (
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" className="text-gray-700">
            <path d="M 5 8 A 2.0002 2.0002 0 1 0 5 12 L 45 12 A 2.0002 2.0002 0 1 0 45 8 L 5 8 z M 5 23 A 2.0002 2.0002 0 1 0 5 27 L 45 27 A 2.0002 2.0002 0 1 0 45 23 L 5 23 z M 5 38 A 2.0002 2.0002 0 1 0 5 42 L 45 42 A 2.0002 2.0002 0 1 0 45 38 L 5 38 z"></path>
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='h-full text-black'>
          <div className='w-[280px] md:w-[300px] h-full bg-gradient-to-b from-white to-gray-50 shadow-2xl rounded-r-2xl flex flex-col'>
            {/* Header */}
            <div className='flex justify-start gap-3 items-center p-6 border-b border-gray-200'>
              <img className='w-10 h-10 object-contain' src={logo} alt="PCIU Logo" />
              <h1 className='text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
                PCIU NOTIFY
              </h1>
            </div>

            {/* Menu Items - Scrollable */}
            <div className='flex-1 overflow-y-auto custom-scrollbar py-4'>
              {renderMenuItems()}
            </div>

            {/* Footer */}
            <div className='p-4 border-t border-gray-200'>
              <div className='text-xs text-gray-500 text-center'>
                © 2026 PCIU NOTIFY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}

// Add custom scrollbar styles
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  if (!document.getElementById('sidebar-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'sidebar-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

export default DashboardMenu;