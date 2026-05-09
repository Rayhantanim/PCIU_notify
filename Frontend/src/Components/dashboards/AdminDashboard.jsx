import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineStop } from "react-icons/ai";
import { FaUsersBetweenLines } from "react-icons/fa6";
import { MdDisabledByDefault, MdEdit } from "react-icons/md";
import { FaChalkboardTeacher, FaKey } from 'react-icons/fa';
import { PiStudentFill } from "react-icons/pi";
import { PiCheckFill } from "react-icons/pi";
const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  // State Management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'deactivate', 'resetPassword'
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  // Departments list (you can fetch this from backend if needed)
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

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, []);

  // Fetch users from backend
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
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
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

  // Update local stats
  const updateStats = (userData) => {
    setStats({
      totalUsers: userData.length,
      activeUsers: userData.filter(u => u.isActive !== false).length,
      totalStudents: userData.filter(u => u.role === 'student').length,
      totalTeachers: userData.filter(u => u.role === 'teacher').length,
      totalStaff: userData.filter(u => u.role === 'staff').length
    });
  };

  // Filter and Sort Logic
  useEffect(() => {
    let result = [...users];

    // Apply search
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

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(user => user.department === departmentFilter);
    }

    // Apply status filter
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

    // Apply sorting
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

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle Form Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open Modal
  const openModal = (type, user = null) => {
    setModalType(type);
    setError('');
    setSuccessMessage('');
    
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

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
    setSuccessMessage('');
  };

  // Add User (Register)
  const handleAddUser = async () => {
    try {
      setLoading(true);
      setError('');
      
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

      // Add role-specific IDs
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
        setSuccessMessage('User created successfully!');
        fetchUsers();
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

 // Edit User - Fix the code inside handleEditUser
const handleEditUser = async () => {
  try {
    setLoading(true);
    setError('');
    
    // Remove fields that shouldn't be updated
    const updateData = { ...formData };
    delete updateData.email; // Email shouldn't be changed
    delete updateData.password; // Password shouldn't be changed this way
    
    const response = await axios.put(`${API_BASE_URL}/users/${selectedUser._id}`, updateData);
    
    if (response.data.success) {
      setSuccessMessage('User updated successfully!');
      await fetchUsers();
      setTimeout(() => {
        closeModal();
      }, 1500);
    }
  } catch (err) {
    console.error('Error updating user:', err);
    setError(err.response?.data?.message || 'Failed to update user');
  } finally {
    setLoading(false);
  }
};

// Delete User
const handleDeleteUser = async (user) => {
  try {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError('');
    
    const response = await axios.delete(`${API_BASE_URL}/users/${user._id}`);
    
    if (response.data.success) {
      setSuccessMessage(`${user.firstName} ${user.lastName} deleted successfully`);
      await fetchUsers();
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    setError(err.response?.data?.message || 'Failed to delete user');
  } finally {
    setLoading(false);
  }
};

// Toggle User Active Status (Deactivate/Activate) - Fixed logic
const handleToggleStatus = async (user) => {
  try {
    const willBeActive = user.isActive === false; // Fix: If currently inactive, we want to activate
    const action = willBeActive ? 'activate' : 'deactivate';
    const confirmMessage = `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`;
    
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setError('');
    
    const response = await axios.patch(`${API_BASE_URL}/users/${user._id}/toggle-status`, {
      isActive: willBeActive
    });
    
    if (response.data.success) {
      setSuccessMessage(`User ${action}d successfully!`);
      await fetchUsers();
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  } catch (err) {
    console.error(`Error toggling user status:`, err);
    setError(err.response?.data?.message || 'Failed to update user status');
  } finally {
    setLoading(false);
  }
};

// Reset Password
const handleResetPassword = async () => {
  try {
    setLoading(true);
    setError('');
    
    const response = await axios.post(`${API_BASE_URL}/users/${selectedUser._id}/reset-password`, {
      email: selectedUser.email
    });
    
    if (response.data.success) {
      setSuccessMessage('Password reset email sent successfully!');
      setTimeout(() => {
        closeModal();
        setSuccessMessage('');
      }, 2000);
    }
  } catch (err) {
    console.error('Error resetting password:', err);
    setError(err.response?.data?.message || 'Failed to reset password');
  } finally {
    setLoading(false);
  }
};
  // Get Status Badge
  const getStatusBadge = (user) => {
    if (user.isActive === false) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
    }
    if (!user.verified) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Unverified</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  };

  // Get Role Badge
  const getRoleBadge = (role) => {
    const badges = {
      student: 'bg-blue-100 text-blue-800',
      teacher: 'bg-purple-100 text-purple-800',
      staff: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[role] || 'bg-gray-100 text-gray-800'}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Success/Error Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all students, teachers, and staff accounts</p>
        </div>
        <button 
          className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2 font-medium"
          onClick={() => openModal('add')}
        >
          <span>+</span> Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              <FaUsersBetweenLines />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.activeUsers}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl">
              <PiCheckFill />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Students</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.totalStudents}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              <PiStudentFill />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Teachers & Staff</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.totalTeachers + stats.totalStaff}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
              <FaChalkboardTeacher />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="staff">Staff</option>
            </select>
            
            <select 
              value={departmentFilter} 
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('firstName')}
                >
                  Name {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.studentId || user.teacherId || user.staffId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('edit', user)}
                          className="p-2 text-2xl hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <MdEdit/>
                        </button>
                        <button
                          onClick={() => openModal('resetPassword', user)}
                          className="p-2 text-xl  hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <FaKey />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 text-3xl rounded-lg transition-colors ${
                            user.isActive !== false 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive !== false ? <AiOutlineStop/> : <PiCheckFill  />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-2xl text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <RiDeleteBin6Line/>
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

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalType === 'add' && 'Add New User'}
                {modalType === 'edit' && 'Edit User'}
                {modalType === 'resetPassword' && 'Reset Password'}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}

              {/* Add/Edit Form */}
              {(modalType === 'add' || modalType === 'edit') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={modalType === 'edit'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student ID
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section
                        </label>
                        <input
                          type="text"
                          name="section"
                          value={formData.section}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </>
                  )}
                  
                  {formData.role === 'teacher' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teacher ID
                        </label>
                        <input
                          type="text"
                          name="teacherId"
                          value={formData.teacherId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Short Name
                        </label>
                        <input
                          type="text"
                          name="shortName"
                          value={formData.shortName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="e.g., Dr. Smith"
                        />
                      </div>
                    </>
                  )}
                  
                  {formData.role === 'staff' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Staff ID
                      </label>
                      <input
                        type="text"
                        name="staffId"
                        value={formData.staffId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  {modalType === 'add' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Min 8 characters"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Reset Password */}
              {modalType === 'resetPassword' && selectedUser && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-4">🔑</div>
                  <h3 className="text-xl font-semibold mb-2">Reset Password</h3>
                  <p className="text-gray-600 mb-2">
                    Reset password for:
                  </p>
                  <p className="text-lg font-medium text-gray-800 mb-1">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-gray-500 mb-6">{selectedUser.email}</p>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="resetMethod" defaultChecked className="form-radio" />
                      <span className="text-sm">Send password reset link via email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="resetMethod" className="form-radio" />
                      <span className="text-sm">Generate temporary password</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="form-checkbox" />
                      <span className="text-sm">Force password change on next login</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button 
                className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                onClick={closeModal}
              >
                Cancel
              </button>
              {modalType === 'add' && (
                <button 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                  onClick={handleAddUser}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  Add User
                </button>
              )}
              {modalType === 'edit' && (
                <button 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                  onClick={handleEditUser}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  Save Changes
                </button>
              )}
              {modalType === 'resetPassword' && (
                <button 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  Reset Password
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