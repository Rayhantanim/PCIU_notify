import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";

const API_BASE_URL = 'http://localhost:5000/api';

const NoticeManagement = () => {
  // State Management
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'delete', 'add'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
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

  // Categories and audiences
  const categories = ['General', 'Academic', 'Administrative', 'Event', 'Emergency', 'Exam', 'Holiday'];
  const audiences = ['all', 'students', 'teachers', 'staff'];
  const priorities = ['low', 'normal', 'high', 'urgent'];

  // Fetch notices on mount
  useEffect(() => {
    fetchNotices();
  }, []);

  // Fetch all notices
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
      setError('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  // Update stats
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

  // Filter and Sort Logic
  useEffect(() => {
    let result = [...notices];

    // Apply search
    if (searchTerm) {
      result = result.filter(notice =>
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(notice => notice.category === categoryFilter);
    }

    // Apply audience filter
    if (audienceFilter !== 'all') {
      result = result.filter(notice => {
        const audiences = Array.isArray(notice.audience) ? notice.audience : [notice.audience];
        return audiences.includes(audienceFilter) || audiences.includes('all');
      });
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(notice => notice.priority === priorityFilter);
    }

    // Apply status filter
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

    // Apply sorting
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

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle Form Input
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

  // Open Modal
  const openModal = (type, notice = null) => {
    setModalType(type);
    setError('');
    setSuccessMessage('');
    
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

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedNotice(null);
    setError('');
    setSuccessMessage('');
  };

  // Add Notice
  const handleAddNotice = async () => {
    try {
      setLoading(true);
      setError('');
      
      const noticeData = {
        ...formData,
        createdBy: 'Admin',
        role: 'admin'
      };

      const response = await axios.post(`${API_BASE_URL}/add-notice`, noticeData);
      
      if (response.data.success) {
        setSuccessMessage('Notice created successfully!');
        fetchNotices();
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error adding notice:', err);
      setError(err.response?.data?.message || 'Failed to create notice');
    } finally {
      setLoading(false);
    }
  };

  // Edit Notice
  const handleEditNotice = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(`${API_BASE_URL}/notice/${selectedNotice._id}`, formData);
      
      if (response.data.success) {
        setSuccessMessage('Notice updated successfully!');
        fetchNotices();
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating notice:', err);
      setError(err.response?.data?.message || 'Failed to update notice');
    } finally {
      setLoading(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.delete(`${API_BASE_URL}/notice/${selectedNotice._id}`);
      
      if (response.data.success) {
        setSuccessMessage('Notice deleted successfully!');
        fetchNotices();
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      setError(err.response?.data?.message || 'Failed to delete notice');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (notice) => {
    try {
      setLoading(true);
      
      const response = await axios.put(`${API_BASE_URL}/notice/${notice._id}`, {
        isPinned: !notice.isPinned
      });
      
      if (response.data.success) {
        setSuccessMessage(notice.isPinned ? 'Notice unpinned!' : 'Notice pinned!');
        fetchNotices();
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
      setError('Failed to toggle pin');
    } finally {
      setLoading(false);
    }
  };

  // Get Status Badge
  const getStatusBadge = (notice) => {
    const now = new Date();
    if (notice.status === 'draft') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
    }
    if (notice.expiryDate && new Date(notice.expiryDate) < now) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    }
    if (notice.isPinned) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">📌 Pinned</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Published</span>;
  };

  // Get Priority Badge
  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-blue-100 text-blue-800',
      normal: 'bg-green-100 text-green-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  // Get Category Icon
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

  // Format Date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-3xl font-bold text-gray-800">Notice Management</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage all notices</p>
        </div>
        <button 
          className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2 font-medium shadow-sm"
          onClick={() => openModal('add')}
        >
          <span>+</span> Create Notice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Total Notices</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">📋</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Published</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.published}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">✅</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Drafts</p>
              <h3 className="text-2xl font-bold text-gray-600 mt-1">{stats.drafted}</h3>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">📝</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Expired</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.expired}</h3>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-lg">⏰</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Pinned</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.pinned}</h3>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-lg">📌</div>
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
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select 
              value={audienceFilter} 
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="all">All Audiences</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
              <option value="staff">Staff</option>
            </select>
            
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="all">All Priorities</option>
              {priorities.map(pri => (
                <option key={pri} value={pri}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</option>
              ))}
            </select>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
              <option value="pinned">Pinned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && filteredNotices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notices...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No notices found</p>
          </div>
        ) : (
          filteredNotices.map(notice => (
            <div 
              key={notice._id} 
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                notice.isPinned ? 'border-l-4 border-yellow-400' : ''
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(notice.category)}</span>
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {notice.title}
                    </h3>
                  </div>
                  {notice.isPinned && <span className="text-yellow-500">📌</span>}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getStatusBadge(notice)}
                  {getPriorityBadge(notice.priority)}
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {notice.category}
                  </span>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {notice.description}
                </p>
                
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>
                      {Array.isArray(notice.audience) 
                        ? notice.audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
                        : notice.audience?.charAt(0).toUpperCase() + notice.audience?.slice(1)
                      }
                    </span>
                  </div>
                  
                  {notice.department && (
                    <div className="flex items-center gap-2">
                      <span>🏛️</span>
                      <span>{notice.department}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{formatDate(notice.createdAt)}</span>
                  </div>
                  
                  {notice.expiryDate && (
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span className={new Date(notice.expiryDate) < new Date() ? 'text-red-500' : ''}>
                        Expires: {formatDate(notice.expiryDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Card Actions */}
              <div className="px-5 py-3 border-t bg-gray-50 flex justify-between items-center">
                <button
                  onClick={() => openModal('view', notice)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePin(notice)}
                    className={`p-2 rounded-lg transition-colors ${
                      notice.isPinned 
                        ? 'text-yellow-600 hover:bg-yellow-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={notice.isPinned ? 'Unpin' : 'Pin'}
                  >
                    📌
                  </button>
                  <button
                    onClick={() => openModal('edit', notice)}
                    className="p-2 text-blue-600 text-2xl hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <MdEdit/>
                  </button>
                  <button
                    onClick={() => openModal('delete', notice)}
                    className="p-2 text-red-600 text-2xl hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <RiDeleteBin6Line/>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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
                {modalType === 'add' && 'Create New Notice'}
                {modalType === 'edit' && 'Edit Notice'}
                {modalType === 'view' && 'Notice Details'}
                {modalType === 'delete' && 'Delete Notice'}
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

              {/* View Mode */}
              {modalType === 'view' && selectedNotice && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCategoryIcon(selectedNotice.category)}</span>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedNotice.title}</h3>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(selectedNotice)}
                        {getPriorityBadge(selectedNotice.priority)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{selectedNotice.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{selectedNotice.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Audience</p>
                      <p className="font-medium">
                        {Array.isArray(selectedNotice.audience) 
                          ? selectedNotice.audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
                          : selectedNotice.audience?.charAt(0).toUpperCase() + selectedNotice.audience?.slice(1)
                        }
                      </p>
                    </div>
                    {selectedNotice.department && (
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium">{selectedNotice.department}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{formatDate(selectedNotice.createdAt)}</p>
                    </div>
                    {selectedNotice.expiryDate && (
                      <div>
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className="font-medium">{formatDate(selectedNotice.expiryDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add/Edit Form */}
              {(modalType === 'add' || modalType === 'edit') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter notice title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter notice description"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority *
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        {priorities.map(pri => (
                          <option key={pri} value={pri}>
                            {pri.charAt(0).toUpperCase() + pri.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audience *
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {audiences.map(aud => (
                        <label key={aud} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="audience"
                            value={aud}
                            checked={formData.audience.includes(aud)}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            {aud === 'all' ? 'All Users' : aud.charAt(0).toUpperCase() + aud.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPinned"
                      checked={formData.isPinned}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      📌 Pin this notice
                    </label>
                  </div>
                </div>
              )}

              {/* Delete Confirmation */}
              {modalType === 'delete' && selectedNotice && (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold mb-2">Delete Notice</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this notice?
                  </p>
                  <p className="text-lg font-medium text-gray-800 mb-2">
                    "{selectedNotice.title}"
                  </p>
                  <p className="text-red-600 text-sm">
                    This action cannot be undone.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button 
                className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
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
                  Create Notice
                </button>
              )}
              
              {modalType === 'edit' && (
                <button 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                  onClick={handleEditNotice}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  Save Changes
                </button>
              )}
              
              {modalType === 'delete' && (
                <button 
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center gap-2"
                  onClick={handleDeleteNotice}
                  disabled={loading}
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  Delete Notice
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