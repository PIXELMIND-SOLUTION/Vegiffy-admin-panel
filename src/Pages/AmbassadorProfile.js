import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiShoppingBag,
  FiUsers,
  FiTarget,
  FiPercent,
  FiDollarSign,
  FiStar,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiShield,
  FiPackage,
  FiTrendingUp,
  FiClock,
  FiFileText,
  FiDownload,
  FiMaximize2,
  FiXCircle
} from 'react-icons/fi';
import { saveAs } from 'file-saver';

const AmbassadorProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/ambsdor/profile/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setProfileData(result.data);
        setFormData(result.data);
      } else {
        console.error('Failed to fetch profile:', result.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        instagram: formData.instagram,
        facebook: formData.facebook,
        twitter: formData.twitter,
        whyVeggyfy: formData.whyVeggyfy,
        marketingIdeas: formData.marketingIdeas,
        targetAudience: formData.targetAudience,
        expectedCommission: formData.expectedCommission
      };

      const response = await fetch(`https://api.vegiffyy.com/api/ambsdor/update-ambsdor/${ambassadorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (result.success) {
        setProfileData(result.data);
        setFormData(result.data);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setEditing(false);
  };

  const handleViewDocument = (docType, docUrl, docName) => {
    setSelectedDocument({ type: docType, url: docUrl, name: docName });
    setShowDocumentModal(true);
  };

  const handleDownloadDocument = async (docUrl, docName) => {
    try {
      const response = await fetch(docUrl);
      const blob = await response.blob();
      saveAs(blob, `${docName}_${Date.now()}.jpg`);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const InputField = ({ label, name, value, icon: Icon, type = "text", disabled = false }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={handleInputChange}
        disabled={!editing || disabled}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
          editing && !disabled ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}
      />
    </div>
  );

  const SocialLink = ({ platform, url, icon: Icon, color }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 capitalize">{platform}</p>
        {editing ? (
          <input
            type="url"
            name={platform.toLowerCase()}
            value={formData[platform.toLowerCase()] || ''}
            onChange={handleInputChange}
            className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder={`${platform} profile URL`}
          />
        ) : (
          <p className="text-sm text-gray-600 truncate">
            {url || 'Not provided'}
          </p>
        )}
      </div>
    </div>
  );

  // KYC Document Card Component - Commented out
  // const DocumentCard = ({ title, documentUrl, documentType }) => {
  //   if (!documentUrl) {
  //     return (
  //       <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-48">
  //         <FiAlertCircle className="w-12 h-12 text-yellow-500 mb-3" />
  //         <p className="text-sm font-medium text-gray-700">{title}</p>
  //         <p className="text-xs text-gray-500 mt-1">Not Uploaded</p>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="border rounded-lg p-4">
  //       <div className="flex items-center justify-between mb-3">
  //         <span className="text-sm font-medium text-gray-700">{title}</span>
  //         {documentUrl ? (
  //           <FiCheckCircle className="w-5 h-5 text-green-500" />
  //         ) : (
  //           <FiAlertCircle className="w-5 h-5 text-yellow-500" />
  //         )}
  //       </div>
        
  //       <div className="relative group">
  //         <img 
  //           src={documentUrl} 
  //           alt={title} 
  //           className="w-full h-32 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity"
  //           onClick={() => handleViewDocument(documentType, documentUrl, title)}
  //         />
          
  //         {/* Overlay buttons */}
  //         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
  //           <button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               handleViewDocument(documentType, documentUrl, title);
  //             }}
  //             className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
  //             title="View"
  //           >
  //             <FiMaximize2 className="w-4 h-4 text-gray-700" />
  //           </button>
            
  //           <button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               handleDownloadDocument(documentUrl, title);
  //             }}
  //             className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
  //             title="Download"
  //           >
  //             <FiDownload className="w-4 h-4 text-gray-700" />
  //           </button>
  //         </div>
  //       </div>
        
  //       <div className="flex space-x-2 mt-3">
  //         <button
  //           onClick={() => handleViewDocument(documentType, documentUrl, title)}
  //           className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
  //         >
  //           <FiMaximize2 className="w-3 h-3" />
  //           <span>View</span>
  //         </button>
          
  //         <button
  //           onClick={() => handleDownloadDocument(documentUrl, title)}
  //           className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
  //         >
  //           <FiDownload className="w-3 h-3" />
  //           <span>Download</span>
  //         </button>
  //       </div>
  //     </div>
  //   );
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Profile not found</h2>
          <p className="text-gray-500">Please check your ambassador ID</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="relative">
                  <img
                    src={profileData.profileImage || '/default-avatar.png'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                  />
                  <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white ${
                    profileData.status === 'active' ? 'bg-green-500' : 
                    profileData.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.fullName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      profileData.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : profileData.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        profileData.status === 'active' ? 'bg-green-500' : 
                        profileData.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      {profileData.status?.toUpperCase()}
                    </span>
                    
                    {/* KYC Status Badge - Commented out */}
                    {/* <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      profileData.kycStatus === 'verified' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <FiShield className="w-3 h-3 mr-1" />
                      KYC: {profileData.kycStatus?.toUpperCase()}
                    </span> */}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Wallet Balance</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        ₹{profileData.wallet?.toLocaleString('en-IN') || '0'}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiDollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total Referrals</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {profileData.users?.length || 0}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiUsers className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Commission Rate</p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        {profileData.commissionPercentage || 0}%
                      </p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiPercent className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiUser className="w-5 h-5 mr-2 text-green-600" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Full Name" 
                    name="fullName" 
                    value={formData.fullName} 
                    icon={FiUser} 
                  />
                  <InputField 
                    label="Email" 
                    name="email" 
                    value={formData.email} 
                    icon={FiMail} 
                    type="email" 
                  />
                  <InputField 
                    label="Mobile Number" 
                    name="mobileNumber" 
                    value={formData.mobileNumber} 
                    icon={FiPhone} 
                    disabled 
                  />
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiUser className="w-4 h-4 mr-2" />
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2 text-green-600" />
                  Location Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField 
                    label="City" 
                    name="city" 
                    value={formData.city} 
                    icon={FiMapPin} 
                  />
                  <InputField 
                    label="Area/Locality" 
                    name="area" 
                    value={formData.area} 
                    icon={FiMapPin} 
                  />
                  <InputField 
                    label="Pincode" 
                    name="pincode" 
                    value={formData.pincode} 
                    icon={FiMapPin} 
                  />
                </div>
              </div>

              {/* KYC Documents Section - Completely Commented Out */}
              {/*
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiShield className="w-5 h-5 mr-2 text-green-600" />
                  KYC Documents
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DocumentCard 
                    title="PAN Card" 
                    documentUrl={profileData.panCard}
                    documentType="pan"
                  />

                  <DocumentCard 
                    title="Aadhar Front" 
                    documentUrl={profileData.aadharCardFront}
                    documentType="aadhar_front"
                  />

                  <DocumentCard 
                    title="Aadhar Back" 
                    documentUrl={profileData.aadharCardBack}
                    documentType="aadhar_back"
                  />
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">KYC Status</p>
                      <p className="text-sm text-gray-600">
                        Submitted: {profileData.kycSubmittedAt ? new Date(profileData.kycSubmittedAt).toLocaleDateString('en-IN') : 'N/A'}
                        {profileData.kycVerifiedAt && ` • Verified: ${new Date(profileData.kycVerifiedAt).toLocaleDateString('en-IN')}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profileData.kycStatus === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : profileData.kycStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profileData.kycStatus?.toUpperCase()}
                    </span>
                  </div>
                  {profileData.kycRejectionReason && (
                    <p className="text-sm text-red-600 mt-2">
                      <strong>Rejection Reason:</strong> {profileData.kycRejectionReason}
                    </p>
                  )}
                </div>
              </div>
              */}

              {/* Purchased Plans */}
              {profileData.purchasedPlans && profileData.purchasedPlans.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiPackage className="w-5 h-5 mr-2 text-green-600" />
                    Purchased Plans
                  </h2>
                  
                  <div className="space-y-4">
                    {profileData.purchasedPlans.map((plan, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{plan.planName}</h3>
                            <p className="text-sm text-gray-600">
                              Valid for {plan.planValidity} year(s)
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            plan.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {plan.isActive ? 'ACTIVE' : 'EXPIRED'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Purchase Date</p>
                            <p className="font-medium">
                              {plan.purchaseDate ? new Date(plan.purchaseDate).toLocaleDateString('en-IN') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Expiry Date</p>
                            <p className="font-medium">
                              {plan.expiryDate ? new Date(plan.expiryDate).toLocaleDateString('en-IN') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-medium">₹{plan.totalAmount ? plan.totalAmount.toLocaleString('en-IN') : '0'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Payment Status</p>
                            <p className="font-medium capitalize">{plan.paymentStatus || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {plan.planBenefits && plan.planBenefits.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-1">Benefits:</p>
                            <div className="flex flex-wrap gap-2">
                              {plan.planBenefits.map((benefit, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ambassador Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiShoppingBag className="w-5 h-5 mr-2 text-green-600" />
                  Ambassador Details
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiUsers className="w-4 h-4 mr-2" />
                      Why Veggyfy?
                    </label>
                    <textarea
                      name="whyVeggyfy"
                      value={formData.whyVeggyfy || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      rows={3}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                      placeholder="Share your motivation for joining Veggyfy..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiTarget className="w-4 h-4 mr-2" />
                      Marketing Ideas
                    </label>
                    <textarea
                      name="marketingIdeas"
                      value={formData.marketingIdeas || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      rows={3}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                      placeholder="Share your marketing/promotion ideas..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        Target Audience
                      </label>
                      <select
                        name="targetAudience"
                        value={formData.targetAudience || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        <option value="">Select Target Audience</option>
                        <option value="students">College Students</option>
                        <option value="working">Working Professionals</option>
                        <option value="families">Families</option>
                        <option value="fitness">Fitness Enthusiasts</option>
                        <option value="all">All of the above</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        Expected Commission
                      </label>
                      <select
                        name="expectedCommission"
                        value={formData.expectedCommission || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
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
              </div>
            </div>

            {/* Right Column - Side Info */}
            <div className="space-y-6">
              {/* Social Media */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  Social Media Links
                </h2>
                
                <div className="space-y-3">
                  <SocialLink 
                    platform="instagram" 
                    url={formData.instagram} 
                    icon={FiInstagram} 
                    color="text-pink-600" 
                  />
                  <SocialLink 
                    platform="facebook" 
                    url={formData.facebook} 
                    icon={FiFacebook} 
                    color="text-blue-600" 
                  />
                  <SocialLink 
                    platform="twitter" 
                    url={formData.twitter} 
                    icon={FiTwitter} 
                    color="text-blue-400" 
                  />
                </div>
              </div>

              {/* Referral Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiTrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Referral Information
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-1">Your Referral Code</p>
                    <p className="text-2xl font-bold text-green-600 font-mono">
                      {profileData.referralCode || 'N/A'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Share this code with friends to earn {profileData.commissionPercentage || 0}% commission
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Account Created</p>
                    <p className="text-sm text-blue-600">
                      {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                  </div>

                  {profileData.referredBy && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-medium text-purple-800">Referred By</p>
                      <p className="text-sm text-purple-600">{profileData.referredBy}</p>
                    </div>
                  )}

                  {profileData.users && profileData.users.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Total Referrals</p>
                          <p className="text-lg font-bold text-yellow-600">{profileData.users.length}</p>
                        </div>
                        <FiUsers className="w-6 h-6 text-yellow-500" />
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        {profileData.users.length} user{profileData.users.length !== 1 ? 's' : ''} joined using your code
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction History */}
              {profileData.transactionHistory && profileData.transactionHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiFileText className="w-5 h-5 mr-2 text-green-600" />
                    Recent Transactions
                  </h2>
                  
                  <div className="space-y-3">
                    {profileData.transactionHistory.slice(0, 3).map((transaction, index) => (
                      <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description || 'Commission Earned'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.date ? new Date(transaction.date).toLocaleDateString('en-IN') : 'N/A'}
                            </p>
                          </div>
                          <span className={`font-medium ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Modal - Commented out as it's not used without KYC */}
      {/*
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDocument.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownloadDocument(selectedDocument.url, selectedDocument.name)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Download"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Close"
                >
                  <FiXCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <div className="flex items-center justify-center">
                <img 
                  src={selectedDocument.url} 
                  alt={selectedDocument.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Document Type: <span className="font-medium">{selectedDocument.name}</span>
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDownloadDocument(selectedDocument.url, selectedDocument.name)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      */}
    </>
  );
};

export default AmbassadorProfile;