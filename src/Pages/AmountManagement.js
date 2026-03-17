import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function AmountManagement() {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [formData, setFormData] = useState({ type: "", amount: "" });
  const [amounts, setAmounts] = useState([]);
  const [customTypes, setCustomTypes] = useState([
    "Ambsaddor to Ambsaddor",
    "Ambsaddor to Vendor", 
    "Vendor to User",
    "Vendor to Vendor"
  ]);
  const [newCustomType, setNewCustomType] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const amountsPerPage = 5;

  // API Base URL
  const API_BASE_URL = "https://api.vegiffyy.com/api/admin";

  // 1. Get All Amounts API
  useEffect(() => {
    fetchAmounts();
  }, []);

  const fetchAmounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-all`);
      setAmounts(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching amounts:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const exportData = (type) => {
    const filteredAmounts = amounts.filter((amount) => 
      amount.type.toLowerCase().includes(search.toLowerCase())
    );
    const ws = utils.json_to_sheet(filteredAmounts);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Amounts");
    writeFile(wb, `amounts.${type}`);
  };

  // 4. Delete Amount API
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/delete/${selectedAmount._id}`);
      setAmounts(amounts.filter((amount) => amount._id !== selectedAmount._id));
      setDeleteModal(false);
      setSuccessModal(true);
    } catch (error) {
      console.error("Error deleting amount:", error);
    }
  };

  // 3. Edit Amount API
  const handleEdit = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/update/${selectedAmount._id}`, formData);
      
      const updatedAmounts = amounts.map((amount) =>
        amount._id === selectedAmount._id ? response.data.data : amount
      );
      setAmounts(updatedAmounts);
      setEditModal(false);
      setSuccessModal(true);
    } catch (error) {
      console.error("Error updating amount:", error);
    }
  };

  // 2. Create Amount API
  const handleAddAmount = async () => {
    if (!formData.type || !formData.amount) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/create`, formData);
      setAmounts([...amounts, response.data.data]);
      setFormData({ type: "", amount: "" });
      setSuccessModal(true);
    } catch (error) {
      console.error("Error creating amount:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const addCustomType = () => {
    if (newCustomType && !customTypes.includes(newCustomType)) {
      setCustomTypes([...customTypes, newCustomType]);
      setFormData({ ...formData, type: newCustomType });
      setNewCustomType("");
    }
  };

  const removeCustomType = (typeToRemove) => {
    if (!["Ambsaddor to Ambsaddor", "Ambsaddor to Vendor", "Vendor to User", "Vendor to Vendor"].includes(typeToRemove)) {
      setCustomTypes(customTypes.filter(type => type !== typeToRemove));
      if (formData.type === typeToRemove) {
        setFormData({ ...formData, type: "" });
      }
    }
  };

  // Pagination
  const filteredAmounts = amounts.filter((amount) =>
    amount.type ? amount.type.toLowerCase().includes(search.toLowerCase()) : ''
  );
  const indexOfLastAmount = currentPage * amountsPerPage;
  const indexOfFirstAmount = indexOfLastAmount - amountsPerPage;
  const currentAmounts = filteredAmounts.slice(indexOfFirstAmount, indexOfLastAmount);
  const totalPages = Math.ceil(filteredAmounts.length / amountsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Add Amount Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-900 mb-6">Add New Amount</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Type</option>
                    {customTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                  />
                </div>
                
                <button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  onClick={handleAddAmount}
                >
                  + Add Amount
                </button>

                {/* Add Custom Type Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Manage Types</h3>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newCustomType}
                      onChange={(e) => setNewCustomType(e.target.value)}
                      placeholder="Add new type"
                    />
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition duration-200"
                      onClick={addCustomType}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {customTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{type}</span>
                        {!["Ambsaddor to Ambsaddor", "Ambsaddor to Vendor", "Vendor to User", "Vendor to Vendor"].includes(type) && (
                          <button
                            className="text-red-500 hover:text-red-700 transition duration-200"
                            onClick={() => removeCustomType(type)}
                          >
                            <FaMinus />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Amount Table */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-blue-900">Amount List</h2>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-200"
                      onClick={() => exportData("csv")}
                    >
                      CSV
                    </button>
                    <button 
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-200"
                      onClick={() => exportData("xlsx")}
                    >
                      Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-purple-600">
                      <th className="p-3 border text-white text-left font-semibold">Sl</th>
                      <th className="p-3 border text-white text-left font-semibold">Type</th>
                      <th className="p-3 border text-white text-left font-semibold">Amount</th>
                      <th className="p-3 border text-white text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAmounts.map((amount, index) => (
                      <tr key={amount._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 border text-gray-700">
                          {indexOfFirstAmount + index + 1}
                        </td>
                        <td className="p-3 border text-gray-700 font-medium">
                          {amount.type}
                        </td>
                        <td className="p-3 border text-gray-700">
                          ₹{amount.amount}
                        </td>
                        <td className="p-3 border">
                          <div className="flex gap-2">
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition duration-200"
                              onClick={() => {
                                setEditModal(true);
                                setSelectedAmount(amount);
                                setFormData({
                                  type: amount.type,
                                  amount: amount.amount
                                });
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200"
                              onClick={() => {
                                setDeleteModal(true);
                                setSelectedAmount(amount);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition duration-200"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-lg transition duration-200 ${
                        currentPage === index + 1 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Amount Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Amount</h2>
            
            <div className="space-y-4">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="">Select Type</option>
                {customTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Amount"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition duration-200"
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
                onClick={handleEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this amount entry?</p>
            
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition duration-200"
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Success!</h2>
            <p className="text-gray-600 mb-6">Amount has been successfully updated!</p>
            
            <div className="flex justify-end">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
                onClick={() => setSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}