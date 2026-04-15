import React from 'react'
import { Outlet } from 'react-router-dom'
import logo from '../../assets/pciulogo.png'
import DashboardMenu from './DashboardMenu'

const DashboardLayout = () => {
  return (
    <div className='w-full min-h-screen bg-[#d1cccc] flex'>
     <DashboardMenu></DashboardMenu>
      <div className='w-full '>
        
      <Outlet>


      </Outlet>
      </div>
    </div>
  )
}

export default DashboardLayout
