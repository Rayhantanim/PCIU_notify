import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { FcDepartment } from "react-icons/fc";
import { TbNewSection } from "react-icons/tb";
import { TfiReload } from "react-icons/tfi";
import { PiCheckFill } from "react-icons/pi";



const API_BASE_URL = 'http://localhost:5000/api';

const DepartmentManagement = () => {
  // State Management
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit'
  
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

  // Fetch all data on mount
  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

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
          department: teacher.department || '', // Department code from backend
          teacherId: teacher.teacherId || '',
          shortName: teacher.shortName || '',
          verified: teacher.verified || false
        }));
        
        setTeachers(teachersData);
        console.log(`✅ Fetched ${teachersData.length} teachers from backend`);
      }
    } catch (err) {
      console.error('❌ Error fetching teachers:', err);
      setError('Failed to fetch teachers from server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments (can be combined with teachers data)
  const fetchDepartments = async () => {
    try {
      // Since you might not have a departments API yet, we'll create departments
      // based on unique department values from teachers
      const uniqueDepartments = [...new Set(teachers
        .filter(t => t.department)
        .map(t => t.department)
      )];
      
      // If we have department data from somewhere, use it
      // Otherwise, create departments from teacher data
      const departmentsData = getDepartmentList(uniqueDepartments);
      setDepartments(departmentsData);
      updateStats(departmentsData);
      
    } catch (err) {
      console.error('Error processing departments:', err);
    }
  };

  // Create department list (you can replace this with actual API call)
  const getDepartmentList = (existingCodes) => {
    const allDepartments = [
      {
        _id: '1',
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering',
        head: 'Dr. Ahmed Rahman',
        established: '2010',
        status: 'active',
        sections: [
          { _id: 's1', name: 'Section A', capacity: 60, semester: '8th', coordinator: 'Prof. Kamal Hossain' },
          { _id: 's2', name: 'Section B', capacity: 55, semester: '8th', coordinator: '' }
        ]
      },
      {
        _id: '2',
        name: 'Electrical & Electronic Engineering',
        code: 'EEE',
        description: 'Department of Electrical and Electronic Engineering',
        head: 'Dr. Mohammad Ali',
        established: '2008',
        status: 'active',
        sections: [
          { _id: 's3', name: 'Section A', capacity: 50, semester: '6th', coordinator: 'Dr. Fahim Chowdhury' }
        ]
      },
      {
        _id: '3',
        name: 'Business Administration',
        code: 'BBA',
        description: 'Department of Business Administration',
        head: 'Dr. Fatema Khatun',
        established: '2005',
        status: 'active',
        sections: [
          { _id: 's4', name: 'Section A', capacity: 70, semester: '4th', coordinator: '' },
          { _id: 's5', name: 'Section B', capacity: 65, semester: '4th', coordinator: '' }
        ]
      },
      {
        _id: '4',
        name: 'English',
        code: 'ENG',
        description: 'Department of English Language and Literature',
        head: 'Dr. Rashid Khan',
        established: '2003',
        status: 'active',
        sections: []
      },
      {
        _id: '5',
        name: 'Law',
        code: 'LAW',
        description: 'Department of Law',
        head: 'Dr. Karim Uddin',
        established: '2006',
        status: 'active',
        sections: []
      },
      {
        _id: '6',
        name: 'Pharmacy',
        code: 'PHR',
        description: 'Department of Pharmacy',
        head: 'Dr. Nasrin Sultana',
        established: '2012',
        status: 'active',
        sections: []
      }
    ];
    
    return allDepartments;
  };

  // Get teachers by department code
  const getTeachersByDepartment = (departmentCode) => {
    return teachers.filter(teacher => {
      if (!teacher.department) return false;
      
      // Match department code (case insensitive)
      const teacherDept = teacher.department.toUpperCase();
      const deptCode = departmentCode.toUpperCase();
      
      return teacherDept === deptCode;
    });
  };

  // Get unassigned teachers (no department)
  const getUnassignedTeachers = () => {
    return teachers.filter(teacher => !teacher.department || teacher.department === '');
  };

  // Get assigned teachers (have department)
  const getAssignedTeachers = () => {
    return teachers.filter(teacher => teacher.department && teacher.department !== '');
  };

  // Update stats
  const updateStats = (depts) => {
    const totalSections = depts.reduce((sum, dept) => sum + (dept.sections?.length || 0), 0);
    const assignedCount = getAssignedTeachers().length;
    const unassignedCount = getUnassignedTeachers().length;
    
    setStats({
      totalDepartments: depts.length,
      totalSections,
      assignedTeachers: assignedCount,
      unassignedTeachers: unassignedCount,
      activeDepartments: depts.filter(d => d.status === 'active').length
    });
  };

  // Update stats when teachers change
  useEffect(() => {
    updateStats(departments);
  }, [teachers, departments]);

  // Handle Department Form Input
  const handleDepartmentInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentForm({ ...departmentForm, [name]: value });
  };

  // Handle Section Form Input
  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionForm({ ...sectionForm, [name]: value });
  };

  // Handle Assign Teacher Form Input
  const handleAssignTeacherInputChange = (e) => {
    const { name, value } = e.target;
    setAssignTeacherForm({ ...assignTeacherForm, [name]: value });
  };

  // Open Department Modal
  const openDepartmentModal = (type, department = null) => {
    setModalType(type);
    setError('');
    setSuccessMessage('');
    
    if (department) {
      setSelectedDepartment(department);
      setDepartmentForm({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        head: department.head || '',
        established: department.established || '',
        status: department.status || 'active'
      });
    } else {
      setSelectedDepartment(null);
      setDepartmentForm({
        name: '',
        code: '',
        description: '',
        head: '',
        established: '',
        status: 'active'
      });
    }
    setShowDepartmentModal(true);
  };

  // Close Department Modal
  const closeDepartmentModal = () => {
    setShowDepartmentModal(false);
    setSelectedDepartment(null);
    setError('');
    setSuccessMessage('');
  };

  // Open Section Modal
  const openSectionModal = (department) => {
    setSelectedDepartment(department);
    setSectionForm({
      name: '',
      capacity: '',
      semester: '',
      coordinator: ''
    });
    setShowSectionModal(true);
  };

  // Close Section Modal
  const closeSectionModal = () => {
    setShowSectionModal(false);
    setSelectedDepartment(null);
    setError('');
  };

  // Open Assign Teacher Modal
  const openAssignTeacherModal = (department) => {
    setSelectedDepartment(department);
    setAssignTeacherForm({
      teacherId: '',
      departmentCode: department.code,
      role: 'member'
    });
    setShowAssignTeacherModal(true);
  };

  // Close Assign Teacher Modal
  const closeAssignTeacherModal = () => {
    setShowAssignTeacherModal(false);
    setSelectedDepartment(null);
    setError('');
  };

  // Add Department
  const handleAddDepartment = () => {
    const newDepartment = {
      _id: Date.now().toString(),
      ...departmentForm,
      sections: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedDepartments = [...departments, newDepartment];
    setDepartments(updatedDepartments);
    setSuccessMessage('Department added successfully!');
    
    setTimeout(() => {
      closeDepartmentModal();
    }, 1500);
  };

  // Edit Department
  const handleEditDepartment = () => {
    const updatedDepartments = departments.map(dept =>
      dept._id === selectedDepartment._id
        ? { ...dept, ...departmentForm }
        : dept
    );
    
    setDepartments(updatedDepartments);
    setSuccessMessage('Department updated successfully!');
    
    setTimeout(() => {
      closeDepartmentModal();
    }, 1500);
  };

  // Delete Department
  const handleDeleteDepartment = (department) => {
    const teachersInDept = getTeachersByDepartment(department.code);
    
    if (teachersInDept.length > 0) {
      const teacherNames = teachersInDept.map(t => t.fullName).join(', ');
      if (!window.confirm(
        `This department has ${teachersInDept.length} teacher(s) assigned:\n${teacherNames}\n\n` +
        `Are you sure you want to delete ${department.name}? All teachers will be unassigned.`
      )) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete ${department.name}?`)) {
        return;
      }
    }
    
    const updatedDepartments = departments.filter(dept => dept._id !== department._id);
    setDepartments(updatedDepartments);
    setSuccessMessage(`${department.name} deleted successfully!`);
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Add Section
  const handleAddSection = () => {
    const newSection = {
      _id: Date.now().toString(),
      ...sectionForm,
      createdAt: new Date().toISOString()
    };
    
    const updatedDepartments = departments.map(dept =>
      dept._id === selectedDepartment._id
        ? { ...dept, sections: [...(dept.sections || []), newSection] }
        : dept
    );
    
    setDepartments(updatedDepartments);
    setSuccessMessage('Section added successfully!');
    closeSectionModal();
  };

  // Delete Section
  const handleDeleteSection = (departmentId, sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }
    
    const updatedDepartments = departments.map(dept =>
      dept._id === departmentId
        ? { ...dept, sections: dept.sections.filter(s => s._id !== sectionId) }
        : dept
    );
    
    setDepartments(updatedDepartments);
    setSuccessMessage('Section deleted successfully!');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Assign Teacher to Department (Update teacher's department field)
  const handleAssignTeacher = async () => {
    if (!assignTeacherForm.teacherId) {
      setError('Please select a teacher');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update teacher's department via backend
      // This endpoint might need to be created
      const response = await axios.put(
        `${API_BASE_URL}/users/${assignTeacherForm.teacherId}`,
        { department: assignTeacherForm.departmentCode }
      );
      
      if (response.data.success) {
        // Refresh teachers list
        await fetchTeachers();
        setSuccessMessage('Teacher assigned to department successfully!');
        closeAssignTeacherModal();
      }
    } catch (err) {
      console.error('Error assigning teacher:', err);
      // Fallback: Update locally if backend fails
      const updatedTeachers = teachers.map(teacher =>
        teacher._id === assignTeacherForm.teacherId
          ? { ...teacher, department: assignTeacherForm.departmentCode }
          : teacher
      );
      setTeachers(updatedTeachers);
      setSuccessMessage('Teacher assigned locally! (Backend sync pending)');
      closeAssignTeacherModal();
    } finally {
      setLoading(false);
    }
  };

  // Remove Teacher from Department
  const handleRemoveTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to remove this teacher from the department?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Update teacher's department to empty via backend
      const response = await axios.put(
        `${API_BASE_URL}/users/${teacherId}`,
        { department: '' }
      );
      
      if (response.data.success) {
        await fetchTeachers();
        setSuccessMessage('Teacher removed from department successfully!');
      }
    } catch (err) {
      console.error('Error removing teacher:', err);
      // Fallback: Update locally
      const updatedTeachers = teachers.map(teacher =>
        teacher._id === teacherId
          ? { ...teacher, department: '' }
          : teacher
      );
      setTeachers(updatedTeachers);
      setSuccessMessage('Teacher removed locally! (Backend sync pending)');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get Status Badge
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
  };

  // Get Verification Badge
  const getVerificationBadge = (verified) => {
    if (verified) {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Verified</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Success/Error Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Department & Section Management</h1>
          <p className="text-gray-600 mt-1">
            Manage departments, sections, and faculty assignments
            <span className="text-blue-600 font-medium ml-2">
              ({teachers.length} teachers loaded)
            </span>
          </p>
        </div>
        <button 
          className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2 font-medium shadow-sm"
          onClick={() => openDepartmentModal('add')}
        >
          <span>+</span> Add Department
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Departments</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalDepartments}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-2xl"><FcDepartment/></div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Sections</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.totalSections}</h3>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-2xl"><TbNewSection/></div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Assigned Teachers</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.assignedTeachers}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-3xl"><LiaChalkboardTeacherSolid/></div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Unassigned</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">{stats.unassignedTeachers}</h3>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-2xl"><TfiReload/></div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Active Depts</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.activeDepartments}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 text-green-400 rounded-full flex items-center justify-center text-2xl"><PiCheckFill/></div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={fetchTeachers}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
        >
          🔄 Refresh Teachers
        </button>
        
        {/* Unassigned Teachers Count */}
        {stats.unassignedTeachers > 0 && (
          <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm flex items-center gap-2">
            ⚠️ {stats.unassignedTeachers} teacher(s) need department assignment
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search departments by name, code, or head..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Departments List */}
      <div className="space-y-6">
        {loading && teachers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading data from server...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🏛️</div>
            <p className="text-gray-500 text-lg">No departments found</p>
          </div>
        ) : (
          filteredDepartments.map(department => {
            const departmentTeachers = getTeachersByDepartment(department.code);
            
            return (
              <div key={department._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Department Header */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {department.code}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{department.name}</h3>
                          <p className="text-sm text-gray-500">Code: {department.code}</p>
                        </div>
                        <div className="ml-2">
                          {getStatusBadge(department.status)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{department.description}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        <span>👤 Head: {department.head}</span>
                        <span>📅 Est: {department.established}</span>
                        <span>📚 Sections: {department.sections?.length || 0}</span>
                        <span className="font-medium text-blue-600">
                          👨‍🏫 Teachers: {departmentTeachers.length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAssignTeacherModal(department)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        + Assign Teacher
                      </button>
                      <button
                        onClick={() => openSectionModal(department)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                      >
                        + Add Section
                      </button>
                      <button
                        onClick={() => openDepartmentModal('edit', department)}
                        className="p-2 text-blue-600 text-2xl hover:bg-blue-50 rounded-lg transition"
                        title="Edit Department"
                      >
                        <MdEdit/>
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department)}
                        className="p-2 text-red-600 text-2xl hover:bg-red-50 rounded-lg transition"
                        title="Delete Department"
                      >
                        <RiDeleteBin6Line/>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sections & Teachers Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sections */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span>📚</span> Sections
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                          {department.sections?.length || 0}
                        </span>
                      </h4>
                      
                      {department.sections && department.sections.length > 0 ? (
                        <div className="space-y-3">
                          {department.sections.map(section => (
                            <div key={section._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-800">{section.name}</h5>
                                  <div className="text-sm text-gray-500 mt-1 space-y-1">
                                    <p>📊 Capacity: {section.capacity} students</p>
                                    <p>📅 Semester: {section.semester}</p>
                                    <p>👤 Coordinator: {section.coordinator || 'Not assigned'}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteSection(department._id, section._id)}
                                  className="p-1 text-red-500 text-2xl hover:bg-red-50 rounded transition"
                                  title="Delete Section"
                                >
                                  <RiDeleteBin6Line/>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-gray-400 text-sm">No sections added yet</p>
                        </div>
                      )}
                    </div>

                    {/* Teachers */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span>👨‍🏫</span> Assigned Teachers
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {departmentTeachers.length}
                        </span>
                      </h4>
                      
                      {departmentTeachers.length > 0 ? (
                        <div className="space-y-3">
                          {departmentTeachers.map(teacher => (
                            <div key={teacher._id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                  {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {teacher.fullName}
                                    {teacher.shortName && (
                                      <span className="text-gray-500 text-xs ml-1">({teacher.shortName})</span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-gray-500">{teacher.email}</p>
                                    {getVerificationBadge(teacher.verified)}
                                  </div>
                                  {teacher.teacherId && (
                                    <p className="text-xs text-gray-400">ID: {teacher.teacherId}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveTeacher(teacher._id)}
                                className="px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg transition text-sm border border-red-200"
                                title="Remove from department"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-gray-400 text-sm">No teachers assigned yet</p>
                          <button
                            onClick={() => openAssignTeacherModal(department)}
                            className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800"
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

      {/* Department Modal (Add/Edit) */}
      {showDepartmentModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDepartmentModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalType === 'add' ? 'Add New Department' : 'Edit Department'}
              </h2>
              <button 
                onClick={closeDepartmentModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={departmentForm.name}
                    onChange={handleDepartmentInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={departmentForm.code}
                    onChange={handleDepartmentInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., CSE"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={departmentForm.description}
                  onChange={handleDepartmentInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Department description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head
                  </label>
                  <input
                    type="text"
                    name="head"
                    value={departmentForm.head}
                    onChange={handleDepartmentInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Dr. John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Established Year
                  </label>
                  <input
                    type="text"
                    name="established"
                    value={departmentForm.established}
                    onChange={handleDepartmentInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 2010"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={departmentForm.status}
                  onChange={handleDepartmentInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button 
                className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                onClick={closeDepartmentModal}
              >
                Cancel
              </button>
              {modalType === 'add' ? (
                <button 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={handleAddDepartment}
                >
                  Add Department
                </button>
              ) : (
                <button 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={handleEditDepartment}
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeSectionModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Add Section to {selectedDepartment?.name}
              </h2>
              <button 
                onClick={closeSectionModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={sectionForm.name}
                  onChange={handleSectionInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Section A"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={sectionForm.capacity}
                  onChange={handleSectionInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  name="semester"
                  value={sectionForm.semester}
                  onChange={handleSectionInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Coordinator
                </label>
                <input
                  type="text"
                  name="coordinator"
                  value={sectionForm.coordinator}
                  onChange={handleSectionInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Prof. John Smith"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button 
                className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                onClick={closeSectionModal}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                onClick={handleAddSection}
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignTeacherModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeAssignTeacherModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Assign Teacher to {selectedDepartment?.name} ({selectedDepartment?.code})
              </h2>
              <button 
                onClick={closeAssignTeacherModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Teacher *
                </label>
                <select
                  name="teacherId"
                  value={assignTeacherForm.teacherId}
                  onChange={handleAssignTeacherInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Choose a teacher...</option>
                  {/* Show unassigned teachers first */}
                  {getUnassignedTeachers().length > 0 && (
                    <optgroup label="Unassigned Teachers">
                      {getUnassignedTeachers().map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName} {teacher.shortName ? `(${teacher.shortName})` : ''} - {teacher.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {/* Show teachers from other departments */}
                  {teachers.filter(t => t.department && t.department !== selectedDepartment?.code).length > 0 && (
                    <optgroup label="Teachers from Other Departments">
                      {teachers
                        .filter(t => t.department && t.department !== selectedDepartment?.code)
                        .map(teacher => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.fullName} [{teacher.department}] - {teacher.email}
                          </option>
                        ))
                      }
                    </optgroup>
                  )}
                </select>
                {teachers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No teachers available. Please add teachers first.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={assignTeacherForm.role}
                  onChange={handleAssignTeacherInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="member">Member</option>
                  <option value="coordinator">Section Coordinator</option>
                  <option value="head">Department Head</option>
                  <option value="advisor">Academic Advisor</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button 
                className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                onClick={closeAssignTeacherModal}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                onClick={handleAssignTeacher}
                disabled={loading}
              >
                {loading ? 'Assigning...' : 'Assign Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;