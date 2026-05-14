// frontend-react/src/components/NoticeClassifier.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const NoticeClassifier = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title && !formData.description) {
      setError('Please provide either a title or description');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formData);
      
      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to API');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const getPriorityStyles = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': 
        return { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-500' };
      case 'medium': 
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-500' };
      case 'low': 
        return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-500' };
      default: 
        return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-500' };
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <span>📢</span> 
              Notice Classification System
            </h1>
            <p className="text-purple-100 mt-2">
              AI-powered classification for university notices
            </p>
          </div>
          
          {/* Form Section */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notice Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., CSE 327 Final Examination"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the notice details..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department (Optional)
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="EEE">Electrical & Electronic Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="BBA">Business Administration</option>
                  <option value="ENG">English</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Classifying...
                  </span>
                ) : (
                  '🚀 Classify Notice'
                )}
              </button>
            </form>
            
            {/* Loading State */}
            {loading && (
              <div className="mt-8 text-center py-8">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Analyzing notice...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-slideIn">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Results Section */}
            {result && (
              <div className="mt-8 space-y-4 animate-slideIn">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📊</span> Classification Results
                </h2>
                
                {/* Category Result */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                      📌 Category
                    </span>
                    <span className="text-lg font-bold text-blue-900">
                      {result.prediction.category}
                    </span>
                  </div>
                </div>
                
                {/* Audience Result */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                      👥 Target Audience
                    </span>
                    <span className="text-lg font-bold text-green-900">
                      {result.prediction.audience}
                    </span>
                  </div>
                </div>
                
                {/* Priority Result */}
                <div className={`rounded-xl p-4 border-l-4 ${
                  getPriorityStyles(result.prediction.priority).bg
                } border-l-${getPriorityStyles(result.prediction.priority).badge.split('-')[1]}-500`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wide">
                      ⚡ Priority Level
                    </span>
                    <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                      getPriorityStyles(result.prediction.priority).text
                    } ${getPriorityStyles(result.prediction.priority).bg}`}>
                      {result.prediction.priority}
                    </span>
                  </div>
                </div>
                
                {/* Suggestions */}
                {result.suggestions && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h3 className="font-semibold text-purple-900 mb-1">Suggestions</h3>
                        <p className="text-purple-800 text-sm">
                          {result.suggestions.priority_meaning}
                        </p>
                        {result.suggestions.notification_channel && (
                          <p className="text-purple-700 text-sm mt-2">
                            <span className="font-medium">Channel:</span> {result.suggestions.notification_channel}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Additional Info */}
                <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
                  <span>🕒 {new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add custom animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NoticeClassifier;