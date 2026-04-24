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
  FaMoneyBillWave,
  FaCalendarAlt,
  FaRupeeSign,
  FaInfoCircle,
  FaUserShield
} from "react-icons/fa";

const StaffList = () => {
  const [staffs, setStaffs] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showSalaryHistoryModal, setShowSalaryHistoryModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [salaryData, setSalaryData] = useState({
    amount: "",
    month: "",
    status: "pending"
  });
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [filteredStaffs, setFilteredStaffs] = useState([]);

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
  };

  // Month options
  const monthOptions = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
    { value: "July", label: "July" },
    { value: "August", label: "August" },
    { value: "September", label: "September" },
    { value: "October", label: "October" },
    { value: "November", label: "November" },
    { value: "December", label: "December" }
  ];

  // Available roles
  const roles = [
    'CEO',
    'General Manager', 
    'HR Manager',
    'HR Executive',
    'Technical Team Lead',
    'Technical Team Member',
    'Testing Team Lead',
    'Testing Team Member',
    'Accountant',
    'Senior Accountant',
    'CA (Chartered Accountant)',
    'Finance Manager',
    'Operations Manager',
    'Marketing Manager',
    'Sales Manager',
    'IT Manager',
    'Admin Staff',
    'Support Staff',
    'Other'
  ];

  // Fetch Staff Members
  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.vegiffy.in/api/admin/allstaffs");
      setStaffs(response.data.data);
      setFilteredStaffs(response.data.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = staffs;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(staff => 
        staff.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone?.includes(searchQuery) ||
        staff.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(staff => staff.status === statusFilter);
    }

    // Apply role filter
    if (roleFilter !== "All") {
      filtered = filtered.filter(staff => staff.role === roleFilter);
    }

    setFilteredStaffs(filtered);
  }, [staffs, searchQuery, statusFilter, roleFilter]);

  // Handle View
  const handleView = (staff) => {
    setViewData(staff);
    setShowViewModal(true);
  };

  // Handle Edit with subAdminId
  const handleEdit = (staff) => {
    setEditData({ 
      ...staff,
      pagesAccess: staff.pagesAccess || [],
      mobileNumber: staff.phone // Map phone to mobileNumber for API
    });
    setShowEditModal(true);
  };

  // Handle Delete with subAdminId
  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`https://api.vegiffy.in/api/admin/deletestaff/${deleteId}`, config);
      setShowDeleteModal(false);
      fetchStaffs();
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  // Handle Add Salary with subAdminId
  const handleAddSalary = (staff) => {
    setSelectedStaff(staff);
    setSalaryData({
      amount: "",
      month: "",
      status: "pending"
    });
    setShowSalaryModal(true);
  };

  // Handle View Salary History
  const handleViewSalaryHistory = (staff) => {
    setSelectedStaff(staff);
    setSalaryHistory(staff.mySalary || []);
    setShowSalaryHistoryModal(true);
  };

  // Handle Salary Submit with subAdminId
  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    try {
      const subAdminId = getSubAdminId();
      const requestData = { ...salaryData };
      
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      await axios.put(
        `https://api.vegiffy.in/api/admin/addsalary/${selectedStaff._id}`,
        requestData
      );
      setShowSalaryModal(false);
      fetchStaffs(); // Refresh the staff list to get updated salary data
    } catch (error) {
      console.error("Error adding salary:", error);
    }
  };

  // Handle Salary Input Change
  const handleSalaryInputChange = (e) => {
    const { name, value } = e.target;
    setSalaryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Form Submit with subAdminId
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const subAdminId = getSubAdminId();
      const requestData = { ...editData };
      
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      // Remove _id from request data
      delete requestData._id;
      
      await axios.put(
        `https://api.vegiffy.in/api/admin/updatestaff/${editData._id}`,
        requestData
      );
      setShowEditModal(false);
      fetchStaffs();
    } catch (error) {
      console.error("Error updating staff:", error);
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

  // Role Badge Component
  const RoleBadge = ({ role }) => {
    const getRoleColor = (role) => {
      if (!role) return 'bg-gray-100 text-gray-800';
      
      const roleLower = role.toLowerCase();
      if (roleLower.includes('ceo') || roleLower.includes('manager')) {
        return 'bg-purple-100 text-purple-800';
      } else if (roleLower.includes('hr') || roleLower.includes('executive')) {
        return 'bg-blue-100 text-blue-800';
      } else if (roleLower.includes('technical') || roleLower.includes('it')) {
        return 'bg-indigo-100 text-indigo-800';
      } else if (roleLower.includes('account') || roleLower.includes('finance')) {
        return 'bg-green-100 text-green-800';
      } else {
        return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
        {role}
      </span>
    );
  };

  // Salary Status Badge Component
  const SalaryStatusBadge = ({ status }) => {
    const getSalaryStatusInfo = (status) => {
      switch (status) {
        case 'paid':
          return { color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
        case 'failed':
          return { color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: FaClock };
      }
    };

    const { color, icon: Icon } = getSalaryStatusInfo(status);
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="text-xs" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // Get current user info
  const userInfo = getUserInfo();

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setRoleFilter("All");
  };

  // Get status counts
  const getStatusCounts = () => {
    const counts = {
      All: staffs.length,
      active: staffs.filter(s => s.status === 'active').length,
      inactive: staffs.filter(s => s.status === 'inactive').length,
      pending: staffs.filter(s => s.status === 'pending').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FaUserTie className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-600">Manage all staff members and their details</p>
              </div>
            </div>
            
            {/* User Role Display */}
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                userInfo.role === "subadmin" 
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-indigo-100 text-indigo-800 border border-indigo-200"
              }`}>
                <FaUserShield className="inline mr-1" size={14} />
                {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">{staffs.length}</p>
                  <p className="text-sm text-gray-600">Total Staff</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {staffs.filter(s => s.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sub-Admin Note */}
          {userInfo.role === "subadmin" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> All updates will be recorded under your name: <strong>{userInfo.name}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone, role..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(searchQuery || statusFilter !== "All" || roleFilter !== "All") && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="All">All Status ({statusCounts.All})</option>
                <option value="active">Active ({statusCounts.active})</option>
                <option value="inactive">Inactive ({statusCounts.inactive})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Filter
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="All">All Roles</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing {filteredStaffs.length} of {staffs.length} staff members
              {(searchQuery || statusFilter !== "All" || roleFilter !== "All") && " (filtered)"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredStaffs.length === 0 ? (
            <div className="text-center py-12">
              <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "All" || roleFilter !== "All" 
                  ? 'No staff members match your current filters' 
                  : 'No staff members available'}
              </p>
              {(searchQuery || statusFilter !== "All" || roleFilter !== "All") && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                        Staff Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact & Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role & Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaffs.map((staff) => (
                      <tr key={staff._id} className="hover:bg-indigo-50 transition-colors">
                        {/* Staff Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {staff.photo ? (
                              <img
                                src={staff.photo}
                                alt={staff.fullName}
                                className="h-12 w-12 rounded-full object-cover border-2 border-indigo-200"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                                <FaUser className="text-indigo-400" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {staff.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {staff._id.slice(-8)}
                              </div>
                              {staff.note && (
                                <div className="text-xs text-blue-600 mt-1 italic">
                                  {staff.note}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <FaEnvelope size={12} />
                              {staff.email}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <FaPhone size={12} />
                              {staff.phone}
                            </div>
                            <div className="text-xs text-gray-500">
                              {staff.department || 'No department'}
                            </div>
                          </div>
                        </td>

                        {/* Role & Status */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div>
                              <RoleBadge role={staff.role} />
                            </div>
                            <div>
                              <StatusBadge status={staff.status} />
                            </div>
                            <div className="text-xs text-gray-500">
                              Joined: {new Date(staff.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>

                        {/* Salary */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddSalary(staff)}
                                className="text-green-600 hover:text-green-900 transition-colors p-2 hover:bg-green-50 rounded-lg"
                                title="Add Salary"
                              >
                                <FaMoneyBillWave size={18} />
                              </button>
                              {staff.mySalary && staff.mySalary.length > 0 && (
                                <button
                                  onClick={() => handleViewSalaryHistory(staff)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                                  title="View Salary History"
                                >
                                  <FaEye size={18} />
                                </button>
                              )}
                            </div>
                            {staff.mySalary && staff.mySalary.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {staff.mySalary.length} salary records
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(staff)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(staff)}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(staff._id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={18} />
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

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaUserTie className="text-indigo-600" />
                  Staff Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header with photo */}
                <div className="flex items-center gap-4">
                  {viewData.photo ? (
                    <img
                      src={viewData.photo}
                      alt={viewData.fullName}
                      className="h-24 w-24 rounded-full object-cover border-4 border-indigo-200"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-indigo-100 border-4 border-indigo-200 flex items-center justify-center">
                      <FaUser className="text-indigo-400 text-3xl" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900">{viewData.fullName}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <RoleBadge role={viewData.role} />
                      <StatusBadge status={viewData.status} />
                    </div>
                    {viewData.note && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800 flex items-center gap-1">
                          <FaInfoCircle />
                          {viewData.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard 
                    title="Email" 
                    value={viewData.email}
                    icon="📧"
                    color="blue"
                  />
                  <StatCard 
                    title="Phone" 
                    value={viewData.phone}
                    icon="📞"
                    color="green"
                  />
                  <StatCard 
                    title="Age" 
                    value={viewData.age || 'N/A'}
                    icon="🎂"
                    color="purple"
                  />
                  <StatCard 
                    title="Gender" 
                    value={viewData.gender || 'N/A'}
                    icon="👤"
                    color="indigo"
                  />
                </div>

                {/* Employment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3">Employment Information</h5>
                    <div className="space-y-2">
                      <DetailItem label="Role" value={viewData.role} />
                      <DetailItem label="Department" value={viewData.department || 'Not specified'} />
                      <DetailItem label="Employee ID" value={viewData.employeeId || 'Not assigned'} />
                      <DetailItem label="Salary" value={viewData.salary ? `₹${viewData.salary}` : 'Not set'} />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3">Timeline</h5>
                    <div className="space-y-2">
                      <DetailItem label="Joined On" value={new Date(viewData.createdAt).toLocaleDateString()} />
                      <DetailItem label="Last Updated" value={new Date(viewData.updatedAt).toLocaleDateString()} />
                    </div>
                  </div>
                </div>

                {/* Salary History */}
                {viewData.mySalary && viewData.mySalary.length > 0 && (
                  <div className="border-t pt-6">
                    <h5 className="font-semibold text-gray-800 mb-4">Salary History</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {viewData.mySalary.slice(0, 6).map((salary, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-lg font-bold text-gray-900">₹{salary.amount}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <FaCalendarAlt size={12} />
                                {salary.month}
                              </div>
                            </div>
                            <SalaryStatusBadge status={salary.status} />
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(salary.date).toLocaleDateString()}
                            {salary.note && (
                              <div className="mt-1 text-blue-600 italic">
                                {salary.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Page Access */}
                <div className="border-t pt-6">
                  <h5 className="font-semibold text-gray-800 mb-4">Page Access Permissions</h5>
                  {viewData.pagesAccess && viewData.pagesAccess.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewData.pagesAccess.map((page, index) => (
                        <span 
                          key={index}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {pageNames[page] || page}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 bg-gray-50 p-4 rounded-lg">
                      No page access assigned
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaEdit className="text-green-600" />
                  Edit Staff Member
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={editData.fullName || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={editData.mobileNumber || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={editData.role || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map((roleItem, index) => (
                        <option key={index} value={roleItem}>
                          {roleItem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={editData.status || 'active'}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={editData.age || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Page Access */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Access
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onChange={handlePageAccessChange}
                  >
                    <option value="">Select a page to add access</option>
                    {Object.keys(pageNames).map((path) => (
                      <option key={path} value={path}>
                        {pageNames[path]}
                      </option>
                    ))}
                  </select>
                  
                  {/* Display selected pages */}
                  {editData.pagesAccess && editData.pagesAccess.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Selected Pages ({editData.pagesAccess.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditData(prev => ({ ...prev, pagesAccess: [] }))}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <FaTrash size={14} /> Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editData.pagesAccess.map((page, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center shadow-sm">
                            <span className="mr-2">{pageNames[page] || page}</span>
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800 text-lg font-bold"
                              onClick={() => removePageAccess(page)}
                              title="Remove page"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Salary Modal */}
      {showSalaryModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-600" />
                  Add Salary
                </h3>
                <button
                  onClick={() => setShowSalaryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {/* User Info Display */}
              {userInfo.role === "subadmin" && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    You are adding salary as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedStaff.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedStaff.role}</p>
                </div>

                <form onSubmit={handleSalarySubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₹)
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="amount"
                          value={salaryData.amount}
                          onChange={handleSalaryInputChange}
                          placeholder="Enter salary amount"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month
                      </label>
                      <select
                        name="month"
                        value={salaryData.month}
                        onChange={handleSalaryInputChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Month</option>
                        {monthOptions.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={salaryData.status}
                        onChange={handleSalaryInputChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowSalaryModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Salary
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary History Modal */}
      {showSalaryHistoryModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaMoneyBillWave className="text-blue-600" />
                  Salary History - {selectedStaff.fullName}
                </h3>
                <button
                  onClick={() => setShowSalaryHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {salaryHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FaMoneyBillWave className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No salary records found</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {salaryHistory.map((salary, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-lg font-bold text-gray-900">₹{salary.amount}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <FaCalendarAlt size={12} />
                                {salary.month}
                              </div>
                            </div>
                            <SalaryStatusBadge status={salary.status} />
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(salary.date).toLocaleDateString()}
                            {salary.note && (
                              <div className="mt-1 text-blue-600 italic">
                                {salary.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center text-sm text-gray-500">
                      Showing {salaryHistory.length} salary records
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowSalaryHistoryModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaTrash className="text-red-600" />
                  Delete Staff Member
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">⚠️ Warning: This action cannot be undone!</p>
                  <p className="text-sm text-red-600 mt-1">
                    Are you sure you want to delete this staff member? All their data will be permanently removed.
                  </p>
                </div>

                {userInfo.role === "subadmin" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      This deletion will be recorded under your name: <strong>{userInfo.name}</strong>
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Staff
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

// Helper component for detail items
const DetailItem = ({ label, value, className = "" }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
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
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    red: "bg-red-50 border-red-200 text-red-700",
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

export default StaffList;