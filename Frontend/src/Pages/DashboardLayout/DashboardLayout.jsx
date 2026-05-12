import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import DashboardMenu from './DashboardMenu'
import DashboardNav from './DashboardNav'

const DashboardLayout = () => {

    
  return (
  <div className='min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-blue-50'>
  <DashboardMenu />
  
  {/* Main Content Area */}
  <div className='flex-1 flex flex-col min-w-0'>
    {/* Top Navigation */}
    <div className='bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10'>
      <DashboardNav />
    </div>
    
    {/* Page Content */}
    <div className='flex-1 overflow-auto'>
      <Outlet />
    </div>
  </div>
</div>
  )
}

export default DashboardLayout
