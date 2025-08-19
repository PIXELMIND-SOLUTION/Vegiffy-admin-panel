import React from "react";

const MissingAttendance = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="max-w-xl p-6 mx-auto bg-white shadow-lg rounded-xl">
        <h3 className="mb-4 text-2xl font-semibold text-gray-800">Missing Attendance</h3>
        <p className="text-lg text-gray-600">
          List of employees with missing attendance records will appear here.
        </p>
      </div>
    </div>
  );
};

export default MissingAttendance;
