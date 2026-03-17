import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiX, FiDownload, FiCheckCircle, FiXCircle, FiToggleLeft, FiToggleRight, FiUser } from "react-icons/fi";
import axios from "axios";

const ActiveVendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);

  // For Edit Popup
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editVendor, setEditVendor] = useState(null);

  const itemsPerPage = 10;

  // API base URL
  const API_BASE_URL = "https://api.vegiffyy.com/api";

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

  // Fetch active vendors with pagination
  const fetchActiveVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/restaurant`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
        },
      });
      
      if (res.data?.success) {
        // Filter only active vendors
        const activeVendors = res.data.data.filter(vendor => 
          vendor.status === "active"
        );
        
        setVendors(activeVendors);
        setTotalPages(res.data.totalPages || 1);
        setTotalVendors(activeVendors.length);
      } else {
        setError("Failed to load vendors");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVendors();
  }, [currentPage, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleEdit = (vendor) => {
    setEditVendor({ ...vendor });
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      const res = await axios.delete(`${API_BASE_URL}/restaurant/${id}`, config);
      if (res.data?.success) {
        // If we're on the last page and deleting the last item, go to previous page
        if (vendors.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchActiveVendors();
        }
      } else {
        alert(res.data?.message || "Delete failed");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Server error");
    }
  };

  // Toggle vendor status between active and inactive using new API
  const handleStatusToggle = async (vendor) => {
    const newStatus = vendor.status === "active" ? "inactive" : "active";
    
    try {
      const subAdminId = getSubAdminId();
      const requestData = { status: newStatus };
      
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      const res = await axios.put(
        `${API_BASE_URL}/vendor/vendorstatus/${vendor._id}`,
        requestData
      );
      if (res.data?.success) {
        // Show success message
        alert(`Vendor status updated to ${newStatus} successfully`);
        fetchActiveVendors();
      } else {
        alert(res.data?.message || "Status update failed");
      }
    } catch (err) {
      console.error("Status toggle error:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Server error");
    }
  };

  // Handle edit vendor (full update)
  const handleSaveEdit = async () => {
    if (!editVendor) return;

    try {
      const subAdminId = getSubAdminId();
      const requestData = {
        restaurantName: editVendor.restaurantName,
        locationName: editVendor.locationName,
        mobile: editVendor.mobile,
        rating: editVendor.rating,
        startingPrice: editVendor.startingPrice,
        status: editVendor.status,
        // Add other fields if needed
      };
      
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      const res = await axios.put(
        `${API_BASE_URL}/restaurant/${editVendor._id}`,
        requestData
      );
      if (res.data?.success) {
        fetchActiveVendors();
        setIsEditOpen(false);
        setEditVendor(null);
        alert("Vendor updated successfully!");
      } else {
        alert(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("Edit error:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Server error");
    }
  };

  // CSV download logic
  const downloadCSV = () => {
    const headers = ["Name", "Location", "Mobile", "Email", "Rating", "Starting Price", "Status", "Vendor Since", "Last Updated By"];
    const rows = vendors.map(v => [
      `"${v.restaurantName}"`,
      `"${v.locationName}"`,
      v.mobile || "-",
      v.email || "-",
      v.rating || "-",
      `₹${v.startingPrice}`,
      v.status,
      new Date(v.createdAt).toLocaleDateString(),
      v.note || "Admin"
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `active_vendors_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Stats calculation
  const getStats = () => {
    const totalActive = vendors.length;
    const highRated = vendors.filter(v => v.rating >= 4).length;
    const withContact = vendors.filter(v => v.mobile).length;
    
    return { totalActive, highRated, withContact };
  };

  const stats = getStats();
  const userInfo = getUserInfo();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Active Vendors Management</h1>
                <p className="text-gray-600">Manage all active restaurant vendors</p>
              </div>
            </div>
            
            {/* User Role Display */}
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                userInfo.role === "subadmin" 
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}>
                <FiUser className="inline mr-1" size={14} />
                {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 p-2 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{stats.totalActive}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{stats.highRated}</p>
                  <p className="text-xs text-gray-600">4+ Stars</p>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{stats.withContact}</p>
                  <p className="text-xs text-gray-600">With Contact</p>
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

        {/* Search and Actions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by vendor name, location, mobile..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
                />
              </div>
            </div>

            {/* Download CSV Button */}
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiDownload size={18} /> Export CSV
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing {vendors.length} of {totalVendors} active vendors
              {searchQuery && ` for "${searchQuery}"`}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading active vendors...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
                <p className="font-medium">Error loading vendors</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={fetchActiveVendors}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <FiXCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active vendors found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'No active vendors match your search' : 'All vendors are currently inactive or pending'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear search
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
                        Vendor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Starting Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendors.map((v) => (
                      <tr key={v._id} className="hover:bg-green-50 transition-colors">
                        {/* Vendor Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={v.image?.url}
                              alt={v.restaurantName}
                              className="h-12 w-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/64x48?text=No+Image";
                              }}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {v.restaurantName}
                              </div>
                              <div className="text-xs text-gray-500">
                                Since {new Date(v.createdAt).toLocaleDateString()}
                              </div>
                              {v.note && (
                                <div className="text-xs text-blue-600 mt-1 italic">
                                  {v.note}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-gray-700">{v.locationName}</td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">{v.mobile || '-'}</div>
                            {v.email && (
                              <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                {v.email}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {v.rating ? (
                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                              ⭐ {v.rating}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not rated</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="font-semibold text-green-700">₹{v.startingPrice}</span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                            <button
                              onClick={() => handleStatusToggle(v)}
                              className="text-gray-400 hover:text-green-600 transition-colors p-1"
                              title="Toggle Status"
                            >
                              {v.status === "active" ? 
                                <FiToggleRight className="text-xl text-green-500" /> : 
                                <FiToggleLeft className="text-xl" />
                              }
                            </button>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(v)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Vendor"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(v._id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Vendor"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                    Page {currentPage} of {totalPages} • {totalVendors} active vendors
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                    >
                      <FiX className="w-3 h-3" /> First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                    >
                      ← Previous
                    </button>

                    <div className="flex space-x-1">
                      {getPageNumbers().map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border text-sm min-w-[40px] ${
                            currentPage === page
                              ? "bg-green-600 text-white border-green-600"
                              : "border-gray-300 hover:bg-green-50"
                          } rounded-lg`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                    >
                      Next →
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                    >
                      Last <FiX className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && editVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiEdit className="text-green-600" />
                  Edit Vendor
                </h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={editVendor.restaurantName}
                    onChange={(e) =>
                      setEditVendor({ ...editVendor, restaurantName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={editVendor.locationName}
                    onChange={(e) =>
                      setEditVendor({ ...editVendor, locationName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editVendor.mobile || ''}
                    onChange={(e) =>
                      setEditVendor({ ...editVendor, mobile: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <input
                      type="number"
                      value={editVendor.rating || ''}
                      onChange={(e) =>
                        setEditVendor({ ...editVendor, rating: e.target.value })
                      }
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starting Price *
                    </label>
                    <input
                      type="number"
                      value={editVendor.startingPrice}
                      onChange={(e) =>
                        setEditVendor({ ...editVendor, startingPrice: e.target.value })
                      }
                      min="0"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editVendor.status}
                    onChange={(e) =>
                      setEditVendor({ ...editVendor, status: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                {editVendor.email && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Email: {editVendor.email}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveVendorList;