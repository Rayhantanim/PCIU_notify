// AddNoticeForm.jsx (Button-Only Theme Control)
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";
import TemplateSelector from "../components/TemplateSelector";
import TemplateFormModal from "../components/TemplateFormModal";
import {
  FaFileAlt,
  FaRobot,
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
  FaTable,
  FaEye,
  FaEdit,
  FaPaperPlane,
  FaTimes,
  FaSun,
  FaMoon,
  FaPalette,
  FaUsers,
} from "react-icons/fa";
import { MdCategory, MdPriorityHigh } from "react-icons/md";

emailjs.init("KeX8QThOfya4pR79L");

export default function NoticeForm({ handleClose, userRole, onNoticeUpload }) {
  const MAIN_API = "https://pciunotifybackend.onrender.com";
  const ML_API = "http://localhost:5000";

  const editorRef = useRef(null);

  // Theme state - default to light, only changes when button is clicked
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply theme to document - only when button is clicked
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Load saved theme preference on mount (but don't auto-apply system preference)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      // Default to light
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

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
    role: userRole,
  };

  const [formData, setFormData] = useState(initialState);
  const [teachers, setTeachers] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlApiStatus, setMlApiStatus] = useState("checking");
  const [autoPredictEnabled, setAutoPredictEnabled] = useState(true);
  const [predictTimeout, setPredictTimeout] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Check ML API health
  useEffect(() => {
    checkMLApiHealth();
    loadDraft();
  }, []);

  const checkMLApiHealth = async () => {
    try {
      const response = await fetch(`${ML_API}/health`, { method: "GET" });
      if (response.ok) {
        setMlApiStatus("online");
      } else {
        setMlApiStatus("offline");
      }
    } catch (error) {
      setMlApiStatus("offline");
    }
  };

  // Rich Text Editor Functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateDescription();
    debouncedPrediction();
    saveDraft();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      document.execCommand("createLink", false, url);
      updateDescription();
      editorRef.current?.focus();
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:", "https://");
    if (url) {
      document.execCommand("insertImage", false, url);
      updateDescription();
      editorRef.current?.focus();
    }
  };

  const insertTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");
    if (!rows || !cols) return;

    let tableHTML =
      '<table class="w-full border-collapse border border-gray-300 my-2"><tbody>';
    for (let i = 0; i < parseInt(rows); i++) {
      tableHTML += "<tr>";
      for (let j = 0; j < parseInt(cols); j++) {
        tableHTML += '<td class="border border-gray-300 px-3 py-2">&nbsp;</td>';
      }
      tableHTML += "</tr>";
    }
    tableHTML += "</tbody></table>";

    document.execCommand("insertHTML", false, tableHTML);
    updateDescription();
    editorRef.current?.focus();
  };

  const insertBulletList = () => {
    document.execCommand("insertUnorderedList", false, null);
    updateDescription();
    editorRef.current?.focus();
  };

  const insertNumberedList = () => {
    document.execCommand("insertOrderedList", false, null);
    updateDescription();
    editorRef.current?.focus();
  };

  const updateDescription = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setFormData((prev) => ({ ...prev, description: html }));
      updateStats();
      debouncedPrediction();
      saveDraft();
    }
  };

  const updateStats = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = html.replace(/<[^>]*>/g, "");
      setCharCount(text.length);
      setWordCount(
        text
          .trim()
          .split(/\s+/)
          .filter((w) => w.length > 0).length,
      );
    }
  };

  const extractTextFromHTML = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Auto ML Prediction
  const autoMLPrediction = async () => {
    if (!autoPredictEnabled || mlApiStatus !== "online") return;

    const title = formData.title.trim();
    const description = extractTextFromHTML(formData.description).trim();

    if (
      (!title && !description) ||
      (title.length < 3 && description.length < 10)
    )
      return;

    setIsPredicting(true);

    try {
      const response = await fetch(`${ML_API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          description: description,
          department: formData.department || "CSE",
        }),
      });

      const data = await response.json();

      // if (data.success) {
      //   setMlPrediction(data.prediction);

      //   let updates = {};

      //   if (data.prediction.category && !formData.category) {
      //     const categoryMap = { 'general': 'general', 'academic': 'academic', 'exam': 'exam', 'event': 'event', 'urgent': 'urgent' };
      //     const mappedCategory = categoryMap[data.prediction.category.toLowerCase()];
      //     if (mappedCategory) updates.category = mappedCategory;
      //   }

      //   if (data.prediction.priority && !formData.priority) {
      //     const priorityMap = { 'high': 'high', 'medium': 'medium', 'low': 'low', 'urgent': 'urgent' };
      //     const mappedPriority = priorityMap[data.prediction.priority.toLowerCase()];
      //     if (mappedPriority) updates.priority = mappedPriority;
      //   }

      //   if (data.prediction.audience && formData.audience.length === 0) {
      //     const audienceMap = {
      //       "students": ["students"], "teachers": ["teachers"], "faculty": ["teachers"],
      //       "staff": ["staff"], "all": ["students", "teachers", "staff"]
      //     };
      //     const mappedAudience = audienceMap[data.prediction.audience.toLowerCase()];
      //     if (mappedAudience) updates.audience = mappedAudience;
      //   }

      //   if (Object.keys(updates).length > 0) {
      //     setFormData(prev => ({ ...prev, ...updates }));
      //   }
      // }
      if (data.success) {
        setMlPrediction(data.prediction);

        const updates = {};

        // Always set category
        if (data.prediction.category) {
          updates.category = data.prediction.category.toLowerCase();
        }

        // Always set priority
        if (data.prediction.priority) {
          updates.priority = data.prediction.priority.toLowerCase();
        }

        // Always set audience
        if (data.prediction.audience) {
          const audienceMap = {
            students: ["students"],
            teachers: ["teachers"],
            faculty: ["teachers"],
            staff: ["staff"],
            all: ["students", "teachers", "staff"],
          };

          const mappedAudience =
            audienceMap[data.prediction.audience.toLowerCase()];

          if (mappedAudience) {
            updates.audience = mappedAudience;
          }
        }

        // Apply everything
        setFormData((prev) => ({
          ...prev,
          ...updates,
        }));
      }
    } catch (error) {
      console.error("Auto Prediction Error:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  const debouncedPrediction = () => {
    if (predictTimeout) clearTimeout(predictTimeout);
    const timeout = setTimeout(() => autoMLPrediction(), 1000);
    setPredictTimeout(timeout);
  };

  // Save/Load Draft
  const saveDraft = () => {
    const draft = { formData, timestamp: new Date().toISOString() };
    localStorage.setItem("notice_draft", JSON.stringify(draft));
    setAutoSave(true);
    setLastSaved(new Date());
    setTimeout(() => setAutoSave(false), 2000);
  };

  const loadDraft = () => {
    const saved = localStorage.getItem("notice_draft");
    if (saved) {
      const draft = JSON.parse(saved);
      if (draft.formData && window.confirm("Load saved draft?")) {
        setFormData(draft.formData);
        if (editorRef.current && draft.formData.description) {
          editorRef.current.innerHTML = draft.formData.description;
          updateStats();
        }
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem("notice_draft");
    toast.info("Draft cleared");
  };

  // Get user info
  useEffect(() => {
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";
    const fullName =
      localStorage.getItem("fullName") || `${firstName} ${lastName}`.trim();
    const role = localStorage.getItem("role") || userRole;

    setCurrentUser({ name: fullName || "Admin", role: role });

    if (role === "teacher" || role === "staff") {
      setFormData((prev) => ({ ...prev, createdBy: fullName }));
    }
  }, [userRole]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${MAIN_API}/api/teachers`);
        const data = await res.json();
        setTeachers(data.teachers || []);
      } catch (err) {
        console.log("Teacher fetch error:", err);
      }
    };

    const role = localStorage.getItem("role");
    if (role !== "teacher" && role !== "staff") {
      fetchTeachers();
    }
  }, [MAIN_API]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    saveDraft();
    if (name === "title") debouncedPrediction();
  };

  const handleAudienceChange = (value) => {
    let updated = [...formData.audience];
    if (updated.includes(value)) {
      updated = updated.filter((item) => item !== value);
    } else {
      updated.push(value);
    }
    setFormData((prev) => ({ ...prev, audience: updated }));
    saveDraft();
  };

  const getAudienceLabel = () => {
    const audienceMap = {
      students: "Students",
      teachers: "Teachers",
      staff: "Staff",
    };
    if (formData.audience.length === 0) return "No one selected";
    if (formData.audience.length === 3) return "Everyone";
    return formData.audience.map((a) => audienceMap[a]).join(" & ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.createdBy) return toast.error("Select publisher");
    if (formData.audience.length === 0) return toast.error("Select audience");
    if (!formData.description || formData.description === "<br>")
      return toast.error("Add content");
    if (!formData.title.trim()) return toast.error("Enter title");

    setSendingEmails(true);
    Swal.fire({
      title: "Publishing...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch(`${MAIN_API}/api/add-notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Swal.fire({
        title: "Published!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      setFormData(initialState);
      if (editorRef.current) editorRef.current.innerHTML = "";
      clearDraft();
      if (onNoticeUpload) onNoticeUpload();
      handleClose();
    } catch (err) {
      Swal.fire({ title: "Error!", text: err.message, icon: "error" });
    } finally {
      setSendingEmails(false);
    }
  };

  const showDeptSection =
    formData.audience.includes("students") &&
    !formData.audience.includes("all");
  const isTeacherOrStaff =
    localStorage.getItem("role") === "teacher" ||
    localStorage.getItem("role") === "staff";

  const toolbarButtons = [
    { cmd: "bold", icon: <FaBold />, title: "Bold" },
    { cmd: "italic", icon: <FaItalic />, title: "Italic" },
    { cmd: "underline", icon: <FaUnderline />, title: "Underline" },
    { divider: true },
    { cmd: "justifyLeft", icon: <FaAlignLeft />, title: "Align Left" },
    { cmd: "justifyCenter", icon: <FaAlignCenter />, title: "Align Center" },
    { cmd: "justifyRight", icon: <FaAlignRight />, title: "Align Right" },
    { cmd: "justifyFull", icon: <FaAlignJustify />, title: "Justify" },
    { divider: true },
    { handler: insertBulletList, icon: <FaListUl />, title: "Bullet List" },
    { handler: insertNumberedList, icon: <FaListOl />, title: "Numbered List" },
    { divider: true },
    { handler: insertLink, icon: <FaLink />, title: "Insert Link" },
    { handler: insertImage, icon: <FaImage />, title: "Insert Image" },
    { handler: insertTable, icon: <FaTable />, title: "Insert Table" },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <FaPalette className="text-gray-600 dark:text-gray-400" />
              <span>Tools</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Statistics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Characters:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {charCount}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Words:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {wordCount}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Reading time:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {Math.ceil(wordCount / 200)} min
                  </span>
                </div>
                {lastSaved && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Auto-saved:</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {lastSaved.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Status */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaRobot className="text-blue-500" /> AI Assistant
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    mlApiStatus === "online"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {mlApiStatus === "online" ? "● Online" : "○ Offline"}
                </span>
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Auto-predict fields
                </span>
                <input
                  type="checkbox"
                  checked={autoPredictEnabled}
                  onChange={(e) => setAutoPredictEnabled(e.target.checked)}
                  className="toggle"
                />
              </label>
              {isPredicting && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                  AI analyzing...
                </div>
              )}
              {mlPrediction && mlApiStatus === "online" && !isPredicting && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    Detected:{" "}
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {mlPrediction.category}
                    </span>{" "}
                    •
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {" "}
                      {mlPrediction.priority}
                    </span>
                  </p>
                  <p className="text-gray-500 dark:text-gray-500">
                    Audience: {mlPrediction.audience}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Category */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <MdCategory /> Category
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {["general", "academic", "exam", "event", "urgent"].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        handleChange({
                          target: { name: "category", value: cat },
                        })
                      }
                      className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                        formData.category === cat
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Quick Priority */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <MdPriorityHigh /> Priority
              </h4>
              <div className="space-y-2">
                {[
                  { value: "low", label: "Low", color: "green" },
                  { value: "medium", label: "Medium", color: "yellow" },
                  { value: "high", label: "High", color: "orange" },
                  { value: "urgent", label: "Urgent", color: "red" },
                ].map((prio) => (
                  <button
                    key={prio.value}
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "priority", value: prio.value },
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                      formData.priority === prio.value
                        ? `bg-${prio.color}-600 text-white`
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {prio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Audience */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FaUsers /> Audience
              </h4>
              <div className="space-y-2">
                {[
                  { value: "students", label: "Students" },
                  { value: "teachers", label: "Teachers" },
                  { value: "staff", label: "Staff" },
                ].map((aud) => (
                  <button
                    key={aud.value}
                    type="button"
                    onClick={() => handleAudienceChange(aud.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.audience.includes(aud.value)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {aud.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={clearDraft}
              className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
            >
              Clear Draft
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Create New Notice
              </h2>
              <button
                type="button"
                onClick={() => setShowTemplateSelector(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
              >
                <FaFileAlt /> Use Template
              </button>
              {autoSave && (
                <span className="text-xs text-green-600 dark:text-green-400 animate-pulse">
                  Saving...
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <FaTimes className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form
              onSubmit={handleSubmit}
              className="max-w-5xl mx-auto space-y-6"
            >
              {/* Published By */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Published By *
                </label>
                {isTeacherOrStaff ? (
                  <div className="text-gray-800 dark:text-gray-200 font-medium">
                    {formData.createdBy || currentUser?.name}
                  </div>
                ) : (
                  <select
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  >
                    <option value="">Select Publisher</option>
                    {teachers.map((teacher) => (
                      <option
                        key={teacher._id}
                        value={`${teacher.firstName} ${teacher.lastName}`}
                      >
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Title */}
              <input
                type="text"
                name="title"
                placeholder="Notice Title *"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              {/* Editor */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-300 dark:border-gray-700">
                  {toolbarButtons.map((item, idx) =>
                    item.divider ? (
                      <div
                        key={idx}
                        className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"
                      />
                    ) : (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          item.handler ? item.handler() : execCommand(item.cmd)
                        }
                        title={item.title}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all text-gray-700 dark:text-gray-300"
                      >
                        {item.icon}
                      </button>
                    ),
                  )}
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-3 py-1 rounded text-sm transition-all flex items-center gap-1 ${
                      previewMode
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {previewMode ? <FaEdit /> : <FaEye />}{" "}
                    {previewMode ? "Edit" : "Preview"}
                  </button>
                </div>

                {previewMode ? (
                  <div
                    className="min-h-[400px] p-4 prose dark:prose-invert max-w-none overflow-auto bg-white dark:bg-gray-800"
                    dangerouslySetInnerHTML={{
                      __html: formData.description || "No content yet...",
                    }}
                  />
                ) : (
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={updateDescription}
                    className="min-h-[400px] p-4 focus:outline-none prose dark:prose-invert max-w-none overflow-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                )}
              </div>

              {/* Category & Priority */}
              {/* <div className="grid grid-cols-2 gap-4">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Select Category</option>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="exam">Exam</option>
                  <option value="event">Event</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div> */}

              {/* Audience */}
              {/* <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Target Audience *
                </label>
                <div className="flex gap-4">
                  {["students", "teachers", "staff"].map((aud) => (
                    <label
                      key={aud}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.audience.includes(aud)}
                        onChange={() => handleAudienceChange(aud)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">
                        {aud}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.audience.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    Will be sent to: <strong>{getAudienceLabel()}</strong>
                  </div>
                )}
              </div> */}

              {/* Department & Section */}
              {showDeptSection && (
                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  >
                    <option value="">All Departments</option>
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                    <option value="BBA">BBA</option>
                    <option value="ENG">ENG</option>
                  </select>
                  <input
                    type="text"
                    name="section"
                    placeholder="Section (optional)"
                    value={formData.section}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  />
                </div>
              )}

              {/* Extras */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPinned"
                    checked={formData.isPinned}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Pin this notice (appears at top)
                  </span>
                </label>
              </div>

              {/* Attachment */}
              <input
                type="file"
                name="attachment"
                onChange={handleChange}
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
              />

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmails}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane />{" "}
                  {sendingEmails ? "Sending..." : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Template Modals */}
      {showTemplateSelector && (
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={setSelectedTemplate}
        />
      )}
      {showTemplateForm && selectedTemplate && (
        <TemplateFormModal
          isOpen={showTemplateForm}
          template={selectedTemplate}
          onClose={() => setShowTemplateForm(false)}
          onGenerate={(data) => {
            setFormData((prev) => ({
              ...prev,
              title: data.title,
              description: data.content,
              category: data.category,
              priority: data.priority,
            }));
            if (editorRef.current) {
              editorRef.current.innerHTML = data.content;
              updateStats();
            }
            setShowTemplateForm(false);
            toast.success("Template applied successfully!");
          }}
        />
      )}

      {/* Toggle Switch CSS */}
      <style>{`
        .toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          background-color: #cbd5e1;
          border-radius: 12px;
          transition: all 0.3s;
          cursor: pointer;
          appearance: none;
        }
        .dark .toggle {
          background-color: #475569;
        }
        .toggle:checked {
          background-color: #3b82f6;
        }
        .toggle::before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          background-color: white;
          transition: transform 0.3s;
        }
        .toggle:checked::before {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
}
