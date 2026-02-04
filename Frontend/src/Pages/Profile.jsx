import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-300 flex justify-center items-center px-4">

      {/* Profile Card */}
      <div className=" bg-white w-full max-w-3xl rounded-2xl shadow-md overflow-hidden">

        {/* Header */}
        <div className="bg-[#263640] text-white p-6 flex items-center gap-4">

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-white text-[#263640]
                          flex items-center justify-center text-2xl font-bold">
            {user.firstName?.[0]}
          </div>

          {/* Name */}
          <div>
            <h2 className="text-2xl font-semibold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-300">
              {user.email}
            </p>
          </div>

        </div>

        {/* Info Section */}
        <div className="p-6">

          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Info label="Student ID" value={user.id} />
            <Info label="Department" value={user.department} />
            <Info label="Section" value={user.section} />
            <Info label="Phone" value={user.phone} />
            <Info label="Gender" value={user.gender} />
            <Info label="Date of Birth" value={user.dob} />

          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">

            <button
              className="px-5 py-2 rounded-lg border border-gray-300
                         hover:bg-gray-100 transition"
            >
              Edit Profile
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="px-5 py-2 rounded-lg bg-red-500 text-white
                         hover:bg-red-600 transition"
            >
              Logout
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

/* Reusable Info Row */
const Info = ({ label, value }) => {
  return (
    <div className="flex flex-col border rounded-lg p-3 bg-gray-50">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="font-medium text-gray-800 mt-1">
        {value || "N/A"}
      </span>

    </div>
  );
};

export default Profile;
