import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineStop } from "react-icons/ai";
import { FaUsersBetweenLines } from "react-icons/fa6";
import { MdDisabledByDefault, MdEdit } from "react-icons/md";
import { FaChalkboardTeacher, FaKey, FaSearch, FaFilter, FaTimes, FaCheck } from 'react-icons/fa';
import { PiStudentFill } from "react-icons/pi";
import { PiCheckFill } from "react-icons/pi";
import Swal from 'sweetalert2';
import { useTheme } from '../../Context/ThemeContext';

// const API_BASE_URL = 'https://pciunotifybackend.onrender.com/api';
const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  
  // State Management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0
  });

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'student',
    department: '',
    section: '',
    status: 'active',
    studentId: '',
    teacherId: '',
    staffId: '',
    shortName: '',
    dob: '',
    password: ''
  });

  const departments = [
    'Computer Science & Engineering',
    'Electrical & Electronic Engineering',
    'Business Administration',
    'English',
    'Law',
    'Pharmacy',
    'Civil Engineering',
    'Architecture',
    'Economics',
    'Mathematics'
  ];

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      if (response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
        updateStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch users',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard-stats`);
      if (response.data) {
        setStats(prev => ({
          ...prev,
          totalStudents: response.data.totalStudents || 0,
          totalTeachers: response.data.totalTeachers || 0,
          totalStaff: response.data.totalStaff || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const updateStats = (userData) => {
    setStats({
      totalUsers: userData.length,
      activeUsers: userData.filter(u => u.isActive !== false).length,
      totalStudents: userData.filter(u => u.role === 'student').length,
      totalTeachers: userData.filter(u => u.role === 'teacher').length,
      totalStaff: userData.filter(u => u.role === 'staff').length
    });
  };

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.teacherId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.staffId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    if (departmentFilter !== 'all') {
      result = result.filter(user => user.department === departmentFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(user => user.isActive !== false);
      } else if (statusFilter === 'inactive') {
        result = result.filter(user => user.isActive === false);
      } else if (statusFilter === 'verified') {
        result = result.filter(user => user.verified === true);
      } else if (statusFilter === 'unverified') {
        result = result.filter(user => user.verified !== true);
      }
    }

    result.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, departmentFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    
    if (user) {
      setSelectedUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'student',
        department: user.department || '',
        section: user.section || '',
        status: user.isActive !== false ? 'active' : 'inactive',
        studentId: user.studentId || '',
        teacherId: user.teacherId || '',
        staffId: user.staffId || '',
        shortName: user.shortName || '',
        dob: user.dob || '',
        password: ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'student',
        department: '',
        section: '',
        status: 'active',
        studentId: '',
        teacherId: '',
        staffId: '',
        shortName: '',
        dob: '',
        password: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleAddUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill all required fields',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        section: formData.section,
        dob: formData.dob,
        password: formData.password || 'default123'
      };

      if (formData.role === 'student') {
        userData.studentId = formData.studentId;
      } else if (formData.role === 'teacher') {
        userData.teacherId = formData.teacherId;
        userData.shortName = formData.shortName;
      } else if (formData.role === 'staff') {
        userData.staffId = formData.staffId;
      }

      const response = await axios.post(`${API_BASE_URL}/register`, userData);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User created successfully!',
          timer: 2000,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        });
        fetchUsers();
        closeModal();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to create user',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    setLoading(true);
    try {
      const updateData = { ...formData };
      delete updateData.email;
      delete updateData.password;
      
      const response = await axios.put(`${API_BASE_URL}/users/${selectedUser._id}`, updateData);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User updated successfully!',
          timer: 2000,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        });
        fetchUsers();
        closeModal();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to update user',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    Swal.fire({
      title: 'Delete User',
      text: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await axios.delete(`${API_BASE_URL}/user/${user._id}`);
          
          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'User has been deleted.',
              timer: 2000,
              showConfirmButton: false,
              background: isDarkMode ? '#1f2937' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            });
            fetchUsers();
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.response?.data?.message || 'Failed to delete user',
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleToggleStatus = async (user) => {
    const willBeActive = user.isActive === false;
    const action = willBeActive ? 'activate' : 'deactivate';
    
    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      text: `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: willBeActive ? '#10b981' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action}`,
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await axios.patch(`${API_BASE_URL}/users/${user._id}/toggle-status`, {
            isActive: willBeActive
          });
          
          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: `${action}d!`,
              text: `User has been ${action}d.`,
              timer: 1500,
              showConfirmButton: false,
              background: isDarkMode ? '#1f2937' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            });
            fetchUsers();
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.response?.data?.message || `Failed to ${action} user`,
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/users/${selectedUser._id}/reset-password`, {
        email: selectedUser.email
      });
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Password Reset',
          text: 'Password reset email sent successfully!',
          timer: 2000,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        });
        closeModal();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to reset password',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (user) => {
    if (user.isActive === false) {
      return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>Inactive</span>;
    }
    if (!user.verified) {
      return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>Unverified</span>;
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>Active</span>;
  };

  const getRoleBadge = (role) => {
    const badges = {
      student: isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      teacher: isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800',
      staff: isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[role] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border shadow-sm hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <h3 className={`text-3xl font-bold mt-1 ${color}`}>{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'} transition-colors duration-200`}>
      <div className="p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">User Management</h1>
            <p className="text-blue-100 text-sm sm:text-base">Manage all students, teachers, and staff accounts</p>
          </div>
        </div>

        {/* Add User Button - Mobile */}
        <div className="mb-4 lg:hidden">
          <button 
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm"
            onClick={() => openModal('add')}
          >
            <span className="text-lg">+</span> Add New User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} icon={<FaUsersBetweenLines className="text-blue-500 dark:text-blue-400" />} color="text-blue-600 dark:text-blue-400" />
          <StatCard title="Active Users" value={stats.activeUsers} icon={<PiCheckFill className="text-emerald-500 dark:text-emerald-400" />} color="text-emerald-600 dark:text-emerald-400" />
          <StatCard title="Students" value={stats.totalStudents} icon={<PiStudentFill className="text-blue-500 dark:text-blue-400" />} color="text-blue-600 dark:text-blue-400" />
          <StatCard title="Teachers & Staff" value={stats.totalTeachers + stats.totalStaff} icon={<FaChalkboardTeacher className="text-violet-500 dark:text-violet-400" />} color="text-violet-600 dark:text-violet-400" />
        </div>

        {/* Filters Section */}
        <div className={`rounded-xl shadow-sm mb-6 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:ring-2 focus:border-transparent`}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter /> Filters
                {(roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all') && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                  <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department</label>
                  <select 
                    value={departmentFilter} 
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setRoleFilter('all');
                    setDepartmentFilter('all');
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className={`text-sm px-3 py-1 rounded-lg transition ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('firstName')}>
                    <div className="flex items-center gap-1">
                      Name {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Department</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading && filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="text-5xl mb-3">📭</div>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'
                    }`}>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {user.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 sm:px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.studentId || user.teacherId || user.staffId || 'N/A'}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.department || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal('edit', user)}
                            className={`p-2 rounded-xl transition-colors ${
                              isDarkMode 
                                ? 'text-blue-400 hover:bg-blue-900/30' 
                                : 'text-blue-500 hover:bg-blue-50'
                            }`}
                            title="Edit User"
                          >
                            <MdEdit className="text-xl" />
                          </button>
                          <button
                            onClick={() => openModal('resetPassword', user)}
                            className={`p-2 rounded-xl transition-colors ${
                              isDarkMode 
                                ? 'text-amber-400 hover:bg-amber-900/30' 
                                : 'text-amber-500 hover:bg-amber-50'
                            }`}
                            title="Reset Password"
                          >
                            <FaKey className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-xl transition-colors ${
                              user.isActive !== false 
                                ? isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                                : isDarkMode ? 'text-emerald-400 hover:bg-emerald-900/30' : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={user.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive !== false ? <AiOutlineStop className="text-xl" /> : <PiCheckFill className="text-xl" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className={`p-2 rounded-xl transition-colors ${
                              isDarkMode 
                                ? 'text-red-400 hover:bg-red-900/30' 
                                : 'text-red-500 hover:bg-red-50'
                            }`}
                            title="Delete User"
                          >
                            <RiDeleteBin6Line className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className={`rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center p-6 border-b sticky top-0 ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {modalType === 'add' && 'Add New User'}
                {modalType === 'edit' && 'Edit User'}
                {modalType === 'resetPassword' && 'Reset Password'}
              </h2>
              <button 
                onClick={closeModal}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {(modalType === 'add' || modalType === 'edit') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      } border focus:ring-2 focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      } border focus:ring-2 focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={modalType === 'edit'}
                      className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 disabled:opacity-50' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 disabled:bg-gray-100'
                      } border focus:ring-2 focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      } border focus:ring-2 focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  
                  {formData.role === 'student' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Student ID
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                          } border focus:ring-2 focus:border-transparent`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Section
                        </label>
                        <input
                          type="text"
                          name="section"
                          value={formData.section}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                          } border focus:ring-2 focus:border-transparent`}
                        />
                      </div>
                    </>
                  )}
                  
                  {formData.role === 'teacher' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Teacher ID
                        </label>
                        <input
                          type="text"
                          name="teacherId"
                          value={formData.teacherId}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                          } border focus:ring-2 focus:border-transparent`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Short Name
                        </label>
                        <input
                          type="text"
                          name="shortName"
                          value={formData.shortName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                          } border focus:ring-2 focus:border-transparent`}
                          placeholder="e.g., Dr. Smith"
                        />
                      </div>
                    </>
                  )}
                  
                  {formData.role === 'staff' && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Staff ID
                      </label>
                      <input
                        type="text"
                        name="staffId"
                        value={formData.staffId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                        } border focus:ring-2 focus:border-transparent`}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      } border focus:ring-2 focus:border-transparent`}
                    />
                  </div>
                  
                  {modalType === 'add' && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                        } border focus:ring-2 focus:border-transparent`}
                        placeholder="Min 8 characters"
                      />
                    </div>
                  )}
                </div>
              )}

              {modalType === 'resetPassword' && selectedUser && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-4">🔑</div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Reset Password
                  </h3>
                  <p className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Reset password for:
                  </p>
                  <p className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className={`mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {selectedUser.email}
                  </p>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="resetMethod" defaultChecked className="form-radio text-blue-500 focus:ring-blue-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Send password reset link via email
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="resetMethod" className="form-radio text-blue-500 focus:ring-blue-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Generate temporary password
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="form-checkbox rounded text-blue-500 focus:ring-blue-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Force password change on next login
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-3 p-6 border-t rounded-b-2xl ${
              isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <button 
                className={`px-6 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
                onClick={closeModal}
              >
                Cancel
              </button>
              
              {modalType === 'add' && (
                <button 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
                  onClick={handleAddUser}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <FaCheck /> Add User
                </button>
              )}
              
              {modalType === 'edit' && (
                <button 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
                  onClick={handleEditUser}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <FaCheck /> Save Changes
                </button>
              )}
              
              {modalType === 'resetPassword' && (
                <button 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <FaKey /> Reset Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;