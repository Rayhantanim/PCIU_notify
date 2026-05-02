import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Swal from 'sweetalert2'

export default function NoticeForm({ handleClose }) {
  const API = "http://localhost:5000";
  const editorRef = useRef(null);

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
    createdBy: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [teachers, setTeachers] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);

  const departments = ["CSE", "EEE", "BBA"];
  const sectionsByDepartment = {
    CSE: ["31A", "31B", "31C"],
    EEE: ["A", "B"],
    BBA: ["A"],
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API}/api/teachers`);
        const data = await res.json();
        setTeachers(data);
      } catch (err) {
        console.log("Teacher fetch error:", err);
      }
    };
    fetchTeachers();
  }, []);

  // Rich Text Editor Functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateDescription();
  };

  const updateDescription = () => {
    if (editorRef.current) {
      setFormData(prev => ({
        ...prev,
        description: editorRef.current.innerHTML
      }));
    }
  };

  const insertTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");
    if (!rows || !cols) return;

    let tableHTML = '<table class="w-full border-collapse border border-gray-300 my-2"><tbody>';
    for (let i = 0; i < parseInt(rows); i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < parseInt(cols); j++) {
        tableHTML += '<td class="border border-gray-300 px-3 py-2" style="min-width: 80px;">&nbsp;</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    document.execCommand('insertHTML', false, tableHTML);
    updateDescription();
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      document.execCommand('createLink', false, url);
      updateDescription();
      editorRef.current?.focus();
    }
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
        toast.error(data.message);
        return;
      }

Swal.fire({
  title: "Notice Created Successfully!",
  icon: "success",
  draggable: true
});
      setFormData(initialState);
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const showDeptSection = !formData.audience.includes("all");

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">📢 Create Notice</h2>
        <button
          type="button"
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Teacher Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Published By *
        </label>
        <select
          name="createdBy"
          value={formData.createdBy}
          onChange={handleChange}
          required
          className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select Teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={`${teacher.firstName} ${teacher.lastName}`}>
              {teacher.firstName} {teacher.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notice Title *
        </label>
        <input
          type="text"
          name="title"
          placeholder="Enter notice title..."
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
        />
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notice Content *
        </label>
        
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-3 bg-gray-50 border-2 border-gray-200 rounded-t-lg border-b-0">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-2 hover:bg-gray-200 rounded font-bold"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-2 hover:bg-gray-200 rounded italic"
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="p-2 hover:bg-gray-200 rounded underline"
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => execCommand('strikeThrough')}
            className="p-2 hover:bg-gray-200 rounded line-through"
            title="Strikethrough"
          >
            S
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
          
          {/* Alignment */}
          <button
            type="button"
            onClick={() => execCommand('justifyLeft')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Align Left"
          >
            ⬅️
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyCenter')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Align Center"
          >
            ↔️
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyRight')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Align Right"
          >
            ➡️
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyFull')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Justify"
          >
            ☰
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
          
          {/* Lists */}
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Numbered List"
          >
            1. List
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
          
          {/* Headings */}
          <select
            onChange={(e) => {
              if (e.target.value) execCommand('formatBlock', e.target.value);
            }}
            className="p-2 hover:bg-gray-200 rounded border-0 bg-transparent"
            defaultValue=""
          >
            <option value="">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="pre">Preformatted</option>
          </select>
          
          <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
          
          {/* Insert */}
          <button
            type="button"
            onClick={insertLink}
            className="p-2 hover:bg-gray-200 rounded text-blue-600"
            title="Insert Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={insertTable}
            className="p-2 hover:bg-gray-200 rounded"
            title="Insert Table"
          >
            📊
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertHorizontalRule')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Horizontal Line"
          >
            ―
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
          
          {/* Text Color */}
          <input
            type="color"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            className="w-8 h-8 p-0 border-0 cursor-pointer"
            title="Text Color"
          />
          <input
            type="color"
            onChange={(e) => execCommand('hiliteColor', e.target.value)}
            className="w-8 h-8 p-0 border-0 cursor-pointer"
            title="Highlight Color"
            defaultValue="#ffff00"
          />

          <div className="flex-1"></div>

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              previewMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {previewMode ? '✏️ Edit' : '👁️ Preview'}
          </button>
        </div>

        {/* Editor/Preview Area */}
        <div
          ref={editorRef}
          contentEditable={!previewMode}
          suppressContentEditableWarning={true}
          onInput={updateDescription}
          className={`w-full min-h-[300px] p-4 border-2 border-gray-200 rounded-b-lg focus:border-blue-500 focus:outline-none prose max-w-none ${
            previewMode ? 'bg-gray-50' : 'bg-white'
          }`}
          style={{ 
            whiteSpace: 'pre-wrap',
            overflowY: 'auto'
          }}
        >
          {/* Default placeholder */}
        </div>
        {(!formData.description || formData.description === '<br>') && !previewMode && (
          <p className="text-gray-400 text-sm mt-1">
            Start typing your notice content here... Use the toolbar above to format text.
          </p>
        )}
      </div>

      {/* Category & Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select Category</option>
            <option value="general">📋 General</option>
            <option value="academic">📚 Academic</option>
            <option value="exam">📝 Exam</option>
            <option value="event">🎉 Event</option>
            <option value="urgent">🚨 Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="low">🔵 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>
      </div>

      {/* Audience */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Target Audience
        </label>
        <div className="flex flex-wrap gap-4">
          {["students", "teachers", "staff", "all"].map((a) => (
            <label key={a} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="audience"
                value={a}
                checked={formData.audience.includes(a)}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="capitalize">{a}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Department & Section */}
      {showDeptSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Section
            </label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Section</option>
              {(sectionsByDepartment[formData.department] || []).map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Expiry Date & Pin Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-end pb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-sm font-semibold text-gray-700">📌 Pin this notice</span>
          </label>
        </div>
      </div>

      {/* Attachment */}
      {/* <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Attachment
        </label>
        <input
          type="file"
          name="attachment"
          onChange={handleChange}
          className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div> */}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          📢 Publish Notice
        </button>
      </div>
    </form>
  );
}