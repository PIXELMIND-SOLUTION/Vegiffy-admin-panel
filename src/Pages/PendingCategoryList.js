import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaImage, 
  FaList, 
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaUpload,
  FaCheck,
  FaTimesCircle,
  FaClock,
  FaUser,
  FaInfoCircle,
  FaHistory
} from 'react-icons/fa';

const PendingCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [userInfo, setUserInfo] = useState({ role: 'unknown', name: '', email: '', id: '' });
  
  // Edit states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editFormData, setEditFormData] = useState({
    categoryName: '',
    image: null,
    imagePreview: '',
    status: 'pending'
  });
  const [editSubcategoryFormData, setEditSubcategoryFormData] = useState({
    subcategoryName: '',
    image: null,
    imagePreview: '',
    status: 'pending'
  });

  // Get user info on component mount
  useEffect(() => {
    getUserInfo();
    fetchPendingCategories();
  }, []);

  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("adminName");
      const email = localStorage.getItem("adminEmail");
      const id = localStorage.getItem("adminId");
      
      setUserInfo({
        role: role || "unknown",
        name: name || "",
        email: email || "",
        id: id || ""
      });
    } catch (error) {
      console.error("Error getting user info:", error);
    }
  };

  // Get subAdminId for API calls
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

  // Fetch pending categories from API
  const fetchPendingCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.vegiffyy.com/api/category');
      if (response.data.success) {
        // Filter categories with pending status or subcategories with pending status
        const pendingCategories = response.data.data
          .filter(category => {
            // Category itself is pending
            const isCategoryPending = category.status === 'pending';
            // OR has subcategories with pending status
            const hasPendingSubcategories = category.subcategories?.some(sub => 
              sub.status === 'pending' || !sub.status
            );
            return isCategoryPending || hasPendingSubcategories;
          })
          .map(category => ({
            ...category,
            // Filter subcategories that are pending or don't have status
            subcategories: category.subcategories?.filter(sub => 
              sub.status === 'pending' || !sub.status
            ) || []
          }))
          .filter(category => 
            // Keep category if it's pending OR has pending subcategories
            category.status === 'pending' || 
            category.subcategories.length > 0
          );
        
        setCategories(pendingCategories);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending categories');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this pending category?')) {
      return;
    }

    try {
      const subAdminId = getSubAdminId();
      const config = {
        headers: { 'Content-Type': 'application/json' },
        data: subAdminId ? { subAdminId } : {}
      };

      const response = await axios.delete(
        `https://api.vegiffyy.com/api/category/${categoryId}`,
        config
      );
      
      if (response.data.success) {
        alert('Pending category deleted successfully!');
        fetchPendingCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete pending category');
    }
  };

  // Delete subcategory
  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    if (!window.confirm('Are you sure you want to delete this pending subcategory?')) {
      return;
    }

    try {
      const subAdminId = getSubAdminId();
      const config = {
        headers: { 'Content-Type': 'application/json' },
        data: subAdminId ? { subAdminId } : {}
      };

      const response = await axios.delete(
        `https://api.vegiffyy.com/api/category/${categoryId}/subcategory/${subcategoryId}`,
        config
      );
      
      if (response.data.success) {
        alert('Pending subcategory deleted successfully!');
        fetchPendingCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete pending subcategory');
    }
  };

  // Category Edit Functions
  const handleEditCategory = (category) => {
    setEditingCategory(category._id);
    setEditFormData({
      categoryName: category.categoryName,
      image: null,
      imagePreview: category.imageUrl,
      status: category.status || 'pending'
    });
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditFormData({
      categoryName: '',
      image: null,
      imagePreview: '',
      status: 'pending'
    });
  };

  const handleEditCategoryChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setEditFormData(prev => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0])
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      const formData = new FormData();
      formData.append('categoryName', editFormData.categoryName);
      formData.append('status', editFormData.status);
      
      if (editFormData.image) {
        formData.append('image', editFormData.image);
      }
      
      // Add subAdminId if user is subadmin
      const subAdminId = getSubAdminId();
      if (subAdminId) {
        formData.append('subAdminId', subAdminId);
      }

      const response = await axios.put(
        `https://api.vegiffyy.com/api/category/${categoryId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        alert('Pending category updated successfully!');
        setEditingCategory(null);
        fetchPendingCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pending category');
    }
  };

  // Subcategory Edit Functions
  const handleEditSubcategory = (subcategory) => {
    setEditingSubcategory(subcategory._id);
    setEditSubcategoryFormData({
      subcategoryName: subcategory.subcategoryName,
      image: null,
      imagePreview: subcategory.subcategoryImageUrl,
      status: subcategory.status || 'pending'
    });
  };

  const handleCancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setEditSubcategoryFormData({
      subcategoryName: '',
      image: null,
      imagePreview: '',
      status: 'pending'
    });
  };

  const handleEditSubcategoryChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setEditSubcategoryFormData(prev => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0])
      }));
    } else {
      setEditSubcategoryFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateSubcategory = async (categoryId, subcategoryId) => {
    try {
      const formData = new FormData();
      formData.append('subcategoryName', editSubcategoryFormData.subcategoryName);
      formData.append('status', editSubcategoryFormData.status);
      
      if (editSubcategoryFormData.image) {
        formData.append('image', editSubcategoryFormData.image);
      }
      
      // Add subAdminId if user is subadmin
      const subAdminId = getSubAdminId();
      if (subAdminId) {
        formData.append('subAdminId', subAdminId);
      }

      const response = await axios.put(
        `https://api.vegiffyy.com/api/category/${categoryId}/subcategory/${subcategoryId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        alert('Pending subcategory updated successfully!');
        setEditingSubcategory(null);
        fetchPendingCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pending subcategory');
    }
  };

  // Approve category
  const approveCategory = async (categoryId) => {
    try {
      const formData = new FormData();
      formData.append('status', 'active');
      
      // Add subAdminId if user is subadmin (for approval tracking)
      const subAdminId = getSubAdminId();
      if (subAdminId) {
        formData.append('subAdminId', subAdminId);
      }

      const response = await axios.put(
        `https://api.vegiffyy.com/api/category/${categoryId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        alert('Category approved successfully!');
        fetchPendingCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve category');
    }
  };

  // Approve subcategory
  const approveSubcategory = async (categoryId, subcategoryId) => {
    try {
      const formData = new FormData();
      formData.append('status', 'active');
      
      // Add subAdminId if user is subadmin
      const subAdminId = getSubAdminId();
      if (subAdminId) {
        formData.append('subAdminId', subAdminId);
      }

      const response = await axios.put(
        `https://api.vegiffyy.com/api/category/${categoryId}/subcategory/${subcategoryId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        alert('Subcategory approved successfully!');
        fetchPendingCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve subcategory');
    }
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
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

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'inactive': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'pending': return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaClock className="text-orange-600" />
                Pending Categories
              </h1>
              <p className="text-gray-600 mt-2">Manage pending categories and subcategories awaiting approval</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                <FaUser className="text-orange-600" />
                <div className="text-sm">
                  <div className="font-medium">{userInfo.name || 'Admin'}</div>
                  <div className="text-xs text-gray-500">{userInfo.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FaCheck className="mx-auto text-4xl text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600 mb-4">No pending categories or subcategories found.</p>
              <p className="text-sm text-gray-500">All items are approved and active.</p>
            </div>
          ) : (
            categories.map((category) => {
              const statusColor = getStatusColor(category.status);
              return (
                <div
                  key={category._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  {/* Category Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Category Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={editingCategory === category._id ? editFormData.imagePreview : category.imageUrl}
                            alt={category.categoryName}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                            }}
                          />
                        </div>
                        
                        {/* Category Info or Edit Form */}
                        <div className="flex-1 min-w-0">
                          {editingCategory === category._id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Category Name *
                                </label>
                                <input
                                  type="text"
                                  name="categoryName"
                                  value={editFormData.categoryName}
                                  onChange={handleEditCategoryChange}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Status *
                                </label>
                                <select
                                  name="status"
                                  value={editFormData.status}
                                  onChange={handleEditCategoryChange}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  required
                                >
                                  <option value="pending">Pending</option>
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Update Image
                                </label>
                                <input
                                  type="file"
                                  name="image"
                                  onChange={handleEditCategoryChange}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  accept="image/*"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateCategory(category._id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2 text-sm"
                                >
                                  <FaSave className="text-sm" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEditCategory}
                                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center gap-2 text-sm"
                                >
                                  <FaTimes className="text-sm" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold text-gray-900 truncate">
                                  {category.categoryName}
                                </h3>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}
                                >
                                  {getStatusText(category.status)}
                                </span>
                              </div>
                              
                              {category.note && (
                                <div className="flex items-start gap-2">
                                  <FaInfoCircle className="text-orange-500 mt-0.5" />
                                  <p className="text-sm text-gray-600">{category.note}</p>
                                </div>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <FaList className="text-xs" />
                                  {category.subcategories?.length || 0} pending subcategories
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaHistory className="text-xs" />
                                  Created: {formatDate(category.createdAt)}
                                </span>
                                {category.updatedAt && category.updatedAt !== category.createdAt && (
                                  <span className="flex items-center gap-1">
                                    <FaHistory className="text-xs" />
                                    Updated: {formatDate(category.updatedAt)}
                                  </span>
                                )}
                              </div>
                              
                              {category.createdBy && (
                                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                  <span className="font-medium">Created by Sub-admin:</span> ID: {category.createdBy}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {editingCategory !== category._id && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {category.status === 'pending' && (
                            <button
                              onClick={() => approveCategory(category._id)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition duration-200"
                              title="Approve Category"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button
                            onClick={() => toggleCategoryExpansion(category._id)}
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition duration-200"
                            title={expandedCategory === category._id ? 'Collapse' : 'Expand'}
                          >
                            {expandedCategory === category._id ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition duration-200"
                            title="Edit Category"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition duration-200"
                            title="Delete Category"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subcategories Section */}
                  {expandedCategory === category._id && category.subcategories && category.subcategories.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <FaList className="text-orange-600" />
                          Pending Subcategories ({category.subcategories.length})
                        </h4>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          {category.subcategories.map((subcategory) => {
                            const subStatus = subcategory.status || 'pending';
                            const subStatusColor = getStatusColor(subStatus);
                            
                            return (
                              <div
                                key={subcategory._id}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-300 transition duration-200"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {/* Subcategory Image */}
                                    <div className="flex-shrink-0">
                                      {editingSubcategory === subcategory._id ? (
                                        <img
                                          src={editSubcategoryFormData.imagePreview}
                                          alt="Edit Preview"
                                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                          onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                          }}
                                        />
                                      ) : (
                                        <img
                                          src={subcategory.subcategoryImageUrl}
                                          alt={subcategory.subcategoryName}
                                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                          onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                          }}
                                        />
                                      )}
                                    </div>
                                    
                                    {/* Subcategory Info or Edit Form */}
                                    <div className="flex-1 min-w-0">
                                      {editingSubcategory === subcategory._id ? (
                                        <div className="space-y-3">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Subcategory Name *
                                            </label>
                                            <input
                                              type="text"
                                              name="subcategoryName"
                                              value={editSubcategoryFormData.subcategoryName}
                                              onChange={handleEditSubcategoryChange}
                                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Status *
                                            </label>
                                            <select
                                              name="status"
                                              value={editSubcategoryFormData.status}
                                              onChange={handleEditSubcategoryChange}
                                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                              required
                                            >
                                              <option value="pending">Pending</option>
                                              <option value="active">Active</option>
                                              <option value="inactive">Inactive</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Update Image
                                            </label>
                                            <input
                                              type="file"
                                              name="image"
                                              onChange={handleEditSubcategoryChange}
                                              className="w-full p-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                              accept="image/*"
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleUpdateSubcategory(category._id, subcategory._id)}
                                              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition duration-200 flex items-center gap-1"
                                            >
                                              <FaSave className="text-xs" />
                                              Save
                                            </button>
                                            <button
                                              onClick={handleCancelEditSubcategory}
                                              className="bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition duration-200 flex items-center gap-1"
                                            >
                                              <FaTimes className="text-xs" />
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <h5 className="font-medium text-gray-900 truncate">
                                              {subcategory.subcategoryName || 'Unnamed Subcategory'}
                                            </h5>
                                            <span
                                              className={`px-2 py-1 rounded-full text-xs font-medium ${subStatusColor.bg} ${subStatusColor.text} border ${subStatusColor.border}`}
                                            >
                                              {getStatusText(subStatus)}
                                            </span>
                                          </div>
                                          
                                          {!subcategory.subcategoryName && (
                                            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                                              <FaInfoCircle className="inline mr-1" />
                                              Subcategory name is empty
                                            </div>
                                          )}
                                          
                                          {!subcategory.subcategoryImageUrl && (
                                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                                              <FaImage className="inline mr-1" />
                                              No image uploaded
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  {editingSubcategory !== subcategory._id && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {subStatus === 'pending' && (
                                        <button
                                          onClick={() => approveSubcategory(category._id, subcategory._id)}
                                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition duration-200"
                                          title="Approve Subcategory"
                                        >
                                          <FaCheck className="text-sm" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleEditSubcategory(subcategory)}
                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition duration-200"
                                        title="Edit Subcategory"
                                      >
                                        <FaEdit className="text-sm" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSubcategory(category._id, subcategory._id)}
                                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition duration-200"
                                        title="Delete Subcategory"
                                      >
                                        <FaTrash className="text-sm" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Stats Footer */}
        {categories.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
                <div className="text-gray-600">Pending Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categories.filter(cat => cat.status === 'active').length}
                </div>
                <div className="text-gray-600">Active Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0)}
                </div>
                <div className="text-gray-600">Total Pending Subs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {categories.filter(cat => cat.subcategories?.length > 0).length}
                </div>
                <div className="text-gray-600">Categories with Subs</div>
              </div>
            </div>
            
            {/* Extra Info */}
           
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingCategoryList;