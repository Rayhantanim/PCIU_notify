import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your Public Key
emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual public key

export default function NoticeForm({ handleClose, userRole }) {
  // const API = "http://localhost:5000";
  const API = "https://pciunotifybackend.onrender.com";
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

  const departments = ["CSE", "EEE", "BBA"];
  const sectionsByDepartment = {
    CSE: ["31A", "31B", "31C"],
    EEE: ["A", "B"],
    BBA: ["A"],
  };

  const audienceOptions = [
    { value: "students", label: "🎓 Students", icon: "👨‍🎓", color: "blue" },
    { value: "teachers", label: "👨‍🏫 Teachers", icon: "👨‍🏫", color: "green" },
    { value: "staff", label: "👔 Staff", icon: "👔", color: "purple" },
  ];

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

  // Function to send emails via EmailJS
  const sendEmailNotifications = async (recipients, noticeData, audienceLabel) => {
    const results = {
      success: [],
      failed: [],
      total: recipients.length
    };

    const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173';
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
          <h2 style="margin: 0;">📢 PCIU Notice Board</h2>
          <p style="margin: 5px 0 0;">New Notice Published for ${audienceLabel}</p>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #333; margin-top: 0;">${noticeData.title}</h3>
          <div style="color: #666; line-height: 1.6;">${noticeData.description}</div>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 5px 0;"><strong>Category:</strong> ${noticeData.category}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> ${noticeData.priority || 'Normal'}</p>
            <p style="margin: 5px 0;"><strong>Posted by:</strong> ${noticeData.createdBy}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${frontendUrl}/dashboard/notices" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Notice
            </a>
          </div>
        </div>
        <div style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 0 0 10px 10px; color: #999; font-size: 12px;">
          <p>This is an automated notification from PCIU Notice Board.</p>
        </div>
      </div>
    `;

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      try {
        const templateParams = {
          to_email: recipient.email,
          to_name: recipient.name,
          subject: `📢 New ${noticeData.category} Notice: ${noticeData.title}`,
          html_content: emailHtml,
          from_name: "PCIU Notice Board",
          reply_to: noticeData.createdBy
        };

        const response = await emailjs.send(
          "YOUR_SERVICE_ID",     // Replace with your EmailJS Service ID
          "YOUR_TEMPLATE_ID",    // Replace with your EmailJS Template ID
          templateParams
        );
        
        results.success.push({
          email: recipient.email,
          name: recipient.name
        });
        
        // Update progress
        Swal.update({
          html: `
            <div>Sending emails to ${audienceLabel}...</div>
            <div class="mt-2">Progress: ${i + 1} / ${recipients.length}</div>
            <div class="mt-2 text-green-600">✅ Success: ${results.success.length}</div>
            <div class="text-red-600">❌ Failed: ${results.failed.length}</div>
          `
        });
        
        // Add delay between sends to avoid rate limits
        if (i < recipients.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        results.failed.push({
          email: recipient.email,
          name: recipient.name,
          error: error.text || error.message
        });
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

    if (!formData.description || formData.description === '<br>') {
      toast.error("Please add content to the notice");
      return;
    }

    // Show loading indicator
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
        throw new Error(data.message);
      }

      // 2. Fetch recipients from backend
      const recipients = await fetchRecipientsByAudience(formData.audience);
      
      let emailResults = null;
      let emailSentCount = 0;

      // 3. Send emails if there are recipients
      if (recipients && recipients.length > 0) {
        Swal.update({
          title: "Sending Email Notifications...",
          html: `
            <div>Sending to ${recipients.length} recipients...</div>
            <div class="mt-2">Audience: ${getAudienceLabel()}</div>
          `,
          allowOutsideClick: false
        });

        emailResults = await sendEmailNotifications(recipients, formData, getAudienceLabel());
        emailSentCount = emailResults.success.length;
        
        // Show warning if some emails failed
        if (emailResults.failed.length > 0) {
          console.warn("Failed emails:", emailResults.failed);
          toast.warning(`${emailResults.failed.length} emails failed to send`);
        }
      }

      // 4. Show success message
      const resultHtml = `
        <div class="text-left">
          <div class="mb-2">✅ Notice sent to: <strong>${getAudienceLabel()}</strong></div>
          ${recipients && recipients.length > 0 ? `
            <div class="mb-2">📧 Emails sent: <strong>${emailSentCount} / ${recipients.length}</strong></div>
            ${emailResults?.failed.length > 0 ? `
              <div class="text-red-600">❌ Failed: ${emailResults.failed.length} recipients</div>
            ` : ''}
          ` : `
            <div class="text-yellow-600">⚠️ No email recipients found</div>
          `}
        </div>
      `;
      
      Swal.fire({
        title: "Notice Created Successfully!",
        html: resultHtml,
        icon: emailResults?.failed.length > 0 ? "warning" : "success",
        confirmButtonColor: "#3085d6"
      });
      
      // Reset form and close
      setFormData(initialState);
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
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
    }
  };

  const showDeptSection = formData.audience.includes("students") && !formData.audience.includes("all");

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

      {/* Published By */}
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
          <option value="">Select Publisher</option>
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
          <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded font-bold"><strong>B</strong></button>
          <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded italic"><em>I</em></button>
          <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded underline"><u>U</u></button>
          
          <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
          
          <button type="button" onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-gray-200 rounded" title="Align Left">⬅️</button>
          <button type="button" onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-gray-200 rounded" title="Align Center">↔️</button>
          <button type="button" onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-gray-200 rounded" title="Align Right">➡️</button>
          
          <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
          
          <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded">• List</button>
          <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded">1. List</button>
          
          <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
          
          <button type="button" onClick={insertLink} className="p-2 hover:bg-gray-200 rounded text-blue-600">🔗</button>
          <button type="button" onClick={insertTable} className="p-2 hover:bg-gray-200 rounded">📊</button>
          
          <div className="flex-1"></div>
          
          <button type="button" onClick={() => setPreviewMode(!previewMode)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${previewMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            {previewMode ? '✏️ Edit' : '👁️ Preview'}
          </button>
        </div>

        {/* Editor Area */}
        <div
          ref={editorRef}
          contentEditable={!previewMode}
          suppressContentEditableWarning={true}
          onInput={updateDescription}
          className={`w-full min-h-[300px] p-4 border-2 border-gray-200 rounded-b-lg focus:border-blue-500 focus:outline-none prose max-w-none ${previewMode ? 'bg-gray-50' : 'bg-white'}`}
          style={{ whiteSpace: 'pre-wrap', overflowY: 'auto' }}
        />
      </div>

      {/* Category & Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} required className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none">
            <option value="">Select Category</option>
            <option value="general">📋 General</option>
            <option value="academic">📚 Academic</option>
            <option value="exam">📝 Exam</option>
            <option value="event">🎉 Event</option>
            <option value="urgent">🚨 Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none">
            <option value="low">🔵 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>
      </div>

      {/* Audience - Multi-Select Checkboxes */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Target Audience (Select multiple) *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {audienceOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
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
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <div className="font-semibold text-gray-800">{option.label}</div>
                <div className="text-xs text-gray-500">Select to send notice</div>
              </div>
            </label>
          ))}
        </div>
        
        {/* Selected Audience Summary */}
        {formData.audience.length > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            ✅ Will be sent to: <strong>{getAudienceLabel()}</strong>
          </div>
        )}
      </div>

      {/* Department & Section - Only show if students are selected */}
      {showDeptSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Department (Optional)</label>
            <select name="department" value={formData.department} onChange={handleChange} className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none">
              <option value="">All Departments</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Section (Optional)</label>
            <select name="section" value={formData.section} onChange={handleChange} className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none">
              <option value="">All Sections</option>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date (Optional)</label>
          <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none" />
        </div>

        <div className="flex items-end pb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isPinned" checked={formData.isPinned} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
            <span className="text-sm font-semibold text-gray-700">📌 Pin this notice</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <button type="button" onClick={handleClose} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={sendingEmails}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingEmails ? "Sending..." : "📢 Publish Notice"}
        </button>
      </div>
    </form>
  );
}