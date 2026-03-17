import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaPlus, FaTimes, FaImage, FaUser } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const CategoryForm = () => {
  const [categoryName, setCategoryName] = useState('');
  const [subcategories, setSubcategories] = useState([{ subcategoryName: '', subcategoryImage: null }]);
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState({ role: 'unknown', name: '', email: '', id: '' });

  const navigate = useNavigate();

  // 🟢 Get user info on component mount
  React.useEffect(() => {
    getUserInfo();
  }, []);

  // 🟢 Get user info from localStorage
  const getUserInfo = () => {
    try {
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("adminName");
      const email = localStorage.getItem("adminEmail");
      const id = localStorage.getItem("adminId");
      
      setUserInfo({
        role: role || "unknown",
        name: name || "",
        email: email || "",
        id: id || ""
      });
    } catch (error) {
      console.error("Error getting user info:", error);
    }
  };

  // 🟢 Get subAdminId for form submission
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

  // 🟢 Handlers
  const handleCategoryNameChange = (e) => setCategoryName(e.target.value);

  const handleSubcategoryChange = (index, e) => {
    const updated = [...subcategories];
    updated[index][e.target.name] = e.target.value;
    setSubcategories(updated);
  };

  const handleSubcategoryImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updated = [...subcategories];
      updated[index].subcategoryImage = file;
      updated[index].subcategoryImagePreview = URL.createObjectURL(file);
      setSubcategories(updated);
    }
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, { subcategoryName: '', subcategoryImage: null }]);
  };

  const handleRemoveSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  // 🟢 Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🧠 Manual validation
    if (!categoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    if (!categoryImage) {
      alert('Please upload a main category image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("categoryName", categoryName);
      formData.append("image", categoryImage);

      // Prepare subcategory names
      const subData = subcategories.map(sub => ({
        subcategoryName: sub.subcategoryName,
      }));
      formData.append("subcategories", JSON.stringify(subData));

      // Attach subcategory images
      subcategories.forEach((sub, i) => {
        if (sub.subcategoryImage) {
          formData.append(`subcategoryImage_${i}`, sub.subcategoryImage);
        }
      });

      // Add subAdminId if user is subadmin
      const subAdminId = getSubAdminId();
      if (subAdminId) {
        formData.append("subAdminId", subAdminId);
        console.log("Adding subAdminId to category:", subAdminId);
      }

      // Debug form data
      console.log("📦 Sending form data to backend...");
      console.log("User Role:", userInfo.role);
      console.log("SubAdmin ID:", subAdminId);

      const res = await axios.post("https://api.vegiffyy.com/api/category", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ API Response:", res.data);
      
      let successMessage = "🎉 Category created successfully!";
      if (userInfo.role === "subadmin") {
        successMessage = `🎉 Category created successfully under your name: ${userInfo.name}`;
      }
      
      alert(successMessage);
      navigate("/categorylist");

      // Reset form
      setCategoryName('');
      setCategoryImage(null);
      setCategoryImagePreview(null);
      setSubcategories([{ subcategoryName: '', subcategoryImage: null }]);
    } catch (err) {
      console.error("❌ API Error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Reusable upload input
  const FileUploadInput = ({ onChange, preview, label }) => {
    const fileRef = React.useRef();

    const handleClick = () => fileRef.current?.click();

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">{label}</label>

        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileRef}
            onChange={onChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={handleClick}
            className="flex items-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 w-full max-w-md"
          >
            <FaCloudUploadAlt className="text-2xl text-indigo-600" />
            <div className="text-left">
              <p className="font-medium text-gray-700">Click to upload {label.toLowerCase()}</p>
              <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 5MB</p>
            </div>
          </button>

          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-200 shadow-sm"
              />
              <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                <FaImage className="text-xs" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Category</h2>
        <p className="text-gray-600">Add a new category with subcategories for your restaurant</p>
      </div>

      {/* User Info Bar */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FaUser className="text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">
                  {userInfo.name || "User"}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  userInfo.role === 'subadmin' 
                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                }`}>
                  {userInfo.role === 'subadmin' ? 'Sub-Admin' : userInfo.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="text-sm text-gray-600">{userInfo.email}</div>
            </div>
          </div>
          
          {userInfo.role === "subadmin" && (
            <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-lg border border-indigo-200">
              <span className="font-medium">Note:</span> Category will be created under your name
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 🟢 Category Info */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <label className="block text-lg font-semibold text-gray-800 mb-4">Category Information</label>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
              <input
                type="text"
                value={categoryName}
                onChange={handleCategoryNameChange}
                placeholder="Enter category name (e.g., Desserts)"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <FileUploadInput
              onChange={handleCategoryImageChange}
              preview={categoryImagePreview}
              label="Main Category Image"
            />
          </div>
        </div>

        {/* 🟢 Subcategories */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <label className="block text-lg font-semibold text-gray-800">Subcategories</label>
            <button
              type="button"
              onClick={handleAddSubcategory}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200"
            >
              <FaPlus className="text-sm" /> Add Subcategory
            </button>
          </div>

          <div className="space-y-6">
            {subcategories.map((sub, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold text-gray-700">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                      Subcategory {index + 1}
                    </span>
                  </h3>
                  {subcategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(index)}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <FaTimes className="text-sm" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory Name *
                    </label>
                    <input
                      type="text"
                      name="subcategoryName"
                      value={sub.subcategoryName}
                      onChange={(e) => handleSubcategoryChange(index, e)}
                      placeholder="Enter subcategory name"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <FileUploadInput
                    onChange={(e) => handleSubcategoryImageChange(index, e)}
                    preview={sub.subcategoryImagePreview}
                    label="Subcategory Image"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🟢 Submit */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Total: {subcategories.length} subcategory{subcategories.length !== 1 ? 's' : ''}</span>
                {userInfo.role === "subadmin" && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    📝 Sub-Admin Mode
                  </span>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Category...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="inline mr-2" /> 
                  {userInfo.role === "subadmin" ? "Create Category (Sub-Admin)" : "Create Category"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 🟢 Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <FaTimes className="inline mr-2" />
          {error}
        </div>
      )}

      {/* Debug Info (optional - remove in production) */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
        <div className="font-medium mb-1">Debug Info:</div>
        <div className="grid grid-cols-2 gap-2">
          <div>User Role: <span className="font-mono">{userInfo.role}</span></div>
          <div>User ID: <span className="font-mono">{userInfo.id || "Not available"}</span></div>
          <div>SubAdmin ID: <span className="font-mono">{getSubAdminId() || "Not a subadmin"}</span></div>
          <div>Category Name: <span className="font-mono">{categoryName || "Not set"}</span></div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;