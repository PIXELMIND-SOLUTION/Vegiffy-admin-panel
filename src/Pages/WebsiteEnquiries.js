import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaEye, FaPhone, FaEnvelope, FaUser, FaCalendar, FaCheckCircle, FaTimesCircle, FaTag, FaSearch, FaFileExport, FaDownload, FaUserShield, FaInfoCircle } from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';

const WebsiteEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [viewEnquiry, setViewEnquiry] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editForm, setEditForm] = useState({
    status: 'pending'
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnerTypeFilter, setPartnerTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // User info state
  const [userInfo, setUserInfo] = useState({
    role: '',
    name: '',
    email: '',
    id: ''
  });

  // API endpoint
  const API_BASE_URL = 'https://api.vegiffy.in/api';

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const role = localStorage.getItem("role") || "";
      const name = localStorage.getItem("adminName") || "";
      const email = localStorage.getItem("adminEmail") || "";
      const id = localStorage.getItem("adminId") || "";
      
      return {
        role: role.toLowerCase(),
        name,
        email,
        id
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      return { role: "", name: "", email: "", id: "" };
    }
  };

  // Get subAdminId if user is subadmin
  const getSubAdminId = () => {
    const info = getUserInfo();
    return info.role === "subadmin" ? info.id : null;
  };

  // Fetch enquiries from the server
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get-all-enquiries`);
        const enquiriesData = response.data.data || [];
        setEnquiries(enquiriesData);
        setFilteredEnquiries(enquiriesData);
      } catch (err) {
        setError('Failed to load enquiries.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
    // Set user info on component mount
    setUserInfo(getUserInfo());
  }, []);

  // Apply filters whenever search or filter criteria change
  useEffect(() => {
    let result = enquiries;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(enquiry =>
        enquiry.name.toLowerCase().includes(searchLower) ||
        enquiry.email.toLowerCase().includes(searchLower) ||
        enquiry.phoneNumber.toLowerCase().includes(searchLower) ||
        enquiry.partnerType.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(enquiry => enquiry.status === statusFilter);
    }

    // Apply partner type filter
    if (partnerTypeFilter !== 'all') {
      result = result.filter(enquiry => enquiry.partnerType === partnerTypeFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 7);
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 30);

      result = result.filter(enquiry => {
        const enquiryDate = new Date(enquiry.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return enquiryDate >= today;
          case 'yesterday':
            return enquiryDate >= yesterday && enquiryDate < today;
          case 'last7days':
            return enquiryDate >= last7Days;
          case 'last30days':
            return enquiryDate >= last30Days;
          default:
            return true;
        }
      });
    }

    setFilteredEnquiries(result);
  }, [searchTerm, statusFilter, partnerTypeFilter, dateFilter, enquiries]);

  // Show success message and auto hide after 3 seconds
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Handle enquiry delete
  const handleDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete-enquiry/${enquiryId}`);
      
      if (response.data.success) {
        const updatedEnquiries = enquiries.filter(enquiry => enquiry._id !== enquiryId);
        setEnquiries(updatedEnquiries);
        showSuccessMessage('Enquiry deleted successfully!');
      }
    } catch (err) {
      setError('Failed to delete enquiry.');
      console.error(err);
    }
  };

  // Open edit modal
  const openEditModal = (enquiry) => {
    setEditingEnquiry(enquiry);
    setEditForm({
      status: enquiry.status || 'pending'
    });
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingEnquiry(null);
    setEditForm({ status: 'pending' });
  };

  // Open view modal
  const openViewModal = (enquiry) => {
    setViewEnquiry(enquiry);
  };

  // Close view modal
  const closeViewModal = () => {
    setViewEnquiry(null);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Prepare update data with subAdminId if applicable
  const prepareUpdateData = () => {
    const subAdminId = getSubAdminId();
    const userInfo = getUserInfo();
    
    const updateData = {
      status: editForm.status
    };
    
    if (subAdminId) {
      updateData.subAdminId = subAdminId;
      // Add note for sub-admin action
      updateData.note = `${userInfo.role === "subadmin" ? "Sub-admin" : "Admin"}: ${userInfo.name}`;
    }
    
    return updateData;
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = prepareUpdateData();
      
      const response = await axios.put(
        `${API_BASE_URL}/update-enquiry/${editingEnquiry._id}`,
        updateData
      );

      if (response.data.success) {
        // Update the enquiry in the local state with new note if available
        const updatedEnquiry = response.data.data || { ...editingEnquiry, status: editForm.status, note: updateData.note };
        
        const updatedEnquiries = enquiries.map(enquiry => 
          enquiry._id === editingEnquiry._id 
            ? updatedEnquiry
            : enquiry
        );
        setEnquiries(updatedEnquiries);
        showSuccessMessage(`Enquiry status updated successfully${userInfo.role === "subadmin" ? ` by ${userInfo.name}` : ""}!`);
        closeEditModal();
      }
    } catch (err) {
      setError('Failed to update enquiry.');
      console.error(err);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'contacted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unique partner types for filter dropdown
  const getUniquePartnerTypes = () => {
    const types = enquiries.map(enquiry => enquiry.partnerType);
    return ['all', ...new Set(types)];
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (filteredEnquiries.length === 0) {
      alert('No data to export!');
      return;
    }

    const dataToExport = filteredEnquiries.map(enquiry => ({
      'Name': enquiry.name,
      'Email': enquiry.email,
      'Phone': enquiry.phoneNumber,
      'Partner Type': enquiry.partnerType,
      'Status': enquiry.status || 'pending',
      'Admin Note': enquiry.note || 'N/A',
      'Created Date': formatDate(enquiry.createdAt),
      'Last Updated': formatDate(enquiry.updatedAt || enquiry.createdAt)
    }));

    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Enquiries');
    writeFile(wb, `website_enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
    showSuccessMessage('Data exported successfully to Excel!');
  };

  // Export data to CSV format
  const exportToCSVFile = () => {
    if (filteredEnquiries.length === 0) {
      alert('No data to export!');
      return;
    }

    const headers = ['Name,Email,Phone,Partner Type,Status,Admin Note,Created Date,Last Updated'];
    
    const csvRows = filteredEnquiries.map(enquiry => 
      `"${enquiry.name}","${enquiry.email}","${enquiry.phoneNumber}","${enquiry.partnerType}","${enquiry.status || 'pending'}","${enquiry.note || 'N/A'}","${formatDate(enquiry.createdAt)}","${formatDate(enquiry.updatedAt || enquiry.createdAt)}"`
    );

    const csvContent = headers.concat(csvRows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enquiries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccessMessage('Data exported successfully to CSV!');
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPartnerTypeFilter('all');
    setDateFilter('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Success Message Popup */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setSuccessMessage('')}
                      className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <FaTimesCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold">Website Enquiries Management</h1>
                <span className="text-blue-100 text-sm">
                  Total: {enquiries.length} enquiries | Showing: {filteredEnquiries.length}
                </span>
              </div>
              
              {/* User Role Display */}
              <div className="flex gap-2">
                <div className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                  userInfo.role === "subadmin" 
                    ? "bg-purple-800 text-white border border-purple-900"
                    : "bg-blue-800 text-white border border-blue-900"
                }`}>
                  <FaUserShield className="inline" size={12} />
                  {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
                </div>
              </div>
            </div>
            
            {/* Sub-Admin Note */}
            {userInfo.role === "subadmin" && (
              <div className="mt-3 p-2 bg-yellow-100 bg-opacity-20 border border-yellow-300 border-opacity-30 rounded text-xs">
                <p className="text-yellow-100 flex items-center gap-1">
                  <FaInfoCircle size={10} />
                  <span>All updates will be recorded under your name</span>
                </p>
              </div>
            )}
          </div>

          {/* Search and Filter Section */}
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or partner type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="in progress">In Progress</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Partner Type Filter */}
              <div>
                <select
                  value={partnerTypeFilter}
                  onChange={(e) => setPartnerTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Partner Types</option>
                  {getUniquePartnerTypes()
                    .filter(type => type !== 'all')
                    .map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between items-center mt-4 gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
                {(searchTerm || statusFilter !== 'all' || partnerTypeFilter !== 'all' || dateFilter !== 'all') && (
                  <span className="text-sm text-gray-600">
                    Filtered: {filteredEnquiries.length} of {enquiries.length}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToCSVFile}
                  className="inline-flex items-center px-3 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaDownload className="mr-2 h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaFileExport className="mr-2 h-4 w-4" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="mx-5 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaTimesCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <FaTimesCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Partner Type
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Admin Info
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEnquiries.length > 0 ? (
                      filteredEnquiries.map((enquiry) => (
                        <tr key={enquiry._id} className="hover:bg-blue-50 transition-colors duration-150">
                          {/* Name Column */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div>
                                <div className="text-xs font-medium text-gray-500">Name</div>
                                <div className="text-sm font-semibold text-gray-900 truncate max-w-[120px]" title={enquiry.name}>
                                  {enquiry.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Contact Info Column */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div>
                                <div className="text-xs font-medium text-gray-500">Email</div>
                                <div className="text-sm text-gray-700 truncate max-w-[150px]" title={enquiry.email}>
                                  {enquiry.email}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500">Phone</div>
                                <div className="text-xs text-gray-500 truncate max-w-[150px]" title={enquiry.phoneNumber}>
                                  {enquiry.phoneNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Partner Type Column */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div>
                                <div className="text-xs font-medium text-gray-500">Partner Type</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  <span className="inline-flex items-center">
                                    <FaTag className="mr-1 text-blue-500 h-3 w-3" />
                                    {enquiry.partnerType}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Status Column */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(enquiry.status)}`}>
                              {enquiry.status || 'pending'}
                            </span>
                          </td>
                          
                          {/* Admin Info Column */}
                          <td className="px-3 py-3">
                            <div className="text-xs">
                              {enquiry.note && (
                                <div className="text-purple-600 italic mb-1" title={enquiry.note}>
                                  {enquiry.note.length > 20 ? enquiry.note.substring(0, 20) + '...' : enquiry.note}
                                </div>
                              )}
                              {enquiry.updatedBy && (
                                <div className="text-gray-500">
                                  By: {enquiry.updatedBy}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Created Date Column */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center">
                                <FaCalendar className="mr-1 text-gray-400 h-3 w-3" />
                                {formatDate(enquiry.createdAt)}
                              </div>
                            </div>
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => openViewModal(enquiry)}
                                className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-110"
                                title="View Details"
                              >
                                <FaEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(enquiry)}
                                className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-100 transition-all duration-200 transform hover:scale-110"
                                title="Edit Status"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(enquiry._id)}
                                className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-100 transition-all duration-200 transform hover:scale-110"
                                title="Delete Enquiry"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {searchTerm || statusFilter !== 'all' || partnerTypeFilter !== 'all' || dateFilter !== 'all' 
                              ? 'No enquiries found matching your filters. Try clearing filters.'
                              : 'No enquiries available.'
                            }
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 z-10 relative border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Enquiry Details</h3>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Personal Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Full Name</div>
                      <div className="text-sm font-medium text-gray-900">{viewEnquiry.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Email Address</div>
                      <div className="text-sm font-medium text-gray-900 break-all">{viewEnquiry.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Phone Number</div>
                      <div className="text-sm font-medium text-gray-900">{viewEnquiry.phoneNumber}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enquiry Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <FaTag className="mr-2 text-blue-600" />
                  Enquiry Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Partner Type</div>
                    <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">
                      {viewEnquiry.partnerType}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(viewEnquiry.status)}`}>
                      {viewEnquiry.status || 'pending'}
                    </span>
                  </div>
                  
                  {/* Admin Info in View Modal */}
                  {viewEnquiry.note && (
                    <div>
                      <div className="text-xs text-gray-500">Admin Note</div>
                      <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded-lg mt-1 italic">
                        {viewEnquiry.note}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <FaCalendar className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Created Date</div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(viewEnquiry.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaCalendar className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Last Updated</div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(viewEnquiry.updatedAt || viewEnquiry.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-md font-semibold text-gray-800 mb-2">Quick Actions</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    window.open(`mailto:${viewEnquiry.email}?subject=VEGIFFY Partnership Enquiry&body=Dear ${viewEnquiry.name},%0D%0A%0D%0AThank you for your interest in joining VEGIFFY as a ${viewEnquiry.partnerType}.`, '_blank');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Email Now
                </button>
                <button
                  onClick={() => {
                    window.open(`tel:${viewEnquiry.phoneNumber}`, '_blank');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Call Now
                </button>
                <button
                  onClick={() => openEditModal(viewEnquiry)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Update Status
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={closeViewModal}
                className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10 relative border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Update Enquiry Status</h3>
              
              {/* User Role Display in Modal */}
              <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                userInfo.role === "subadmin" 
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}>
                <FaUserShield size={10} />
                {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
              </div>
            </div>
            
            {/* Sub-Admin Note in Modal */}
            {userInfo.role === "subadmin" && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-800 flex items-center gap-1">
                  <FaInfoCircle size={10} />
                  <span>This update will be recorded under your name</span>
                </p>
              </div>
            )}
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Name:</strong> {editingEnquiry.name}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Email:</strong> {editingEnquiry.email}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Phone:</strong> {editingEnquiry.phoneNumber}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Partner Type:</strong> {editingEnquiry.partnerType}
                </div>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="in progress">In Progress</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteEnquiries;