import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiMail, FiLock, FiArrowRight, FiRefreshCw, FiClock,
  FiEye, FiEyeOff, FiArrowLeft,
  FiCheckCircle, FiAlertCircle, FiKey, FiUserPlus,
  FiShield
} from 'react-icons/fi';
import veggyfyLogo from '../Images/veggifylogo.jpeg';
import { motion, AnimatePresence } from 'framer-motion';

const AmbassadorLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('login');
  const [otp, setOtp] = useState('');
  const [ambassadorId, setAmbassadorId] = useState('');
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const navigate = useNavigate();
  const otpInputRef = useRef([]);

  useEffect(() => {
    if ((step === 'verify-otp' || step === 'reset-password') && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if ((step === 'verify-otp' || step === 'reset-password') && countdown === 0) {
      setCanResend(true);
    }
  }, [step, countdown]);

  useEffect(() => {
    if ((step === 'verify-otp' || step === 'reset-password') && otpInputRef.current[0]) {
      otpInputRef.current[0].focus();
    }
  }, [step]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    
    const otpArray = otp.split('');
    otpArray[index] = value;
    const newOtp = otpArray.join('');
    
    setOtp(newOtp);
    
    if (value && index < 3) {
      setTimeout(() => otpInputRef.current[index + 1]?.focus(), 10);
    }
    
    if (!value && index > 0 && e.nativeEvent.inputType === 'deleteContentBackward') {
      setTimeout(() => otpInputRef.current[index - 1]?.focus(), 10);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRef.current[index - 1]?.focus();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/ambsdor/login', { 
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      const data = response.data;

      if (data && data.success) {
        setAmbassadorId(data.ambassadorId);
        setSuccess('OTP sent to your email! Please verify to continue.');
        setStep('verify-otp');
        setCountdown(300);
        setCanResend(false);
        setOtp('');
        
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 403) {
          setError('Your account is pending approval. Please wait for admin verification.');
        } else if (status === 404) {
          setError('No ambassador account found with this email.');
        } else if (status === 400) {
          setError(data.message || 'Invalid email or password');
        } else if (status === 401) {
          setError('Invalid credentials. Please check your email and password.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/ambsdor/verify-otp', {
        ambassadorId,
        otp
      });

      const data = response.data;

      if (data && data.success) {
        const ambassadorData = data.ambassador || {};
        
        localStorage.setItem('ambassadorToken', data.token || 'ambassador-auth-token');
        localStorage.setItem('ambassadorData', JSON.stringify(ambassadorData));
        localStorage.setItem('role', 'ambassador');
        localStorage.setItem('ambassadorId', ambassadorData._id || ambassadorId);
        localStorage.setItem('ambassadorName', ambassadorData.fullName || '');
        localStorage.setItem('ambassadorEmail', ambassadorData.email || email);
        localStorage.setItem('referralCode', ambassadorData.referralCode || '');
        localStorage.setItem('walletBalance', ambassadorData.wallet || '0');
        localStorage.setItem('ambassadorStatus', ambassadorData.status || 'pending');
        localStorage.setItem('profileImage', ambassadorData.profileImage || '');
        localStorage.setItem('city', ambassadorData.city || '');
        localStorage.setItem('loginTime', new Date().toISOString());

        setSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/ambassador/dashboard');
        }, 1500);
        
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      
      if (err.response) {
        const { data } = err.response;
        setError(data.message || 'Invalid OTP. Please try again.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend && countdown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://api.vegiffyy.com/api/ambsdor/resend-otp', {
        ambassadorId
      });

      if (response.data.success) {
        setSuccess('New OTP sent successfully!');
        setCountdown(300);
        setCanResend(false);
        setOtp('');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/ambsdor/forgot-password', {
        email: email.toLowerCase().trim()
      });

      const data = response.data;

      if (data && data.success) {
        setResetEmail(data.email || email);
        setSuccess('Password reset OTP sent to your email!');
        setStep('reset-password');
        setCountdown(300);
        setCanResend(false);
        setOtp('');
      } else {
        setError(data.message || 'Failed to send reset OTP');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      if (err.response) {
        const { data } = err.response;
        setError(data.message || 'Failed to process your request');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    if (!newPassword.trim()) {
      setError('Please enter new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setResetPasswordLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/ambsdor/reset-password', {
        email: resetEmail,
        otp,
        newPassword: newPassword.trim()
      });

      const data = response.data;

      if (data && data.success) {
        setSuccess('Password reset successfully! You can now login with your new password.');
        
        setTimeout(() => {
          setStep('login');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setResetEmail('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      
      if (err.response) {
        const { data } = err.response;
        setError(data.message || 'Invalid OTP or email');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setError('');
    setSuccess('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetEmail('');
  };

  const handleRegisterClick = () => {
    navigate('/vegiffy-ambassador');
  };

  const handleForgotPasswordClick = () => {
    setStep('forgot-password');
    setError('');
    setSuccess('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  const renderLoginForm = () => (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-xs text-green-600 hover:text-green-800 font-medium"
            disabled={isLoading}
          >
            Forgot Password?
          </button>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
            placeholder="Enter your password"
            required
            minLength="6"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </motion.div>
      </motion.div>

      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <FiArrowRight className="ml-2" />
          </>
        )}
      </motion.button>
    </motion.form>
  );

  const renderOtpVerification = () => (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleVerifyOtp} 
      className="space-y-5"
    >
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <FiClock className="text-green-500" size={12} />
            <span className="text-green-700 text-sm">
              OTP expires in: <span className="font-bold">{formatTime(countdown)}</span>
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          4-Digit OTP
        </label>
        <div className="flex justify-between space-x-2">
          {[0, 1, 2, 3].map((index) => (
            <motion.input
              key={index}
              ref={el => otpInputRef.current[index] = el}
              type="text"
              value={otp[index] || ''}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength="1"
              whileFocus={{ scale: 1.05, boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)" }}
              className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
              required
              disabled={isLoading}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">
          Enter the 4-digit code sent to your email
        </p>
      </motion.div>

      <div className="space-y-2">
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading || otp.length !== 4}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleResendOtp}
          disabled={!canResend || resendLoading}
          className={`w-full py-2 border rounded-lg text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${
            canResend
              ? 'border-green-500 text-green-600 hover:bg-green-50'
              : 'border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
        >
          {resendLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-500 border-solid"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FiRefreshCw size={12} />
              <span>
                {canResend ? 'Resend OTP' : `Resend in ${formatTime(countdown)}`}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );

  const renderForgotPassword = () => (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleForgotPassword} 
      className="space-y-4"
    >
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-3">
          <div className="flex items-start">
            <FiKey className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" size={14} />
            <div>
              <h3 className="font-semibold text-amber-800 text-sm">Reset Your Password</h3>
              <p className="text-amber-700 text-xs mt-0.5">
                Enter your email. We'll send a 4-digit OTP to reset your password.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
            placeholder="you@example.com"
            required
            disabled={forgotPasswordLoading}
          />
        </motion.div>
      </motion.div>

      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={forgotPasswordLoading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {forgotPasswordLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Sending OTP...
          </>
        ) : (
          'Send Reset OTP'
        )}
      </motion.button>
    </motion.form>
  );

  const renderResetPassword = () => (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleResetPassword} 
      className="space-y-4"
    >
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center space-x-1">
            <FiClock className="text-green-500" size={12} />
            <span className="text-green-700 text-sm">
              OTP expires in: <span className="font-bold">{formatTime(countdown)}</span>
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          4-Digit OTP
        </label>
        <div className="flex justify-between space-x-2">
          {[0, 1, 2, 3].map((index) => (
            <motion.input
              key={index}
              ref={el => otpInputRef.current[index] = el}
              type="text"
              value={otp[index] || ''}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength="1"
              whileFocus={{ scale: 1.05, boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)" }}
              className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
              required
              disabled={resetPasswordLoading}
            />
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700">
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
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
            placeholder="Enter new password"
            required
            minLength="6"
            disabled={resetPasswordLoading}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            disabled={resetPasswordLoading}
          >
            {showNewPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700">
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
            placeholder="Confirm new password"
            required
            minLength="6"
            disabled={resetPasswordLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            disabled={resetPasswordLoading}
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
        disabled={resetPasswordLoading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {resetPasswordLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </motion.button>
    </motion.form>
  );

  const getStepContent = () => {
    switch(step) {
      case 'login': return renderLoginForm();
      case 'verify-otp': return renderOtpVerification();
      case 'forgot-password': return renderForgotPassword();
      case 'reset-password': return renderResetPassword();
      default: return renderLoginForm();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full lg:w-1/2 p-6 lg:p-8"
          >
            <div className="max-w-md mx-auto">
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <h1 className="text-2xl font-bold text-green-900">VEGIFFY</h1>
                <p className="text-gray-600 mt-1 text-sm">Ambassador Portal</p>
              </motion.div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {step === 'login' ? 'Welcome Back' : 
                   step === 'verify-otp' ? 'OTP Verification' :
                   step === 'forgot-password' ? 'Forgot Password' : 'Reset Password'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {step === 'login' 
                    ? 'Sign in to access your ambassador dashboard'
                    : step === 'verify-otp'
                    ? `Enter OTP sent to ${email}`
                    : step === 'forgot-password'
                    ? 'Enter your email to receive reset OTP'
                    : `Enter OTP sent to ${resetEmail} and new password`
                  }
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -5, height: 0 }}
                    className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-xs overflow-hidden"
                  >
                    <FiAlertCircle className="mr-2 flex-shrink-0" size={12} />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -5, height: 0 }}
                    className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-600 text-xs overflow-hidden"
                  >
                    <FiCheckCircle className="mr-2 flex-shrink-0" size={12} />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {getStepContent()}
                </motion.div>
              </AnimatePresence>

              {step === 'login' && (
                <>
                  <div className="my-4 flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="mx-3 text-xs text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 text-xs mb-2">Don't have an ambassador account?</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRegisterClick}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 px-4 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-all duration-300 border border-green-200 hover:border-green-300 shadow-sm"
                    >
                      <FiUserPlus size={12} />
                      Apply as Ambassador
                    </motion.button>
                  </div>
                </>
              )}

              {step !== 'login' && (
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3"
                >
                  <motion.button
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackToLogin}
                    className="inline-flex items-center text-xs text-gray-600 hover:text-gray-800"
                  >
                    <FiArrowLeft className="mr-1" size={12} />
                    Back to login
                  </motion.button>
                </motion.div>
              )}

             
            </div>
          </motion.div>

          {/* Right Side - Logo */}
          <motion.div 
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-6 lg:p-8"
          >
            <motion.div 
              variants={logoVariants}
              initial="hidden"
              animate={["visible", "pulse"]}
              className="w-full h-full flex items-center justify-center"
            >
              <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-center">
                <motion.div 
                  whileHover={{ scale: 1.03, rotate: 1 }}
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
    </motion.div>
  );
};

export default AmbassadorLoginPage;