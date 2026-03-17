import { useState, useEffect } from "react";
import { 
  FaDownload, 
  FaFilter, 
  FaSearch, 
  FaRupeeSign, 
  FaCalendarAlt, 
  FaStore, 
  FaFileExport, 
  FaCheck,
  FaEye,
  FaTimes,
  FaReceipt,
  FaCreditCard,
  FaEdit,
  FaSpinner,
  FaTrash,
  FaUser,
  FaHashtag,
  FaBuilding,
  FaKey,
  FaUserShield,
  FaInfoCircle,
  FaImage,
  FaExternalLinkAlt
} from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function VendorPayments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // New states for status edit
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  
  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNote, setDeleteNote] = useState("");
  
  // Image viewer state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 8;

  // API Base URL
  const API_BASE_URL = "https://api.vegiffyy.com/api";

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

  // Get current user info
  const userInfo = getUserInfo();

  // Fetch all vendor payments
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/vendor/vendorpayments`);
      if (response.data.success) {
        setPayments(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vendor payments:", error);
      setLoading(false);
    }
  };

  // Format currency to proper decimal places
  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    if (num % 1 === 0) return num.toFixed(0);
    return num.toFixed(2);
  };

  // Format large currency with commas
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    const options = num % 1 === 0 
      ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return num.toLocaleString('en-IN', options);
  };

  // Calculate total amount correctly from response
  const getTotalAmount = (payment) => {
    if (payment.totalAmount !== undefined && payment.totalAmount !== null) {
      return parseFloat(payment.totalAmount);
    }
    const baseAmount = parseFloat(payment.amount || payment.planId?.price || 0);
    const gstAmount = parseFloat(payment.gstAmount || 0);
    return baseAmount + gstAmount;
  };

  // Export functionality
  const exportData = (type) => {
    const filteredData = filteredPayments.map(payment => ({
      "Restaurant Name": payment.vendorId?.restaurantName || "N/A",
      "Location": payment.vendorId?.locationName || "N/A",
      "Email": payment.vendorId?.email || "N/A",
      "Mobile": payment.vendorId?.mobile || "N/A",
      "Plan Name": payment.planId?.name || "N/A",
      "Base Amount": payment.amount || payment.planId?.price || "0",
      "GST Amount": payment.gstAmount || "0",
      "Total Amount": formatCurrency(getTotalAmount(payment)),
      "Transaction ID": payment.transactionId || "N/A",
      "Razorpay ID": payment.razorpayPaymentId || "N/A",
      "Purchase Date": payment.planPurchaseDate ? new Date(payment.planPurchaseDate).toLocaleDateString() : "N/A",
      "Expiry Date": payment.expiryDate ? new Date(payment.expiryDate).toLocaleDateString() : "N/A",
      "Status": payment.isPurchased ? "Completed" : "Pending",
      "Payment Status": payment.status || "N/A",
      "Account Name": payment.bankDetails?.accountName || "N/A",
      "Account Number": payment.bankDetails?.accountNumber || "N/A",
      "Bank Name": payment.bankDetails?.bankName || "N/A",
      "IFSC Code": payment.bankDetails?.ifscCode || "N/A",
      "Updated By": payment.updatedBy || "Admin",
      "Status Note": payment.statusNote || "N/A"
    }));

    const ws = utils.json_to_sheet(filteredData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "VendorPayments");
    writeFile(wb, `vendor-payments.${type}`);
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.vendorId?.restaurantName?.toLowerCase().includes(search.toLowerCase()) ||
      payment.vendorId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      payment.vendorId?.locationName?.toLowerCase().includes(search.toLowerCase()) ||
      payment.planId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && payment.isPurchased) ||
      (statusFilter === "pending" && !payment.isPurchased);

    const paymentDate = payment.planPurchaseDate ? new Date(payment.planPurchaseDate) : null;
    const now = new Date();
    
    const matchesDate = dateFilter === "all" || 
      !paymentDate || (
        (dateFilter === "today" && paymentDate.toDateString() === now.toDateString()) ||
        (dateFilter === "week" && (now - paymentDate) / (1000 * 60 * 60 * 24) <= 7) ||
        (dateFilter === "month" && paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear())
      );

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge component
  const StatusBadge = ({ isPurchased, status }) => {
    let badgeClass = '';
    let displayStatus = status || (isPurchased ? 'Completed' : 'Pending');
    
    switch(status) {
      case 'completed':
      case 'success':
        badgeClass = 'bg-green-100 text-green-800';
        displayStatus = 'Completed';
        break;
      case 'pending_verification':
      case 'pending':
        badgeClass = 'bg-yellow-100 text-yellow-800';
        displayStatus = 'Pending';
        break;
      case 'failed':
      case 'rejected':
        badgeClass = 'bg-red-100 text-red-800';
        displayStatus = 'Failed';
        break;
      default:
        badgeClass = isPurchased ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {displayStatus}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return "N/A";
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : "Expired";
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
  };

  // Calculate total revenue
  const totalRevenue = payments.reduce((sum, payment) => {
    return sum + getTotalAmount(payment);
  }, 0);

  // Open payment details modal
  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  // Close payment details modal
  const closePaymentDetails = () => {
    setSelectedPayment(null);
    setShowDetailsModal(false);
  };

  // Open status edit modal
  const openStatusModal = (payment) => {
    setEditingPayment(payment);
    setNewStatus(payment.status || (payment.isPurchased ? 'completed' : 'pending'));
    setStatusNote("");
    setShowStatusModal(true);
  };

  // Close status edit modal
  const closeStatusModal = () => {
    setEditingPayment(null);
    setNewStatus("");
    setStatusNote("");
    setShowStatusModal(false);
  };

  // Open delete confirmation modal
  const openDeleteModal = (payment) => {
    setDeletingPayment(payment);
    setDeleteNote("");
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeletingPayment(null);
    setDeleteNote("");
    setShowDeleteModal(false);
  };

  // Open image viewer
  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl);
    setShowImageViewer(true);
  };

  // Close image viewer
  const closeImageViewer = () => {
    setCurrentImage("");
    setShowImageViewer(false);
  };

  // Download image
  const downloadImage = (imageUrl) => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `payment-screenshot-${selectedPayment?._id || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update payment status with sub-admin info
  const updatePaymentStatus = async () => {
    if (!editingPayment || !newStatus) return;

    try {
      setIsUpdating(true);
      
      const isPurchased = newStatus === 'completed' || newStatus === 'success';
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();
      
      // Prepare update data
      const updateData = {
        status: newStatus,
        isPurchased: isPurchased,
        ...(isPurchased && !editingPayment.planPurchaseDate && {
          planPurchaseDate: new Date().toISOString()
        })
      };
      
      // Add sub-admin info if user is sub-admin
      if (subAdminId) {
        updateData.updatedBy = userInfo.role === "subadmin" ? `Sub-admin: ${userInfo.name}` : "Admin";
      }
      
      // Add status note if provided
      if (statusNote.trim()) {
        updateData.statusNote = `${statusNote} (${userInfo.role === "subadmin" ? `Updated by Sub-admin: ${userInfo.name}` : "Updated by Admin"})`;
      } else {
        updateData.statusNote = `Status updated to ${newStatus} (${userInfo.role === "subadmin" ? `Updated by Sub-admin: ${userInfo.name}` : "Updated by Admin"})`;
      }

      const response = await axios.put(
        `${API_BASE_URL}/vendor/vendorpayments/${editingPayment._id}`,
        updateData
      );

      if (response.data.success) {
        setPayments(payments.map(payment => 
          payment._id === editingPayment._id 
            ? { ...payment, ...updateData }
            : payment
        ));
        closeStatusModal();
        alert('Status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete payment with sub-admin info
  const deletePayment = async () => {
    if (!deletingPayment) return;

    try {
      setIsDeleting(true);
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();
      
      // Prepare delete data with sub-admin info
      const deleteData = {};
      
      if (subAdminId) {
        deleteData.subAdminId = subAdminId;
      }
      
      // Add delete note if provided
      if (deleteNote.trim()) {
        deleteData.deleteNote = `${deleteNote} (${userInfo.role === "subadmin" ? `Deleted by Sub-admin: ${userInfo.name}` : "Deleted by Admin"})`;
      } else {
        deleteData.deleteNote = `Payment deleted (${userInfo.role === "subadmin" ? `Deleted by Sub-admin: ${userInfo.name}` : "Deleted by Admin"})`;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/vendor/deletevendorpayment/${deletingPayment._id}`,
        { data: deleteData }
      );

      if (response.data.success) {
        setPayments(payments.filter(payment => payment._id !== deletingPayment._id));
        closeDeleteModal();
        alert('Payment deleted successfully!');
      } else {
        alert(response.data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert(error.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  // Available status options
  const statusOptions = [
    { value: 'pending_verification', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-3 md:p-4">
      <div className="max-w-[98vw] mx-auto">
        {/* Header with User Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded">
                <FaStore className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Vendor Payments</h1>
                <p className="text-sm text-gray-600">Manage vendor subscription payments</p>
              </div>
            </div>
            
            {/* User Role Display */}
            <div className="flex gap-2">
              <div className={`px-3 py-1 rounded text-xs font-medium ${
                userInfo.role === "subadmin" 
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

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 md:mb-6">
          <div className="bg-white rounded-lg p-3 shadow border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaReceipt className="text-blue-600 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-lg font-bold text-gray-900">{payments.filter(p => p.isPurchased).length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheck className="text-green-600 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-gray-900">{payments.filter(p => !p.isPurchased).length}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-yellow-600 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-gray-900">₹{formatAmount(totalRevenue)}</p>
              </div>
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                <FaStore className="text-cyan-600 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search - Compact */}
        <div className="bg-white rounded-lg p-3 shadow border border-gray-200 mb-3">
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>

              {/* Date Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-sm"
              >
                Reset
              </button>
            </div>

            {/* Export Buttons - Icons only */}
            <div className="flex gap-1">
              <button 
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                onClick={() => exportData("csv")}
                title="Export CSV"
              >
                <FaFileExport className="w-4 h-4" />
              </button>
              <button 
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                onClick={() => exportData("xlsx")}
                title="Export Excel"
              >
                <FaDownload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table - Compact */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                      <th className="p-2 text-left font-semibold text-xs">#</th>
                      <th className="p-2 text-left font-semibold text-xs">Restaurant</th>
                      <th className="p-2 text-left font-semibold text-xs">Plan</th>
                      <th className="p-2 text-left font-semibold text-xs">Payment</th>
                      <th className="p-2 text-left font-semibold text-xs">Dates</th>
                      <th className="p-2 text-left font-semibold text-xs">Status</th>
                      <th className="p-2 text-left font-semibold text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayments.map((payment, index) => {
                      const totalAmt = getTotalAmount(payment);
                      const formattedTotal = formatCurrency(totalAmt);
                      
                      return (
                        <tr key={payment._id} className="border-b border-gray-100 hover:bg-blue-50">
                          <td className="p-2 text-gray-600 text-xs">
                            {indexOfFirstPayment + index + 1}
                          </td>
                          
                          {/* Restaurant Details */}
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {payment.vendorId?.restaurantName?.charAt(0) || "R"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-xs truncate max-w-[120px]">
                                  {payment.vendorId?.restaurantName || "N/A"}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                                  {payment.vendorId?.email || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Plan Details */}
                          <td className="p-2">
                            <div>
                              <p className="font-semibold text-gray-900 text-xs truncate max-w-[100px]">
                                {payment.planId?.name || "Plan"}
                              </p>
                              <p className="text-[10px] text-gray-600">
                                {payment.planId?.validity || 0} days
                              </p>
                              <div className="text-[10px] text-green-600">
                                {getDaysRemaining(payment.expiryDate)}
                              </div>
                            </div>
                          </td>
                          
                          {/* Payment Details */}
                          <td className="p-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <FaRupeeSign className="w-2 h-2 text-blue-600" />
                                <span className="font-bold text-blue-600 text-sm">
                                  {formattedTotal}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-600">
                                <div className="flex justify-between">
                                  <span>Base:</span>
                                  <span>₹{formatCurrency(payment.amount || payment.planId?.price || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>GST:</span>
                                  <span>₹{formatCurrency(payment.gstAmount || 0)}</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-gray-500 truncate">
                                ID: {payment.transactionId?.substring(0, 8) || "N/A"}
                              </p>
                            </div>
                          </td>
                          
                          {/* Dates */}
                          <td className="p-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[10px]">
                                <FaCalendarAlt className="text-green-500 w-2 h-2" />
                                <span className="text-gray-600">Buy:</span>
                                <span className="font-medium truncate">{formatDate(payment.planPurchaseDate)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px]">
                                <FaCalendarAlt className="text-red-500 w-2 h-2" />
                                <span className="text-gray-600">Exp:</span>
                                <span className="font-medium truncate">{formatDate(payment.expiryDate)}</span>
                              </div>
                            </div>
                          </td>
                          
                          {/* Status */}
                          <td className="p-2">
                            <StatusBadge isPurchased={payment.isPurchased} status={payment.status} />
                            {payment.statusNote && (
                              <div className="text-[9px] text-gray-500 mt-0.5 truncate max-w-[100px]" title={payment.statusNote}>
                                {payment.statusNote.length > 20 ? payment.statusNote.substring(0, 20) + '...' : payment.statusNote}
                              </div>
                            )}
                          </td>
                          
                          {/* Actions - Icons only */}
                          <td className="p-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openPaymentDetails(payment)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition"
                                title="View Details"
                              >
                                <FaEye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => openStatusModal(payment)}
                                className="p-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded transition"
                                title="Edit Status"
                              >
                                <FaEdit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(payment)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition"
                                title="Delete"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {currentPayments.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaStore className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No payments found</h3>
                  <button
                    onClick={resetFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination - Compact */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-3">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-xs rounded"
            >
              Prev
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-2 py-1 rounded text-xs ${
                  currentPage === index + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-xs rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Payment Details Modal - With Screenshot Support */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                  <p className="text-gray-600 text-xs">Transaction information</p>
                </div>
                <button
                  onClick={closePaymentDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 gap-3">
                {/* Payment Summary */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded p-3 text-white">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="text-sm font-bold">Payment Summary</h4>
                      <p className="text-blue-100 text-xs">{selectedPayment.planId?.name || "Plan"}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">₹{formatCurrency(getTotalAmount(selectedPayment))}</div>
                      <div className="text-blue-100 text-xs">Total Paid</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <span className="text-blue-200">Base:</span>
                      <div className="font-medium">₹{formatCurrency(selectedPayment.amount || selectedPayment.planId?.price || 0)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-200">GST:</span>
                      <div className="font-medium">₹{formatCurrency(selectedPayment.gstAmount || 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot Section */}
                {selectedPayment.paymentScreenshot && (
                  <div className="bg-blue-50 rounded p-3 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1">
                      <FaImage className="w-3 h-3 text-blue-600" />
                      Payment Screenshot
                    </h4>
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <img 
                          src={selectedPayment.paymentScreenshot} 
                          alt="Payment Screenshot"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition"
                          onClick={() => openImageViewer(selectedPayment.paymentScreenshot)}
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          Click to view
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openImageViewer(selectedPayment.paymentScreenshot)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <FaEye className="w-3 h-3" />
                          View Full Image
                        </button>
                        <button
                          onClick={() => downloadImage(selectedPayment.paymentScreenshot)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-xs flex items-center justify-center gap-1"
                        >
                          <FaDownload className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                      {selectedPayment.screenshotUploadedAt && (
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(selectedPayment.screenshotUploadedAt).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Vendor Details */}
                <div className="bg-gray-50 rounded p-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1">
                    <FaStore className="w-3 h-3 text-blue-600" />
                    Vendor
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Restaurant</p>
                      <p className="font-medium">{selectedPayment.vendorId?.restaurantName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{selectedPayment.vendorId?.locationName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{selectedPayment.vendorId?.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mobile</p>
                      <p className="font-medium">{selectedPayment.vendorId?.mobile || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-gray-50 rounded p-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1">
                    <FaCreditCard className="w-3 h-3 text-blue-600" />
                    Transaction
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div>
                      <p className="text-gray-500">Transaction ID</p>
                      <p className="font-medium font-mono">{selectedPayment.transactionId || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Razorpay ID</p>
                      <p className="font-medium font-mono">{selectedPayment.razorpayPaymentId || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <StatusBadge isPurchased={selectedPayment.isPurchased} status={selectedPayment.status} />
                    </div>
                    {selectedPayment.statusNote && (
                      <div>
                        <p className="text-gray-500">Status Note</p>
                        <p className="font-medium text-xs">{selectedPayment.statusNote}</p>
                      </div>
                    )}
                    {selectedPayment.updatedBy && (
                      <div>
                        <p className="text-gray-500">Updated By</p>
                        <p className="font-medium text-xs">{selectedPayment.updatedBy}</p>
                      </div>
                    )}
                    {selectedPayment.submittedAt && (
                      <div>
                        <p className="text-gray-500">Submitted At</p>
                        <p className="font-medium text-xs">{new Date(selectedPayment.submittedAt).toLocaleString('en-IN')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan & Dates */}
                <div className="bg-gray-50 rounded p-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1">
                    <FaCalendarAlt className="w-3 h-3 text-blue-600" />
                    Plan & Dates
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Purchase Date</p>
                      <p className="font-medium">{formatDate(selectedPayment.planPurchaseDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expiry Date</p>
                      <p className="font-medium">{formatDate(selectedPayment.expiryDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Validity</p>
                      <p className="font-medium">{selectedPayment.planId?.validity || 0} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Remaining</p>
                      <p className="font-medium text-green-600">{getDaysRemaining(selectedPayment.expiryDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                {selectedPayment.bankDetails && (
                  <div className="bg-blue-50 rounded p-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1">
                      Bank Account Details
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <FaUser className="w-3 h-3 text-gray-400" />
                            Account Name
                          </p>
                          <p className="font-medium">{selectedPayment.bankDetails.accountName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <FaHashtag className="w-3 h-3 text-gray-400" />
                            Account Number
                          </p>
                          <p className="font-medium font-mono">{selectedPayment.bankDetails.accountNumber || "N/A"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <FaBuilding className="w-3 h-3 text-gray-400" />
                            Bank Name
                          </p>
                          <p className="font-medium">{selectedPayment.bankDetails.bankName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <FaKey className="w-3 h-3 text-gray-400" />
                            IFSC Code
                          </p>
                          <p className="font-medium font-mono">{selectedPayment.bankDetails.ifscCode || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Bank Details Message */}
                {!selectedPayment.bankDetails && !selectedPayment.paymentScreenshot && (
                  <div className="bg-gray-50 rounded p-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1">
                      Bank Account Details
                    </h4>
                    <p className="text-xs text-gray-500 italic">No bank details available for this payment</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={closePaymentDetails}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-3 z-50">
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 z-10"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="relative">
              <img 
                src={currentImage} 
                alt="Payment Screenshot Full View"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Download Button */}
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={() => downloadImage(currentImage)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  Download
                </button>
              </div>
              
              {/* Open in New Tab Button */}
              <div className="absolute bottom-3 left-3">
                <a
                  href={currentImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                  Open in New Tab
                </a>
              </div>
            </div>

            {/* Image Info */}
            <div className="mt-2 text-center text-white text-sm">
              <p>Payment Screenshot</p>
              <p className="text-gray-300">Click outside image or press ESC to close</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Edit Modal - With Sub-Admin Info */}
      {showStatusModal && editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">Update Status</h3>
                <button
                  onClick={closeStatusModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isUpdating}
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* User Info for Edit */}
              {userInfo.role === "subadmin" && (
                <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                  <p className="text-purple-800">
                    Updating as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Select...</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Note (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note about this status change..."
                  rows="2"
                  disabled={isUpdating}
                />
              </div>

              <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                <p><strong>Vendor:</strong> {editingPayment.vendorId?.restaurantName || "N/A"}</p>
                <p><strong>Amount:</strong> ₹{formatCurrency(getTotalAmount(editingPayment))}</p>
                <p><strong>Current:</strong> <StatusBadge isPurchased={editingPayment.isPurchased} status={editingPayment.status} /></p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeStatusModal}
                  disabled={isUpdating}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updatePaymentStatus}
                  disabled={isUpdating || !newStatus}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Updating
                    </>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - With Sub-Admin Info */}
      {showDeleteModal && deletingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-red-600">Delete Payment</h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isDeleting}
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* User Info for Delete */}
              {userInfo.role === "subadmin" && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <p className="text-yellow-800">
                    Deleting as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="mb-3 flex justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="text-red-600 text-lg" />
                </div>
              </div>

              <div className="mb-3 text-center">
                <p className="text-sm text-gray-700 mb-2">Delete payment record for:</p>
                <p className="font-medium">{deletingPayment.vendorId?.restaurantName || "N/A"}</p>
                <p className="text-xs text-gray-500">₹{formatCurrency(getTotalAmount(deletingPayment))} • {deletingPayment.transactionId?.substring(0, 12) || "N/A"}</p>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delete Note (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
                  value={deleteNote}
                  onChange={(e) => setDeleteNote(e.target.value)}
                  placeholder="Add a note about why this is being deleted..."
                  rows="2"
                  disabled={isDeleting}
                />
              </div>

              <div className="mb-3 bg-red-50 rounded p-2 text-xs text-red-700">
                ⚠️ This action cannot be undone
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={deletePayment}
                  disabled={isDeleting}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}