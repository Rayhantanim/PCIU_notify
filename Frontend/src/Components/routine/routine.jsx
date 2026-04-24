import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

const RoutineViewer = () => {
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [viewType, setViewType] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState('');
  const [availableDays, setAvailableDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [activeFilterMode, setActiveFilterMode] = useState('department');
  
  // Search states
  const [deptSearch, setDeptSearch] = useState('');
  const [sectionSearch, setSectionSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  
  const deptRef = useRef(null);
  const sectionRef = useRef(null);
  const teacherRef = useRef(null);

  // Helper function to convert time string to comparable value (24-hour format)
  const convertTimeToComparable = (timeStr) => {
    if (!timeStr || timeStr.trim() === '') return '9999';
    
    const time = timeStr.trim().toLowerCase();
    
    // Try to parse common time formats
    // Format: "10:00-11:30" or "10:00 AM - 11:30 AM" or "10:00-11:30 AM"
    let startTime = '';
    
    // Extract start time (before dash or space)
    if (time.includes('-')) {
      startTime = time.split('-')[0].trim();
    } else if (time.includes('to')) {
      startTime = time.split('to')[0].trim();
    } else {
      startTime = time;
    }
    
    // Remove AM/PM from start time for processing
    let isPM = false;
    let isAM = false;
    
    if (startTime.includes('pm')) {
      isPM = true;
      startTime = startTime.replace('pm', '').trim();
    } else if (startTime.includes('am')) {
      isAM = true;
      startTime = startTime.replace('am', '').trim();
    }
    
    // Parse hour and minute
    let hour = 0, minute = 0;
    if (startTime.includes(':')) {
      const [h, m] = startTime.split(':');
      hour = parseInt(h, 10);
      minute = parseInt(m, 10);
    } else {
      hour = parseInt(startTime, 10);
      minute = 0;
    }
    
    // Convert to 24-hour format
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (isAM && hour === 12) {
      hour = 0;
    }
    
    // Return as sortable number (HHMM)
    return hour * 100 + minute;
  };

  // Sort routines by time
  const sortByTime = (routinesList) => {
    return [...routinesList].sort((a, b) => {
      const timeA = convertTimeToComparable(a.time);
      const timeB = convertTimeToComparable(b.time);
      return timeA - timeB;
    });
  };

  // Helper to find column index with flexible matching
  const findColumnIndex = (headers, possibleNames) => {
    for (const header of headers) {
      const lowerHeader = header.toLowerCase().trim();
      for (const possibleName of possibleNames) {
        if (lowerHeader === possibleName.toLowerCase().trim() || 
            lowerHeader.includes(possibleName.toLowerCase().trim())) {
          return headers.indexOf(header);
        }
      }
    }
    return -1;
  };

  // Load Excel file from public folder
  useEffect(() => {
    const loadExcelFile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/pciu.xlsx');
        if (!response.ok) {
          throw new Error('pciu.xlsx not found in public folder. Please add the file.');
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
        
        if (!rows || rows.length < 2) {
          throw new Error('Excel file has insufficient data');
        }
        
        const headers = rows[0].map(cell => String(cell || "").trim());
        
        setDebugInfo(`Found headers: ${headers.join(', ')}`);
        
        const fieldMappings = {
          day: ['day', 'days', 'class day', 'weekday', 'day name'],
          department: ['department', 'dept', 'departments', 'dept name', 'faculty'],
          section: ['section', 'sec', 'sections', 'class section', 'group'],
          courseCode: ['courseCode', 'course code', 'coursecode', 'course_code', 'code', 'course id', 'courseid', 'subject code', 'subjectcode'],
          courseName: ['courseName', 'course name', 'coursename', 'course_name', 'name', 'subject name', 'subjectname', 'title'],
          teacher: ['teacher', 'teachers', 'instructor', 'professor', 'faculty', 'lecturer'],
          time: ['time', 'times', 'class time', 'timing', 'schedule', 'period'],
          room: ['room', 'rooms', 'classroom', 'room no', 'room number', 'venue']
        };
        
        const idx = {};
        for (let [key, possibleNames] of Object.entries(fieldMappings)) {
          const colIndex = findColumnIndex(headers, possibleNames);
          if (colIndex === -1) {
            throw new Error(`Missing required column. Could not find "${key}" among headers: ${headers.join(', ')}`);
          }
          idx[key] = colIndex;
        }
        
        const records = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;
          const dayRaw = row[idx.day] ? String(row[idx.day]).trim() : "";
          if (dayRaw === "") continue;
          
          records.push({
            day: dayRaw,
            department: row[idx.department] ? String(row[idx.department]).trim() : "",
            section: row[idx.section] ? String(row[idx.section]).trim() : "",
            courseCode: row[idx.courseCode] ? String(row[idx.courseCode]).trim() : "",
            courseName: row[idx.courseName] ? String(row[idx.courseName]).trim() : "",
            teacher: row[idx.teacher] ? String(row[idx.teacher]).trim() : "",
            time: row[idx.time] ? String(row[idx.time]).trim() : "",
            room: row[idx.room] ? String(row[idx.room]).trim() : ""
          });
        }
        
        if (records.length === 0) {
          throw new Error('No valid records found in Excel file');
        }
        
        setRoutines(records);
        const deptList = getUniqueValues(records, 'department');
        const teacherList = getUniqueValues(records, 'teacher');
        setDepartments(deptList);
        setTeachers(teacherList);
        setErrorMsg('');
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadExcelFile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setIsDeptDropdownOpen(false);
      }
      if (sectionRef.current && !sectionRef.current.contains(event.target)) {
        setIsSectionDropdownOpen(false);
      }
      if (teacherRef.current && !teacherRef.current.contains(event.target)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUniqueValues = (records, field) => {
    const values = new Set();
    records.forEach(r => {
      if (r[field] && r[field].trim() !== "") values.add(r[field]);
    });
    return Array.from(values).sort();
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept =>
    dept.toLowerCase().includes(deptSearch.toLowerCase())
  );

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(teacher =>
    teacher.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  // Update sections when department changes (excluding 'all')
  useEffect(() => {
    if (routines.length === 0) return;
    
    if (selectedDept === 'all') {
      const allSections = getUniqueValues(routines, 'section');
      setSections(allSections);
    } else {
      const filteredByDept = routines.filter(r => r.department === selectedDept);
      const sectionList = getUniqueValues(filteredByDept, 'section');
      setSections(sectionList);
    }
    
    if (selectedSection !== 'all') {
      const availableSections = selectedDept === 'all' 
        ? getUniqueValues(routines, 'section')
        : getUniqueValues(routines.filter(r => r.department === selectedDept), 'section');
      
      if (!availableSections.includes(selectedSection) && availableSections.length > 0) {
        setSelectedSection('all');
      } else if (availableSections.length === 0) {
        setSelectedSection('all');
      }
    }
  }, [selectedDept, routines]);

  // Filter sections based on search
  const filteredSections = sections.filter(section =>
    section.toLowerCase().includes(sectionSearch.toLowerCase())
  );

  // Apply filters and sort by time
  useEffect(() => {
    if (routines.length === 0) {
      setFilteredRoutines([]);
      setAvailableDays([]);
      return;
    }
    
    let filtered = [...routines];
    
    // Apply teacher filter first if teacher is selected
    if (selectedTeacher !== 'all') {
      filtered = filtered.filter(r => r.teacher === selectedTeacher);
    }
    
    // Apply department filter
    if (selectedDept !== 'all') {
      filtered = filtered.filter(r => r.department === selectedDept);
    }
    
    // Apply section filter
    if (selectedSection !== 'all') {
      filtered = filtered.filter(r => r.section === selectedSection);
    }
    
    // Sort all filtered routines by time
    filtered = sortByTime(filtered);
    
    setFilteredRoutines(filtered);
    
    const days = getUniqueValues(filtered, 'day');
    const daysOrder = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const sortedDays = days.sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
    setAvailableDays(sortedDays);
    if (sortedDays.length > 0 && !sortedDays.includes(selectedDay)) {
      setSelectedDay(sortedDays[0]);
    }
  }, [routines, selectedDept, selectedSection, selectedTeacher]);

  // Group routines by day and sort each day's routines by time
  const groupByDay = (routinesList) => {
    const daysOrder = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const groups = {};
    
    routinesList.forEach(rec => {
      const day = rec.day;
      if (!groups[day]) groups[day] = [];
      groups[day].push(rec);
    });
    
    // Sort routines within each day by time
    for (let day in groups) {
      groups[day] = sortByTime(groups[day]);
    }
    
    const sortedDays = Object.keys(groups).sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
    return { groups, sortedDays };
  };

  // Get routines for selected day and sort by time
  const getDayRoutines = () => {
    const dayRoutinesUnfiltered = filteredRoutines.filter(r => r.day === selectedDay);
    return sortByTime(dayRoutinesUnfiltered);
  };

  const { groups, sortedDays } = groupByDay(filteredRoutines);
  const dayRoutines = getDayRoutines();

  // Handle department selection
  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setDeptSearch('');
    setIsDeptDropdownOpen(false);
    if (dept !== 'all') {
      setActiveFilterMode('department');
    }
  };

  // Handle section selection
  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSectionSearch('');
    setIsSectionDropdownOpen(false);
  };

  // Handle teacher selection
  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherSearch('');
    setIsTeacherDropdownOpen(false);
    if (teacher !== 'all') {
      setActiveFilterMode('teacher');
      // Reset department to 'all' when teacher is selected for better visibility
      if (teacher !== 'all') {
        setSelectedDept('all');
        setSelectedSection('all');
      }
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedDept('all');
    setSelectedSection('all');
    setSelectedTeacher('all');
    setActiveFilterMode('department');
    setDeptSearch('');
    setSectionSearch('');
    setTeacherSearch('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading routine from pciu.xlsx...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Routine</h2>
          <p className="text-gray-600 mb-4">{errorMsg}</p>
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-left">
              <p className="font-semibold text-sm">Debug Info:</p>
              <p className="text-xs text-gray-600 font-mono break-all">{debugInfo}</p>
            </div>
          )}
          <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded mt-4">
            Your Excel file should have columns like:<br/>
            <strong>day, department, section, courseCode, courseName, teacher, time, room</strong><br/>
            or any similar variation (e.g., "course code", "subject code", etc.)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <i className="fas fa-calendar-alt text-yellow-400 text-2xl"></i>
              <span className="text-white font-bold text-xl">PCIU Notify</span>
              <span className="bg-yellow-500 text-blue-900 text-xs font-semibold px-2 py-1 rounded-full">Routine Viewer</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetFilters}
                className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold py-1 px-3 rounded-lg text-sm transition"
              >
                <i className="fas fa-sync-alt mr-1"></i> Reset
              </button>
              <div className="text-white text-sm">
                <i className="fas fa-file-excel mr-1 text-green-400"></i>
                pciu.xlsx
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Mode Indicator */}
        {selectedTeacher !== 'all' && (
          <div className="mb-4 bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-3 rounded flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-chalkboard-teacher text-purple-600"></i>
              <span>Viewing classes for: <strong>{selectedTeacher}</strong></span>
            </div>
            <button
              onClick={() => handleTeacherSelect('all')}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Clear Teacher Filter
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Teacher Searchable Dropdown */}
            <div ref={teacherRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-chalkboard-teacher mr-2 text-purple-600"></i>Teacher
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => {
                    setTeacherSearch(e.target.value);
                    setIsTeacherDropdownOpen(true);
                  }}
                  onFocus={() => setIsTeacherDropdownOpen(true)}
                  placeholder="Search teacher..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <i className={`fas fa-chevron-${isTeacherDropdownOpen ? 'up' : 'down'}`}></i>
                </button>
              </div>
              
              {isTeacherDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    className="px-3 py-2 hover:bg-purple-50 cursor-pointer sticky top-0 bg-white border-b"
                    onClick={() => handleTeacherSelect('all')}
                  >
                    <div className="flex items-center">
                      <i className="fas fa-users mr-2 text-purple-600"></i>
                      <span className="font-medium">👨‍🏫 All Teachers</span>
                    </div>
                  </div>
                  {filteredTeachers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">No teachers found</div>
                  ) : (
                    filteredTeachers.map(teacher => (
                      <div
                        key={teacher}
                        className={`px-3 py-2 hover:bg-purple-50 cursor-pointer ${selectedTeacher === teacher ? 'bg-purple-100' : ''}`}
                        onClick={() => handleTeacherSelect(teacher)}
                      >
                        <i className="fas fa-user mr-2 text-gray-500"></i>
                        {teacher}
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {selectedTeacher !== 'all' && !isTeacherDropdownOpen && (
                <div className="mt-1 text-sm text-purple-600">
                  <i className="fas fa-check-circle mr-1"></i> Selected: {selectedTeacher}
                </div>
              )}
            </div>

            {/* Department Searchable Dropdown */}
            <div ref={deptRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-building mr-2 text-blue-600"></i>Department
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={deptSearch}
                  onChange={(e) => {
                    setDeptSearch(e.target.value);
                    setIsDeptDropdownOpen(true);
                  }}
                  onFocus={() => setIsDeptDropdownOpen(true)}
                  placeholder="Search department..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedTeacher !== 'all'}
                />
                {selectedTeacher !== 'all' && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <i className="fas fa-lock"></i>
                  </div>
                )}
              </div>
              
              {isDeptDropdownOpen && selectedTeacher === 'all' && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer sticky top-0 bg-white border-b"
                    onClick={() => handleDeptSelect('all')}
                  >
                    <div className="flex items-center">
                      <i className="fas fa-globe mr-2 text-blue-600"></i>
                      <span className="font-medium">📚 All Departments</span>
                    </div>
                  </div>
                  {filteredDepartments.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">No departments found</div>
                  ) : (
                    filteredDepartments.map(dept => (
                      <div
                        key={dept}
                        className={`px-3 py-2 hover:bg-blue-50 cursor-pointer ${selectedDept === dept ? 'bg-blue-100' : ''}`}
                        onClick={() => handleDeptSelect(dept)}
                      >
                        {dept}
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {selectedDept !== 'all' && !isDeptDropdownOpen && selectedTeacher === 'all' && (
                <div className="mt-1 text-sm text-blue-600">
                  <i className="fas fa-check-circle mr-1"></i> Selected: {selectedDept}
                </div>
              )}
            </div>

            {/* Section Searchable Dropdown */}
            <div ref={sectionRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-users mr-2 text-blue-600"></i>Section
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sectionSearch}
                  onChange={(e) => {
                    setSectionSearch(e.target.value);
                    setIsSectionDropdownOpen(true);
                  }}
                  onFocus={() => setIsSectionDropdownOpen(true)}
                  placeholder="Search section..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedTeacher !== 'all'}
                />
                {selectedTeacher !== 'all' && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <i className="fas fa-lock"></i>
                  </div>
                )}
              </div>
              
              {isSectionDropdownOpen && selectedTeacher === 'all' && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer sticky top-0 bg-white border-b"
                    onClick={() => handleSectionSelect('all')}
                  >
                    <div className="flex items-center">
                      <i className="fas fa-list mr-2 text-blue-600"></i>
                      <span className="font-medium">📋 All Sections</span>
                    </div>
                  </div>
                  {filteredSections.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">No sections found</div>
                  ) : (
                    filteredSections.map(section => (
                      <div
                        key={section}
                        className={`px-3 py-2 hover:bg-blue-50 cursor-pointer ${selectedSection === section ? 'bg-blue-100' : ''}`}
                        onClick={() => handleSectionSelect(section)}
                      >
                        {section}
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {selectedSection !== 'all' && !isSectionDropdownOpen && selectedTeacher === 'all' && (
                <div className="mt-1 text-sm text-blue-600">
                  <i className="fas fa-check-circle mr-1"></i> Selected: {selectedSection}
                </div>
              )}
            </div>

            {/* View Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-eye mr-2 text-blue-600"></i>View Type
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewType('weekly')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
                    viewType === 'weekly' 
                      ? 'bg-blue-900 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <i className="fas fa-calendar-week mr-1"></i> Weekly
                </button>
                <button
                  onClick={() => setViewType('day')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
                    viewType === 'day' 
                      ? 'bg-blue-900 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <i className="fas fa-calendar-day mr-1"></i> Day
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sorting Indicator */}
        <div className="mb-3 text-right text-xs text-gray-500">
          <i className="fas fa-sort-amount-up mr-1"></i> Classes sorted by time
        </div>

        {/* Weekly View */}
        {viewType === 'weekly' && filteredRoutines.length > 0 && (
          <div className="space-y-6">
            {sortedDays.map(day => (
              <div key={day} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-5 py-3">
                  <h2 className="text-white font-bold text-lg">
                    <i className="fas fa-sun mr-2"></i>{day}
                  </h2>
                  <p className="text-white text-xs opacity-80 mt-1">
                    {groups[day]?.length || 0} classes
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          <i className="fas fa-clock mr-1"></i>Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                        {(selectedDept === 'all' || selectedSection === 'all' || selectedTeacher !== 'all') && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        )}
                        {(selectedDept === 'all' || selectedSection === 'all' || selectedTeacher !== 'all') && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groups[day]?.map((routine, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            <i className="fas fa-hourglass-start text-gray-400 mr-1"></i>
                            {routine.time}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <span className="font-mono">{routine.courseCode}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{routine.courseName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <i className="fas fa-user text-gray-400 mr-1"></i>
                            {routine.teacher}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <i className="fas fa-door-open text-gray-400 mr-1"></i>
                            {routine.room}
                          </td>
                          {(selectedDept === 'all' || selectedSection === 'all' || selectedTeacher !== 'all') && (
                            <td className="px-4 py-3 text-sm text-gray-700">{routine.department}</td>
                          )}
                          {(selectedDept === 'all' || selectedSection === 'all' || selectedTeacher !== 'all') && (
                            <td className="px-4 py-3 text-sm text-gray-700">{routine.section}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!groups[day] || groups[day].length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-hourglass-half mr-2"></i>No classes scheduled
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Day View */}
        {viewType === 'day' && filteredRoutines.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-5 py-3 flex flex-wrap items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">
                  <i className="fas fa-calendar-day mr-2"></i>Class Schedule
                </h2>
                <p className="text-white text-xs opacity-80 mt-1">
                  {dayRoutines.length} classes on {selectedDay} (sorted by time)
                </p>
              </div>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-white text-gray-800 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none"
              >
                {availableDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <i className="fas fa-clock mr-1"></i>Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    {(selectedDept === 'all' || selectedSection === 'all' || selectedTeacher !== 'all') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    )}
                    {(selectedDept === 'all' || selectedSection === 'all' || selectedTeacher !== 'all') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dayRoutines.map((routine, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        <i className="fas fa-hourglass-start text-gray-400 mr-1"></i>
                        {routine.time}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="font-mono">{routine.courseCode}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{routine.courseName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <i className="fas fa-user text-gray-400 mr-1"></i>
                        {routine.teacher}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <i className="fas fa-door-open text-gray-400 mr-1"></i>
                        {routine.room}
                      </td>
                      {(selectedDept === 'all' || selectedSection === 'all' || selectedTeacher !== 'all') && (
                        <td className="px-4 py-3 text-sm text-gray-700">{routine.department}</td>
                      )}
                      {(selectedDept === 'all' || selectedSection === 'all' || selectedTeacher !== 'all') && (
                        <td className="px-4 py-3 text-sm text-gray-700">{routine.section}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dayRoutines.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-clock text-3xl mb-2 block"></i>
                <p>No classes scheduled for {selectedDay}</p>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {filteredRoutines.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-sm flex-wrap gap-2">
              <div className="text-gray-600">
                <i className="fas fa-chalkboard-teacher mr-1 text-blue-600"></i>
                Total Classes: <span className="font-bold text-blue-900">{filteredRoutines.length}</span>
              </div>
              <div className="text-gray-600">
                {selectedTeacher !== 'all' ? (
                  <>
                    <i className="fas fa-user-graduate mr-1 text-purple-600"></i>
                    Teacher: <span className="font-bold text-purple-900">{selectedTeacher}</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-building mr-1 text-green-600"></i>
                    Showing: {selectedDept === 'all' ? 'All Departments' : selectedDept}
                    {selectedSection !== 'all' && ` > ${selectedSection}`}
                  </>
                )}
              </div>
              <div className="text-gray-600">
                <i className="fas fa-calendar-week mr-1 text-purple-600"></i>
                {Object.keys(groups).length} Active Days
              </div>
              <div className="text-gray-600">
                <i className="fas fa-sort-amount-up mr-1 text-green-600"></i>
                Sorted by time
              </div>
            </div>
          </div>
        )}

        {/* Empty State Message */}
        {filteredRoutines.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="fas fa-search text-gray-400 text-5xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Classes Found</h3>
            <p className="text-gray-500">
              {selectedTeacher !== 'all' 
                ? `No classes found for teacher: ${selectedTeacher}`
                : 'No classes match your selected filters. Try adjusting your search criteria.'}
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              <i className="fas fa-sync-alt mr-2"></i>Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineViewer;