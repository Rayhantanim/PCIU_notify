import React from 'react'
import { Outlet } from 'react-router-dom'

import DashboardMenu from './DashboardMenu'
import DashboardNav from './DashboardNav'

const DashboardLayout = () => {
  return (
    <div className=' min-h-screen bg-[#d1cccc] flex'>
     <DashboardMenu></DashboardMenu>
      <div className='w-full border '>
        <DashboardNav></DashboardNav>
      <div>
        <Outlet>


      </Outlet>
      </div>
      </div>
    </div>
  )
}

export default DashboardLayout
