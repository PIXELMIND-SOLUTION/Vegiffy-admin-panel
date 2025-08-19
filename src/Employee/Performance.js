import { saveAs } from "file-saver";
import React, { useState } from "react";
import { FaFileCsv, FaFileExcel, FaPlus } from "react-icons/fa";
import * as XLSX from "xlsx";

const Performance = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [dataSource, setDataSource] = useState([
    {
      id: 1,
      name: "Honorato Imogene Curry Terry",
      score: 64,
      date: "2025-01-25",
    },
    {
      id: 2,
      name: "Scarlet Melvin Reese Rogers",
      score: 57,
      date: "2025-01-25",
    },
    { id: 3, name: "Jerome Grace Willis Terry", score: 0, date: "2025-01-07" },
    {
      id: 4,
      name: "Honorato Imogene Curry Terry",
      score: 48,
      date: "2025-01-06",
    },
    {
      id: 5,
      name: "Aquila Elaine Jennings Jefferson",
      score: 0,
      date: "2024-12-23",
    },
    {
      id: 6,
      name: "Kristen Lillith Stout Rodriquez",
      score: 452,
      date: "2024-05-30",
    },
    {
      id: 7,
      name: "Aquila Elaine Jennings Jefferson",
      score: 215,
      date: "2024-05-30",
    },
    {
      id: 8,
      name: "Suchana Noel Mcfarland Mejia",
      score: 2149706304,
      date: "2024-05-30",
    },
  ]);
  const [formData, setFormData] = useState({
    employee: "",
    supervisor: "",
    reviewPeriod: "",
    ratings: {
      knowledge: "P",
      delivery: "P",
      achievement: "P",
    },
    scores: {
      knowledge: 0,
      delivery: 0,
      achievement: 0,
    },
    comments: {
      knowledge: "",
      delivery: "",
      achievement: "",
    },
  });

  const handleRatingChange = (criteria, value, score) => {
    setFormData((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [criteria]: value },
      scores: { ...prev.scores, [criteria]: score },
    }));
}

  const filteredData = dataSource.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCSV = () => {
    const csvContent = [
      "Employee Name,Score,Date",
      ...dataSource.map((emp) => `${emp.name},${emp.score},${emp.date}`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "Employee_Performance.csv");
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataSource);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "Employee_Performance.xlsx");
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="w-full min-h-screen p-6 mx-auto bg-white">
    <h2 className="mb-2 text-xl font-semibold text-left">Employee Performance List</h2>
    <div className="flex my-4 justify-left">
      <div className="flex space-x-4">
          <button
            onClick={downloadCSV}
            className="flex items-center px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
          >
            <FaFileCsv className="mr-2" /> CSV
          </button>
          <button
            onClick={downloadExcel}
            className="flex items-center px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
          >
            <FaFileExcel className="mr-2" /> Excel
          </button>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-2 border border-gray-300 rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
        >
          <FaPlus className="mr-2" /> Add Employee Performance
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-4 py-3 text-left">SI</th>
            <th className="px-4 py-3 text-left">Employee Name</th>
            <th className="px-4 py-3 text-left">Total Score</th>
            <th className="px-4 py-3 text-left">Create Date</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((employee, index) => (
            <tr key={employee.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="px-4 py-3">{employee.name}</td>
              <td className="px-4 py-3">{employee.score}</td>
              <td className="px-4 py-3">{employee.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
        >
          Next
        </button>
      </div>

      {modalOpen && 
      (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Employee Performance Review</h2>
        <button
          onClick={() => setModalOpen(false)}
          className="text-red-500 hover:text-red-700"
        >
          ✖
        </button>
      </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700">Name of Employee:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Employee Name"
              value={formData.employee}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700">Review Period:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Review Period in Months"
              value={formData.reviewPeriod}
              onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Name and Position of Supervisor:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Name and Position of Supervisor"
            value={formData.supervisor}
            onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
          />
        </div>
        <table className="w-full my-4 border border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Criteria</th>
              <th className="p-2 border">P (0)</th>
              <th className="p-2 border">NI (3)</th>
              <th className="p-2 border">G (6)</th>
              <th className="p-2 border">VG (9)</th>
              <th className="p-2 border">E (12)</th>
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Comments</th>
            </tr>
          </thead>
          <tbody>
            {[
              { key: "knowledge", label: "Demonstrated Knowledge & Quality of Work" },
              { key: "delivery", label: "Timeliness of Delivery" },
              { key: "achievement", label: "Impact of Achievement" },
            ].map(({ key, label }) => (
              <tr key={key}>
                <td className="p-2 border">{label}</td>
                {[0, 3, 6, 9, 12].map((score, index) => (
                  <td className="p-2 text-center border" key={index}>
                    <input
                      type="radio"
                      name={key}
                      value={score}
                      checked={formData.scores[key] === score}
                      onChange={() => handleRatingChange(key, score, score)}
                    />
                  </td>
                ))}
                <td className="p-2 text-center border">{formData.scores[key]}</td>
                <td className="p-2 border">
                  <input
                    type="text"
                    className="w-full p-1 border rounded"
                    placeholder="Enter comment"
                    value={formData.comments[key]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        comments: { ...prev.comments, [key]: e.target.value },
                      }))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <button className="px-6 py-2 text-green-700 bg-green-100 border border-green-600 rounded">Submit</button>
        </div>
      </div>
     </div>
      )}
    </div>
  );
};

export default Performance;     