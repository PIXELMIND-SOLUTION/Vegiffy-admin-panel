import { saveAs } from "file-saver";
import React, { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const SalaryAdvanceList = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [data, setData] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    salaryMonth: "",
    status: "Active",
  });

  // Fetch all salary advances from API
  useEffect(() => {
    fetch("https://hr-backend-hifb.onrender.com/api/hr/all-salaries")
      .then((response) => response.json())
      .then((data) => {
        setData(data.map((item) => ({
          ...item,
          name: item.employeeName || "N/A", // Handling missing employee name
          amount: item.amount || "0", // Handling missing amount
          releaseAmount: "0", // default value for releaseAmount
          salaryMonth: item.salaryMonth || "N/A", // Handling missing salary month
          status: item.isActive ? "Active" : "Inactive", // Determining status
        })));
      });
  }, []);

  // Create a new salary advance
  const handleSave = () => {
    if (formData.name && formData.amount && formData.salaryMonth) {
      fetch("https://hr-backend-hifb.onrender.com/api/hr/create-salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeName: formData.name,
          amount: formData.amount,
          salaryMonth: formData.salaryMonth,
          isActive: formData.status === "Active",
        }),
      })
        .then((response) => response.json())
        .then((newItem) => {
          setData([...data, newItem]);
          setShowModal(false);
          setFormData({ name: "", amount: "", salaryMonth: "", status: "Active" });
        });
    }
  };

  // Edit an existing salary advance
  const handleEdit = (id) => {
    const selectedItem = data.find((item) => item.id === id);
    setFormData(selectedItem);
    setEditingId(id);
    setShowModal(true);
  };

  // Update an existing salary advance
  const handleUpdate = () => {
    fetch(`https://hr-backend-hifb.onrender.com/api/hr/update-notice/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeName: formData.name,
        amount: formData.amount,
        salaryMonth: formData.salaryMonth,
        isActive: formData.status === "Active",
      }),
    })
      .then((response) => response.json())
      .then((updatedItem) => {
        const updatedData = data.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        );
        setData(updatedData);
        setShowModal(false);
        setFormData({ name: "", amount: "", salaryMonth: "", status: "Active" });
      });
  };

  // Delete a salary advance
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      fetch(`https://hr-backend-hifb.onrender.com/api/hr/delete-notice/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then(() => {
          setData(data.filter((item) => item.id !== id));
        });
    }
  };

  const headers = [
    { label: "SI", key: "id" },
    { label: "Employee Name", key: "name" },
    { label: "Amount", key: "amount" },
    { label: "Release Amount", key: "releaseAmount" },
    { label: "Salary Month", key: "salaryMonth" },
    { label: "Status", key: "status" },
  ];

  // Safely handle the search filter
  const filteredData = data.filter((item) =>
    (item.name || "").toLowerCase().includes(search?.toLowerCase() || "")
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Advance");

    // Convert to Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const excelFile = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });

    saveAs(excelFile, "Salary_Advance.xlsx");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Salary Advanced List</h2>
          <button
            className="px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
            onClick={() => setShowModal(true)}
          >
            + Add salary advance
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-1/3 p-6 bg-white rounded shadow-lg">
              <h2 className="mb-4 text-lg font-bold">{editingId ? "Edit" : "Add"} salary advance</h2>
              <label className="block mb-2 font-bold">Employee*</label>
              <input
                type="text"
                className="w-full p-2 mb-2 border rounded"
                placeholder="Employee name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <label className="block mb-2 font-bold">Amount*</label>
              <input
                type="text"
                className="w-full p-2 mb-2 border rounded"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <label className="block mb-2 font-bold">Salary month*</label>
              <input
                type="month"
                className="w-full p-2 mb-2 border rounded"
                value={formData.salaryMonth}
                onChange={(e) => setFormData({ ...formData, salaryMonth: e.target.value })}
              />
              <label className="block mb-2 font-bold">Is active*</label>
              <div className="flex items-center gap-4 mb-4">
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formData.status === "Active"}
                    onChange={() => setFormData({ ...formData, status: "Active" })}
                    className="mr-1"
                  />{" "}
                  Active
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={formData.status === "Inactive"}
                    onChange={() => setFormData({ ...formData, status: "Inactive" })}
                    className="mr-1"
                  />{" "}
                  Inactive
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
                  onClick={editingId ? handleUpdate : handleSave}
                >
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <CSVLink
              data={data}
              headers={headers}
              filename="salary_advance_list.csv"
              className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
            >
              <FaFileCsv /> CSV
            </CSVLink>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 text-green-700 bg-green-100 border border-green-600 rounded"
            >
              <FaFileExcel /> Excel
            </button>
          </div>

          <input
            type="text"
            placeholder="Search..."
            className="p-2 border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="w-full border border-collapse border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">SI</th>
              <th className="p-2 border">Employee Name</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Release Amount</th>
              <th className="p-2 border">Salary Month</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item._id || item.id} className="text-center bg-white border">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{item.name || "null"}</td>
                <td className="p-2 border">{item.amount || "null"}</td>
                <td className="p-2 border">{item.releaseAmount || "null"}</td>
                <td className="p-2 border">{item.salaryMonth || "null"}</td>
                <td className={`p-2 border ${item.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                  {item.status || "null"}
                </td>
                <td className="flex justify-center gap-2 p-2 border">
                  <button
                    className="px-2 py-1 text-blue-700 bg-blue-100 border border-blue-600 rounded"
                    onClick={() => handleEdit(item.id)}
                  >
                    ✏️
                  </button>
                  <button
                    className="px-2 py-1 text-red-700 bg-red-100 border border-red-600 rounded"
                    onClick={() => handleDelete(item.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded">Previous</button>
          <button className="px-4 py-2 bg-gray-300 rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default SalaryAdvanceList;
