import React, { useEffect, useState } from 'react'

const AllStaff = () => {
      const [staffs, setStaffs] = useState([]);
      const API = "http://localhost:5000";
    
      useEffect(() => {
        const fetchstaffs = async () => {
          try {
            const res = await fetch(`${API}/api/users`);
            const data = await res.json();
    
            const onlystaffs = data.filter(
              (user) => user.role === "staff"
            );
    
            setStaffs(onlystaffs);
          } catch (err) {
            console.log(err);
          }
        };
    
        fetchstaffs();
      }, []);
      console.log(staffs)
  return (
      <div className="p-5 bg-white">
      <h2 className="text-2xl font-bold mb-4">All Staffs</h2>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Staff ID</th>
            </tr>
          </thead>

          <tbody>
            {staffs.map((s, index) => (
              <tr key={s._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  {s.firstName} {s.lastName}
                </td>
                <td className="p-2">{s.email}</td>
                <td className="p-2">{s.phone}</td>
                <td className="p-2">{s.staffId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AllStaff
