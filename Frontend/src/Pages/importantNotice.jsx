import React, { useEffect, useState } from "react";
import { MdNotificationImportant } from "react-icons/md";


const ImportantNotice = () => {
  const [notices, setNotices] = useState([]);
  const API = "https://pciunotifybackend.onrender.com";

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API}/api/notices`);
        const data = await res.json();

        // 🔥 only urgent notices
        const urgentNotices = data.filter(
          (notice) => notice.priority === "urgent"
        );

        setNotices(urgentNotices);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl w-2/4 mx-auto font-bold mb-4 text-red-600 flex items-center gap-2">
        <span className=" text-3xl"><MdNotificationImportant/></span> Important Notices
      </h2>

      {notices.length === 0 ? (
        <p className="text-gray-500">No urgent notices found</p>
      ) : (
        <div className="space-y-4 w-2/4 mx-auto">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="border-l-4 border-red-500 bg-white shadow p-4 rounded"
            >
              <h3 className="text-lg font-semibold">
                {notice.title}
              </h3>

              <p className="text-gray-700 mt-1">
                {notice.description}
              </p>
   <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 mt-2">
                Category: {notice.category} | Department: {notice.department}
              </div>

              <div className="text-xs text-red-600 mt-1 font-semibold">
                Priority: {notice.priority.toUpperCase()}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportantNotice;