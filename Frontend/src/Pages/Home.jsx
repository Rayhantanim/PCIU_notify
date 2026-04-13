import React from "react";

export default function HomePage() {
  const notices = [
    "Midterm Exam Routine Published",
    "Assignment Submission Deadline: Friday",
    "Class Cancelled for CSE 211 Tomorrow",
    "New Notice Board System Updated",
  ];

  const routine = [
    { day: "Sunday", course: "CSE 211", time: "10:00 - 11:30" },
    { day: "Sunday", course: "CSE 213", time: "12:00 - 01:30" },
    { day: "Monday", course: "CSE 215", time: "09:00 - 10:30" },
    { day: "Tuesday", course: "CSE 221", time: "11:00 - 12:30" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10 backdrop-blur-lg bg-white/5">
        <h1 className="text-xl font-bold tracking-wide">
          PCIU Notify
        </h1>

        <div className="flex gap-6 text-sm text-gray-300">
          <a href="#" className="hover:text-white">Home</a>
          <a href="#" className="hover:text-white">Notices</a>
          <a href="#" className="hover:text-white">Routine</a>
          <a href="#" className="hover:text-white">Profile</a>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-8">

        {/* NOTICE SECTION */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">
            📢 Latest Notices
          </h2>

          <ul className="space-y-3">
            {notices.map((item, index) => (
              <li
                key={index}
                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ROUTINE SECTION */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">
            📅 Class Routine
          </h2>

          <div className="space-y-3">
            {routine.map((cls, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
              >
                <div>
                  <p className="font-medium">{cls.course}</p>
                  <p className="text-sm text-gray-400">{cls.day}</p>
                </div>
                <span className="text-sm text-gray-300">
                  {cls.time}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 text-sm py-6 border-t border-white/10">
        © {new Date().getFullYear()} PCIU Notify | All Rights Reserved
      </footer>
    </div>
  );
}