import React, { useState } from "react";

const MonthlyAttendance = () => {
  const [employee, setEmployee] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");

  return (
    <div className="w-full max-w-2xl p-6 mx-auto bg-white rounded-md shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Take Attendance</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-medium">Employee *</label>
          <select
            className="w-full p-2 border rounded-md"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option value="">Select one</option>
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Year *</label>
          <select
            className="w-full p-2 border rounded-md"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select one</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Month *</label>
          <select
            className="w-full p-2 border rounded-md"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Select one</option>
            <option value="January">January</option>
            <option value="February">February</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Time In *</label>
          <input
            type="time"
            className="w-full p-2 border rounded-md"
            value={timeIn}
            onChange={(e) => setTimeIn(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">Time Out *</label>
          <input
            type="time"
            className="w-full p-2 border rounded-md"
            value={timeOut}
            onChange={(e) => setTimeOut(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">
          Submit
        </button>
      </div>
    </div>
  );
};

export default MonthlyAttendance;
