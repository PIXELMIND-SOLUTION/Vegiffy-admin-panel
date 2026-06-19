import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AmbassadorLogin = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [ambassadorData, setAmbassadorData] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (showSuccessPopup && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && showSuccessPopup) {
      handleNavigateNow();
    }
    return () => clearInterval(timer);
  }, [showSuccessPopup, countdown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!mobileNumber || mobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.vegiffy.in/api/ambassador/login',
        { mobileNumber }
      );

      if (response.data.success) {
        // Store data in sessionStorage
        sessionStorage.setItem('ambassadorToken', response.data.token);
        sessionStorage.setItem('ambassadorId', response.data.data.ambassadorId);
        sessionStorage.setItem('ambassadorFullName', response.data.data.fullName);
        sessionStorage.setItem('ambassadorData', JSON.stringify(response.data.data));
        
        // Show success popup
        setAmbassadorData(response.data.data);
        setShowSuccessPopup(true);
        setCountdown(60);
        
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response && error.response.status === 403) {
        // Show status pending popup
        setStatusMessage(error.response.data.message || "Your account is pending approval.");
        setShowStatusPopup(true);
      } else if (error.response && error.response.status === 404) {
        alert("Ambassador not found with this mobile number.");
      } else {
        alert("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateNow = () => {
    navigate('/ambassador/dashboard');
  };

  const handleCloseStatusPopup = () => {
    setShowStatusPopup(false);
    setStatusMessage('');
    setMobileNumber('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Login Form - Clean Design */}
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3">
                <span className="text-white font-bold text-2xl">V</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-white">A</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-2">
            Veggyfy Ambassador
          </h1>
          <p className="text-gray-600 text-sm">Exclusive portal for our brand ambassadors</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">
            Sign In to Your Account
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your mobile number
              </label>
              <div className="relative">
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  className="w-full px-4 py-3 text-lg text-center font-semibold tracking-widest bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 10-digit mobile number registered with Veggyfy
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Continue to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                New ambassador? <span className="text-green-600 font-medium">Contact admin</span> for registration
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>Secure login</span>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>Instant access</span>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Veggyfy Ambassador Program
          </p>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto animate-slideInUp">
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center ring-4 ring-green-50">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome {ambassadorData?.fullName || 'Ambassador'}! 🎉
              </h3>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
                <p className="text-gray-700 mb-2">
                  Login successful! You will be redirected to dashboard in
                </p>
                <div className="text-4xl font-bold text-green-600 mb-1">{countdown}</div>
                <p className="text-sm text-gray-600">seconds</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleNavigateNow}
                  className="py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 shadow-md hover:shadow-green-200"
                >
                  Go Now
                </button>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Wait
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Popup */}
      {showStatusPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto animate-slideInUp">
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center ring-4 ring-amber-50">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Account Approval Required
              </h3>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-gray-700 font-medium mb-3">
                  {statusMessage}
                </p>
                <p className="text-sm text-gray-600">
                  Your ambassador account is currently under review by our admin team.
                  You'll be able to access the dashboard once approved.
                </p>
              </div>

              {/* Contact Admin Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Need assistance?</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>📧 Email: support@vegiffyy.com</p>
                  <p>📱 Phone: +91 98765 43210</p>
                  <p>⏰ Hours: 10 AM - 6 PM (Mon-Sat)</p>
                </div>
              </div>

              <button
                onClick={handleCloseStatusPopup}
                className="w-full py-3.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
        
        /* Custom focus style for input */
        input:focus {
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AmbassadorLogin;