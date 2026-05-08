import React, { useEffect, useState } from 'react'

const AllStaff = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  // const API = "https://pciunotifybackend.onrender.com";
    const API = "https://pciunotifybackend.onrender.com";

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await fetch(`${API}/api/staffs`);
        const data = await res.json();
        setStaffs(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  if (loading) {
    return (
      <div className="p-5 bg-white flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Staff</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Total: {staffs.length}
        </span>
      </div>

      {staffs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No staff members found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 text-sm font-semibold text-gray-600">#</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Phone</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Staff ID</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((staff, index) => (
                <tr key={staff._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="p-3 text-sm font-medium text-gray-800">
                    {staff.firstName} {staff.lastName}
                  </td>
                  <td className="p-3 text-sm text-gray-600">{staff.email}</td>
                  <td className="p-3 text-sm text-gray-600">{staff.phone || "N/A"}</td>
                  <td className="p-3 text-sm text-gray-600 font-mono">{staff.staffId || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AllStaff