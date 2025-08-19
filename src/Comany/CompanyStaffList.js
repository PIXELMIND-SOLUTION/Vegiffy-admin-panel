import React, { useEffect, useState } from "react";
import { FaFileCsv, FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CompanyStaffList = () => {
  const navigate = useNavigate()
  const companyId = localStorage.getItem("companyId");

  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedStaff, setUpdatedStaff] = useState({});

  const handleViewHistory = (staffId) => {
    navigate(`/company/staff-history/${staffId}`);
  };
  

  useEffect(() => {
    if (!companyId) {
      console.error("Company ID not found in localStorage.");
      return;
    }

    axios
      .get(`https://credenhealth.onrender.com/api/admin/companystaffs/${companyId}`)
      .then((response) => {
        setStaffs(response.data.company.staff);
      })
      .catch((error) => {
        console.error("Error fetching staff data:", error);
      });
  }, [companyId]);

  const filteredStaffs = staffs.filter((staff) =>
    staff.name.toLowerCase().includes(search.toLowerCase())
  );

  const headers = [
    { label: "Name", key: "name" },
    { label: "Role", key: "role" },
    { label: "Department", key: "department" },
    { label: "Contact Number", key: "contact" },
    { label: "Email", key: "email" },
    { label: "DOB", key: "dob" },
    { label: "Gender", key: "gender" },
    { label: "Age", key: "age" },
    { label: "Address", key: "address" },
    { label: "Wallet Amount", key: "wallet_balance" },
  ];


  

  const handleBulkImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const imported = XLSX.utils.sheet_to_json(worksheet);

      console.log("Imported Staffs:", imported);
      alert("Staff data imported successfully!");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setUpdatedStaff(staff);
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    setStaffs(staffs.filter((s) => s._id !== id));
  };

  const openAddAmountModal = (staff) => {
    setSelectedStaff(staff);
    setAmountToAdd("");
    setShowModal(true);
  };

  const closeAddAmountModal = () => {
    setSelectedStaff(null);
    setShowModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedStaff(null);
  };

  const handleAddAmount = async () => {
    if (!amountToAdd || isNaN(amountToAdd)) {
      alert("Please enter a valid amount.");
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await axios.post(
        `https://credenhealth.onrender.com/api/admin/addamount/${selectedStaff._id}/${companyId}`,
        {
          amount: parseFloat(amountToAdd),
          from: "Company",
        }
      );
  
      if (res.status === 200) {
        // Update the wallet balance directly in the state
        const updatedStaffs = staffs.map((staff) =>
          staff._id === selectedStaff._id
            ? {
                ...staff,
                wallet_balance: (parseFloat(staff.wallet_balance) || 0) + parseFloat(amountToAdd),
              }
            : staff
        );
        setStaffs(updatedStaffs);
  
        closeAddAmountModal();
        alert("Amount added successfully!");
      } else {
        alert("Failed to add amount.");
      }
    } catch (error) {
      console.error("Error adding amount:", error);
      alert("Failed to add amount.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `https://credenhealth.onrender.com/api/admin/editstaff/${selectedStaff._id}`,
        updatedStaff
      );

      if (res.status === 200) {
        const updatedStaffs = staffs.map((s) =>
          s._id === selectedStaff._id ? { ...s, ...updatedStaff } : s
        );
        setStaffs(updatedStaffs);
        setShowEditModal(false);
        alert("Staff updated successfully!");
      } else {
        alert("Failed to update staff.");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("Error updating staff.");
    }
  };


  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Company Staff List</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by staff name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CSVLink
          data={filteredStaffs}
          headers={headers}
          filename="company_staff_list.csv"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
        >
          <FaFileCsv /> CSV
        </CSVLink>

        <label
          htmlFor="import-file"
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <FaUpload /> Bulk Import
          <input
            type="file"
            accept=".xlsx, .xls"
            id="import-file"
            onChange={handleBulkImport}
            className="hidden"
          />
        </label>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">Name</th>
              <th className="p-2 border text-left">Department</th>
              <th className="p-2 border text-left">Contact</th>
              <th className="p-2 border text-left">Email</th>
              <th className="p-2 border text-left">Gender</th>
              <th className="p-2 border text-left">Age</th>
              <th className="p-2 border text-left">Address</th>
              <th className="p-2 border text-left">Wallet Amount</th>
              <th className="p-2 border text-left">Add Amount</th>
              <th className="p-2 border text-left">Actions</th>
              <th className="p-2 border text-left">History</th>

            </tr>
          </thead>
          <tbody>
            {filteredStaffs.map((staff) => (
              <tr key={staff._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{staff.name}</td>
                <td className="p-2 border">{staff.department}</td>
                <td className="p-2 border">{staff.contact}</td>
                <td className="p-2 border">{staff.email}</td>
                <td className="p-2 border">{staff.gender}</td>
                <td className="p-2 border">{staff.age}</td>
                <td className="p-2 border">{staff.address}</td>
                <td className="p-2 border">₹{staff.wallet_balance || 0}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => openAddAmountModal(staff)}
                    className="bg-purple-900 text-white px-2 py-1 rounded text-xs"
                  >
                    Add
                  </button>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(staff)}
                    className="text-blue-500 text-lg mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(staff._id)}
                    className="text-red-500 text-lg"
                  >
                    <FaTrash />
                  </button>
                </td>
                <td className="p-2 border">
  <button
    onClick={() => handleViewHistory(staff._id)}
    className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
  >
    View
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding amount */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="text-lg font-semibold mb-4">Add Amount</h3>
            <input
              type="number"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeAddAmountModal}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAmount}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing staff */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Edit Staff</h3>
            <form onSubmit={handleSubmitEdit}>
              {["name", "email", "contact", "role", "department", "dob", "gender", "age", "address"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={updatedStaff[field] || ""}
                  onChange={(e) =>
                    setUpdatedStaff({ ...updatedStaff, [field]: e.target.value })
                  }
                  className="w-full mb-2 px-3 py-2 border rounded"
                />
              ))}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyStaffList;
