import React, { useEffect, useState } from "react";

const AllTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const API = "http://localhost:5000";

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API}/api/users`);
        const data = await res.json();

        const onlyTeachers = data.filter(
          (user) => user.role === "teacher"
        );

        setTeachers(onlyTeachers);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div className="p-5 bg-white">
      <h2 className="text-2xl font-bold mb-4">All Teachers</h2>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Teacher ID</th>
              <th>Short Name</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map((t, index) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  {t.firstName} {t.lastName}
                </td>
                <td className="p-2">{t.email}</td>
                <td className="p-2">{t.phone}</td>
                <td className="p-2">{t.department}</td>
                <td className="p-2">{t.teacherId}</td>
                <td className="p-2">{t.shortName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllTeacher;