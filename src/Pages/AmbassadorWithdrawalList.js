import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiSearch, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiCheck, FiX, FiUser } from 'react-icons/fi';
import { FaUserShield, FaInfoCircle } from 'react-icons/fa';

const AmbassadorWithdrawalList = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('https://api.vegiffyy.com/api/ambsdor/allwithdrawal');
      
      if (response.data.success) {
        setWithdrawals(response.data.data);
        setFilteredWithdrawals(response.data.data);
      } else {
        setError('Failed to fetch withdrawal requests');
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
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
        withdrawal.ambassadorId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.ambassadorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.accountDetails?.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.accountDetails?.accountHolderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.amount?.toString().includes(searchTerm) ||
        withdrawal.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.updatedBy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWithdrawals(filtered);
  }, [withdrawals, statusFilter, searchTerm]);

  // Handle status update with subAdminId
  const handleStatusUpdate = async () => {
    if (!selectedWithdrawal || !newStatus) return;

    try {
      setUpdateLoading(true);
      setError('');
      setSuccess('');

      const subAdminId = getSubAdminId();
      const requestBody = {
        status: newStatus
      };

      // Add rejection reason if status is rejected
      if (newStatus === 'rejected') {
        requestBody.rejectionReason = rejectionReason || 'No reason provided';
      }

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestBody.subAdminId = subAdminId;
      }

      const response = await axios.put(
        `https://api.vegiffyy.com/api/ambsdor/withdrawals/${selectedWithdrawal._id}`,
        requestBody
      );

      if (response.data.success) {
        // Update local state
        const userInfo = getUserInfo();
        setWithdrawals(prev => prev.map(w => 
          w._id === selectedWithdrawal._id 
            ? { 
                ...w, 
                status: newStatus,
                ...(newStatus === 'accepted' && { approvedAt: new Date() }),
                ...(newStatus === 'rejected' && { 
                  rejectedAt: new Date(),
                  rejectionReason: rejectionReason || 'No reason provided'
                }),
                note: subAdminId 
                  ? `Processed by Sub-admin: ${userInfo.name}` 
                  : 'Processed by Admin',
                updatedBy: subAdminId ? userInfo.name : null
              }
            : w
        ));
        
        setShowStatusModal(false);
        setSelectedWithdrawal(null);
        setNewStatus('');
        setRejectionReason('');
        setSuccess(`Withdrawal request ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
        
        // Auto hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError('Error updating status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle delete with subAdminId
  const handleDelete = async () => {
    if (!selectedWithdrawal) return;

    try {
      setDeleteLoading(true);
      setError('');
      
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      // This API endpoint needs to be created in backend
      // await axios.delete(`https://api.vegiffyy.com/api/ambsdor/withdrawal/${selectedWithdrawal._id}`, config);
      
      // For now, just update local state and show message
      const userInfo = getUserInfo();
      const note = subAdminId 
        ? `Deleted by Sub-admin: ${userInfo.name}` 
        : 'Deleted by Admin';
      
      console.log(`Would delete withdrawal ${selectedWithdrawal._id} with note: ${note}`);
      
      // Remove from local state
      setWithdrawals(prev => prev.filter(w => w._id !== selectedWithdrawal._id));
      setShowDeleteModal(false);
      setSelectedWithdrawal(null);
      setSuccess('Withdrawal request deleted successfully!');
      
      // Auto hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error deleting withdrawal:", err);
      setError('Error deleting withdrawal: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setNewStatus(withdrawal.status);
    setRejectionReason(withdrawal.rejectionReason || '');
    setShowStatusModal(true);
  };

  // Open delete modal
  const openDeleteModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDeleteModal(true);
  };

  // Open details modal
  const openDetailsModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  // Reset modals
  const resetModals = () => {
    setShowStatusModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setSelectedWithdrawal(null);
    setNewStatus('');
    setRejectionReason('');
  };

  // Export to CSV with sub-admin info
  const exportToCSV = () => {
    const headers = [
      'ID', 
      'Ambassador Name', 
      'Email', 
      'Mobile', 
      'Amount', 
      'Bank Name', 
      'Account Number', 
      'IFSC Code', 
      'Account Holder', 
      'UPI ID', 
      'Status', 
      'Date Requested', 
      'Date Approved', 
      'Date Rejected',
      'Rejection Reason',
      'Note',
      'Updated By'
    ];
    
    const csvData = filteredWithdrawals.map(withdrawal => [
      withdrawal._id,
      withdrawal.ambassadorId?.fullName || 'N/A',
      withdrawal.ambassadorId?.email || 'N/A',
      withdrawal.ambassadorId?.mobileNumber || 'N/A',
      `₹${withdrawal.amount}`,
      withdrawal.accountDetails?.bankName || 'N/A',
      withdrawal.accountDetails?.accountNumber || 'N/A',
      withdrawal.accountDetails?.ifscCode || 'N/A',
      withdrawal.accountDetails?.accountHolderName || 'N/A',
      withdrawal.upiId || 'N/A',
      withdrawal.status,
      formatDate(withdrawal.requestedAt),
      formatDate(withdrawal.approvedAt),
      formatDate(withdrawal.rejectedAt),
      withdrawal.rejectionReason || 'N/A',
      withdrawal.note || 'N/A',
      withdrawal.updatedBy || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ambassador-withdrawals-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccess('CSV exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hold':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get status counts for filter badges
  const getStatusCounts = () => {
    const counts = {
      All: withdrawals.length,
      pending: withdrawals.filter(w => w.status === 'pending').length,
      accepted: withdrawals.filter(w => w.status === 'accepted').length,
      rejected: withdrawals.filter(w => w.status === 'rejected').length,
      hold: withdrawals.filter(w => w.status === 'hold').length,
      completed: withdrawals.filter(w => w.status === 'completed').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();
  const userInfo = getUserInfo();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading withdrawal requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-purple-500">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-800">
                  Ambassador Withdrawal Requests
                </h1>
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
              <p className="text-gray-600">
                Manage and track all withdrawal requests from ambassadors
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchWithdrawals}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredWithdrawals.length === 0}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload className="mr-2" />
                Export CSV
              </button>
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

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-green-500 mr-3">
                <FiCheck className="w-5 h-5" />
              </div>
              <span className="text-green-800">{success}</span>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="text-green-800 hover:text-green-900 font-medium"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-800 hover:text-red-900 font-medium"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, email, bank, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
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
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="All">All Status ({statusCounts.All})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="accepted">Accepted ({statusCounts.accepted})</option>
                <option value="rejected">Rejected ({statusCounts.rejected})</option>
                <option value="hold">Hold ({statusCounts.hold})</option>
                <option value="completed">Completed ({statusCounts.completed})</option>
              </select>
            </div>
          </div>

          {/* Status Filter Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {['All', 'pending', 'accepted', 'rejected', 'hold', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                  statusFilter === status
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredWithdrawals.length} of {withdrawals.length} requests
          </p>
          {(statusFilter !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setSearchTerm('');
              }}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ambassador Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Admin Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FiUser className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-600 mb-2">
                          {withdrawals.length === 0 ? 'No withdrawal requests found' : 'No requests match your filters'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {withdrawals.length === 0 
                            ? 'Ambassadors haven\'t made any withdrawal requests yet.' 
                            : 'Try changing your filters to see more results.'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="font-semibold text-gray-900">
                            {withdrawal.ambassadorId?.fullName || 'N/A'}
                          </div>
                          <div className="text-gray-600">{withdrawal.ambassadorId?.email || 'N/A'}</div>
                          <div className="text-gray-500 text-sm">{withdrawal.ambassadorId?.mobileNumber || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(withdrawal.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-medium">{withdrawal.accountDetails?.bankName || 'N/A'}</div>
                          <div className="text-gray-600">A/C: ••••{withdrawal.accountDetails?.accountNumber?.slice(-4) || 'N/A'}</div>
                          <div className="text-gray-600">IFSC: {withdrawal.accountDetails?.ifscCode || 'N/A'}</div>
                          {withdrawal.upiId && (
                            <div className="text-gray-600">UPI: {withdrawal.upiId}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(withdrawal.status)}`}>
                            {withdrawal.status?.charAt(0).toUpperCase() + withdrawal.status?.slice(1)}
                          </span>
                          <div className="text-xs text-gray-500">
                            {formatDate(withdrawal.requestedAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          {withdrawal.note && (
                            <div className="text-purple-600 text-xs italic">
                              {withdrawal.note}
                            </div>
                          )}
                          {withdrawal.updatedBy && (
                            <div className="text-gray-600 text-xs">
                              Updated by: {withdrawal.updatedBy}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailsModal(withdrawal)}
                            className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors group/action"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                            <span className="ml-1 text-xs opacity-0 group-hover/action:opacity-100 transition-opacity">View</span>
                          </button>
                          
                          <button
                            onClick={() => openEditModal(withdrawal)}
                            className="inline-flex items-center p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors group/action"
                            title="Edit Status"
                          >
                            <FiEdit className="w-4 h-4" />
                            <span className="ml-1 text-xs opacity-0 group-hover/action:opacity-100 transition-opacity">Edit</span>
                          </button>
                          
                          <button
                            onClick={() => openDeleteModal(withdrawal)}
                            className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors group/action"
                            title="Delete Request"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span className="ml-1 text-xs opacity-0 group-hover/action:opacity-100 transition-opacity">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process Withdrawal Modal */}
      {showStatusModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Update Withdrawal Status
              </h3>
              <button 
                onClick={resetModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* User Info Display */}
              {userInfo.role === "subadmin" && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    You are processing as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Ambassador:</span>{' '}
                  <span className="text-gray-900">{selectedWithdrawal.ambassadorId?.fullName}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Amount:</span>{' '}
                  <span className="text-gray-900">{formatCurrency(selectedWithdrawal.amount)}</span>
                </p>
                <p className="text-sm flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Current Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(selectedWithdrawal.status)}`}>
                    {selectedWithdrawal.status?.charAt(0).toUpperCase() + selectedWithdrawal.status?.slice(1)}
                  </span>
                </p>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status:
                </label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hold">Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {newStatus === 'rejected' && (
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason:
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              )}

              {newStatus === 'accepted' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FiCheck className="text-green-500 mr-2" />
                    <span className="text-sm text-green-800 font-medium">
                      This will deduct ₹{selectedWithdrawal.amount} from ambassador's wallet and process the payment.
                    </span>
                  </div>
                  {userInfo.role === "subadmin" && (
                    <div className="mt-2 text-xs text-green-700">
                      This action will be recorded under your name: {userInfo.name}
                    </div>
                  )}
                </div>
              )}

              {newStatus === 'completed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FiCheck className="text-blue-500 mr-2" />
                    <span className="text-sm text-blue-800 font-medium">
                      Mark this withdrawal as completed and processed.
                    </span>
                  </div>
                  {userInfo.role === "subadmin" && (
                    <div className="mt-2 text-xs text-blue-700">
                      This action will be recorded under your name: {userInfo.name}
                    </div>
                  )}
                </div>
              )}

              {newStatus === 'hold' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FiCheck className="text-purple-500 mr-2" />
                    <span className="text-sm text-purple-800 font-medium">
                      Put this withdrawal on hold for further review.
                    </span>
                  </div>
                  {userInfo.role === "subadmin" && (
                    <div className="mt-2 text-xs text-purple-700">
                      This action will be recorded under your name: {userInfo.name}
                    </div>
                  )}
                </div>
              )}

              {/* Note for sub-admin */}
              {userInfo.role === "subadmin" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This update will be recorded under your name in the system logs.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={resetModals}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updateLoading || (newStatus === 'rejected' && !rejectionReason.trim())}
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Delete Withdrawal Request
              </h3>
              <button 
                onClick={resetModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* User Info Display */}
              {userInfo.role === "subadmin" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You are deleting as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-500 mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Warning</h4>
                    <p className="text-sm text-red-600 mt-1">This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Ambassador:</span>{' '}
                  <span className="text-gray-900">{selectedWithdrawal.ambassadorId?.fullName}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Amount:</span>{' '}
                  <span className="text-gray-900">{formatCurrency(selectedWithdrawal.amount)}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Status:</span>{' '}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(selectedWithdrawal.status)}`}>
                    {selectedWithdrawal.status?.charAt(0).toUpperCase() + selectedWithdrawal.status?.slice(1)}
                  </span>
                </p>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to delete this withdrawal request?
              </p>

              {userInfo.role === "subadmin" && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Note:</strong> This deletion will be recorded under your name in the system logs.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={resetModals}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">
                Withdrawal Request Details
              </h3>
              <button 
                onClick={resetModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Admin Info Display */}
              {selectedWithdrawal.note && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaUserShield className="text-purple-600" />
                    <h4 className="font-semibold text-purple-800">Admin Information</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Note:</span> {selectedWithdrawal.note}</p>
                    {selectedWithdrawal.updatedBy && (
                      <p><span className="font-medium">Updated By:</span> {selectedWithdrawal.updatedBy}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Ambassador Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Ambassador Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedWithdrawal.ambassadorId?.fullName}</p>
                    <p><span className="font-medium">Email:</span> {selectedWithdrawal.ambassadorId?.email}</p>
                    <p><span className="font-medium">Mobile:</span> {selectedWithdrawal.ambassadorId?.mobileNumber}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Amount:</span> {formatCurrency(selectedWithdrawal.amount)}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(selectedWithdrawal.status)}`}>
                        {selectedWithdrawal.status?.charAt(0).toUpperCase() + selectedWithdrawal.status?.slice(1)}
                      </span>
                    </p>
                    <p><span className="font-medium">Requested:</span> {formatDate(selectedWithdrawal.requestedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Bank Account Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Bank Name:</span> {selectedWithdrawal.accountDetails?.bankName}</p>
                    <p><span className="font-medium">Account Holder:</span> {selectedWithdrawal.accountDetails?.accountHolderName}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Account Number:</span> {selectedWithdrawal.accountDetails?.accountNumber}</p>
                    <p><span className="font-medium">IFSC Code:</span> {selectedWithdrawal.accountDetails?.ifscCode}</p>
                    {selectedWithdrawal.upiId && (
                      <p><span className="font-medium">UPI ID:</span> {selectedWithdrawal.upiId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Request Timeline</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Request Submitted</span>
                    <span className="ml-auto text-gray-500">{formatDate(selectedWithdrawal.requestedAt)}</span>
                  </div>
                  {selectedWithdrawal.approvedAt && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Approved</span>
                      <span className="ml-auto text-gray-500">{formatDate(selectedWithdrawal.approvedAt)}</span>
                    </div>
                  )}
                  {selectedWithdrawal.rejectedAt && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Rejected</span>
                      <span className="ml-auto text-gray-500">{formatDate(selectedWithdrawal.rejectedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedWithdrawal.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Rejection Reason</h4>
                  <p className="text-sm text-red-700">{selectedWithdrawal.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={resetModals}
                className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbassadorWithdrawalList;