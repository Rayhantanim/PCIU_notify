import React, { useEffect, useState } from "react";
import noticeImg from "../assets/notice.png";
import AlertDialog from "../Components/Dialogue";

const AllNotices = () => {
  const [notices, setNotices] = useState([]);
  const API = "http://localhost:5000";

  console.log("front",notices)

  useEffect(() => {
  const fetchNotices = async () => {
    const res = await fetch("http://localhost:5000/api/notices");
    const data = await res.json();
    setNotices(data);
  };
  fetchNotices();
}, []);


  // useEffect(() => {
  //   const fetchNotices = async () => {
  //     try {
  //       const res = await fetch(`${API}/api/notices`);
  //       const data = await res.json();

  //       setNotices(Array.isArray(data) ? data : []);
  //     } catch (err) {
  //       console.log("Fetch error:", err);
  //       setNotices([]);
  //     }
  //   };

  //   fetchNotices();
  // }, []);

  return (
    <div className="flex gap-10">
      {/* Notices List */}
      <div className="w-2/3 border bg-[#fde1e1] h-auto m-4 px-4">
        <h1 className="text-2xl my-4 font-bold">All Notices</h1>

        {notices.length === 0 ? (
          <p>No notices found</p>
        ) : (
          notices.map((notice) => (
            <div key={notice._id}>
              <div className="w-full h-12 flex justify-between items-center px-4 border-2 border-[#062359] my-2 mx-auto rounded-4xl">
                
                {/* Title */}
                <p>“{notice.title}”</p>

                {/* Creator Info */}
                <div className="flex justify-center items-center gap-2">
                  <img className="w-8 h-8" src={noticeImg} alt="" />
<p>
  {notice.createdBy
    ? `${notice.createdBy}`
    : "Unknown"}
</p>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog />
    </div>
  );
};

export default AllNotices;