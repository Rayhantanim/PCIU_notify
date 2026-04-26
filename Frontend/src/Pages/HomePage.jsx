import React from "react";
// import StudentDashboard from "../Components/dashboards/StudentDashboard";
import TeacherDashboard from "../Components/dashboards/TeacherDashboard";
import StaffDashboard from "../Components/dashboards/StaffDashboard";

export default function HomePage() {
  const role = localStorage.getItem("role");

  const renderDashboard = () => {
    switch (role) {
      case "student":
        return 
        // <StudentDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "staff":
        return <StaffDashboard />;
      default:
        return <div>Invalid Role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* NAV */}
      <nav className="flex justify-between px-6 py-4 border-b border-white/10">
        <h1 className="font-bold">PCIU Notify</h1>
        <p className="text-sm text-gray-400 capitalize">
          {role} Panel
        </p>
      </nav>

      {/* CONTENT */}
      <div className="p-6">
        {renderDashboard()}
      </div>
    </div>
  );
}