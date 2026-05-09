import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';
// Add at the top with other imports
import TemplateSelector from "../components/TemplateSelector";
import TemplateFormModal from "../components/TemplateFormModal";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa";

// Initialize EmailJS with your Public Key
emailjs.init("KeX8QThOfya4pR79L");

export default function NoticeForm({ handleClose, userRole, onNoticeUpload }) {
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
    role: userRole,
  };

  const [formData, setFormData] = useState(initialState);
  const [teachers, setTeachers] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Template states
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Get current logged-in user info
  useEffect(() => {
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";
    const fullName = localStorage.getItem("fullName") || `${firstName} ${lastName}`.trim();
    const role = localStorage.getItem("role") || userRole;
    const userId = localStorage.getItem("userId");
    
    setCurrentUser({
      name: fullName || "Admin",
      role: role,
      userId: userId
    });
    
    // Auto-set createdBy for teacher/staff
    if (role === "teacher" || role === "staff") {
      setFormData(prev => ({
        ...prev,
        createdBy: fullName || `${firstName} ${lastName}`.trim()
      }));
    }
  }, [userRole]);

  // Fetch teachers (for admin/staff who need to select publisher)
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API}/api/teachers`);
        const data = await res.json();
        if (data.teachers && Array.isArray(data.teachers)) {
          setTeachers(data.teachers);
        } else if (Array.isArray(data)) {
          setTeachers(data);
        } else {
          console.warn("Unexpected API response format:", data);
          setTeachers([]);
        }
      } catch (err) {
        console.log("Teacher fetch error:", err);
        setTeachers([]);
      }
    };
    
    // Only fetch teachers if user is not teacher (admin/staff needs to select)
    const role = localStorage.getItem("role");
    if (role !== "teacher" && role !== "staff") {
      fetchTeachers();
    }
  }, [API]);

  // Template handlers
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setShowTemplateForm(true);
  };

  const handleGenerateFromTemplate = (generatedData) => {
    setFormData(prev => ({
      ...prev,
      title: generatedData.title,
      description: generatedData.content,
      category: generatedData.category,
      priority: generatedData.priority
    }));
    
    // Update editor content
    if (editorRef.current) {
      editorRef.current.innerHTML = generatedData.content;
      updateDescription();
    }
    
    toast.success(`Template "${generatedData.title}" loaded successfully!`);
  };

  // Rich Text Editor Functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateDescription();
  };

  const updateDescription = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setFormData(prev => ({
        ...prev,
        description: html
      }));
      // Count characters (excluding HTML tags)
      const text = html.replace(/<[^>]*>/g, '');
      setCharCount(text.length);
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

  const insertImage = () => {
    const url = prompt("Enter image URL:", "https://");
    if (url) {
      document.execCommand('insertImage', false, url);
      updateDescription();
      editorRef.current?.focus();
    }
  };

  const insertBulletList = () => {
    document.execCommand('insertUnorderedList', false, null);
    updateDescription();
    editorRef.current?.focus();
  };

  const insertNumberedList = () => {
    document.execCommand('insertOrderedList', false, null);
    updateDescription();
    editorRef.current?.focus();
  };

  const handleAudienceChange = (value) => {
    let updated = [...formData.audience];
    if (updated.includes(value)) {
      updated = updated.filter(item => item !== value);
    } else {
      updated.push(value);
    }
    setFormData({ ...formData, audience: updated });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, attachment: e.target.files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getAudienceLabel = () => {
    const audienceMap = {
      students: "Students",
      teachers: "Teachers",
      staff: "Staff"
    };
    
    if (formData.audience.length === 0) return "No one selected";
    if (formData.audience.length === 3) return "Everyone";
    
    return formData.audience.map(a => audienceMap[a]).join(" & ");
  };

  // Function to fetch recipients from backend
  const fetchRecipientsByAudience = async (audiences) => {
    try {
      const response = await fetch(`${API}/api/recipients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audiences })
      });
      const data = await response.json();
      return data.recipients || [];
    } catch (error) {
      console.error("Error fetching recipients:", error);
      return [];
    }
  };

  // Function to send a single email via EmailJS
  const sendSingleEmail = async (recipient, noticeData, audienceLabel) => {
    const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Notice: ${noticeData.title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
          .notice-title { color: #333; margin-top: 0; font-size: 24px; }
          .notice-description { color: #666; line-height: 1.8; }
          .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .info-item { margin: 8px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">📢 PCIU Notice Board</h2>
            <p style="margin: 5px 0 0;">New Notice Published for ${audienceLabel}</p>
          </div>
          <div class="content">
            <h3 class="notice-title">${noticeData.title}</h3>
            <div class="notice-description">${noticeData.description}</div>
            <div class="info-box">
              <div class="info-item"><strong>📂 Category:</strong> ${noticeData.category}</div>
              <div class="info-item"><strong>⚡ Priority:</strong> ${noticeData.priority || 'Normal'}</div>
              <div class="info-item"><strong>👤 Posted by:</strong> ${noticeData.createdBy}</div>
              <div class="info-item"><strong>📅 Date:</strong> ${new Date().toLocaleString()}</div>
            </div>
            <div style="text-align: center;">
              <a href="${frontendUrl}/dashboard/notices" class="btn">View Notice</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification from PCIU Notice Board.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const templateParams = {
      to_email: recipient.email,
      to_name: recipient.name,
      subject: `📢 New ${noticeData.category} Notice: ${noticeData.title}`,
      html_content: emailHtml,
      from_name: "PCIU Notice Board",
      reply_to: noticeData.createdBy
    };

    const response = await emailjs.send(
      "service_i4wkqeq",
      "template_juhzegm",
      templateParams
    );
    
    return response;
  };

  // Function to send emails to all recipients
  const sendEmailNotifications = async (recipients, noticeData, audienceLabel, onProgress) => {
    const results = {
      success: [],
      failed: [],
      total: recipients.length
    };

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      try {
        await sendSingleEmail(recipient, noticeData, audienceLabel);
        
        results.success.push({
          email: recipient.email,
          name: recipient.name
        });
        
        console.log(`✅ Email sent to ${recipient.email} (${i + 1}/${recipients.length})`);
        
      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient.email}:`, error);
        results.failed.push({
          email: recipient.email,
          name: recipient.name,
          error: error.text || error.message
        });
      }
      
      if (onProgress) {
        onProgress(i + 1, recipients.length, results);
      }
      
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.createdBy) {
      toast.error("Please select who is publishing this notice");
      return;
    }

    if (formData.audience.length === 0) {
      toast.error("Please select at least one audience");
      return;
    }

    if (!formData.description || formData.description === '<br>' || formData.description === '<div><br></div>') {
      toast.error("Please add content to the notice");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a notice title");
      return;
    }

    setSendingEmails(true);

    Swal.fire({
      title: "Publishing Notice...",
      text: "Saving notice to database",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      // 1. Save notice to database
      const res = await fetch(`${API}/api/add-notice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save notice");
      }

      // 2. Fetch recipients
      const recipients = await fetchRecipientsByAudience(formData.audience);
      
      let emailResults = null;
      let emailSentCount = 0;

      // 3. Send emails
      if (recipients && recipients.length > 0) {
        Swal.update({
          title: "Sending Email Notifications...",
          html: `
            <div>Sending to ${recipients.length} recipients...</div>
            <div class="mt-2">Audience: ${getAudienceLabel()}</div>
            <div class="mt-2 text-blue-600" id="emailProgress">Preparing...</div>
          `,
          allowOutsideClick: false
        });

        const updateProgress = (current, total, results) => {
          const progressDiv = document.getElementById('emailProgress');
          if (progressDiv) {
            progressDiv.innerHTML = `
              Progress: ${current} / ${total}<br>
              ✅ Success: ${results.success.length}<br>
              ❌ Failed: ${results.failed.length}
            `;
          }
        };

        emailResults = await sendEmailNotifications(recipients, formData, getAudienceLabel(), updateProgress);
        emailSentCount = emailResults.success.length;
        
        if (emailResults.failed.length > 0) {
          toast.warning(`${emailResults.failed.length} emails failed to send`);
        }
      } else {
        toast.info(`No email recipients found for ${getAudienceLabel()}`);
      }

      // 4. Show success message
      const resultHtml = `
        <div class="text-left">
          <div class="mb-2">✅ Notice sent to: <strong>${getAudienceLabel()}</strong></div>
          ${recipients && recipients.length > 0 ? `
            <div class="mb-2">📧 Emails sent: <strong>${emailSentCount} / ${recipients.length}</strong></div>
            ${emailResults?.failed.length > 0 ? `
              <div class="text-red-600 mt-2">❌ Failed: ${emailResults.failed.length} recipients</div>
              <div class="text-sm text-gray-500 mt-1">Check console for details</div>
            ` : '<div class="text-green-600 mt-2">✓ All emails sent successfully!</div>'}
          ` : `
            <div class="text-yellow-600">⚠️ No email recipients found in database</div>
            <div class="text-sm text-gray-500 mt-2">Notice saved but emails not sent.</div>
          `}
        </div>
      `;
      
      Swal.fire({
        title: recipients?.length > 0 ? "Notice Published!" : "Notice Saved",
        html: resultHtml,
        icon: recipients?.length > 0 ? (emailResults?.failed.length > 0 ? "warning" : "success") : "info",
        confirmButtonColor: "#3085d6"
      });
      
      // Reset form
      setFormData({
        ...initialState,
        createdBy: currentUser?.role === "teacher" || currentUser?.role === "staff" ? currentUser?.name : ""
      });
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      setCharCount(0);
      
      // Refresh notices list
      if (onNoticeUpload) {
        onNoticeUpload();
      }
      
      handleClose();
      
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to create notice",
        icon: "error",
        confirmButtonColor: "#3085d6"
      });
      toast.error(err.message || "Server error");
    } finally {
      setSendingEmails(false);
    }
  };

  const showDeptSection = formData.audience.includes("students") && !formData.audience.includes("all");
  const userRoleFromStorage = localStorage.getItem("role");
  const isTeacherOrStaff = userRoleFromStorage === "teacher" || userRoleFromStorage === "staff";

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto p-8 bg-white shadow-2xl rounded-2xl space-y-8"
      >
        {/* Header with Template Button */}
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-800">📢 Create Notice</h2>
            <button
              type="button"
              onClick={() => setShowTemplateSelector(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <FaFileAlt className="text-sm" />
              Use Template
            </button>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Published By - Auto-select for teachers/staff */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-3">
            Published By *
          </label>
          {isTeacherOrStaff ? (
            <div className="w-full border-2 border-gray-200 p-4 rounded-xl bg-gray-100 text-gray-700 font-medium text-lg">
              {formData.createdBy || currentUser?.name}
              <input type="hidden" name="createdBy" value={formData.createdBy || currentUser?.name} />
            </div>
          ) : (
            <select
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
            >
              <option value="">Select Publisher</option>
              {teachers?.map((teacher) => (
                <option key={teacher._id} value={`${teacher.firstName} ${teacher.lastName}`}>
                  {teacher.firstName} {teacher.lastName} {teacher.department ? `(${teacher.department})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-3">
            Notice Title *
          </label>
          <input
            type="text"
            name="title"
            placeholder="Enter notice title..."
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none text-xl"
          />
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-3">
            Notice Content *
            <span className="text-sm text-gray-500 ml-3">({charCount} characters)</span>
          </label>
          
          {/* Enhanced Toolbar - Larger buttons */}
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-2 border-gray-200 rounded-t-xl border-b-0">
            <button type="button" onClick={() => execCommand('bold')} className="p-2.5 hover:bg-gray-200 rounded-lg font-bold text-lg" title="Bold"><strong>B</strong></button>
            <button type="button" onClick={() => execCommand('italic')} className="p-2.5 hover:bg-gray-200 rounded-lg italic text-lg" title="Italic"><em>I</em></button>
            <button type="button" onClick={() => execCommand('underline')} className="p-2.5 hover:bg-gray-200 rounded-lg underline text-lg" title="Underline"><u>U</u></button>
            
            <div className="w-px h-8 bg-gray-300 mx-2 self-center"></div>
            
            <button type="button" onClick={() => execCommand('justifyLeft')} className="p-2.5 hover:bg-gray-200 rounded-lg text-lg" title="Align Left">⬅️</button>
            <button type="button" onClick={() => execCommand('justifyCenter')} className="p-2.5 hover:bg-gray-200 rounded-lg text-lg" title="Align Center">↔️</button>
            <button type="button" onClick={() => execCommand('justifyRight')} className="p-2.5 hover:bg-gray-200 rounded-lg text-lg" title="Align Right">➡️</button>
            <button type="button" onClick={() => execCommand('justifyFull')} className="p-2.5 hover:bg-gray-200 rounded-lg text-lg" title="Justify">📏</button>
            
            <div className="w-px h-8 bg-gray-300 mx-2 self-center"></div>
            
            <button type="button" onClick={insertBulletList} className="p-2.5 hover:bg-gray-200 rounded-lg text-lg" title="Bullet List">• List</button>
            <button type="button" onClick={insertNumberedList} className="p-2.5 hover:bg-gray-200 rounded-lg text-lg" title="Numbered List">1. List</button>
            
            <div className="w-px h-8 bg-gray-300 mx-2 self-center"></div>
            
            <button type="button" onClick={insertLink} className="p-2.5 hover:bg-gray-200 rounded-lg text-blue-600 text-lg" title="Insert Link">🔗</button>
            <button type="button" onClick={insertImage} className="p-2.5 hover:bg-gray-200 rounded-lg text-green-600 text-lg" title="Insert Image">🖼️</button>
            <button type="button" onClick={insertTable} className="p-2.5 hover:bg-gray-200 rounded-lg text-lg" title="Insert Table">📊</button>
            
            <div className="flex-1"></div>
            
            <button 
              type="button" 
              onClick={() => setPreviewMode(!previewMode)} 
              className={`px-6 py-2.5 rounded-xl text-base font-semibold transition-all ${
                previewMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {previewMode ? '✏️ Edit Mode' : '👁️ Preview Mode'}
            </button>
          </div>

          {/* Editor/Preview Area - Larger height */}
          {previewMode ? (
            <div className="w-full min-h-[450px] p-6 border-2 border-gray-200 rounded-b-xl bg-gray-50 prose max-w-none overflow-auto text-base">
              <div dangerouslySetInnerHTML={{ __html: formData.description || 'No content yet...' }} />
            </div>
          ) : (
            <div
              ref={editorRef}
              contentEditable={!previewMode}
              suppressContentEditableWarning={true}
              onInput={updateDescription}
              className="w-full min-h-[450px] p-6 border-2 border-gray-200 rounded-b-xl focus:border-blue-500 focus:outline-none prose max-w-none bg-white overflow-auto text-base"
              style={{ whiteSpace: 'pre-wrap', overflowY: 'auto' }}
            />
          )}
          
          <div className="text-sm text-gray-400 mt-3">
            💡 Tip: You can format text using the toolbar above. Supports bold, italic, lists, links, images, and tables.
          </div>
        </div>

        {/* Category & Priority - Larger grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-3">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
              <option value="">Select Category</option>
              <option value="general">📋 General</option>
              <option value="academic">📚 Academic</option>
              <option value="exam">📝 Exam</option>
              <option value="event">🎉 Event</option>
              <option value="urgent">🚨 Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-3">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>
        </div>

        {/* Audience Section - Larger */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <label className="block text-base font-semibold text-gray-700 mb-4">
            Target Audience (Select multiple) *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: "students", label: "🎓 Students", color: "blue" },
              { value: "teachers", label: "👨‍🏫 Teachers", color: "green" },
              { value: "staff", label: "👔 Staff", color: "purple" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.audience.includes(option.value)
                    ? `border-${option.color}-500 bg-${option.color}-50`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={formData.audience.includes(option.value)}
                  onChange={() => handleAudienceChange(option.value)}
                  className="w-6 h-6 text-blue-600 rounded"
                />
                <div className="font-semibold text-gray-800 text-lg">{option.label}</div>
              </label>
            ))}
          </div>
          
          {formData.audience.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-base text-blue-800">
                ✅ Will be sent to: <strong className="text-lg">{getAudienceLabel()}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Department & Section - Only show if students are selected */}
        {showDeptSection && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">Department (Optional)</label>
              <select name="department" value={formData.department} onChange={handleChange} className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none text-lg">
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="BBA">BBA</option>
                <option value="ENG">ENG</option>
                <option value="LLB">LLB</option>
                <option value="JRN">JRN</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">Section (Optional)</label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="e.g., 31C, 32A"
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
              <div className="text-sm text-gray-400 mt-2">Leave empty for all sections</div>
            </div>
          </div>
        )}

        {/* Expiry Date & Pin Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-3">Expiry Date (Optional)</label>
            <input 
              type="date" 
              name="expiryDate" 
              value={formData.expiryDate} 
              onChange={handleChange} 
              className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none text-lg" 
            />
          </div>

          <div className="flex items-end pb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="isPinned" 
                checked={formData.isPinned} 
                onChange={handleChange} 
                className="w-6 h-6 text-blue-600 rounded" 
              />
              <span className="text-base font-semibold text-gray-700">📌 Pin this notice (appears at top)</span>
            </label>
          </div>
        </div>

        {/* Attachment Upload */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-3">Attachment (Optional)</label>
          <input
            type="file"
            name="attachment"
            onChange={handleChange}
            accept=".pdf,.doc,.docx,.jpg,.png"
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
          />
          <div className="text-sm text-gray-400 mt-2">Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</div>
        </div>

        {/* Action Buttons - Larger */}
        <div className="flex gap-5 pt-6 border-t-2 border-gray-200">
          <button 
            type="button" 
            onClick={handleClose} 
            className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-lg transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={sendingEmails}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingEmails ? "📧 Sending Emails..." : "📢 Publish Notice"}
          </button>
        </div>
      </form>

      {/* Template Modals */}
      {showTemplateSelector && (
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}

      {showTemplateForm && (
        <TemplateFormModal
          isOpen={showTemplateForm}
          template={selectedTemplate}
          onClose={() => setShowTemplateForm(false)}
          onGenerate={handleGenerateFromTemplate}
        />
      )}
    </>
  );
}