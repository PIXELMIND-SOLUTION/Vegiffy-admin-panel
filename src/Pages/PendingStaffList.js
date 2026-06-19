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
  FaIdCard,
  FaUserTie,
  FaTimes,
  FaHourglassHalf,
  FaUserShield,
  FaInfoCircle
} from "react-icons/fa";

const PendingStaffList = () => {
  const [staffs, setStaffs] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedRole = sessionStorage.getItem("role");


  // Page names mapping
  const pageNames = {
    "/dashboard": "Dashboard",
    "/setting": "Settings",
    "/categoryform": "Category Form",
    "/categorylist": "Category List",
    "/add-product": "Add Product",
    "/productlist": "Product List",
    "/allorders": "All Orders",
    "/pendingorders": "Pending Orders",
    "/completedorders": "Completed Orders",
    "/active-users": "Active Users",
    "/add-vendor": "Add Vendor",
    "/vendorlist": "Vendor List",
    "/activevendorlist": "Active Vendor List",
    "/create-banner": "Create Banner",
    "/add-rider": "Add Rider",
    "/riderlist": "Rider List",
    "/activeriderlist": "Active Rider List",
    "/notifications": "Notifications",
    "/add-staff": "Add Staff",
    "/stafflist": "Staff List",
    "/withdrawallist": "Withdrawal List",
    "/vendorwithdrawallist": "Vendor Withdrawal List"
  };

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

  // Fetch Pending Staff Members
  const fetchPendingStaffs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.vegiffy.in/api/admin/allstaffs");
      // Filter only pending staff members
      const pendingStaffs = response.data.data.filter(staff => staff.status === 'pending');
      setStaffs(pendingStaffs);
    } catch (error) {
      console.error("Error fetching pending staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStaffs();
  }, []);

  // Handle View
  const handleView = (staff) => {
    setViewData(staff);
    setShowViewModal(true);
  };

  // Handle Edit
  const handleEdit = (staff) => {
    setEditData({
      ...staff,
      pagesAccess: staff.pagesAccess || []
    });
    setShowEditModal(true);
  };

  // Handle Delete with sub-admin ID
  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`https://api.vegiffy.in/api/admin/deletestaff/${deleteId}`, config);
      setShowDeleteModal(false);
      fetchPendingStaffs();
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  // Handle Form Submit with sub-admin ID
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      // Prepare request data with sub-admin info
      const requestData = {
        fullName: editData.fullName,
        email: editData.email,
        mobileNumber: editData.phone,
        role: editData.role,
        gender: editData.gender,
        age: editData.age,
        pagesAccess: editData.pagesAccess,
        status: editData.status
      };

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Updated by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.put(
        `https://api.vegiffy.in/api/admin/updatestaff/${editData._id}`,
        requestData
      );

      if (response.data.success) {
        setShowEditModal(false);
        fetchPendingStaffs();
      } else {
        alert(response.data.message || "Failed to update staff");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      alert(error.response?.data?.message || "Error updating staff");
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

  // Handle page access change
  const handlePageAccessChange = (e) => {
    const selectedOption = e.target.value;

    if (selectedOption && !editData.pagesAccess.includes(selectedOption)) {
      setEditData(prev => ({
        ...prev,
        pagesAccess: [...prev.pagesAccess, selectedOption]
      }));
    }

    // Reset the select value
    e.target.value = "";
  };

  // Remove page from access
  const removePageAccess = (pageToRemove) => {
    setEditData(prev => ({
      ...prev,
      pagesAccess: prev.pagesAccess.filter(page => page !== pageToRemove)
    }));
  };

  // Status Badge Component - Only for pending status
  const StatusBadge = ({ status }) => {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FaHourglassHalf className="text-xs" />
        Pending
      </span>
    );
  };

  // Role Badge Component
  const RoleBadge = ({ role }) => {
    const getRoleColor = (role) => {
      switch (role) {
        case 'admin':
          return 'bg-purple-100 text-purple-800';
        case 'manager':
          return 'bg-blue-100 text-blue-800';
        case 'supervisor':
          return 'bg-indigo-100 text-indigo-800';
        case 'staff':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    );
  };

  // Approve Staff Member with sub-admin ID
  const handleApprove = async (staffId) => {
    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      const requestData = {
        status: 'active'
      };

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Approved by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.put(`https://api.vegiffy.in/api/admin/updatestaff/${staffId}`, requestData);

      if (response.data.success) {
        fetchPendingStaffs(); // Refresh the list
      } else {
        alert(response.data.message || "Failed to approve staff");
      }
    } catch (error) {
      console.error("Error approving staff:", error);
      alert(error.response?.data?.message || "Error approving staff");
    }
  };

  // Reject Staff Member with sub-admin ID
  const handleReject = async (staffId) => {
    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      const requestData = {
        status: 'inactive'
      };

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Rejected by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.put(`https://api.vegiffy.in/api/admin/updatestaff/${staffId}`, requestData);

      if (response.data.success) {
        fetchPendingStaffs(); // Refresh the list
      } else {
        alert(response.data.message || "Failed to reject staff");
      }
    } catch (error) {
      console.error("Error rejecting staff:", error);
      alert(error.response?.data?.message || "Error rejecting staff");
    }
  };

  const userInfo = getUserInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto">

        {/* Header with User Info */}
        <div className="mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaHourglassHalf className="text-yellow-600" />
                  Pending Staff Approvals
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {staffs.length} staff members waiting for approval
                </p>
              </div>

              {/* User Role Display */}
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

            {/* Sub-Admin Note */}
            {userInfo.role === "subadmin" && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-800 flex items-center gap-1">
                  <FaInfoCircle size={10} />
                  <span>All updates will be recorded under your name</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Staff Info</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role & Dept</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admin Info</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-2 py-6 text-center text-xs text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FaCheckCircle className="text-xl text-green-500 mb-2" />
                        <p className="text-sm font-medium text-gray-900 mb-1">No Pending Approvals</p>
                        <p className="text-gray-600">All staff members have been processed.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  staffs.map((staff) => (
                    <tr key={staff._id} className="hover:bg-gray-50">
                      {/* Staff Info Column */}
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          {staff.photo ? (
                            <img
                              src={staff.photo}
                              alt={staff.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <FaUser className="text-gray-400 text-xs" />
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-medium text-gray-900">
                              {staff.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {staff._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Column */}
                      <td className="px-2 py-3">
                        <div className="text-xs text-gray-900 flex items-center gap-1">
                          <FaPhone className="text-xs text-gray-400" />
                          {staff.phone}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FaEnvelope className="text-xs text-gray-400" />
                          {staff.email}
                        </div>
                      </td>

                      {/* Role & Department Column */}
                      <td className="px-2 py-3">
                        <div className="space-y-1">
                          <RoleBadge role={staff.role} />
                          <div className="text-xs text-gray-500">
                            {staff.department || 'Not specified'}
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-2 py-3">
                        <div className="space-y-1">
                          <StatusBadge status={staff.status} />
                          <div className="text-xs text-gray-500">
                            Applied: {new Date(staff.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* Admin Info Column */}
                      <td className="px-2 py-3">
                        <div className="text-xs">
                          {staff.note && (
                            <div className="text-purple-600 italic mb-1" title={staff.note}>
                              {staff.note.length > 20 ? staff.note.substring(0, 20) + '...' : staff.note}
                            </div>
                          )}
                          {staff.updatedBy && (
                            <div className="text-gray-500">
                              By: {staff.updatedBy}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(staff)}
                            className="text-blue-600 hover:text-blue-900 transition duration-200 p-1 rounded"
                            title="View Details"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleEdit(staff)}
                            className="text-green-600 hover:text-green-900 transition duration-200 p-1 rounded"
                            title="Edit"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleApprove(staff._id)}
                            className="text-green-600 hover:text-green-900 transition duration-200 p-1 rounded"
                            title="Approve"
                          >
                            <FaCheckCircle className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleReject(staff._id)}
                            className="text-red-600 hover:text-red-900 transition duration-200 p-1 rounded"
                            title="Reject"
                          >
                            <FaTimesCircle className="text-sm" />
                          </button>
                          {storedRole === 'admin' && (
                            <button
                              onClick={() => {
                                setDeleteId(staff._id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 transition duration-200 p-1 rounded"
                              title="Delete"
                            >
                              <FaTrash className="text-sm" />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaHourglassHalf className="text-yellow-600" />
                    Pending Staff Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Personal Information
                    </h3>

                    <div className="flex items-center gap-3">
                      {viewData.photo ? (
                        <img
                          src={viewData.photo}
                          alt={viewData.fullName}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {viewData.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {viewData._id}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Email</label>
                        <div className="text-gray-900 flex items-center gap-1">
                          <FaEnvelope className="text-xs" />
                          {viewData.email}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Phone</label>
                        <div className="text-gray-900 flex items-center gap-1">
                          <FaPhone className="text-xs" />
                          {viewData.phone}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Age</label>
                        <div className="text-gray-900">
                          {viewData.age || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Gender</label>
                        <div className="text-gray-900">
                          {viewData.gender || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employment Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Employment Information
                    </h3>

                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Role</label>
                        <div className="mt-1">
                          <RoleBadge role={viewData.role} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Status</label>
                        <div className="mt-1">
                          <StatusBadge status={viewData.status} />
                        </div>
                      </div>

                      {/* Admin Info */}
                      <div>
                        <label className="text-xs font-medium text-gray-700">Admin Info</label>
                        <div className="text-xs">
                          {viewData.note && (
                            <div className="text-purple-600 italic mt-1">
                              {viewData.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Approval Actions */}
                    <div className="pt-3">
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Quick Actions:</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleApprove(viewData._id);
                            setShowViewModal(false);
                          }}
                          className="flex-1 bg-green-600 text-white py-1.5 px-2 rounded hover:bg-green-700 transition duration-200 text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <FaCheckCircle />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            handleReject(viewData._id);
                            setShowViewModal(false);
                          }}
                          className="flex-1 bg-red-600 text-white py-1.5 px-2 rounded hover:bg-red-700 transition duration-200 text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <FaTimesCircle />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Page Access Information */}
                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Requested Page Access
                    </h3>

                    <div className="space-y-2">
                      {viewData.pagesAccess && viewData.pagesAccess.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {viewData.pagesAccess.map((page, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium"
                            >
                              {pageNames[page] || page}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                          No page access requested
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Additional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Date Applied</label>
                        <div className="text-xs text-gray-900">
                          {new Date(viewData.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Last Updated</label>
                        <div className="text-xs text-gray-900">
                          {new Date(viewData.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {viewData.aadharCard && (
                      <div>
                        <label className="text-xs font-medium text-gray-700">Aadhar Card</label>
                        <div className="text-sm text-gray-900 mt-1">
                          <img
                            src={viewData.aadharCard}
                            alt="Aadhar Card"
                            className="w-24 h-16 object-cover rounded border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200 text-xs font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded shadow w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaEdit className="text-green-600" />
                    Edit Pending Staff
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* User Info for Edit Form */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                    <p className="text-purple-800">
                      Editing as <strong>{userInfo.name}</strong> (Sub-Admin)
                    </p>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Personal Information
                    </h3>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={editData?.fullName || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editData?.email || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={editData?.phone || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={editData?.age || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={editData?.gender || ''}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Employment Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Employment Information
                    </h3>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Role *
                        </label>
                        <select
                          name="role"
                          value={editData?.role || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Select Role</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="support">Support</option>
                          <option value="delivery">Delivery</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status *
                        </label>
                        <select
                          name="status"
                          value={editData?.status || 'pending'}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Page Access */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Page Access
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Add Page Access
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        onChange={handlePageAccessChange}
                      >
                        <option value="">Select a page</option>
                        {Object.keys(pageNames).map((path) => (
                          <option key={path} value={path}>
                            {pageNames[path]}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select pages one by one to add them</p>
                    </div>

                    {/* Display selected pages */}
                    {editData.pagesAccess && editData.pagesAccess.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Selected Pages:</label>
                        <div className="flex flex-wrap gap-1">
                          {editData.pagesAccess.map((page, index) => (
                            <div key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center">
                              {pageNames[page] || page}
                              <button
                                type="button"
                                className="ml-1 text-blue-600 hover:text-blue-800"
                                onClick={() => removePageAccess(page)}
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200 text-xs font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition duration-200 text-xs font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded shadow max-w-sm w-full">
              <div className="p-4">
                <div className="text-center">
                  <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <FaTrash className="text-red-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 text-xs mb-3">
                    Are you sure you want to delete this pending staff member? This action cannot be undone.
                  </p>

                  {/* User Info for Delete */}
                  {userInfo.role === "subadmin" && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="text-yellow-800">
                        Deleting as <strong>{userInfo.name}</strong> (Sub-Admin)
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-1.5 rounded hover:bg-gray-400 transition duration-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-1.5 rounded hover:bg-red-700 transition duration-200 text-xs font-medium"
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

export default PendingStaffList;