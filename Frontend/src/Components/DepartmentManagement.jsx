import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { FcDepartment } from "react-icons/fc";
import { TbNewSection } from "react-icons/tb";
import { TfiReload } from "react-icons/tfi";
import { PiCheckFill } from "react-icons/pi";
import { FaSearch, FaFilter, FaTimes, FaPlus, FaSave, FaUserPlus, FaTrash, FaEdit } from "react-icons/fa";
import Swal from 'sweetalert2';
import { useTheme } from '../Context/ThemeContext';

const API_BASE_URL = 'https://pciunotifybackend.onrender.com/api';
// const API_BASE_URL = 'http://localhost:5000/api';

const DepartmentManagement = () => {
  const { isDarkMode } = useTheme();
  
  // State Management
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [modalType, setModalType] = useState('');
  
  // Department Form
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
    established: '',
    status: 'active'
  });

  // Section Form
  const [sectionForm, setSectionForm] = useState({
    name: '',
    capacity: '',
    semester: '',
    coordinator: ''
  });

  // Assign Teacher Form
  const [assignTeacherForm, setAssignTeacherForm] = useState({
    teacherId: '',
    departmentCode: '',
    role: 'member'
  });

  // Stats
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalSections: 0,
    assignedTeachers: 0,
    unassignedTeachers: 0,
    activeDepartments: 0
  });

  // Load departments from localStorage on mount
  useEffect(() => {
    loadDepartmentsFromStorage();
    fetchTeachers();
  }, []);

  // Load departments from localStorage
  const loadDepartmentsFromStorage = () => {
    const savedDepartments = localStorage.getItem('departments');
    if (savedDepartments) {
      const parsed = JSON.parse(savedDepartments);
      setDepartments(parsed);
      updateStats(parsed);
    } else {
      // Initialize with sample departments
      const initialDepartments = getInitialDepartments();
      setDepartments(initialDepartments);
      localStorage.setItem('departments', JSON.stringify(initialDepartments));
      updateStats(initialDepartments);
    }
  };

  // Save departments to localStorage
  const saveDepartmentsToStorage = (depts) => {
    localStorage.setItem('departments', JSON.stringify(depts));
    updateStats(depts);
  };

  const getInitialDepartments = () => {
    return [
      {
        _id: 'dept_1',
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering',
        head: 'Dr. Ahmed Rahman',
        established: '2010',
        status: 'active',
        sections: [
          { _id: 'sec_1', name: 'Section A', capacity: 60, semester: '8th', coordinator: 'Prof. Kamal Hossain' },
          { _id: 'sec_2', name: 'Section B', capacity: 55, semester: '8th', coordinator: '' }
        ]
      },
      {
        _id: 'dept_2',
        name: 'Electrical & Electronic Engineering',
        code: 'EEE',
        description: 'Department of Electrical and Electronic Engineering',
        head: 'Dr. Mohammad Ali',
        established: '2008',
        status: 'active',
        sections: [
          { _id: 'sec_3', name: 'Section A', capacity: 50, semester: '6th', coordinator: 'Dr. Fahim Chowdhury' }
        ]
      },
      {
        _id: 'dept_3',
        name: 'Business Administration',
        code: 'BBA',
        description: 'Department of Business Administration',
        head: 'Dr. Fatema Khatun',
        established: '2005',
        status: 'active',
        sections: [
          { _id: 'sec_4', name: 'Section A', capacity: 70, semester: '4th', coordinator: '' },
          { _id: 'sec_5', name: 'Section B', capacity: 65, semester: '4th', coordinator: '' }
        ]
      }
    ];
  };

  // Fetch teachers from backend
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/teachers`);
      
      if (response.data) {
        const teachersData = response.data.map(teacher => ({
          _id: teacher._id,
          firstName: teacher.firstName || '',
          lastName: teacher.lastName || '',
          fullName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
          email: teacher.email || '',
          phone: teacher.phone || '',
          department: teacher.department || '',
          teacherId: teacher.teacherId || '',
          shortName: teacher.shortName || '',
          verified: teacher.verified || false
        }));
        
        setTeachers(teachersData);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get teachers by department code
  const getTeachersByDepartment = (departmentCode) => {
    return teachers.filter(teacher => {
      if (!teacher.department) return false;
      return teacher.department.toUpperCase() === departmentCode.toUpperCase();
    });
  };

  // Get unassigned teachers
  const getUnassignedTeachers = () => {
    return teachers.filter(teacher => !teacher.department || teacher.department === '');
  };

  // Update stats
  const updateStats = (depts) => {
    const totalSections = depts.reduce((sum, dept) => sum + (dept.sections?.length || 0), 0);
    const assignedCount = teachers.filter(t => t.department && t.department !== '').length;
    const unassignedCount = teachers.filter(t => !t.department || t.department === '').length;
    
    setStats({
      totalDepartments: depts.length,
      totalSections,
      assignedTeachers: assignedCount,
      unassignedTeachers: unassignedCount,
      activeDepartments: depts.filter(d => d.status === 'active').length
    });
  };

  // Handle form inputs
  const handleDepartmentInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentForm({ ...departmentForm, [name]: value });
  };

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionForm({ ...sectionForm, [name]: value });
  };

  const handleAssignTeacherInputChange = (e) => {
    const { name, value } = e.target;
    setAssignTeacherForm({ ...assignTeacherForm, [name]: value });
  };

  // Open modals
  const openAddDepartmentModal = () => {
    setModalType('add');
    setDepartmentForm({
      name: '',
      code: '',
      description: '',
      head: '',
      established: '',
      status: 'active'
    });
    setShowDepartmentModal(true);
  };

  const openEditDepartmentModal = (department) => {
    setModalType('edit');
    setSelectedDepartment(department);
    setDepartmentForm({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      head: department.head || '',
      established: department.established || '',
      status: department.status || 'active'
    });
    setShowDepartmentModal(true);
  };

  const openSectionModal = (department) => {
    setSelectedDepartment(department);
    setSectionForm({ name: '', capacity: '', semester: '', coordinator: '' });
    setShowSectionModal(true);
  };

  const openAssignTeacherModal = (department) => {
    setSelectedDepartment(department);
    setAssignTeacherForm({
      teacherId: '',
      departmentCode: department.code,
      role: 'member'
    });
    setShowAssignTeacherModal(true);
  };

  const closeModals = () => {
    setShowDepartmentModal(false);
    setShowSectionModal(false);
    setShowAssignTeacherModal(false);
    setSelectedDepartment(null);
  };

  // Add Department
  const handleAddDepartment = () => {
    if (!departmentForm.name || !departmentForm.code) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill Department Name and Code',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    // Check for duplicate code
    const existingDept = departments.find(d => d.code.toUpperCase() === departmentForm.code.toUpperCase());
    if (existingDept) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Code',
        text: `Department with code "${departmentForm.code}" already exists!`,
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    const newDepartment = {
      _id: `dept_${Date.now()}`,
      ...departmentForm,
      sections: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedDepartments = [...departments, newDepartment];
    setDepartments(updatedDepartments);
    saveDepartmentsToStorage(updatedDepartments);
    
    Swal.fire({
      icon: 'success',
      title: 'Department Added!',
      text: `${departmentForm.name} has been added successfully.`,
      timer: 2000,
      showConfirmButton: false,
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });
    closeModals();
  };

  // Edit Department
  const handleEditDepartment = () => {
    // Check for duplicate code (excluding current department)
    const existingDept = departments.find(d => 
      d.code.toUpperCase() === departmentForm.code.toUpperCase() && 
      d._id !== selectedDepartment._id
    );
    if (existingDept) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Code',
        text: `Department with code "${departmentForm.code}" already exists!`,
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    const updatedDepartments = departments.map(dept =>
      dept._id === selectedDepartment._id ? { ...dept, ...departmentForm } : dept
    );
    setDepartments(updatedDepartments);
    saveDepartmentsToStorage(updatedDepartments);
    
    Swal.fire({
      icon: 'success',
      title: 'Department Updated!',
      text: `${departmentForm.name} has been updated successfully.`,
      timer: 2000,
      showConfirmButton: false,
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });
    closeModals();
  };

  // Delete Department
  const handleDeleteDepartment = (department) => {
    Swal.fire({
      title: 'Delete Department',
      html: `Are you sure you want to delete <strong>${department.name}</strong>?<br/>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedDepartments = departments.filter(dept => dept._id !== department._id);
        setDepartments(updatedDepartments);
        saveDepartmentsToStorage(updatedDepartments);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${department.name} has been deleted.`,
          timer: 2000,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        });
      }
    });
  };

  // Add Section
  const handleAddSection = () => {
    if (!sectionForm.name) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter section name',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    const newSection = {
      _id: `sec_${Date.now()}`,
      ...sectionForm,
      createdAt: new Date().toISOString()
    };
    
    const updatedDepartments = departments.map(dept =>
      dept._id === selectedDepartment._id
        ? { ...dept, sections: [...(dept.sections || []), newSection] }
        : dept
    );
    setDepartments(updatedDepartments);
    saveDepartmentsToStorage(updatedDepartments);
    
    Swal.fire({
      icon: 'success',
      title: 'Section Added!',
      text: `${sectionForm.name} has been added to ${selectedDepartment?.name}.`,
      timer: 2000,
      showConfirmButton: false,
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });
    closeModals();
  };

  // Delete Section
  const handleDeleteSection = (departmentId, sectionId, sectionName) => {
    Swal.fire({
      title: 'Delete Section',
      text: `Are you sure you want to delete "${sectionName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedDepartments = departments.map(dept =>
          dept._id === departmentId
            ? { ...dept, sections: dept.sections.filter(s => s._id !== sectionId) }
            : dept
        );
        setDepartments(updatedDepartments);
        saveDepartmentsToStorage(updatedDepartments);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Section deleted successfully.',
          timer: 1500,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        });
      }
    });
  };

  // Assign Teacher to Department
  const handleAssignTeacher = async () => {
    if (!assignTeacherForm.teacherId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select a teacher',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${assignTeacherForm.teacherId}`,
        { department: assignTeacherForm.departmentCode }
      );
      
      if (response.data.success) {
        await fetchTeachers();
        Swal.fire({
          icon: 'success',
          title: 'Teacher Assigned!',
          text: 'Teacher has been assigned to the department.',
          timer: 2000,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        });
        closeModals();
      }
    } catch (err) {
      console.error('Error assigning teacher:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to assign teacher',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove Teacher from Department
  const handleRemoveTeacher = async (teacherId, teacherName) => {
    Swal.fire({
      title: 'Remove Teacher',
      text: `Are you sure you want to remove ${teacherName} from this department?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove',
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await axios.put(`${API_BASE_URL}/users/${teacherId}`, { department: '' });
          
          if (response.data.success) {
            await fetchTeachers();
            Swal.fire({
              icon: 'success',
              title: 'Teacher Removed!',
              text: `${teacherName} has been removed from the department.`,
              timer: 2000,
              showConfirmButton: false,
              background: isDarkMode ? '#1f2937' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            });
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.response?.data?.message || 'Failed to remove teacher',
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Filter departments
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>Active</span>;
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>Inactive</span>;
  };

  const getVerificationBadge = (verified) => {
    if (verified) {
      return <span className={`px-2 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>Verified</span>;
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>Pending</span>;
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`rounded-xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border shadow-sm hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl ${
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
        
        {/* Header with Add Department Button */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Department & Section Management</h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Manage departments, sections, and faculty assignments
                  <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs">
                    {teachers.length} teachers loaded
                  </span>
                </p>
              </div>
              {/* ADD DEPARTMENT BUTTON - VISIBLE HERE */}
              <button 
                onClick={openAddDepartmentModal}
                className="px-5 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
              >
                <FaPlus className="text-sm" /> Add Department
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
  <StatCard 
    title="Departments" 
    value={stats.totalDepartments} 
    icon={<FcDepartment />} 
    color="text-blue-600 dark:text-blue-300" 
  />
  <StatCard 
    title="Sections" 
    value={stats.totalSections} 
    icon={<TbNewSection />} 
    color="text-violet-600 dark:text-violet-300" 
  />
  <StatCard 
    title="Assigned Teachers" 
    value={stats.assignedTeachers} 
    icon={<LiaChalkboardTeacherSolid />} 
    color="text-emerald-600 dark:text-emerald-300" 
  />
  <StatCard 
    title="Unassigned" 
    value={stats.unassignedTeachers} 
    icon={<TfiReload />} 
    color="text-amber-600 dark:text-amber-300" 
  />
  <StatCard 
    title="Active Depts" 
    value={stats.activeDepartments} 
    icon={<PiCheckFill />} 
    color="text-green-600 dark:text-green-300" 
  />
</div>

        {/* Search and Filters */}
        <div className={`rounded-xl shadow-sm mb-6 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search departments by name, code, or head..."
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
                {statusFilter !== 'all' && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              </button>
              
              <button
                onClick={fetchTeachers}
                className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TfiReload /> Refresh
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
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

        {/* Unassigned Teachers Warning */}
        {stats.unassignedTeachers > 0 && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            isDarkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className="text-2xl">⚠️</span>
            <p className="text-sm">{stats.unassignedTeachers} teacher(s) need department assignment</p>
          </div>
        )}

        {/* Departments List */}
        <div className="space-y-6">
          {loading && departments.length === 0 ? (
            <div className={`text-center py-16 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className={`text-center py-16 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="text-6xl mb-4">🏛️</div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No departments found</p>
              <button
                onClick={openAddDepartmentModal}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <FaPlus className="inline mr-2" /> Add Your First Department
              </button>
            </div>
          ) : (
            filteredDepartments.map(department => {
              const departmentTeachers = getTeachersByDepartment(department.code);
              
              return (
                <div key={department._id} className={`rounded-2xl shadow-sm border overflow-hidden ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  {/* Department Header */}
                  <div className={`p-5 sm:p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50'}`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm">
                            {department.code}
                          </div>
                          <div>
                            <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {department.name}
                            </h3>
                            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Code: {department.code}
                            </p>
                          </div>
                          <div className="ml-0 sm:ml-2">
                            {getStatusBadge(department.status)}
                          </div>
                        </div>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {department.description}
                        </p>
                        <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs sm:text-sm">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>👤 Head: {department.head}</span>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>📅 Est: {department.established}</span>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>📚 Sections: {department.sections?.length || 0}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            👨‍🏫 Teachers: {departmentTeachers.length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openAssignTeacherModal(department)}
                          className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm"
                        >
                          <FaUserPlus className="inline mr-1" /> Assign Teacher
                        </button>
                        <button
                          onClick={() => openSectionModal(department)}
                          className="px-3 sm:px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm"
                        >
                          <FaPlus className="inline mr-1" /> Add Section
                        </button>
                        <button
                          onClick={() => openEditDepartmentModal(department)}
                          className={`p-2 rounded-xl transition-colors ${
                            isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-500 hover:bg-blue-50'
                          }`}
                          title="Edit Department"
                        >
                          <MdEdit className="text-lg sm:text-xl" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(department)}
                          className={`p-2 rounded-xl transition-colors ${
                            isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                          }`}
                          title="Delete Department"
                        >
                          <RiDeleteBin6Line className="text-lg sm:text-xl" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sections & Teachers Grid - Same as before */}
                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Sections */}
                      <div>
                        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <span>📚</span> Sections
                          <span className={`px-2 py-0.5 rounded-full text-xs ring-1 ${
                            isDarkMode ? 'bg-gray-700 text-gray-400 ring-gray-600' : 'bg-gray-100 text-gray-600 ring-gray-200'
                          }`}>
                            {department.sections?.length || 0}
                          </span>
                        </h4>
                        
                        {department.sections && department.sections.length > 0 ? (
                          <div className="space-y-3">
                            {department.sections.map(section => (
                              <div key={section._id} className={`p-4 rounded-xl border transition-all duration-200 ${
                                isDarkMode ? 'bg-gray-700 border-gray-600 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                              }`}>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                      {section.name}
                                    </h5>
                                    <div className={`text-sm mt-1 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <p>📊 Capacity: {section.capacity || 'N/A'} students</p>
                                      <p>📅 Semester: {section.semester || 'N/A'}</p>
                                      <p>👤 Coordinator: {section.coordinator || 'Not assigned'}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteSection(department._id, section._id, section.name)}
                                    className={`p-1 rounded-lg transition-colors ${
                                      isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'
                                    }`}
                                    title="Delete Section"
                                  >
                                    <FaTrash className="text-lg" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>No sections added yet</p>
                          </div>
                        )}
                      </div>

                      {/* Teachers */}
                      <div>
                        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          <span>👨‍🏫</span> Assigned Teachers
                          <span className={`px-2 py-0.5 rounded-full text-xs ring-1 ${
                            isDarkMode ? 'bg-blue-900/30 text-blue-400 ring-blue-700' : 'bg-blue-50 text-blue-700 ring-blue-200'
                          }`}>
                            {departmentTeachers.length}
                          </span>
                        </h4>
                        
                        {departmentTeachers.length > 0 ? (
                          <div className="space-y-3">
                            {departmentTeachers.map(teacher => (
                              <div key={teacher._id} className={`flex items-center justify-between p-4 rounded-xl border transition-shadow ${
                                isDarkMode ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                              } hover:shadow-md`}>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0">
                                    {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                      {teacher.fullName}
                                      {teacher.shortName && (
                                        <span className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                          ({teacher.shortName})
                                        </span>
                                      )}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                      <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {teacher.email}
                                      </p>
                                      {getVerificationBadge(teacher.verified)}
                                    </div>
                                    {teacher.teacherId && (
                                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        ID: {teacher.teacherId}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveTeacher(teacher._id, teacher.fullName)}
                                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-xl transition-all duration-200 ${
                                    isDarkMode 
                                      ? 'text-red-400 hover:bg-red-900/30 border border-red-800' 
                                      : 'text-red-500 hover:bg-red-50 border border-red-200'
                                  }`}
                                  title="Remove from department"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>No teachers assigned yet</p>
                            <button
                              onClick={() => openAssignTeacherModal(department)}
                              className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                            >
                              + Assign a teacher
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className={`rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex justify-between items-center p-6 border-b sticky top-0 ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {modalType === 'add' ? 'Add New Department' : 'Edit Department'}
              </h2>
              <button onClick={closeModals} className={`p-2 rounded-xl transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}>
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={departmentForm.name}
                    onChange={handleDepartmentInputChange}
                    className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                    } border focus:ring-2 focus:border-transparent`}
                    placeholder="e.g., Computer Science & Engineering"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={departmentForm.code}
                    onChange={handleDepartmentInputChange}
                    className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                    } border focus:ring-2 focus:border-transparent`}
                    placeholder="e.g., CSE"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={departmentForm.description}
                  onChange={handleDepartmentInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 rounded-xl outline-none transition-all resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:ring-2 focus:border-transparent`}
                  placeholder="Department description..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department Head
                  </label>
                  <input
                    type="text"
                    name="head"
                    value={departmentForm.head}
                    onChange={handleDepartmentInputChange}
                    className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                    } border focus:ring-2 focus:border-transparent`}
                    placeholder="e.g., Dr. John Doe"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Established Year
                  </label>
                  <input
                    type="text"
                    name="established"
                    value={departmentForm.established}
                    onChange={handleDepartmentInputChange}
                    className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                    } border focus:ring-2 focus:border-transparent`}
                    placeholder="e.g., 2010"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  name="status"
                  value={departmentForm.status}
                  onChange={handleDepartmentInputChange}
                  className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
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
                onClick={closeModals}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
                onClick={modalType === 'add' ? handleAddDepartment : handleEditDepartment}
              >
                <FaSave /> {modalType === 'add' ? 'Add Department' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className={`rounded-2xl shadow-xl w-full max-w-md ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex justify-between items-center p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add Section to {selectedDepartment?.name}
              </h2>
              <button onClick={closeModals} className={`p-2 rounded-xl transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}>
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Section Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={sectionForm.name}
                  onChange={handleSectionInputChange}
                  className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:ring-2 focus:border-transparent`}
                  placeholder="e.g., Section A"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={sectionForm.capacity}
                  onChange={handleSectionInputChange}
                  className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:ring-2 focus:border-transparent`}
                  placeholder="e.g., 60"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Semester
                </label>
                <select
                  name="semester"
                  value={sectionForm.semester}
                  onChange={handleSectionInputChange}
                  className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={`${sem}${sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'}`}>
                      {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Section Coordinator
                </label>
                <input
                  type="text"
                  name="coordinator"
                  value={sectionForm.coordinator}
                  onChange={handleSectionInputChange}
                  className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:ring-2 focus:border-transparent`}
                  placeholder="e.g., Prof. John Smith"
                />
              </div>
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
                onClick={closeModals}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all duration-200 font-medium shadow-sm"
                onClick={handleAddSection}
              >
                <FaPlus className="inline mr-1" /> Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignTeacherModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className={`rounded-2xl shadow-xl w-full max-w-lg ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex justify-between items-center p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Assign Teacher to {selectedDepartment?.name} ({selectedDepartment?.code})
              </h2>
              <button onClick={closeModals} className={`p-2 rounded-xl transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}>
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Teacher *
                </label>
                <select
                  name="teacherId"
                  value={assignTeacherForm.teacherId}
                  onChange={handleAssignTeacherInputChange}
                  className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Choose a teacher...</option>
                  {getUnassignedTeachers().length > 0 && (
                    <optgroup label="Unassigned Teachers">
                      {getUnassignedTeachers().map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName} {teacher.shortName ? `(${teacher.shortName})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {teachers.filter(t => t.department && t.department !== selectedDepartment?.code).length > 0 && (
                    <optgroup label="Teachers from Other Departments">
                      {teachers
                        .filter(t => t.department && t.department !== selectedDepartment?.code)
                        .map(teacher => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.fullName} [{teacher.department}]
                          </option>
                        ))
                      }
                    </optgroup>
                  )}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role
                </label>
                <select
                  name="role"
                  value={assignTeacherForm.role}
                  onChange={handleAssignTeacherInputChange}
                  className={`w-full px-3 py-2 rounded-xl outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="member">Member</option>
                  <option value="coordinator">Section Coordinator</option>
                  <option value="head">Department Head</option>
                  <option value="advisor">Academic Advisor</option>
                </select>
              </div>
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
                onClick={closeModals}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
                onClick={handleAssignTeacher}
                disabled={loading}
              >
                {loading ? 'Assigning...' : <><FaUserPlus className="inline mr-1" /> Assign Teacher</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;