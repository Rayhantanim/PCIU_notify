import React, { useEffect, useState } from "react";

const AllStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  // const API = "http://localhost:5000";
    const API = "http://localhost:5000";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API}/api/students`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
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
        <h2 className="text-2xl font-bold text-gray-800">All Students</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Total: {students.length}
        </span>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No students found
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
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Department</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Section</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-600">Student ID</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="p-3 text-sm font-medium text-gray-800">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="p-3 text-sm text-gray-600">{student.email}</td>
                  <td className="p-3 text-sm text-gray-600">{student.phone || "N/A"}</td>
                  <td className="p-3 text-sm text-gray-600">{student.department || "N/A"}</td>
                  <td className="p-3 text-sm text-gray-600">{student.section || "N/A"}</td>
                  <td className="p-3 text-sm text-gray-600 font-mono">{student.studentId || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllStudent;