import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import veggyfyLogo from '../Images/veggifylogo.jpeg';
import { FiUser, FiMail, FiPhone, FiLock, FiArrowLeft } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/admin/register', formData);
      
      if (response.data && response.data.message) {
        setSuccess('Registration successful! Redirecting to login...');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError('Registration failed: Invalid response from server');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full border-2 border-green-300">
        
        {/* Image Section - Smaller */}
        <div className="w-full md:w-2/5 flex justify-center p-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="relative">
            <div className="w-48 h-48 rounded-full overflow-hidden flex justify-center items-center border-2 border-green-300 shadow-lg">
              <img
                src={veggyfyLogo}
                alt="Veggyfy Admin Portal"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Form Section - Compact */}
        <div className="w-full md:w-3/5 p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1">
              Veggyfy
            </h1>
            <div className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium mb-3 border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Admin Registration
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-gray-800">Create Admin Account</h2>

          {error && (
            <div className="p-3 text-red-700 bg-red-50 rounded-lg border-l-3 border-red-500 flex items-start text-sm">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 text-green-700 bg-green-50 rounded-lg border-l-3 border-green-500 flex items-start text-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 ml-8" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-8 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition duration-200 text-sm"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-8 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition duration-200 text-sm"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="phoneNumber">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full pl-8 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition duration-200 text-sm"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-8 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition duration-200 text-sm"
                  placeholder="Enter password (min. 6 characters)"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full p-3 text-white font-bold rounded-lg transition duration-200 shadow-md text-sm ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 hover:shadow-lg'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Create Admin Account</span>
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/" 
                className="text-green-600 hover:text-green-700 font-semibold underline transition duration-200"
              >
                Login here
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition duration-200 text-xs font-medium"
            >
              <FiArrowLeft className="mr-1 text-xs" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;