import React from 'react'
import notice from '../assets/notice.png'
const Notices = () => {
  return (
  <div>
    {/* search */}
      <div className='w-full flex justify-center text-[#515050] mb-10 bg-white'>
      <div className=' w-[1660px] bg-white h-16  -mt-6 z-10 flex justify-between items-center px-10 rounded-full border-2 border-[#062359]'>
        <div className='flex justify-center items-center  gap-10'>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 20.9998L15.803 15.8028M15.803 15.8028C17.2096 14.3962 17.9998 12.4885 17.9998 10.4993C17.9998 8.51011 17.2096 6.60238 15.803 5.19581C14.3965 3.78923 12.4887 2.99902 10.4995 2.99902C8.51035 2.99902 6.60262 3.78923 5.19605 5.19581C3.78947 6.60238 2.99927 8.51011 2.99927 10.4993C2.99927 12.4885 3.78947 14.3962 5.19605 15.8028C6.60262 17.2094 8.51035 17.9996 10.4995 17.9996C12.4887 17.9996 14.3965 17.2094 15.803 15.8028Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          <p>Search Notices</p>
        </div>
  <div className='flex justify-center items-center gap-10'><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 18.75C13.5913 18.75 15.1174 18.1179 16.2426 16.9926C17.3679 15.8674 18 14.3413 18 12.75V11.25M12 18.75C10.4087 18.75 8.88258 18.1179 7.75736 16.9926C6.63214 15.8674 6 14.3413 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C11.2044 15.75 10.4413 15.4339 9.87868 14.8713C9.31607 14.3087 9 13.5456 9 12.75V4.5C9 3.70435 9.31607 2.94129 9.87868 2.37868C10.4413 1.81607 11.2044 1.5 12 1.5C12.7956 1.5 13.5587 1.81607 14.1213 2.37868C14.6839 2.94129 15 3.70435 15 4.5V12.75C15 13.5456 14.6839 14.3087 14.1213 14.8713C13.5587 15.4339 12.7956 15.75 12 15.75Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

 <button className="btn border text-white bg-[#1B31A3] px-5 py-2 rounded-xl font-bold">Search</button>
</div>
      </div>
    </div>

    {/* notices */}
    <div className='w-full flex justify-center gap-6 items-center'>
        <div className='w-2/3 border h-96 px-4'>
         <h1 className='text-2xl'>Important Notices </h1>
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
        <div className=' w-1/3 border h-96 px-4'>
<h1 className='text-2xl'>Latest Notice</h1>
<div className='w-full h-12 flex justify-between items-center px-4 border-2 border-[#062359] my-2 mx-auto rounded-4xl'>
                <p className='w-10 h-10 bg-black rounded-full'></p>
               <p>“All students must submit their assignments by 5 PM today.”</p>
               
            </div>
        </div>
    </div>
  </div>
  )
}

export default Notices
