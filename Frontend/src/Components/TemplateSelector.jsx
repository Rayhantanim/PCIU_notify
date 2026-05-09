// src/components/TemplateSelector.jsx
import React, { useState } from "react";
import { MdClose, MdDescription, MdCategory } from "react-icons/md";
import { FaGraduationCap, FaCalendarAlt, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { getTemplatesByCategory } from "../data/noticeTemplates";

const TemplateSelector = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  if (!isOpen) return null;

  const categories = [
    { id: "all", name: "All Templates", icon: <MdDescription />, color: "gray" },
    { id: "academic", name: "Academic", icon: <FaGraduationCap />, color: "blue" },
    { id: "exam", name: "Exam", icon: <FaCalendarAlt />, color: "red" },
    { id: "event", name: "Event", icon: <FaUserGraduate />, color: "purple" },
    { id: "holiday", name: "Holiday", icon: <FaChalkboardTeacher />, color: "green" },
    { id: "general", name: "General", icon: <MdDescription />, color: "orange" },
  ];

  const templates = getTemplatesByCategory(selectedCategory);
  
  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    switch(category) {
      case "academic": return "bg-blue-100 text-blue-700";
      case "exam": return "bg-red-100 text-red-700";
      case "event": return "bg-purple-100 text-purple-700";
      case "holiday": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "urgent": return "bg-red-100 text-red-700";
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      default: return "bg-green-100 text-green-700";
    }
  };

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">📋 Notice Templates</h2>
            <p className="text-blue-100 text-sm mt-1">Choose a template to get started</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <MdClose size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex h-[calc(90vh-130px)]">
          {/* Category Sidebar */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto">
            <div className="p-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all flex items-center gap-3 ${
                    selectedCategory === cat.id
                      ? `bg-${cat.color}-50 text-${cat.color}-700 border-l-4 border-${cat.color}-500`
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className={`text-${cat.color}-500`}>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Templates List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTemplate(template)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(template.priority)}`}>
                        {template.priority}
                      </span>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{template.title}</h3>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {template.fields.length} customizable fields
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.fields.slice(0, 3).map((field, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {field.label}
                        </span>
                      ))}
                      {template.fields.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          +{template.fields.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">No templates found</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleSelectTemplate}
            disabled={!selectedTemplate}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
          >
            Use This Template
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;