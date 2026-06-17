import { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaPlus, FaMinus, FaCheck, FaStore, FaUserShield, FaInfoCircle } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function VendorPlanManagement() {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    validity: "",
    benefits: [""]
  });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 5;

  const storedRole = localStorage.getItem("role");


  const API_BASE_URL = "https://api.vegiffy.in/api/admin";

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
    fetchVendorPlans();
  }, []);

  const fetchVendorPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/vendorplans`);
      setPlans(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching vendor plans:", error);
      alert("Error fetching vendor plans");
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
    const userInfo = getUserInfo();
    const filteredPlans = plans.filter((plan) =>
      plan.name.toLowerCase().includes(search.toLowerCase())
    );

    const exportData = filteredPlans.map(plan => ({
      "Plan Name": plan.name,
      "Price (₹)": plan.price,
      "Validity (Days)": plan.validity,
      "Benefits": plan.benefits?.join(", ") || "",
      "Status": plan.status,
      "Note": plan.note || "Created by Admin",
      "Created By": plan.createdBy || "Admin",
      "Updated At": plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : "N/A",
      "Export By": userInfo.role === "subadmin" ? `Sub-admin: ${userInfo.name}` : "Admin"
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "VendorPlans");
    writeFile(wb, `vendor-plans.${type}`);

    setSuccessMessage(`Data exported successfully as ${type.toUpperCase()}!`);
    setSuccessModal(true);
    setTimeout(() => setSuccessModal(false), 3000);
  };

  // Delete Vendor Plan API with sub-admin ID
  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`${API_BASE_URL}/vendorplans/${selectedPlan._id}`, config);
      setPlans(plans.filter((plan) => plan._id !== selectedPlan._id));
      setDeleteModal(false);
      setSuccessMessage("Vendor plan deleted successfully!");
      setSuccessModal(true);
    } catch (error) {
      console.error("Error deleting vendor plan:", error);
      alert("Error deleting vendor plan");
    }
  };

  // Edit Vendor Plan API with sub-admin ID
  const handleEdit = async () => {
    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();
      const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== "");

      if (!formData.name || !formData.price || !formData.validity || filteredBenefits.length === 0) {
        alert("Please fill all required fields and add at least one benefit");
        return;
      }

      // Prepare request data with sub-admin info
      const requestData = {
        ...formData,
        benefits: filteredBenefits
      };

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Updated by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.put(`${API_BASE_URL}/vendorplans/${selectedPlan._id}`, requestData);

      const updatedPlans = plans.map((plan) =>
        plan._id === selectedPlan._id ? response.data.data : plan
      );
      setPlans(updatedPlans);
      setEditModal(false);
      setSuccessMessage("Vendor plan updated successfully!");
      setSuccessModal(true);
    } catch (error) {
      console.error("Error updating vendor plan:", error);
      alert(error.response?.data?.message || "Error updating vendor plan");
    }
  };

  // Create Vendor Plan API with sub-admin ID
  const handleAddPlan = async () => {
    const subAdminId = getSubAdminId();
    const userInfo = getUserInfo();
    const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== "");

    if (!formData.name || !formData.price || !formData.validity || filteredBenefits.length === 0) {
      alert("Please fill all required fields and add at least one benefit");
      return;
    }

    try {
      // Prepare request data with sub-admin info
      const requestData = {
        ...formData,
        benefits: filteredBenefits
      };

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Created by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.post(`${API_BASE_URL}/vendorplans`, requestData);
      setPlans([...plans, response.data.data]);
      setFormData({
        name: "",
        price: "",
        validity: "",
        benefits: [""]
      });
      setSuccessMessage("Vendor plan created successfully!");
      setSuccessModal(true);
    } catch (error) {
      console.error("Error creating vendor plan:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      validity: "",
      benefits: [""]
    });
  };

  // Pagination
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto">
        {/* Header with User Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded">
                <FaStore className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Vendor Plan Management</h1>
                <p className="text-sm text-gray-600">Create and manage vendor subscription plans</p>
              </div>
            </div>

            {/* User Role Display */}
            <div className="flex gap-2">
              <div className={`px-3 py-1 rounded text-xs font-medium ${userInfo.role === "subadmin"
                ? "bg-purple-100 text-purple-800 border border-purple-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}>
                <FaUserShield className="inline mr-1" size={12} />
                {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
              </div>
            </div>
          </div>

          {/* Sub-Admin Note */}
          {userInfo.role === "subadmin" && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p className="text-yellow-800 flex items-center gap-1">
                <FaInfoCircle size={10} />
                <span>All updates will be recorded under your name</span>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Side - Add Plan Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <FaPlus className="w-4 h-4" />
                Create New Plan
              </h2>

              {/* User Info for Create Form */}
              {userInfo.role === "subadmin" && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <p className="text-blue-800">
                    Creating as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Plan Name *
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Basic Vendor Plan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Validity (Days) *
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    name="validity"
                    type="number"
                    value={formData.validity}
                    onChange={handleInputChange}
                    placeholder="Enter validity in days"
                    min="1"
                  />
                </div>

                {/* Benefits Section */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Benefits *
                    </label>
                    <span className="text-xs text-gray-500">{formData.benefits.length} benefits</span>
                  </div>
                  <div className="space-y-2">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className="flex-1 p-2 border border-gray-300 rounded text-xs"
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                          placeholder={`Benefit ${index + 1}`}
                        />
                        {formData.benefits.length > 1 && (
                          <button
                            type="button"
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center"
                            onClick={() => removeBenefitField(index)}
                          >
                            <FaMinus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                      onClick={addBenefitField}
                    >
                      <FaPlus className="w-3 h-3" />
                      Add Benefit
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                    onClick={resetForm}
                  >
                    Reset
                  </button>
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm"
                    onClick={handleAddPlan}
                  >
                    Create Plan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Plans Table */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <div>
                  <h2 className="text-base font-semibold text-blue-900">Vendor Plans</h2>
                  <p className="text-xs text-gray-600 mt-1">
                    Total {plans.length} plans
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <input
                      className="w-full sm:w-48 p-2 pl-8 border border-gray-300 rounded text-sm"
                      placeholder="Search plans..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs"
                      onClick={() => exportData("csv")}
                    >
                      CSV
                    </button>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs"
                      onClick={() => exportData("xlsx")}
                    >
                      Excel
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading vendor plans...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-blue-600">
                          <th className="p-2 border text-white text-left font-medium">#</th>
                          <th className="p-2 border text-white text-left font-medium">Plan Name</th>
                          <th className="p-2 border text-white text-left font-medium">Price</th>
                          <th className="p-2 border text-white text-left font-medium">Validity</th>
                          <th className="p-2 border text-white text-left font-medium">Admin Info</th>
                          <th className="p-2 border text-white text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPlans.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-6 text-center text-gray-500">
                              <FaStore className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No vendor plans found</p>
                              {search && (
                                <p className="text-xs mt-1">Try adjusting your search</p>
                              )}
                            </td>
                          </tr>
                        ) : (
                          currentPlans.map((plan, index) => (
                            <tr key={plan._id} className="border-b hover:bg-gray-50">
                              <td className="p-2 border text-gray-700">
                                {indexOfFirstPlan + index + 1}
                              </td>
                              <td className="p-2 border text-gray-700 font-medium">
                                {plan.name}
                              </td>
                              <td className="p-2 border text-gray-700">
                                ₹{plan.price}
                              </td>
                              <td className="p-2 border text-gray-700">
                                {plan.validity} days
                              </td>
                              <td className="p-2 border text-gray-700">
                                <div className="text-xs">
                                  {plan.note && (
                                    <div className="text-blue-600 italic mb-1" title={plan.note}>
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
                              <td className="p-2 border">
                                <div className="flex gap-1">
                                  <button
                                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded flex items-center"
                                    onClick={() => {
                                      setViewModal(true);
                                      setSelectedPlan(plan);
                                    }}
                                    title="View Details"
                                  >
                                    <FaEye className="w-3 h-3" />
                                  </button>
                                  <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded flex items-center"
                                    onClick={() => {
                                      setEditModal(true);
                                      setSelectedPlan(plan);
                                      setFormData({
                                        name: plan.name,
                                        price: plan.price,
                                        validity: plan.validity,
                                        benefits: plan.benefits || [""]
                                      });
                                    }}
                                    title="Edit Plan"
                                  >
                                    <FaEdit className="w-3 h-3" />
                                  </button>
                                  {storedRole === 'admin' && (
                                    <button
                                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded flex items-center"
                                      onClick={() => {
                                        setDeleteModal(true);
                                        setSelectedPlan(plan);
                                      }}
                                      title="Delete Plan"
                                    >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                      <div className="text-xs text-gray-600">
                        Page {currentPage} of {totalPages}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 px-3 py-1 rounded text-xs"
                        >
                          Prev
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`px-2 py-1 rounded text-xs ${currentPage === index + 1
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
                          className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 px-3 py-1 rounded text-xs"
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

      {/* View Plan Modal */}
      {viewModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-50">
          <div className="bg-white p-4 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <FaEye className="text-green-600" />
              Plan Details
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Plan Name</p>
                  <p className="font-medium text-sm">{selectedPlan.name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Price</p>
                  <p className="font-medium text-sm">₹{selectedPlan.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Validity</p>
                  <p className="font-medium text-sm">{selectedPlan.validity} days</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <p className="font-medium text-sm capitalize">{selectedPlan.status || "Active"}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-2">Benefits</p>
                <ul className="space-y-1 pl-4">
                  {selectedPlan.benefits && selectedPlan.benefits.length > 0 ? (
                    selectedPlan.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No benefits defined</p>
                  )}
                </ul>
              </div>

              {/* Admin Information */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                <p className="text-xs text-blue-800 mb-2 font-medium">Admin Information</p>
                <div className="space-y-1 text-xs">
                  {selectedPlan.note && (
                    <p className="text-blue-700">
                      <span className="font-medium">Note:</span> {selectedPlan.note}
                    </p>
                  )}
                  {selectedPlan.createdBy && (
                    <p className="text-gray-700">
                      <span className="font-medium">Created By:</span> {selectedPlan.createdBy}
                    </p>
                  )}
                  {selectedPlan.createdAt && (
                    <p className="text-gray-700">
                      <span className="font-medium">Created:</span> {new Date(selectedPlan.createdAt).toLocaleDateString()}
                    </p>
                  )}
                  {selectedPlan.updatedAt && (
                    <p className="text-gray-700">
                      <span className="font-medium">Updated:</span> {new Date(selectedPlan.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Plan ID */}
              <div className="bg-gray-100 p-2 rounded">
                <p className="text-xs text-gray-600 mb-1">Plan ID</p>
                <code className="text-xs text-gray-800 bg-white p-1 rounded border">{selectedPlan._id}</code>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded text-sm"
                onClick={() => setViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-50">
          <div className="bg-white p-4 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <FaEdit className="text-blue-600" />
              Edit Vendor Plan
            </h2>

            {/* User Info for Edit Form */}
            {userInfo.role === "subadmin" && (
              <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                <p className="text-purple-800">
                  Editing as <strong>{userInfo.name}</strong> (Sub-Admin)
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Plan Name *
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Plan name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Validity (Days) *
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  name="validity"
                  type="number"
                  value={formData.validity}
                  onChange={handleInputChange}
                  placeholder="Validity in days"
                  min="1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Benefits *
                  </label>
                  <span className="text-xs text-gray-500">{formData.benefits.length} benefits</span>
                </div>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        className="flex-1 p-2 border border-gray-300 rounded text-xs"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                        placeholder={`Benefit ${index + 1}`}
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center"
                          onClick={() => removeBenefitField(index)}
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                    onClick={addBenefitField}
                  >
                    <FaPlus className="w-3 h-3" />
                    Add Benefit
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded text-sm"
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                onClick={handleEdit}
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-50">
          <div className="bg-white p-4 rounded w-full max-w-sm">
            <h2 className="text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <FaTrash className="text-red-500" />
              Confirm Delete
            </h2>

            {/* User Info for Delete */}
            {userInfo.role === "subadmin" && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-800">
                  Deleting as <strong>{userInfo.name}</strong> (Sub-Admin)
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-2">Are you sure you want to delete this vendor plan?</p>
            <div className="bg-gray-50 p-2 rounded mb-4">
              <p className="font-medium text-sm">{selectedPlan.name}</p>
              <p className="text-xs text-gray-600">Price: ₹{selectedPlan.price}</p>
              <p className="text-xs text-gray-600">Validity: {selectedPlan.validity} days</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded text-sm"
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-50">
          <div className="bg-white p-4 rounded w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheck className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-base font-semibold mb-2 text-green-600">Success!</h2>
            <p className="text-sm text-gray-600 mb-4">{successMessage}</p>

            <div className="flex justify-center">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
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