import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { FaEye, FaPlus, FaFilter, FaTimes, FaCheck, FaTrash, FaMapPin } from "react-icons/fa";
import Swal from 'sweetalert2';
import { useTheme } from '../Context/ThemeContext';

const API_BASE_URL = 'https://pciunotifybackend.onrender.com/api';

const NoticeManagement = () => {
  const { isDarkMode } = useTheme();
  
  // State Management
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafted: 0,
    expired: 0,
    pinned: 0
  });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    audience: ['all'],
    department: '',
    section: '',
    priority: 'normal',
    isPinned: false,
    expiryDate: '',
    status: 'published'
  });

  const categories = ['General', 'Academic', 'Administrative', 'Event', 'Emergency', 'Exam', 'Holiday'];
  const audiences = ['all', 'students', 'teachers', 'staff'];
  const priorities = ['low', 'normal', 'high', 'urgent'];

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notices`, {
        headers: { 'user-role': 'admin' }
      });
      
      if (response.data) {
        setNotices(response.data);
        setFilteredNotices(response.data);
        updateStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch notices',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (noticesData) => {
    const now = new Date();
    setStats({
      total: noticesData.length,
      published: noticesData.filter(n => n.status === 'published' || !n.status).length,
      drafted: noticesData.filter(n => n.status === 'draft').length,
      expired: noticesData.filter(n => n.expiryDate && new Date(n.expiryDate) < now).length,
      pinned: noticesData.filter(n => n.isPinned).length
    });
  };

  useEffect(() => {
    let result = [...notices];

    if (searchTerm) {
      result = result.filter(notice =>
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(notice => notice.category === categoryFilter);
    }

    if (audienceFilter !== 'all') {
      result = result.filter(notice => {
        const audiences = Array.isArray(notice.audience) ? notice.audience : [notice.audience];
        return audiences.includes(audienceFilter) || audiences.includes('all');
      });
    }

    if (priorityFilter !== 'all') {
      result = result.filter(notice => notice.priority === priorityFilter);
    }

    if (statusFilter !== 'all') {
      const now = new Date();
      result = result.filter(notice => {
        if (statusFilter === 'published') return notice.status !== 'draft';
        if (statusFilter === 'draft') return notice.status === 'draft';
        if (statusFilter === 'expired') return notice.expiryDate && new Date(notice.expiryDate) < now;
        if (statusFilter === 'pinned') return notice.isPinned;
        return true;
      });
    }

    result.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (sortField === 'createdAt' || sortField === 'expiryDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
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

    setFilteredNotices(result);
  }, [notices, searchTerm, categoryFilter, audienceFilter, priorityFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'audience') {
        let updatedAudience = [...formData.audience];
        if (value === 'all') {
          updatedAudience = checked ? ['all'] : [];
        } else {
          updatedAudience = updatedAudience.filter(a => a !== 'all');
          if (checked) {
            updatedAudience.push(value);
          } else {
            updatedAudience = updatedAudience.filter(a => a !== value);
          }
        }
        setFormData({ ...formData, [name]: updatedAudience.length ? updatedAudience : ['all'] });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModal = (type, notice = null) => {
    setModalType(type);
    
    if (notice) {
      setSelectedNotice(notice);
      setFormData({
        title: notice.title || '',
        description: notice.description || '',
        category: notice.category || 'General',
        audience: Array.isArray(notice.audience) ? notice.audience : [notice.audience || 'all'],
        department: notice.department || '',
        section: notice.section || '',
        priority: notice.priority || 'normal',
        isPinned: notice.isPinned || false,
        expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split('T')[0] : '',
        status: notice.status || 'published'
      });
    } else {
      setSelectedNotice(null);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        audience: ['all'],
        department: '',
        section: '',
        priority: 'normal',
        isPinned: false,
        expiryDate: '',
        status: 'published'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotice(null);
  };

  const handleAddNotice = async () => {
    if (!formData.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter a title for the notice',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    setLoading(true);
    try {
      const noticeData = {
        ...formData,
        createdBy: localStorage.getItem('fullName') || 'Admin',
        role: 'admin'
      };

      const response = await axios.post(`${API_BASE_URL}/add-notice`, noticeData);
      
      if (response.data.success || response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Notice created successfully!',
          timer: 2000,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        });
        fetchNotices();
        closeModal();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to create notice',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotice = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/notice/${selectedNotice._id}`, formData);
      
      if (response.data.success || response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Notice updated successfully!',
          timer: 2000,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        });
        fetchNotices();
        closeModal();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to update notice',
        background: isDarkMode ? '#1f2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async () => {
    Swal.fire({
      title: 'Delete Notice',
      text: `Are you sure you want to delete "${selectedNotice.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await axios.delete(`${API_BASE_URL}/notice/${selectedNotice._id}`);
          
          if (response.data.success || response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Notice has been deleted.',
              timer: 2000,
              showConfirmButton: false,
              background: isDarkMode ? '#1f2937' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            });
            fetchNotices();
            closeModal();
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.response?.data?.message || 'Failed to delete notice',
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleTogglePin = async (notice) => {
    Swal.fire({
      title: notice.isPinned ? 'Unpin Notice' : 'Pin Notice',
      text: `Are you sure you want to ${notice.isPinned ? 'unpin' : 'pin'} "${notice.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${notice.isPinned ? 'unpin' : 'pin'} it!`,
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(`${API_BASE_URL}/notice/${notice._id}`, {
            isPinned: !notice.isPinned
          });
          
          if (response.data.success || response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: notice.isPinned ? 'Unpinned!' : 'Pinned!',
              text: `Notice has been ${notice.isPinned ? 'unpinned' : 'pinned'}.`,
              timer: 1500,
              showConfirmButton: false,
              background: isDarkMode ? '#1f2937' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            });
            fetchNotices();
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to toggle pin status',
            background: isDarkMode ? '#1f2937' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
          });
        }
      }
    });
  };

  const getStatusBadge = (notice) => {
    const now = new Date();
    if (notice.status === 'draft') {
      return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>📝 Draft</span>;
    }
    if (notice.expiryDate && new Date(notice.expiryDate) < now) {
      return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>⏰ Expired</span>;
    }
    if (notice.isPinned) {
      return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>📌 Pinned</span>;
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>✅ Published</span>;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800',
      normal: isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
      high: isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800',
      urgent: isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[priority] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'General': '📢',
      'Academic': '📚',
      'Administrative': '⚙️',
      'Event': '🎉',
      'Emergency': '🚨',
      'Exam': '📝',
      'Holiday': '🎊'
    };
    return icons[category] || '📋';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`rounded-xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    } border shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Notice Management</h1>
            <p className="text-blue-100 text-sm sm:text-base">Create, edit, and manage all notices</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Notices" value={stats.total} icon="📋" color="text-blue-600 dark:text-blue-400" />
          <StatCard title="Published" value={stats.published} icon="✅" color="text-green-600 dark:text-green-400" />
          <StatCard title="Drafts" value={stats.drafted} icon="📝" color="text-gray-600 dark:text-gray-400" />
          <StatCard title="Expired" value={stats.expired} icon="⏰" color="text-red-600 dark:text-red-400" />
          <StatCard title="Pinned" value={stats.pinned} icon="📌" color="text-yellow-600 dark:text-yellow-400" />
        </div>

        {/* Create Notice Button - Mobile */}
        <div className="mb-4 lg:hidden">
          <button 
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 font-medium shadow-sm"
            onClick={() => openModal('add')}
          >
            <FaPlus /> Create Notice
          </button>
        </div>

        {/* Filters Section */}
        <div className={`rounded-xl shadow-sm mb-6 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>🔍</span>
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:ring-2 focus:border-transparent`}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-lg transition flex items-center gap-2 font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter /> Filters
                {(categoryFilter !== 'all' || audienceFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all') && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Audience</label>
                  <select 
                    value={audienceFilter} 
                    onChange={(e) => setAudienceFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Audiences</option>
                    <option value="students">Students</option>
                    <option value="teachers">Teachers</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
                  <select 
                    value={priorityFilter} 
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Priorities</option>
                    {priorities.map(pri => <option key={pri} value={pri}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="expired">Expired</option>
                    <option value="pinned">Pinned</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setAudienceFilter('all');
                    setPriorityFilter('all');
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className={`text-sm px-3 py-1 rounded-lg transition ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && filteredNotices.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading notices...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No notices found</p>
            </div>
          ) : (
            filteredNotices.map(notice => (
              <div 
                key={notice._id} 
                className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } ${notice.isPinned ? 'border-l-4 border-yellow-500' : ''}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{getCategoryIcon(notice.category)}</span>
                      <h3 className={`font-semibold line-clamp-2 flex-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {notice.title}
                      </h3>
                    </div>
                    {notice.isPinned && <span className="text-yellow-500 text-lg">📌</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getStatusBadge(notice)}
                    {getPriorityBadge(notice.priority)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {notice.category}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-4 line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notice.description?.replace(/<[^>]*>/g, '').substring(0, 150)}
                    {notice.description?.length > 150 ? '...' : ''}
                  </p>
                  
                  <div className={`space-y-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>
                        {Array.isArray(notice.audience) 
                          ? notice.audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
                          : notice.audience?.charAt(0).toUpperCase() + notice.audience?.slice(1)
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(notice.createdAt)}</span>
                    </div>
                    {notice.expiryDate && (
                      <div className="flex items-center gap-2">
                        <span>⏰</span>
                        <span className={new Date(notice.expiryDate) < new Date() ? (isDarkMode ? 'text-red-400' : 'text-red-500') : ''}>
                          Expires: {formatDate(notice.expiryDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={`px-5 py-3 border-t flex justify-between items-center ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
                }`}>
                  <button
                    onClick={() => openModal('view', notice)}
                    className={`text-sm font-medium transition ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    <FaEye className="inline mr-1" /> View Details
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePin(notice)}
                      className={`p-2 rounded-lg transition-colors ${
                        notice.isPinned 
                          ? isDarkMode ? 'text-yellow-400 hover:bg-yellow-900/30' : 'text-yellow-600 hover:bg-yellow-50'
                          : isDarkMode ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={notice.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <FaMapPin />
                    </button>
                    <button
                      onClick={() => openModal('edit', notice)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Edit"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => openModal('delete', notice)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className={`rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center p-6 border-b sticky top-0 ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {modalType === 'add' && 'Create New Notice'}
                {modalType === 'edit' && 'Edit Notice'}
                {modalType === 'view' && 'Notice Details'}
                {modalType === 'delete' && 'Delete Notice'}
              </h2>
              <button 
                onClick={closeModal}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {/* View Mode */}
              {modalType === 'view' && selectedNotice && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCategoryIcon(selectedNotice.category)}</span>
                    <div>
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {selectedNotice.title}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(selectedNotice)}
                        {getPriorityBadge(selectedNotice.priority)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {selectedNotice.description}
                    </p>
                  </div>
                  
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</p>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {selectedNotice.category}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Audience</p>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {Array.isArray(selectedNotice.audience) 
                          ? selectedNotice.audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
                          : selectedNotice.audience?.charAt(0).toUpperCase() + selectedNotice.audience?.slice(1)
                        }
                      </p>
                    </div>
                    {selectedNotice.department && (
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Department</p>
                        <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {selectedNotice.department}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created</p>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {formatDate(selectedNotice.createdAt)}
                      </p>
                    </div>
                    {selectedNotice.expiryDate && (
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expires</p>
                        <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {formatDate(selectedNotice.expiryDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add/Edit Form */}
              {(modalType === 'add' || modalType === 'edit') && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      } border focus:ring-2 focus:border-transparent`}
                      placeholder="Enter notice title"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      } border focus:ring-2 focus:border-transparent`}
                      placeholder="Enter notice description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-blue-500`}
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Priority *
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-blue-500`}
                      >
                        {priorities.map(pri => <option key={pri} value={pri}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Audience *
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {audiences.map(aud => (
                        <label key={aud} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="audience"
                            value={aud}
                            checked={formData.audience.includes(aud)}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {aud === 'all' ? 'All Users' : aud.charAt(0).toUpperCase() + aud.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPinned"
                      checked={formData.isPinned}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      📌 Pin this notice (appears at top)
                    </span>
                  </label>
                </div>
              )}

              {/* Delete Confirmation */}
              {modalType === 'delete' && selectedNotice && (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Delete Notice
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Are you sure you want to delete this notice?
                  </p>
                  <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    "{selectedNotice.title}"
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    This action cannot be undone.
                  </p>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <button 
                className={`px-6 py-2.5 rounded-lg transition duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
                onClick={closeModal}
              >
                {modalType === 'view' ? 'Close' : 'Cancel'}
              </button>
              
              {modalType === 'add' && (
                <button 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                  onClick={handleAddNotice}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <FaCheck /> Create Notice
                </button>
              )}
              
              {modalType === 'edit' && (
                <button 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                  onClick={handleEditNotice}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <FaCheck /> Save Changes
                </button>
              )}
              
              {modalType === 'delete' && (
                <button 
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center gap-2"
                  onClick={handleDeleteNotice}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <FaTrash /> Delete Notice
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;