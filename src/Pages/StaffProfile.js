import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar, 
  FiDollarSign, FiCheckCircle, FiXCircle, FiEdit, 
  FiArrowLeft, FiCreditCard, FiCamera, FiMapPin, 
  FiTrendingUp, FiShield, FiFileText, FiLock,
  FiGlobe, FiHome, FiActivity, FiStar
} from 'react-icons/fi';
import { MdVerified, MdOutlineSecurity, MdWork, MdEmail, MdPhone, MdPerson } from 'react-icons/md';
import { FaUserTie, FaIdCard, FaRupeeSign } from 'react-icons/fa';
import { GiMoneyStack } from 'react-icons/gi';

const StaffProfile = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('');
  
  // Check if user is authorized to view this page
  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = () => {
    // Get role from sessionStorage
    const role = sessionStorage.getItem('role');
    setUserRole(role);
    
    // Check if user has staff role
    if (role !== 'staff') {
      setError('Unauthorized Access: This page is only accessible to staff members.');
      setLoading(false);
      return false;
    }
    
    // Get staffId from sessionStorage (from staff login)
    const storedStaffId = sessionStorage.getItem('staffId');
    
    // If no staffId in params but we have in sessionStorage, use that
    if (!staffId && storedStaffId) {
      fetchStaffProfile(storedStaffId);
    } else if (staffId) {
      fetchStaffProfile(staffId);
    } else {
      setError('Staff ID not found. Please login again.');
      setLoading(false);
    }
    
    return true;
  };

  const fetchStaffProfile = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      // Get auth token from sessionStorage
      const token = sessionStorage.getItem('authToken');
      
      const response = await axios.get(
        `https://api.vegiffy.in/api/admin/myprofile/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.staff) {
        setStaff(response.data.staff);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching staff profile:', err);
      setError(err.response?.data?.message || 'Failed to load staff profile');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading staff profile...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FiXCircle className="text-3xl text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If staff data is not available
  if (!staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <FiUser className="text-3xl text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Staff Data</h2>
          <p className="text-gray-600 mb-6">Staff profile information is not available.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-300"
            >
              <FiArrowLeft className="text-xl" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Staff Profile</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <FiGlobe className="text-sm" />
                VEGIFFY Team Member
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
              staff.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {staff.status === 'active' ? (
                <>
                  <FiCheckCircle className="text-sm" />
                  Active
                </>
              ) : (
                <>
                  <FiXCircle className="text-sm" />
                  Inactive
                </>
              )}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
              <FiBriefcase className="text-sm" />
              {staff.role || 'Staff'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
                    {staff.photo ? (
                      <img 
                        src={staff.photo} 
                        alt={staff.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-100">
                        <FiUser className="text-5xl text-purple-400" />
                      </div>
                    )}
                  </div>
                  {staff.status === 'active' && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">{staff.fullName}</h2>
                <p className="text-purple-100 flex items-center justify-center gap-1">
                  <MdVerified className="text-lg" />
                  Verified Staff Member
                </p>
              </div>
              
              {/* Profile Details */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Employee ID */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaIdCard className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Employee ID</p>
                        <p className="font-medium text-gray-800">{staff._id?.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MdEmail className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{staff.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MdPhone className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800">{staff.phone || 'Not Provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <MdPerson className="text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium text-gray-800">{staff.gender || 'Not Specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="font-medium text-gray-800">{staff.age || 'Not Provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Joined Date */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FiCalendar className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Joined Date</p>
                          <p className="font-medium text-gray-800">{formatDate(staff.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiActivity className="text-purple-500" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <FiStar className="text-2xl text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Performance</p>
                  <p className="text-xl font-bold text-gray-800">4.8/5</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <FiCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Attendance</p>
                  <p className="text-xl font-bold text-gray-800">98%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'text-purple-600 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiUser className="inline-block mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'salary'
                      ? 'text-purple-600 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaRupeeSign className="inline-block mr-2" />
                  Salary
                </button>
                <button
                  onClick={() => setActiveTab('access')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'access'
                      ? 'text-purple-600 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiLock className="inline-block mr-2" />
                  Access Control
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'documents'
                      ? 'text-purple-600 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiFileText className="inline-block mr-2" />
                  Documents
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <MdWork className="text-purple-500" />
                        Role Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-500">Position</p>
                          <p className="font-bold text-gray-800 text-lg">{staff.role || 'Staff Member'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-bold text-gray-800 text-lg">Operations</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FiShield className="text-purple-500" />
                        Status & Security
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <p className="text-sm text-gray-500">Account Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-3 h-3 rounded-full ${staff.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <p className="font-bold text-gray-800 capitalize">{staff.status}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl">
                          <p className="text-sm text-gray-500">Verification</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MdVerified className="text-green-500" />
                            <p className="font-bold text-gray-800">Verified Employee</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FiHome className="text-purple-500" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-gray-200 rounded-xl">
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-800">{staff.fullName}</p>
                        </div>
                        <div className="p-4 bg-white border border-gray-200 rounded-xl">
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="font-medium text-gray-800">{staff.gender || 'Not Specified'}</p>
                        </div>
                        <div className="p-4 bg-white border border-gray-200 rounded-xl">
                          <p className="text-sm text-gray-500">Age</p>
                          <p className="font-medium text-gray-800">{staff.age || 'Not Provided'}</p>
                        </div>
                        <div className="p-4 bg-white border border-gray-200 rounded-xl">
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">{staff.phone || 'Not Provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Salary Tab */}
                {activeTab === 'salary' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <GiMoneyStack className="text-green-500" />
                        Salary Information
                      </h3>
                      
                      {staff.mySalary && staff.mySalary.length > 0 ? (
                        <div className="space-y-4">
                          {staff.mySalary.map((salary, index) => (
                            <div key={index} className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                              <div className="flex justify-between items-center mb-3">
                                <div>
                                  <p className="text-sm text-gray-500">Salary Period</p>
                                  <p className="font-bold text-gray-800">{salary.month || 'Monthly'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">Amount</p>
                                  <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(salary.amount)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 bg-white rounded-lg">
                                  <p className="text-xs text-gray-500">Payment Date</p>
                                  <p className="font-medium text-gray-800">{salary.paymentDate || 'Not Set'}</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                  <p className="text-xs text-gray-500">Payment Method</p>
                                  <p className="font-medium text-gray-800">{salary.paymentMethod || 'Bank Transfer'}</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                  <p className="text-xs text-gray-500">Status</p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    salary.status === 'paid' 
                                      ? 'bg-green-100 text-green-700'
                                      : salary.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {salary.status || 'pending'}
                                  </span>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                  <p className="text-xs text-gray-500">Transaction ID</p>
                                  <p className="font-medium text-gray-800 text-sm truncate">
                                    {salary.transactionId || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gray-50 rounded-xl">
                          <FaRupeeSign className="text-4xl text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No salary records found</p>
                          <p className="text-sm text-gray-500 mt-1">Salary information will appear here once available</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Salary Summary */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FiTrendingUp className="text-blue-500" />
                        Salary Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Total Paid</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(
                              staff.mySalary?.filter(s => s.status === 'paid')
                                .reduce((sum, s) => sum + (s.amount || 0), 0)
                            )}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Pending</p>
                          <p className="text-xl font-bold text-yellow-600">
                            {formatCurrency(
                              staff.mySalary?.filter(s => s.status === 'pending')
                                .reduce((sum, s) => sum + (s.amount || 0), 0)
                            )}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Average</p>
                          <p className="text-xl font-bold text-blue-600">
                            {formatCurrency(
                              staff.mySalary?.length > 0
                                ? staff.mySalary.reduce((sum, s) => sum + (s.amount || 0), 0) / staff.mySalary.length
                                : 0
                            )}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Next Payment</p>
                          <p className="text-lg font-bold text-purple-600">
                            {formatCurrency(
                              staff.mySalary?.filter(s => s.status === 'pending')[0]?.amount || 0
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Access Control Tab */}
                {activeTab === 'access' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <MdOutlineSecurity className="text-purple-500" />
                        Page Access Permissions
                      </h3>
                      
                      {staff.pagesAccess && staff.pagesAccess.length > 0 ? (
                        <div className="space-y-3">
                          {staff.pagesAccess.map((page, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <FiCheckCircle className="text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{page}</p>
                                  <p className="text-sm text-gray-500">Access Granted</p>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Allowed
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gray-50 rounded-xl">
                          <FiLock className="text-4xl text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No specific page access granted</p>
                          <p className="text-sm text-gray-500 mt-1">Contact administrator for access permissions</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Access Summary */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800">Access Level</h4>
                          <p className="text-sm text-gray-600">Based on role and permissions</p>
                        </div>
                        <span className="px-4 py-2 bg-purple-500 text-white rounded-full font-medium">
                          {staff.role === 'admin' ? 'Administrator' : 'Staff Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FiFileText className="text-purple-500" />
                        Staff Documents
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Aadhar Card */}
                        <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FaIdCard className="text-blue-600 text-xl" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">Aadhar Card</h4>
                                <p className="text-sm text-gray-500">Identity Proof</p>
                              </div>
                            </div>
                            {staff.aadharCard ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Uploaded
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                Pending
                              </span>
                            )}
                          </div>
                          
                          {staff.aadharCard ? (
                            <a 
                              href={staff.aadharCard} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <FiFileText />
                              View Document
                            </a>
                          ) : (
                            <p className="text-gray-500 text-sm">Document not uploaded yet</p>
                          )}
                        </div>
                        
                        {/* Photo */}
                        <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                                <FiCamera className="text-pink-600 text-xl" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">Profile Photo</h4>
                                <p className="text-sm text-gray-500">Staff Image</p>
                              </div>
                            </div>
                            {staff.photo ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Uploaded
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                Pending
                              </span>
                            )}
                          </div>
                          
                          {staff.photo ? (
                            <a 
                              href={staff.photo} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
                            >
                              <FiCamera />
                              View Photo
                            </a>
                          ) : (
                            <p className="text-gray-500 text-sm">Photo not uploaded yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Document Upload Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <FiInfo className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">Document Information</h4>
                          <p className="text-sm text-gray-600">
                            All documents are securely stored and encrypted. For document updates or corrections, 
                            please contact the HR department or your supervisor.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Information Card */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Need Assistance?</h3>
                  <p className="text-purple-100">Contact HR for profile updates or issues</p>
                </div>
                <button className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors duration-300">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} VEGIFFY Staff Portal. All rights reserved.
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Profile last updated: {formatDate(staff.updatedAt)}
        </p>
      </div>
    </div>
  );
};

// Add missing FiInfo icon component
const FiInfo = (props) => (
  <svg 
    stroke="currentColor" 
    fill="none" 
    strokeWidth="2" 
    viewBox="0 0 24 24" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    height="1em" 
    width="1em" 
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default StaffProfile;