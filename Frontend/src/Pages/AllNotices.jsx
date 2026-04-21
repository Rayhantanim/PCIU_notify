import React, { useEffect, useState } from 'react'
import noticeImg from '../assets/notice.png'
import AlertDialog from '../Components/Dialogue'




const AllNotices = () => {
     const [notices, setNotices] = useState([]);
  const API = "http://localhost:5000";


  console.log(notices)
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API}/api/notices`);
        const data = await res.json();
        setNotices(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotices();
  }, []);
  return (
    <div className='flex gap-10  '>
   <div className='w-2/3 border bg-[#fde1e1] h-auto m-4 px-4'>
            <h1 className='text-2xl my-4 font-bold'>All Notices </h1>
            {notices.length === 0 ? (
        <p>No notices found</p>
      ) : (
        notices.map((notice) => (
         <div key={notice.id}>
               <div className='w-full h-12 flex justify-between items-center px-4 border-2 border-[#062359] my-2 mx-auto rounded-4xl'>
                  <p>“{notice.title}”</p>
                  <div className=' flex justify-center items-center gap-2'>
                  <img className='w-8 h-8' src={noticeImg} alt="" />
                   <p>Atik Sir</p>
                  </div>
               </div>
            </div>
        ))
      )}
           </div>

           
           <AlertDialog></AlertDialog>
    </div>
  )
}

export default AllNotices
