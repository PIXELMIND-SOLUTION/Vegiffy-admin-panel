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
  FaShoppingBag,
  FaWallet,
  FaUsers,
  FaFilePdf,
  FaDownload,
  FaIdCard,
  FaCalendarAlt,
  FaQuestionCircle,
  FaLightbulb,
  FaBullseye,
  FaChartLine,
  FaTag,
  FaFileArchive,
  FaFileImage,
  FaFilter,
  FaFileExport,
  FaSearch,
  FaPercentage,
  FaCrown,
  FaCalendar,
  FaShieldAlt,
  FaChartBar,
  FaCopy,
  FaExternalLinkAlt,
  FaRegCalendarCheck,
  FaRegCalendarTimes,
  FaBox,
  FaReceipt,
  FaChartPie,
  FaUserShield,
  FaInfoCircle
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AmbassadorList = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [filteredAmbassadors, setFilteredAmbassadors] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    city: "all",
    kycStatus: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  
  // Available cities for filter
  const [cities, setCities] = useState([]);

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
      const response = await axios.get("https://api.vegiffyy.com/api/ambsdor/allambsdor");
      setAmbassadors(response.data.data);
      setFilteredAmbassadors(response.data.data);
      
      // Extract unique cities for filter
      const uniqueCities = [...new Set(response.data.data
        .map(amb => amb.city)
        .filter(city => city)
      )];
      setCities(uniqueCities);
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

  // Apply filters
  useEffect(() => {
    let result = [...ambassadors];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(amb =>
        amb.fullName?.toLowerCase().includes(searchLower) ||
        amb.email?.toLowerCase().includes(searchLower) ||
        amb.mobileNumber?.includes(searchLower) ||
        amb.referralCode?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(amb => amb.status === filters.status);
    }

    // City filter
    if (filters.city !== "all") {
      result = result.filter(amb => amb.city === filters.city);
    }

    // KYC Status filter
    if (filters.kycStatus !== "all") {
      result = result.filter(amb => amb.kycStatus === filters.kycStatus);
    }

    // Sorting
    result.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];
      
      if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAmbassadors(result);
  }, [filters, ambassadors]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      city: "all",
      kycStatus: "all",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Mobile",
      "City",
      "Status",
      "Commission %",
      "Wallet Balance",
      "KYC Status",
      "Joined Date",
      "Updated By",
      "Note"
    ];

    const data = filteredAmbassadors.map(amb => [
      amb._id,
      amb.fullName || "",
      amb.email || "",
      amb.mobileNumber || "",
      amb.city || "",
      amb.status || "",
      amb.commissionPercentage || 0,
      amb.wallet || 0,
      amb.kycStatus || "",
      new Date(amb.createdAt).toLocaleDateString(),
      amb.updatedBy || "",
      amb.note || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...data.map(row => row.map(cell => 
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ambassadors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  // Handle View
  const handleView = (ambassador) => {
    setViewData(ambassador);
    setShowViewModal(true);
  };

  // Handle Edit with subAdminId
  const handleEdit = (ambassador) => {
    setEditData({...ambassador});
    setShowEditModal(true);
  };

  // Handle Delete with subAdminId
  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`https://api.vegiffyy.com/api/ambsdor/delete-ambsdor/${deleteId}`, config);
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
      }

      await axios.put(
        `https://api.vegiffyy.com/api/ambsdor/update-ambsdor/${editData._id}`,
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

  // Download Document
  const downloadDocument = (url, fileName) => {
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Document downloading...");
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const getStatusInfo = (status) => {
      switch (status?.toLowerCase()) {
        case 'active':
          return { 
            color: 'bg-green-100 text-green-800 border border-green-200', 
            icon: FaCheckCircle 
          };
        case 'inactive':
          return { 
            color: 'bg-red-100 text-red-800 border border-red-200', 
            icon: FaTimesCircle 
          };
        case 'pending':
          return { 
            color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
            icon: FaClock 
          };
        default:
          return { 
            color: 'bg-gray-100 text-gray-800 border border-gray-200', 
            icon: FaClock 
          };
      }
    };

    const { color, icon: Icon } = getStatusInfo(status);
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        <Icon className="text-sm" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // KYC Status Badge Component
  const KYCStatusBadge = ({ status }) => {
    const getKYCStatusInfo = (status) => {
      switch (status?.toLowerCase()) {
        case 'verified':
          return { 
            color: 'bg-green-100 text-green-800 border border-green-200', 
            icon: FaCheckCircle, 
            text: 'Verified' 
          };
        case 'pending':
        case 'under_review':
          return { 
            color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
            icon: FaClock, 
            text: 'Pending Review' 
          };
        case 'rejected':
          return { 
            color: 'bg-red-100 text-red-800 border border-red-200', 
            icon: FaTimesCircle, 
            text: 'Rejected' 
          };
        default:
          return { 
            color: 'bg-gray-100 text-gray-800 border border-gray-200', 
            icon: FaClock, 
            text: 'Not Submitted' 
          };
      }
    };

    const { color, icon: Icon, text } = getKYCStatusInfo(status);
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        <Icon className="text-sm" />
        {text}
      </span>
    );
  };

  // Plan Status Badge
  const PlanStatusBadge = ({ isActive, expiryDate }) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
          <FaTimesCircle className="text-xs" />
          Inactive
        </span>
      );
    }
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
          <FaRegCalendarTimes className="text-xs" />
          Expired
        </span>
      );
    } else if (daysLeft <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
          <FaClock className="text-xs" />
          Expires in {daysLeft} days
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          <FaRegCalendarCheck className="text-xs" />
          Active ({daysLeft} days left)
        </span>
      );
    }
  };

  // Get current user info
  const userInfo = getUserInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ambassadors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ambassador Management</h1>
              <p className="text-gray-600 mt-1">Manage and track all ambassador activities</p>
              
              {/* User Role Display */}
              <div className="mt-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  userInfo.role === "subadmin" 
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                }`}>
                  <FaUserShield className="text-sm" />
                  {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                Total: <span className="font-bold">{filteredAmbassadors.length}</span>
              </div>
              <button
                onClick={fetchAmbassadors}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {/* Sub-Admin Note */}
          {userInfo.role === "subadmin" && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <FaInfoCircle />
                <strong>Note:</strong> All updates will be recorded under your name: <strong>{userInfo.name}</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search ambassadors..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaFilter />
              Filter
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaFileExport />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ambassador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAmbassadors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FaUserFriends className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p>No ambassadors found</p>
                      {filters.search && (
                        <p className="text-sm mt-1">Try changing your search criteria</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAmbassadors.map((ambassador) => {
                  const activePlan = ambassador.purchasedPlans?.find(p => p.isActive);
                  
                  return (
                    <tr key={ambassador._id} className="hover:bg-gray-50">
                      {/* Ambassador Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {ambassador.profileImage ? (
                            <img
                              src={ambassador.profileImage}
                              alt={ambassador.fullName}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <FaUser className="text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{ambassador.fullName}</div>
                            <div className="text-sm text-gray-500">
                              {ambassador.city && (
                                <span className="flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-xs" />
                                  {ambassador.city}
                                </span>
                              )}
                            </div>
                            {ambassador.note && (
                              <div className="text-xs text-blue-600 mt-0.5 italic">
                                {ambassador.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <FaEnvelope className="text-gray-400" />
                            <span className="text-gray-900 truncate max-w-[180px]">{ambassador.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaPhone className="text-gray-400" />
                            <span className="text-gray-900">{ambassador.mobileNumber}</span>
                          </div>
                          {ambassador.referralCode && (
                            <div className="text-xs text-gray-500">
                              Code: {ambassador.referralCode}
                            </div>
                          )}
                          {ambassador.updatedBy && (
                            <div className="text-xs text-purple-600">
                              Updated by: {ambassador.updatedBy}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Performance Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="font-bold text-gray-900">{ambassador.orderCount || 0}</div>
                              <div className="text-xs text-gray-500">Orders</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-gray-900">{ambassador.users?.length || 0}</div>
                              <div className="text-xs text-gray-500">Users</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-gray-900">₹{ambassador.wallet?.toFixed(2) || '0.00'}</div>
                              <div className="text-xs text-gray-500">Wallet</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaPercentage className="text-green-500" />
                            <span className="font-medium text-green-700">{ambassador.commissionPercentage || 0}% Commission</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div>
                            <StatusBadge status={ambassador.status} />
                          </div>
                          <div>
                            <KYCStatusBadge status={ambassador.kycStatus} />
                          </div>
                          {activePlan && (
                            <div className="flex items-center gap-2 text-xs">
                              <FaCrown className="text-yellow-500" />
                              <span className="text-gray-700">{activePlan.planName}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(ambassador)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEdit(ambassador)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(ambassador._id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {viewData.profileImage ? (
                    <img
                      src={viewData.profileImage}
                      alt={viewData.fullName}
                      className="w-16 h-16 rounded-full border-4 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                      <FaUserFriends className="text-2xl" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{viewData.fullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={viewData.status} />
                      <KYCStatusBadge status={viewData.kycStatus} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* User Info Display */}
              {userInfo.role === "subadmin" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Viewing as <strong>{userInfo.name}</strong> (Sub-Admin)
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaUser className="text-indigo-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Email</label>
                          <div className="mt-1 text-gray-900">{viewData.email}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <div className="mt-1 text-gray-900">{viewData.mobileNumber}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Gender</label>
                          <div className="mt-1 text-gray-900">{viewData.gender || 'Not set'}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 flex items-center gap-2">
                            <FaBirthdayCake className="text-pink-500" />
                            Date of Birth
                          </label>
                          <div className="mt-1 text-gray-900">
                            {viewData.dateOfBirth ? new Date(viewData.dateOfBirth).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Not set'}
                          </div>
                        </div>
                      </div>
                      {viewData.note && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="text-sm font-medium text-yellow-800">Note:</div>
                          <div className="text-yellow-700 text-sm">{viewData.note}</div>
                        </div>
                      )}
                      {viewData.updatedBy && (
                        <div>
                          <label className="text-sm text-gray-600">Last Updated By</label>
                          <div className="mt-1 text-gray-900">{viewData.updatedBy}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-600" />
                      Location Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">City</label>
                        <div className="mt-1 text-gray-900">{viewData.city || 'Not set'}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Area</label>
                        <div className="mt-1 text-gray-900">{viewData.area || 'Not set'}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-gray-600">Pincode</label>
                        <div className="mt-1 text-gray-900">{viewData.pincode || 'Not set'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Commission Info */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaPercentage className="text-green-600" />
                      Commission Information
                    </h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-800 mb-2">{viewData.commissionPercentage || 0}%</div>
                      <div className="text-sm text-green-700">Commission Rate</div>
                      {viewData.wallet && viewData.commissionPercentage && (
                        <div className="mt-4">
                          <div className="text-sm text-gray-600">Potential Earnings</div>
                          <div className="text-2xl font-bold text-green-800">
                            ₹{((viewData.wallet * (viewData.commissionPercentage || 0)) / 100).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Media */}
                  {(viewData.instagram || viewData.facebook || viewData.twitter) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaUserFriends className="text-purple-600" />
                        Social Media
                      </h3>
                      <div className="space-y-3">
                        {viewData.instagram && (
                          <a 
                            href={viewData.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                          >
                            <FaInstagram className="text-pink-600" />
                            <span className="text-gray-900">Instagram</span>
                            <FaExternalLinkAlt className="ml-auto text-gray-400" />
                          </a>
                        )}
                        {viewData.facebook && (
                          <a 
                            href={viewData.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <FaFacebook className="text-blue-600" />
                            <span className="text-gray-900">Facebook</span>
                            <FaExternalLinkAlt className="ml-auto text-gray-400" />
                          </a>
                        )}
                        {viewData.twitter && (
                          <a 
                            href={viewData.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                          >
                            <FaTwitter className="text-sky-500" />
                            <span className="text-gray-900">Twitter</span>
                            <FaExternalLinkAlt className="ml-auto text-gray-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Performance Stats */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaChartBar className="text-green-600" />
                      Performance Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{viewData.orderCount || 0}</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{viewData.users?.length || 0}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">₹{viewData.wallet?.toFixed(2) || '0.00'}</div>
                        <div className="text-sm text-gray-600">Wallet Balance</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{viewData.commissionPercentage || 0}%</div>
                        <div className="text-sm text-gray-600">Commission Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* KYC Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaShieldAlt className="text-yellow-600" />
                      KYC Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <KYCStatusBadge status={viewData.kycStatus} />
                        {viewData.kycVerifiedAt && (
                          <div className="text-sm text-gray-600">
                            Verified: {new Date(viewData.kycVerifiedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {viewData.kycRejectionReason && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-sm font-medium text-red-800">Rejection Reason:</div>
                          <div className="text-red-700">{viewData.kycRejectionReason}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaIdCard className="text-blue-600" />
                      Documents
                    </h3>
                    <div className="space-y-3">
                      {viewData.aadharCardFront && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FaFileImage className="text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">Aadhar Card (Front)</div>
                              <div className="text-sm text-gray-600">Identity Document</div>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadDocument(viewData.aadharCardFront, `${viewData.fullName}_Aadhar_Front.pdf`)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            <FaDownload className="inline mr-1" />
                            Download
                          </button>
                        </div>
                      )}
                      {viewData.aadharCardBack && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FaFileImage className="text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">Aadhar Card (Back)</div>
                              <div className="text-sm text-gray-600">Identity Document</div>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadDocument(viewData.aadharCardBack, `${viewData.fullName}_Aadhar_Back.pdf`)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            <FaDownload className="inline mr-1" />
                            Download
                          </button>
                        </div>
                      )}
                      {viewData.panCard && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FaFileImage className="text-green-600" />
                            <div>
                              <div className="font-medium text-gray-900">PAN Card</div>
                              <div className="text-sm text-gray-600">Tax Identity Document</div>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadDocument(viewData.panCard, `${viewData.fullName}_PAN_Card.pdf`)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            <FaDownload className="inline mr-1" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Purchased Plans */}
                  {viewData.purchasedPlans && viewData.purchasedPlans.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaCrown className="text-yellow-600" />
                        Purchased Plans ({viewData.purchasedPlans.length})
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {viewData.purchasedPlans.map((plan, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium text-gray-900">{plan.planName}</div>
                                <PlanStatusBadge 
                                  isActive={plan.isActive} 
                                  expiryDate={plan.expiryDate} 
                                />
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">₹{plan.totalAmount?.toFixed(2)}</div>
                                <div className="text-sm text-gray-600">Total</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="text-gray-600">Purchased</div>
                                <div>{plan.purchaseDate ? new Date(plan.purchaseDate).toLocaleDateString() : 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Expires</div>
                                <div>{plan.expiryDate ? new Date(plan.expiryDate).toLocaleDateString() : 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction History */}
              {viewData.transactionHistory && viewData.transactionHistory.length > 0 && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Transaction History ({viewData.transactionHistory.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Order ID</th>
                          <th className="px-4 py-2 text-left">Total</th>
                          <th className="px-4 py-2 text-left">Commission</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewData.transactionHistory.map((transaction, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 font-mono">{transaction.orderId?.slice(-8) || 'N/A'}</td>
                            <td className="px-4 py-2 text-green-600 font-medium">₹{transaction.totalPayable?.toFixed(2)}</td>
                            <td className="px-4 py-2 text-blue-600 font-medium">₹{transaction.commission?.toFixed(2)}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.status || 'pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  ID: <span className="font-mono">{viewData._id}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditData({...viewData});
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Edit Ambassador
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Ambassador</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
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

              <form onSubmit={handleFormSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Percentage *
                    </label>
                    <input
                      type="number"
                      name="commissionPercentage"
                      value={editData?.commissionPercentage || 0}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={editData?.status || 'pending'}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KYC Status
                    </label>
                    <select
                      name="kycStatus"
                      value={editData?.kycStatus || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Not Submitted</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {editData.kycStatus === 'rejected' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        KYC Rejection Reason
                      </label>
                      <textarea
                        name="kycRejectionReason"
                        value={editData?.kycRejectionReason || ''}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter reason for KYC rejection"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filter Ambassadors</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KYC Status
                  </label>
                  <select
                    name="kycStatus"
                    value={filters.kycStatus}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All KYC Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    resetFilters();
                    setShowFilterModal(false);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Ambassador
                </h3>
                <p className="text-gray-600 text-sm mb-6">
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

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbassadorList;