import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaBuilding, FaGraduationCap, FaChalkboardTeacher, FaIdCard } from "react-icons/fa";
import { toast } from "react-toastify";

const ProfileEditModal = ({ isOpen, user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
    department: "",
    section: "",
    shortName: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Use your actual backend URL
  const API = "https://pciunotifybackend.onrender.com"; // Change this to your production URL when deploying

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        dob: user.dob ? (typeof user.dob === 'string' ? user.dob.split('T')[0] : user.dob) : "",
        department: user.department || "",
        section: user.section || "",
        shortName: user.shortName || "",
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dob: formData.dob,
        department: formData.department,
      };
      
      // Add role-specific fields
      if (user.role === "student") {
        updateData.section = formData.section;
      } else if (user.role === "teacher") {
        updateData.shortName = formData.shortName;
      }
      
      console.log("Updating user:", user._id);
      console.log("Update data:", updateData);
      console.log("API URL:", `${API}/api/user/${user._id}`);
      
      const response = await fetch(`${API}/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      console.log("Response:", data);
      
      if (response.ok) {
        // Update localStorage
        localStorage.setItem("firstName", formData.firstName);
        localStorage.setItem("lastName", formData.lastName);
        localStorage.setItem("fullName", `${formData.firstName} ${formData.lastName}`);
        localStorage.setItem("department", formData.department);
        if (formData.section) localStorage.setItem("section", formData.section);
        if (formData.phone) localStorage.setItem("phone", formData.phone);
          localStorage.setItem("userId", user._id);
//   localStorage.setItem("email", user.email);
//   localStorage.setItem("firstName", user.firstName);
//   localStorage.setItem("lastName", user.lastName);
//   localStorage.setItem("fullName", `${user.firstName} ${user.lastName}`);
//   localStorage.setItem("role", user.role);
//   localStorage.setItem("firebaseUid", userCredential.user.uid);
//   localStorage.setItem("token", userCredential.user.accessToken || "firebase-token");
        
        toast.success("Profile updated successfully!");
        
        if (onUpdate) {
          onUpdate(data.user);
        }
        
        onClose();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (user.role) {
      case "student":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaGraduationCap className="inline mr-2 text-green-500" />
              Section
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 31C"
            />
            {user.studentId && (
              <p className="text-xs text-gray-400 mt-1">Student ID: {user.studentId}</p>
            )}
          </div>
        );
      
      case "teacher":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaChalkboardTeacher className="inline mr-2 text-purple-500" />
              Short Name
            </label>
            <input
              type="text"
              name="shortName"
              value={formData.shortName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Dr. Smith"
            />
            {user.teacherId && (
              <p className="text-xs text-gray-400 mt-1">Teacher ID: {user.teacherId}</p>
            )}
          </div>
        );
      
      default:
        return (
          <p className="text-gray-500 text-center py-4">
            No additional fields available
          </p>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <p className="text-blue-100 text-sm mt-1 capitalize">
              {user.role} - Update your information
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <MdClose size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "basic"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab("roleSpecific")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "roleSpecific"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {user.role === "student" ? "Academic Details" : "Professional Details"}
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-blue-500" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-blue-500" />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-blue-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2 text-blue-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline mr-2 text-blue-500" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline mr-2 text-blue-500" />
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science & Engineering"
                />
              </div>
            </div>
          )}

          {activeTab === "roleSpecific" && (
            <div className="space-y-4">
              {renderRoleSpecificFields()}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;