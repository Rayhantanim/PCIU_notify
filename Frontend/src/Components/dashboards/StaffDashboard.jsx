import React from "react";

export default function StaffDashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-6">

      {/* Admin Tasks */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition">
        <h3 className="text-lg font-semibold mb-2">📋 Administrative Tasks</h3>
        <p className="text-sm text-gray-400">
          Manage university operations and records.
        </p>
        <button className="mt-4 px-4 py-2 bg-white text-black rounded-xl text-sm">
          Open Panel
        </button>
      </div>

      {/* Notice Management */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition">
        <h3 className="text-lg font-semibold mb-2">📢 System Notices</h3>
        <p className="text-sm text-gray-400">
          Monitor and publish official notices.
        </p>
        <button className="mt-4 px-4 py-2 bg-white text-black rounded-xl text-sm">
          Manage Notices
        </button>
      </div>

      {/* User Management */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition">
        <h3 className="text-lg font-semibold mb-2">👥 User Control</h3>
        <p className="text-sm text-gray-400">
          Manage students, teachers, and accounts.
        </p>
        <button className="mt-4 px-4 py-2 bg-white text-black rounded-xl text-sm">
          Manage Users
        </button>
      </div>

    </div>
  );
}