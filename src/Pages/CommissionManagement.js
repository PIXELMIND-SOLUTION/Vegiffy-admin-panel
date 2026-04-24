import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaMinus, FaCheck, FaPercentage, FaUserTie, FaStore } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function CommissionManagement() {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [formData, setFormData] = useState({ 
    type: "", // Changed from userType to type
    userId: "", 
    commission: "" 
  });
  const [commissions, setCommissions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [ambassadorLoading, setAmbassadorLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const commissionsPerPage = 5;

  // API Base URL
  const API_BASE_URL = "https://api.vegiffy.in/api/admin";

  // User type options
  const userTypes = [
    { value: "vendor", label: "Vendor User", icon: FaStore },
    { value: "ambassador", label: "Ambassador User", icon: FaUserTie }
  ];

  // Get All Data
  useEffect(() => {
    fetchCommissions();
    fetchVendors();
    fetchAmbassadors();
  }, []);

  // GET ALL COMMISSIONS
  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.vegiffy.in/api/getCommissions`);
      console.log("Commissions response:", response.data);
      
      // Map backend data to match frontend structure
      const formattedCommissions = response.data.data.map(commission => ({
        _id: commission._id,
        type: commission.type,
        userId: commission.vendorId || commission.ambassadorId,
        percentage: commission.commission,
        status: commission.status || "active",
        createdAt: commission.createdAt || new Date().toISOString()
      }));
      
      setCommissions(formattedCommissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      alert("Error fetching commissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    setVendorLoading(true);
    try {
      const response = await axios.get(`https://api.vegiffy.in/api/restaurant`);
      const vendorData = response.data.data || response.data || [];
      console.log("Vendors fetched:", vendorData);
      setVendors(vendorData);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      alert("Error fetching vendors");
    } finally {
      setVendorLoading(false);
    }
  };

  const fetchAmbassadors = async () => {
    setAmbassadorLoading(true);
    try {
      const response = await axios.get(`https://api.vegiffy.in/api/ambsdor/allambsdor`);
      const ambassadorData = response.data.data || response.data || [];
      console.log("Ambassadors fetched:", ambassadorData);
      setAmbassadors(ambassadorData);
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
      alert("Error fetching ambassadors");
    } finally {
      setAmbassadorLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getUserName = (commission) => {
    if (commission.type === "vendor") {
      const vendor = vendors.find(v => v._id === commission.userId);
      return vendor ? vendor.restaurantName : "Unknown Vendor";
    } else {
      const ambassador = ambassadors.find(a => a._id === commission.userId);
      return ambassador ? ambassador.fullName : "Unknown Ambassador";
    }
  };

  const exportData = (type) => {
    const filteredCommissions = commissions.filter((commission) => {
      const userName = getUserName(commission).toLowerCase();
      return userName.includes(search.toLowerCase());
    });
    
    const exportData = filteredCommissions.map(commission => ({
      "User Type": commission.type === "vendor" ? "Vendor User" : "Ambassador User",
      "User Name": getUserName(commission),
      "Commission": `${commission.percentage}%`,
      "Status": commission.status,
      "Created At": new Date(commission.createdAt).toLocaleDateString()
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Commissions");
    writeFile(wb, `commissions.${type}`);
  };

  // DELETE COMMISSION API
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/deleteCommission/${selectedCommission._id}`);
      
      if (response.data.success) {
        setCommissions(commissions.filter((commission) => commission._id !== selectedCommission._id));
        setDeleteModal(false);
        setSuccessMessage("Commission deleted successfully!");
        setSuccessModal(true);
      } else {
        alert(response.data.message || "Error deleting commission");
      }
    } catch (error) {
      console.error("Error deleting commission:", error);
      alert(error.response?.data?.message || "Error deleting commission");
    }
  };

  // EDIT COMMISSION API
  const handleEdit = async () => {
    try {
      if (!formData.type || !formData.userId || !formData.commission) {
        alert("Please fill all required fields");
        return;
      }

      // Prepare data according to backend structure
      const updateData = {
        type: formData.type, // Changed to type
        userId: formData.userId,
        commission: Number(formData.commission) // Convert to number
      };

      console.log("Updating commission with:", updateData);

      const response = await axios.put(
        `${API_BASE_URL}/updateCommission/${selectedCommission._id}`, 
        updateData
      );
      
      if (response.data.success) {
        // Update the commission in state
        const updatedCommission = {
          _id: selectedCommission._id,
          type: response.data.data.type,
          userId: response.data.data.vendorId || response.data.data.ambassadorId,
          percentage: response.data.data.commission,
          status: response.data.data.status || "active",
          createdAt: response.data.data.createdAt || selectedCommission.createdAt
        };
        
        const updatedCommissions = commissions.map((commission) =>
          commission._id === selectedCommission._id ? updatedCommission : commission
        );
        
        setCommissions(updatedCommissions);
        setEditModal(false);
        setSuccessMessage("Commission updated successfully!");
        setSuccessModal(true);
      } else {
        alert(response.data.message || "Error updating commission");
      }
    } catch (error) {
      console.error("Error updating commission:", error);
      alert(error.response?.data?.message || "Error updating commission");
    }
  };

  // CREATE COMMISSION API
  const handleAddCommission = async () => {
    if (!formData.type || !formData.userId || !formData.commission) {
      alert("Please fill all required fields");
      return;
    }

    // Prepare data according to backend structure
    const commissionData = {
      type: formData.type, // Changed to type
      userId: formData.userId,
      commission: Number(formData.commission) // Convert to number
    };

    console.log("Creating commission with:", commissionData);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/addCommission`, 
        commissionData
      );
      
      if (response.data.success) {
        // Format the new commission to match frontend structure
        const newCommission = {
          _id: response.data.data._id,
          type: response.data.data.type,
          userId: response.data.data.vendorId || response.data.data.ambassadorId,
          percentage: response.data.data.commission,
          status: response.data.data.status || "active",
          createdAt: response.data.data.createdAt || new Date().toISOString()
        };
        
        setCommissions([...commissions, newCommission]);
        resetForm();
        setSuccessMessage("Commission created successfully!");
        setSuccessModal(true);
      } else {
        alert(response.data.message || "Error creating commission");
      }
    } catch (error) {
      console.error("Error creating commission:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error creating commission");
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ 
      type: "", 
      userId: "", 
      commission: "" 
    });
  };

  // Get users based on selected type
  const getUsers = () => {
    if (formData.type === "vendor") {
      return vendors;
    } else if (formData.type === "ambassador") {
      return ambassadors;
    }
    return [];
  };

  // Get user display name based on type
  const getUserDisplayName = (user) => {
    if (formData.type === "vendor") {
      return user.restaurantName || "Unnamed Vendor";
    } else if (formData.type === "ambassador") {
      return user.fullName || user.name || "Unnamed Ambassador";
    }
    return "";
  };

  // Pagination
  const filteredCommissions = commissions.filter((commission) => {
    const userName = getUserName(commission).toLowerCase();
    return userName.includes(search.toLowerCase());
  });
  const indexOfLastCommission = currentPage * commissionsPerPage;
  const indexOfFirstCommission = indexOfLastCommission - commissionsPerPage;
  const currentCommissions = filteredCommissions.slice(indexOfFirstCommission, indexOfLastCommission);
  const totalPages = Math.ceil(filteredCommissions.length / commissionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaPercentage className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
              <p className="text-gray-600">Manage commission percentages for individual vendors and ambassadors</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Add Commission Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-green-900 mb-6 flex items-center gap-2">
                <FaPlus className="w-5 h-5" />
                Create New Commission
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Type *
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    name="type" // Changed from userType to type
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select User Type</option>
                    {userTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === "vendor" ? "Select Vendor *" : 
                     formData.type === "ambassador" ? "Select Ambassador *" : 
                     "Select User *"}
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    disabled={!formData.type || (formData.type === "vendor" && vendorLoading) || (formData.type === "ambassador" && ambassadorLoading)}
                  >
                    <option value="">Select {formData.type === "vendor" ? "Vendor" : "Ambassador"}</option>
                    {getUsers().map((user) => (
                      <option key={user._id} value={user._id}>
                        {getUserDisplayName(user)}
                      </option>
                    ))}
                  </select>
                  {(vendorLoading && formData.type === "vendor") && (
                    <p className="text-xs text-gray-500 mt-1">Loading vendors...</p>
                  )}
                  {(ambassadorLoading && formData.type === "ambassador") && (
                    <p className="text-xs text-gray-500 mt-1">Loading ambassadors...</p>
                  )}
                  {formData.type && getUsers().length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No {formData.type === "vendor" ? "vendors" : "ambassadors"} found
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission (%) *
                  </label>
                  <div className="relative">
                    <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      name="commission"
                      type="number"
                      value={formData.commission}
                      onChange={handleInputChange}
                      placeholder="Enter commission percentage"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    onClick={resetForm}
                  >
                    Reset
                  </button>
                  <button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    onClick={handleAddCommission}
                  >
                    Create Commission
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Commissions Table */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Commission List</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Total {commissions.length} commissions • Showing {currentCommissions.length} commissions
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <input
                      className="w-full sm:w-64 p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Search by user name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                      onClick={() => exportData("csv")}
                    >
                      📥 CSV
                    </button>
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                      onClick={() => exportData("xlsx")}
                    >
                      📊 Excel
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading commissions...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-green-600">
                          <th className="p-3 border text-white text-left font-semibold text-sm">#</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">User Type</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">User Name</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Commission</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Status</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Created At</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCommissions.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-gray-500">
                              <FaPercentage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p>No commissions found</p>
                              {search && (
                                <p className="text-sm mt-1">Try adjusting your search</p>
                              )}
                            </td>
                          </tr>
                        ) : (
                          currentCommissions.map((commission, index) => {
                            const UserIcon = commission.type === "vendor" ? FaStore : FaUserTie;
                            const userName = getUserName(commission);
                            
                            return (
                              <tr key={commission._id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-3 border text-gray-700 text-sm">
                                  {indexOfFirstCommission + index + 1}
                                </td>
                                <td className="p-3 border text-gray-700 font-medium text-sm">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className={`w-4 h-4 ${
                                      commission.type === "vendor" ? "text-blue-600" : "text-purple-600"
                                    }`} />
                                    {commission.type === "vendor" ? "Vendor User" : "Ambassador User"}
                                  </div>
                                </td>
                                <td className="p-3 border text-gray-700 text-sm">
                                  {userName}
                                </td>
                                <td className="p-3 border text-gray-700 text-sm font-semibold">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                    {commission.percentage}%
                                  </span>
                                </td>
                                <td className="p-3 border">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    commission.status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {commission.status}
                                  </span>
                                </td>
                                <td className="p-3 border text-gray-700 text-sm">
                                  {new Date(commission.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 border">
                                  <div className="flex gap-2">
                                    <button
                                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition duration-200 flex items-center"
                                      onClick={() => {
                                        setEditModal(true);
                                        setSelectedCommission(commission);
                                        setFormData({
                                          type: commission.type, // Changed to type
                                          userId: commission.userId,
                                          commission: commission.percentage.toString()
                                        });
                                      }}
                                      title="Edit Commission"
                                    >
                                      <FaEdit className="w-3 h-3" />
                                    </button>
                                    <button
                                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200 flex items-center"
                                      onClick={() => {
                                        setDeleteModal(true);
                                        setSelectedCommission(commission);
                                      }}
                                      title="Delete Commission"
                                    >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} • {filteredCommissions.length} commissions
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition duration-200 text-sm"
                        >
                          Previous
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`px-3 py-1 rounded-lg transition duration-200 text-sm ${
                              currentPage === index + 1 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition duration-200 text-sm"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Commission Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaEdit className="text-green-600" />
              Edit Commission
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type *
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  name="type" // Changed from userType to type
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="">Select User Type</option>
                  {userTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === "vendor" ? "Select Vendor *" : 
                   formData.type === "ambassador" ? "Select Ambassador *" : 
                   "Select User *"}
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  disabled={!formData.type}
                >
                  <option value="">Select {formData.type === "vendor" ? "Vendor" : "Ambassador"}</option>
                  {getUsers().map((user) => (
                    <option key={user._id} value={user._id}>
                      {getUserDisplayName(user)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission (%) *
                </label>
                <div className="relative">
                  <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    name="commission"
                    type="number"
                    value={formData.commission}
                    onChange={handleInputChange}
                    placeholder="Enter commission percentage"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition duration-200"
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
                onClick={handleEdit}
              >
                Update Commission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaTrash className="text-red-500" />
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-2">Are you sure you want to delete this commission?</p>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            
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
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            
            <div className="flex justify-center">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
                onClick={() => setSuccessModal(false)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}