import React from 'react'

const DashboardNav = () => {
  return (
    <div className='flex justify-start mx-20 gap-20'>
      <div className='flex items-center gap-20 my-4'>
         <h1 className='text-2xl font-semibold'>Dashboard</h1>
         <div className='w-80 h-12 flex justify-between items-center px-4 rounded-full bg-white'>
             <img className='w-8 h-8' src="https://img.icons8.com/ios_filled/512/search--v2.png" alt="" />
             <h1>Search</h1>
         </div>
      </div>
      <div className='flex items-center gap-20 my-4'>
       <div className='w-32 h-12 flex justify-between items-center px-2 bg-white rounded-full'>
        <img className='w-10 h-10' src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/android/dark-mode-fill-z15s5u8l57hghyqfhkypgn.png/dark-mode-fill-wpqutnep6d8mf8voz0tn9.png?_a=DATAiZAAZAA0" alt="" />
        <img className='w-10 h-10' src="https://www.svgrepo.com/show/432507/light-mode.svg" alt="" />
       </div>
       <div className='w-60 h-12 bg-white rounded-full'>
           <img className='w-20 h-10 px-2' src="https://www.svgrepo.com/show/316857/profile-simple.svg" alt="" />
       </div>
      </div>
    </div>
  )
}

export default DashboardNav
