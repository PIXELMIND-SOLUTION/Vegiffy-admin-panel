import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaCloudUploadAlt, 
  FaUser, 
  FaMotorcycle, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaIdCard,
  FaCar,
  FaCamera,
  FaBell,
  FaArrowLeft
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sub-components
const InputField = ({ label, name, type = "text", required = true, icon: Icon, placeholder, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <Icon className="inline mr-1 text-blue-600" /> {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        required={required}
        maxLength={name === 'mobileNumber' ? 10 : undefined}
      />
      {name === 'mobileNumber' && value && (
        <p className="text-xs text-gray-500 mt-1">{value.length}/10 digits</p>
      )}
    </div>
  );
};

const FileUploadField = ({ label, type, required = true, icon: Icon, file, previewUrl, onFileChange, onRemove }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <Icon className="inline mr-1 text-blue-600" /> {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400">
        <input
          type="file"
          id={type}
          accept="image/*,.pdf"
          onChange={(e) => onFileChange(e, type)}
          className="hidden"
          required={required && !file}
        />

        {!file ? (
          <div onClick={() => document.getElementById(type).click()} className="cursor-pointer">
            <FaCloudUploadAlt className="text-blue-500 text-3xl mx-auto mb-2" />
            <p className="text-gray-600">Click to upload {label}</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 5MB)</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {previewUrl ? (
                <img src={previewUrl} alt={label} className="w-12 h-12 object-cover rounded mr-3" />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center mr-3">
                  <FaCloudUploadAlt className="text-blue-600" />
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                  {file?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {file ? (file.size / 1024).toFixed(2) : 0} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(type)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const VehicleTypeSelector = ({ value, onChange }) => {
  const vehicleTypes = [
    { value: 'Bike', label: 'Bike' },
    { value: 'Car', label: 'Car' },
    { value: 'Scooty', label: 'Scooty' },
    { value: 'Cycle', label: 'Cycle' }
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <FaMotorcycle className="inline mr-1 text-blue-600" /> Vehicle Type <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange('vehicleType', e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      >
        <option value="">Select Vehicle Type</option>
        {vehicleTypes.map(vehicle => (
          <option key={vehicle.value} value={vehicle.value}>
            {vehicle.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Main Component
const AddDeliveryBoy = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    vehicleType: '',
    email: '',
    latitude: '',
    longitude: '',
  });

  const [files, setFiles] = useState({
    aadharCard: null,
    drivingLicense: null,
    profileImage: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState({
    profileImage: null,
    aadharCard: null,
    drivingLicense: null
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === 'mobileNumber') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid file (JPEG, JPG, PNG, PDF)');
      return;
    }

    setFiles(prev => ({ ...prev, [type]: file }));

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }

    const labels = { profileImage: 'Profile image', aadharCard: 'Aadhar card', drivingLicense: 'Driving license' };
    toast.success(`${labels[type]} uploaded successfully!`);
  }, []);

  const removeFile = useCallback((type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreview(prev => ({ ...prev, [type]: null }));
    const fileInput = document.getElementById(type);
    if (fileInput) fileInput.value = '';
    const labels = { profileImage: 'Profile image', aadharCard: 'Aadhar card', drivingLicense: 'Driving license' };
    toast.info(`${labels[type]} removed`);
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.fullName.trim()) { toast.error('Full name is required'); return false; }
    if (!formData.mobileNumber) { toast.error('Mobile number is required'); return false; }
    if (formData.mobileNumber.length !== 10) { toast.error('Mobile number must be exactly 10 digits'); return false; }
    if (!formData.vehicleType) { toast.error('Vehicle type is required'); return false; }
    if (!formData.latitude || !formData.longitude) { toast.error('Latitude and longitude are required'); return false; }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) { toast.error('Please enter a valid email address'); return false; }
    if (!files.profileImage) { toast.error('Profile image is required'); return false; }
    if (!files.aadharCard) { toast.error('Aadhar card is required'); return false; }
    if (!files.drivingLicense) { toast.error('Driving license is required'); return false; }
    return true;
  }, [formData, files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
    formDataToSend.append('aadharCard', files.aadharCard);
    formDataToSend.append('drivingLicense', files.drivingLicense);
    formDataToSend.append('profileImage', files.profileImage);

    try {
      const response = await axios.post(
        'https://api.vegiffy.in/api/delivery-boy/register',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('API Response:', response.data); // Debug log

      // Check if registration was successful
      if (response.data && response.data.message === 'Delivery Boy registered successfully!') {
        // Show success message
        toast.success('Delivery boy registered successfully! Redirecting to rider list...');
        setSuccess('Delivery boy registered successfully! Redirecting...');
        
        // Reset form
        setFormData({ 
          fullName: '', 
          mobileNumber: '', 
          vehicleType: '', 
          email: '', 
          latitude: '', 
          longitude: '' 
        });
        setFiles({ aadharCard: null, drivingLicense: null, profileImage: null });
        setPreview({ profileImage: null, aadharCard: null, drivingLicense: null });
        
        // Navigate to rider list after 1.5 seconds
        setTimeout(() => {
          navigate('/riderlist', { replace: true }); // Use replace to prevent going back to form
        }, 1500);
      } else {
        // Handle unexpected response structure
        toast.error(response.data?.message || 'Registration failed');
        setError(response.data?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred during registration';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate('/riderlist');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back to rider list"
              >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <FaMotorcycle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Delivery Boy</h1>
                <p className="text-gray-600">Register a new delivery partner</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Personal Information
                </h2>

                <InputField
                  label="Full Name"
                  name="fullName"
                  icon={FaUser}
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />

                <InputField
                  label="Mobile Number"
                  name="mobileNumber"
                  type="tel"
                  icon={FaPhone}
                  placeholder="10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  icon={FaEnvelope}
                  placeholder="Email address (optional)"
                  required={false}
                  value={formData.email}
                  onChange={handleInputChange}
                />

                <VehicleTypeSelector
                  value={formData.vehicleType}
                  onChange={handleSelectChange}
                />
              </div>

              {/* Right Column */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Location & Documents
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 28.7041"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 77.1025"
                      required
                    />
                  </div>
                </div>

                <FileUploadField
                  label="Profile Image"
                  type="profileImage"
                  icon={FaCamera}
                  file={files.profileImage}
                  previewUrl={preview.profileImage}
                  onFileChange={handleFileChange}
                  onRemove={removeFile}
                />

                <FileUploadField
                  label="Aadhar Card"
                  type="aadharCard"
                  icon={FaIdCard}
                  file={files.aadharCard}
                  previewUrl={preview.aadharCard}
                  onFileChange={handleFileChange}
                  onRemove={removeFile}
                />

                <FileUploadField
                  label="Driving License"
                  type="drivingLicense"
                  icon={FaCar}
                  file={files.drivingLicense}
                  previewUrl={preview.drivingLicense}
                  onFileChange={handleFileChange}
                  onRemove={removeFile}
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <FaBell className="text-blue-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Important Information</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Documents will be verified by admin (status: pending)</li>
                    <li>• All documents should be clear and valid (Max 5MB)</li>
                    <li>• Mobile number must be exactly 10 digits</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registering...
                  </>
                ) : (
                  'Register Delivery Boy'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDeliveryBoy;