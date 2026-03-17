import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaFileExcel,
  FaFileCsv,
  FaSearch,
  FaFilter,
  FaTag,
  FaPercentage,
  FaRupeeSign,
  FaStar,
  FaClock,
  FaStore,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaInfoCircle,
  FaUtensils,
  FaFire,
  FaCheckCircle,
  FaTimesCircle,
  FaReceipt,
  FaUser,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSave,
  FaTimes
} from "react-icons/fa";
import * as XLSX from "xlsx";
import axios from "axios";

const ProductList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [userInfo, setUserInfo] = useState({ role: 'unknown', name: '', email: '', id: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get user info from localStorage
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

  useEffect(() => {
    getUserInfo();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get("https://api.vegiffyy.com/api/category");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.vegiffyy.com/api/restaurant-products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("Invalid data format from API");
      }
      
      setRestaurants(json.data);
      
      // Flatten products from all restaurants
      const allProducts = json.data.flatMap(rest => 
        rest.recommended.map(prod => ({
          ...prod,
          restaurantId: rest._id,
          restaurantName: rest.restaurantName,
          locationName: rest.locationName,
          restaurantStatus: rest.status,
          restaurantImage: rest.image?.url,
          timeAndKm: rest.timeAndKm
        }))
      );
      
      // Sort in ascending order by name for initial display
      const sortedProducts = allProducts.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
      setError(null);
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400 ml-1" size={12} />;
    return sortConfig.direction === "asc" ? 
      <FaSortUp className="text-blue-600 ml-1" size={12} /> : 
      <FaSortDown className="text-blue-600 ml-1" size={12} />;
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) => {
        return (
          (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.restaurantName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.locationName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle string comparison
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Handle numbers
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sorting by name in ascending order
      filtered.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, products, statusFilter, categoryFilter, sortConfig]);

  const downloadExcel = () => {
    if (filteredProducts.length === 0) return alert("No data to export");
    
    const excelData = filteredProducts.map((p, index) => ({
      "S.No": index + 1,
      "Product ID": p._id,
      "Product Name": p.name,
      "Restaurant": p.restaurantName,
      "Location": p.locationName,
      "Price": p.price,
      "Half Plate": p.halfPlatePrice || "N/A",
      "Full Plate": p.fullPlatePrice || "N/A",
      "Discount": p.discount + "%",
      "Status": p.status,
      "Category": p.category || "N/A",
      "Tags": (p.tags || []).join(", "),
      "Preparation Time": p.preparationTime || "N/A",
      "Description": p.content || "N/A",
      "Rating": p.rating || "N/A",
      "Total Orders": p.totalOrders || 0,
      "Restaurant ID": p.restaurantId
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "Product_List.xlsx");
  };

  const downloadCSV = () => {
    if (filteredProducts.length === 0) return alert("No data to export");
    
    const csvData = filteredProducts.map((p, index) => ({
      "S.No": index + 1,
      "Product ID": p._id,
      "Product Name": p.name,
      "Restaurant": p.restaurantName,
      "Location": p.locationName,
      "Price": p.price,
      "Half Plate": p.halfPlatePrice || "N/A",
      "Full Plate": p.fullPlatePrice || "N/A",
      "Discount": p.discount + "%",
      "Status": p.status,
      "Category": p.category || "N/A",
      "Tags": (p.tags || []).join(", "),
      "Preparation Time": p.preparationTime || "N/A",
      "Description": p.content || "N/A"
    }));

    const header = Object.keys(csvData[0]);
    const rows = csvData.map((row) =>
      header.map((field) => `"${row[field] ?? ""}"`).join(",")
    );
    rows.unshift(header.join(","));

    const csvString = rows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Product_List.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteProduct = async (productId, recommendedId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    setDeleteLoading(recommendedId);
    try {
      const res = await fetch(`https://api.vegiffyy.com/api/restaurant-products/${productId}/${recommendedId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete product");
      }
      
      alert("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    setUpdateLoading(true);
    try {
      const formData = new FormData();
      
      const productId = editProduct.restaurantId;
      const recommendedId = editProduct._id;
      
      if (!productId || !recommendedId) {
        alert("Product ID or Recommended ID not found");
        setUpdateLoading(false);
        return;
      }

      // Find original product for comparison
      const originalProduct = products.find(p => p._id === recommendedId);
      if (!originalProduct) {
        alert("Product not found");
        setUpdateLoading(false);
        return;
      }

      // Create recommended object
      const recommendedData = {
        name: editProduct.name || originalProduct.name,
        price: editProduct.price || originalProduct.price,
        halfPlatePrice: editProduct.halfPlatePrice || originalProduct.halfPlatePrice,
        fullPlatePrice: editProduct.fullPlatePrice || originalProduct.fullPlatePrice,
        discount: editProduct.discount || originalProduct.discount,
        content: editProduct.content || originalProduct.content,
        preparationTime: editProduct.preparationTime || originalProduct.preparationTime,
        status: editProduct.status || originalProduct.status,
      };

      // Add tags if they exist
      if (editProduct.tags) {
        recommendedData.tags = Array.isArray(editProduct.tags) 
          ? editProduct.tags 
          : [editProduct.tags];
      }

      // Add category if it exists
      if (editProduct.category) {
        recommendedData.category = editProduct.category;
      }

      console.log("📤 Recommended Data to send:", recommendedData);
      console.log("📤 Status being sent:", recommendedData.status);

      // Append recommended data as JSON string
      formData.append("recommended", JSON.stringify(recommendedData));
      
      // Append image file if new image selected
      if (editProduct.newImage) {
        formData.append("recommendedImage", editProduct.newImage);
      }

      // Debug: Show what's being sent
      for (let pair of formData.entries()) {
        console.log(`📤 FormData: ${pair[0]} = ${pair[1]}`);
      }

      // Send request
      const response = await axios.put(
        `https://api.vegiffyy.com/api/restaurant-product/${productId}/${recommendedId}`,
        formData,
        { 
          headers: { 
            "Content-Type": "multipart/form-data" 
          } 
        }
      );

      console.log("✅ Response:", response.data);

      if (response.data.success) {
        alert("Product updated successfully!");
        setShowEditModal(false);
        setEditProduct(null);
        fetchProducts();
      } else {
        alert("Failed to update product: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error updating product:", error);
      console.error("❌ Error response:", error.response?.data);
      alert("Failed to update product: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProduct(prev => ({
        ...prev,
        newImage: file,
        image: URL.createObjectURL(file) // Preview
      }));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium";
      case "inactive":
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  // Get unique categories and statuses for filters
  const categoriesList = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  const statuses = ["All", ...new Set(products.map(p => p.status).filter(Boolean))];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "";
    const category = categories.find(c => c._id === categoryId);
    return category?.categoryName || categoryId;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header with User Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaUtensils className="text-orange-500" />
            Product Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage and track all restaurant products (Showing in Ascending Order)
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm mt-3 md:mt-0">
          <FaUser className="text-blue-600" />
          <div>
            <div className="font-medium text-blue-800 truncate max-w-[150px]">
              {userInfo.name || 'Admin'}
            </div>
            <div className="text-xs text-blue-600 capitalize">{userInfo.role}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <FaBoxOpen className="text-3xl opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 text-sm">Active Products</p>
              <p className="text-2xl font-bold">{products.filter(p => p.status === 'active').length}</p>
            </div>
            <FaCheckCircle className="text-3xl opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-orange-100 text-sm">Restaurants</p>
              <p className="text-2xl font-bold">{restaurants.length}</p>
            </div>
            <FaStore className="text-3xl opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-purple-100 text-sm">Avg Price</p>
              <p className="text-2xl font-bold">
                {formatCurrency(products.reduce((sum, p) => sum + (p.price || 0), 0) / (products.length || 1))}
              </p>
            </div>
            <FaRupeeSign className="text-3xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2 w-full lg:max-w-md">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, restaurants, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 min-w-[140px]">
              <FaFilter className="text-gray-500 text-sm" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Status" : status}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 min-w-[160px]">
              <FaTag className="text-gray-500 text-sm" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm"
              >
                <FaFileExcel /> Excel
              </button>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors shadow-sm"
              >
                <FaFileCsv /> CSV
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {currentProducts.length} of {filteredProducts.length} products (Sorted by Name: Ascending)
        </div>
      </div>

      {/* Loading/Error/Empty States */}
      {loading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-3" />
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FaBoxOpen className="text-gray-300 text-5xl mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">No products found.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">#</th>
                    <th 
                      className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => requestSort("name")}
                    >
                      <div className="flex items-center">
                        Product Name {getSortIcon("name")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Restaurant</th>
                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                    <th 
                      className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => requestSort("price")}
                    >
                      <div className="flex items-center">
                        Price {getSortIcon("price")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => requestSort("discount")}
                    >
                      <div className="flex items-center">
                        Discount {getSortIcon("discount")}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                      onClick={() => requestSort("status")}
                    >
                      <div className="flex items-center">
                        Status {getSortIcon("status")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Tags</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentProducts.map((product, index) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || "https://via.placeholder.com/40x40/f8f9fa/6c757d?text=No+Image"}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                          <div>
                            <div className="font-medium text-gray-800">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                              {product.content?.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{product.restaurantName}</div>
                        <div className="text-xs text-gray-500">ID: {product.restaurantId?.substring(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <FaMapMarkerAlt className="text-gray-400 text-xs" />
                          <span>{product.locationName || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-green-700">{formatCurrency(product.price)}</div>
                        {(product.halfPlatePrice || product.fullPlatePrice) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {product.halfPlatePrice > 0 && <span>½: ₹{product.halfPlatePrice} </span>}
                            {product.fullPlatePrice > 0 && <span>Full: ₹{product.fullPlatePrice}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.discount > 0 ? (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                            {product.discount}% OFF
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No Discount</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusClass(product.status)}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {product.tags && product.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                              #{tag}
                            </span>
                          ))}
                          {product.tags && product.tags.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                              +{product.tags.length - 2}
                            </span>
                          )}
                        </div>
                        {product.preparationTime && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <FaClock className="text-gray-400" size={10} />
                            <span>{product.preparationTime} mins</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setViewProduct(product);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditProduct(product);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.restaurantId, product._id)}
                            disabled={deleteLoading === product._id}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Product"
                          >
                            {deleteLoading === product._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <FaTrashAlt size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* View Product Modal */}
      {showViewModal && viewProduct && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto relative">
            <div className="flex justify-between items-start mb-4 pb-3 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaUtensils className="text-orange-500" />
                  Product Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">{viewProduct._id}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={viewProduct.image || "https://via.placeholder.com/400x300/f8f9fa/6c757d?text=No+Image"}
                  alt={viewProduct.name}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                {viewProduct.discount > 0 && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <FaFire className="text-red-500" />
                      <span className="font-semibold">Special Offer!</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm ml-auto">
                        {viewProduct.discount}% OFF
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">{viewProduct.name}</h3>
                  
                  <div className="space-y-3">
                    <DetailItem label="Restaurant" value={viewProduct.restaurantName} />
                    <DetailItem label="Location" value={viewProduct.locationName} />
                    <DetailItem label="Category" value={getCategoryName(viewProduct.category) || "N/A"} />
                    <DetailItem label="Status" value={viewProduct.status} />
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaRupeeSign className="text-green-600" />
                    Pricing Details
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Regular Price</div>
                      <div className="font-bold text-lg text-green-700">
                        {formatCurrency(viewProduct.price)}
                      </div>
                    </div>
                    
                    {viewProduct.halfPlatePrice > 0 && (
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-500">Half Plate</div>
                        <div className="font-bold text-lg text-blue-700">
                          {formatCurrency(viewProduct.halfPlatePrice)}
                        </div>
                      </div>
                    )}
                    
                    {viewProduct.fullPlatePrice > 0 && (
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-500">Full Plate</div>
                        <div className="font-bold text-lg text-purple-700">
                          {formatCurrency(viewProduct.fullPlatePrice)}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Discount</div>
                      <div className="font-bold text-lg text-red-600">
                        {viewProduct.discount}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags & Preparation */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaTag className="text-purple-600" />
                    Additional Info
                  </h4>
                  
                  <div className="space-y-3">
                    {viewProduct.tags && viewProduct.tags.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Tags:</div>
                        <div className="flex flex-wrap gap-2">
                          {viewProduct.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <DetailItem 
                      label="Preparation Time" 
                      value={viewProduct.preparationTime ? `${viewProduct.preparationTime} minutes` : "N/A"} 
                    />
                    
                    {viewProduct.rating > 0 && (
                      <DetailItem 
                        label="Rating" 
                        value={
                          <span className="flex items-center gap-1">
                            {viewProduct.rating} <FaStar className="text-yellow-500 text-xs" />
                          </span>
                        } 
                      />
                    )}
                    
                    {viewProduct.totalOrders > 0 && (
                      <DetailItem label="Total Orders" value={viewProduct.totalOrders} />
                    )}
                  </div>
                </div>

                {/* Description */}
                {viewProduct.content && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{viewProduct.content}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditProduct(viewProduct);
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEdit /> Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto relative">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-blue-600" />
                Edit Product
                {userInfo.role === 'subadmin' && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Sub-admin Mode
                  </span>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editProduct.name || ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editProduct.status || "active"}
                    onChange={(e) => handleEditChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={editProduct.price || ""}
                    onChange={(e) => handleEditChange("price", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Half Plate (₹)
                  </label>
                  <input
                    type="number"
                    value={editProduct.halfPlatePrice || ""}
                    onChange={(e) => handleEditChange("halfPlatePrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Plate (₹)
                  </label>
                  <input
                    type="number"
                    value={editProduct.fullPlatePrice || ""}
                    onChange={(e) => handleEditChange("fullPlatePrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={editProduct.discount || ""}
                    onChange={(e) => handleEditChange("discount", e.target.value)}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editProduct.category || ""}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparation Time (mins)
                  </label>
                  <input
                    type="number"
                    value={editProduct.preparationTime || ""}
                    onChange={(e) => handleEditChange("preparationTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={(editProduct.tags || []).join(", ")}
                  onChange={(e) => handleEditChange("tags", e.target.value.split(",").map(t => t.trim()).filter(t => t))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Spicy, Veg, Best Seller"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editProduct.content || ""}
                  onChange={(e) => handleEditChange("content", e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Product description..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={editProduct.image || "https://via.placeholder.com/80x80/f8f9fa/6c757d?text=No+Image"}
                    alt="Preview"
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
              </div>

              {/* Restaurant Info (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Restaurant Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Restaurant:</span>
                    <span className="ml-2 font-medium">{editProduct.restaurantName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{editProduct.locationName}</span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditProduct(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Update Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-800 font-semibold">{value || "-"}</span>
  </div>
);

export default ProductList;