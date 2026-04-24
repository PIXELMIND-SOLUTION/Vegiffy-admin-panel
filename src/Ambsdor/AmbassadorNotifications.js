import React, { useState, useEffect } from 'react';
import {
  FiBell,
  FiTrash2,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiMessageCircle,
  FiClock,
} from 'react-icons/fi';
import axios from 'axios';

const AmbassadorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        throw new Error('Ambassador ID not found. Please log in again.');
      }

      const response = await axios.get(
        `https://api.vegiffy.in/api/ambsdor/getallnotifications/${ambassadorId}`
      );

      if (response.data.success) {
        setNotifications(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Something went wrong while loading notifications.');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    // Confirm before deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this notification?'
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(notificationId);
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        throw new Error('Ambassador ID not found');
      }

      const response = await axios.delete(
        `https://api.vegiffy.in/api/ambsdor/deletenotifications/${ambassadorId}/${notificationId}`
      );

      if (response.data.success) {
        // Remove the deleted notification from state
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
      } else {
        throw new Error(response.data.message || 'Failed to delete notification');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert(err.message || 'Could not delete notification. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Helper: get icon based on notification type (if available)
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'error':
        return <FiAlertCircle className="text-red-500" />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-500" />;
      case 'info':
      default:
        return <FiInfo className="text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg">
              <FiBell className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-lg text-gray-600">
            Stay updated with your earnings, withdrawals and important alerts
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <FiAlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error loading notifications</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={fetchNotifications}
                className="mt-2 text-sm text-red-700 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 && !error ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <FiBell className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-500">
              You're all caught up! When you receive important updates, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-5 transition-all hover:shadow-lg relative"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {notification.title && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                    )}
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <FiClock className="mr-1" size={12} />
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    disabled={deletingId === notification._id}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 disabled:opacity-50"
                    title="Delete notification"
                  >
                    {deletingId === notification._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    ) : (
                      <FiTrash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional: Mark all as read / clear all could be added here */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center text-xs text-gray-400">
            Notifications are stored for your reference. You can delete individual items.
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbassadorNotifications;