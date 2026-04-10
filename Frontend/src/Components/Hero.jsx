import React from 'react'
import heroimg from '../assets/hero.jpg'

export default function Hero() {
  return (
     
<div
  className="hero relative min-h-screen bg-cover bg-no-repeat bg-bottom-right"
  style={{
    backgroundImage: `url(${heroimg})`,
  }}
>
 <div className=" absolute opacity-100 bg-[#4C40BC33] min-h-screen w-full  "></div>
  <div className=" text-neutral-content h-screen text-center flex justify-center items-center backdrop-opacity-95">
    <div className="max-w-7xl">
      <h1 className="mb-5 text-5xl font-semibold text-white">Smart  <span className='text-[#182C7C]'>Notice</span> Management & <span className='text-[#182C7C]'>Routine  </span>  
System Stay Updated with All Academic Notices, Announcements and Class Schedules in One Place</h1>
      <p className="mb-5 text-[#E0D7D7] text-xl">
        The Notice Management System is a platform designed to manage and share notices efficiently 
within an institution. It allows administrators to create and control notices easily. Users can view notices based on 
 their role, department, or batch. The system improves communication by ensuring timely access to important information
      </p>
      <button className="btn bg-[#1B31A3] px-5 py-3 rounded font-bold text-white">View Notices</button>
      <button className="btn bg-transparent border-2 ml-4 px-5 py-3  border-[#1B31A3] rounded font-bold text-white">Create Notice</button>
    </div>
  </div>
</div>

  )
}
