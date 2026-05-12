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
  FaEye,
  FaUser,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [userInfo, setUserInfo] = useState({ role: 'unknown', name: '', email: '', id: '' });
  
  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('');
  
  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  // Form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    image: null,
    imagePreview: '',
    status: 'active'
  });

  // Get user info on component mount
  useEffect(() => {
    getUserInfo();
    fetchCategories();
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

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.vegiffy.in/api/category');
      if (response.data.success) {
        setCategories(response.data.data);
        toast.success('Categories loaded successfully!', {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch categories';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal for category
  const confirmDeleteCategory = (categoryId, categoryName) => {
    setDeleteItem({ id: categoryId, name: categoryName });
    setDeleteType('category');
    setShowDeleteModal(true);
  };

  // Open delete confirmation modal for subcategory
  const confirmDeleteSubcategory = (categoryId, subcategoryId, subcategoryName) => {
    setDeleteItem({ categoryId, subcategoryId, name: subcategoryName });
    setDeleteType('subcategory');
    setShowDeleteModal(true);
  };

  // Handle delete after confirmation
  const handleDelete = async () => {
    if (!deleteItem) return;
    
    setDeleting(true);
    
    try {
      const subAdminId = getSubAdminId();
      
      let response;
      
      if (deleteType === 'category') {
        const config = {
          headers: { 'Content-Type': 'application/json' },
          data: subAdminId ? { subAdminId } : {}
        };
        
        response = await axios.delete(
          `https://api.vegiffy.in/api/category/${deleteItem.id}`,
          config
        );
      } else {
        const requestData = {
          subcategoryId: deleteItem.subcategoryId
        };
        
        if (subAdminId) {
          requestData.subAdminId = subAdminId;
        }
        
        response = await axios.delete(
          `https://api.vegiffy.in/api/category/${deleteItem.categoryId}`,
          { data: requestData }
        );
      }
      
      if (response.data.success) {
        toast.success(
          `${deleteType === 'category' ? 'Category' : 'Subcategory'} deleted successfully!`, 
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
        fetchCategories();
        setShowDeleteModal(false);
        setDeleteItem(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Failed to delete ${deleteType}`;
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
      });
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteItem(null);
    setDeleteType('');
  };

  // Popup Handlers
  const handleView = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setPopupType('view');
    setShowPopup(true);
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    
    if (type === 'category') {
      setEditFormData({
        name: item.categoryName || '',
        image: null,
        imagePreview: item.imageUrl || '',
        status: item.status || 'pending'
      });
    } else {
      setEditFormData({
        name: item.subcategoryName || '',
        image: null,
        imagePreview: item.subcategoryImageUrl || '',
        status: item.status || 'pending'
      });
    }
    
    setPopupType('edit');
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupType('');
    setSelectedItem(null);
    setItemType('');
    setEditFormData({
      name: '',
      image: null,
      imagePreview: '',
      status: 'pending'
    });
  };

  // Form Handlers
  const handleEditChange = (e) => {
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

  // UPDATE FUNCTION - According to Backend (subcategories array with index wise images)
  const handleUpdate = async () => {
    if (!selectedItem) return;
    
    try {
      const formData = new FormData();
      const subAdminId = getSubAdminId();
      
      if (itemType === 'category') {
        // ========== CATEGORY UPDATE ==========
        if (editFormData.name) {
          formData.append('categoryName', editFormData.name);
        }
        if (editFormData.status) {
          formData.append('status', editFormData.status);
        }
        
        if (editFormData.image && editFormData.image instanceof File) {
          formData.append('image', editFormData.image);
        }
        
        if (subAdminId && subAdminId !== 'null' && subAdminId !== 'undefined') {
          formData.append('subAdminId', subAdminId);
        }

        const response = await axios.put(
          `https://api.vegiffy.in/api/category/${selectedItem._id}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );

        if (response.data.success) {
          toast.success('Category updated successfully!');
          handleClosePopup();
          fetchCategories();
        } else {
          toast.error(response.data.message || 'Failed to update category');
        }
      } 
      else {
        // ========== SUBCATEGORY UPDATE ==========
        // Parent category find karo
        const parentCategory = categories.find(cat => 
          cat.subcategories?.some(sub => sub._id === selectedItem._id)
        );
        
        if (!parentCategory) {
          toast.error('Parent category not found');
          return;
        }

        // Get all current subcategories
        const currentSubcategories = [...parentCategory.subcategories];
        
        // Find index of the subcategory to update
        const subIndex = currentSubcategories.findIndex(sub => sub._id === selectedItem._id);
        
        if (subIndex === -1) {
          toast.error('Subcategory not found in parent category');
          return;
        }

        // Update the subcategory in the array
        currentSubcategories[subIndex] = {
          ...currentSubcategories[subIndex],
          subcategoryName: editFormData.name,
          status: editFormData.status
        };

        // Send subcategories as JSON string (as backend expects)
        formData.append('subcategories', JSON.stringify(currentSubcategories));
        
        // If new image is selected, send it with index
        if (editFormData.image && editFormData.image instanceof File) {
          formData.append(`subcategoryImage_${subIndex}`, editFormData.image);
        }
        
        if (subAdminId && subAdminId !== 'null' && subAdminId !== 'undefined') {
          formData.append('subAdminId', subAdminId);
        }

        // Call category update API with subcategories array
        const response = await axios.put(
          `https://api.vegiffy.in/api/category/${parentCategory._id}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );

        if (response.data.success) {
          toast.success('Subcategory updated successfully!');
          handleClosePopup();
          fetchCategories();
        } else {
          toast.error(response.data.message || 'Failed to update subcategory');
        }
      }
    } catch (err) {
      console.error('Update error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update';
      toast.error(errorMsg);
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (categoryId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(categoryId)) {
      newExpandedRows.delete(categoryId);
    } else {
      newExpandedRows.add(categoryId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'inactive': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  // Get status display text
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaList className="text-indigo-600 text-lg" />
                Categories
              </h1>
              <p className="text-gray-600 text-sm mt-1">Manage categories and subcategories</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs">
                <FaUser className="text-indigo-600 text-xs" />
                <div>
                  <div className="font-medium truncate max-w-[80px]">{userInfo.name || 'User'}</div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/categoryform'}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <FaPlus className="text-xs" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <FaImage className="mx-auto text-3xl text-gray-400 mb-3" />
              <h3 className="text-md font-medium text-gray-900 mb-1">No categories found</h3>
              <p className="text-gray-600 text-sm mb-3">Create your first category</p>
              <button
                onClick={() => window.location.href = '/categoryform'}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition duration-200 text-sm"
              >
                Create Category
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Subs
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Created By
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => {
                    const statusColor = getStatusColor(category.status);
                    return (
                      <React.Fragment key={category._id}>
                        {/* Main Category Row */}
                        <tr className="hover:bg-gray-50 transition duration-150">
                          <td className="px-3 py-2">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <img
                                  className="h-8 w-8 rounded object-cover border border-gray-200"
                                  src={category.imageUrl}
                                  alt={category.categoryName}
                                  onError={(e) => {
                                    e.target.src = '';
                                  }}
                                />
                              </div>
                              <div className="ml-2 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                  {category.categoryName}
                                </div>
                                {category.note && (
                                  <div className="text-xs text-gray-500 truncate max-w-[120px] flex items-center gap-1">
                                    <FaInfoCircle className="text-gray-400 text-[10px]" />
                                    <span className="truncate">{category.note}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                           </td>
                          
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}
                            >
                              {getStatusText(category.status)}
                            </span>
                           </td>
                          
                          <td className="px-3 py-2 text-center">
                            <div className="text-sm text-gray-900">
                              {category.subcategories?.length || 0}
                            </div>
                           </td>
                          
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                            {formatDate(category.createdAt)}
                           </td>
                          
                          <td className="px-3 py-2">
                            {category.createdBy ? (
                              <div className="text-xs">
                                <div className="text-gray-900 truncate">Sub-admin</div>
                                <div className="text-[10px] text-gray-500 truncate max-w-[80px]">ID: {category.createdBy}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Admin</span>
                            )}
                           </td>
                          
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleView(category, 'category')}
                                className="text-green-600 hover:text-green-900 transition duration-200 p-1 rounded hover:bg-green-50"
                                title="View"
                              >
                                <FaEye className="text-xs" />
                              </button>
                              
                              <button
                                onClick={() => handleEdit(category, 'category')}
                                className="text-blue-600 hover:text-blue-900 transition duration-200 p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              
                              <button
                                onClick={() => toggleRowExpansion(category._id)}
                                className="text-indigo-600 hover:text-indigo-900 transition duration-200 p-1 rounded hover:bg-indigo-50"
                                title={expandedRows.has(category._id) ? 'Collapse' : 'Expand'}
                              >
                                {expandedRows.has(category._id) ? 
                                  <FaChevronUp className="text-xs" /> : 
                                  <FaChevronDown className="text-xs" />
                                }
                              </button>

                              <button
                                onClick={() => confirmDeleteCategory(category._id, category.categoryName)}
                                className="text-red-600 hover:text-red-900 transition duration-200 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                           </td>
                         </tr>

                        {/* Expanded Subcategories Row */}
                        {expandedRows.has(category._id) && category.subcategories && category.subcategories.length > 0 && (
                          <tr>
                            <td colSpan="6" className="px-3 py-2 bg-gray-50">
                              <div className="border-l-2 border-indigo-300 pl-2">
                                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                                  <FaList className="text-indigo-600 text-xs" />
                                  Subcategories ({category.subcategories.length})
                                </h4>
                                
                                <div className="overflow-x-auto">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {category.subcategories.map((subcategory) => {
                                      const subStatusColor = getStatusColor(subcategory.status);
                                      return (
                                        <div key={subcategory._id} className="bg-white border border-gray-200 rounded p-2">
                                          <div className="flex items-center gap-2">
                                            <div className="flex-shrink-0">
                                              {subcategory.subcategoryImageUrl ? (
                                                <img
                                                  src={subcategory.subcategoryImageUrl}
                                                  alt={subcategory.subcategoryName}
                                                  className="h-6 w-6 rounded object-cover border border-gray-200"
                                                  onError={(e) => {
                                                    e.target.src = '';
                                                  }}
                                                />
                                              ) : (
                                                <div className="h-6 w-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                  <FaImage className="text-gray-400 text-[10px]" />
                                                </div>
                                              )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <div className="text-xs font-medium text-gray-900 truncate">
                                                {subcategory.subcategoryName || 'Unnamed'}
                                              </div>
                                              {subcategory.status && (
                                                <span
                                                  className={`inline-flex px-1 py-0.5 text-[9px] font-semibold rounded-full ${subStatusColor.bg} ${subStatusColor.text} border ${subStatusColor.border}`}
                                                >
                                                  {getStatusText(subcategory.status)}
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() => handleView(
                                                  { ...subcategory, categoryName: category.categoryName, categoryId: category._id }, 
                                                  'subcategory'
                                                )}
                                                className="text-green-600 hover:text-green-900 transition duration-200"
                                                title="View"
                                              >
                                                <FaEye className="text-[10px]" />
                                              </button>
                                              <button
                                                onClick={() => handleEdit(
                                                  { ...subcategory, categoryName: category.categoryName, categoryId: category._id }, 
                                                  'subcategory'
                                                )}
                                                className="text-blue-600 hover:text-blue-900 transition duration-200"
                                                title="Edit"
                                              >
                                                <FaEdit className="text-[10px]" />
                                              </button>
                                              <button
                                                onClick={() => confirmDeleteSubcategory(
                                                  category._id, 
                                                  subcategory._id, 
                                                  subcategory.subcategoryName
                                                )}
                                                className="text-red-600 hover:text-red-900 transition duration-200"
                                                title="Delete"
                                              >
                                                <FaTrash className="text-[10px]" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {categories.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">{categories.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {categories.filter(cat => cat.status === 'active').length}
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {categories.filter(cat => cat.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Subcategories</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-xs w-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-red-600">
                <FaExclamationTriangle className="text-lg" />
                <h3 className="text-sm font-semibold">Confirm Delete</h3>
              </div>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600 transition duration-200 p-1 rounded hover:bg-gray-100"
              >
                <FaTimes className="text-md" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteItem?.name}"</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition duration-200 flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FaTrash className="text-xs" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition duration-200 flex items-center justify-center gap-1 text-sm disabled:opacity-50"
                >
                  <FaTimes className="text-xs" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/View Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xs w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                {popupType === 'view' ? 'Details' : 'Edit'}
              </h3>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600 transition duration-200 p-1 rounded hover:bg-gray-100"
              >
                <FaTimes className="text-md" />
              </button>
            </div>

            <div className="p-4">
              {/* View Popup */}
              {popupType === 'view' && selectedItem && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={itemType === 'category' ? selectedItem.imageUrl : selectedItem.subcategoryImageUrl}
                      alt={itemType === 'category' ? selectedItem.categoryName : selectedItem.subcategoryName}
                      className="h-32 w-32 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.src = '';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        {itemType === 'category' ? 'Category Name' : 'Subcategory Name'}
                      </label>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {itemType === 'category' ? selectedItem.categoryName : selectedItem.subcategoryName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Status</label>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
                          selectedItem.status === 'active'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : selectedItem.status === 'inactive'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}
                      >
                        {getStatusText(selectedItem.status)}
                      </span>
                    </div>
                    
                    {itemType === 'category' && selectedItem.note && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Note</label>
                        <p className="mt-1 text-xs text-gray-900 bg-yellow-50 p-2 rounded border border-yellow-200">
                          {selectedItem.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Edit Popup */}
              {popupType === 'edit' && selectedItem && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={editFormData.imagePreview}
                      alt={editFormData.name}
                      className="h-24 w-24 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.src = '';
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
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
                      onChange={handleEditChange}
                      className="w-full p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      accept="image/*"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpdate}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-1 text-sm"
                    >
                      <FaSave className="text-xs" />
                      Update
                    </button>
                    <button
                      onClick={handleClosePopup}
                      className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition duration-200 flex items-center justify-center gap-1 text-sm"
                    >
                      <FaTimes className="text-xs" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;