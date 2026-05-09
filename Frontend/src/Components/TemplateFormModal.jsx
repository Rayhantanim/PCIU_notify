// src/components/TemplateFormModal.jsx
import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

const TemplateFormModal = ({ isOpen, template, onClose, onGenerate }) => {
  const [fieldValues, setFieldValues] = useState({});

  useEffect(() => {
    if (template) {
      const initialValues = {};
      template.fields.forEach(field => {
        initialValues[field.name] = "";
      });
      setFieldValues(initialValues);
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const handleInputChange = (fieldName, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let content = template.content;
    
    // Replace all placeholders with values
    template.fields.forEach(field => {
      const value = fieldValues[field.name] || `[${field.name}]`;
      const regex = new RegExp(`\\[${field.name}\\]`, 'g');
      content = content.replace(regex, value);
    });
    
    onGenerate({
      title: template.title,
      content: content,
      category: template.category,
      priority: template.priority
    });
    onClose();
  };

  const renderField = (field) => {
    switch (field.type) {
      case "select":
        return (
          <select
            value={fieldValues[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      
      case "textarea":
        return (
          <textarea
            value={fieldValues[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows="3"
            required={field.required}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      case "date":
        return (
          <input
            type="date"
            value={fieldValues[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={fieldValues[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">📝 {template.title}</h2>
            <p className="text-blue-100 text-sm mt-1">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="space-y-4">
            {template.fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
            >
              Generate Notice
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

export default TemplateFormModal;