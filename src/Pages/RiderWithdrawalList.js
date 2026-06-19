import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaMoneyBillWave,
  FaUser,
  FaCreditCard,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaFileExport,
  FaSearch,
  FaFilter,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaRupeeSign,
  FaUserShield,
  FaInfoCircle
} from 'react-icons/fa';

const RiderWithdrawalList = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const storedRole = sessionStorage.getItem("role");


  // Get subAdminId from sessionStorage
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

  // Get user info for display
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

  // Fetch withdrawals data
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('https://api.vegiffy.in/api/delivery-boy/allwithdrawals');

      if (response.data.success) {
        setWithdrawals(response.data.data);
        setFilteredWithdrawals(response.data.data);
      } else {
        setError('Failed to fetch withdrawal requests');
      }
    } catch (err) {
      setError('Error fetching withdrawal requests: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = withdrawals;

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(withdrawal => withdrawal.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(withdrawal =>
        withdrawal.deliveryBoyId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.accountDetails?.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.accountDetails?.accountHolderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.amount?.toString().includes(searchTerm) ||
        withdrawal.deliveryBoyId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.deliveryBoyId?.mobileNumber?.includes(searchTerm)
      );
    }

    setFilteredWithdrawals(filtered);
  }, [withdrawals, statusFilter, searchTerm]);

  // Handle status update with subAdminId
  const handleStatusUpdate = async () => {
    if (!selectedWithdrawal || !newStatus) return;

    try {
      setUpdateLoading(true);

      const subAdminId = getSubAdminId();
      const requestData = { status: newStatus };

      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      const response = await axios.put(
        `https://api.vegiffy.in/api/delivery-boy/withdrawalstatus/${selectedWithdrawal._id}`,
        requestData
      );

      if (response.data.success) {
        // Update local state with note and updatedBy
        setWithdrawals(prev => prev.map(w =>
          w._id === selectedWithdrawal._id
            ? {
              ...w,
              status: newStatus,
              note: response.data.data?.note || w.note,
              updatedBy: response.data.data?.updatedBy || w.updatedBy
            }
            : w
        ));
        setShowStatusModal(false);
        setSelectedWithdrawal(null);
        setNewStatus('');

        // Show success message
        alert(`Status updated to ${newStatus} successfully!`);
      }
    } catch (err) {
      setError('Error updating status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (withdrawal) => {
    setSelectedDetails(withdrawal);
    setShowDetailsModal(true);
  };

  // Handle delete
  const handleDelete = async (withdrawalId) => {
    if (window.confirm('Are you sure you want to delete this withdrawal request?')) {
      try {
        // Add your delete API call here when available
        // await axios.delete(`https://api.vegiffy.in/api/delivery-boy/withdrawal/${withdrawalId}`);

        // For now, just update local state
        setWithdrawals(prev => prev.filter(w => w._id !== withdrawalId));
      } catch (err) {
        setError('Error deleting withdrawal: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Rider Name', 'Rider Email', 'Rider Mobile', 'Amount', 'Bank Name', 'Account Number', 'IFSC Code', 'Account Holder', 'Status', 'Note', 'Updated By', 'Date Requested'];

    const csvData = filteredWithdrawals.map(withdrawal => [
      withdrawal.deliveryBoyId?.fullName || 'N/A',
      withdrawal.deliveryBoyId?.email || 'N/A',
      withdrawal.deliveryBoyId?.mobileNumber || 'N/A',
      `₹${withdrawal.amount}`,
      withdrawal.accountDetails?.bankName || 'N/A',
      withdrawal.accountDetails?.accountNumber || 'N/A',
      withdrawal.accountDetails?.ifscCode || 'N/A',
      withdrawal.accountDetails?.accountHolderName || 'N/A',
      withdrawal.status,
      withdrawal.note || 'N/A',
      withdrawal.updatedBy || 'N/A',
      formatDate(withdrawal.dateRequested)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `withdrawal-requests-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open status modal
  const openStatusModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setNewStatus(withdrawal.status);
    setShowStatusModal(true);
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return {
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: FaCheckCircle,
          color: 'text-green-500'
        };
      case 'Rejected':
        return {
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: FaTimesCircle,
          color: 'text-red-500'
        };
      case 'Pending':
        return {
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: FaClock,
          color: 'text-yellow-500'
        };
      case 'Hold':
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: FaExclamationTriangle,
          color: 'text-gray-500'
        };
      default:
        return {
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: FaClock,
          color: 'text-yellow-500'
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const { className, icon: Icon, color } = getStatusStyle(status);

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
        <Icon className={`text-xs ${color}`} />
        {status}
      </span>
    );
  };

  // Get status counts for filter badges
  const getStatusCounts = () => {
    const counts = {
      All: withdrawals.length,
      Pending: withdrawals.filter(w => w.status === 'Pending').length,
      Approved: withdrawals.filter(w => w.status === 'Approved').length,
      Rejected: withdrawals.filter(w => w.status === 'Rejected').length,
      Hold: withdrawals.filter(w => w.status === 'Hold').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Get current user info
  const userInfo = getUserInfo();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading withdrawal requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <FaMoneyBillWave className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Rider Withdrawal Management
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Manage and process withdrawal requests from delivery riders
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* User Role Display */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${userInfo.role === "subadmin"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                  }`}>
                  <FaUserShield className="inline mr-1" size={14} />
                  {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
                </div>

                <button
                  onClick={exportToCSV}
                  disabled={filteredWithdrawals.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaFileExport /> Export CSV
                </button>

                <button
                  onClick={fetchWithdrawals}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
                >
                  <FaSync className={`${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Sub-Admin Note */}
            {userInfo.role === "subadmin" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <FaInfoCircle />
                  <strong>Note:</strong> All status updates will be recorded under your name: <strong>{userInfo.name}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">
                <FaTimesCircle className="w-5 h-5" />
              </div>
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={fetchWithdrawals}
              className="text-red-800 hover:text-red-900 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{withdrawals.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaMoneyBillWave className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{statusCounts.Pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{statusCounts.Approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{statusCounts.Rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Hold</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{statusCounts.Hold}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <FaExclamationTriangle className="text-gray-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Requests
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by email, name, mobile, bank, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="All">All Status ({statusCounts.All})</option>
                <option value="Pending">Pending ({statusCounts.Pending})</option>
                <option value="Approved">Approved ({statusCounts.Approved})</option>
                <option value="Rejected">Rejected ({statusCounts.Rejected})</option>
                <option value="Hold">Hold ({statusCounts.Hold})</option>
              </select>
            </div>
          </div>

          {/* Status Filter Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Pending', 'Approved', 'Rejected', 'Hold'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${statusFilter === status
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
              >
                {status === 'All' ? (
                  <>
                    <FaFilter className="mr-1 text-xs" />
                    {status} ({statusCounts[status]})
                  </>
                ) : (
                  <>
                    {(() => {
                      const Icon = getStatusStyle(status).icon;
                      return <Icon className={`mr-1 text-xs ${getStatusStyle(status).color}`} />;
                    })()}
                    {status} ({statusCounts[status]})
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredWithdrawals.length} of {withdrawals.length} withdrawal requests
            {(statusFilter !== 'All' || searchTerm) && " (filtered)"}
          </p>
          {(statusFilter !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setSearchTerm('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <FaSync className="text-xs" /> Clear filters
            </button>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <FaMoneyBillWave className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests found</h3>
              <p className="text-gray-500 mb-4">
                {withdrawals.length === 0
                  ? 'No withdrawal requests available'
                  : 'No requests match your current filters'}
              </p>
              {(statusFilter !== 'All' || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rider Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount & Bank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-indigo-50 transition-colors duration-200">
                      {/* Rider Details Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <FaUser className="text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {withdrawal.deliveryBoyId?.fullName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {withdrawal.deliveryBoyId?.email || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Mobile: {withdrawal.deliveryBoyId?.mobileNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                          {withdrawal.note && (
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded italic">
                              <FaInfoCircle className="inline mr-1" />
                              {withdrawal.note}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Amount & Bank Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FaRupeeSign className="text-green-600" />
                            </div>
                            <div>
                              <div className="text-xl font-bold text-gray-900">
                                ₹{withdrawal.amount?.toLocaleString() || '0'}
                              </div>
                              <div className="text-xs text-gray-500">Requested Amount</div>
                            </div>
                          </div>

                          <div className="border-t pt-3">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FaCreditCard className="text-blue-600" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {withdrawal.accountDetails?.bankName || 'N/A'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1 pl-11">
                              <div className="flex items-center gap-1">
                                <FaCreditCard className="text-xs" />
                                A/C: {withdrawal.accountDetails?.accountNumber || 'N/A'}
                              </div>
                              <div>IFSC: {withdrawal.accountDetails?.ifscCode || 'N/A'}</div>
                              <div>Holder: {withdrawal.accountDetails?.accountHolderName || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          <div>
                            <StatusBadge status={withdrawal.status} />
                          </div>
                          {withdrawal.updatedBy && (
                            <div className="text-xs text-gray-500">
                              <div className="font-medium">Updated By:</div>
                              <div className="text-indigo-600">{withdrawal.updatedBy}</div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Timeline Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCalendarAlt className="text-xs" />
                            <span>{formatDate(withdrawal.dateRequested)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Request ID: {withdrawal._id?.slice(-8)}
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(withdrawal)}
                            className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow"
                            title="View Details"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          <button
                            onClick={() => openStatusModal(withdrawal)}
                            className="p-2 bg-gradient-to-r from-green-50 to-green-100 text-green-600 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200 shadow-sm hover:shadow"
                            title="Update Status"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          {storedRole === 'admin' && (
                            <button
                              onClick={() => handleDelete(withdrawal._id)}
                              className="p-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 border border-red-200 shadow-sm hover:shadow"
                              title="Delete Request"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal - Fixed with proper scrolling */}
      {showStatusModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaEdit className="text-green-600" />
                </div>
                Update Withdrawal Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* User Info Display - Fixed */}
            {userInfo.role === "subadmin" && (
              <div className="mx-6 mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex-shrink-0">
                <p className="text-sm text-purple-800">
                  You are updating status as <strong>{userInfo.name}</strong> (Sub-Admin)
                </p>
              </div>
            )}

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Request Summary Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200">
                  <div className="space-y-4">
                    {/* Rider Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <FaUser className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Rider</div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedWithdrawal?.deliveryBoyId?.fullName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedWithdrawal?.deliveryBoyId?.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">Amount</div>
                        <div className="text-2xl font-bold text-green-700">
                          ₹{selectedWithdrawal?.amount?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Bank Details Summary */}
                    <div className="border-t border-indigo-200 pt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Bank Details</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Bank:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedWithdrawal?.accountDetails?.bankName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">A/C:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedWithdrawal?.accountDetails?.accountNumber?.slice(-4) || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">IFSC:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedWithdrawal?.accountDetails?.ifscCode || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Holder:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedWithdrawal?.accountDetails?.accountHolderName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Current Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-indigo-200">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Current Status</div>
                        <div className="mt-2">
                          <StatusBadge status={selectedWithdrawal?.status} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Requested: {formatDate(selectedWithdrawal?.dateRequested)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select New Status *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewStatus('Approved')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${newStatus === 'Approved'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 hover:border-green-500 hover:bg-green-50'
                        }`}
                    >
                      <div className="flex flex-col items-center">
                        <FaCheckCircle className={`text-2xl mb-2 ${newStatus === 'Approved' ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="font-semibold">Approve</span>
                        <span className="text-xs text-gray-500 mt-1">Complete the payment</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewStatus('Rejected')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${newStatus === 'Rejected'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 hover:border-red-500 hover:bg-red-50'
                        }`}
                    >
                      <div className="flex flex-col items-center">
                        <FaTimesCircle className={`text-2xl mb-2 ${newStatus === 'Rejected' ? 'text-red-600' : 'text-gray-400'}`} />
                        <span className="font-semibold">Reject</span>
                        <span className="text-xs text-gray-500 mt-1">Cancel the request</span>
                      </div>
                    </button>
                  </div>

                  {/* Status Info */}
                  {newStatus && (
                    <div className={`mt-4 p-3 rounded-lg ${newStatus === 'Approved'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                      }`}>
                      <p className={`text-sm font-medium ${newStatus === 'Approved' ? 'text-green-800' : 'text-red-800'
                        }`}>
                        {newStatus === 'Approved'
                          ? '✅ The amount will be deducted from rider\'s wallet balance and marked as paid.'
                          : '❌ This will cancel the withdrawal request and notify the rider.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium disabled:from-green-300 disabled:to-emerald-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={!newStatus || updateLoading || newStatus === selectedWithdrawal?.status}
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    {newStatus === 'Approved' ? <FaCheckCircle /> : <FaTimesCircle />}
                    Update to {newStatus}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {showDetailsModal && selectedDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <FaMoneyBillWave className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Withdrawal Request Details</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={selectedDetails.status} />
                      <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
                        ID: {selectedDetails._id?.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white text-2xl transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column - Rider & Request Info */}
                <div className="space-y-6">
                  {/* Rider Information Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaUser className="text-blue-600" />
                      </div>
                      Rider Information
                    </h3>
                    <div className="space-y-3">
                      <DetailItem label="Full Name" value={selectedDetails.deliveryBoyId?.fullName || 'N/A'} />
                      <DetailItem label="Email" value={selectedDetails.deliveryBoyId?.email || 'N/A'} />
                      <DetailItem label="Mobile Number" value={selectedDetails.deliveryBoyId?.mobileNumber || 'N/A'} />
                      <DetailItem label="Rider ID" value={selectedDetails.deliveryBoyId?._id?.slice(-8) || 'N/A'} />
                    </div>
                  </div>

                  {/* Request Details Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaMoneyBillWave className="text-green-600" />
                      </div>
                      Request Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700">Requested Amount</div>
                          <div className="text-3xl font-bold text-gray-900 mt-1">
                            ₹{selectedDetails.amount?.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">Status</div>
                          <div className="mt-2">
                            <StatusBadge status={selectedDetails.status} />
                          </div>
                        </div>
                      </div>
                      {selectedDetails.note && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-1">Note</div>
                          <div className="text-sm text-blue-800">{selectedDetails.note}</div>
                        </div>
                      )}
                      {selectedDetails.updatedBy && (
                        <DetailItem label="Last Updated By" value={selectedDetails.updatedBy} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Bank & Timeline */}
                <div className="space-y-6">
                  {/* Bank Details Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FaCreditCard className="text-purple-600" />
                      </div>
                      Bank Account Details
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Bank Name</div>
                          <div className="font-medium text-gray-900">{selectedDetails.accountDetails?.bankName || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Account Number</div>
                          <div className="font-medium text-gray-900">{selectedDetails.accountDetails?.accountNumber || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">IFSC Code</div>
                          <div className="font-medium text-gray-900">{selectedDetails.accountDetails?.ifscCode || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Account Holder</div>
                          <div className="font-medium text-gray-900">{selectedDetails.accountDetails?.accountHolderName || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FaCalendarAlt className="text-gray-600" />
                      </div>
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      <DetailItem
                        label="Date Requested"
                        value={formatDate(selectedDetails.dateRequested)}
                      />
                      {selectedDetails.dateApproved && (
                        <DetailItem
                          label="Date Approved/Rejected"
                          value={formatDate(selectedDetails.dateApproved)}
                        />
                      )}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-2">Processing Notes:</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {selectedDetails.note ? (
                            <div className="p-2 bg-blue-50 rounded">{selectedDetails.note}</div>
                          ) : (
                            <div className="text-gray-500 italic">No additional notes</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Request ID: <span className="font-medium text-gray-900">{selectedDetails._id}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedWithdrawal(selectedDetails);
                      setShowDetailsModal(false);
                      setShowStatusModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-800 font-semibold">{value || "-"}</span>
  </div>
);

export default RiderWithdrawalList;