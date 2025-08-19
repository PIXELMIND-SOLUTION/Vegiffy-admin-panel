import React, { useState } from "react";

const AttendanceForm = () => {
  const [employee, setEmployee] = useState("");
  const [time, setTime] = useState("");

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="p-6 bg-white rounded shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Take attendance</h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Employee <span className="text-red-500">*</span></label>
          <select
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option value="">Select one</option>
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Time <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 text-white bg-green-600 rounded">Submit</button>
        <button className="px-4 py-2 ml-4 text-green-700 bg-green-100 border border-green-600 rounded">+ Bulk insert</button>
      </div>
    </div>
  );
};

export default AttendanceForm;
