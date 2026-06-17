import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaUserShield, FaInfoCircle } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChargesManagement() {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    chargeType: "fixed",
    distance: "",
    minDistance: "",
    maxDistance: "",
    perKmRate: "",
    amount: "",
    freeDeliveryThreshold: ""
  });
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const storedRole = localStorage.getItem("role");


  const chargeTypes = [
    {
      value: "delivery_charge",
      label: "Delivery Charge",
      inputType: "number",
      unit: "₹",
      requiresDistance: true
    },
    {
      value: "platform_charge",
      label: "Platform Charge",
      inputType: "number",
      unit: "₹",
      requiresDistance: false
    },
    {
      value: "gst_charges",
      label: "GST Charges",
      inputType: "percentage",
      unit: "%",
      requiresDistance: false
    },
    {
      value: "packing_charges",
      label: "Packing Charges",
      inputType: "number",
      unit: "₹",
      requiresDistance: false
    },
    {
      value: "gst_on_delivery",
      label: "GST on Delivery Charges",
      inputType: "percentage",
      unit: "%",
      requiresDistance: false
    },
    {
      value: "free_delivery_threshold",
      label: "Free Delivery Threshold",
      inputType: "number",
      unit: "₹",
      requiresDistance: false,
      isFreeDelivery: true
    }
  ];

  const deliveryChargeMethods = [
    { value: "flat_rate", label: "Flat Rate" },
    { value: "per_km", label: "Per Kilometer" },
    { value: "slab_based", label: "Slab Based" }
  ];

  const [deliveryMethod, setDeliveryMethod] = useState("flat_rate");
  const [currentPage, setCurrentPage] = useState(1);
  const chargesPerPage = 5;
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
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/allcharge`);

      if (response.data && response.data.data) {
        setCharges(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setCharges(response.data);
      } else if (response.data && response.data.charges) {
        setCharges(response.data.charges);
      } else {
        setCharges([]);
        toast.info("No charges found. Add your first charge!");
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
      setError("Failed to load charges. Please check if the backend server is running.");
      toast.error("Failed to load charges. Please check your connection.");
      setCharges([]);
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

  const getChargeLabel = (type) => {
    const charge = chargeTypes.find(c => c.value === type);
    return charge ? charge.label : type;
  };

  const getChargeUnit = (type) => {
    const charge = chargeTypes.find(c => c.value === type);
    return charge ? charge.unit : "";
  };

  const getInputType = (type) => {
    const charge = chargeTypes.find(c => c.value === type);
    return charge ? charge.inputType : "number";
  };

  const requiresDistance = (type) => {
    const charge = chargeTypes.find(c => c.value === type);
    return charge ? charge.requiresDistance : false;
  };

  const isFreeDelivery = (type) => {
    const charge = chargeTypes.find(c => c.value === type);
    return charge ? charge.isFreeDelivery : false;
  };

  const exportData = (type) => {
    if (charges.length === 0) {
      toast.warning("No data to export!");
      return;
    }

    const userInfo = getUserInfo();
    const filteredCharges = charges.map(charge => ({
      "Charge Type": getChargeLabel(charge.type),
      "Amount": charge.amount,
      "Unit": getChargeUnit(charge.type),
      "Distance (km)": charge.distance || "N/A",
      "Min Distance (km)": charge.minDistance || "N/A",
      "Max Distance (km)": charge.maxDistance || "N/A",
      "Per Km Rate": charge.perKmRate || "N/A",
      "Base Rate": charge.amount || "N/A",
      "Calculation Method": charge.deliveryMethod || "N/A",
      "Value Type": charge.chargeType === "percentage" ? "Percentage" : "Fixed",
      "Free Delivery Threshold": charge.freeDeliveryThreshold || "N/A",
      "Note": charge.note || "Created by Admin",
      "Created By": userInfo.role === "subadmin" ? `Sub-admin: ${userInfo.name}` : "Admin",
      "Export Date": new Date().toLocaleDateString()
    }));

    const ws = utils.json_to_sheet(filteredCharges);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Charges");
    writeFile(wb, `charges.${type}`);
    toast.success(`Data exported as ${type.toUpperCase()} successfully!`);
  };

  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`${API_BASE_URL}/deletecharge/${selectedCharge._id}`, config);
      setCharges(charges.filter((charge) => charge._id !== selectedCharge._id));
      setDeleteModal(false);
      toast.success("Charge deleted successfully!");
    } catch (error) {
      console.error("Error deleting charge:", error);
      toast.error("Failed to delete charge. Please try again.");
    }
  };

  const handleEdit = async () => {
    if (isFreeDelivery(formData.type)) {
      if (!formData.freeDeliveryThreshold) {
        toast.error("Please enter free delivery threshold amount!");
        return;
      }
    }

    if (requiresDistance(formData.type)) {
      if (deliveryMethod === "slab_based" && (!formData.minDistance || !formData.maxDistance || !formData.perKmRate || !formData.amount)) {
        toast.error("Please enter minimum distance, maximum distance, per km rate, and base rate for slab-based delivery!");
        return;
      }
    }

    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      const updateData = {
        amount: formData.amount,
        chargeType: formData.chargeType
      };

      if (requiresDistance(formData.type)) {
        updateData.deliveryMethod = deliveryMethod;

        if (deliveryMethod === "slab_based") {
          updateData.minDistance = formData.minDistance;
          updateData.maxDistance = formData.maxDistance;
          updateData.perKmRate = formData.perKmRate;
          updateData.amount = formData.amount;
        }
      }

      if (isFreeDelivery(formData.type)) {
        updateData.freeDeliveryThreshold = formData.freeDeliveryThreshold;
      }

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        updateData.subAdminId = subAdminId;
        updateData.note = `Updated by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.put(`${API_BASE_URL}/updatecharge/${selectedCharge._id}`, updateData);

      const updatedCharges = charges.map((charge) =>
        charge._id === selectedCharge._id ? response.data.data : charge
      );
      setCharges(updatedCharges);
      setEditModal(false);
      toast.success("Charge updated successfully!");
    } catch (error) {
      console.error("Error updating charge:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update charge. Please try again.");
      }
    }
  };

  const handleAddCharge = async () => {
    if (!formData.type) {
      toast.error("Please select charge type!");
      return;
    }

    // For Free Delivery Threshold, only require freeDeliveryThreshold
    if (isFreeDelivery(formData.type)) {
      if (!formData.freeDeliveryThreshold) {
        toast.error("Please enter free delivery threshold amount!");
        return;
      }
    }
    // For other charges, require amount


    // Validate delivery charge inputs
    if (requiresDistance(formData.type)) {
      if (deliveryMethod === "slab_based" && (!formData.minDistance || !formData.maxDistance || !formData.perKmRate || !formData.amount)) {
        toast.error("Please enter minimum distance, maximum distance, per km rate, and base rate for slab-based delivery!");
        return;
      }
    }

    // Auto-detect charge type based on selection
    const inputType = getInputType(formData.type);
    const chargeType = inputType === "percentage" ? "percentage" : "fixed";

    const submitData = {
      type: formData.type,
      amount: formData.amount || 0,
      chargeType: chargeType
    };

    // Add distance-related fields for delivery charges
    if (requiresDistance(formData.type)) {
      submitData.deliveryMethod = deliveryMethod;

      if (deliveryMethod === "slab_based") {
        submitData.minDistance = formData.minDistance;
        submitData.maxDistance = formData.maxDistance;
        submitData.perKmRate = formData.perKmRate;
        submitData.amount = formData.amount;
      }
    }

    // Add free delivery threshold if applicable
    if (isFreeDelivery(formData.type)) {
      submitData.freeDeliveryThreshold = formData.freeDeliveryThreshold;
    }

    // Add subAdminId if user is sub-admin
    const subAdminId = getSubAdminId();
    const userInfo = getUserInfo();
    if (subAdminId) {
      submitData.subAdminId = subAdminId;
      submitData.note = `Created by Sub-admin: ${userInfo.name}`;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/createcharge`, submitData);

      const newCharge = response.data.data || response.data;
      setCharges([...charges, newCharge]);
      setFormData({
        type: "",
        amount: "",
        chargeType: "fixed",
        distance: "",
        minDistance: "",
        maxDistance: "",
        perKmRate: "",
        amount: "",
        freeDeliveryThreshold: ""
      });
      setDeliveryMethod("flat_rate");
      toast.success("Charge created successfully!");
    } catch (error) {
      console.error("Error creating charge:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create charge. Please try again.");
      }
    }
  };

  const calculateDeliveryCharge = () => {
    if (!formData.amount) return "N/A";

    switch (deliveryMethod) {
      case "flat_rate":
        return `${formData.amount}₹`;
      case "per_km":
        return `${formData.amount}₹`;
      case "slab_based":
        let slabInfo = "";
        if (formData.minDistance && formData.maxDistance && formData.perKmRate && formData.amount) {
          slabInfo = `${formData.amount}₹ base + ${formData.perKmRate}₹/km for ${formData.minDistance}-${formData.maxDistance} km`;
        }
        return slabInfo || "Configure slab";
      default:
        return `${formData.amount}₹`;
    }
  };

  const filteredCharges = charges.filter((charge) =>
    charge.type ? getChargeLabel(charge.type).toLowerCase().includes(search.toLowerCase()) : false
  );
  const indexOfLastCharge = currentPage * chargesPerPage;
  const indexOfFirstCharge = indexOfLastCharge - chargesPerPage;
  const currentCharges = filteredCharges.slice(indexOfFirstCharge, indexOfLastCharge);
  const totalPages = Math.ceil(filteredCharges.length / chargesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const displayDeliveryInfo = (charge) => {
    if (!requiresDistance(charge.type)) return null;

    if (charge.deliveryMethod === "flat_rate") {
      return (
        <div className="text-xs text-gray-500 mt-1">
          Flat rate delivery charge
        </div>
      );
    } else if (charge.deliveryMethod === "per_km") {
      return (
        <div className="text-xs text-gray-500 mt-1">
          Per kilometer delivery charge
        </div>
      );
    } else if (charge.deliveryMethod === "slab_based") {
      let info = "";
      if (charge.minDistance && charge.maxDistance) {
        info = `Slab: ${charge.minDistance}-${charge.maxDistance} km`;
      }
      if (charge.perKmRate) {
        info += info ? ` @ ${charge.perKmRate}₹/km` : `${charge.perKmRate}₹/km`;
      }
      if (charge.amount) {
        info += info ? ` + ${charge.amount}₹ base` : `${charge.amount}₹ base charge`;
      }
      return info ? (
        <div className="text-xs text-gray-500 mt-1">
          {info}
        </div>
      ) : null;
    }
    return null;
  };

  const displayFreeDeliveryInfo = (charge) => {
    if (charge.freeDeliveryThreshold) {
      return (
        <div className="text-xs text-green-600 mt-1">
          Free delivery on orders above: {charge.freeDeliveryThreshold}₹
        </div>
      );
    }
    return null;
  };

  const userInfo = getUserInfo();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto">
        {/* User Info Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-blue-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Charges Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage platform charges, delivery fees, and GST rates</p>
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
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-blue-900 mb-6">Add New Charge</h2>

              {/* User Info for Create Form */}
              {userInfo.role === "subadmin" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                  <p className="text-blue-800">
                    Creating as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Charge Type *
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    name="type"
                    value={formData.type}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.value !== "delivery_charge") {
                        setDeliveryMethod("flat_rate");
                      }
                    }}
                    disabled={loading}
                  >
                    <option value="">Select Charge Type</option>
                    {chargeTypes.map((type, index) => (
                      <option key={index} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {requiresDistance(formData.type) && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">Delivery Charge Configuration</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calculation Method
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {deliveryChargeMethods.map((method, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setDeliveryMethod(method.value)}
                            className={`px-3 py-2 text-sm rounded-lg transition duration-200 ${deliveryMethod === method.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flat Rate - Only Amount */}
                    {deliveryMethod === "flat_rate" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Charge (₹) *
                        </label>
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="Enter delivery charge amount"
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Flat rate delivery charge for any distance
                        </p>
                      </div>
                    )}

                    {/* Per Kilometer - Only Amount */}
                    {deliveryMethod === "per_km" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Charge (₹) *
                        </label>
                        <input
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="Enter delivery charge amount"
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Per kilometer delivery charge
                        </p>
                      </div>
                    )}

                    {/* Slab Based - Multiple Fields */}
                    {deliveryMethod === "slab_based" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Min Distance (km) *
                            </label>
                            <input
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              name="minDistance"
                              type="number"
                              min="0"
                              step="0.1"
                              value={formData.minDistance}
                              onChange={handleInputChange}
                              placeholder="Min km"
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Max Distance (km) *
                            </label>
                            <input
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              name="maxDistance"
                              type="number"
                              min="0"
                              step="0.1"
                              value={formData.maxDistance}
                              onChange={handleInputChange}
                              placeholder="Max km"
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rate for this slab*
                            </label>
                            <input
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              name="perKmRate"
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.perKmRate}
                              onChange={handleInputChange}
                              placeholder="₹/km"
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Base Charge (₹) *
                            </label>
                            <input
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              name="amount"
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.amount}
                              onChange={handleInputChange}
                              placeholder="Base charge"
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Formula: Base Charge + (Distance × Rate per km) for {formData.minDistance || "?"}-{formData.maxDistance || "?"} km range
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-blue-100 rounded">
                      <p className="text-sm font-medium text-blue-800">
                        Delivery Charge: {calculateDeliveryCharge()}
                      </p>
                    </div>
                  </div>
                )}

                {/* For non-delivery charges or when no distance required */}
                {!requiresDistance(formData.type) && !isFreeDelivery(formData.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                      {formData.type && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({getInputType(formData.type) === "percentage" ? "Percentage" : "Fixed Amount"})
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="amount"
                        type="number"
                        step={getInputType(formData.type) === "percentage" ? "0.01" : "1"}
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder={`Enter amount ${formData.type ? `in ${getChargeUnit(formData.type)}` : ''}`}
                        disabled={loading}
                      />
                      {formData.type && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          {getChargeUnit(formData.type)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Free Delivery Threshold */}
                {isFreeDelivery(formData.type) && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-4">
                    <h3 className="text-sm font-semibold text-green-800 mb-2">
                      Free Delivery Threshold
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order Amount (₹) *
                      </label>
                      <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        name="freeDeliveryThreshold"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.freeDeliveryThreshold}
                        onChange={handleInputChange}
                        placeholder="e.g., 399"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Delivery will be free on orders above this amount
                      </p>
                    </div>

                    <div className="p-3 bg-green-100 rounded">
                      <p className="text-sm font-medium text-green-800">
                        {formData.freeDeliveryThreshold ?
                          `Free delivery on orders above ${formData.freeDeliveryThreshold}₹` :
                          "Set minimum order amount for free delivery"}
                      </p>
                    </div>
                  </div>
                )}

                {formData.type && !requiresDistance(formData.type) && !isFreeDelivery(formData.type) && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> This will be applied as {getInputType(formData.type) === "percentage" ? "a percentage" : "a fixed amount"}
                    </p>
                  </div>
                )}

                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddCharge}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "+ Add Charge"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-blue-900">Charges List</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by charge type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => exportData("csv")}
                      disabled={loading || charges.length === 0}
                    >
                      <span>CSV</span>
                    </button>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => exportData("xlsx")}
                      disabled={loading || charges.length === 0}
                    >
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading charges...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-blue-600">
                          <th className="p-3 border text-white text-left font-semibold">Sl</th>
                          <th className="p-3 border text-white text-left font-semibold">Charge Type</th>
                          <th className="p-3 border text-white text-left font-semibold">Amount</th>
                          <th className="p-3 border text-white text-left font-semibold">Distance Info</th>
                          <th className="p-3 border text-white text-left font-semibold">Free Delivery Info</th>
                          <th className="p-3 border text-white text-left font-semibold">Admin Info</th>
                          <th className="p-3 border text-white text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCharges.length > 0 ? (
                          currentCharges.map((charge, index) => (
                            <tr key={charge._id} className="border-b hover:bg-gray-50">
                              <td className="p-3 border text-gray-700">
                                {indexOfFirstCharge + index + 1}
                              </td>
                              <td className="p-3 border text-gray-700 font-medium">
                                {getChargeLabel(charge.type)}
                                {isFreeDelivery(charge.type) && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Free Delivery
                                  </span>
                                )}
                              </td>
                              <td className="p-3 border text-gray-700">
                                <div className="flex items-center gap-1">
                                  <span>{charge.amount}</span>
                                  <span className="text-gray-500">{getChargeUnit(charge.type)}</span>
                                </div>
                                {displayDeliveryInfo(charge)}
                                {displayFreeDeliveryInfo(charge)}
                                {charge.amount && charge.deliveryMethod === "slab_based" && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Base: {charge.amount}₹
                                  </div>
                                )}
                              </td>
                              <td className="p-3 border text-gray-700 text-sm">
                                {charge.deliveryMethod === "flat_rate" && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Flat Rate
                                  </span>
                                )}
                                {charge.deliveryMethod === "per_km" && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Per Kilometer
                                  </span>
                                )}
                                {charge.deliveryMethod === "slab_based" && charge.minDistance && charge.maxDistance && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {charge.minDistance}-{charge.maxDistance} km
                                  </span>
                                )}
                                {charge.amount && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Base: {charge.amount}₹
                                  </div>
                                )}
                                {charge.perKmRate && charge.deliveryMethod === "slab_based" && (
                                  <div className="text-xs text-yellow-600 mt-1">
                                    Rate: {charge.perKmRate}₹/km
                                  </div>
                                )}
                                {charge.deliveryMethod && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Method: {charge.deliveryMethod.replace('_', ' ')}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 border text-gray-700 text-sm">
                                {charge.freeDeliveryThreshold ? (
                                  <div>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Free above {charge.freeDeliveryThreshold}₹
                                    </span>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Free delivery on orders
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No threshold</span>
                                )}
                              </td>
                              <td className="p-3 border">
                                <div className="text-xs">
                                  {charge.note && (
                                    <div className="text-purple-600 italic mb-1" title={charge.note}>
                                      {charge.note.length > 20 ? charge.note.substring(0, 20) + '...' : charge.note}
                                    </div>
                                  )}
                                  {charge.createdBy && (
                                    <div className="text-gray-500">
                                      By: {charge.createdBy}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 border">
                                <div className="flex gap-2">
                                  <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                      setEditModal(true);
                                      setSelectedCharge(charge);
                                      setFormData({
                                        type: charge.type,
                                        amount: charge.amount,
                                        chargeType: charge.chargeType,
                                        distance: charge.distance || "",
                                        minDistance: charge.minDistance || "",
                                        maxDistance: charge.maxDistance || "",
                                        perKmRate: charge.perKmRate || "",
                                        amount: charge.amount || "",
                                        freeDeliveryThreshold: charge.freeDeliveryThreshold || ""
                                      });
                                      setDeliveryMethod(charge.deliveryMethod || "flat_rate");
                                    }}
                                    disabled={loading}
                                  >
                                    <FaEdit />
                                  </button>
                                  {storedRole === 'admin' && (
                                    <button
                                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      onClick={() => {
                                        setDeleteModal(true);
                                        setSelectedCharge(charge);
                                      }}
                                      disabled={loading}
                                    >
                                      <FaTrash />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-4 border text-center text-gray-500">
                              No charges found. Add your first charge!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition duration-200"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg transition duration-200 ${currentPage === index + 1
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition duration-200"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Charge</h2>

            {/* User Info for Edit Form */}
            {userInfo.role === "subadmin" && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded text-xs">
                <p className="text-purple-800">
                  Editing as <strong>{userInfo.name}</strong> (Sub-Admin)
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charge Type
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                  name="type"
                  value={formData.type}
                  disabled
                >
                  <option value="">Select Charge Type</option>
                  {chargeTypes.map((type, index) => (
                    <option key={index} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Charge type cannot be changed</p>
              </div>

              {requiresDistance(formData.type) && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">Delivery Charge Configuration</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calculation Method
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {deliveryChargeMethods.map((method, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setDeliveryMethod(method.value)}
                          className={`px-3 py-2 text-sm rounded-lg transition duration-200 ${deliveryMethod === method.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flat Rate - Only Amount */}
                  {deliveryMethod === "flat_rate" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Charge (₹) *
                      </label>
                      <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter delivery charge amount"
                        disabled={loading}
                      />
                    </div>
                  )}

                  {/* Per Kilometer - Only Amount */}
                  {deliveryMethod === "per_km" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Charge (₹) *
                      </label>
                      <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter delivery charge amount"
                        disabled={loading}
                      />
                    </div>
                  )}

                  {/* Slab Based - Multiple Fields */}
                  {deliveryMethod === "slab_based" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Distance (km) *
                          </label>
                          <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            name="minDistance"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.minDistance}
                            onChange={handleInputChange}
                            placeholder="Min km"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Distance (km) *
                          </label>
                          <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            name="maxDistance"
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.maxDistance}
                            onChange={handleInputChange}
                            placeholder="Max km"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rate for this slab (₹/km) *
                          </label>
                          <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            name="perKmRate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.perKmRate}
                            onChange={handleInputChange}
                            placeholder="₹/km"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base Charge (₹) *
                          </label>
                          <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            name="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="Base charge"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Formula: Base Charge + (Distance × Rate per km) for {formData.minDistance || "?"}-{formData.maxDistance || "?"} km range
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-blue-100 rounded">
                    <p className="text-sm font-medium text-blue-800">
                      Delivery Charge: {calculateDeliveryCharge()}
                    </p>
                  </div>
                </div>
              )}

              {/* Free Delivery Threshold in Edit Modal */}
              {isFreeDelivery(formData.type) && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">
                    Free Delivery Threshold
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount (₹)
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      name="freeDeliveryThreshold"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.freeDeliveryThreshold}
                      onChange={handleInputChange}
                      placeholder="e.g., 399"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Delivery will be free on orders above this amount
                    </p>
                  </div>

                  <div className="p-3 bg-green-100 rounded">
                    <p className="text-sm font-medium text-green-800">
                      {formData.freeDeliveryThreshold ?
                        `Free delivery on orders above ${formData.freeDeliveryThreshold}₹` :
                        "No threshold set"}
                    </p>
                  </div>
                </div>
              )}

              {!requiresDistance(formData.type) && !isFreeDelivery(formData.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ({getChargeUnit(formData.type)})
                  </label>
                  <div className="relative">
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="amount"
                      type="number"
                      step={getInputType(formData.type) === "percentage" ? "0.01" : "1"}
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder={`Enter amount in ${getChargeUnit(formData.type)}`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      {getChargeUnit(formData.type)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
                onClick={() => {
                  setEditModal(false);
                  setDeliveryMethod("flat_rate");
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleEdit}
                disabled={loading ||
                  (!isFreeDelivery(formData.type) && !formData.amount) ||
                  (isFreeDelivery(formData.type) && !formData.freeDeliveryThreshold) ||
                  (requiresDistance(formData.type) && deliveryMethod === "slab_based" && (!formData.minDistance || !formData.maxDistance || !formData.perKmRate || !formData.amount))
                }
              >
                {loading ? "Saving..." : "Save Changes"}
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
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedCharge && getChargeLabel(selectedCharge.type)}</strong> charge?
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
                onClick={() => setDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}