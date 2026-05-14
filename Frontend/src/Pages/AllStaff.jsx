import React, { useEffect, useState } from 'react';
import { FaUsers, FaSearch, FaUserTie, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { useTheme } from '../Context/ThemeContext';

const AllStaff = () => {
  const { isDarkMode } = useTheme();
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const API = "https://pciunotifybackend.onrender.com";

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await fetch(`${API}/api/staffs`);
        const data = await res.json();
        setStaffs(data);
        setFilteredStaffs(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStaffs(staffs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = staffs.filter(staff => 
        `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query) ||
        staff.staffId?.toLowerCase().includes(query) ||
        staff.phone?.includes(query)
      );
      setFilteredStaffs(filtered);
    }
  }, [searchQuery, staffs]);

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <FaUserTie className="text-3xl" />
              <h1 className="text-2xl sm:text-3xl font-bold">Staff Management</h1>
            </div>
            <p className="text-purple-100 text-sm sm:text-base">View and manage all staff members</p>
          </div>
        </div>

        {/* Search and Stats Bar */}
        <div className={`rounded-xl p-4 mb-6 shadow-sm border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by name, email, staff ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <FaUsers className="inline mr-2" />
                Total Staff: {filteredStaffs.length}
              </span>
            </div>
          </div>
        </div>

        {/* Staff Grid/Table */}
        {filteredStaffs.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="text-5xl mb-4">👥</div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchQuery ? "No staff members match your search" : "No staff members found"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-purple-600 hover:text-purple-700 underline font-medium"
              >
                Clear Search
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
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Staff Member</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Contact Info</th>
                  <th className={`text-left p-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Staff ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffs.map((staff, index) => (
                  <tr key={staff._id} className={`border-b transition-colors ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700/50' 
                      : 'border-gray-100 hover:bg-purple-50'
                  }`}>
                    <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {staff.firstName?.[0]}{staff.lastName?.[0]}
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {staff.firstName} {staff.lastName}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {staff.role || 'Staff Member'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <MdEmail className="text-purple-500" />
                          {staff.email}
                        </p>
                        <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <FaPhone className="text-purple-500" />
                          {staff.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FaIdCard className="text-purple-500" />
                        {staff.staffId || "N/A"}
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

export default AllStaff;