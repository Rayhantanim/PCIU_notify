import React, { useEffect, useState } from "react";
import { FaUsers, FaSearch, FaChalkboardTeacher, FaEnvelope, FaPhone, FaIdCard, FaBuilding, FaUserTag } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useTheme } from "../Context/ThemeContext";


const AllTeacher = () => {
  const { isDarkMode } = useTheme();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const API = "https://pciunotifybackend.onrender.com";

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/teachers`);
        const data = await res.json();
        
        let teachersArray = [];
        if (Array.isArray(data)) {
          teachersArray = data;
        } else if (data.teachers && Array.isArray(data.teachers)) {
          teachersArray = data.teachers;
        } else if (data.data && Array.isArray(data.data)) {
          teachersArray = data.data;
        } else if (data.users && Array.isArray(data.users)) {
          teachersArray = data.users;
        } else {
          teachersArray = [];
        }
        
        setTeachers(teachersArray);
        setFilteredTeachers(teachersArray);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    let filtered = [...teachers];
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(teacher => 
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(query) ||
        teacher.email?.toLowerCase().includes(query) ||
        teacher.teacherId?.toLowerCase().includes(query) ||
        teacher.department?.toLowerCase().includes(query) ||
        teacher.shortName?.toLowerCase().includes(query) ||
        teacher.phone?.includes(query)
      );
    }
    
    if (selectedDepartment !== "All") {
      filtered = filtered.filter(teacher => teacher.department === selectedDepartment);
    }
    
    setFilteredTeachers(filtered);
  }, [searchQuery, selectedDepartment, teachers]);

  const departments = ["All", ...new Set(teachers.map(t => t.department).filter(Boolean))];

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading teachers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
        <div className={`max-w-md mx-auto p-6 rounded-2xl text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Error Loading Teachers
          </h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <FaChalkboardTeacher className="text-3xl" />
              <h1 className="text-2xl sm:text-3xl font-bold">Faculty Management</h1>
            </div>
            <p className="text-green-100 text-sm sm:text-base">View and manage all faculty members</p>
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
                placeholder="Search by name, email, teacher ID, department, or short name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                className={`px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                  Total: {filteredTeachers.length} teachers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        {filteredTeachers.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="text-5xl mb-4">👨‍🏫</div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchQuery || selectedDepartment !== "All" ? "No teachers match your filters" : "No teachers found"}
            </p>
            {(searchQuery || selectedDepartment !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("All");
                }}
                className="mt-4 text-green-600 hover:text-green-700 underline font-medium"
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
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Faculty Member</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Contact</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Department</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Teacher ID</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Short Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher, index) => (
                  <tr key={teacher._id || index} className={`border-b transition-colors ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700/50' 
                      : 'border-gray-100 hover:bg-green-50'
                  }`}>
                    <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                          {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {teacher.firstName} {teacher.lastName}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Faculty
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <MdEmail className="text-green-500" />
                          {teacher.email}
                        </p>
                        <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <FaPhone className="text-green-500" />
                          {teacher.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FaBuilding className="text-green-500" />
                        {teacher.department || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FaIdCard className="text-green-500" />
                        {teacher.teacherId || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FaUserTag className="text-green-500" />
                        {teacher.shortName || "N/A"}
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

export default AllTeacher;