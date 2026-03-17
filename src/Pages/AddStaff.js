import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AddStaff = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    role: '',
    gender: '',
    age: '',
    email: '',
    department: '',
    employeeId: '',
    joiningDate: '',
    address: '',
    salary: '',
    emergencyContact: '',
  });
  
  const [aadharCardFront, setAadharCardFront] = useState(null);
  const [aadharCardBack, setAadharCardBack] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

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

  // Available roles including all requested roles
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

  // Departments
  const departments = [
    'Management',
    'Human Resources',
    'Technical/IT',
    'Testing/QA',
    'Finance & Accounts',
    'Sales & Marketing',
    'Operations',
    'Customer Support',
    'Administration',
    'Other'
  ];

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
    "/docs": "Document Table",
    "/users": "User List",
    "/active-users": "Active Users",
    "/add-vendor": "Add Vendor",
    "/vendorlist": "Vendor List",
    "/activevendorlist": "Active Vendor List",
    "/create-banner": "Create Banner",
    "/add-rider": "Add Rider",
    "/riderlist": "Rider List",
    "/pendingriderlist": "Pending Rider List",
    "/activeriderlist": "Active Rider List",
    "/notifications": "Notifications",
    "/add-staff": "Add Staff",
    "/stafflist": "Staff List",
    "/pendingbanners": "Pending Banners",
    "/pendingvendorlist": "Pending Vendor List",
    "/pendingproductlist": "Pending Product List",
    "/pendingcategory": "Pending Category",
    "/pendingstafflist": "Pending Staff List",
    "/ambassadorlist": "Ambassador List",
    "/pendingambassadorlist": "Pending Ambassador List",
    "/ambassadorWithdrawalList": "Ambassador Withdrawal List",
    "/vendorplan": "Vendor Plan Management",
    "/helplist": "Help List",
    "/charges": "Charges Management",
  };

  // Get current user info
  const userInfo = getUserInfo();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Mobile number validation - only allow digits and limit to 10
    if (name === 'mobileNumber') {
      // Remove non-digit characters
      const numericValue = value.replace(/[^0-9]/g, '');
      // Limit to 10 digits
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
      return;
    }
    
    // Emergency contact validation - only allow digits and limit to 10
    if (name === 'emergencyContact') {
      // Remove non-digit characters
      const numericValue = value.replace(/[^0-9]/g, '');
      // Limit to 10 digits
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
      return;
    }
    
    // For other fields, update normally
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file changes
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid file (JPEG, JPG, PNG, PDF)');
      return;
    }

    switch (type) {
      case 'aadharCardFront':
        setAadharCardFront(file);
        break;
      case 'aadharCardBack':
        setAadharCardBack(file);
        break;
      case 'photo':
        setPhoto(file);
        break;
      default:
        break;
    }
  };

  // Handle page selection
  const handlePageChange = (e) => {
    const selectedOption = e.target.value;
    
    if (selectedOption && !selectedPages.includes(selectedOption)) {
      setSelectedPages([...selectedPages, selectedOption]);
    }
    
    e.target.value = "";
  };

  // Remove selected page
  const removePage = (pageToRemove) => {
    setSelectedPages(selectedPages.filter(page => page !== pageToRemove));
  };

  // Clear all selected pages
  const clearAllPages = () => {
    setSelectedPages([]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (!formData.fullName || !formData.mobileNumber || !formData.role || !formData.gender) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    // Mobile number validation - exactly 10 digits
    if (formData.mobileNumber.length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    // Emergency contact validation - if provided, must be 10 digits
    if (formData.emergencyContact && formData.emergencyContact.length !== 10) {
      setError('Emergency contact must be exactly 10 digits if provided');
      setLoading(false);
      return;
    }

    // Email validation (if provided)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Document validation - Only Aadhar Front is required
    if (!aadharCardFront) {
      setError('Aadhar Card Front is required');
      setLoading(false);
      return;
    }

    if (!photo) {
      setError('Photo is required');
      setLoading(false);
      return;
    }

    const submitFormData = new FormData();
    
    // Append all form data
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitFormData.append(key, formData[key]);
      }
    });
    
    // Add subAdminId if user is sub-admin
    const subAdminId = getSubAdminId();
    if (subAdminId) {
      submitFormData.append('subAdminId', subAdminId);
    }
    
    // Append files
    if (aadharCardFront) submitFormData.append('aadharCardFront', aadharCardFront);
    if (aadharCardBack) submitFormData.append('aadharCardBack', aadharCardBack);
    if (photo) submitFormData.append('photo', photo);
    
    // Append pages access
    if (selectedPages.length > 0) {
      submitFormData.append('pagesAccess', JSON.stringify(selectedPages));
    }

    try {
      const response = await axios.post(
        'https://api.vegiffyy.com/api/admin/addstaff',
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage(response.data.message);

      if (response.status === 200 || response.status === 201) {
        // Reset form
        setFormData({
          fullName: '',
          mobileNumber: '',
          role: '',
          gender: '',
          age: '',
          email: '',
          department: '',
          employeeId: '',
          joiningDate: '',
          address: '',
          salary: '',
          emergencyContact: '',
        });
        setAadharCardFront(null);
        setAadharCardBack(null);
        setPhoto(null);
        setSelectedPages([]);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/stafflist');
        }, 2000);
      }
    } catch (err) {
      setError(err.response ? err.response.data.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // File Preview Component
  const FilePreview = ({ file, onRemove, title, required = false }) => (
    <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <FaCloudUploadAlt className="text-blue-600" size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-600">{file.name}</p>
          {required && <span className="text-xs text-red-500">* Required</span>}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700"
        title="Remove file"
      >
        <FaTrash size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with User Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 2.197a10.956 10.956 0 01-3.67 1.354" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Staff Member</h1>
                <p className="text-gray-600">Fill in the details to register a new staff member</p>
              </div>
            </div>
            
            {/* User Role Display */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              userInfo.role === "subadmin" 
                ? "bg-purple-100 text-purple-800 border border-purple-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}>
              {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
            </div>
          </div>
          
          {/* Sub-Admin Note */}
          {userInfo.role === "subadmin" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This staff member will be registered under your name: <strong>{userInfo.name}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.mobileNumber.length}/10 digits
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="70"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter age"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee ID */}
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter employee ID"
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (₹)
                  </label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter monthly salary"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Emergency contact number"
                    maxLength="10"
                    pattern="[0-9]{0,10}"
                    title="Please enter up to 10 digits"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.emergencyContact ? `${formData.emergencyContact.length}/10 digits` : 'Optional'}
                  </p>
                </div>
              </div>
            </div>

            {/* Page Access Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Page Access Permissions</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Pages to Grant Access
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={handlePageChange}
                >
                  <option value="">Select a page to add access</option>
                  {Object.keys(pageNames).map((path) => (
                    <option key={path} value={path}>
                      {pageNames[path]}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Note: Select pages one by one to add them to the access list
                </p>
              </div>

              {/* Display selected pages */}
              {selectedPages.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Pages ({selectedPages.length})
                    </label>
                    <button
                      type="button"
                      onClick={clearAllPages}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <FaTrash size={14} /> Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPages.map((page, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center shadow-sm">
                        <span className="mr-2">{pageNames[page] || page}</span>
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 text-lg font-bold"
                          onClick={() => removePage(page)}
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

            {/* Documents Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Documents</h3>
              
              <div className="space-y-6">
                {/* Aadhar Card Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Aadhar Card</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Aadhar Card Front (Required) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Card Front <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="aadharCardFront"
                          onChange={(e) => handleFileChange(e, 'aadharCardFront')}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          required
                        />
                        <FaCloudUploadAlt
                          onClick={() => document.getElementById('aadharCardFront').click()}
                          className="text-blue-500 cursor-pointer hover:text-blue-600 mx-auto mb-3"
                          size={40}
                        />
                        <p className="text-sm text-gray-600 mb-2">Click to upload Aadhar Card Front</p>
                        {aadharCardFront ? (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ {aadharCardFront.name}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">JPG, PNG or PDF (Max 5MB)</p>
                        )}
                      </div>
                      {aadharCardFront && (
                        <FilePreview 
                          file={aadharCardFront}
                          onRemove={() => setAadharCardFront(null)}
                          title="Aadhar Card Front"
                          required={true}
                        />
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Front side with photo and details
                      </p>
                    </div>

                    {/* Aadhar Card Back (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Card Back
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="aadharCardBack"
                          onChange={(e) => handleFileChange(e, 'aadharCardBack')}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                        <FaCloudUploadAlt
                          onClick={() => document.getElementById('aadharCardBack').click()}
                          className="text-blue-500 cursor-pointer hover:text-blue-600 mx-auto mb-3"
                          size={40}
                        />
                        <p className="text-sm text-gray-600 mb-2">Click to upload Aadhar Card Back</p>
                        {aadharCardBack ? (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ {aadharCardBack.name}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">JPG, PNG or PDF (Max 5MB)</p>
                        )}
                      </div>
                      {aadharCardBack && (
                        <FilePreview 
                          file={aadharCardBack}
                          onRemove={() => setAadharCardBack(null)}
                          title="Aadhar Card Back"
                          required={false}
                        />
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Back side with address (Optional)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Photo Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="photo"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        className="hidden"
                        accept=".jpg,.jpeg,.png"
                        required
                      />
                      <FaCloudUploadAlt
                        onClick={() => document.getElementById('photo').click()}
                        className="text-blue-500 cursor-pointer hover:text-blue-600 mx-auto mb-3"
                        size={40}
                      />
                      <p className="text-sm text-gray-600 mb-2">Click to upload Photo</p>
                      {photo ? (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ {photo.name}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">JPG or PNG (Max 2MB)</p>
                      )}
                    </div>
                    {photo && (
                      <FilePreview 
                        file={photo}
                        onRemove={() => setPhoto(null)}
                        title="Profile Photo"
                        required={true}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Document Requirements Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Document Requirements:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <strong>Aadhar Card Front is mandatory</strong> (marked with *)</li>
                  <li>• Aadhar Card Back is optional but recommended for complete verification</li>
                  <li>• Profile Photo is mandatory (marked with *)</li>
                  <li>• All files should be clear and readable</li>
                  <li>• Maximum file size: 5MB for documents, 2MB for photo</li>
                </ul>
              </div>
            </div>

            {/* Submit Button & Messages */}
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering Staff...
                    </span>
                  ) : (
                    'Register Staff Member'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/stafflist')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Registration Info */}
            {userInfo.role === "subadmin" && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800 text-center">
                  <strong>Registration Note:</strong> This staff will be registered under {userInfo.name} (Sub-Admin)
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-center font-medium">{message}</p>
                <p className="text-green-500 text-center text-sm mt-1">
                  Redirecting to staff list...
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;