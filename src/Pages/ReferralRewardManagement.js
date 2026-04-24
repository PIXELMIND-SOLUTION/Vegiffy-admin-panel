import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaRupeeSign, FaPercentage, FaUserTie, FaStore, FaUser, FaCheck, FaDownload } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function ReferralRewardManagement() {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedReward, setSelectedReward] = useState(null);
  const [formData, setFormData] = useState({ 
    userType: "", // vendor, ambassador, user
    rewardType: "rupees", // rupees or percentage
    rewardValue: "", // amount in rupees or percentage
    minOrderValue: "", // optional
    maxReward: "", // optional
  });
  
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rewardsPerPage = 5;

  // API Base URL
  const API_BASE_URL = "https://api.vegiffy.in/api/admin";

  // User type options
  const userTypes = [
    { value: "vendor", label: "Vendor", icon: FaStore },
    { value: "ambassador", label: "Ambassador", icon: FaUserTie },
    { value: "user", label: "Regular User", icon: FaUser }
  ];

  // Reward type options
  const rewardTypes = [
    { value: "rupees", label: "Rupees (₹)", icon: FaRupeeSign },
    { value: "percentage", label: "Percentage (%)", icon: FaPercentage }
  ];

  // Get All Data
  useEffect(() => {
    fetchRewards();
  }, []);

  // GET ALL REWARDS
  const fetchRewards = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.vegiffy.in/api/getReferralRewards`);
      console.log("Rewards response:", response.data);
      
      // Map backend data to match frontend structure
      const formattedRewards = response.data.data?.map(reward => ({
        _id: reward._id,
        userType: reward.userType,
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        minOrderValue: reward.minOrderValue || 0,
        maxReward: reward.maxReward || 0,
        createdAt: reward.createdAt || new Date().toISOString(),
        // For display
        displayValue: reward.rewardType === "rupees" 
          ? `₹${reward.rewardValue}` 
          : `${reward.rewardValue}%`,
        displayMaxReward: reward.maxReward ? 
          (reward.rewardType === "rupees" ? `₹${reward.maxReward}` : `₹${reward.maxReward}`) 
          : "No limit"
      })) || [];
      
      setRewards(formattedRewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getUserTypeLabel = (userType) => {
    switch(userType) {
      case "vendor":
        return "Vendor";
      case "ambassador":
        return "Ambassador";
      case "user":
        return "Regular User";
      default:
        return "Unknown";
    }
  };

  const exportData = (type) => {
    const filteredRewards = rewards.filter((reward) => {
      const userTypeLabel = getUserTypeLabel(reward.userType).toLowerCase();
      return userTypeLabel.includes(search.toLowerCase());
    });
    
    const exportData = filteredRewards.map(reward => ({
      "User Type": getUserTypeLabel(reward.userType),
      "Reward Type": reward.rewardType === "rupees" ? "Fixed Amount" : "Percentage",
      "Reward Value": reward.displayValue,
      "Min Order Value": reward.minOrderValue ? `₹${reward.minOrderValue}` : "No minimum",
      "Max Reward": reward.displayMaxReward,
      "Created At": new Date(reward.createdAt).toLocaleDateString()
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "ReferralRewards");
    writeFile(wb, `referral_rewards.${type}`);
  };

  // DELETE REWARD API
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/deleteReferralReward/${selectedReward._id}`);
      
      if (response.data.success) {
        setRewards(rewards.filter((reward) => reward._id !== selectedReward._id));
        setDeleteModal(false);
        setSuccessMessage("Referral reward deleted successfully!");
        setSuccessModal(true);
      } else {
        alert(response.data.message || "Error deleting reward");
      }
    } catch (error) {
      console.error("Error deleting reward:", error);
      alert(error.response?.data?.message || "Error deleting reward");
    }
  };

  // EDIT REWARD API
  const handleEdit = async () => {
    try {
      if (!formData.userType || !formData.rewardValue) {
        alert("Please fill all required fields");
        return;
      }

      // Prepare data according to backend structure
      const updateData = {
        userType: formData.userType,
        rewardType: formData.rewardType,
        rewardValue: Number(formData.rewardValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        maxReward: formData.maxReward ? Number(formData.maxReward) : 0,
      };

      console.log("Updating reward with:", updateData);

      const response = await axios.put(
        `${API_BASE_URL}/updateReferralReward/${selectedReward._id}`, 
        updateData
      );
      
      if (response.data.success) {
        // Update the reward in state
        const updatedReward = {
          _id: selectedReward._id,
          ...response.data.data,
          displayValue: response.data.data.rewardType === "rupees" 
            ? `₹${response.data.data.rewardValue}` 
            : `${response.data.data.rewardValue}%`,
          displayMaxReward: response.data.data.maxReward ? 
            `₹${response.data.data.maxReward}` 
            : "No limit"
        };
        
        const updatedRewards = rewards.map((reward) =>
          reward._id === selectedReward._id ? updatedReward : reward
        );
        
        setRewards(updatedRewards);
        setEditModal(false);
        setSuccessMessage("Referral reward updated successfully!");
        setSuccessModal(true);
      } else {
        alert(response.data.message || "Error updating reward");
      }
    } catch (error) {
      console.error("Error updating reward:", error);
      alert(error.response?.data?.message || "Error updating reward");
    }
  };

  // CREATE REWARD API
  const handleAddReward = async () => {
    if (!formData.userType || !formData.rewardValue) {
      alert("Please fill all required fields");
      return;
    }

    // Check if reward already exists for this user type
    const existingReward = rewards.find(reward => 
      reward.userType === formData.userType
    );
    
    if (existingReward) {
      if (!window.confirm(`A reward already exists for ${getUserTypeLabel(formData.userType)}. Do you want to replace it?`)) {
        return;
      }
    }

    // Prepare data according to backend structure
    const rewardData = {
      userType: formData.userType,
      rewardType: formData.rewardType,
      rewardValue: Number(formData.rewardValue),
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
      maxReward: formData.maxReward ? Number(formData.maxReward) : 0,
    };

    console.log("Creating reward with:", rewardData);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/addReferralReward`, 
        rewardData
      );
      
      if (response.data.success) {
        // Format the new reward to match frontend structure
        const newReward = {
          _id: response.data.data._id,
          ...response.data.data,
          displayValue: response.data.data.rewardType === "rupees" 
            ? `₹${response.data.data.rewardValue}` 
            : `${response.data.data.rewardValue}%`,
          displayMaxReward: response.data.data.maxReward ? 
            `₹${response.data.data.maxReward}` 
            : "No limit",
          createdAt: response.data.data.createdAt || new Date().toISOString()
        };
        
        // Remove existing reward for same user type if exists
        const filteredRewards = rewards.filter(reward => 
          reward.userType !== formData.userType
        );
        
        setRewards([...filteredRewards, newReward]);
        resetForm();
        setSuccessMessage("Referral reward created successfully!");
        setSuccessModal(true);
      } else {
        alert(response.data.message || "Error creating reward");
      }
    } catch (error) {
      console.error("Error creating reward:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error creating reward");
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ 
      userType: "", 
      rewardType: "rupees",
      rewardValue: "",
      minOrderValue: "",
      maxReward: "",
    });
  };

  // Pagination
  const filteredRewards = rewards.filter((reward) => {
    const userTypeLabel = getUserTypeLabel(reward.userType).toLowerCase();
    return userTypeLabel.includes(search.toLowerCase());
  });
  const indexOfLastReward = currentPage * rewardsPerPage;
  const indexOfFirstReward = indexOfLastReward - rewardsPerPage;
  const currentRewards = filteredRewards.slice(indexOfFirstReward, indexOfLastReward);
  const totalPages = Math.ceil(filteredRewards.length / rewardsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaRupeeSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Referral Reward Management</h1>
              <p className="text-gray-600">Manage referral rewards for different user types</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Add Reward Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
                <FaPlus className="w-5 h-5" />
                Create New Referral Reward
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Type *
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="userType"
                    value={formData.userType}
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
                    Reward Type *
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="rewardType"
                    value={formData.rewardType}
                    onChange={handleInputChange}
                  >
                    {rewardTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Value *
                    {formData.rewardType === "percentage" && " (0-100%)"}
                  </label>
                  <div className="relative">
                    {formData.rewardType === "rupees" ? (
                      <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    ) : (
                      <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    )}
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="rewardValue"
                      type="number"
                      value={formData.rewardValue}
                      onChange={handleInputChange}
                      placeholder={formData.rewardType === "rupees" ? "Enter amount in rupees" : "Enter percentage"}
                      min="0"
                      max={formData.rewardType === "percentage" ? "100" : ""}
                      step={formData.rewardType === "percentage" ? "0.01" : "1"}
                    />
                  </div>
                  {formData.rewardType === "percentage" && formData.rewardValue && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.rewardValue}% of order value
                    </p>
                  )}
                </div>

                {formData.rewardType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Reward Amount (Optional)
                    </label>
                    <div className="relative">
                      <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="maxReward"
                        type="number"
                        value={formData.maxReward}
                        onChange={handleInputChange}
                        placeholder="Enter maximum reward amount"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Caps the reward amount for percentage-based rewards</p>
                  </div>
                )}
                
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    onClick={resetForm}
                  >
                    Reset
                  </button>
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    onClick={handleAddReward}
                  >
                    Create Reward
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Rewards Table */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900">Referral Rewards List</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Total {rewards.length} rewards • Showing {currentRewards.length} rewards
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <input
                      className="w-full sm:w-64 p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search by user type..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                      onClick={() => exportData("csv")}
                    >
                      <FaDownload className="w-4 h-4" />
                      CSV
                    </button>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                      onClick={() => exportData("xlsx")}
                    >
                      <FaDownload className="w-4 h-4" />
                      Excel
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading referral rewards...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-blue-600">
                          <th className="p-3 border text-white text-left font-semibold text-sm">#</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">User Type</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Reward Type</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Reward Value</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Min Order</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Max Reward</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Created At</th>
                          <th className="p-3 border text-white text-left font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRewards.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="p-8 text-center text-gray-500">
                              <FaRupeeSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p>No referral rewards found</p>
                              {search && (
                                <p className="text-sm mt-1">Try adjusting your search</p>
                              )}
                            </td>
                          </tr>
                        ) : (
                          currentRewards.map((reward, index) => {
                            const UserIcon = reward.userType === "vendor" ? FaStore : 
                                           reward.userType === "ambassador" ? FaUserTie : FaUser;
                            const RewardIcon = reward.rewardType === "rupees" ? FaRupeeSign : FaPercentage;
                            
                            return (
                              <tr key={reward._id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-3 border text-gray-700 text-sm">
                                  {indexOfFirstReward + index + 1}
                                </td>
                                <td className="p-3 border text-gray-700 font-medium text-sm">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className={`w-4 h-4 ${
                                      reward.userType === "vendor" ? "text-green-600" : 
                                      reward.userType === "ambassador" ? "text-purple-600" : "text-blue-600"
                                    }`} />
                                    {getUserTypeLabel(reward.userType)}
                                  </div>
                                </td>
                                <td className="p-3 border text-gray-700 text-sm">
                                  <div className="flex items-center gap-2">
                                    <RewardIcon className={`w-4 h-4 ${
                                      reward.rewardType === "rupees" ? "text-green-600" : "text-orange-600"
                                    }`} />
                                    {reward.rewardType === "rupees" ? "Fixed Amount" : "Percentage"}
                                  </div>
                                </td>
                                <td className="p-3 border text-gray-700 text-sm font-semibold">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    reward.rewardType === "rupees" 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-orange-100 text-orange-800'
                                  }`}>
                                    {reward.displayValue}
                                  </span>
                                </td>
                                <td className="p-3 border text-gray-700 text-sm">
                                  {reward.minOrderValue > 0 ? `₹${reward.minOrderValue}` : "-"}
                                </td>
                                <td className="p-3 border text-gray-700 text-sm">
                                  {reward.maxReward > 0 ? `₹${reward.maxReward}` : "-"}
                                </td>
                                <td className="p-3 border text-gray-700 text-sm">
                                  {new Date(reward.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 border">
                                  <div className="flex gap-2">
                                    <button
                                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition duration-200 flex items-center"
                                      onClick={() => {
                                        setEditModal(true);
                                        setSelectedReward(reward);
                                        setFormData({
                                          userType: reward.userType,
                                          rewardType: reward.rewardType,
                                          rewardValue: reward.rewardValue.toString(),
                                          minOrderValue: reward.minOrderValue?.toString() || "",
                                          maxReward: reward.maxReward?.toString() || "",
                                        });
                                      }}
                                      title="Edit Reward"
                                    >
                                      <FaEdit className="w-3 h-3" />
                                    </button>
                                    <button
                                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200 flex items-center"
                                      onClick={() => {
                                        setDeleteModal(true);
                                        setSelectedReward(reward);
                                      }}
                                      title="Delete Reward"
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
                        Page {currentPage} of {totalPages} • {filteredRewards.length} rewards
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

      {/* Edit Reward Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaEdit className="text-blue-600" />
              Edit Referral Reward
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type *
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  disabled // User type cannot be changed in edit
                >
                  <option value="">Select User Type</option>
                  {userTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">User type cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Type *
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="rewardType"
                  value={formData.rewardType}
                  onChange={handleInputChange}
                >
                  {rewardTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Value *
                </label>
                <div className="relative">
                  {formData.rewardType === "rupees" ? (
                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  ) : (
                    <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  )}
                  <input
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="rewardValue"
                    type="number"
                    value={formData.rewardValue}
                    onChange={handleInputChange}
                    placeholder={formData.rewardType === "rupees" ? "Enter amount in rupees" : "Enter percentage"}
                    min="0"
                    max={formData.rewardType === "percentage" ? "100" : ""}
                    step={formData.rewardType === "percentage" ? "0.01" : "1"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Value (Optional)
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="minOrderValue"
                    type="number"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    placeholder="Enter minimum order value"
                    min="0"
                  />
                </div>
              </div>

              {formData.rewardType === "percentage" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Reward Amount (Optional)
                  </label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="maxReward"
                      type="number"
                      value={formData.maxReward}
                      onChange={handleInputChange}
                      placeholder="Enter maximum reward amount"
                      min="0"
                    />
                  </div>
                </div>
              )}
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
                Update Reward
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
            <p className="text-gray-600 mb-2">Are you sure you want to delete this referral reward?</p>
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-blue-600">Success!</h2>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            
            <div className="flex justify-center">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
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