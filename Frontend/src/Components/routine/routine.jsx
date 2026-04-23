import React, { useState, useMemo } from "react";
import routineData from "./pciuroutine.json";

export default function RoutineViewer() {
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");

  const data = routineData;

  const departments = [...new Set(data.map(item => item.Department))];

  const sections = useMemo(() => {
    return [
      ...new Set(
        data
          .filter(item =>
            department ? item.Department === department : true
          )
          .map(item => item.Section)
      )
    ];
  }, [data, department]);

  const filteredData = useMemo(() => {
    if (!department || !section) return [];

    return data.filter(
      item =>
        item.Department === department &&
        item.Section === section
    );
  }, [data, department, section]);

  const groupedByDay = useMemo(() => {
    const groups = {};
    filteredData.forEach(item => {
      if (!groups[item.Day]) groups[item.Day] = [];
      groups[item.Day].push(item);
    });
    return groups;
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gray-100">

      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <h1 className="text-xl font-semibold text-gray-800">
            PCIU Routine
          </h1>

          <span className="text-sm text-gray-500">
            Student Portal
          </span>

        </div>
      </nav>

      <div className="p-6">

        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">

          <h2 className="text-2xl font-semibold text-center mb-6">
            Class Routine
          </h2>

          <div className="flex gap-4 justify-center mb-8">

            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setSection("");
              }}
              className="px-4 py-2 border rounded-lg shadow-sm"
            >
              <option value="">Department</option>
              {departments.map((dep, i) => (
                <option key={i}>{dep}</option>
              ))}
            </select>

            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              disabled={!department}
              className="px-4 py-2 border rounded-lg shadow-sm"
            >
              <option value="">Section</option>
              {sections.map((sec, i) => (
                <option key={i}>{sec}</option>
              ))}
            </select>

          </div>

          {!department || !section ? (
            <p className="text-center text-gray-500">
              Select your department and section
            </p>
          ) : (
            <div className="space-y-8">

              {Object.keys(groupedByDay).map((day, i) => (
                <div key={i}>

                  <div className="mb-3 px-4 py-2 bg-gray-50 rounded-lg shadow-sm font-medium">
                    {day}
                  </div>

                  <div className="grid gap-4">
                    {groupedByDay[day].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white border rounded-xl shadow-md hover:shadow-lg transition p-4"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">
                            {item["course code"]}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.time}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">
                          {item["course name"]}
                        </p>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>👨‍🏫 {item.teacher}</span>
                          <span>📍 Room {item.room}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}