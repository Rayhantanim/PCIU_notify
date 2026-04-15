import React from 'react'
import notice from '../assets/notice.png'
import AlertDialog from '../Components/Dialogue'

const AllNotices = () => {
  return (
    <div className='flex gap-10'>
   <div className='w-2/3 border h-96 m-4 px-4'>
            <h1 className='text-2xl my-4 font-bold'>All Notices </h1>
            <div>
               <div className='w-full h-12 flex justify-between items-center px-4 border-2 border-[#062359] my-2 mx-auto rounded-4xl'>
                  <p>“All students must submit their assignments by 5 PM today.”</p>
                  <div className=' flex justify-center items-center gap-2'>
                  <img className='w-8 h-8' src={notice} alt="" />
                   <p>Atik Sir</p>
                  </div>
               </div>
            </div>
           </div>

           
           <AlertDialog></AlertDialog>
    </div>
  )
}

export default AllNotices
