import React, { useEffect, useState } from "react";

const AllStudent = () => {
  const [students, setStudents] = useState([]);
  const API = "https://pciunotifybackend.onrender.com";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API}/api/users`);
        const data = await res.json();

        const onlyStudents = data.filter(
          (user) => user.role === "student"
        );

        setStudents(onlyStudents);
      } catch (err) {
        console.log(err);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="p-5 bg-white ">
      <h2 className="text-2xl font-bold mb-4">All Students</h2>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Student ID</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr key={student._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{index + 1}</td>

                <td className="p-2">
                  {student.firstName} {student.lastName}
                </td>

                <td className="p-2">{student.email}</td>
                <td className="p-2">{student.phone}</td>
                <td className="p-2">{student.department || "N/A"}</td>
                <td className="p-2">{student.studentId || "N/A"}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllStudent;