import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import veggyfylogo from '../Images/veggifylogo.jpeg';
import { FiCheckCircle, FiX, FiUsers, FiTarget, FiPhone, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const StaffLoginPage = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Phone number is required.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://api.vegiffyy.com/api/admin/stafflogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('staffId', data.staff._id);
        localStorage.setItem('pagesAccess', JSON.stringify(data.staff.pagesAccess || []));
        localStorage.setItem('role', data.staff.role || 'staff');
        
        console.log('Staff Login Success:', {
          pagesAccess: data.staff.pagesAccess,
          role: data.staff.role
        });

        setShowPopup(true);
        
        setTimeout(() => {
          const accessiblePages = data.staff.pagesAccess || [];
          const defaultPage = accessiblePages.includes('/dashboard') 
            ? '/dashboard' 
            : accessiblePages[0] || '/dashboard';

          navigate(defaultPage);
        }, 2500);

      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
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
                <p className="text-gray-600 mt-1">Staff Portal</p>
              </motion.div>
              
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-sm mb-6 overflow-hidden"
                  >
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Staff Login</h2>
                <p className="text-gray-600 mb-6">Enter your phone number to access staff portal</p>
              </motion.div>

              <motion.form 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleLogin} 
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <motion.div 
                    whileFocus={{ scale: 1.01 }}
                    className="relative"
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 left-10 pl-1 flex items-center pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-24 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the phone number registered with Vegiffy
                  </p>
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
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <FiUsers className="mr-2" />
                      Access Staff Portal
                    </>
                  )}
                </motion.button>
              </motion.form>

             
            </div>
          </motion.div>

          {/* Right Side - Logo */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full lg:w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-8 lg:p-12"
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
                    src={veggyfylogo}
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
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-300 rounded-full"
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

      {/* Success Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-emerald-300 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPopup(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                >
                  <FiX size={24} />
                </motion.button>
                
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex justify-center mb-4"
                >
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <FiCheckCircle className="text-4xl" />
                  </div>
                </motion.div>
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  Welcome Back!
                </motion.h3>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-green-100"
                >
                  Staff Portal Access Granted
                </motion.p>
              </div>
              
              {/* Content */}
              <div className="p-6 text-center">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4"
                >
                  <p className="text-green-800 font-bold text-lg mb-2">
                    🎉 You're Making a Difference! 🎉
                  </p>
                  <p className="text-gray-800 font-semibold">
                    Driving India's Vegetarian Food Revolution
                  </p>
                </motion.div>
                
                {/* Motivational Stats */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 gap-3 mb-4"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-3 rounded-lg border border-green-100"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FiUsers className="text-green-500" />
                      <span className="text-sm font-semibold text-gray-700">Team Player</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-3 rounded-lg border border-emerald-100"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FiTarget className="text-emerald-500" />
                      <span className="text-sm font-semibold text-gray-700">Goal Achiever</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Vegiffy Logo */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs text-center">VEGIFFY STAFF</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-3">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-3 h-3 bg-emerald-500 rounded-full"
                  />
                  <span className="text-sm text-gray-600 font-medium">Taking you to your dashboard...</span>
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
                    className="w-3 h-3 bg-emerald-500 rounded-full"
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.6 }}
                    className="w-3 h-3 bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StaffLoginPage;