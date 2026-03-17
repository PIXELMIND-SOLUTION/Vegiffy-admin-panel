import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaMinus, FaCheck, FaUserShield, FaInfoCircle } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function AmbassadorPlanManagement() {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    price: "", 
    discount: "", 
    validity: "", 
    benefits: [""] 
  });
  const [plans, setPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 5;

  const API_BASE_URL = "https://api.vegiffyy.com/api/admin";

  // Get subAdminId from localStorage
  const getSubAdminId = () => {
    try {
      const userRole = localStorage.getItem("role");
      
      if (userRole === "subadmin") {
        const adminId = localStorage.getItem("adminId");
        return adminId;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting subAdminId:", error);
      return null;
    }
  };

  // Get user info for display
  const getUserInfo = () => {
    try {
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("adminName");
      const email = localStorage.getItem("adminEmail");
      const id = localStorage.getItem("adminId");
      
      return {
        role: role || "unknown",
        name: name || "",
        email: email || "",
        id: id || ""
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      return { role: "unknown", name: "", email: "", id: "" };
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/allpnals`);
      setPlans(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits[index] = value;
    setFormData(prev => ({
      ...prev,
      benefits: updatedBenefits
    }));
  };

  const addBenefitField = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, ""]
    }));
  };

  const removeBenefitField = (index) => {
    if (formData.benefits.length > 1) {
      const updatedBenefits = formData.benefits.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        benefits: updatedBenefits
      }));
    }
  };

  const exportData = (type) => {
    const filteredPlans = plans.filter((plan) => 
      plan.name.toLowerCase().includes(search.toLowerCase())
    );
    
    // Add sub-admin info to export data
    const exportPlans = filteredPlans.map(plan => ({
      "Plan Name": plan.name,
      "Price": `₹${plan.price}`,
      "Discount": `${plan.discount}%`,
      "Validity": `${plan.validity} days`,
      "Benefits": plan.benefits?.join(", "),
      "Note": plan.note || "Created by Admin",
      "Created By": plan.createdBy || "Admin",
      "Updated At": plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : "N/A"
    }));

    const ws = utils.json_to_sheet(exportPlans);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "AmbassadorPlans");
    writeFile(wb, `ambassador-plans-${new Date().toISOString().split('T')[0]}.${type}`);
    
    // Show success message
    setSuccessModal(true);
    setTimeout(() => setSuccessModal(false), 3000);
  };

  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`${API_BASE_URL}/deleteplan/${selectedPlan._id}`, config);
      setPlans(plans.filter((plan) => plan._id !== selectedPlan._id));
      setDeleteModal(false);
      setSuccessModal(true);
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Error deleting plan");
    }
  };

  const handleEdit = async () => {
    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();
      const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== "");
      
      const requestData = {
        ...formData,
        benefits: filteredBenefits
      };
      
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Updated by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.put(
        `${API_BASE_URL}/updateplan/${selectedPlan._id}`, 
        requestData
      );
      
      const updatedPlans = plans.map((plan) =>
        plan._id === selectedPlan._id ? response.data.data : plan
      );
      setPlans(updatedPlans);
      setEditModal(false);
      setSuccessModal(true);
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("Error updating plan");
    }
  };

  const handleAddPlan = async () => {
    const subAdminId = getSubAdminId();
    const userInfo = getUserInfo();
    const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== "");
    
    if (!formData.name || !formData.price || !formData.validity || filteredBenefits.length === 0) {
      alert("Please fill all required fields and add at least one benefit");
      return;
    }

    try {
      const requestData = {
        ...formData,
        benefits: filteredBenefits
      };
      
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Created by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.post(`${API_BASE_URL}/createplan`, requestData);
      setPlans([...plans, response.data.data]);
      setFormData({ 
        name: "", 
        price: "", 
        discount: "", 
        validity: "", 
        benefits: [""] 
      });
      setSuccessModal(true);
    } catch (error) {
      console.error("Error creating plan:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const filteredPlans = plans.filter((plan) =>
    plan.name ? plan.name.toLowerCase().includes(search.toLowerCase()) : ''
  );
  const indexOfLastPlan = currentPage * plansPerPage;
  const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
  const currentPlans = filteredPlans.slice(indexOfFirstPlan, indexOfLastPlan);
  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const userInfo = getUserInfo();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  <FaCheck className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Ambassador Plan Management
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Create and manage ambassador subscription plans
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* User Role Display */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userInfo.role === "subadmin" 
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                }`}>
                  <FaUserShield className="inline mr-1" size={14} />
                  {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
                </div>
              </div>
            </div>
            
            {/* Sub-Admin Note */}
            {userInfo.role === "subadmin" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <FaInfoCircle />
                  <strong>Note:</strong> All updates will be recorded under your name: <strong>{userInfo.name}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-purple-900 mb-6">Create New Plan</h2>
              
              {/* User Info Display for Create Form */}
              {userInfo.role === "subadmin" && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    You are creating a plan as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter plan name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    name="discount"
                    type="number"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="Enter discount percentage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity (Days) *
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    name="validity"
                    type="number"
                    value={formData.validity}
                    onChange={handleInputChange}
                    placeholder="Enter validity in days"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits *
                  </label>
                  <div className="space-y-2">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                          placeholder={`Benefit ${index + 1}`}
                        />
                        {formData.benefits.length > 1 && (
                          <button
                            type="button"
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200"
                            onClick={() => removeBenefitField(index)}
                          >
                            <FaMinus />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition duration-200 text-sm"
                      onClick={addBenefitField}
                    >
                      <FaPlus className="w-3 h-3" />
                      Add Another Benefit
                    </button>
                  </div>
                </div>
                
                <button
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  onClick={handleAddPlan}
                >
                  + Create Plan
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-purple-900">Ambassador Plans ({plans.length})</h2>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Search by plan name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                      onClick={() => exportData("csv")}
                    >
                      <span>CSV</span>
                    </button>
                    <button 
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                      onClick={() => exportData("xlsx")}
                    >
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-indigo-600">
                      <th className="p-3 border text-white text-left font-semibold">Sl</th>
                      <th className="p-3 border text-white text-left font-semibold">Plan Name</th>
                      <th className="p-3 border text-white text-left font-semibold">Price</th>
                      <th className="p-3 border text-white text-left font-semibold">Discount</th>
                      <th className="p-3 border text-white text-left font-semibold">Validity</th>
                      <th className="p-3 border text-white text-left font-semibold">Benefits</th>
                      <th className="p-3 border text-white text-left font-semibold">Admin Info</th>
                      <th className="p-3 border text-white text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPlans.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-6 border text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <FaCheck className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-600">No plans found</p>
                            <p className="text-sm text-gray-500">Create your first ambassador plan</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentPlans.map((plan, index) => (
                        <tr key={plan._id} className="border-b hover:bg-gray-50">
                          <td className="p-3 border text-gray-700">
                            {indexOfFirstPlan + index + 1}
                          </td>
                          <td className="p-3 border text-gray-700 font-medium">
                            {plan.name}
                          </td>
                          <td className="p-3 border text-gray-700">
                            <span className="font-semibold text-green-600">₹{plan.price}</span>
                          </td>
                          <td className="p-3 border text-gray-700">
                            {plan.discount ? (
                              <span className="text-red-600 font-medium">{plan.discount}%</span>
                            ) : (
                              <span className="text-gray-400">0%</span>
                            )}
                          </td>
                          <td className="p-3 border text-gray-700">
                            <span className="text-blue-600">{plan.validity} days</span>
                          </td>
                          <td className="p-3 border text-gray-700">
                            <div className="max-w-xs">
                              <ul className="list-disc list-inside text-sm">
                                {plan.benefits?.slice(0, 2).map((benefit, i) => (
                                  <li key={i} className="truncate" title={benefit}>{benefit}</li>
                                ))}
                                {plan.benefits?.length > 2 && (
                                  <li className="text-purple-600 font-medium">
                                    +{plan.benefits.length - 2} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          </td>
                          <td className="p-3 border text-gray-700">
                            <div className="text-xs">
                              {plan.note && (
                                <div className="text-purple-600 italic mb-1" title={plan.note}>
                                  {plan.note.length > 20 ? plan.note.substring(0, 20) + '...' : plan.note}
                                </div>
                              )}
                              {plan.createdBy && (
                                <div className="text-gray-500">
                                  By: {plan.createdBy}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 border">
                            <div className="flex gap-2">
                              <button
                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition duration-200"
                                onClick={() => {
                                  setEditModal(true);
                                  setSelectedPlan(plan);
                                  setFormData({
                                    name: plan.name,
                                    price: plan.price,
                                    discount: plan.discount,
                                    validity: plan.validity,
                                    benefits: plan.benefits || [""]
                                  });
                                }}
                                title="Edit Plan"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200"
                                onClick={() => {
                                  setDeleteModal(true);
                                  setSelectedPlan(plan);
                                }}
                                title="Delete Plan"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

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
                          ? 'bg-purple-500 text-white' 
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

      {/* Edit Plan Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Plan</h2>
            
            {/* User Info Display for Edit Form */}
            {userInfo.role === "subadmin" && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  You are editing as <strong>{userInfo.name}</strong> (Sub-Admin)
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name *
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Plan name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="Discount percentage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity (Days) *
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  name="validity"
                  type="number"
                  value={formData.validity}
                  onChange={handleInputChange}
                  placeholder="Validity in days"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits *
                </label>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                        placeholder={`Benefit ${index + 1}`}
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200"
                          onClick={() => removeBenefitField(index)}
                        >
                          <FaMinus />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition duration-200 text-sm"
                    onClick={addBenefitField}
                  >
                    <FaPlus className="w-3 h-3" />
                    Add Another Benefit
                  </button>
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
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200"
                onClick={handleEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Delete</h2>
            
            {/* User Info Display for Delete */}
            {userInfo.role === "subadmin" && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You are deleting as <strong>{userInfo.name}</strong> (Sub-Admin)
                </p>
              </div>
            )}
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FaTrash className="text-red-500 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">Warning</h4>
                  <p className="text-sm text-red-600 mt-1">This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this plan?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">{selectedPlan.name}</p>
                <p className="text-sm text-gray-600">Price: ₹{selectedPlan.price}</p>
                <p className="text-sm text-gray-600">Validity: {selectedPlan.validity} days</p>
              </div>
            </div>
            
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
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-green-500 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
              <p className="text-gray-600 mb-6">Operation completed successfully!</p>
              
              <div className="flex justify-center">
                <button
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition duration-200"
                  onClick={() => setSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}