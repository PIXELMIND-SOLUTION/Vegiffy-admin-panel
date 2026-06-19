import { useState, useEffect } from "react";
import {
  FaDownload, FaFilter, FaSearch, FaRupeeSign, FaCalendarAlt,
  FaUser, FaFileExport, FaCheck, FaEye, FaTimes, FaIdCard,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaTag, FaListAlt,
  FaReceipt, FaEdit, FaTrash, FaBuilding, FaCreditCard,
  FaExchangeAlt, FaHistory, FaFileInvoiceDollar, FaDatabase,
  FaUserShield, FaInfoCircle, FaCamera, FaImage, FaFileImage,
  FaStickyNote, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf
} from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function AmbassadorPayments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const storedRole = sessionStorage.getItem("role");


  // New state for screenshot preview
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 8;

  const API_BASE_URL = "https://api.vegiffy.in/api/admin";

  // ✅ FIXED: Status options with proper mapping - ONLY use status field
  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <FaHourglassHalf className="mr-1" size={10} /> },
    { value: "pending_verification", label: "Pending Verification", color: "bg-orange-100 text-orange-800", icon: <FaClock className="mr-1" size={10} /> },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-800", icon: <FaCheckCircle className="mr-1" size={10} /> },
    { value: "failed", label: "Failed", color: "bg-red-100 text-red-800", icon: <FaTimesCircle className="mr-1" size={10} /> },
  ];

  const getSubAdminId = () => {
    try {
      const userRole = sessionStorage.getItem("role");
      if (userRole === "subadmin") {
        const adminId = sessionStorage.getItem("adminId");
        return adminId;
      }
      return null;
    } catch (error) {
      console.error("Error getting subAdminId:", error);
      return null;
    }
  };

  const getUserInfo = () => {
    try {
      const role = sessionStorage.getItem("role");
      const name = sessionStorage.getItem("adminName");
      const email = sessionStorage.getItem("adminEmail");
      const id = sessionStorage.getItem("adminId");

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
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/allambsdorpayments`);
      // ✅ FIX: Handle response properly
      const paymentsData = response.data.data || response.data || [];
      setPayments(paymentsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setLoading(false);
    }
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  // New function to view payment screenshot
  const viewPaymentScreenshot = (payment) => {
    if (payment.paymentScreenshot) {
      setScreenshotUrl(payment.paymentScreenshot);
      setShowScreenshotModal(true);
    } else {
      alert("No payment screenshot available");
    }
  };

  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    // ✅ CRITICAL FIX: Use ONLY status field, ignore paymentStatus
    const currentStatus = payment.status || "pending";
    setEditStatus(currentStatus);
    setEditNotes(payment.note || payment.adminNotes || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPayment(null);
    setEditStatus("");
    setEditNotes("");
  };

  const handleStatusUpdate = async () => {
    if (!selectedPayment || !editStatus) return;

    setProcessing(true);
    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      const requestData = {
        status: editStatus,
        adminNotes: editNotes,
        subAdminId: subAdminId
      };

      const response = await axios.put(
        `https://api.vegiffy.in/api/ambsdor/ambsaddorpayments/${selectedPayment._id}`,
        requestData
      );

      if (response.data.success) {
        setSuccessMessage("Payment status updated successfully!");
        setSuccessModal(true);
        fetchPayments();
        closeEditModal();

        setTimeout(() => {
          setSuccessModal(false);
        }, 3000);
      } else {
        alert(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert(error.response?.data?.message || "Error updating payment status");
    } finally {
      setProcessing(false);
    }
  };

  const openDeleteConfirm = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setPaymentToDelete(null);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;

    setProcessing(true);
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      const response = await axios.delete(
        `https://api.vegiffy.in/api/ambsdor/deleteambsaddorpayment/${paymentToDelete._id}`,
        config
      );

      if (response.data.success) {
        setSuccessMessage("Payment record deleted successfully!");
        setSuccessModal(true);
        fetchPayments();
        closeDeleteConfirm();

        setTimeout(() => {
          setSuccessModal(false);
        }, 3000);
      } else {
        alert(response.data.message || "Failed to delete payment");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert(error.response?.data?.message || "Error deleting payment");
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  const closeScreenshotModal = () => {
    setShowScreenshotModal(false);
    setScreenshotUrl("");
  };

  const exportData = (type) => {
    const userInfo = getUserInfo();
    const filteredData = filteredPayments.map(payment => ({
      "Ambassador Name": payment.ambassadorId?.fullName || "N/A",
      "Email": payment.ambassadorId?.email || "N/A",
      "Mobile": payment.ambassadorId?.mobileNumber || "N/A",
      "Plan Name": payment.planId?.name || "N/A",
      "Plan Price": payment.planId?.price || "N/A",
      "Transaction ID": payment.transactionId || "N/A",
      "Purchase Date": new Date(payment.planPurchaseDate).toLocaleDateString(),
      "Expiry Date": new Date(payment.expiryDate).toLocaleDateString(),
      // ✅ CRITICAL FIX: Use ONLY status field
      "Payment Status": getStatusLabel(payment.status),
      "Payment Method": payment.paymentMethod || "N/A",
      "Base Amount": payment.baseAmount || "N/A",
      "Discount": payment.discount || 0,
      "Discounted Price": payment.discountedPrice || "N/A",
      "GST Amount": payment.gstAmount || "N/A",
      "Total Amount": payment.totalAmount || "N/A",
      "Bank Account": payment.bankDetails?.accountNumber || "N/A",
      "Bank Name": payment.bankDetails?.bankName || "N/A",
      "City": payment.ambassadorId?.city || "N/A",
      "Referral Code": payment.ambassadorId?.referralCode || "N/A",
      "Payment Screenshot": payment.paymentScreenshot || "Not Available",
      "Admin Notes": payment.note || payment.adminNotes || "Created by Admin",
      "Verified By": payment.verifiedBy || "Not verified",
      "Verified At": payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleString() : "Not verified",
      "Updated By": userInfo.role === "subadmin" ? `Sub-admin: ${userInfo.name}` : "Admin",
      "Export Date": new Date().toLocaleDateString()
    }));

    const ws = utils.json_to_sheet(filteredData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "AmbassadorPayments");
    writeFile(wb, `ambassador-payments.${type}`);

    setSuccessMessage(`Data exported successfully as ${type.toUpperCase()}!`);
    setSuccessModal(true);
    setTimeout(() => setSuccessModal(false), 3000);
  };

  // ✅ FIXED: Get status info function - use ONLY status field
  const getStatusInfo = (status) => {
    if (!status) return statusOptions[0]; // Default to pending

    const statusObj = statusOptions.find(s => s.value === status);
    if (statusObj) return statusObj;

    // If status doesn't match exactly, try to find partial match
    const partialMatch = statusOptions.find(s =>
      status.toLowerCase().includes(s.value.toLowerCase()) ||
      s.value.toLowerCase().includes(status.toLowerCase())
    );

    return partialMatch || {
      value: status,
      label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: "bg-gray-100 text-gray-800",
      icon: <FaInfoCircle className="mr-1" size={10} />
    };
  };

  const getStatusLabel = (status) => {
    const info = getStatusInfo(status);
    return info.label;
  };

  // ✅ FIXED: Filter payments properly - use ONLY status field
  const filteredPayments = payments.filter((payment) => {
    if (!payment) return false;

    const ambassadorName = payment.ambassadorId?.fullName?.toLowerCase() || "";
    const ambassadorEmail = payment.ambassadorId?.email?.toLowerCase() || "";
    const planName = payment.planId?.name?.toLowerCase() || "";
    const transactionId = payment.transactionId?.toLowerCase() || "";

    const searchLower = search.toLowerCase();
    const matchesSearch =
      ambassadorName.includes(searchLower) ||
      ambassadorEmail.includes(searchLower) ||
      planName.includes(searchLower) ||
      transactionId.includes(searchLower);

    // ✅ CRITICAL FIX: Use ONLY status field, ignore paymentStatus
    const currentStatus = payment.status || "pending";
    const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;

    const paymentDate = payment.planPurchaseDate ? new Date(payment.planPurchaseDate) : new Date();
    const now = new Date();
    const matchesDate = dateFilter === "all" ||
      (dateFilter === "today" && paymentDate.toDateString() === now.toDateString()) ||
      (dateFilter === "week" && (now - paymentDate) / (1000 * 60 * 60 * 24) <= 7) ||
      (dateFilter === "month" && paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear());

    return matchesSearch && matchesStatus && matchesDate;
  });

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
  };

  // ✅ FIXED: StatusBadge component - use ONLY status field
  const StatusBadge = ({ status }) => {
    const info = getStatusInfo(status);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${info.color}`}>
        {info.icon}
        {info.label}
      </span>
    );
  };

  const PaymentMethodBadge = ({ method }) => {
    const getMethodColor = (method) => {
      switch (method?.toLowerCase()) {
        case 'razorpay':
          return 'bg-blue-100 text-blue-800';
        case 'upi':
          return 'bg-purple-100 text-purple-800';
        case 'bank_transfer':
        case 'bank transfer':
          return 'bg-green-100 text-green-800';
        case 'cash':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getMethodLabel = (method) => {
      switch (method?.toLowerCase()) {
        case 'razorpay':
          return 'Razorpay';
        case 'upi':
          return 'UPI';
        case 'bank_transfer':
        case 'bank transfer':
          return 'Bank Transfer';
        case 'cash':
          return 'Cash';
        default:
          return method || 'Unknown';
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMethodColor(method)}`}>
        {getMethodLabel(method)}
      </span>
    );
  };

  // New function to check if payment has screenshot
  const hasScreenshot = (payment) => {
    return payment.paymentScreenshot && payment.paymentScreenshot.trim() !== "";
  };

  const userInfo = getUserInfo();

  // ✅ FIXED: Calculate stats properly - use ONLY status field
  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'pending_verification').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;
  const totalRevenue = payments.reduce((sum, payment) => {
    return sum + (payment.totalAmount || payment.planId?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto">
        {/* Header with User Info */}
        <div className="mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaFileInvoiceDollar className="text-purple-600" />
                  Ambassador Payments
                </h1>
                <p className="text-sm text-gray-600">Manage ambassador plan payments</p>
              </div>

              <div className="flex gap-2">
                <div className={`px-3 py-1 rounded text-xs font-medium ${userInfo.role === "subadmin"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                  }`}>
                  <FaUserShield className="inline mr-1" size={12} />
                  {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
                </div>
              </div>
            </div>

            {userInfo.role === "subadmin" && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-800 flex items-center gap-1">
                  <FaInfoCircle size={10} />
                  <span>All updates will be recorded under your name with ID: {userInfo.id}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{totalPayments}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                <FaRupeeSign className="text-purple-600 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-lg font-bold text-gray-900">{completedPayments}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                <FaCheck className="text-green-600 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-gray-900">{pendingPayments}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                <FaCalendarAlt className="text-yellow-600 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Failed</p>
                <p className="text-lg font-bold text-gray-900">{failedPayments}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                <FaTimesCircle className="text-red-600 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <FaDatabase className="text-blue-600 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="Search by name, email, plan, transaction..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <button
                onClick={resetFilters}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Reset
              </button>
            </div>

            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                onClick={() => exportData("csv")}
              >
                <FaFileExport className="w-3 h-3" />
                CSV
              </button>
              <button
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                onClick={() => exportData("xlsx")}
              >
                <FaDownload className="w-3 h-3" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-2 text-left font-medium">#</th>
                      <th className="p-2 text-left font-medium">Ambassador</th>
                      <th className="p-2 text-left font-medium">Plan</th>
                      <th className="p-2 text-left font-medium">Amount</th>
                      <th className="p-2 text-left font-medium">Status</th>
                      <th className="p-2 text-left font-medium">Payment Screenshot</th>
                      <th className="p-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayments.map((payment, index) => {
                      // ✅ CRITICAL FIX: Use ONLY status field
                      const displayStatus = payment.status || "pending";

                      return (
                        <tr
                          key={payment._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-2 text-gray-600">
                            {indexOfFirstPayment + index + 1}
                          </td>

                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {payment.ambassadorId?.fullName?.charAt(0) || "A"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-xs">
                                  {payment.ambassadorId?.fullName?.substring(0, 15) || "N/A"}
                                  {payment.ambassadorId?.fullName?.length > 15 ? "..." : ""}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {payment.ambassadorId?.email?.substring(0, 15)}
                                  {payment.ambassadorId?.email?.length > 15 ? "..." : ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-2">
                            <p className="font-medium text-gray-900 text-xs">
                              {payment.planId?.name?.substring(0, 15) || "N/A"}
                              {payment.planId?.name?.length > 15 ? "..." : ""}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <FaRupeeSign className="w-2 h-2 text-gray-500" />
                              <span className="text-xs font-bold text-purple-600">
                                {payment.totalAmount?.toLocaleString() || payment.planId?.price?.toLocaleString() || "0"}
                              </span>
                            </div>
                          </td>

                          <td className="p-2">
                            <p className="text-xs font-medium">
                              ₹{payment.totalAmount?.toLocaleString() || payment.planId?.price?.toLocaleString() || "0"}
                            </p>
                          </td>

                          <td className="p-2">
                            <StatusBadge status={displayStatus} />
                          </td>

                          {/* Payment Screenshot Column */}
                          <td className="p-2">
                            {hasScreenshot(payment) ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-10 h-10 border border-gray-300 rounded overflow-hidden cursor-pointer hover:opacity-90"
                                  onClick={() => viewPaymentScreenshot(payment)}
                                  title="Click to view screenshot"
                                >
                                  <img
                                    src={payment.paymentScreenshot}
                                    alt="Payment Screenshot"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "https://via.placeholder.com/40x40/cccccc/ffffff?text=SS";
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={() => viewPaymentScreenshot(payment)}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  View
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No screenshot</span>
                            )}
                          </td>

                          <td className="p-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => viewPaymentDetails(payment)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded"
                                title="View"
                              >
                                <FaEye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => openEditModal(payment)}
                                className="bg-green-50 hover:bg-green-100 text-green-600 p-1.5 rounded"
                                title="Edit"
                              >
                                <FaEdit className="w-3 h-3" />
                              </button>
                              {storedRole === 'admin' && (
                                <button
                                  onClick={() => openDeleteConfirm(payment)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded"
                                  title="Delete"
                                >
                                  <FaTrash className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {currentPayments.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No payments found</h3>
                  <p className="text-xs text-gray-500 mb-3">Try adjusting your search or filters</p>
                  <button
                    onClick={resetFilters}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 px-3 py-1.5 rounded text-sm"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1.5 rounded text-sm ${currentPage === index + 1
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 px-3 py-1.5 rounded text-sm"
            >
              Next
            </button>
          </div>
        )}

        {/* Payment Details Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold">Payment Details</h2>
                    <p className="text-purple-100 text-xs">Complete payment information</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-purple-200"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaUser className="text-purple-600" />
                        Ambassador
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {selectedPayment.ambassadorId?.fullName?.charAt(0) || "A"}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">
                              {selectedPayment.ambassadorId?.fullName || "N/A"}
                            </p>
                            <p className="text-xs text-gray-600">{selectedPayment.ambassadorId?.email || "N/A"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <FaPhone className="text-gray-400 w-3 h-3" />
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{selectedPayment.ambassadorId?.mobileNumber || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-gray-400 w-3 h-3" />
                            <span className="text-gray-600">City:</span>
                            <span className="font-medium">{selectedPayment.ambassadorId?.city || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaTag className="text-gray-400 w-3 h-3" />
                            <span className="text-gray-600">Referral:</span>
                            <span className="font-medium">{selectedPayment.ambassadorId?.referralCode || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaIdCard className="text-gray-400 w-3 h-3" />
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-medium">{selectedPayment.ambassadorId?.gender || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedPayment.bankDetails && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <FaBuilding className="text-green-600" />
                          Bank Details
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-500 mb-1">Account Name</p>
                              <p className="font-semibold">{selectedPayment.bankDetails.accountName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Account Number</p>
                              <p className="font-semibold font-mono">{selectedPayment.bankDetails.accountNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Bank Name</p>
                              <p className="font-semibold">{selectedPayment.bankDetails.bankName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">IFSC Code</p>
                              <p className="font-semibold font-mono">{selectedPayment.bankDetails.ifscCode}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaListAlt className="text-blue-600" />
                        Plan Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan Name:</span>
                          <span className="font-bold">{selectedPayment.planId?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Validity:</span>
                          <span>{selectedPayment.planId?.validity || "N/A"} days</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaReceipt className="text-orange-600" />
                        Payment Breakdown
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Amount:</span>
                          <span className="font-medium">
                            ₹{(selectedPayment.baseAmount || selectedPayment.planId?.price || 0).toLocaleString()}
                          </span>
                        </div>
                        {selectedPayment.discount > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Discount ({selectedPayment.discount}%):</span>
                              <span className="text-green-600">
                                -₹{selectedPayment.discountAmount?.toLocaleString() || "0"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">After Discount:</span>
                              <span className="font-medium">
                                ₹{selectedPayment.discountedPrice?.toLocaleString() || selectedPayment.baseAmount?.toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST (18%):</span>
                          <span>₹{(selectedPayment.gstAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span className="font-bold">Total Amount:</span>
                            <span className="text-lg font-bold text-orange-600">
                              ₹{(selectedPayment.totalAmount || selectedPayment.planId?.price || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot Section in Modal */}
                {selectedPayment.paymentScreenshot && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaCamera className="text-green-600" />
                        Payment Receipt Screenshot
                      </h3>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex-shrink-0">
                            <div
                              className="w-32 h-32 border-2 border-dashed border-green-300 rounded-lg bg-green-50 flex items-center justify-center cursor-pointer hover:bg-green-100"
                              onClick={() => viewPaymentScreenshot(selectedPayment)}
                              title="Click to view full image"
                            >
                              <img
                                src={selectedPayment.paymentScreenshot}
                                alt="Payment Screenshot"
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/128x128/cccccc/ffffff?text=SS";
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-1">Payment Receipt Screenshot</p>
                            <p className="text-sm font-medium text-gray-900">
                              Uploaded on: {formatDate(selectedPayment.screenshotUploadedAt || selectedPayment.planPurchaseDate)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => viewPaymentScreenshot(selectedPayment)}
                                className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded text-xs"
                              >
                                <FaEye className="w-3 h-3" />
                                View Full Image
                              </button>
                              <button
                                onClick={() => window.open(selectedPayment.paymentScreenshot, '_blank')}
                                className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded text-xs"
                              >
                                <FaDownload className="w-3 h-3" />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Notes Section */}
                {(selectedPayment.note || selectedPayment.adminNotes) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <FaStickyNote className="text-blue-600" />
                        Admin Notes
                      </h3>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded">
                        {selectedPayment.adminNotes || selectedPayment.note}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold mb-2">Transaction Info</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex gap-2">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium text-purple-600">
                            {selectedPayment.transactionId?.substring(0, 20)}
                            {selectedPayment.transactionId?.length > 20 ? "..." : ""}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-600">Status:</span>
                          <StatusBadge status={selectedPayment.status} />
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-600">Method:</span>
                          <PaymentMethodBadge method={selectedPayment.paymentMethod} />
                        </div>
                        {selectedPayment.verifiedBy && (
                          <div className="flex gap-2">
                            <span className="text-gray-600">Verified By:</span>
                            <span className="font-medium text-green-600">{selectedPayment.verifiedBy}</span>
                          </div>
                        )}
                        {selectedPayment.verifiedAt && (
                          <div className="flex gap-2">
                            <span className="text-gray-600">Verified At:</span>
                            <span className="font-medium">{formatDate(selectedPayment.verifiedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 self-end">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => alert("Receipt download")}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                      >
                        Download Receipt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Screenshot Preview Modal */}
        {showScreenshotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl">
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FaCamera />
                      Payment Receipt Screenshot
                    </h2>
                    <p className="text-green-100 text-xs">Payment transaction proof</p>
                  </div>
                  <button
                    onClick={closeScreenshotModal}
                    className="text-white hover:text-green-200"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={screenshotUrl}
                    alt="Payment Receipt Screenshot"
                    className="w-full h-auto max-h-[70vh] object-contain"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/600x400/cccccc/ffffff?text=Screenshot+Not+Available";
                    }}
                  />
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <p className="text-xs text-gray-600">
                    This is the payment receipt screenshot uploaded by the ambassador
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={closeScreenshotModal}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => window.open(screenshotUrl, '_blank')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                    >
                      Open in New Tab
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = screenshotUrl;
                        link.download = `payment-screenshot-${Date.now()}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Status Modal */}
        {showEditModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-4">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <FaExchangeAlt className="text-green-600" />
                  Update Payment Status
                </h3>

                {userInfo.role === "subadmin" && (
                  <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded">
                    <p className="text-purple-800 text-xs flex items-center gap-1">
                      <FaUserShield size={12} />
                      Updating as <strong>{userInfo.name}</strong>
                    </p>
                    <p className="text-purple-600 text-[10px] mt-1">
                      SubAdmin ID: {userInfo.id} will be sent to backend
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 mb-1">Transaction</p>
                    <p className="font-medium text-sm flex items-center gap-1">
                      <FaReceipt className="text-gray-400" size={12} />
                      {selectedPayment.transactionId?.substring(0, 20)}
                      {selectedPayment.transactionId?.length > 20 ? "..." : ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Amount: ₹{selectedPayment.totalAmount?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Current Status: <StatusBadge status={selectedPayment.status} />
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      New Status *
                    </label>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Admin Notes <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      className="w-full p-2 border rounded text-sm"
                      rows="3"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes about this status update..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      These notes will be saved with the payment record
                    </p>
                  </div>

                  {/* Hidden field to show that subAdminId is being sent */}
                  <div className="bg-blue-50 p-2 rounded text-xs">
                    <p className="text-blue-700 flex items-center gap-1">
                      <FaInfoCircle size={12} />
                      SubAdmin ID: {userInfo.role === "subadmin" ? userInfo.id : "Not applicable (Admin)"}
                    </p>
                    <p className="text-blue-600 text-[10px] mt-1">
                      This ID will be sent to backend for tracking who updated the status
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={closeEditModal}
                      disabled={processing}
                      className="flex-1 p-2 border rounded hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={processing}
                      className="flex-1 p-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      {processing ? (
                        <span className="flex items-center justify-center gap-1">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </span>
                      ) : (
                        "Update Status"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && paymentToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg w-full max-w-sm">
              <div className="p-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaTrash className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold mb-2 text-center">Delete Payment</h3>

                {userInfo.role === "subadmin" && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <p className="text-yellow-800">
                      Deleting as <strong>{userInfo.name}</strong>
                    </p>
                  </div>
                )}

                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                  <p className="text-xs text-red-800">
                    <strong>Transaction:</strong> {paymentToDelete.transactionId?.substring(0, 15)}...
                  </p>
                  <p className="text-xs text-red-800 mt-1">
                    <strong>Amount:</strong> ₹{paymentToDelete.totalAmount?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={closeDeleteConfirm}
                    className="flex-1 p-2 border rounded hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePayment}
                    disabled={processing}
                    className="flex-1 p-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    {processing ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg w-full max-w-xs">
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCheck className="text-green-500" />
                </div>
                <h2 className="text-base font-semibold mb-2 text-green-600">Success!</h2>
                <p className="text-sm text-gray-600 mb-3">{successMessage}</p>

                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                  onClick={() => setSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}