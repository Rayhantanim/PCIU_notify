import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Dialog, DialogContent } from "@mui/material";
import noticeImg from "../assets/notice.png";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import Swal from 'sweetalert2';
import { useTheme } from "../Context/ThemeContext";


export default function StaffNotice() {
  const { isDarkMode } = useTheme();
  const API = "https://pciunotifybackend.onrender.com";
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [myNotices, setMyNotices] = useState([]);
  const [otherNotices, setOtherNotices] = useState([]);
  const [activeTab, setActiveTab] = useState("my");
  const [editingNotice, setEditingNotice] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    audience: [],
    expiryDate: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    audience: [],
    priority: "medium",
    isPinned: false,
    expiryDate: "",
    createdBy: "staff",
  });

  // Get logged-in staff info
  const fullName = localStorage.getItem("fullName") || "staff";

  // Fetch notices
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch(`${API}/api/notices`);
      const data = await res.json();
      setNotices(data);

      // Separate my notices and others
      const myNoticesList = data.filter((notice) => {
        if (!notice.createdBy) return false;
        const createdByLower = notice.createdBy.toLowerCase().trim();
        const fullNameLower = fullName.toLowerCase().trim();
        
        if (createdByLower === fullNameLower) return true;
        
        const nameParts = fullNameLower.split(" ");
        if (nameParts.length === 2) {
          const reversedName = `${nameParts[1]} ${nameParts[0]}`;
          if (createdByLower === reversedName) return true;
        }
        
        // Staff notices have createdBy as "staff"
        if (createdByLower === "staff") return true;
        
        return false;
      });

      const otherNoticesList = data.filter(
        (notice) => !myNoticesList.find((my) => my._id === notice._id)
      );

      setMyNotices(myNoticesList);
      setOtherNotices(otherNoticesList);
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "audience") {
      let updated = [...formData.audience];
      if (checked) updated.push(value);
      else updated = updated.filter((item) => item !== value);
      setFormData({ ...formData, audience: updated });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/add-noticestaff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create notice");
        return;
      }

      toast.success("Notice created successfully!");

      // Refresh notices
      fetchNotices();

      setFormData({
        title: "",
        description: "",
        category: "",
        audience: [],
        priority: "medium",
        isPinned: false,
        expiryDate: "",
        createdBy: "staff",
      });
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // Delete notice
  const handleDelete = async (noticeId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API}/api/notice/${noticeId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Deleted!", "Your notice has been deleted.", "success");
          setMyNotices(myNotices.filter((notice) => notice._id !== noticeId));
          setNotices(notices.filter((notice) => notice._id !== noticeId));
        } else {
          toast.error("Failed to delete notice");
        }
      } catch (err) {
        toast.error("Error deleting notice");
      }
    }
  };

  // Edit notice
  const handleEditClick = (notice) => {
    setEditingNotice(notice._id);
    setEditForm({
      title: notice.title || "",
      description: notice.description || "",
      category: notice.category || "",
      priority: notice.priority || "medium",
      audience: notice.audience || [],
      expiryDate: notice.expiryDate ? notice.expiryDate.split("T")[0] : "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "audience") {
      let updated = [...editForm.audience];
      if (checked) updated.push(value);
      else updated = updated.filter((item) => item !== value);
      setEditForm({ ...editForm, audience: updated });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleSaveEdit = async (noticeId) => {
    try {
      const res = await fetch(`${API}/api/notice/${noticeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Updated!", "Notice updated successfully!", "success");
        
        const updatedNotice = data.notice || data;
        setMyNotices(myNotices.map(n => n._id === noticeId ? updatedNotice : n));
        setNotices(notices.map(n => n._id === noticeId ? updatedNotice : n));
        setEditingNotice(null);
      } else {
        toast.error(data.message || "Failed to update notice");
      }
    } catch (err) {
      toast.error("Error updating notice");
    }
  };

  const handleCancelEdit = () => setEditingNotice(null);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return isDarkMode ? "bg-red-600" : "bg-red-500";
      case "high": return isDarkMode ? "bg-orange-600" : "bg-orange-500";
      case "medium": return isDarkMode ? "bg-yellow-600" : "bg-yellow-500";
      case "low": return isDarkMode ? "bg-green-600" : "bg-green-500";
      default: return isDarkMode ? "bg-gray-600" : "bg-gray-500";
    }
  };

  // Notice Card Component
  const NoticeCard = ({ notice, showActions = false }) => (
    <div className={`w-full border-2 rounded-xl p-4 my-3 hover:shadow-lg transition ${
      isDarkMode 
        ? 'border-blue-700 bg-gray-800 hover:shadow-gray-900/50' 
        : 'border-[#062359] bg-white hover:shadow-blue-200'
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-start sm:items-center gap-4 flex-1 w-full">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 sm:mt-0 ${getPriorityColor(notice.priority)}`}></span>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                "{notice.title}"
              </p>
              {notice.isPinned && <span className="text-sm text-red-600">📌</span>}
              {notice.priority && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {notice.priority}
                </span>
              )}
            </div>
            <div className={`flex flex-wrap items-center gap-4 mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>📅 {formatDate(notice.createdAt)}</span>
              <span>📂 {notice.category}</span>
              {notice.audience && notice.audience.length > 0 && (
                <span className="flex items-center gap-1"><IoPeopleSharp/> {notice.audience.join(", ")}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-0 sm:ml-4">
          <div className="flex items-center gap-2 text-sm">
            <img className="w-8 h-8 rounded-full object-cover" src={noticeImg} alt="" />
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{notice.createdBy || "Unknown"}</p>
          </div>
        </div>
      </div>

      {notice.description && (
        <p className={`text-sm mt-3 ml-0 sm:ml-11 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {notice.description.replace(/<[^>]*>/g, "").substring(0, 150)}
          {notice.description.replace(/<[^>]*>/g, "").length > 150 ? "..." : ""}
        </p>
      )}

      {showActions && (
        <div className={`flex justify-end gap-2 mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => handleEditClick(notice)}
            className={`px-4 py-1.5 text-xl rounded-lg transition flex items-center gap-1 ${
              isDarkMode 
                ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <MdEdit />
          </button>
          <button
            onClick={() => handleDelete(notice._id)}
            className={`px-4 text-xl py-1.5 rounded-lg transition flex items-center gap-1 ${
              isDarkMode 
                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <RiDeleteBin6Line />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 p-6 mb-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Staff Notice Management</h1>
            <p className="text-blue-100 text-sm sm:text-base">Create and manage important announcements for students and teachers</p>
          </div>
        </div>

        {/* Add New Notice Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleClickOpen}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>ADD New Notice</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-lg transition ${
              activeTab === "my"
                ? "bg-blue-600 text-white shadow-lg"
                : isDarkMode
                  ? "bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-blue-500"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300"
            }`}
          >
            My Notices ({myNotices.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-lg transition ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-lg"
                : isDarkMode
                  ? "bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-blue-500"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300"
            }`}
          >
            All Notices ({notices.length})
          </button>
        </div>

        {/* My Notices Tab */}
        {activeTab === "my" && (
          <div className={`rounded-xl shadow-lg p-4 sm:p-6 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  My Notices
                </h1>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  You can edit or delete only your own notices
                </p>
              </div>
            </div>

            {myNotices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📝</div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  You haven't created any notices yet
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Click "ADD New Notice" to create one
                </p>
              </div>
            ) : (
              myNotices.map((notice) => (
                <div key={notice._id}>
                  {editingNotice === notice._id ? (
                    <div className={`border-2 border-blue-500 rounded-xl p-4 sm:p-6 my-4 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                    }`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Edit Notice
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={editForm.title}
                            onChange={handleEditChange}
                            className={`w-full border rounded-lg p-2 focus:border-blue-500 focus:outline-none ${
                              isDarkMode 
                                ? 'bg-gray-800 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={editForm.description.replace(/<[^>]*>/g, "")}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows="4"
                            className={`w-full border rounded-lg p-2 focus:border-blue-500 focus:outline-none ${
                              isDarkMode 
                                ? 'bg-gray-800 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Category
                            </label>
                            <select
                              name="category"
                              value={editForm.category}
                              onChange={handleEditChange}
                              className={`w-full border rounded-lg p-2 focus:border-blue-500 focus:outline-none ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="">Select Category</option>
                              <option value="general">General</option>
                              <option value="academic">Academic</option>
                              <option value="exam">Exam</option>
                              <option value="event">Event</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Priority
                            </label>
                            <select
                              name="priority"
                              value={editForm.priority}
                              onChange={handleEditChange}
                              className={`w-full border rounded-lg p-2 focus:border-blue-500 focus:outline-none ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Audience
                          </label>
                          <div className="flex gap-4">
                            {["students", "teachers"].map((a) => (
                              <label key={a} className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="audience"
                                  value={a}
                                  checked={editForm.audience.includes(a)}
                                  onChange={handleEditChange}
                                  className="rounded border-gray-300"
                                />
                                <span className={`capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{a}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            name="expiryDate"
                            value={editForm.expiryDate}
                            onChange={handleEditChange}
                            className={`w-full border rounded-lg p-2 focus:border-blue-500 focus:outline-none ${
                              isDarkMode 
                                ? 'bg-gray-800 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button
                            onClick={() => handleSaveEdit(notice._id)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className={`px-6 py-2 rounded-lg transition font-medium ${
                              isDarkMode 
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <NoticeCard notice={notice} showActions={true} />
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* All Notices Tab */}
        {activeTab === "all" && (
          <div className={`rounded-xl shadow-lg p-4 sm:p-6 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border'
          }`}>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              All Notices
            </h1>

            {notices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No notices found
                </p>
              </div>
            ) : (
              notices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  showActions={
                    myNotices.some((my) => my._id === notice._id) &&
                    editingNotice !== notice._id
                  }
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Dialog Form - Custom styled for dark mode */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            borderRadius: '1rem',
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Staff Create Notice
            </h2>

            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select Category</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="exam">Exam</option>
              <option value="event">Event</option>
              <option value="urgent">Urgent</option>
            </select>

            <div>
              <p className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Audience
              </p>
              <div className="flex flex-wrap gap-4">
                {["students", "teachers"].map((a) => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="audience"
                      value={a}
                      checked={formData.audience.includes(a)}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span className={`capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {a}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Pin Notice
              </span>
            </label>

            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleClose}
                className={`flex-1 py-2 rounded-lg transition font-medium ${
                  isDarkMode 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}