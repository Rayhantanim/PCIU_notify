import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Hero from "../Components/Hero";
import NoticeTabs from "../Components/NoticeCategory";
import Notices from "../Components/Notices";

export default function Profile() {
  const API = "http://localhost:5000";
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  // GET USER DATA
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/user/${userId}`);
        setUser(res.data);
        setForm(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // UPDATE USER
  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${API}/api/user/${userId}`, form);
      setUser(res.data);
      setEditMode(false);
      alert("Profile updated");
    } catch (err) {
      alert("Update failed");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="text-white p-10">Loading profile...</div>
    );
  }

  return (
    <div className=" relative min-h-screen bg-transparent flex flex-col justify-center items-center">
      {/* hero section */}
      <div className="w-full h-full"><Hero></Hero></div>

      {/* notices */}
         <div>
          <Notices></Notices>
         </div>
      {/* Notice category */}
     <div className="flex justify-center items-center my-6">
       <NoticeTabs></NoticeTabs>
     </div>
      {/* Profile Card */}
      <div className=" bg-white w-full max-w-3xl rounded-2xl shadow-md overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">👤 My Profile</h2>

          <div className="flex gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-white text-black rounded-xl text-sm"
            >
              {editMode ? "Cancel" : "Edit"}
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* PROFILE FIELDS */}
        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm text-gray-400">Name</label>
            {editMode ? (
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="w-full p-2 bg-black/40 border border-white/10 rounded-lg"
              />
            ) : (
              <p>{user.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <p>{user.email}</p>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm text-gray-400">Role</label>
            <p className="capitalize">{user.role}</p>
          </div>

          {/* ID */}
          <div>
            <label className="text-sm text-gray-400">User ID</label>
            <p>{user.userId}</p>
          </div>

        </div>

        {/* SAVE BUTTON */}
        {editMode && (
          <button
            onClick={handleUpdate}
            className="mt-6 w-full bg-white text-black py-2 rounded-xl"
          >
            Save Changes
          </button>
        )}

      </div>

      
    </div>
  );
}