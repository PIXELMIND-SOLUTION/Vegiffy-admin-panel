import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaEye, FaPhone, FaEnvelope, FaUser, FaInfoCircle, FaCalendar, FaCheckCircle, FaTimesCircle, FaUserShield } from 'react-icons/fa';

const HelpList = () => {
  const [helpIssues, setHelpIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editForm, setEditForm] = useState({
    status: ''
  });
  
  // User info state
  const [userInfo, setUserInfo] = useState({
    role: '',
    name: '',
    email: '',
    id: ''
  });

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

  // Fetch help issues from the server
  useEffect(() => {
    const fetchHelpIssues = async () => {
      try {
        const response = await axios.get('https://api.vegiffyy.com/api/help');
        setHelpIssues(response.data.data || []);
      } catch (err) {
        setError('Failed to load help issues.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpIssues();
    // Set user info on component mount
    setUserInfo(getUserInfo());
  }, []);

  // Show success message and auto hide after 3 seconds
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Handle help issue delete
  const handleDelete = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this help issue?')) return;
    
    try {
      const response = await axios.delete(`https://api.vegiffyy.com/api/help/${issueId}`);
      
      if (response.status === 200) {
        setHelpIssues(helpIssues.filter(issue => issue._id !== issueId));
        showSuccessMessage('Help issue deleted successfully!');
      }
    } catch (err) {
      setError('Failed to delete help issue.');
      console.error(err);
    }
  };

  // Open edit modal
  const openEditModal = (issue) => {
    setEditingIssue(issue);
    setEditForm({
      status: issue.status || 'pending'
    });
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingIssue(null);
    setEditForm({ status: '' });
  };

  // Open view modal
  const openViewModal = (issue) => {
    setViewModal(issue);
  };

  // Close view modal
  const closeViewModal = () => {
    setViewModal(null);
  };

  // Open image modal
  const openImageModal = (imageUrl) => {
    setImageModal(imageUrl);
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModal(null);
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
        `https://api.vegiffyy.com/api/help/${editingIssue._id}`,
        updateData
      );

      if (response.status === 200) {
        // Update the issue in the local state with new note if available
        const updatedIssue = response.data.data || { ...editingIssue, status: editForm.status, note: updateData.note };
        
        setHelpIssues(helpIssues.map(issue => 
          issue._id === editingIssue._id 
            ? updatedIssue
            : issue
        ));
        
        showSuccessMessage(`Help issue status updated successfully${userInfo.role === "subadmin" ? ` by ${userInfo.name}` : ""}!`);
        closeEditModal();
      }
    } catch (err) {
      setError('Failed to update help issue.');
      console.error(err);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-6">
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
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold">Help Issues Management</h1>
                <span className="text-purple-100 text-sm">
                  Total: {helpIssues.length} help issues
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

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
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
                        User Info
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Issue Info
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Image
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
                    {helpIssues.length > 0 ? (
                      helpIssues.map((issue) => (
                        <tr key={issue._id} className="hover:bg-purple-50 transition-colors duration-150">
                          {/* User Details Column */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div>
                                <div className="text-xs font-medium text-gray-500">Name</div>
                                <div className="text-sm font-semibold text-gray-900 truncate max-w-[120px]" title={issue.name}>
                                  {issue.name}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500">Email</div>
                                <div className="text-sm text-gray-700 truncate max-w-[120px]" title={issue.email}>
                                  {issue.email}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500">Phone</div>
                                <div className="text-xs text-gray-500 truncate max-w-[120px]" title={issue.userId?.phoneNumber}>
                                  {issue.userId?.phoneNumber || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Issue Details Column */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div>
                                <div className="text-xs font-medium text-gray-500">Issue Type</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {issue.issueType}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500">Description</div>
                                <div className="text-xs text-gray-600 break-words max-w-[180px] mt-1" title={issue.description}>
                                  {issue.description?.length > 80 
                                    ? `${issue.description.substring(0, 80)}...` 
                                    : issue.description
                                  }
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Image Column */}
                          <td className="px-3 py-3">
                            {issue.imageUrl ? (
                              <div className="flex flex-col items-center space-y-2">
                                <div className="relative group">
                                  <img 
                                    src={issue.imageUrl} 
                                    alt="Issue" 
                                    className="h-12 w-12 rounded-lg object-cover border border-gray-300 hover:opacity-80 transition-opacity cursor-pointer"
                                    onClick={() => openImageModal(issue.imageUrl)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                    <FaEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                                <button
                                  onClick={() => openImageModal(issue.imageUrl)}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  View Image
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">No Image</span>
                            )}
                          </td>
                          
                          {/* Status Column */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(issue.status)}`}>
                              {issue.status || 'pending'}
                            </span>
                          </td>
                          
                          {/* Admin Info Column */}
                          <td className="px-3 py-3">
                            <div className="text-xs">
                              {issue.note && (
                                <div className="text-purple-600 italic mb-1" title={issue.note}>
                                  {issue.note.length > 20 ? issue.note.substring(0, 20) + '...' : issue.note}
                                </div>
                              )}
                              {issue.updatedBy && (
                                <div className="text-gray-500">
                                  By: {issue.updatedBy}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Created Date Column */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-xs text-gray-500">
                              {formatDate(issue.createdAt)}
                            </div>
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => openViewModal(issue)}
                                className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-110"
                                title="View Details"
                              >
                                <FaEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(issue)}
                                className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-100 transition-all duration-200 transform hover:scale-110"
                                title="Edit Status"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(issue._id)}
                                className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-100 transition-all duration-200 transform hover:scale-110"
                                title="Delete Issue"
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
                            No help issues available.
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
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 z-10 relative border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Help Issue Details</h3>
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
              {/* User Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <FaUser className="mr-2 text-purple-600" />
                  User Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Name</div>
                      <div className="text-sm font-medium text-gray-900">{viewModal.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm font-medium text-gray-900">{viewModal.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Phone Number</div>
                      <div className="text-sm font-medium text-gray-900">{viewModal.userId?.phoneNumber || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaUser className="text-gray-400 mr-3 w-4 h-4 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500">User ID</div>
                      <div className="text-sm font-medium text-gray-900 break-all">{viewModal.userId?._id || viewModal.userId}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-purple-600" />
                  Issue Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Issue Type</div>
                    <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">
                      {viewModal.issueType}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(viewModal.status)}`}>
                      {viewModal.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Description</div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mt-1 whitespace-pre-wrap">
                      {viewModal.description}
                    </div>
                  </div>
                  
                  {/* Admin Info in View Modal */}
                  {viewModal.note && (
                    <div>
                      <div className="text-xs text-gray-500">Admin Note</div>
                      <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded-lg mt-1 italic">
                        {viewModal.note}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <FaCalendar className="text-gray-400 mr-3 w-4 h-4" />
                    <div>
                      <div className="text-xs text-gray-500">Created Date</div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(viewModal.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Section */}
            {viewModal.imageUrl && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Issue Image</h4>
                <div className="flex justify-center">
                  <div className="relative group">
                    <img 
                      src={viewModal.imageUrl} 
                      alt="Issue" 
                      className="max-w-full max-h-64 rounded-lg object-contain border border-gray-300 cursor-pointer"
                      onClick={() => openImageModal(viewModal.imageUrl)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <FaEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <button
                    onClick={() => openImageModal(viewModal.imageUrl)}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Click to view full image
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={closeViewModal}
                className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10 relative border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Update Help Issue Status</h3>
              
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
                  <strong>User:</strong> {editingIssue.name} ({editingIssue.email})
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Phone:</strong> {editingIssue.userId?.phoneNumber || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Issue Type:</strong> {editingIssue.issueType}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Description:</strong> {editingIssue.description}
                </div>
                {editingIssue.imageUrl && (
                  <div className="text-sm text-gray-600">
                    <strong>Image:</strong> 
                    <button 
                      onClick={() => openImageModal(editingIssue.imageUrl)}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      View Image
                    </button>
                  </div>
                )}
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
                  className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {imageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-90 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={imageModal} 
              alt="Issue Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-2 text-center">
              <a 
                href={imageModal} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 underline text-sm"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpList;