import React from "react";
import studenticon from '../assets/student.png';
import teachericon from '../assets/teacher.png';
import stafficon from '../assets/technical-support.png';

import { useNavigate } from "react-router-dom";

export default function RoleSignup({ selectRole }) {
  const roles = [
    { name: "Student", icon: studenticon },
    { name: "Teacher", icon: teachericon },
    { name: "Staff", icon: stafficon },
  ];
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 bg-transparent">
      <h1 className="text-white text-3xl font-bold mb-6">Choose Your Role</h1>

      <div className="flex flex-col md:flex-row gap-6 text-center">
        {roles.map((r) => (
          <div
            key={r.name}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-8 py-12 w-64 cursor-pointer hover:bg-white/20 transition flex flex-col items-center"
            onClick={() => selectRole(r.name.toLowerCase())}
          >
            <img
              src={r.icon}
              alt={r.name}
              className="w-16 h-16 mb-4 object-contain brightness-0 invert opacity-90"
            />
            <h2 className="text-2xl font-bold text-white mb-2">{r.name}</h2>
          </div>
        ))}
      </div>
      <button
            onClick={() => navigate("/")}
            className="mt-4 text-gray-300 hover:text-white underline"
          >
            Back
          </button>
    </div>
  );
}