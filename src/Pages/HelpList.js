import React, { useState, useEffect, useCallback } from 'react';
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
    status: '',
    reason: ''
  });

  const storedRole = sessionStorage.getItem("role");


  // User info state
  const [userInfo, setUserInfo] = useState({
    role: '',
    name: '',
    email: '',
    id: ''
  });

  // Get user info from sessionStorage
  const getUserInfo = useCallback(() => {
    try {
      const role = sessionStorage.getItem("role") || "";
      const name = sessionStorage.getItem("adminName") || "";
      const email = sessionStorage.getItem("adminEmail") || "";
      const id = sessionStorage.getItem("adminId") || "";

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
  }, []);

  // Get subAdminId if user is subadmin
  const getSubAdminId = useCallback(() => {
    const info = getUserInfo();
    return info.role === "subadmin" ? info.id : null;
  }, [getUserInfo]);

  // Fetch help issues from the server
  const fetchHelpIssues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.vegiffy.in/api/help');
      setHelpIssues(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load help issues.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHelpIssues();
    setUserInfo(getUserInfo());
  }, [fetchHelpIssues, getUserInfo]);

  // Show success message and auto hide after 3 seconds
  const showSuccessMessage = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  }, []);

  // Handle help issue delete
  const handleDelete = useCallback(async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this help issue?')) return;

    try {
      await axios.delete(`https://api.vegiffy.in/api/help/${issueId}`);
      setHelpIssues(prev => prev.filter(issue => issue._id !== issueId));
      showSuccessMessage('Help issue deleted successfully!');
    } catch (err) {
      setError('Failed to delete help issue.');
      console.error(err);
    }
  }, [showSuccessMessage]);

  // Open edit modal
  const openEditModal = useCallback((issue) => {
    setEditingIssue(issue);
    setEditForm({
      status: issue.status || 'pending',
      reason: ''
    });
  }, []);

  // Close edit modal
  const closeEditModal = useCallback(() => {
    setEditingIssue(null);
    setEditForm({ status: '', reason: '' });
  }, []);

  // Open/Close view modal
  const openViewModal = useCallback((issue) => setViewModal(issue), []);
  const closeViewModal = useCallback(() => setViewModal(null), []);

  // Open/Close image modal
  const openImageModal = useCallback((imageUrl) => setImageModal(imageUrl), []);
  const closeImageModal = useCallback(() => setImageModal(null), []);

  // Handle edit form change
  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Check if reason is required for selected status
  const isReasonRequired = useCallback(() => {
    const status = editForm.status.toLowerCase();
    return status === 'in progress' || status === 'resolved';
  }, [editForm.status]);

  // Prepare update data with subAdminId if applicable
  const prepareUpdateData = useCallback(() => {
    const subAdminId = getSubAdminId();
    const currentUserInfo = getUserInfo();

    const updateData = {
      status: editForm.status
    };

    // Build comprehensive note with reason
    if (editForm.reason && editForm.reason.trim()) {
      const adminPrefix = subAdminId
        ? `[Sub-Admin: ${currentUserInfo.name}] `
        : `[Admin: ${currentUserInfo.name}] `;

      const reasonText = isReasonRequired()
        ? `Status changed to "${editForm.status}". Reason: ${editForm.reason}`
        : `Note: ${editForm.reason}`;

      updateData.note = adminPrefix + reasonText;

      // Send reason in multiple possible fields for compatibility
      updateData.reason = editForm.reason;
      updateData.adminRemark = editForm.reason;
      updateData.resolution = editForm.status === 'resolved' ? editForm.reason : undefined;
    }

    if (subAdminId) {
      updateData.subAdminId = subAdminId;
    }

    // Add metadata
    updateData.updatedBy = currentUserInfo.name;
    updateData.updatedAt = new Date().toISOString();

    return updateData;
  }, [editForm.status, editForm.reason, getSubAdminId, getUserInfo, isReasonRequired]);

  // Handle edit form submit
  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate reason if required
    if (isReasonRequired() && !editForm.reason.trim()) {
      setError(`Please provide a reason for changing status to "${editForm.status}"`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const updateData = prepareUpdateData();

      const response = await axios.put(
        `https://api.vegiffy.in/api/help/${editingIssue._id}`,
        updateData
      );

      if (response.status === 200) {
        // Refresh the issue list to get updated data
        await fetchHelpIssues();

        const statusMessage = editForm.reason
          ? `Status updated to "${editForm.status}" with reason: ${editForm.reason}`
          : `Status updated to "${editForm.status}" successfully!`;

        showSuccessMessage(statusMessage);
        closeEditModal();
      }
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update help issue.');
      setTimeout(() => setError(null), 3000);
    }
  }, [editForm.status, editForm.reason, editingIssue, prepareUpdateData, fetchHelpIssues, showSuccessMessage, closeEditModal, isReasonRequired]);

  // Get status badge color
  const getStatusColor = useCallback((status) => {
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
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

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
                      className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100"
                    >
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
                <div className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 ${userInfo.role === "subadmin"
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
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaTimesCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimesCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User Info</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Issue Info</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Image</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {helpIssues.length > 0 ? (
                    helpIssues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-purple-50 transition-colors duration-150">
                        {/* User Details */}
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

                        {/* Issue Details */}
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <div>
                              <div className="text-xs font-medium text-gray-500">Issue Type</div>
                              <div className="text-sm font-semibold text-gray-900">{issue.issueType}</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500">Description</div>
                              <div className="text-xs text-gray-600 break-words max-w-[180px] mt-1" title={issue.description}>
                                {issue.description?.length > 80 ? `${issue.description.substring(0, 80)}...` : issue.description}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Image */}
                        <td className="px-3 py-3">
                          {issue.imageUrl ? (
                            <div className="flex flex-col items-center space-y-2">
                              <img
                                src={issue.imageUrl}
                                alt="Issue"
                                className="h-12 w-12 rounded-lg object-cover border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openImageModal(issue.imageUrl)}
                              />
                              <button
                                onClick={() => openImageModal(issue.imageUrl)}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                View
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No Image</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(issue.status)}`}>
                            {issue.status || 'pending'}
                          </span>
                        </td>

                        {/* Admin Note */}
                        <td className="px-3 py-3">
                          <div className="text-xs">

                            {issue.reason ? (
                              <div className="text-purple-600 italic max-w-[150px]" title={issue.reason}>
                                Reason: {issue.reason}
                              </div>
                            ) : (
                              <span className="text-gray-500">No notes</span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-500">
                            {formatDate(issue.createdAt)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={() => openViewModal(issue)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-100 transition-all"
                              title="View Details"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(issue)}
                              className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-100 transition-all"
                              title="Edit Status"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            {storedRole === 'admin' && (
                              <button
                                onClick={() => handleDelete(issue._id)}
                                className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-100 transition-all"
                                title="Delete Issue"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            )}
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
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Help Issue Details</h3>
              <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <FaUser className="mr-2 text-purple-600" /> User Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="text-sm font-medium text-gray-900">{viewModal.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm font-medium text-gray-900">{viewModal.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-sm font-medium text-gray-900">{viewModal.userId?.phoneNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Issue Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-purple-600" /> Issue Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Issue Type</div>
                    <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">{viewModal.issueType}</div>
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
                  {(viewModal.note || viewModal.reason) && (
                    <div>
                      <div className="text-xs text-gray-500">Admin Note / Reason</div>
                      <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded-lg mt-1 italic">
                        {viewModal.note || viewModal.reason}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-500">Created Date</div>
                    <div className="text-sm font-medium text-gray-900">{formatDate(viewModal.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Section */}
            {viewModal.imageUrl && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Issue Image</h4>
                <div className="flex justify-center">
                  <img
                    src={viewModal.imageUrl}
                    alt="Issue"
                    className="max-w-full max-h-64 rounded-lg object-contain border border-gray-300 cursor-pointer"
                    onClick={() => openImageModal(viewModal.imageUrl)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button onClick={closeViewModal} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Update Status</h3>
              <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${userInfo.role === "subadmin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                }`}>
                <FaUserShield size={10} />
                {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
              </div>
            </div>

            {userInfo.role === "subadmin" && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-800 flex items-center gap-1">
                  <FaInfoCircle size={10} /> This update will be recorded under your name
                </p>
              </div>
            )}

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-2 text-sm">
                <p><strong>User:</strong> {editingIssue.name} ({editingIssue.email})</p>
                <p><strong>Phone:</strong> {editingIssue.userId?.phoneNumber || 'N/A'}</p>
                <p><strong>Issue:</strong> {editingIssue.issueType}</p>
                <p><strong>Description:</strong> {editingIssue.description}</p>
                {editingIssue.imageUrl && (
                  <button onClick={() => openImageModal(editingIssue.imageUrl)} className="text-blue-600 underline text-xs">
                    View Image
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason / Remarks {isReasonRequired() && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  name="reason"
                  value={editForm.reason}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-purple-500"
                  placeholder={isReasonRequired()
                    ? `Please provide a reason for changing status to "${editForm.status}"...`
                    : "Optional: Add any remarks or notes..."}
                />
                {isReasonRequired() && (
                  <p className="mt-1 text-xs text-amber-600">
                    <FaInfoCircle className="inline mr-1" size={10} />
                    Reason is required when changing to "{editForm.status}"
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700">
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
            <button onClick={closeImageModal} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={imageModal} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
            <div className="mt-2 text-center">
              <a href={imageModal} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 underline text-sm">
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