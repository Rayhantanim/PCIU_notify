import React, { useEffect, useState } from "react";
import noticeImg from "../assets/notice.png";
import { toast } from "react-toastify";

const AllNotices = () => {
  const [notices, setNotices] = useState([]);
  const [myNotices, setMyNotices] = useState([]);
  const [otherNotices, setOtherNotices] = useState([]);
  const [editingNotice, setEditingNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("my"); // "my" or "all"
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    audience: [],
    department: "",
    section: "",
    expiryDate: "",
  });
  const API = "http://localhost:5000";

  // Get logged-in user info
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const fullName = localStorage.getItem("fullName") || `${firstName} ${lastName}`;

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
        if (!notice.createdBy || !fullName) return false;
        const createdByLower = notice.createdBy.toLowerCase().trim();
        const fullNameLower = fullName.toLowerCase().trim();

        // Direct match
        if (createdByLower === fullNameLower) return true;

        // Reversed name match
        const nameParts = fullNameLower.split(" ");
        if (nameParts.length === 2) {
          const reversedName = `${nameParts[1]} ${nameParts[0]}`;
          if (createdByLower === reversedName) return true;
        }

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

 // In handleDelete
const handleDelete = async (noticeId) => {
  console.log("Attempting to delete notice ID:", noticeId);
  console.log("Full notice ID:", JSON.stringify(noticeId));
  
  if (!window.confirm("Are you sure you want to delete this notice?")) return;

  try {
    const res = await fetch(`${API}/api/notice/${noticeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log("Delete response:", data);

    if (res.ok) {
      toast.success("Notice deleted successfully!");
      setMyNotices(myNotices.filter((notice) => notice._id !== noticeId));
      setNotices(notices.filter((notice) => notice._id !== noticeId));
    } else {
      toast.error(data.message || "Failed to delete notice");
    }
  } catch (err) {
    console.error("Error deleting notice:", err);
    toast.error("Error deleting notice: " + err.message);
  }
};

// In handleSaveEdit
const handleSaveEdit = async (noticeId) => {
  console.log("Updating notice ID:", noticeId);
  console.log("Edit form data:", editForm);
  
  try {
    const res = await fetch(`${API}/api/notice/${noticeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
    });

    const data = await res.json();
    console.log("Update response:", data);

    if (res.ok) {
      toast.success("Notice updated successfully!");
      
      const updatedNotice = data.notice || data;
      
      setMyNotices(
        myNotices.map((notice) =>
          notice._id === noticeId ? updatedNotice : notice
        )
      );

      setNotices(
        notices.map((notice) =>
          notice._id === noticeId ? updatedNotice : notice
        )
      );

      setEditingNotice(null);
    } else {
      toast.error(data.message || "Failed to update notice");
    }
  } catch (err) {
    console.error("Error updating notice:", err);
    toast.error("Error updating notice: " + err.message);
  }
};

  // Open edit modal
  const handleEditClick = (notice) => {
    setEditingNotice(notice._id);
    setEditForm({
      title: notice.title || "",
      description: notice.description || "",
      category: notice.category || "",
      priority: notice.priority || "medium",
      audience: notice.audience || [],
      department: notice.department || "",
      section: notice.section || "",
      expiryDate: notice.expiryDate ? notice.expiryDate.split("T")[0] : "",
    });
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "audience") {
      let updated = [...editForm.audience];
      if (checked) {
        updated.push(value);
      } else {
        updated = updated.filter((item) => item !== value);
      }
      setEditForm({ ...editForm, audience: updated });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingNotice(null);
  };

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
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const NoticeCard = ({ notice, showActions = false }) => (
    <div className="w-full border-2 border-[#062359] rounded-xl p-4 my-3 hover:shadow-lg transition bg-white">
      <div className="flex justify-between items-center">
        {/* Title & Creator */}
        <div className="flex items-center gap-4 flex-1">
          {/* Priority Indicator */}
          <span className={`w-3 h-3 rounded-full ${getPriorityColor(notice.priority)}`}></span>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-800">"{notice.title}"</p>
              {notice.isPinned && <span className="text-xs">📌</span>}
              {notice.priority && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 capitalize">
                  {notice.priority}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>📅 {formatDate(notice.createdAt)}</span>
              <span>📂 {notice.category}</span>
              {notice.audience && notice.audience.length > 0 && (
                <span>👥 {notice.audience.join(", ")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <img className="w-8 h-8 rounded-full" src={noticeImg} alt="" />
            <p>{notice.createdBy || "Unknown"}</p>
          </div>
        </div>
      </div>

      {/* Description Preview */}
      {notice.description && (
        <p className="text-sm text-gray-600 mt-3 ml-7 line-clamp-2">
          {notice.description.replace(/<[^>]*>/g, "").substring(0, 150)}
          {notice.description.replace(/<[^>]*>/g, "").length > 150 ? "..." : ""}
        </p>
      )}

      {/* Action Buttons - Only for my notices */}
      {showActions && (
        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => handleEditClick(notice)}
            className="px-4 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(notice._id)}
            className="px-4 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-1"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex gap-10 p-4">
      {/* Main Content */}
      <div className="w-full mx-auto max-w-6xl">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition ${
              activeTab === "my"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300"
            }`}
          >
            ✍️ My Notices ({myNotices.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300"
            }`}
          >
            📢 All Notices ({notices.length})
          </button>
        </div>

        {/* My Notices Tab */}
        {activeTab === "my" && (
          <div className="border bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              ✍️ My Notices
            </h1>

            {myNotices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">📝 You haven't created any notices yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Create a notice to see it here
                </p>
              </div>
            ) : (
              myNotices.map((notice) => (
                <div key={notice._id}>
                  {editingNotice === notice._id ? (
                    // EDIT MODE
                    <div className="border-2 border-blue-500 rounded-xl p-6 my-4 bg-blue-50">
                      <h3 className="text-lg font-semibold mb-4">Edit Notice</h3>

                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={editForm.title}
                            onChange={handleEditChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={editForm.description.replace(/<[^>]*>/g, "")}
                            onChange={(e) =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            rows="4"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Category & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <select
                              name="category"
                              value={editForm.category}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Priority
                            </label>
                            <select
                              name="priority"
                              value={editForm.priority}
                              onChange={handleEditChange}
                              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>

                        {/* Audience */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Audience
                          </label>
                          <div className="flex gap-4">
                            {["students", "teachers", "staff", "all"].map((a) => (
                              <label key={a} className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  name="audience"
                                  value={a}
                                  checked={editForm.audience.includes(a)}
                                  onChange={handleEditChange}
                                  className="rounded"
                                />
                                <span className="capitalize">{a}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Expiry Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            name="expiryDate"
                            value={editForm.expiryDate}
                            onChange={handleEditChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleSaveEdit(notice._id)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                          >
                            💾 Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
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
          <div className="border bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              📢 All Notices
            </h1>

            {notices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No notices found</p>
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
    </div>
  );
};

export default AllNotices;