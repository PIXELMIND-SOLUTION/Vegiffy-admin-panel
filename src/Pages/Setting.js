import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FiUser, FiMail, FiPhone, FiLock, FiEdit2, FiEye, FiEyeOff, 
  FiPlus, FiTrash2, FiSave, FiX, FiChevronDown, FiChevronUp,
  FiShield, FiUsers, FiCheck, FiSquare
} from "react-icons/fi";

const Settings = () => {
  const adminId = localStorage.getItem('adminId');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    newPassword: ""
  });
  
  const [subAdminForm, setSubAdminForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    access: []
  });
  
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [subAdmins, setSubAdmins] = useState([]);
  const [isLoadingSubAdmins, setIsLoadingSubAdmins] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    subAdminForm: true,
    subAdminList: true
  });

  // All access routes - सारे दिखाए जाएंगे
  const allAccessRoutes = [
    { value: "/dashboard", label: "Dashboard" },
    { value: "/categoryform", label: "Add Category" },
    { value: "/categorylist", label: "Category List" },
    { value: "/add-product", label: "Add Product" },
    { value: "/productlist", label: "Product List" },
    { value: "/allorders", label: "All Orders" },
    { value: "/pendingorders", label: "Pending Orders" },
    { value: "/completedorders", label: "Completed Orders" },
    { value: "/users", label: "Users List" },
    { value: "/add-vendor", label: "Add Vendor" },
    { value: "/vendorlist", label: "Vendor List" },
    { value: "/activevendorlist", label: "Active Vendors" },
    { value: "/create-banner", label: "Banner Manager" },
    { value: "/add-rider", label: "Add Rider" },
    { value: "/riderlist", label: "Rider List" },
    { value: "/pendingriderlist", label: "Pending Riders" },
    { value: "/activeriderlist", label: "Active Riders" },
    { value: "/notifications", label: "Notifications" },
    { value: "/add-staff", label: "Add Staff" },
    { value: "/stafflist", label: "Staff List" },
    { value: "/withdrawallist", label: "Rider Withdrawals" },
    { value: "/vendorwithdrawallist", label: "Vendor Withdrawals" },
    { value: "/pendingbanners", label: "Pending Banners" },
    { value: "/pendingvendorlist", label: "Pending Vendors" },
    { value: "/pendingproductlist", label: "Pending Products" },
    { value: "/pendingcategory", label: "Pending Categories" },
    { value: "/pendingstafflist", label: "Pending Staff" },
    { value: "/ambassadorlist", label: "Ambassador List" },
    { value: "/pendingambassadorlist", label: "Pending Ambassadors" },
    { value: "/ambassadorWithdrawalList", label: "Ambassador Withdrawals" },
    { value: "/amount", label: "Amount Management" },
    { value: "/ambassadorplan", label: "Ambassador Plans" },
    { value: "/ambassadorpayments", label: "Ambassador Payments" },
    { value: "/vendorplan", label: "Vendor Plans" },
    { value: "/vendorpayment", label: "Vendor Payments" },
    { value: "/helplist", label: "Help List" },
    { value: "/comission", label: "Commission Management" },
    { value: "/charges", label: "Charges Management" },
    { value: "/resturantorders", label: "Restaurant Orders" },
    { value: "/websiteenquiry", label: "Website Enquiries" },
    { value: "/vendororders", label: "Vendor Orders" },
    { value: "/orderpayments", label: "Order Payments" },
    { value: "/wallet", label: "Admin Wallet" },
    { value: "/refrralrewards", label: "Referral Rewards" },
    { value: "/credential", label: "Credential Manager" }
  ];

  // Group routes by category for better organization
  const groupedAccessRoutes = {
    "Dashboard & Main": [
      { value: "/dashboard", label: "Dashboard" },
      { value: "/notifications", label: "Notifications" },
      { value: "/helplist", label: "Help List" },
      { value: "/websiteenquiry", label: "Website Enquiries" },
      { value: "/wallet", label: "Admin Wallet" }
    ],
    "Category Management": [
      { value: "/categoryform", label: "Add Category" },
      { value: "/categorylist", label: "Category List" },
      { value: "/pendingcategory", label: "Pending Categories" }
    ],
    "Product Management": [
      { value: "/add-product", label: "Add Product" },
      { value: "/productlist", label: "Product List" },
      { value: "/pendingproductlist", label: "Pending Products" }
    ],
    "Order Management": [
      { value: "/allorders", label: "All Orders" },
      { value: "/pendingorders", label: "Pending Orders" },
      { value: "/completedorders", label: "Completed Orders" },
      { value: "/resturantorders", label: "Restaurant Orders" },
      { value: "/vendororders", label: "Vendor Orders" },
      { value: "/orderpayments", label: "Order Payments" }
    ],
    "User Management": [
      { value: "/users", label: "Users List" },
      { value: "/refrralrewards", label: "Referral Rewards" }
    ],
    "Vendor Management": [
      { value: "/add-vendor", label: "Add Vendor" },
      { value: "/vendorlist", label: "Vendor List" },
      { value: "/activevendorlist", label: "Active Vendors" },
      { value: "/pendingvendorlist", label: "Pending Vendors" },
      { value: "/vendorplan", label: "Vendor Plans" },
      { value: "/vendorpayment", label: "Vendor Payments" },
      { value: "/vendorwithdrawallist", label: "Vendor Withdrawals" }
    ],
    "Rider Management": [
      { value: "/add-rider", label: "Add Rider" },
      { value: "/riderlist", label: "Rider List" },
      { value: "/pendingriderlist", label: "Pending Riders" },
      { value: "/activeriderlist", label: "Active Riders" },
      { value: "/withdrawallist", label: "Rider Withdrawals" }
    ],
    "Staff Management": [
      { value: "/add-staff", label: "Add Staff" },
      { value: "/stafflist", label: "Staff List" },
      { value: "/pendingstafflist", label: "Pending Staff" }
    ],
    "Ambassador Management": [
      { value: "/ambassadorlist", label: "Ambassador List" },
      { value: "/pendingambassadorlist", label: "Pending Ambassadors" },
      { value: "/ambassadorWithdrawalList", label: "Ambassador Withdrawals" },
      { value: "/ambassadorplan", label: "Ambassador Plans" },
      { value: "/ambassadorpayments", label: "Ambassador Payments" }
    ],
    "Banner Management": [
      { value: "/create-banner", label: "Banner Manager" },
      { value: "/pendingbanners", label: "Pending Banners" }
    ],
    "Financial Management": [
      { value: "/amount", label: "Amount Management" },
      { value: "/comission", label: "Commission Management" },
      { value: "/charges", label: "Charges Management" },
      { value: "/credential", label: "Credential Manager" }
    ]
  };

  // Fetch admin profile data
  useEffect(() => {
    fetchAdminProfile();
    fetchSubAdmins();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await axios.get(
        `https://api.vegiffy.in/api/admin/profile/${adminId}`
      );
      
      const data = response.data;
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        password: data.password || "",
        newPassword: ""
      });
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    }
  };

  const fetchSubAdmins = async () => {
    setIsLoadingSubAdmins(true);
    try {
      const response = await axios.get(
        `https://api.vegiffy.in/api/admin/getallsubadmins/${adminId}`
      );
      
      if (response.data.success) {
        setSubAdmins(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching sub-admins:", error);
      setMessage({ type: 'error', text: 'Failed to load sub-admins' });
    } finally {
      setIsLoadingSubAdmins(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubAdminInputChange = (e) => {
    const { name, value } = e.target;
    setSubAdminForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccessChange = (routeValue) => {
    setSubAdminForm(prev => {
      const currentAccess = [...prev.access];
      const index = currentAccess.indexOf(routeValue);
      
      if (index > -1) {
        currentAccess.splice(index, 1);
      } else {
        currentAccess.push(routeValue);
      }
      
      return {
        ...prev,
        access: currentAccess
      };
    });
  };

  const handleSelectAllAccess = () => {
    if (subAdminForm.access.length === allAccessRoutes.length) {
      setSubAdminForm(prev => ({
        ...prev,
        access: []
      }));
    } else {
      setSubAdminForm(prev => ({
        ...prev,
        access: allAccessRoutes.map(route => route.value)
      }));
    }
  };

  const handleSelectCategoryAccess = (categoryRoutes) => {
    const categoryValues = categoryRoutes.map(route => route.value);
    const allSelected = categoryValues.every(value => subAdminForm.access.includes(value));
    
    setSubAdminForm(prev => {
      const currentAccess = [...prev.access];
      
      if (allSelected) {
        // Remove all from this category
        categoryValues.forEach(value => {
          const index = currentAccess.indexOf(value);
          if (index > -1) {
            currentAccess.splice(index, 1);
          }
        });
      } else {
        // Add all from this category
        categoryValues.forEach(value => {
          if (!currentAccess.includes(value)) {
            currentAccess.push(value);
          }
        });
      }
      
      return {
        ...prev,
        access: currentAccess
      };
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };

      if (formData.newPassword.trim() !== "") {
        updateData.password = formData.newPassword;
      }

      const response = await axios.put(
        `https://api.vegiffy.in/api/admin/profile/${adminId}`,
        updateData
      );

      if (response.status === 200) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        localStorage.setItem('adminName', formData.name);
        localStorage.setItem('adminEmail', formData.email);
        
        fetchAdminProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!subAdminForm.name || !subAdminForm.email || !subAdminForm.phoneNumber || !subAdminForm.password) {
        setMessage({ type: 'error', text: 'All fields are required' });
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `https://api.vegiffy.in/api/admin/addsubadmin/${adminId}`,
        subAdminForm
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Sub-admin added successfully!' });
        
        setSubAdminForm({
          name: "",
          email: "",
          phoneNumber: "",
          password: "",
          access: []
        });
        
        fetchSubAdmins();
      }
    } catch (error) {
      console.error("Error adding sub-admin:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add sub-admin' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubAdmin = (subAdmin) => {
    setEditingSubAdmin(subAdmin);
    setSubAdminForm({
      name: subAdmin.name,
      email: subAdmin.email,
      phoneNumber: subAdmin.phoneNumber,
      password: "", // Empty for edit
      access: subAdmin.access || []
    });
    setExpandedSections(prev => ({
      ...prev,
      subAdminForm: true
    }));
  };

  const handleUpdateSubAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!subAdminForm.name || !subAdminForm.email || !subAdminForm.phoneNumber) {
        setMessage({ type: 'error', text: 'Name, email and phone are required' });
        setIsLoading(false);
        return;
      }

      const updateData = {
        name: subAdminForm.name,
        email: subAdminForm.email,
        phoneNumber: subAdminForm.phoneNumber,
        access: subAdminForm.access
      };

      // Only include password if provided
      if (subAdminForm.password.trim() !== "") {
        updateData.password = subAdminForm.password;
      }

      const response = await axios.put(
        `https://api.vegiffy.in/api/admin/updatesubadmin/${adminId}/${editingSubAdmin._id}`,
        updateData
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Sub-admin updated successfully!' });
        
        setEditingSubAdmin(null);
        setSubAdminForm({
          name: "",
          email: "",
          phoneNumber: "",
          password: "",
          access: []
        });
        
        fetchSubAdmins();
      }
    } catch (error) {
      console.error("Error updating sub-admin:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update sub-admin' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubAdmin = async (subAdminId) => {
    if (!window.confirm("Are you sure you want to delete this sub-admin?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `https://api.vegiffy.in/api/admin/deletesubadmin/${adminId}/${subAdminId}`
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Sub-admin deleted successfully!' });
        fetchSubAdmins();
      }
    } catch (error) {
      console.error("Error deleting sub-admin:", error);
      setMessage({ type: 'error', text: 'Failed to delete sub-admin' });
    }
  };

  const handleCancelEdit = () => {
    setEditingSubAdmin(null);
    setSubAdminForm({
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      access: []
    });
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchAdminProfile();
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4">
      {/* Message Display */}
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Admin Profile Section - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg"
          onClick={() => toggleSection('profile')}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUser className="text-blue-600" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Admin Profile</h2>
              <p className="text-xs text-gray-500">Manage your account details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-100 transition"
              >
                <FiEdit2 size={14} />
                <span>Edit</span>
              </button>
            )}
            <div className="text-gray-400">
              {expandedSections.profile ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
          </div>
        </div>

        {expandedSections.profile && (
          <div className="p-4 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="Your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      readOnly
                      className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="New password (optional)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Leave empty to keep current password</p>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Sub-Admin Management Section - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg"
          onClick={() => toggleSection('subAdminForm')}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiShield className="text-purple-600" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {editingSubAdmin ? 'Edit Sub-Admin' : 'Add Sub-Admin'}
              </h2>
              <p className="text-xs text-gray-500">
                {editingSubAdmin ? 'Update sub-admin details' : 'Create new sub-admin account'}
              </p>
            </div>
          </div>
          <div className="text-gray-400">
            {expandedSections.subAdminForm ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </div>
        </div>

        {expandedSections.subAdminForm && (
          <div className="p-4 pt-0">
            <form onSubmit={editingSubAdmin ? handleUpdateSubAdmin : handleAddSubAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      name="name"
                      value={subAdminForm.name}
                      onChange={handleSubAdminInputChange}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sub-admin name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="email"
                      name="email"
                      value={subAdminForm.email}
                      onChange={handleSubAdminInputChange}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sub-admin email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phone *
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={subAdminForm.phoneNumber}
                      onChange={handleSubAdminInputChange}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {editingSubAdmin ? "New Password" : "Password *"}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="password"
                      name="password"
                      value={subAdminForm.password}
                      onChange={handleSubAdminInputChange}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={editingSubAdmin ? "New password (optional)" : "Password"}
                      required={!editingSubAdmin}
                    />
                  </div>
                </div>
              </div>

              {/* Full Access Permissions - सारे दिखाए गए हैं */}
              <div className="border border-gray-200 rounded-lg">
                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">
                      Access Permissions ({allAccessRoutes.length} Total)
                    </label>
                    <p className="text-xs text-gray-500">
                      Selected {subAdminForm.access.length} permissions
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleSelectAllAccess}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {subAdminForm.access.length === allAccessRoutes.length ? (
                        <>
                          <FiCheck size={14} />
                          <span>Deselect All</span>
                        </>
                      ) : (
                        <>
                          <FiSquare size={14} />
                          <span>Select All</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4 max-h-96 overflow-y-auto">
                  {Object.entries(groupedAccessRoutes).map(([category, routes], categoryIndex) => {
                    const allCategorySelected = routes.every(route => 
                      subAdminForm.access.includes(route.value)
                    );
                    const someCategorySelected = routes.some(route => 
                      subAdminForm.access.includes(route.value)
                    );

                    return (
                      <div key={categoryIndex} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleSelectCategoryAccess(routes)}
                              className="flex items-center justify-center w-4 h-4 border border-gray-300 rounded"
                            >
                              {allCategorySelected ? (
                                <FiCheck size={10} className="text-blue-600" />
                              ) : someCategorySelected ? (
                                <div className="w-2 h-2 bg-blue-600 rounded-sm" />
                              ) : null}
                            </button>
                            <h4 className="text-sm font-medium text-gray-700">{category}</h4>
                            <span className="text-xs text-gray-500">
                              ({routes.length})
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ml-6">
                          {routes.map((route, routeIndex) => (
                            <div key={routeIndex} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`${category}-${routeIndex}`}
                                checked={subAdminForm.access.includes(route.value)}
                                onChange={() => handleAccessChange(route.value)}
                                className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <label 
                                htmlFor={`${category}-${routeIndex}`}
                                className="ml-2 text-xs text-gray-700 truncate cursor-pointer hover:text-gray-900"
                                title={route.label}
                              >
                                {route.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                {editingSubAdmin && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    <FiX size={12} />
                    <span>Cancel</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {editingSubAdmin ? (
                    <>
                      <FiSave size={12} />
                      <span>{isLoading ? 'Updating...' : 'Update'}</span>
                    </>
                  ) : (
                    <>
                      <FiPlus size={12} />
                      <span>{isLoading ? 'Adding...' : 'Add Sub-Admin'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Sub-Admin List - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg"
          onClick={() => toggleSection('subAdminList')}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiUsers className="text-green-600" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Sub-Admins List</h2>
              <p className="text-xs text-gray-500">
                {subAdmins.length} sub-admin{subAdmins.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">
              {subAdmins.length} total
            </span>
            <div className="text-gray-400">
              {expandedSections.subAdminList ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </div>
          </div>
        </div>

        {expandedSections.subAdminList && (
          <div className="p-4 pt-0">
            {isLoadingSubAdmins ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 mt-2">Loading sub-admins...</p>
              </div>
            ) : subAdmins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subAdmins.map((subAdmin, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <div className="font-medium text-gray-900">{subAdmin.name}</div>
                          <div className="text-xs text-gray-500">{subAdmin.phoneNumber}</div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="text-gray-900">{subAdmin.email}</div>
                          <div className="text-xs text-gray-500">••••{subAdmin.password?.slice(-4)}</div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {subAdmin.access?.length || 0}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              of {allAccessRoutes.length} routes
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Created: {new Date(subAdmin.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditSubAdmin(subAdmin)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubAdmin(subAdmin._id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <FiUsers className="text-gray-400" size={20} />
                </div>
                <p className="text-sm text-gray-500">No sub-admins added yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first sub-admin above</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Access Routes</p>
              <p className="text-lg font-semibold text-gray-800">{allAccessRoutes.length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiShield className="text-purple-600" size={18} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active Sub-Admins</p>
              <p className="text-lg font-semibold text-gray-800">{subAdmins.length}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <FiUsers className="text-green-600" size={18} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Selected Permissions</p>
              <p className="text-lg font-semibold text-gray-800">{subAdminForm.access.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiCheck className="text-blue-600" size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;