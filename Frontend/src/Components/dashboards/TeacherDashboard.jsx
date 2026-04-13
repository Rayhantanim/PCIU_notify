import React from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">

      {/* HEADER */}
      <div className="px-8 py-6 border-b border-white/10 backdrop-blur-md bg-white/5">
        <h1 className="text-2xl font-bold">👨‍🏫 Teacher Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {userId || "Teacher"}
        </p>
      </div>


  {/* ✅ Profile Button
  <button
    onClick={() => navigate("/profile")}
    className="px-4 py-2 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition"
  >
    Profile
  </button> */}


      

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* STATS SECTION */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-sm text-gray-400">Total Notices</h2>
            <p className="text-2xl font-bold mt-2">12</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-sm text-gray-400">Active Classes</h2>
            <p className="text-2xl font-bold mt-2">5</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-sm text-gray-400">Students</h2>
            <p className="text-2xl font-bold mt-2">120</p>
          </div>

        </div>

        {/* ACTION CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Upload Notice */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold mb-2">📝 Upload Notice</h3>
            <p className="text-sm text-gray-400">
              Publish notices for students and staff instantly.
            </p>
            <button className="mt-4 w-full px-4 py-2 bg-white text-black rounded-xl text-sm font-medium">
              Create Notice
            </button>
          </div>

          {/* Manage Routine */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold mb-2">📅 Manage Routine</h3>
            <p className="text-sm text-gray-400">
              Update class schedules and timing system.
            </p>
            <button className="mt-4 w-full px-4 py-2 bg-white text-black rounded-xl text-sm font-medium">
              Edit Routine
            </button>
          </div>

          {/* Students */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold mb-2">👨‍🎓 Students</h3>
            <p className="text-sm text-gray-400">
              View and manage enrolled students.
            </p>
            <button className="mt-4 w-full px-4 py-2 bg-white text-black rounded-xl text-sm font-medium">
              View Students
            </button>
          </div>

        </div>

        {/* RECENT ACTIVITY */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">📌 Recent Activity</h2>

          <ul className="space-y-3 text-sm text-gray-300">
            <li>✔ New notice published for CSE 211</li>
            <li>✔ Routine updated for Summer Semester</li>
            <li>✔ 15 students joined new batch</li>
          </ul>
        </div>

      </div>
    </div>
  );
}