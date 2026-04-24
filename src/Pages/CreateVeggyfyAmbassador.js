import React, { useState } from "react";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiShoppingBag,
  FiSave,
  FiUpload,
  FiX,
  FiGift,
  FiFileText,
  FiCreditCard,
  FiPercent,
  FiFile,
  FiCopy,
  FiLock
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

const CreateVeggyfyAmbassador = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "",
    
    // Account Credentials
    password: "",
    confirmPassword: "",
    
    // Location Information
    city: "",
    area: "",
    pincode: "",
    
    // Social Media
    instagram: "",
    facebook: "",
    twitter: "",
    
    // Ambassador Specific
    whyVeggyfy: "",
    marketingIdeas: "",
    targetAudience: "",
    expectedCommission: "",
    
    // Referral
    referredBy: "",
    
    // Status
    status: "pending"
  });

  const [profileImage, setProfileImage] = useState(null);
  const [aadharCardFront, setAadharCardFront] = useState(null);
  const [aadharCardBack, setAadharCardBack] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Common image upload handler
  const handleFileUpload = (setFileFunction, fileType) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert(`Please upload a valid file (JPEG, JPG, PNG, PDF) for ${fileType}`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert(`File size should be less than 5MB for ${fileType}`);
        return;
      }
      
      setFileFunction(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.area.trim()) newErrors.area = "Area/Locality is required";
    if (!formData.whyVeggyfy.trim()) newErrors.whyVeggyfy = "Please share why you want to join Vegiffy";
    
    // Date of birth validation (only if provided)
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      
      if (dob > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      }
      
      // Check if user is at least 18 years old
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
      }
    }
    
    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (formData.mobileNumber && !mobileRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Append all form data except confirmPassword
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append files
      if (profileImage) submitData.append('profileImage', profileImage);
      if (aadharCardFront) submitData.append('aadharCardFront', aadharCardFront);
      if (aadharCardBack) submitData.append('aadharCardBack', aadharCardBack);
      if (panCard) submitData.append('panCard', panCard);
      
      // API call to create ambassador
      const response = await fetch('https://api.vegiffy.in/api/ambsdor/create-ambsdor', {
        method: 'POST',
        body: submitData,
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('Vegiffy Ambassador application submitted successfully!');
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          mobileNumber: "",
          dateOfBirth: "",
          gender: "",
          password: "",
          confirmPassword: "",
          city: "",
          area: "",
          pincode: "",
          instagram: "",
          facebook: "",
          twitter: "",
          whyVeggyfy: "",
          marketingIdeas: "",
          targetAudience: "",
          expectedCommission: "",
          referredBy: "",
          status: "pending"
        });
        setProfileImage(null);
        setAadharCardFront(null);
        setAadharCardBack(null);
        setPanCard(null);

        navigate("/ambassador-login");
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error creating ambassador:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable File Preview Component
  const FilePreview = ({ file, onRemove, title, subtitle }) => (
    <div className="flex items-center gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <FiFileText className="w-6 h-6 text-green-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-green-800">{title}</p>
        </div>
        <p className="text-xs text-green-600">{file.name}</p>
        {subtitle && <p className="text-xs text-green-500">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-600 hover:text-red-800 p-1"
        title="Remove file"
      >
        <FiX size={16} />
      </button>
    </div>
  );

  // Reusable File Upload Button
  const FileUploadButton = ({ onUpload, title, description, accept }) => (
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">{title}</span>
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <input 
        type="file" 
        className="hidden" 
        onChange={onUpload}
        accept={accept}
      />
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FiUser className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Join VEGIFFY Ambassador Programme</h1>
              <p className="text-green-100">Promote vegetarian food and earn commissions</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-green-600" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit mobile number"
                />
                {errors.mobileNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Optional - If provided, you must be at least 18 years old
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiLock className="text-green-600" />
              Account Credentials
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Your password must be at least 6 characters long. 
                This password will be used to log into your Vegiffy Ambassador account.
              </p>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="text-green-600" />
              Location Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your city"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              {/* Area/Locality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area/Locality *
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.area ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your area/locality"
                />
                {errors.area && (
                  <p className="text-red-500 text-xs mt-1">{errors.area}</p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Photo
            </h2>
            
            <div className="max-w-xs">
              {profileImage ? (
                <FilePreview 
                  file={profileImage}
                  onRemove={() => setProfileImage(null)}
                  title="Profile Photo"
                  subtitle="Click to change"
                />
              ) : (
                <FileUploadButton 
                  onUpload={handleFileUpload(setProfileImage, "Profile Photo")}
                  title="Upload Profile Photo"
                  description="JPEG, JPG, PNG (Max 2MB)"
                  accept="image/*"
                />
              )}
            </div>
          </div>

          {/* KYC Documents Section */}
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-blue-600" />
              KYC Documents (Optional)
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <FiFileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Document Information</h4>
                  <ul className="text-blue-700 text-sm mt-1 space-y-1">
                    <li>• Upload clear images or scanned copies of your documents</li>
                    <li>• Files should be in JPEG, JPG, PNG, or PDF format (Max 5MB each)</li>
                    <li>• All documents are optional - you can upload them now or later</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Aadhar Card Section */}
            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiCopy className="text-blue-500" />
                Aadhar Card (Optional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhar Card Front */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Aadhar Card Front
                  </label>
                  {aadharCardFront ? (
                    <FilePreview 
                      file={aadharCardFront}
                      onRemove={() => setAadharCardFront(null)}
                      title="Aadhar Card Front"
                      subtitle="Contains photo and details"
                    />
                  ) : (
                    <FileUploadButton 
                      onUpload={handleFileUpload(setAadharCardFront, "Aadhar Card Front")}
                      title="Upload Aadhar Card Front"
                      description="JPEG, JPG, PNG, PDF (Max 5MB)"
                      accept="image/*,application/pdf"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Front side with your photo, name, date of birth, and Aadhar number
                  </p>
                </div>

                {/* Aadhar Card Back */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Aadhar Card Back
                  </label>
                  {aadharCardBack ? (
                    <FilePreview 
                      file={aadharCardBack}
                      onRemove={() => setAadharCardBack(null)}
                      title="Aadhar Card Back"
                      subtitle="Contains address"
                    />
                  ) : (
                    <FileUploadButton 
                      onUpload={handleFileUpload(setAadharCardBack, "Aadhar Card Back")}
                      title="Upload Aadhar Card Back"
                      description="JPEG, JPG, PNG, PDF (Max 5MB)"
                      accept="image/*,application/pdf"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Back side with your address details (Optional)
                  </p>
                </div>
              </div>
            </div>

            {/* PAN Card Section */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiFile className="text-blue-500" />
                PAN Card (Optional)
              </h3>
              
              <div className="grid grid-cols-1">
                {/* PAN Card */}
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    PAN Card
                  </label>
                  {panCard ? (
                    <FilePreview 
                      file={panCard}
                      onRemove={() => setPanCard(null)}
                      title="PAN Card"
                      subtitle="Clear image of PAN card"
                    />
                  ) : (
                    <FileUploadButton 
                      onUpload={handleFileUpload(setPanCard, "PAN Card")}
                      title="Upload PAN Card"
                      description="JPEG, JPG, PNG, PDF (Max 5MB)"
                      accept="image/*,application/pdf"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a clear image or scan of your PAN Card (Optional)
                  </p>
                </div>
              </div>
            </div>

            {/* Document Sample Images Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Document Guidelines</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                <div>
                  <p className="font-medium">Aadhar Front:</p>
                  <p>Side with your photo, name, and Aadhar number</p>
                </div>
                <div>
                  <p className="font-medium">Aadhar Back:</p>
                  <p>Side with your residential address</p>
                </div>
                <div>
                  <p className="font-medium">PAN Card:</p>
                  <p>Complete PAN card with your name and PAN number</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700">
                <strong>Note:</strong> All documents are optional. You can complete your KYC verification later from your dashboard. 
                Your documents are securely stored and used only for verification purposes.
              </p>
            </div>
          </div>

          {/* Referral Section */}
          <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiGift className="text-yellow-600" />
              Referral Information (Optional)
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FiGift className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Earn Referral Bonus!</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    If you were referred by an existing Vegiffy Ambassador or Vendor, 
                    enter their referral code here. They will receive a bonus for referring you!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Code
                </label>
                <input
                  type="text"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter referral code (e.g., VEGGYFYAMB01, VEGGYFYVENDOR01)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the referral code if you were referred by an existing Vegiffy Ambassador or Vendor
                </p>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiInstagram className="text-green-600" />
              Social Media Presence (Optional)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FiInstagram className="text-pink-600" />
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Instagram profile URL"
                />
              </div>

              <div className="flex items-center gap-2">
                <FiFacebook className="text-blue-600" />
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Facebook profile URL"
                />
              </div>

              <div className="flex items-center gap-2">
                <FiTwitter className="text-blue-400" />
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Twitter profile URL"
                />
              </div>
            </div>
          </div>

          {/* Ambassador Program Information */}
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiShoppingBag className="text-green-600" />
              Ambassador Program Details
            </h2>
            
            <div className="space-y-4">
              {/* Why Veggyfy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Why do you want to join Vegiffy Ambassador Program? *
                </label>
                <textarea
                  name="whyVeggyfy"
                  value={formData.whyVeggyfy}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.whyVeggyfy ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Share your motivation for joining Vegiffy..."
                />
                {errors.whyVeggyfy && (
                  <p className="text-red-500 text-xs mt-1">{errors.whyVeggyfy}</p>
                )}
              </div>

              {/* Marketing Ideas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How would you promote Vegiffy in your network?
                </label>
                <textarea
                  name="marketingIdeas"
                  value={formData.marketingIdeas}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Share your marketing/promotion ideas..."
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Who is your target audience?
                </label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Target Audience</option>
                  <option value="students">College Students</option>
                  <option value="working">Working Professionals</option>
                  <option value="families">Families</option>
                  <option value="fitness">Fitness Enthusiasts</option>
                  <option value="all">All of the above</option>
                </select>
              </div>

              {/* Expected Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Commission Structure
                </label>
                <select
                  name="expectedCommission"
                  value={formData.expectedCommission}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Preference</option>
                  <option value="percentage">Percentage per order</option>
                  <option value="fixed">Fixed monthly amount</option>
                  <option value="performance">Performance based</option>
                  <option value="flexible">Flexible as per company policy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <h3 className="text-lg font-bold">Apply for Ambassador Program</h3>
                <p className="text-green-100">We'll review your application and get back to you soon</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                <FiSave size={18} />
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVeggyfyAmbassador;