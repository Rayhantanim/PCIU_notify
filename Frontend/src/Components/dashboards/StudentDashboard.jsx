import React from "react";

export default function StudentDashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-4 bg-white/5 rounded-xl">
        📢 Student Notices
      </div>

      <div className="p-4 bg-white/5 rounded-xl">
        📅 Class Routine
      </div>
    </div>
  );
}