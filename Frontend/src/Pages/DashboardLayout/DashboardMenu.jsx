import React, { useEffect, useState } from 'react'
import logo from '../../assets/pciulogo.png'
import { Link, NavLink } from 'react-router-dom'
import TeacherDashboard from '../../Components/dashboards/TeacherDashboard'
const DashboardMenu = () => {
  
  return (
    
    <div className='min-h-screen '>
       <div className='w-[450px] min-h-screen bg-[#115FF0] rounded-xl '>
           <div className='flex justify-start gap-10 items-center p-6'>
           <img className='w-10 h-10' src={logo} alt="" />
           <h1 className='text-xl text-white font-bold shadow-2xl'>PCIU NOTIFY  
 </h1>
           </div>
           
              
{/* student */}
<div>
                 <NavLink to='/dashboard/overview' className={({ isActive }) => 
    `${isActive ? 'bg-[#13068833]' : 'hover:bg-[#115FF0]'}`
  }> <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />

<h1 className='text-xl'>OverView</h1>

      </div>
  </NavLink>
            <Link to="/dashboard/stuNotices">
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />

<h1 className='text-xl'>All Notices</h1>

      </div></Link>
             <Link to="/dashboard/impnotices">
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label" alt="" />

<h1 className='text-xl'>Important Notices</h1>

      </div></Link>
             <Link to="/dashboard/allstudent">
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />

<h1 className='text-xl'>Students</h1>

      </div></Link>
            <Link to="/dashboard/allteacher">
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />

<h1 className='text-xl'>Teacher</h1>

      </div></Link>
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="" />

<h1 className='text-xl'>Settings</h1>

      </div>
               </div>
            

                

{/* teacher */}
         
               {/* <div>
                 <NavLink to='dashboardindex' className={({ isActive }) => 
    `${isActive ? 'bg-[#13068833]' : 'hover:bg-[#115FF0]'}`
  }> <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://www.svgrepo.com/show/459022/dashboard.svg" alt="" />

<h1 className='text-xl'>Dashboard</h1>

      </div>
  </NavLink>
            <Link to="/dashboard/allnotices">
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://www.pngmart.com/files/8/Notice-PNG-Picture.png" alt="" />

<h1 className='text-xl'>All Notices</h1>

      </div></Link>
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://cdn-icons-png.freepik.com/256/18610/18610294.png?semt=ais_white_label" alt="" />

<h1 className='text-xl'>Important Notices</h1>

      </div>
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://icons.veryicon.com/png/o/internet--web/billion-square-cloud/department-1.png" alt="" />

<h1 className='text-xl'>Department</h1>

      </div>
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/1373/1373779.png" alt="" />

<h1 className='text-xl'>Routine</h1>

      </div>
             <div className='flex justify-start items-center gap-4 py-2 px-6 text-white  border-[#3578f5] rounded m-10 shadow-2xl'>     
<img className='w-10 h-10' src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="" />

<h1 className='text-xl'>Settings</h1>

      </div>
               </div> */}
      </div>
    



    </div>
  )
}

export default DashboardMenu
