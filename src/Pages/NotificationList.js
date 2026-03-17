import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch notifications from the server
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.vegiffyy.com/api/delivery-boy/notification');
      setNotifications(response.data.notifications || []);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (notification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedNotification(null);
  };

  // Handle notification delete with confirmation
  const handleDelete = async () => {
    if (!selectedNotification) return;

    try {
      setDeleting(true);
      // Make the DELETE request to your API to delete the notification
      const response = await axios.delete(`https://api.vegiffyy.com/api/delivery-boy/deletenotification/${selectedNotification._id}`);

      if (response.status === 200) {
        // Successfully deleted, update the UI by removing the notification
        setNotifications(notifications.filter(notification => notification._id !== selectedNotification._id));
        
        // Show success message (optional)
        alert('Notification deleted successfully!');
        
        // Close the modal
        closeDeleteModal();
      }
    } catch (err) {
      setError('Failed to delete notification.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Format date function (if you want to show date)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Notifications</h2>
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading notifications...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
          <button 
            onClick={fetchNotifications}
            className="ml-2 text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table to display notifications */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-left text-sm text-gray-700">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 border">S.No</th>
                <th className="px-4 py-3 border">Message</th>
                <th className="px-4 py-3 border">Date & Time</th>
                <th className="px-4 py-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <tr key={notification._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="max-w-md">
                        <p className="text-gray-800">{notification.message}</p>
                        {notification.title && (
                          <p className="text-xs text-gray-500 mt-1">Title: {notification.title}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="text-sm">
                        {formatDate(notification.createdAt || notification.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 border text-center">
                      <button 
                        onClick={() => openDeleteModal(notification)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                      </svg>
                      <p>No notifications available.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                Delete Notification
              </h3>
              
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete this notification? This action cannot be undone.
              </p>

              {/* Notification preview */}
              <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-200">
                <p className="text-sm text-gray-700 line-clamp-2">
                  <span className="font-medium">Message:</span> {selectedNotification.message}
                </p>
                {selectedNotification.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">Date:</span> {formatDate(selectedNotification.createdAt)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Deleting...
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

      {/* Notifications count summary */}
      {notifications.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-right">
          Total notifications: {notifications.length}
        </div>
      )}
    </div>
  );
};

export default NotificationList;