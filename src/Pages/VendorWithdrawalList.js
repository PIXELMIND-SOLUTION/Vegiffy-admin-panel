import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiX, FiDownload, FiFilter, FiEye, FiUser, FiCheckCircle, FiXCircle, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VendorWithdrawalList = () => {
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
  const [showFilters, setShowFilters] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedViewWithdrawal, setSelectedViewWithdrawal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  // Fetch withdrawals data
  const fetchWithdrawals = async (showToast = false) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('https://api.vegiffyy.com/api/allwithdrawrequest');
      
      if (response.data.success) {
        setWithdrawals(response.data.data);
        setFilteredWithdrawals(response.data.data);
        if (showToast) {
          toast.success('Withdrawal requests refreshed successfully!', {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        const errorMsg = response.data.message || 'Failed to fetch withdrawal requests';
        setError(errorMsg);
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      toast.error('Error fetching withdrawal requests: ' + errorMsg, {
        position: "top-right",
        autoClose: 5000,
      });
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
        withdrawal.restaurantId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.restaurantId?.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.accountDetails?.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.accountDetails?.accountHolder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.amount?.toString().includes(searchTerm) ||
        withdrawal.accountDetails?.accountNumber?.includes(searchTerm) ||
        withdrawal.accountDetails?.ifsc?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWithdrawals(filtered);
  }, [withdrawals, statusFilter, searchTerm]);

  // Handle status update with subAdminId
  const handleStatusUpdate = async () => {
    if (!selectedWithdrawal || !newStatus) return;

    // Check if status is same as current
    if (newStatus === selectedWithdrawal.status) {
      toast.warning('Status is already set to ' + newStatus, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setUpdateLoading(true);
      const subAdminId = getSubAdminId();
      const requestData = { status: newStatus };
      
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      const response = await axios.put(
        `https://api.vegiffyy.com/api/withdrawalstatus/${selectedWithdrawal._id}`,
        requestData
      );

      if (response.data.success) {
        // Update local state
        setWithdrawals(prev => prev.map(w => 
          w._id === selectedWithdrawal._id 
            ? { 
                ...w, 
                status: newStatus,
                note: response.data.data?.note || w.note,
                updatedAt: new Date().toISOString()
              }
            : w
        ));
        setShowStatusModal(false);
        setSelectedWithdrawal(null);
        setNewStatus('');
        
        // Show success toast
        toast.success(response.data.message || `Withdrawal request ${newStatus} successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(response.data.message || 'Failed to update status', {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      
      // Handle "already processed" error specially
      if (errorMsg.includes('already been processed')) {
        toast.warning('This request has already been processed. No further updates allowed.', {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error('Error updating status: ' + errorMsg, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle delete with subAdminId
  const handleDelete = async (withdrawalId) => {
    // Show confirmation dialog
    const confirmResult = await new Promise((resolve) => {
      if (window.confirm('Are you sure you want to delete this withdrawal request? This action cannot be undone.')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    if (!confirmResult) return;

    try {
      setDeleteLoading(true);
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      // Note: Delete API endpoint might be different, adjust as needed
      const response = await axios.delete(`https://api.vegiffyy.com/api/withdrawal/${withdrawalId}`, config);
      
      if (response.data.success) {
        // Update local state
        setWithdrawals(prev => prev.filter(w => w._id !== withdrawalId));
        
        // Show success toast
        toast.success(response.data.message || 'Withdrawal request deleted successfully! ✅', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(response.data.message || 'Failed to delete withdrawal request', {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error('Error deleting withdrawal: ' + errorMsg, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const headers = ['Vendor Name', 'Vendor Email', 'Amount', 'Bank Name', 'Account Number', 'IFSC Code', 'Account Holder', 'Status', 'Processed By', 'Date Requested', 'Last Updated'];
      
      const csvData = filteredWithdrawals.map(withdrawal => [
        withdrawal.restaurantId?.restaurantName || 'N/A',
        withdrawal.restaurantId?.email || 'N/A',
        `₹${withdrawal.amount}`,
        withdrawal.accountDetails?.bankName || 'N/A',
        withdrawal.accountDetails?.accountNumber || 'N/A',
        withdrawal.accountDetails?.ifsc || 'N/A',
        withdrawal.accountDetails?.accountHolder || 'N/A',
        withdrawal.status,
        withdrawal.note || 'Admin',
        formatDate(withdrawal.createdAt),
        formatDate(withdrawal.updatedAt)
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `vendor-withdrawal-requests-${new Date().toISOString().split('T')[0]}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export completed successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Error exporting data: ' + err.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Open status modal
  const openStatusModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setNewStatus(withdrawal.status);
    setShowStatusModal(true);
  };

  // Open view modal
  const openViewModal = (withdrawal) => {
    setSelectedViewWithdrawal(withdrawal);
    setViewModalOpen(true);
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status counts for filter badges
  const getStatusCounts = () => {
    const counts = {
      All: withdrawals.length,
      pending: withdrawals.filter(w => w.status === 'pending').length,
      approved: withdrawals.filter(w => w.status === 'approved').length,
      rejected: withdrawals.filter(w => w.status === 'rejected').length,
      completed: withdrawals.filter(w => w.status === 'completed').length,
    };
    return counts;
  };

  // Calculate statistics
  const getStats = () => {
    const pendingAmount = withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + (w.amount || 0), 0);
    
    const approvedAmount = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + (w.amount || 0), 0);
    
    const rejectedAmount = withdrawals
      .filter(w => w.status === 'rejected')
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    return {
      pendingAmount,
      approvedAmount,
      rejectedAmount,
      totalRequests: withdrawals.length
    };
  };

  const statusCounts = getStatusCounts();
  const stats = getStats();
  const userInfo = getUserInfo();

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('All');
    setSearchTerm('');
    toast.info('Filters cleared', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Check if any filter is active
  const isAnyFilterActive = statusFilter !== 'All' || searchTerm;

  // Handle refresh with toast
  const handleRefresh = () => {
    fetchWithdrawals(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Withdrawal Management</h1>
                <p className="text-gray-600">Manage and track all withdrawal requests from restaurant vendors</p>
              </div>
            </div>
            
            {/* User Role Display */}
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                userInfo.role === "subadmin" 
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}>
                <FiUser className="inline mr-1" size={14} />
                {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
                  <p className="text-sm text-gray-600">Total Requests</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">₹{stats.pendingAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sub-Admin Note */}
          {userInfo.role === "subadmin" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> All withdrawals will be processed under your name: <strong>{userInfo.name}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            {/* Search Input and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by vendor, bank, amount, IFSC..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showFilters || isAnyFilterActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FiFilter size={16} />
                  Filters
                  {isAnyFilterActive && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isAnyFilterActive && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={exportToCSV}
                disabled={filteredWithdrawals.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload size={18} /> Export CSV
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Status ({statusCounts.All})</option>
                    <option value="pending">Pending ({statusCounts.pending})</option>
                    <option value="approved">Approved ({statusCounts.approved})</option>
                    <option value="rejected">Rejected ({statusCounts.rejected})</option>
                    <option value="completed">Completed ({statusCounts.completed})</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {isAnyFilterActive && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusFilter !== "All" && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter("All")}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiX size={12} />
                        </button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        Search: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <FiX size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Count and Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing {filteredWithdrawals.length} of {withdrawals.length} withdrawal requests
              {isAnyFilterActive && " (filtered)"}
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-2 text-xs">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Pending: {statusCounts.pending}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Approved: {statusCounts.approved}
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                Rejected: {statusCounts.rejected}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading withdrawal requests...</p>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <FiCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests found</h3>
              <p className="text-gray-500 mb-4">
                {isAnyFilterActive ? 'No withdrawal requests match your current filters' : 'No withdrawal requests available'}
              </p>
              {isAnyFilterActive && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Timeline
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal._id} className="hover:bg-blue-50 transition-colors">
                        {/* Vendor Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {withdrawal.restaurantId?.restaurantName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {withdrawal.restaurantId?.email || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Wallet: ₹{withdrawal.restaurantId?.walletBalance?.toLocaleString() || '0'}
                            </div>
                            {withdrawal.note && (
                              <div className="text-xs text-blue-600 italic">
                                {withdrawal.note}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <div className="text-lg font-semibold text-gray-900">
                            ₹{withdrawal.amount?.toLocaleString() || '0'}
                          </div>
                        </td>

                        {/* Bank Details */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {withdrawal.accountDetails?.bankName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              A/C: {withdrawal.accountDetails?.accountNumber || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              IFSC: {withdrawal.accountDetails?.ifsc || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {withdrawal.accountDetails?.accountHolder || 'N/A'}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(withdrawal.status)}`}>
                              {formatStatus(withdrawal.status)}
                            </span>
                            <div className="text-xs text-gray-500">
                              <div>Requested: {formatDate(withdrawal.createdAt)}</div>
                              <div>Updated: {formatDate(withdrawal.updatedAt)}</div>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openViewModal(withdrawal)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye size={18} />
                            </button>
                            <button
                              onClick={() => openStatusModal(withdrawal)}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Update Status"
                              disabled={deleteLoading || updateLoading}
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(withdrawal._id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Request"
                              disabled={deleteLoading || updateLoading}
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiEdit className="text-blue-600" />
                  Update Withdrawal Status
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* User Info Display */}
              {userInfo.role === "subadmin" && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    You are processing as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Vendor:</span>{' '}
                    <span className="text-gray-900">{selectedWithdrawal.restaurantId?.restaurantName}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Amount:</span>{' '}
                    <span className="text-gray-900 font-bold">₹{selectedWithdrawal.amount}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Current Status:</span>{' '}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(selectedWithdrawal.status)}`}>
                      {formatStatus(selectedWithdrawal.status)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Rejected withdrawals will be refunded to vendor's wallet
                  </p>
                </div>

                {userInfo.role === "subadmin" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      This action will be recorded under your name: <strong>{userInfo.name}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updateLoading || !newStatus || newStatus === selectedWithdrawal.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && selectedViewWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">Withdrawal Request Details</h3>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard 
                    title="Amount" 
                    value={`₹${selectedViewWithdrawal.amount}`}
                    icon="💰"
                    color="blue"
                  />
                  <StatCard 
                    title="Status" 
                    value={formatStatus(selectedViewWithdrawal.status)}
                    icon="📊"
                    color={selectedViewWithdrawal.status === 'approved' ? 'green' : 
                           selectedViewWithdrawal.status === 'rejected' ? 'red' : 'yellow'}
                  />
                  <StatCard 
                    title="Vendor Wallet" 
                    value={`₹${selectedViewWithdrawal.restaurantId?.walletBalance?.toLocaleString() || '0'}`}
                    icon="💳"
                    color="purple"
                  />
                  <StatCard 
                    title="Request ID" 
                    value={selectedViewWithdrawal._id.slice(-8)}
                    icon="🆔"
                    color="indigo"
                  />
                </div>

                {/* Vendor Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Vendor Information</h4>
                    <div className="space-y-2">
                      <DetailItem label="Restaurant Name" value={selectedViewWithdrawal.restaurantId?.restaurantName} />
                      <DetailItem label="Email" value={selectedViewWithdrawal.restaurantId?.email} />
                      <DetailItem label="Mobile" value={selectedViewWithdrawal.restaurantId?.mobile} />
                      <DetailItem label="Location" value={selectedViewWithdrawal.restaurantId?.locationName} />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Bank Details</h4>
                    <div className="space-y-2">
                      <DetailItem label="Bank Name" value={selectedViewWithdrawal.accountDetails?.bankName} />
                      <DetailItem label="Account Holder" value={selectedViewWithdrawal.accountDetails?.accountHolder} />
                      <DetailItem label="Account Number" value={selectedViewWithdrawal.accountDetails?.accountNumber} />
                      <DetailItem label="IFSC Code" value={selectedViewWithdrawal.accountDetails?.ifsc} />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <DetailItem label="Requested At" value={formatDate(selectedViewWithdrawal.createdAt)} />
                    <DetailItem label="Last Updated" value={formatDate(selectedViewWithdrawal.updatedAt)} />
                    {selectedViewWithdrawal.note && (
                      <DetailItem 
                        label="Processed By" 
                        value={selectedViewWithdrawal.note} 
                        className="text-blue-600"
                      />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedViewWithdrawal.status === 'pending' && (
                  <div className="border-t pt-6">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setViewModalOpen(false);
                          openStatusModal(selectedViewWithdrawal);
                        }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiEdit size={18} />
                        Update Status
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
};

// Helper component for detail items
const DetailItem = ({ label, value, className = "" }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
    <span className="font-medium text-gray-600 text-sm">{label}</span>
    <span className={`text-gray-900 font-medium text-sm ${className}`}>
      {value || "-"}
    </span>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    red: "bg-red-50 border-red-200 text-red-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  };

  return (
    <div className={`border rounded-xl p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-sm opacity-80">{title}</div>
        </div>
        <div className="text-xl">{icon}</div>
      </div>
    </div>
  );
};

export default VendorWithdrawalList;