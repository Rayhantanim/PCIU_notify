import React, { useEffect, useState } from "react";
import { FaUsers, FaSearch, FaUserGraduate, FaEnvelope, FaPhone, FaIdCard, FaBuilding, FaBookOpen } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useTheme } from "../Context/ThemeContext";

const AllStudent = () => {
  const { isDarkMode } = useTheme();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const API = "https://pciunotifybackend.onrender.com";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API}/api/students`);
        const data = await res.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = [...students];
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.studentId?.toLowerCase().includes(query) ||
        student.department?.toLowerCase().includes(query) ||
        student.phone?.includes(query)
      );
    }
    
    if (selectedDepartment !== "All") {
      filtered = filtered.filter(student => student.department === selectedDepartment);
    }
    
    setFilteredStudents(filtered);
  }, [searchQuery, selectedDepartment, students]);

  const departments = ["All", ...new Set(students.map(s => s.department).filter(Boolean))];

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <FaUserGraduate className="text-3xl" />
              <h1 className="text-2xl sm:text-3xl font-bold">Student Management</h1>
            </div>
            <p className="text-blue-100 text-sm sm:text-base">View and manage all enrolled students</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`rounded-xl p-4 mb-6 shadow-sm border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="relative flex-1 w-full">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by name, email, student ID, department, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className={`px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <FaUsers className="inline mr-2" />
                  Total: {filteredStudents.length} students
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="text-5xl mb-4">🎓</div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchQuery || selectedDepartment !== "All" ? "No students match your filters" : "No students found"}
            </p>
            {(searchQuery || selectedDepartment !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("All");
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border shadow-sm ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>#</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Student</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Contact</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Department</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Section</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Student ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student._id} className={`border-b transition-colors ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700/50' 
                      : 'border-gray-100 hover:bg-blue-50'
                  }`}>
                    <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {student.firstName} {student.lastName}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <MdEmail className="text-blue-500" />
                          {student.email}
                        </p>
                        <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <FaPhone className="text-blue-500" />
                          {student.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FaBuilding className="text-blue-500" />
                        {student.department || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FaBookOpen className="text-blue-500" />
                        {student.section || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FaIdCard className="text-blue-500" />
                        {student.studentId || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllStudent;