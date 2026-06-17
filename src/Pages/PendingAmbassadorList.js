import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaUserFriends,
  FaTimes,
  FaHourglassHalf,
  FaUserShield,
  FaInfoCircle,
  FaSync
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PendingAmbassadorList = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [pendingAmbassadors, setPendingAmbassadors] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedRole = localStorage.getItem("role");


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

  // Fetch Ambassadors
  const fetchAmbassadors = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.vegiffy.in/api/ambsdor/allambsdor");
      setAmbassadors(response.data.data);

      // Filter only pending ambassadors
      const pending = response.data.data.filter(ambassador => ambassador.status === 'pending');
      setPendingAmbassadors(pending);
      toast.success(`Loaded ${pending.length} pending ambassadors`);
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
      toast.error("Failed to load ambassadors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  // Handle View
  const handleView = (ambassador) => {
    setViewData(ambassador);
    setShowViewModal(true);
  };

  // Handle Edit with subAdminId
  const handleEdit = (ambassador) => {
    setEditData({ ...ambassador });
    setShowEditModal(true);
  };

  // Handle Delete with subAdminId
  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`https://api.vegiffy.in/api/ambsdor/delete-ambsdor/${deleteId}`, config);
      setShowDeleteModal(false);
      toast.success("Ambassador deleted successfully!");
      fetchAmbassadors();
    } catch (error) {
      console.error("Error deleting ambassador:", error);
      toast.error("Failed to delete ambassador");
    }
  };

  // Handle Form Submit with subAdminId
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const subAdminId = getSubAdminId();
      const requestData = { ...editData };

      // Remove _id from request data
      delete requestData._id;

      if (subAdminId) {
        requestData.subAdminId = subAdminId;

        // Add note about who updated
        requestData.note = `Updated by Sub-admin: ${getUserInfo().name} at ${new Date().toLocaleString()}`;

        // Add updatedBy field
        requestData.updatedBy = getUserInfo().name;
      }

      await axios.put(
        `https://api.vegiffy.in/api/ambsdor/update-ambsdor/${editData._id}`,
        requestData
      );
      setShowEditModal(false);
      toast.success("Ambassador updated successfully!");
      fetchAmbassadors();
    } catch (error) {
      console.error("Error updating ambassador:", error);
      toast.error("Failed to update ambassador");
    }
  };

  // Handle input change for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const getStatusInfo = (status) => {
      switch (status) {
        case 'active':
          return { color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
        case 'inactive':
          return { color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: FaClock };
      }
    };

    const { color, icon: Icon } = getStatusInfo(status);

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="text-xs" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // Social Media Link Component
  const SocialLink = ({ platform, url, icon: Icon }) => {
    if (!url) return null;

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition duration-200"
      >
        <Icon className="text-xs" />
        {platform}
      </a>
    );
  };

  // Get current user info
  const userInfo = getUserInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg">
                  <FaHourglassHalf className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      Pending Ambassadors
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Total {pendingAmbassadors.length} pending ambassador applications
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
                  onClick={fetchAmbassadors}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <FaSync className={`text-sm ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAmbassadors.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Social Media</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pendingAmbassadors.filter(amb =>
                    amb.instagram || amb.facebook || amb.twitter
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUserFriends className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {pendingAmbassadors.filter(amb => {
                    const today = new Date();
                    const ambDate = new Date(amb.createdAt);
                    return ambDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUser className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ambassador Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact & Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Social Media
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingAmbassadors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-sm text-gray-500">
                      <FaUserFriends className="mx-auto text-3xl text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-900 mb-1">No pending applications</p>
                      <p className="text-gray-600">All ambassador applications have been processed</p>
                    </td>
                  </tr>
                ) : (
                  pendingAmbassadors.map((ambassador) => (
                    <tr key={ambassador._id} className="hover:bg-gray-50">
                      {/* Ambassador Info Column */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {ambassador.profileImage ? (
                            <img
                              src={ambassador.profileImage}
                              alt={ambassador.fullName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-yellow-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-yellow-100 border-2 border-yellow-200 flex items-center justify-center">
                              <FaUser className="text-yellow-600" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ambassador.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {ambassador._id.slice(-6)}
                            </div>
                            {ambassador.gender && (
                              <div className="text-xs text-gray-500 capitalize">
                                {ambassador.gender}
                              </div>
                            )}
                            {ambassador.note && (
                              <div className="text-xs text-blue-600 mt-0.5 italic">
                                {ambassador.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location Column */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <FaEnvelope className="text-xs text-gray-400" />
                            <span className="truncate max-w-[180px]">{ambassador.email}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <FaPhone className="text-xs text-gray-400" />
                            {ambassador.mobileNumber}
                          </div>
                          {(ambassador.city || ambassador.area) && (
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <FaMapMarkerAlt className="text-xs text-gray-400" />
                              {ambassador.city} {ambassador.area && `, ${ambassador.area}`}
                            </div>
                          )}
                          {ambassador.updatedBy && (
                            <div className="text-xs text-purple-600 mt-1">
                              Updated by: {ambassador.updatedBy}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Social Media Column */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <SocialLink
                            platform="Instagram"
                            url={ambassador.instagram}
                            icon={FaInstagram}
                          />
                          <SocialLink
                            platform="Facebook"
                            url={ambassador.facebook}
                            icon={FaFacebook}
                          />
                          <SocialLink
                            platform="Twitter"
                            url={ambassador.twitter}
                            icon={FaTwitter}
                          />
                          {!ambassador.instagram && !ambassador.facebook && !ambassador.twitter && (
                            <span className="text-xs text-gray-400">No social links</span>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div>
                            <StatusBadge status={ambassador.status} />
                          </div>
                          <div className="text-xs text-gray-500">
                            Applied: {new Date(ambassador.createdAt).toLocaleDateString()}
                          </div>
                          {ambassador.expectedCommission && (
                            <div className="text-xs text-green-600 font-medium">
                              Expected: {ambassador.expectedCommission}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(ambassador)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleEdit(ambassador)}
                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          {storedRole === 'admin' && (
                            <button
                              onClick={() => {
                                setDeleteId(ambassador._id);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {showViewModal && viewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaUserFriends className="text-blue-600" />
                    Ambassador Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* User Info Display */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Viewing as <strong>{userInfo.name}</strong> (Sub-Admin)
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Personal Information
                    </h3>

                    <div className="flex items-center gap-4">
                      {viewData.profileImage ? (
                        <img
                          src={viewData.profileImage}
                          alt={viewData.fullName}
                          className="w-16 h-16 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-400 text-xl" />
                        </div>
                      )}
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {viewData.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {viewData._id}
                        </div>
                        {viewData.note && (
                          <div className="text-xs text-blue-600 mt-1 italic">
                            {viewData.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FaEnvelope className="text-xs" />
                          {viewData.email}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FaPhone className="text-xs" />
                          {viewData.mobileNumber}
                        </div>
                      </div>
                      {viewData.dateOfBirth && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <FaBirthdayCake className="text-xs" />
                            {viewData.dateOfBirth}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Gender</label>
                        <div className="text-sm text-gray-900">
                          {viewData.gender || 'Not provided'}
                        </div>
                      </div>
                      {viewData.updatedBy && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Updated By</label>
                          <div className="text-sm text-gray-900">{viewData.updatedBy}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Location Information
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs" />
                          {viewData.city || 'Not provided'}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Area</label>
                        <div className="text-sm text-gray-900">
                          {viewData.area || 'Not provided'}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Pincode</label>
                        <div className="text-sm text-gray-900">
                          {viewData.pincode || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Information */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Social Media Links
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {viewData.instagram && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                          <FaInstagram className="text-pink-600" />
                          <a
                            href={viewData.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate"
                          >
                            Instagram
                          </a>
                        </div>
                      )}
                      {viewData.facebook && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                          <FaFacebook className="text-blue-600" />
                          <a
                            href={viewData.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate"
                          >
                            Facebook
                          </a>
                        </div>
                      )}
                      {viewData.twitter && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                          <FaTwitter className="text-blue-400" />
                          <a
                            href={viewData.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate"
                          >
                            Twitter
                          </a>
                        </div>
                      )}
                    </div>

                    {!viewData.instagram && !viewData.facebook && !viewData.twitter && (
                      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                        No social media links provided
                      </div>
                    )}
                  </div>

                  {/* Ambassador Details */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Ambassador Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Why Veggyfy?</label>
                        <div className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded border min-h-[60px]">
                          {viewData.whyVeggyfy || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Marketing Ideas</label>
                        <div className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded border min-h-[60px]">
                          {viewData.marketingIdeas || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Target Audience</label>
                        <div className="text-sm text-gray-900 mt-1">
                          {viewData.targetAudience || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expected Commission</label>
                        <div className="text-sm text-gray-900 mt-1">
                          {viewData.expectedCommission || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Additional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">
                          <StatusBadge status={viewData.status} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Referral Code</label>
                        <div className="text-sm text-gray-900">
                          {viewData.referralCode || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Date of Application</label>
                        <div className="text-sm text-gray-900">
                          {new Date(viewData.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Updated</label>
                        <div className="text-sm text-gray-900">
                          {new Date(viewData.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      setEditData({ ...viewData });
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 text-sm font-medium"
                  >
                    Edit Ambassador
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaEdit className="text-green-600" />
                    Edit Ambassador
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* User Info Display */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      You are editing as <strong>{userInfo.name}</strong> (Sub-Admin)
                    </p>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={editData?.fullName || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editData?.email || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="text"
                          name="mobileNumber"
                          value={editData?.mobileNumber || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={editData?.dateOfBirth || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={editData?.gender || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Location Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={editData?.city || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Area
                        </label>
                        <input
                          type="text"
                          name="area"
                          value={editData?.area || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={editData?.pincode || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Social Media Links
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instagram
                        </label>
                        <input
                          type="url"
                          name="instagram"
                          value={editData?.instagram || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://instagram.com/username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Facebook
                        </label>
                        <input
                          type="url"
                          name="facebook"
                          value={editData?.facebook || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://facebook.com/username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter
                        </label>
                        <input
                          type="url"
                          name="twitter"
                          value={editData?.twitter || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ambassador Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Ambassador Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Why Veggyfy?
                        </label>
                        <textarea
                          name="whyVeggyfy"
                          value={editData?.whyVeggyfy || ''}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Why do you want to be a Veggyfy ambassador?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marketing Ideas
                        </label>
                        <textarea
                          name="marketingIdeas"
                          value={editData?.marketingIdeas || ''}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Your marketing ideas for Veggyfy"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Audience
                          </label>
                          <input
                            type="text"
                            name="targetAudience"
                            value={editData?.targetAudience || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Who is your target audience?"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Commission
                          </label>
                          <input
                            type="text"
                            name="expectedCommission"
                            value={editData?.expectedCommission || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Your expected commission"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Status
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={editData?.status || 'pending'}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200 text-sm font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition duration-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <FaTrash className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Are you sure you want to delete this ambassador? This action cannot be undone.
                  </p>
                </div>

                {/* User Info Display */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      This deletion will be recorded under your name: <strong>{userInfo.name}</strong>
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition duration-200 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingAmbassadorList;