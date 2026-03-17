import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import veggyfyLogo from '../Images/veggifylogo.jpeg';
import { 
  FiMail, 
  FiLock, 
  FiKey, 
  FiCheckCircle, 
  FiShield, 
  FiEye, 
  FiEyeOff,
  FiArrowLeft,
  FiRefreshCw,
  FiAlertCircle,
  FiLogIn,
  FiUser
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('admin'); // 'admin' or 'subadmin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [tempAdminData, setTempAdminData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const otpInputRefs = useRef([]);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://api.vegiffyy.com/api/admin';
  const SUBADMIN_API_URL = 'https://api.vegiffyy.com/api/admin';

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer]);

  useEffect(() => {
    if (step === 2 && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    
    const otpArray = formData.otp.split('');
    otpArray[index] = value;
    const newOtp = otpArray.join('');
    
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));
    
    if (value && index < 3) {
      setTimeout(() => otpInputRefs.current[index + 1]?.focus(), 10);
    }
    
    if (!value && index > 0 && e.nativeEvent.inputType === 'deleteContentBackward') {
      setTimeout(() => otpInputRefs.current[index - 1]?.focus(), 10);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      if (userType === 'admin') {
        // Admin login flow with OTP
        const response = await axios.post(`${API_BASE_URL}/login`, {
          email: formData.email,
          password: formData.password
        });
        
        const data = response.data;

        if (data.success) {
          setTempAdminData({
            tempToken: data.tempToken,
            adminId: data.adminId,
            email: data.email || formData.email
          });
          
          setOtpTimer(600);
          setStep(2);
          setSuccess('OTP sent to your email');
          
        } else {
          setError(data.message || 'Login failed');
        }
      } else {
        // Sub-admin login (no OTP required)
        const response = await axios.post(`${SUBADMIN_API_URL}/subadminlogin`, {
          email: formData.email,
          password: formData.password
        });
        
        const data = response.data;

        if (data.success) {
          // Store sub-admin data in localStorage
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('adminId', data.data.subAdminId);
          localStorage.setItem('adminName', data.data.name || '');
          localStorage.setItem('adminEmail', data.data.email || '');
          localStorage.setItem('role', 'subadmin');
          localStorage.setItem('access', JSON.stringify(data.data.access || []));
          localStorage.setItem('phoneNumber', data.data.phoneNumber || '');
          localStorage.setItem('createdBy', data.data.createdBy || '');

          setSuccess('Sub-admin login successful!');
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
          
        } else {
          setError(data.message || 'Sub-admin login failed');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.otp.length !== 4) {
      setError('Please enter complete OTP');
      return;
    }

    if (otpTimer === 0) {
      setError('OTP has expired');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
        adminId: tempAdminData.adminId,
        otp: formData.otp
      });
      
      const data = response.data;

      if (data.success || data.message === "OTP verified successfully") {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('adminId', data.adminId);
        localStorage.setItem('adminName', data.name || '');
        localStorage.setItem('adminEmail', data.email || '');
        localStorage.setItem('role', 'admin');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
        email: formData.email
      });
      
      const data = response.data;
      
      if (data.success) {
        setResetEmail(data.email || formData.email);
        setSuccess('Reset OTP sent to your email');
        setStep(4);
      } else {
        setError(data.message || 'Failed to send reset OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.otp.length !== 4) {
      setError('Please enter complete OTP');
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please enter new password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, {
        email: resetEmail,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      const data = response.data;
      
      if (data.success) {
        setSuccess('Password reset successful');
        setTimeout(() => {
          setStep(1);
          setFormData({
            email: resetEmail,
            password: '',
            otp: '',
            newPassword: '',
            confirmPassword: ''
          });
        }, 2000);
      } else {
        setError(data.message || 'Reset failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 540) return;
    
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/resend-otp`, {
        adminId: tempAdminData.adminId
      });
      
      const data = response.data;
      
      if (data.success) {
        setOtpTimer(600);
        setSuccess('New OTP sent');
      } else {
        setError(data.message || 'Failed to resend');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const handleBackToLogin = () => {
    setStep(1);
    setFormData(prev => ({ 
      ...prev, 
      otp: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setError('');
    setSuccess('');
    setOtpTimer(0);
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') setShowPassword(!showPassword);
    else if (field === 'newPassword') setShowNewPassword(!showNewPassword);
    else if (field === 'confirmPassword') setShowConfirmPassword(!showConfirmPassword);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({
      email: '',
      password: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  const renderLoginForm = () => (
    <motion.div 
      key="login-form"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your dashboard</p>
      </motion.div>

      {/* User Type Selector */}
      <motion.div variants={itemVariants}>
        <div className="flex space-x-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleUserTypeChange('admin')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              userType === 'admin' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiShield className="inline mr-2" />
            Admin
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleUserTypeChange('subadmin')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              userType === 'subadmin' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiUser className="inline mr-2" />
            Sub-Admin
          </motion.button>
        </div>
       
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm overflow-hidden"
          >
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-600 text-sm overflow-hidden"
          >
            <FiCheckCircle className="mr-2 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        variants={itemVariants}
        onSubmit={handleLoginSubmit} 
        className="space-y-4"
      >
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <motion.div 
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
              placeholder={userType === 'admin' ? "admin@example.com" : "subadmin@example.com"}
              required
            />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            {userType === 'admin' && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(3)}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Forgot password?
              </motion.button>
            )}
          </div>
          <motion.div 
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </motion.div>
          {userType === 'subadmin' && (
            <p className="text-xs text-gray-500 mt-2">
              Sub-admin password set by main admin
            </p>
          )}
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ 
            scale: 1.02, 
            boxShadow: userType === 'admin' 
              ? "0 10px 25px rgba(34, 197, 94, 0.3)"
              : "0 10px 25px rgba(59, 130, 246, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`w-full ${
            userType === 'admin' 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          } text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {userType === 'admin' ? 'Signing in...' : 'Signing in as Sub-Admin...'}
            </>
          ) : (
            <>
              <FiLogIn className="mr-2" />
              {userType === 'admin' ? 'Sign In as Admin' : 'Sign In as Sub-Admin'}
            </>
          )}
        </motion.button>
      </motion.form>

      
    </motion.div>
  );

  const renderOtpVerification = () => (
    <motion.div 
      key="otp-form"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToLogin}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <FiArrowLeft className="mr-1" />
          Back
        </motion.button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-1">
          Enter the 4-digit code sent to
        </p>
        <p className="font-medium text-gray-800">{tempAdminData?.email}</p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm overflow-hidden"
          >
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-600 text-sm overflow-hidden"
          >
            <FiCheckCircle className="mr-2 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        variants={itemVariants}
        onSubmit={handleOtpSubmit}
      >
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter OTP Code
            </label>
            <div className="flex justify-between space-x-2">
              {[0, 1, 2, 3].map((index) => (
                <motion.input
                  key={index}
                  ref={el => otpInputRefs.current[index] = el}
                  type="text"
                  value={formData.otp[index] || ''}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  maxLength="1"
                  whileFocus={{ scale: 1.05, boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)" }}
                  className="w-16 h-16 text-center text-3xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
                  required
                />
              ))}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Time remaining</div>
                <motion.div 
                  animate={otpTimer < 60 ? { 
                    scale: [1, 1.02, 1],
                    color: ["#ef4444", "#dc2626", "#ef4444"]
                  } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className={`text-xl font-bold ${otpTimer < 60 ? 'text-red-600' : 'text-gray-800'}`}
                >
                  {formatTime(otpTimer)}
                </motion.div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleResendOtp}
                disabled={otpTimer > 540}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  otpTimer > 540 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                <FiRefreshCw className="inline mr-1" />
                Resend
              </motion.button>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || formData.otp.length !== 4}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );

  const renderForgotPassword = () => (
    <motion.div 
      key="forgot-password"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToLogin}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <FiArrowLeft className="mr-1" />
          Back to login
        </motion.button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
        <p className="text-gray-600">Enter your email to receive reset instructions</p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm overflow-hidden"
          >
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-600 text-sm overflow-hidden"
          >
            <FiCheckCircle className="mr-2 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        variants={itemVariants}
        onSubmit={handleForgotPassword} 
        className="space-y-4"
      >
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <motion.div 
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
              placeholder="admin@example.com"
              required
            />
          </motion.div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  );

  const renderResetPassword = () => (
    <motion.div 
      key="reset-password"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToLogin}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <FiArrowLeft className="mr-1" />
          Back to login
        </motion.button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Password</h2>
        <p className="text-gray-600">Enter OTP sent to {resetEmail}</p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm overflow-hidden"
          >
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-600 text-sm overflow-hidden"
          >
            <FiCheckCircle className="mr-2 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={handleResetPassword}>
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter OTP
            </label>
            <div className="flex justify-between space-x-2">
              {[0, 1, 2, 3].map((index) => (
                <motion.input
                  key={index}
                  ref={el => otpInputRefs.current[index] = el}
                  type="text"
                  value={formData.otp[index] || ''}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  maxLength="1"
                  whileFocus={{ scale: 1.05, boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)" }}
                  className="w-16 h-16 text-center text-3xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
                  required
                />
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <motion.div 
              whileFocus={{ scale: 1.01 }}
              className="relative"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('newPassword')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <motion.div 
              whileFocus={{ scale: 1.01 }}
              className="relative"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </motion.div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );

  const renderStepContent = () => {
    switch(step) {
      case 1: return renderLoginForm();
      case 2: return renderOtpVerification();
      case 3: return renderForgotPassword();
      case 4: return renderResetPassword();
      default: return renderLoginForm();
    }
  };

  // Add FiInfo icon component
  const FiInfo = ({ className, ...props }) => (
    <svg 
      className={className}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2 p-8 lg:p-12"
          >
            <div className="max-w-md mx-auto">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-bold text-green-900">VEGIFFY</h1>
                <p className="text-gray-600 mt-1">Admin Dashboard</p>
                <div className="flex items-center mt-2">
                  <div className={`h-2 w-16 rounded-full ${userType === 'admin' ? 'bg-green-600' : 'bg-blue-600'}`}></div>
                  <span className="ml-2 text-sm text-gray-600">
                    {userType === 'admin' ? 'Main Admin Portal' : 'Sub-Admin Portal'}
                  </span>
                </div>
              </motion.div>
              
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>

             
            </div>
          </motion.div>

          {/* Right Side - Full Logo */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`w-full lg:w-1/2 ${
              userType === 'admin' 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            } flex items-center justify-center p-8 lg:p-12`}
          >
            <motion.div 
              variants={logoVariants}
              initial="hidden"
              animate={["visible", "pulse"]}
              className="w-full h-full flex items-center justify-center"
            >
              <div className="w-80 h-80 bg-white/20 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-2xl"
                >
                  <img
                    src={veggyfyLogo}
                    alt="VEGIFFY Logo"
                    className="w-full h-full object-contain p-2"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating particles animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              userType === 'admin' ? 'bg-green-300' : 'bg-blue-300'
            }`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.3 + 0.1
            }}
            animate={{
              y: [null, Math.random() * -100],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoginPage;