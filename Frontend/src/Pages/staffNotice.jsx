import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Dialog, DialogContent } from "@mui/material"; // make sure @mui/material is installed

export default function StaffNoticeForm() {
  const API = "https://pciu-notify-backend.vercel.app";
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState([]);
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

  // Fetch existing notices
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API}/api/notices`);
        const data = await res.json();
        setNotices(data);
      } catch (err) {
        console.error("Error fetching notices:", err);
      }
    };
    fetchNotices();
  }, []);

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
    console.log(data);

    if (!res.ok) {
      alert(data.message);
      return;
    }

    toast.success("Notice created successfully 🎉");

    // ✅ Append the actual notice object
    setNotices((prev) => [...prev, data.newNotice]);

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
    alert("Server error");
  }
};


  return (
    <div className="flex gap-10">
      {/* Notices List */}
      <div className="w-2/3 border bg-[#fde1e1] h-auto m-4 px-4">
        <h1 className="text-2xl my-4 font-bold">All Notices</h1>
        {notices.length === 0 ? (
          <p>No notices found</p>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className="w-full h-12 flex justify-between items-center px-4 border-2 border-[#062359] my-2 mx-auto rounded-4xl"
            >
              <p>“{notice?.title}”</p>
              <div className="flex justify-center items-center gap-2">
                <p>{notice.createdBy || "Unknown"}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Notice Button */}
      <div
        className="w-60 h-12 text-center font-bold py-2 bg-white border rounded cursor-pointer"
        onClick={handleClickOpen}
      >
        <p>+ ADD New Notice</p>
      </div>

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-4"
          >
            <h2 className="text-xl font-bold">Staff Create Notice</h2>

            {/* Title */}
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            {/* Description */}
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            {/* Category */}
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Select Category</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="exam">Exam</option>
              <option value="event">Event</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Audience (only students & teachers) */}
            <div>
              <p className="font-medium">Audience</p>
              {["students", "teachers"].map((a) => (
                <label key={a} className="mr-4">
                  <input
                    type="checkbox"
                    name="audience"
                    value={a}
                    checked={formData.audience.includes(a)}
                    onChange={handleChange}
                  />{" "}
                  {a}
                </label>
              ))}
            </div>

            {/* Priority */}
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Pin */}
            <label>
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
              />{" "}
              Pin Notice
            </label>

            {/* Expiry */}
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Submit
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
