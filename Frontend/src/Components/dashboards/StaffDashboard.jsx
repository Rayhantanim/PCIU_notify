import React, { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts'


export default function StaffDashboard() {
  // const API = "http://localhost:5000";
  const API = "https://pciunotifybackend.onrender.com";

  const [stats, setStats] = useState({
    notices: 0,
    students: 0,
    teachers: 0,
    staff: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard-stats`);
        const data = await res.json();
console.log(data)
        setStats({
          notices: data.totalNotices,
          students: data.totalStudents,
          teachers: data.totalTeachers,
          staff: data.totalStaff,
        });

        setChartData(data.noticeTrend); 
      } catch (err) {
        console.log(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Notices" value={stats.notices} />
        <Card title="Students" value={stats.students} />
        <Card title="Teachers" value={stats.teachers} />
        <Card title="Staff" value={stats.staff} />
      </div>

      {/* 📊 Chart */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h2 className="text-lg font-semibold mb-4">
          Notice Activity (Last Days)
        </h2>

        
      </div>
    </div>
  );
}

/* 🔹 Reusable Card Component */
const Card = ({ title, value }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
    <h4 className="text-sm text-gray-400">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);