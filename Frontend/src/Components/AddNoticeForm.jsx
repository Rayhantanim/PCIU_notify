import React, { useState } from "react";
import { toast } from "react-toastify";

export default function NoticeForm ({ handleClose, user }) {
    const initialState = {
  title: "",
  description: "",
  category: "",
  audience: [],
  department: "",
  section: "",
  priority: "medium",
  isPinned: false,
  expiryDate: "",
  attachment: null,
  
};
 const [formData, setFormData] = useState(initialState);
 

  const departments = ["CSE", "EEE", "BBA"];
  const sectionsByDepartment = {
    CSE: ["31A", "31B"],
    EEE: ["A", "B"],
    BBA: ["A"],
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "audience") {
      let updated = [...formData.audience];
      if (checked) updated.push(value);
      else updated = updated.filter((item) => item !== value);

      setFormData({ ...formData, audience: updated });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, attachment: e.target.files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

const API = "http://localhost:5000";

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${API}/api/add-notice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }
toast.success("Notice crated Successfully 🎉");
    console.log("Saved:", data);

    e.target.reset();
    setFormData(initialState);
    handleClose();

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};



  const showDeptSection = !formData.audience.includes("all");

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-4"
    >
      <h2 className="text-xl font-bold">Create Notice</h2>

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

      {/* Audience */}
      <div>
        <p className="font-medium">Audience</p>
        {["students", "teachers", "staff", "all"].map((a) => (
          <label key={a} className="mr-4">
            <input
              type="checkbox"
              name="audience"
              value={a}
              onChange={handleChange}
            />{" "}
            {a}
          </label>
        ))}
      </div>

      {/* Department & Section */}
      {showDeptSection && (
        <>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Department</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <select
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Section</option>
            {(sectionsByDepartment[formData.department] || []).map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </>
      )}

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

      {/* Attachment */}
      <input
        type="file"
        name="attachment"
        onChange={handleChange}
        className="w-full"
      />

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}