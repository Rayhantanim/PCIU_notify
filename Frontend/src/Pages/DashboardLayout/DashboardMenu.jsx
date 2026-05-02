import React, { useEffect, useState } from 'react'
import logo from '../../assets/pciulogo.png'
import { Link, NavLink } from 'react-router-dom'

const DashboardMenu = () => {
  const [role, setRole] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    console.log("role", userRole);
    setRole(userRole);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='relative'>
      {/* Toggle button with hamburger menu icon */}
      <button 
        onClick={toggleSidebar}
        className={`fixed top-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-100 transition-all duration-300 ${
          isSidebarOpen ? 'left-[460px]' : 'left-4'
        }`}
      >
        {isSidebarOpen ? (
          // X icon when sidebar is open
          <svg 
            className="w-6 h-6 text-gray-700" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          // Hamburger menu icon when sidebar is closed
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            x="0px" 
            y="0px" 
            width="24" 
            height="24" 
            viewBox="0 0 50 50"
            className="text-gray-700"
          >
            <path d="M 5 8 A 2.0002 2.0002 0 1 0 5 12 L 45 12 A 2.0002 2.0002 0 1 0 45 8 L 5 8 z M 5 23 A 2.0002 2.0002 0 1 0 5 27 L 45 27 A 2.0002 2.0002 0 1 0 45 23 L 5 23 z M 5 38 A 2.0002 2.0002 0 1 0 5 42 L 45 42 A 2.0002 2.0002 0 1 0 45 38 L 5 38 z"></path>
          </svg>
        )}
      </button>

      {/* Sidebar with slide animation */}
      <div 
        className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='min-h-screen text-black'>
          <div className='w-[450px] min-h-screen bg-white shadow-2xl rounded-r-xl overflow-y-auto'>
            <div className='flex justify-start gap-10 items-center p-6'>
              <img className='w-10 h-10' src={logo} alt="" />
              <h1 className='text-xl font-bold shadow-2xl'>PCIU NOTIFY</h1>
            </div>

            {/* student */}
            {role === "student" && (
              <div>
                <NavLink to='/dashboard/overview' className={({ isActive }) => 
                  `${isActive ? 'bg-[#13068833]' : 'hover:bg-[#115FF0]'}`
                }>
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />
                    <h1 className='text-xl'>OverView</h1>
                  </div>
                </NavLink>
                <Link to="/dashboard/stuNotices">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />
                    <h1 className='text-xl'>All Notices</h1>
                  </div>
                </Link>
                <Link to="/dashboard/impnotices">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label" alt="" />
                    <h1 className='text-xl'>Important Notices</h1>
                  </div>
                </Link>
                <Link to="/dashboard/allstudent">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />
                    <h1 className='text-xl'>Students</h1>
                  </div>
                </Link>
                <Link to="/dashboard/allteacher">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
                    <h1 className='text-xl'>Teacher</h1>
                  </div>
                </Link>
                <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                  <img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="" />
                  <h1 className='text-xl'>Settings</h1>
                </div>
              </div>
            )}

            {/* teacher */}
            {role === "teacher" && (
              <div>
                <NavLink to='dashboardindex' className={({ isActive }) => 
                  `${isActive ? 'bg-[#13068833]' : 'hover:bg-[#115FF0]'}`
                }>
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />
                    <h1 className='text-xl'>Dashboard</h1>
                  </div>
                </NavLink>
                <Link to="/dashboard/allnotices">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />
                    <h1 className='text-xl'>All Notices</h1>
                  </div>
                </Link>
                <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                  <img className='w-10 h-10' src="https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label" alt="" />
                  <h1 className='text-xl'>Important Notices</h1>
                </div>
                <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                  <img className='w-10 h-10' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />
                  <h1 className='text-xl'>Department</h1>
                </div>
                <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                  <img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
                  <h1 className='text-xl'>Routine</h1>
                </div>
               <Link to="/profile">
                <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                  <img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="" />
                  <h1 className='text-xl'>Home</h1>
                </div></Link>
              </div>
            )}

            {/* staff */}
            {role === "staff" && (
              <div>
                <NavLink to='/dashboard/view' className={({ isActive }) => 
                  `${isActive ? 'bg-[#13068833]' : 'hover:bg-[#115FF0]'}`
                }>
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />
                    <h1 className='text-xl'>OverView</h1>
                  </div>
                </NavLink>
                <Link to="/dashboard/staffnotice">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />
                    <h1 className='text-xl'>All Notices</h1>
                  </div>
                </Link>
                <Link to="/dashboard/allstudent">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />
                    <h1 className='text-xl'>Students</h1>
                  </div>
                </Link>
                <Link to="/dashboard/allteacher">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
                    <h1 className='text-xl'>Teacher</h1>
                  </div>
                </Link>
                <Link to="/dashboard/allstaff">
                  <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                    <img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />
                    <h1 className='text-xl'>Staff</h1>
                  </div>
                </Link>
               <Link to="/profile">
                <div className='flex justify-start items-center gap-4 py-2 px-6 text-black border-[#3578f5] rounded m-10 shadow-2xl cursor-pointer transition-all hover:shadow-lg'>     
                  <img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="" />
                  <h1 className='text-xl'>Home</h1>
                </div></Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open (optional - for mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}

export default DashboardMenu