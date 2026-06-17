import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaMotorcycle,
  FaMapMarkerAlt,
  FaIdCard,
  FaCar,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDollarSign,
  FaCog,
  FaSave,
  FaTimes,
  FaSync,
  FaWallet,
  FaSearch,
  FaFileExport,
  FaBox,
  FaCalendarAlt,
  FaRupeeSign,
  FaTruck,
  FaChartBar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUserShield,
  FaInfoCircle,
  FaCreditCard,
  FaMoneyBill,
  FaHistory,
  FaPhone,
  FaEnvelope,
  FaDownload
} from "react-icons/fa";

const DeliveryBoyList = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [filteredDeliveryBoys, setFilteredDeliveryBoys] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeliveryChargeModal, setShowDeliveryChargeModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [isSettingCharge, setIsSettingCharge] = useState(false);
  const [editingChargeId, setEditingChargeId] = useState(null);
  const [tempCharge, setTempCharge] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "totalOrders",
    direction: "desc"
  });

  const storedRole = localStorage.getItem("role");


  // API base URL
  const API_BASE_URL = "https://api.vegiffy.in/api/delivery-boy";

  // Get subAdminId from localStorage
  const getSubAdminId = () => {
    try {
      const userRole = localStorage.getItem("role");
      if (userRole === "subadmin") {
        return localStorage.getItem("adminId");
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
      return {
        role: localStorage.getItem("role") || "unknown",
        name: localStorage.getItem("adminName") || "",
        email: localStorage.getItem("adminEmail") || "",
        id: localStorage.getItem("adminId") || ""
      };
    } catch (error) {
      return { role: "unknown", name: "", email: "", id: "" };
    }
  };

  const downloadDocument = async (url, filename = "document") => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error("Download failed:", error);

      // fallback
      window.open(url, "_blank");
    }
  };

  // Format document filename
  const getDocumentFilename = (type, deliveryBoyName) => {
    const name = deliveryBoyName?.replace(/\s+/g, '_') || 'document';
    const timestamp = new Date().getTime();
    return `${name}_${type}_${timestamp}.jpg`;
  };

  // Fetch Delivery Boys with orders data
  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/alldeliveryboy`);
      console.log('Fetched delivery boys:', response.data.data);

      const deliveryBoysWithOrders = response.data.data.reverse().map(boy => {
        // Use profileImage if available, otherwise use image
        const profilePic = boy.profileImage || boy.image || null;

        return {
          ...boy,
          image: profilePic,
          totalOrders: boy.totalOrders || 0,
          orders: boy.orders || [],
          totalEarnings: calculateTotalEarnings(boy.orders || []),
          deliveredOrders: calculateDeliveredOrders(boy.orders || []),
          // Ensure documentStatus exists
          documentStatus: boy.documentStatus || { aadharCard: 'pending', drivingLicense: 'pending' }
        };
      });

      setDeliveryBoys(deliveryBoysWithOrders);
      setFilteredDeliveryBoys(deliveryBoysWithOrders);
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
      alert("Error fetching delivery boys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total earnings from orders
  const calculateTotalEarnings = (orders) => {
    return orders.reduce((total, order) => {
      const deliveryCharge = order.deliveryCharge || order.baseDeliveryCharge || 0;
      return total + deliveryCharge;
    }, 0);
  };

  // Calculate delivered orders count
  const calculateDeliveredOrders = (orders) => {
    return orders.filter(order =>
      order.orderStatus === 'Delivered' ||
      order.orderStatus === 'Completed' ||
      order.deliveryStatus === 'Delivered' ||
      order.deliveryStatus === 'Completed'
    ).length;
  };

  // Calculate total wallet transactions
  const calculateTotalWalletTransactions = (transactions) => {
    return transactions?.reduce((total, transaction) => total + (transaction.amount || 0), 0) || 0;
  };

  // Get latest wallet transactions
  const getRecentTransactions = (transactions, count = 5) => {
    if (!transactions) return [];
    return transactions
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, count);
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  // Filter delivery boys based on search and status
  useEffect(() => {
    let filtered = deliveryBoys;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(boy =>
        boy.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.mobileNumber?.includes(searchTerm) ||
        boy.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(boy =>
        boy.deliveryBoyStatus === statusFilter
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === 'totalOrders') {
        aValue = a.totalOrders || 0;
        bValue = b.totalOrders || 0;
      } else if (sortConfig.key === 'totalEarnings') {
        aValue = a.totalEarnings || 0;
        bValue = b.totalEarnings || 0;
      } else if (sortConfig.key === 'fullName') {
        aValue = a.fullName?.toLowerCase() || '';
        bValue = b.fullName?.toLowerCase() || '';
      } else if (sortConfig.key === 'deliveredOrders') {
        aValue = a.deliveredOrders || 0;
        bValue = b.deliveredOrders || 0;
      } else if (sortConfig.key === 'walletBalance') {
        aValue = a.walletBalance || 0;
        bValue = b.walletBalance || 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDeliveryBoys(filtered);
  }, [searchTerm, statusFilter, deliveryBoys, sortConfig]);

  // Handle sort
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400 text-xs" />;
    return sortConfig.direction === 'asc' ?
      <FaSortUp className="text-blue-600 text-xs" /> :
      <FaSortDown className="text-blue-600 text-xs" />;
  };

  // Handle View
  const handleView = (deliveryBoy) => {
    setViewData(deliveryBoy);
    setShowViewModal(true);
  };

  // Handle Edit with subAdminId
  const handleEdit = (deliveryBoy) => {
    setEditData({ ...deliveryBoy });
    setShowEditModal(true);
  };

  // Handle Delete with subAdminId
  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`${API_BASE_URL}/deletedeliveryboy/${deleteId}`, config);
      setShowDeleteModal(false);
      fetchDeliveryBoys();
      alert("Delivery boy deleted successfully!");
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
      alert("Error deleting delivery boy. Please try again.");
    }
  };

  // Handle Form Submit with subAdminId
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const subAdminId = getSubAdminId();
      const requestData = { ...editData };

      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      delete requestData._id;

      await axios.put(
        `${API_BASE_URL}/updatedeliverybody/${editData._id}`,
        requestData
      );
      setShowEditModal(false);
      fetchDeliveryBoys();
      alert("Delivery boy updated successfully!");
    } catch (error) {
      console.error("Error updating delivery boy:", error);
      alert("Error updating delivery boy. Please try again.");
    }
  };

  // Handle input change for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Set Delivery Charge
  const handleSetDeliveryCharge = async () => {
    if (!deliveryCharge || isNaN(deliveryCharge) || parseFloat(deliveryCharge) <= 0) {
      alert("Please enter a valid delivery charge amount");
      return;
    }

    try {
      setIsSettingCharge(true);

      const response = await axios.put(
        `${API_BASE_URL}/set-base-delivery-charge`,
        { baseDeliveryCharge: parseFloat(deliveryCharge) }
      );

      if (response.data.success) {
        setTimeout(() => {
          fetchDeliveryBoys();
        }, 500);

        setShowDeliveryChargeModal(false);
        setDeliveryCharge("");
        alert(response.data.message);
      } else {
        alert(response.data.message || "Failed to update delivery charge");
      }

    } catch (error) {
      console.error("Error updating delivery charges:", error);
      alert(error.response?.data?.message || "Error updating delivery charges. Please try again.");
    } finally {
      setIsSettingCharge(false);
    }
  };

  // Handle individual delivery charge update with subAdminId
  const handleIndividualChargeUpdate = async (deliveryBoyId, newCharge) => {
    try {
      const subAdminId = getSubAdminId();
      const requestData = { baseDeliveryCharge: parseFloat(newCharge) };

      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      const response = await axios.put(
        `${API_BASE_URL}/update-delivery-charge/${deliveryBoyId}`,
        requestData
      );

      if (response.data.success) {
        fetchDeliveryBoys();
        setEditingChargeId(null);
        setTempCharge("");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating individual delivery charge:", error);
      alert("Error updating delivery charge. Please try again.");
      return false;
    }
  };

  // Start editing individual charge
  const startEditingCharge = (deliveryBoy) => {
    setEditingChargeId(deliveryBoy._id);
    setTempCharge(deliveryBoy.baseDeliveryCharge || "");
  };

  // Cancel editing individual charge
  const cancelEditingCharge = () => {
    setEditingChargeId(null);
    setTempCharge("");
  };

  // Save individual charge
  const saveIndividualCharge = async (deliveryBoyId) => {
    if (tempCharge === "" || isNaN(tempCharge) || parseFloat(tempCharge) < 0) {
      alert("Please enter a valid delivery charge amount");
      return;
    }
    await handleIndividualChargeUpdate(deliveryBoyId, tempCharge);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Name',
      'Mobile',
      'Email',
      'Vehicle Type',
      'Total Orders',
      'Delivered Orders',
      'Total Earnings',
      'Delivery Charge',
      'Wallet Balance',
      'Status',
      'Location'
    ];

    const csvData = filteredDeliveryBoys.map(boy => [
      boy.fullName || '',
      boy.mobileNumber || '',
      boy.email || '',
      boy.vehicleType || '',
      boy.totalOrders || '0',
      boy.deliveredOrders || '0',
      boy.totalEarnings ? `₹${boy.totalEarnings.toFixed(2)}` : '₹0.00',
      boy.baseDeliveryCharge ? `₹${boy.baseDeliveryCharge}` : '₹0.00',
      boy.walletBalance ? `₹${boy.walletBalance}` : '₹0.00',
      boy.deliveryBoyStatus || '',
      boy.location?.coordinates ?
        `${boy.location.coordinates[1]?.toFixed(4)}, ${boy.location.coordinates[0]?.toFixed(4)}`
        : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delivery-boys-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const getStatusInfo = (status) => {
      switch (status?.toLowerCase()) {
        case 'approved':
        case 'verified':
        case 'active':
          return { color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
        case 'rejected':
        case 'suspended':
        case 'inactive':
          return { color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: FaClock };
      }
    };

    const { color, icon: Icon } = getStatusInfo(status);

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}>
        <Icon className="text-xs" />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  // Order Status Badge Component
  const OrderStatusBadge = ({ status }) => {
    const getOrderStatusClass = (status) => {
      switch (status?.toLowerCase()) {
        case 'delivered':
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'pending':
        case 'processing':
          return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
        case 'failed':
          return 'bg-red-100 text-red-800';
        case 'confirmed':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getOrderStatusClass(status)}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  // Get current user info
  const userInfo = getUserInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading delivery boys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4">
      <div className="max-w-full mx-auto">

        {/* Header */}
        <div className="mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <FaMotorcycle className="text-white text-lg" />
                  </div>
                  <span className="truncate">Delivery Boys Management</span>
                </h1>
                <p className="text-gray-600 text-sm mt-1 truncate">
                  Manage delivery boys, orders, and delivery charges
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {/* User Role Display */}
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${userInfo.role === "subadmin"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-indigo-100 text-indigo-800"
                  }`}>
                  <FaUserShield className="inline mr-1" size={12} />
                  {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
                </div>

                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs font-medium"
                >
                  <FaFileExport /> Export
                </button>
                <button
                  onClick={() => setShowDeliveryChargeModal(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-medium"
                >
                  <FaDollarSign /> Charge
                </button>
                <button
                  onClick={fetchDeliveryBoys}
                  className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-xs font-medium"
                >
                  <FaSync className={`${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Sub-Admin Note */}
            {userInfo.role === "subadmin" && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <FaInfoCircle className="inline mr-1" />
                  All updates under: <strong>{userInfo.name}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Riders</p>
                <p className="text-lg font-bold text-gray-900">{deliveryBoys.length}</p>
              </div>
              <FaMotorcycle className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Orders</p>
                <p className="text-lg font-bold text-gray-900">
                  {deliveryBoys.reduce((sum, boy) => sum + (boy.totalOrders || 0), 0)}
                </p>
              </div>
              <FaBox className="text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Earnings</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{deliveryBoys.reduce((sum, boy) => sum + (boy.totalEarnings || 0), 0).toFixed(0)}
                </p>
              </div>
              <FaRupeeSign className="text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Active Riders</p>
                <p className="text-lg font-bold text-gray-900">
                  {deliveryBoys.filter(boy => boy.deliveryBoyStatus === 'active').length}
                </p>
              </div>
              <FaTruck className="text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-4 bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by name, mobile, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Rider Info
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => requestSort('totalEarnings')}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Earnings {getSortIcon('totalEarnings')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => requestSort('walletBalance')}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Wallet {getSortIcon('walletBalance')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Charge
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveryBoys.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-6 text-center">
                      <div className="text-gray-500">
                        <FaMotorcycle className="text-2xl text-gray-300 mx-auto mb-2" />
                        <p>No delivery boys found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDeliveryBoys.map((deliveryBoy) => (
                    <tr key={deliveryBoy._id} className="hover:bg-gray-50">
                      {/* Rider Info Column */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {deliveryBoy.image ? (
                            <img
                              src={deliveryBoy.image}
                              alt={deliveryBoy.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-gray-200">
                              <FaUser className="text-indigo-400 text-sm" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm">
                              {deliveryBoy.fullName}
                            </div>
                            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                              <FaPhone className="text-xs" />
                              {deliveryBoy.mobileNumber}
                            </div>
                            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                              <FaEnvelope className="text-xs" />
                              {deliveryBoy.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Performance Column */}
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Orders:</span>
                            <span className="font-medium">{deliveryBoy.totalOrders || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Delivered:</span>
                            <span className="font-medium text-green-600">{deliveryBoy.deliveredOrders || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-green-500 h-1 rounded-full"
                              style={{
                                width: `${deliveryBoy.totalOrders > 0 ? (deliveryBoy.deliveredOrders / deliveryBoy.totalOrders) * 100 : 0}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Earnings Column */}
                      <td className="px-3 py-2">
                        <div>
                          <div className="font-bold text-purple-700 text-sm">
                            ₹{deliveryBoy.totalEarnings?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Avg: ₹{deliveryBoy.totalOrders > 0 ? (deliveryBoy.totalEarnings / deliveryBoy.totalOrders).toFixed(2) : '0.00'}
                          </div>
                        </div>
                      </td>

                      {/* Wallet Balance Column */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <FaWallet className="text-green-500" />
                          <span className="font-bold text-green-700">₹{deliveryBoy.walletBalance || '0.00'}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {deliveryBoy.walletTransactions?.length || 0} transactions
                        </div>
                      </td>

                      {/* Delivery Charge Column */}
                      <td className="px-3 py-2">
                        {editingChargeId === deliveryBoy._id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tempCharge}
                              onChange={(e) => setTempCharge(e.target.value)}
                              className="w-16 p-1 border border-gray-300 rounded text-xs"
                            />
                            <button
                              onClick={() => saveIndividualCharge(deliveryBoy._id)}
                              className="text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <FaSave className="text-xs" />
                            </button>
                            <button
                              onClick={cancelEditingCharge}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 group">
                            <span className="font-medium text-green-700 text-sm">
                              ₹{deliveryBoy.baseDeliveryCharge || '0.00'}
                            </span>
                            <button
                              onClick={() => startEditingCharge(deliveryBoy)}
                              className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 ml-1"
                              title="Edit Charge"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="px-3 py-2">
                        <div className="space-y-1">
                          <StatusBadge status={deliveryBoy.deliveryBoyStatus} />
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <FaCalendarAlt className="inline mr-1" />
                            {new Date(deliveryBoy.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(deliveryBoy)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            title="View Details"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleEdit(deliveryBoy)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                            title="Edit"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          {storedRole === 'admin' && (
                            <button
                              onClick={() => {
                                setDeleteId(deliveryBoy._id);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Delete"
                            >
                              <FaTrash className="text-sm" />
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
        </div>

        {/* Delivery Charge Modal */}
        {showDeliveryChargeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Set Base Delivery Charge
                  </h2>
                  <button
                    onClick={() => setShowDeliveryChargeModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {userInfo.role === "subadmin" && (
                  <div className="mb-3 p-2 bg-purple-50 rounded text-xs text-purple-800">
                    Setting as: <strong>{userInfo.name}</strong>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Charge (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="text-xs text-gray-500">
                    Will update {deliveryBoys.length} delivery boys
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleSetDeliveryCharge}
                    disabled={isSettingCharge || !deliveryCharge}
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-green-300 text-sm"
                  >
                    {isSettingCharge ? 'Updating...' : 'Set Charge'}
                  </button>
                  <button
                    onClick={() => setShowDeliveryChargeModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal - All Data Display */}
        {showViewModal && viewData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[95vh] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {viewData.image ? (
                      <img
                        src={viewData.image}
                        alt={viewData.fullName}
                        className="w-16 h-16 rounded-full border-2 border-white object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                        <FaUser className="text-white text-2xl" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-white">{viewData.fullName}</h2>
                      <div className="text-sm text-white/90 flex items-center gap-2">
                        <span>ID: {viewData._id?.slice(-8)}</span>
                        <StatusBadge status={viewData.deliveryBoyStatus} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:text-white/80 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(95vh-80px)]">
                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                  {/* Column 1: Personal & Bank Info */}
                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaUser className="text-indigo-500" />
                        Personal Information
                      </h3>
                      <div className="space-y-2">
                        <DetailItem label="Full Name" value={viewData.fullName} />
                        <DetailItem label="Mobile Number" value={viewData.mobileNumber} />
                        <DetailItem label="Email" value={viewData.email || 'Not provided'} />
                        <DetailItem label="Vehicle Type" value={viewData.vehicleType} />
                        <DetailItem label="Base Delivery Charge" value={`₹${viewData.baseDeliveryCharge || '0.00'}`} />
                        <DetailItem label="Current Order Status" value={viewData.currentOrderStatus || 'None'} />
                        <DetailItem label="Location Coordinates" value={
                          viewData.location?.coordinates ?
                            `Lat: ${viewData.location.coordinates[1]?.toFixed(6)}, Lng: ${viewData.location.coordinates[0]?.toFixed(6)}`
                            : 'Not available'
                        } />
                        <DetailItem label="Updated By" value={viewData.updatedBy || 'Not specified'} />
                      </div>
                    </div>

                    {/* Bank Account Details */}
                    {viewData.myAccountDetails && viewData.myAccountDetails.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-green-200">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FaCreditCard className="text-green-500" />
                          Bank Account Details
                        </h3>
                        <div className="space-y-3">
                          {viewData.myAccountDetails.map((account, index) => (
                            <div key={index} className="bg-white p-3 rounded border border-green-100">
                              <DetailItem label="Bank Name" value={account.bankName} />
                              <DetailItem label="Account Number" value={account.accountNumber} />
                              <DetailItem label="Account Holder" value={account.accountHolderName} />
                              <DetailItem label="IFSC Code" value={account.ifscCode} />
                              <DetailItem label="UPI ID" value={account.upiId || 'Not provided'} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Performance & Documents */}
                  <div className="space-y-4">
                    {/* Performance Stats */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaChartBar className="text-blue-500" />
                        Performance Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard
                          title="Total Orders"
                          value={viewData.totalOrders || 0}
                          color="blue"
                          icon={FaBox}
                        />
                        <StatCard
                          title="Delivered"
                          value={viewData.deliveredOrders || 0}
                          color="green"
                          icon={FaTruck}
                        />
                        <StatCard
                          title="Total Earnings"
                          value={`₹${viewData.totalEarnings?.toFixed(2) || '0.00'}`}
                          color="purple"
                          icon={FaRupeeSign}
                        />
                        <StatCard
                          title="Wallet Balance"
                          value={`₹${viewData.walletBalance || '0.00'}`}
                          color="green"
                          icon={FaWallet}
                        />
                      </div>

                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Success Rate</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${viewData.totalOrders > 0 ? (viewData.deliveredOrders / viewData.totalOrders) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {viewData.totalOrders > 0 ? Math.round((viewData.deliveredOrders / viewData.totalOrders) * 100) : 0}%
                        </div>
                      </div>
                    </div>

                    {/* Document Status */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaIdCard className="text-gray-600" />
                        Document Verification Status
                      </h3>
                      <div className="space-y-4">
                        {/* Aadhar Card */}
                        <div className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">Aadhar Card</span>
                              <StatusBadge status={viewData.documentStatus?.aadharCard} />
                            </div>
                            {viewData.aadharCard && (
                              <button
                                onClick={() => downloadDocument(
                                  viewData.aadharCard,
                                  getDocumentFilename('aadhar', viewData.fullName)
                                )}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                              >
                                <FaDownload className="text-xs" />
                                Download
                              </button>
                            )}
                          </div>
                          {viewData.aadharCard ? (
                            <div className="mt-2">
                              <img
                                src={viewData.aadharCard}
                                alt="Aadhar Card"
                                className="w-full h-32 object-contain border border-gray-300 rounded cursor-pointer hover:opacity-90"
                                onClick={() => window.open(viewData.aadharCard, '_blank')}
                              />
                              <div className="text-xs text-gray-500 text-center mt-1">
                                Click to view full size
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mt-2 text-center py-4">
                              No image uploaded
                            </div>
                          )}
                        </div>

                        {/* Driving License */}
                        <div className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">Driving License</span>
                              <StatusBadge status={viewData.documentStatus?.drivingLicense} />
                            </div>
                            {viewData.drivingLicense && (
                              <button
                                onClick={() => downloadDocument(
                                  viewData.drivingLicense,
                                  getDocumentFilename('license', viewData.fullName)
                                )}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                              >
                                <FaDownload className="text-xs" />
                                Download
                              </button>
                            )}
                          </div>
                          {viewData.drivingLicense ? (
                            <div className="mt-2">
                              <img
                                src={viewData.drivingLicense}
                                alt="Driving License"
                                className="w-full h-32 object-contain border border-gray-300 rounded cursor-pointer hover:opacity-90"
                                onClick={() => window.open(viewData.drivingLicense, '_blank')}
                              />
                              <div className="text-xs text-gray-500 text-center mt-1">
                                Click to view full size
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mt-2 text-center py-4">
                              No image uploaded
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-600" />
                        Timeline
                      </h3>
                      <div className="space-y-2">
                        <DetailItem label="Date of Joining" value={new Date(viewData.createdAt).toLocaleString()} />
                        <DetailItem label="Last Updated" value={new Date(viewData.updatedAt).toLocaleString()} />
                        <DetailItem label="Account Status" value={viewData.isActive ? 'Active' : 'Inactive'} />
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Orders & Transactions */}
                  <div className="space-y-4">
                    {/* All Orders */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FaBox className="text-orange-500" />
                          Orders ({viewData.orders?.length || 0})
                        </h3>
                        <span className="text-sm text-gray-600">
                          Total: {viewData.totalOrders || 0}
                        </span>
                      </div>

                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {viewData.orders && viewData.orders.length > 0 ? (
                          viewData.orders.map((order, index) => (
                            <div key={order.orderId} className="bg-white p-3 rounded border hover:bg-orange-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">
                                    Order #{order.orderId?.slice(-8)}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    Restaurant: {order.restaurantName}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <OrderStatusBadge status={order.orderStatus} />
                                    <span className="text-xs text-gray-500">
                                      {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-700">₹{order.totalPayable}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {order.paymentStatus}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-600">
                                Delivery: <span className="font-medium">{order.deliveryStatus}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <FaBox className="text-3xl text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No orders found</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Wallet Transactions */}
                    {viewData.walletTransactions && viewData.walletTransactions.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FaMoneyBill className="text-green-500" />
                            Wallet Transactions ({viewData.walletTransactions.length})
                          </h3>
                          <span className="text-sm text-green-700">
                            Total: ₹{calculateTotalWalletTransactions(viewData.walletTransactions)}
                          </span>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {getRecentTransactions(viewData.walletTransactions).map((transaction, index) => (
                            <div key={transaction._id} className="bg-white p-2 rounded border hover:bg-green-50">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {transaction.type === 'delivery' ? 'Delivery Charge' : transaction.type}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {transaction.orderId ? `Order: ${transaction.orderId.slice(-8)}` : 'N/A'}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-green-700">+₹{transaction.amount}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(transaction.dateAdded).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {viewData.walletTransactions.length > 5 && (
                          <div className="mt-2 text-center">
                            <button className="text-xs text-blue-600 hover:text-blue-800">
                              Show all {viewData.walletTransactions.length} transactions
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Delivery Boy ID: {viewData._id}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditData({ ...viewData });
                        setShowViewModal(false);
                        setShowEditModal(true);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                    >
                      Edit Delivery Boy
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Edit Delivery Boy</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {userInfo.role === "subadmin" && (
                  <div className="mb-3 p-2 bg-purple-50 rounded text-xs text-purple-800">
                    Editing as: <strong>{userInfo.name}</strong>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={editData?.fullName || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={editData?.mobileNumber || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editData?.email || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Type *
                      </label>
                      <select
                        name="vehicleType"
                        value={editData?.vehicleType || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select Vehicle</option>
                        <option value="Bike">Bike</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Bicycle">Bicycle</option>
                        <option value="Car">Car</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Charge (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="baseDeliveryCharge"
                        value={editData?.baseDeliveryCharge || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        value={editData?.deliveryBoyStatus || 'pending'}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          deliveryBoyStatus: e.target.value
                        }))}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Active Status
                      </label>
                      <select
                        name="isActive"
                        value={editData?.isActive?.toString() || 'true'}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          isActive: e.target.value === 'true'
                        }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-xs w-full">
              <div className="p-4">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <FaTrash className="text-red-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 text-xs mb-4">
                    Delete this delivery boy? This cannot be undone.
                  </p>
                </div>

                {userInfo.role === "subadmin" && (
                  <div className="mb-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                    Deletion under: <strong>{userInfo.name}</strong>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-1 text-sm">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-800 truncate max-w-[200px] text-right">{value || "-"}</span>
  </div>
);

const StatCard = ({ title, value, color, icon: Icon }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="bg-white p-3 rounded border text-center">
      <div className={`inline-flex p-1 rounded-lg mb-1 ${colorClasses[color]}`}>
        <Icon className="text-sm" />
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600">{title}</div>
    </div>
  );
};

export default DeliveryBoyList;