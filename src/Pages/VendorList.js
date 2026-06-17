// import React, { useEffect, useState } from "react";
// import { FiEdit, FiTrash2, FiX, FiDownload, FiFilter, FiEye, FiDollarSign, FiUser, FiUsers, FiFileText, FiZoomIn, FiExternalLink, FiMapPin, FiCalendar, FiCreditCard, FiPercent, FiFolder } from "react-icons/fi";
// import axios from "axios";

// const RestaurantList = () => {
//   const [allRestaurants, setAllRestaurants] = useState([]);
//   const [filteredRestaurants, setFilteredRestaurants] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRestaurants, setTotalRestaurants] = useState(0);

//   // For Edit Popup
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editRestaurant, setEditRestaurant] = useState(null);

//   // For View Popup
//   const [isViewOpen, setIsViewOpen] = useState(false);
//   const [viewRestaurant, setViewRestaurant] = useState(null);

//   // For Add to Wallet Popup
//   const [isWalletOpen, setIsWalletOpen] = useState(false);
//   const [walletRestaurant, setWalletRestaurant] = useState(null);
//   const [amount, setAmount] = useState("");
//   const [description, setDescription] = useState("");
//   const [walletLoading, setWalletLoading] = useState(false);

//   // For Category Assignment Popup
//   const [isCategoryOpen, setIsCategoryOpen] = useState(false);
//   const [categoryRestaurant, setCategoryRestaurant] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [categoryLoading, setCategoryLoading] = useState(false);
//   const [categorySearch, setCategorySearch] = useState("");

//   // Filters
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [ratingFilter, setRatingFilter] = useState("All");
//   const [priceFilter, setPriceFilter] = useState("All");
//   const [usersFilter, setUsersFilter] = useState("All");
//   const [showFilters, setShowFilters] = useState(false);

//   const itemsPerPage = 10;

//   // Get subAdminId from localStorage
//   const getSubAdminId = () => {
//     try {
//       const userRole = localStorage.getItem("role");

//       if (userRole === "subadmin") {
//         const adminId = localStorage.getItem("adminId");
//         return adminId;
//       }

//       return null;
//     } catch (error) {
//       console.error("Error getting subAdminId:", error);
//       return null;
//     }
//   };

//   // Get user info for display
//   const getUserInfo = () => {
//     try {
//       const role = localStorage.getItem("role");
//       const name = localStorage.getItem("adminName");
//       const email = localStorage.getItem("adminEmail");
//       const id = localStorage.getItem("adminId");

//       return {
//         role: role || "unknown",
//         name: name || "",
//         email: email || "",
//         id: id || ""
//       };
//     } catch (error) {
//       console.error("Error getting user info:", error);
//       return { role: "unknown", name: "", email: "", id: "" };
//     }
//   };

//   // Parse wallet transactions if they are strings
//   const parseWalletTransactions = (transactions) => {
//     if (!transactions || !Array.isArray(transactions)) return [];

//     return transactions.map(t => {
//       if (typeof t === 'string') {
//         try {
//           return JSON.parse(t);
//         } catch (e) {
//           console.error('Error parsing transaction:', e);
//           return null;
//         }
//       }
//       return t;
//     }).filter(t => t !== null);
//   };

//   // Process restaurant data to ensure all fields are properly formatted
//   const processRestaurantData = (restaurants) => {
//     return restaurants.map(restaurant => ({
//       ...restaurant,
//       // Parse wallet transactions if they're strings
//       walletTransactions: parseWalletTransactions(restaurant.walletTransactions),
//       // Ensure document fields are properly structured
//       gstCertificate: restaurant.gstCertificate || null,
//       fssaiLicense: restaurant.fssaiLicense || null,
//       panCard: restaurant.panCard || null,
//       aadharCardFront: restaurant.aadharCardFront || null,
//       aadharCardBack: restaurant.aadharCardBack || null,
//       declarationForm: restaurant.declarationForm || null,
//       vendorAgreement: restaurant.vendorAgreement || null,
//       image: restaurant.image || null,
//       // Ensure categories is an array
//       categories: restaurant.categories || [],
//       // Ensure fssaiNo and disclaimers are properly handled
//       fssaiNo: restaurant.fssaiNo || "",
//       disclaimers: restaurant.disclaimers || []
//     }));
//   };

//   // Fetch all restaurants
//   const fetchRestaurants = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await axios.get(`https://api.vegiffy.in/api/allrestaurant`);

//       if (res.data?.success) {
//         const restaurants = res.data.data || [];
//         const processedRestaurants = processRestaurantData(restaurants);
//         setAllRestaurants(processedRestaurants);
//         setTotalRestaurants(processedRestaurants.length);
//         applyFilters(processedRestaurants);
//       } else {
//         setError("Failed to load restaurants");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch all categories
//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get(`https://api.vegiffy.in/api/category`);
//       if (res.data?.success) {
//         setCategories(res.data.data || []);
//       }
//     } catch (err) {
//       console.error("Error fetching categories:", err);
//       alert("Failed to load categories");
//     }
//   };

//   useEffect(() => {
//     fetchRestaurants();
//     fetchCategories();
//   }, []);

//   // Apply filters whenever filters or search change
//   useEffect(() => {
//     applyFilters(allRestaurants);
//   }, [searchQuery, statusFilter, ratingFilter, priceFilter, usersFilter, allRestaurants]);

//   // Apply all filters and search
//   const applyFilters = (restaurants) => {
//     let filtered = [...restaurants];

//     // Apply search filter
//     if (searchQuery.trim() !== "") {
//       filtered = filtered.filter(restaurant =>
//         restaurant.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         restaurant.locationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         restaurant.mobile?.includes(searchQuery) ||
//         restaurant.referralCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         restaurant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         restaurant.gstNumber?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     // Apply status filter
//     if (statusFilter !== "All") {
//       filtered = filtered.filter(restaurant => restaurant.status === statusFilter);
//     }

//     // Apply rating filter
//     if (ratingFilter !== "All") {
//       const minRating = parseFloat(ratingFilter);
//       filtered = filtered.filter(restaurant => {
//         const rating = parseFloat(restaurant.rating) || 0;
//         return rating >= minRating;
//       });
//     }

//     // Apply price filter (using starting price or any other price field)
//     if (priceFilter !== "All") {
//       filtered = filtered.filter(restaurant => {
//         const price = restaurant.startingPrice || 0;
//         switch (priceFilter) {
//           case "0-100":
//             return price <= 100;
//           case "100-200":
//             return price > 100 && price <= 200;
//           case "200-300":
//             return price > 200 && price <= 300;
//           case "300-500":
//             return price > 300 && price <= 500;
//           case "500+":
//             return price > 500;
//           default:
//             return true;
//         }
//       });
//     }

//     // Apply users filter
//     if (usersFilter !== "All") {
//       filtered = filtered.filter(restaurant => {
//         const totalUsers = restaurant.totalUsers || 0;
//         switch (usersFilter) {
//           case "0":
//             return totalUsers === 0;
//           case "1-10":
//             return totalUsers >= 1 && totalUsers <= 10;
//           case "10-50":
//             return totalUsers > 10 && totalUsers <= 50;
//           case "50+":
//             return totalUsers > 50;
//           default:
//             return true;
//         }
//       });
//     }

//     // Update pagination
//     const totalFiltered = filtered.length;
//     setTotalPages(Math.ceil(totalFiltered / itemsPerPage));
//     setTotalRestaurants(totalFiltered);

//     // Apply pagination
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const paginatedData = filtered.slice(startIndex, endIndex);

//     setFilteredRestaurants(paginatedData);
//   };

//   // Reset to page 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, statusFilter, ratingFilter, priceFilter, usersFilter]);

//   // Re-apply pagination when page changes
//   useEffect(() => {
//     applyFilters(allRestaurants);
//   }, [currentPage]);

//   const handleEdit = (restaurant) => {
//     setEditRestaurant({ ...restaurant });
//     setIsEditOpen(true);
//   };

//   const handleView = (restaurant) => {
//     setViewRestaurant(restaurant);
//     setIsViewOpen(true);
//   };

//   const handleAddToWallet = (restaurant) => {
//     setWalletRestaurant(restaurant);
//     setAmount("");
//     setDescription("");
//     setIsWalletOpen(true);
//   };

//   const handleAssignCategory = (restaurant) => {
//     setCategoryRestaurant(restaurant);
//     // Set selected categories from restaurant's existing categories
//     setSelectedCategories(restaurant.categories?.map(cat => 
//       typeof cat === 'object' ? cat._id : cat
//     ) || []);
//     setCategorySearch("");
//     setIsCategoryOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this restaurant?")) return;

//     try {
//       const subAdminId = getSubAdminId();
//       const config = {
//         data: subAdminId ? { subAdminId } : {}
//       };

//       const res = await axios.delete(`https://api.vegiffy.in/api/restaurant/${id}`, config);
//       if (res.data?.success) {
//         fetchRestaurants(); // Refresh the list
//       } else {
//         alert(res.data?.message || "Delete failed");
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || err.message || "Server error");
//     }
//   };

//   const handleSaveEdit = async () => {
//     try {
//       const subAdminId = getSubAdminId();
//       const requestData = { ...editRestaurant };

//       if (subAdminId) {
//         requestData.subAdminId = subAdminId;
//       }

//       const res = await axios.put(
//         `https://api.vegiffy.in/api/restaurant/${editRestaurant._id}`,
//         requestData
//       );
//       if (res.data?.success) {
//         fetchRestaurants();
//         setIsEditOpen(false);
//         setEditRestaurant(null);
//       } else {
//         alert(res.data?.message || "Update failed");
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || err.message || "Server error");
//     }
//   };

//   const handleSaveCategories = async () => {
//     if (!categoryRestaurant) return;

//     setCategoryLoading(true);
//     try {
//       const subAdminId = getSubAdminId();
//       const requestData = {
//         categories: selectedCategories
//       };

//       if (subAdminId) {
//         requestData.subAdminId = subAdminId;
//       }

//       const res = await axios.put(
//         `https://api.vegiffy.in/api/restaurant/${categoryRestaurant._id}`,
//         requestData
//       );

//       if (res.data?.success) {
//         alert(`Categories successfully assigned to ${categoryRestaurant.restaurantName}`);
//         setIsCategoryOpen(false);
//         setCategoryRestaurant(null);
//         setSelectedCategories([]);
//         fetchRestaurants(); // Refresh the list
//       } else {
//         alert(res.data?.message || "Failed to assign categories");
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || err.message || "Server error");
//     } finally {
//       setCategoryLoading(false);
//     }
//   };

//   const handleAddAmount = async () => {
//     if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
//       alert("Please enter a valid amount");
//       return;
//     }

//     setWalletLoading(true);
//     try {
//       const subAdminId = getSubAdminId();
//       const requestData = {
//         amount: parseFloat(amount),
//         description: description || `Amount added by admin to ${walletRestaurant.restaurantName}`
//       };

//       if (subAdminId) {
//         requestData.subAdminId = subAdminId;
//       }

//       const res = await axios.post(
//         `https://api.vegiffy.in/api/add-to-wallet/${walletRestaurant._id}`,
//         requestData
//       );

//       if (res.data?.success) {
//         alert(`₹${amount} successfully added to ${walletRestaurant.restaurantName}'s wallet`);
//         setIsWalletOpen(false);
//         setWalletRestaurant(null);
//         setAmount("");
//         setDescription("");
//         fetchRestaurants();
//       } else {
//         alert(res.data?.message || "Failed to add amount to wallet");
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || err.message || "Server error");
//     } finally {
//       setWalletLoading(false);
//     }
//   };

//   // CSV download logic
//   const downloadCSV = () => {
//     if (filteredRestaurants.length === 0) return alert("No data to export");

//     const headers = ["Name", "Location", "Mobile", "Email", "Rating", "Total Orders", "Total Earnings", "Total Users", "Wallet Balance", "Status", "Referral Code", "GST Number", "FSSAI Number", "Commission", "Categories"];
//     const rows = filteredRestaurants.map(r => [
//       `"${r.restaurantName}"`,
//       `"${r.locationName}"`,
//       r.mobile || "-",
//       r.email || "-",
//       r.rating || "-",
//       r.totalOrders || "0",
//       `₹${r.totalEarnings || "0.00"}`,
//       r.totalUsers || "0",
//       `₹${r.walletBalance || "0.00"}`,
//       r.status,
//       r.referralCode || "-",
//       r.gstNumber || "-",
//       r.fssaiNo || "-",
//       `${r.commission || "0"}%`,
//       `"${r.categories?.map(c => typeof c === 'object' ? c.categoryName : c).join(', ') || ''}"`
//     ]);
//     const csvContent = [
//       headers.join(","),
//       ...rows.map(row => row.join(","))
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", `restaurants_${new Date().toISOString().split('T')[0]}.csv`);
//       link.click();
//     }
//   };

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5;

//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//     if (endPage - startPage + 1 < maxVisiblePages) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     return pages;
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setStatusFilter("All");
//     setRatingFilter("All");
//     setPriceFilter("All");
//     setUsersFilter("All");
//     setSearchQuery("");
//     setCurrentPage(1);
//   };

//   // Check if any filter is active
//   const isAnyFilterActive = statusFilter !== "All" || ratingFilter !== "All" || priceFilter !== "All" || usersFilter !== "All" || searchQuery !== "";

//   // Get current user info
//   const userInfo = getUserInfo();

//   // Function to check if document exists and has URL
//   const hasDocument = (doc) => {
//     return doc && doc.url && doc.url !== null;
//   };

//   // Filter categories based on search
//   const filteredCategories = categories.filter(category => 
//     category.categoryName?.toLowerCase().includes(categorySearch.toLowerCase())
//   );

//   // Toggle category selection
//   const toggleCategory = (categoryId) => {
//     setSelectedCategories(prev => {
//       if (prev.includes(categoryId)) {
//         return prev.filter(id => id !== categoryId);
//       } else {
//         return [...prev, categoryId];
//       }
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
//             <div className="flex items-center space-x-4 mb-4 lg:mb-0">
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <FiUsers className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Restaurant Management</h1>
//                 <p className="text-gray-600">Manage all restaurants and their data</p>
//               </div>
//             </div>

//             {/* User Role Display */}
//             <div className="flex items-center gap-4">
//               <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 userInfo.role === "subadmin" 
//                   ? "bg-purple-100 text-purple-800 border border-purple-200"
//                   : "bg-blue-100 text-blue-800 border border-blue-200"
//               }`}>
//                 Logged in as: {userInfo.role === "subadmin" ? "Sub-Admin" : "Admin"}
//                 {userInfo.name && ` - ${userInfo.name}`}
//               </div>

//               <div className="grid grid-cols-2 gap-4 text-center">
//                 <div className="bg-blue-50 p-3 rounded-lg">
//                   <p className="text-2xl font-bold text-blue-600">{totalRestaurants}</p>
//                   <p className="text-sm text-gray-600">Total Restaurants</p>
//                 </div>
//                 <div className="bg-green-50 p-3 rounded-lg">
//                   <p className="text-2xl font-bold text-green-600">
//                     {allRestaurants.filter(r => r.status === 'active').length}
//                   </p>
//                   <p className="text-sm text-gray-600">Active</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sub-Admin Note */}
//           {userInfo.role === "subadmin" && (
//             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//               <p className="text-sm text-yellow-800">
//                 <strong>Note:</strong> All updates will be recorded under your name: <strong>{userInfo.name}</strong>
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Search and Filters Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
//             {/* Search Input and Filter Toggle */}
//             <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
//               <div className="flex items-center gap-2">
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FiFilter className="text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search by name, location, mobile, email, GST..."
//                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
//                   />
//                 </div>
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                     showFilters || isAnyFilterActive
//                       ? "bg-blue-600 text-white hover:bg-blue-700"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   <FiFilter size={16} />
//                   Filters
//                   {isAnyFilterActive && (
//                     <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                       !
//                     </span>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Download CSV Button */}
//             <div className="flex gap-2">
//               {isAnyFilterActive && (
//                 <button
//                   onClick={resetFilters}
//                   className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                 >
//                   Reset Filters
//                 </button>
//               )}
//               <button
//                 onClick={downloadCSV}
//                 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 <FiDownload size={18} /> Export CSV
//               </button>
//             </div>
//           </div>

//           {/* Filters Panel */}
//           {showFilters && (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
//               <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-lg font-medium text-gray-800">Filters</h3>
//                 <button
//                   onClick={() => setShowFilters(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <FiX size={20} />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {/* Status Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Status
//                   </label>
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="All">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="pending">Pending</option>
//                     <option value="inactive">Inactive</option>
//                     <option value="rejected">Rejected</option>
//                   </select>
//                 </div>

//                 {/* Rating Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Minimum Rating
//                   </label>
//                   <select
//                     value={ratingFilter}
//                     onChange={(e) => setRatingFilter(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="All">All Ratings</option>
//                     <option value="4.5">4.5+ Stars</option>
//                     <option value="4.0">4.0+ Stars</option>
//                     <option value="3.5">3.5+ Stars</option>
//                     <option value="3.0">3.0+ Stars</option>
//                     <option value="2.5">2.5+ Stars</option>
//                   </select>
//                 </div>

//                 {/* Users Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Total Users
//                   </label>
//                   <select
//                     value={usersFilter}
//                     onChange={(e) => setUsersFilter(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="All">All Users</option>
//                     <option value="0">0 Users</option>
//                     <option value="1-10">1-10 Users</option>
//                     <option value="10-50">10-50 Users</option>
//                     <option value="50-100">50-100 Users</option>
//                     <option value="100+">100+ Users</option>
//                   </select>
//                 </div>

//                 {/* Orders Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Total Orders
//                   </label>
//                   <select
//                     value={priceFilter}
//                     onChange={(e) => setPriceFilter(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="All">All Orders</option>
//                     <option value="0">0 Orders</option>
//                     <option value="1-10">1-10 Orders</option>
//                     <option value="10-50">10-50 Orders</option>
//                     <option value="50-100">50-100 Orders</option>
//                     <option value="100+">100+ Orders</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Active Filters Display */}
//               {isAnyFilterActive && (
//                 <div className="mt-3 pt-3 border-t border-gray-200">
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {statusFilter !== "All" && (
//                       <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
//                         Status: {statusFilter}
//                         <button
//                           onClick={() => setStatusFilter("All")}
//                           className="text-blue-600 hover:text-blue-800"
//                         >
//                           <FiX size={12} />
//                         </button>
//                       </span>
//                     )}
//                     {ratingFilter !== "All" && (
//                       <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
//                         Rating: {ratingFilter}+
//                         <button
//                           onClick={() => setRatingFilter("All")}
//                           className="text-green-600 hover:text-green-800"
//                         >
//                           <FiX size={12} />
//                         </button>
//                       </span>
//                     )}
//                     {priceFilter !== "All" && (
//                       <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
//                         Orders: {priceFilter}
//                         <button
//                           onClick={() => setPriceFilter("All")}
//                           className="text-purple-600 hover:text-purple-800"
//                         >
//                           <FiX size={12} />
//                         </button>
//                       </span>
//                     )}
//                     {usersFilter !== "All" && (
//                       <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
//                         Users: {usersFilter}
//                         <button
//                           onClick={() => setUsersFilter("All")}
//                           className="text-orange-600 hover:text-orange-800"
//                         >
//                           <FiX size={12} />
//                         </button>
//                       </span>
//                     )}
//                     {searchQuery && (
//                       <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
//                         Search: "{searchQuery}"
//                         <button
//                           onClick={() => setSearchQuery("")}
//                           className="text-yellow-600 hover:text-yellow-800"
//                         >
//                           <FiX size={12} />
//                         </button>
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Results Count and Stats */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//             <div className="text-sm text-gray-600 mb-2 sm:mb-0">
//               Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRestaurants)} of {totalRestaurants} restaurants
//               {isAnyFilterActive && " (filtered)"}
//             </div>

//             {/* Quick Stats */}
//             <div className="flex gap-2 text-xs">
//               <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
//                 Active: {allRestaurants.filter(r => r.status === 'active').length}
//               </span>
//               <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
//                 Pending: {allRestaurants.filter(r => r.status === 'pending').length}
//               </span>
//               <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
//                 Inactive: {allRestaurants.filter(r => r.status === 'inactive').length}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           {loading ? (
//             <div className="flex justify-center items-center py-12">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                 <p className="text-gray-600">Loading restaurants...</p>
//               </div>
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
//                 <p className="font-medium">Error loading restaurants</p>
//                 <p className="text-sm mt-1">{error}</p>
//                 <button
//                   onClick={fetchRestaurants}
//                   className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             </div>
//           ) : filteredRestaurants.length === 0 ? (
//             <div className="text-center py-12">
//               <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
//               <p className="text-gray-500 mb-4">
//                 {isAnyFilterActive ? 'No restaurants match your current filters' : 'No restaurants available'}
//               </p>
//               {isAnyFilterActive && (
//                 <button
//                   onClick={resetFilters}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Clear all filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Restaurant
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Contact & Location
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Business Stats
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredRestaurants.map((restaurant) => (
//                       <tr key={restaurant._id} className="hover:bg-gray-50 transition-colors">
//                         {/* Restaurant Info */}
//                         <td className="px-6 py-4">
//                           <div className="flex items-center">
//                             <div className="relative">
//                               <img
//                                 src={restaurant.image?.url || ""}
//                                 alt={restaurant.restaurantName}
//                                 className="h-12 w-12 rounded-lg object-cover"
//                                 onError={(e) => {
//                                   e.target.src = "";
//                                 }}
//                               />
//                               {restaurant.rating && (
//                                 <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1 rounded-full flex items-center">
//                                   ⭐ {restaurant.rating}
//                                 </div>
//                               )}
//                             </div>
//                             <div className="ml-4">
//                               <div className="text-sm font-medium text-gray-900">
//                                 {restaurant.restaurantName}
//                               </div>
//                               <div className="text-xs text-gray-500 truncate max-w-[180px]">
//                                 {restaurant.description || 'No description'}
//                               </div>
//                               <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
//                                 <FiMapPin size={10} />
//                                 {restaurant.locationName || 'Location not set'}
//                               </div>
//                               {/* Display categories if any */}
//                               {restaurant.categories && restaurant.categories.length > 0 && (
//                                 <div className="flex flex-wrap gap-1 mt-2">
//                                   {restaurant.categories.map((cat, idx) => (
//                                     <span 
//                                       key={idx} 
//                                       className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
//                                     >
//                                       {typeof cat === 'object' ? cat.categoryName : cat}
//                                     </span>
//                                   ))}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>

//                         {/* Contact Info */}
//                         <td className="px-6 py-4">
//                           <div className="space-y-1">
//                             <div className="text-sm text-gray-900 flex items-center gap-1">
//                               <FiUser size={12} />
//                               {restaurant.email}
//                             </div>
//                             <div className="text-sm text-gray-600 flex items-center gap-1">
//                               📱 {restaurant.mobile || 'No phone'}
//                             </div>
//                             <div className="text-xs text-gray-500 flex items-center gap-1">
//                               <FiCreditCard size={12} />
//                               GST: {restaurant.gstNumber || 'Not provided'}
//                             </div>
//                             <div className="text-xs text-gray-500 flex items-center gap-1">
//                               <FiFileText size={12} />
//                               FSSAI No: {restaurant.fssaiNo || 'Not provided'}
//                             </div>
//                           </div>
//                         </td>

//                         {/* Stats */}
//                         <td className="px-6 py-4">
//                           <div className="grid grid-cols-2 gap-2 text-xs">
//                             <div className="text-center bg-blue-50 p-2 rounded">
//                               <div className="font-bold text-blue-700">{restaurant.totalOrders || 0}</div>
//                               <div className="text-blue-600">Orders</div>
//                             </div>
//                             <div className="text-center bg-green-50 p-2 rounded">
//                               <div className="font-bold text-green-700">{restaurant.totalUsers || 0}</div>
//                               <div className="text-green-600">Users</div>
//                             </div>
//                             <div className="text-center bg-purple-50 p-2 rounded col-span-2">
//                               <div className="font-bold text-purple-700">₹{restaurant.totalEarnings || "0.00"}</div>
//                               <div className="text-purple-600">Earnings</div>
//                             </div>
//                             <div className="text-center bg-yellow-50 p-2 rounded col-span-2">
//                               <div className="text-xs text-yellow-700 flex items-center justify-center gap-1">
//                                 <FiPercent size={10} />
//                                 Commission: {restaurant.commission || 0}%
//                               </div>
//                             </div>
//                           </div>
//                         </td>

//                         {/* Status */}
//                         <td className="px-6 py-4">
//                           <div className="space-y-2">
//                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                               restaurant.status === "active"
//                                 ? "bg-green-100 text-green-800"
//                                 : restaurant.status === "pending"
//                                 ? "bg-yellow-100 text-yellow-800"
//                                 : restaurant.status === "rejected"
//                                 ? "bg-red-100 text-red-800"
//                                 : "bg-gray-100 text-gray-800"
//                             }`}>
//                               {restaurant.status}
//                             </span>
//                             <div className="text-xs text-gray-500">
//                               <div className="flex items-center gap-1">
//                                 <FiDollarSign size={10} />
//                                 Wallet: ₹{restaurant.walletBalance || "0.00"}
//                               </div>
//                               <div className="flex items-center gap-1 mt-1">
//                                 Referral: {restaurant.referralCode || 'N/A'}
//                               </div>
//                               {restaurant.note && (
//                                 <div className="text-xs text-gray-400 mt-1 italic">
//                                   {restaurant.note}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>

//                         {/* Actions */}
//                         <td className="px-6 py-4">
//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={() => handleView(restaurant)}
//                               className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
//                               title="View Details"
//                             >
//                               <FiEye size={18} />
//                             </button>
//                             <button
//                               onClick={() => handleEdit(restaurant)}
//                               className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
//                               title="Edit"
//                             >
//                               <FiEdit size={18} />
//                             </button>
//                             <button
//                               onClick={() => handleAssignCategory(restaurant)}
//                               className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
//                               title="Assign Categories"
//                             >
//                               <FiFolder size={18} />
//                             </button>
//                             <button
//                               onClick={() => handleAddToWallet(restaurant)}
//                               className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
//                               title="Add to Wallet"
//                             >
//                               <FiDollarSign size={18} />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(restaurant._id)}
//                               className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
//                               title="Delete"
//                             >
//                               <FiTrash2 size={18} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Enhanced Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
//                   <div className="text-sm text-gray-600 mb-4 sm:mb-0">
//                     Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRestaurants)} of {totalRestaurants} restaurants
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={() => setCurrentPage(1)}
//                       disabled={currentPage === 1}
//                       className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
//                     >
//                       <FiX className="w-3 h-3" /> First
//                     </button>
//                     <button
//                       onClick={() => setCurrentPage(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
//                     >
//                       ← Previous
//                     </button>

//                     <div className="flex space-x-1">
//                       {getPageNumbers().map(page => (
//                         <button
//                           key={page}
//                           onClick={() => setCurrentPage(page)}
//                           className={`px-3 py-2 border text-sm min-w-[40px] ${
//                             currentPage === page
//                               ? "bg-blue-600 text-white border-blue-600"
//                               : "border-gray-300 hover:bg-gray-100"
//                           } rounded-lg`}
//                         >
//                           {page}
//                         </button>
//                       ))}
//                     </div>

//                     <button
//                       onClick={() => setCurrentPage(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
//                     >
//                       Next →
//                     </button>
//                     <button
//                       onClick={() => setCurrentPage(totalPages)}
//                       disabled={currentPage === totalPages}
//                       className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
//                     >
//                       Last <FiX className="w-3 h-3" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* View Modal */}
//       {isViewOpen && viewRestaurant && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               {/* Header */}
//               <div className="flex justify-between items-start mb-6">
//                 <div>
//                   <h3 className="text-2xl font-bold text-gray-900">{viewRestaurant.restaurantName}</h3>
//                   <p className="text-gray-600">{viewRestaurant.description}</p>
//                 </div>
//                 <button
//                   onClick={() => setIsViewOpen(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors p-1"
//                 >
//                   <FiX className="w-6 h-6" />
//                 </button>
//               </div>

//               <div className="space-y-6">
//                 {/* Main Info Row */}
//                 <div className="flex flex-col md:flex-row gap-6">
//                   {/* Left Column - Restaurant Image and Basic Info */}
//                   <div className="md:w-1/3">
//                     <div className="bg-gray-50 rounded-xl p-4">
//                       <img
//                         src={viewRestaurant.image?.url || "https://via.placeholder.com/400x192?text=Restaurant+Image"}
//                         alt={viewRestaurant.restaurantName}
//                         className="w-full h-48 object-cover rounded-lg mb-4"
//                         onError={(e) => {
//                           e.target.src = "https://via.placeholder.com/400x192?text=Restaurant+Image";
//                         }}
//                       />

//                       <div className="space-y-3">
//                         <div className="flex items-center justify-between">
//                           <span className="text-gray-600">Rating</span>
//                           <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
//                             ⭐ {viewRestaurant.rating || 'N/A'}
//                           </span>
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <span className="text-gray-600">Categories</span>
//                           <div className="flex flex-wrap gap-1 justify-end">
//                             {viewRestaurant.categories && viewRestaurant.categories.length > 0 ? (
//                               viewRestaurant.categories.map((cat, idx) => (
//                                 <span 
//                                   key={idx} 
//                                   className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
//                                 >
//                                   {typeof cat === 'object' ? cat.categoryName : cat}
//                                 </span>
//                               ))
//                             ) : (
//                               <span className="text-gray-500 text-xs">No categories</span>
//                             )}
//                           </div>
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <span className="text-gray-600">Status</span>
//                           <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                             viewRestaurant.status === "active"
//                               ? "bg-green-100 text-green-800"
//                               : viewRestaurant.status === "pending"
//                               ? "bg-yellow-100 text-yellow-800"
//                               : viewRestaurant.status === "rejected"
//                               ? "bg-red-100 text-red-800"
//                               : "bg-gray-100 text-gray-800"
//                           }`}>
//                             {viewRestaurant.status}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right Column - Stats Grid */}
//                   <div className="md:w-2/3">
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                       <StatCard 
//                         title="Total Orders" 
//                         value={viewRestaurant.totalOrders || 0}
//                         icon="📊"
//                         color="blue"
//                       />
//                       <StatCard 
//                         title="Total Users" 
//                         value={viewRestaurant.totalUsers || 0}
//                         icon="👥"
//                         color="green"
//                       />
//                       <StatCard 
//                         title="Total Earnings" 
//                         value={`₹${viewRestaurant.totalEarnings || "0.00"}`}
//                         icon="💰"
//                         color="purple"
//                       />
//                       <StatCard 
//                         title="Wallet Balance" 
//                         value={`₹${viewRestaurant.walletBalance || "0.00"}`}
//                         icon="💳"
//                         color="yellow"
//                       />
//                       <StatCard 
//                         title="Commission" 
//                         value={`${viewRestaurant.commission || 0}%`}
//                         icon="📈"
//                         color="indigo"
//                       />
//                       <StatCard 
//                         title="Discount" 
//                         value={`${viewRestaurant.discount || 0}%`}
//                         icon="🎁"
//                         color="pink"
//                       />
//                     </div>

//                     {/* Additional Info */}
//                     <div className="mt-6 grid grid-cols-2 gap-4">
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
//                           <FiCreditCard className="w-4 h-4" />
//                           Business Details
//                         </h4>
//                         <DetailItem label="GST Number" value={viewRestaurant.gstNumber} />
//                         <DetailItem label="FSSAI Number" value={viewRestaurant.fssaiNo} />
//                         <DetailItem label="Commission Percentage" value={`${viewRestaurant.commission || 0}%`} />
//                       </div>

//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
//                           <FiCalendar className="w-4 h-4" />
//                           Timeline
//                         </h4>
//                         <DetailItem 
//                           label="Created At" 
//                           value={new Date(viewRestaurant.createdAt).toLocaleString('en-IN', {
//                             dateStyle: 'medium',
//                             timeStyle: 'short'
//                           })} 
//                         />
//                         <DetailItem 
//                           label="Updated At" 
//                           value={new Date(viewRestaurant.updatedAt).toLocaleString('en-IN', {
//                             dateStyle: 'medium',
//                             timeStyle: 'short'
//                           })} 
//                         />
//                         {viewRestaurant.note && (
//                           <DetailItem 
//                             label="Last Updated By" 
//                             value={viewRestaurant.note} 
//                             className="text-blue-600"
//                           />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Contact and Location Section */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Contact Information */}
//                   <div className="bg-white border border-gray-200 rounded-xl p-5">
//                     <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                       <FiUser className="w-5 h-5 text-blue-600" />
//                       Contact Information
//                     </h4>
//                     <div className="space-y-3">
//                       <DetailItem label="Email" value={viewRestaurant.email} />
//                       <DetailItem label="Mobile" value={viewRestaurant.mobile} />
//                       <DetailItem label="Location" value={viewRestaurant.locationName} />

//                       {/* Coordinates */}
//                       {viewRestaurant.location?.coordinates && (
//                         <div className="pt-2">
//                           <div className="flex items-center gap-2 text-gray-800 mb-2">
//                             <FiMapPin className="w-4 h-4" />
//                             <span className="font-medium">Coordinates</span>
//                           </div>
//                           <div className="grid grid-cols-2 gap-3 pl-6">
//                             <div className="bg-gray-50 p-2 rounded">
//                               <div className="text-xs text-gray-500">Latitude</div>
//                               <div className="font-medium">{viewRestaurant.location.coordinates[1]}</div>
//                             </div>
//                             <div className="bg-gray-50 p-2 rounded">
//                               <div className="text-xs text-gray-500">Longitude</div>
//                               <div className="font-medium">{viewRestaurant.location.coordinates[0]}</div>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Business Information */}
//                   <div className="bg-white border border-gray-200 rounded-xl p-5">
//                     <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                       <FiFileText className="w-5 h-5 text-green-600" />
//                       Business Information
//                     </h4>
//                     <div className="space-y-3">
//                       <DetailItem label="Referral Code" value={viewRestaurant.referralCode} />
//                       <DetailItem label="Referred By" value={viewRestaurant.referredBy || "Not referred"} />
//                       <DetailItem label="OTP" value={viewRestaurant.otp || "Not set"} />
//                       <DetailItem label="Categories" value={viewRestaurant.categories?.length ? viewRestaurant.categories.map(c => typeof c === 'object' ? c.categoryName : c).join(', ') : "No categories"} />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Disclaimers Section - New */}
//                 {viewRestaurant.disclaimers && viewRestaurant.disclaimers.length > 0 && (
//                   <div className="border-t pt-6">
//                     <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                       <FiFileText className="w-5 h-5 text-orange-600" />
//                       Disclaimers
//                     </h5>
//                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                       <ul className="list-disc list-inside space-y-2">
//                         {viewRestaurant.disclaimers.map((disclaimer, index) => (
//                           <li key={index} className="text-sm text-gray-700">
//                             {disclaimer}
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 )}

//                 {/* Documents Section */}
//                 <div className="border-t pt-6">
//                   <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <FiFileText className="w-5 h-5 text-red-600" />
//                     Restaurant Documents & Certificates
//                   </h5>

//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {hasDocument(viewRestaurant.gstCertificate) ? (
//                       <DocumentCard 
//                         title="GST Certificate"
//                         document={viewRestaurant.gstCertificate}
//                         restaurantName={viewRestaurant.restaurantName}
//                       />
//                     ) : (
//                       <EmptyDocumentCard title="GST Certificate" />
//                     )}

//                     {hasDocument(viewRestaurant.fssaiLicense) ? (
//                       <DocumentCard 
//                         title="FSSAI License"
//                         document={viewRestaurant.fssaiLicense}
//                         restaurantName={viewRestaurant.restaurantName}
//                       />
//                     ) : (
//                       <EmptyDocumentCard title="FSSAI License" />
//                     )}

//                     {hasDocument(viewRestaurant.panCard) ? (
//                       <DocumentCard 
//                         title="PAN Card"
//                         document={viewRestaurant.panCard}
//                         restaurantName={viewRestaurant.restaurantName}
//                       />
//                     ) : (
//                       <EmptyDocumentCard title="PAN Card" />
//                     )}

//                     {hasDocument(viewRestaurant.aadharCardFront) ? (
//                       <DocumentCard 
//                         title="Aadhar Card Front"
//                         document={viewRestaurant.aadharCardFront}
//                         restaurantName={viewRestaurant.restaurantName}
//                       />
//                     ) : (
//                       <EmptyDocumentCard title="Aadhar Card Front" />
//                     )}

//                     {hasDocument(viewRestaurant.aadharCardBack) ? (
//                       <DocumentCard 
//                         title="Aadhar Card Back"
//                         document={viewRestaurant.aadharCardBack}
//                         restaurantName={viewRestaurant.restaurantName}
//                       />
//                     ) : (
//                       <EmptyDocumentCard title="Aadhar Card Back" />
//                     )}

//                     {hasDocument(viewRestaurant.declarationForm) ? (
//                       <DocumentCard 
//                         title="Declaration Form"
//                         document={viewRestaurant.declarationForm}
//                         restaurantName={viewRestaurant.restaurantName}
//                       />
//                     ) : (
//                       <EmptyDocumentCard title="Declaration Form" />
//                     )}

//                     {hasDocument(viewRestaurant.vendorAgreement) ? (
//                       <DocumentCard 
//                         title="Vendor Agreement"
//                         document={viewRestaurant.vendorAgreement}
//                         restaurantName={viewRestaurant.restaurantName}
//                       />
//                     ) : (
//                       <EmptyDocumentCard title="Vendor Agreement" />
//                     )}

//                     {hasDocument(viewRestaurant.image) ? (
//                       <DocumentCard 
//                         title="Restaurant Image"
//                         document={viewRestaurant.image}
//                         restaurantName={viewRestaurant.restaurantName}
//                       />
//                     ) : (
//                       <EmptyDocumentCard title="Restaurant Image" />
//                     )}
//                   </div>
//                 </div>

//                 {/* Wallet Transactions Section */}
//                 {viewRestaurant.walletTransactions && viewRestaurant.walletTransactions.length > 0 && (
//                   <div className="border-t pt-6">
//                     <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                       <FiDollarSign className="w-5 h-5 text-green-600" />
//                       Wallet Transactions
//                     </h5>
//                     <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="border-b border-gray-200">
//                             <th className="text-left py-2 px-2">Date</th>
//                             <th className="text-left py-2 px-2">Amount</th>
//                             <th className="text-left py-2 px-2">Type</th>
//                             <th className="text-left py-2 px-2">Description</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {viewRestaurant.walletTransactions.map((transaction, index) => (
//                             <tr key={index} className="border-b border-gray-200 last:border-0">
//                               <td className="py-2 px-2">
//                                 {new Date(transaction.dateAdded).toLocaleDateString()}
//                               </td>
//                               <td className="py-2 px-2 font-medium text-green-600">
//                                 +₹{transaction.amount}
//                               </td>
//                               <td className="py-2 px-2">
//                                 <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
//                                   {transaction.type}
//                                 </span>
//                               </td>
//                               <td className="py-2 px-2 text-xs text-gray-600">
//                                 {transaction.description}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {/* Additional Information */}
//                 {(viewRestaurant.myAccounts?.length > 0 || viewRestaurant.reviews?.length > 0 || viewRestaurant.myPlans?.length > 0) && (
//                   <div className="border-t pt-6">
//                     <h5 className="font-semibold text-gray-800 mb-4">Additional Information</h5>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       {viewRestaurant.walletTransactions?.length > 0 && (
//                         <div className="bg-blue-50 p-3 rounded">
//                           <div className="text-blue-700 font-medium">{viewRestaurant.walletTransactions.length}</div>
//                           <div className="text-blue-600 text-sm">Wallet Transactions</div>
//                         </div>
//                       )}
//                       {viewRestaurant.myAccounts?.length > 0 && (
//                         <div className="bg-green-50 p-3 rounded">
//                           <div className="text-green-700 font-medium">{viewRestaurant.myAccounts.length}</div>
//                           <div className="text-green-600 text-sm">Linked Accounts</div>
//                         </div>
//                       )}
//                       {viewRestaurant.reviews?.length > 0 && (
//                         <div className="bg-yellow-50 p-3 rounded">
//                           <div className="text-yellow-700 font-medium">{viewRestaurant.reviews.length}</div>
//                           <div className="text-yellow-600 text-sm">Customer Reviews</div>
//                         </div>
//                       )}
//                       {viewRestaurant.myPlans?.length > 0 && (
//                         <div className="bg-purple-50 p-3 rounded">
//                           <div className="text-purple-700 font-medium">{viewRestaurant.myPlans.length}</div>
//                           <div className="text-purple-600 text-sm">Active Plans</div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Footer */}
//               <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
//                 <button
//                   onClick={() => setIsViewOpen(false)}
//                   className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={() => handleEdit(viewRestaurant)}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Edit Restaurant
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add to Wallet Modal */}
//       {isWalletOpen && walletRestaurant && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-6">
//                 <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                   <FiDollarSign className="text-green-600" />
//                   Add to Wallet
//                 </h3>
//                 <button
//                   onClick={() => setIsWalletOpen(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <FiX className="w-6 h-6" />
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <p className="font-medium text-gray-900">{walletRestaurant.restaurantName}</p>
//                   <p className="text-sm text-gray-600">Current Wallet: ₹{walletRestaurant.walletBalance || "0.00"}</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Amount to Add (₹)
//                   </label>
//                   <input
//                     type="number"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     placeholder="Enter amount"
//                     min="1"
//                     step="0.01"
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description (Optional)
//                   </label>
//                   <textarea
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     placeholder="Add description for this transaction"
//                     rows="3"
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//                   <p className="text-sm text-yellow-800">
//                     This amount will be credited to the restaurant's wallet balance and will be reflected immediately.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   onClick={() => setIsWalletOpen(false)}
//                   className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                   disabled={walletLoading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddAmount}
//                   disabled={walletLoading || !amount}
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
//                 >
//                   {walletLoading ? "Adding..." : "Add Amount"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Category Assignment Modal */}
//       {isCategoryOpen && categoryRestaurant && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-6">
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                     <FiFolder className="text-indigo-600" />
//                     Assign Categories
//                   </h3>
//                   <p className="text-gray-600 mt-1">{categoryRestaurant.restaurantName}</p>
//                 </div>
//                 <button
//                   onClick={() => setIsCategoryOpen(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <FiX className="w-6 h-6" />
//                 </button>
//               </div>

//               {/* Search Categories */}
//               <div className="mb-4">
//                 <input
//                   type="text"
//                   value={categorySearch}
//                   onChange={(e) => setCategorySearch(e.target.value)}
//                   placeholder="Search categories..."
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>

//               {/* Categories List */}
//               <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
//                 {filteredCategories.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     No categories found
//                   </div>
//                 ) : (
//                   filteredCategories.map((category) => (
//                     <div
//                       key={category._id}
//                       onClick={() => toggleCategory(category._id)}
//                       className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
//                         selectedCategories.includes(category._id)
//                           ? "bg-indigo-50 border border-indigo-200"
//                           : "hover:bg-gray-50 border border-transparent"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         {category.imageUrl ? (
//                           <img
//                             src={category.imageUrl}
//                             alt={category.categoryName}
//                             className="w-10 h-10 rounded-lg object-cover"
//                             onError={(e) => {
//                               e.target.src = "https://via.placeholder.com/40x40?text=Category";
//                             }}
//                           />
//                         ) : (
//                           <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
//                             <FiFolder className="w-5 h-5 text-gray-500" />
//                           </div>
//                         )}
//                         <div>
//                           <div className="font-medium text-gray-900">{category.categoryName}</div>
//                           <div className="text-xs text-gray-500">
//                             Status: {category.status}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedCategories.includes(category._id)}
//                           onChange={() => toggleCategory(category._id)}
//                           className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                         />
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>

//               {/* Selected Count */}
//               <div className="mt-4 text-sm text-gray-600">
//                 {selectedCategories.length} categories selected
//               </div>

//               {/* Footer */}
//               <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
//                 <button
//                   onClick={() => setIsCategoryOpen(false)}
//                   className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                   disabled={categoryLoading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSaveCategories}
//                   disabled={categoryLoading}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
//                 >
//                   {categoryLoading ? "Saving..." : "Save Categories"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {isEditOpen && editRestaurant && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-6">
//                 <h3 className="text-xl font-bold text-gray-900">Edit Restaurant</h3>
//                 <button
//                   onClick={() => setIsEditOpen(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <FiX className="w-6 h-6" />
//                 </button>
//               </div>

//               {/* User Info Display */}
//               {userInfo.role === "subadmin" && (
//                 <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
//                   <p className="text-sm text-purple-800">
//                     You are editing as <strong>{userInfo.name}</strong> (Sub-Admin)
//                   </p>
//                 </div>
//               )}

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Restaurant Name
//                   </label>
//                   <input
//                     type="text"
//                     value={editRestaurant.restaurantName}
//                     onChange={(e) =>
//                       setEditRestaurant({ ...editRestaurant, restaurantName: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     value={editRestaurant.description}
//                     onChange={(e) =>
//                       setEditRestaurant({ ...editRestaurant, description: e.target.value })
//                     }
//                     rows="3"
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Location
//                   </label>
//                   <input
//                     type="text"
//                     value={editRestaurant.locationName}
//                     onChange={(e) =>
//                       setEditRestaurant({ ...editRestaurant, locationName: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Rating
//                     </label>
//                     <input
//                       type="number"
//                       value={editRestaurant.rating}
//                       onChange={(e) =>
//                         setEditRestaurant({ ...editRestaurant, rating: e.target.value })
//                       }
//                       min="0"
//                       max="5"
//                       step="0.1"
//                       className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Commission (%)
//                     </label>
//                     <input
//                       type="number"
//                       value={editRestaurant.commission}
//                       onChange={(e) =>
//                         setEditRestaurant({ ...editRestaurant, commission: e.target.value })
//                       }
//                       min="0"
//                       max="50"
//                       step="1"
//                       className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">Must be between 0-50</p>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <select
//                     value={editRestaurant.status}
//                     onChange={(e) =>
//                       setEditRestaurant({ ...editRestaurant, status: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                     <option value="rejected">Rejected</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     GST Number
//                   </label>
//                   <input
//                     type="text"
//                     value={editRestaurant.gstNumber}
//                     onChange={(e) =>
//                       setEditRestaurant({ ...editRestaurant, gstNumber: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   onClick={() => setIsEditOpen(false)}
//                   className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSaveEdit}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Helper component for detail items
// const DetailItem = ({ label, value, className = "" }) => (
//   <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
//     <span className="font-medium text-gray-600 text-sm">{label}</span>
//     <span className={`text-gray-900 font-medium text-sm ${className}`}>
//       {value || "-"}
//     </span>
//   </div>
// );

// // Stat Card Component
// const StatCard = ({ title, value, icon, color = "blue" }) => {
//   const colorClasses = {
//     blue: "bg-blue-50 border-blue-200 text-blue-700",
//     green: "bg-green-50 border-green-200 text-green-700",
//     purple: "bg-purple-50 border-purple-200 text-purple-700",
//     yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
//     indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
//     pink: "bg-pink-50 border-pink-200 text-pink-700",
//   };

//   return (
//     <div className={`border rounded-xl p-4 ${colorClasses[color]}`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="text-2xl font-bold">{value}</div>
//           <div className="text-sm opacity-80">{title}</div>
//         </div>
//         <div className="text-2xl">{icon}</div>
//       </div>
//     </div>
//   );
// };

// // Empty Document Card Component
// const EmptyDocumentCard = ({ title }) => (
//   <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
//     <div className="flex items-center justify-between mb-3">
//       <h6 className="font-medium text-gray-500 text-sm">{title}</h6>
//     </div>
//     <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
//       <span className="text-gray-400 text-sm">Not uploaded</span>
//     </div>
//   </div>
// );

// // Document Card Component
// const DocumentCard = ({ title, document, restaurantName }) => {
//   const [isImageModalOpen, setIsImageModalOpen] = useState(false);

//   // Function to download document
//   const downloadDocument = () => {
//     if (!document || !document.url) {
//       alert("No document available to download");
//       return;
//     }

//     try {
//       const link = document.createElement('a');
//       link.href = document.url;
//       link.target = '_blank';
//       link.rel = 'noopener noreferrer';

//       // For PDFs and other documents, open in new tab
//       const fileExtension = document.url.split('.').pop()?.split('?')[0] || 'pdf';
//       const isPDF = fileExtension.toLowerCase() === 'pdf' || document.url.includes('.pdf');

//       if (isPDF) {
//         // For PDFs, open in new tab for viewing/download
//         window.open(document.url, '_blank');
//       } else {
//         // For images, trigger download
//         const fileName = `${restaurantName}_${title.replace(/\s+/g, '_')}_${document.public_id || 'document'}.${fileExtension}`;
//         link.download = fileName;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       }
//     } catch (error) {
//       console.error('Error downloading document:', error);
//       alert('Error downloading document. Please try again.');
//     }
//   };

//   // Check if document is an image
//   const isImage = (url) => {
//     if (!url) return false;
//     const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
//     const extension = url.split('.').pop()?.split('?')[0].toLowerCase();
//     return imageExtensions.includes(extension);
//   };

//   const documentIsImage = isImage(document?.url);

//   return (
//     <>
//       <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
//         <div className="flex items-center justify-between mb-3">
//           <h6 className="font-medium text-gray-700 text-sm">{title}</h6>
//           <div className="flex gap-1">
//             <button
//               onClick={downloadDocument}
//               className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
//               title="Download/View Document"
//             >
//               <FiDownload className="w-3 h-3" />
//             </button>
//             <button
//               onClick={() => setIsImageModalOpen(true)}
//               className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
//               title="View Document"
//             >
//               <FiEye className="w-3 h-3" />
//             </button>
//           </div>
//         </div>

//         <div className="relative group">
//           {documentIsImage ? (
//             <img
//               src={document.url}
//               alt={title}
//               className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity cursor-pointer"
//               onClick={() => setIsImageModalOpen(true)}
//               onError={(e) => {
//                 e.target.src = "https://via.placeholder.com/300x128?text=Document+Not+Available";
//                 e.target.className = "w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-100 p-4";
//               }}
//             />
//           ) : (
//             <div 
//               className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border border-gray-200 group-hover:bg-gray-200 transition-colors"
//               onClick={() => setIsImageModalOpen(true)}
//             >
//               <div className="text-center">
//                 <FiFileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                 <span className="text-xs text-gray-500">PDF Document</span>
//               </div>
//             </div>
//           )}
//           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
//             <FiZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//           </div>
//         </div>

//         <div className="mt-2 text-xs text-gray-500">
//           <div className="truncate">ID: {document?.public_id || "N/A"}</div>
//           {document?.uploadedAt && (
//             <div className="text-xs text-gray-400 mt-1">
//               Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Image Modal for full view */}
//       {isImageModalOpen && document?.url && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
//           <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full">
//             <div className="p-4 border-b flex justify-between items-center bg-gray-50">
//               <div>
//                 <h3 className="font-semibold text-gray-900">{title}</h3>
//                 <p className="text-sm text-gray-600">{restaurantName}</p>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={downloadDocument}
//                   className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
//                 >
//                   <FiDownload className="w-4 h-4" />
//                   Download
//                 </button>
//                 <a
//                   href={document.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
//                 >
//                   <FiExternalLink className="w-4 h-4" />
//                   Open
//                 </a>
//                 <button
//                   onClick={() => setIsImageModalOpen(false)}
//                   className="text-gray-500 hover:text-gray-700 p-1"
//                 >
//                   <FiX className="w-6 h-6" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-4 flex justify-center">
//               {documentIsImage ? (
//                 <img
//                   src={document.url}
//                   alt={title}
//                   className="max-w-full h-auto rounded max-h-[70vh]"
//                   onError={(e) => {
//                     e.target.src = "https://via.placeholder.com/600x400?text=Document+Not+Available";
//                     e.target.className = "max-w-full h-auto rounded bg-gray-100 p-8";
//                   }}
//                 />
//               ) : (
//                 <iframe
//                   src={document.url}
//                   title={title}
//                   className="w-full h-[70vh] border-0"
//                   onError={(e) => {
//                     e.target.style.display = 'none';
//                   }}
//                 />
//               )}
//             </div>
//             <div className="p-4 border-t bg-gray-50">
//               <div className="flex justify-between items-center">
//                 <div className="text-sm text-gray-600">
//                   <div>Document ID: {document?.public_id || "N/A"}</div>
//                   {document?.uploadedAt && (
//                     <div>Uploaded: {new Date(document.uploadedAt).toLocaleString()}</div>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => setIsImageModalOpen(false)}
//                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default RestaurantList;



import React, { useEffect, useState, useRef } from "react";
import { FiEdit, FiTrash2, FiX, FiDownload, FiFilter, FiEye, FiDollarSign, FiUser, FiUsers, FiFileText, FiZoomIn, FiExternalLink, FiMapPin, FiCalendar, FiCreditCard, FiPercent, FiFolder, FiUpload } from "react-icons/fi";
import axios from "axios";

const RestaurantList = () => {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRestaurants, setTotalRestaurants] = useState(0);

  const storedRole = localStorage.getItem("role");


  // For Edit Popup
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // For View Popup
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRestaurant, setViewRestaurant] = useState(null);

  // For Add to Wallet Popup
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletRestaurant, setWalletRestaurant] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  // For Category Assignment Popup
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryRestaurant, setCategoryRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [usersFilter, setUsersFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  // Get subAdminId from localStorage
  const getSubAdminId = () => {
    try {
      const userRole = localStorage.getItem("role");
      if (userRole === "subadmin") {
        return localStorage.getItem("adminId");
      }
      return null;
    } catch (error) {
      console.error("Error getting subAdminId:", error);
      return null;
    }
  };

  // Get user info for display
  const getUserInfo = () => {
    try {
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("adminName");
      const email = localStorage.getItem("adminEmail");
      const id = localStorage.getItem("adminId");
      return { role: role || "unknown", name: name || "", email: email || "", id: id || "" };
    } catch (error) {
      console.error("Error getting user info:", error);
      return { role: "unknown", name: "", email: "", id: "" };
    }
  };

  const parseWalletTransactions = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    return transactions.map(t => {
      if (typeof t === 'string') {
        try { return JSON.parse(t); } catch (e) { return null; }
      }
      return t;
    }).filter(t => t !== null);
  };

  const processRestaurantData = (restaurants) => {
    return restaurants.map(restaurant => ({
      ...restaurant,
      walletTransactions: parseWalletTransactions(restaurant.walletTransactions),
      gstCertificate: restaurant.gstCertificate || null,
      fssaiLicense: restaurant.fssaiLicense || null,
      panCard: restaurant.panCard || null,
      aadharCardFront: restaurant.aadharCardFront || null,
      aadharCardBack: restaurant.aadharCardBack || null,
      declarationForm: restaurant.declarationForm || null,
      vendorAgreement: restaurant.vendorAgreement || null,
      image: restaurant.image || null,
      categories: restaurant.categories || [],
      fssaiNo: restaurant.fssaiNo || "",
      disclaimers: restaurant.disclaimers || []
    }));
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`https://api.vegiffy.in/api/allrestaurant`);
      if (res.data?.success) {
        const restaurants = res.data.data || [];
        const processedRestaurants = processRestaurantData(restaurants);
        setAllRestaurants(processedRestaurants);
        setTotalRestaurants(processedRestaurants.length);
        applyFilters(processedRestaurants);
      } else {
        setError("Failed to load restaurants");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`https://api.vegiffy.in/api/category`);
      if (res.data?.success) setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters(allRestaurants);
  }, [searchQuery, statusFilter, ratingFilter, priceFilter, usersFilter, allRestaurants]);

  const applyFilters = (restaurants) => {
    let filtered = [...restaurants];
    if (searchQuery.trim()) {
      filtered = filtered.filter(r =>
        r.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.locationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.mobile?.includes(searchQuery) ||
        r.referralCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.gstNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "All") filtered = filtered.filter(r => r.status === statusFilter);
    if (ratingFilter !== "All") {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(r => (parseFloat(r.rating) || 0) >= minRating);
    }
    if (priceFilter !== "All") {
      filtered = filtered.filter(r => {
        const price = r.startingPrice || 0;
        switch (priceFilter) {
          case "0-100": return price <= 100;
          case "100-200": return price > 100 && price <= 200;
          case "200-300": return price > 200 && price <= 300;
          case "300-500": return price > 300 && price <= 500;
          case "500+": return price > 500;
          default: return true;
        }
      });
    }
    if (usersFilter !== "All") {
      filtered = filtered.filter(r => {
        const totalUsers = r.totalUsers || 0;
        switch (usersFilter) {
          case "0": return totalUsers === 0;
          case "1-10": return totalUsers >= 1 && totalUsers <= 10;
          case "10-50": return totalUsers > 10 && totalUsers <= 50;
          case "50+": return totalUsers > 50;
          default: return true;
        }
      });
    }
    const totalFiltered = filtered.length;
    setTotalPages(Math.ceil(totalFiltered / itemsPerPage));
    setTotalRestaurants(totalFiltered);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredRestaurants(filtered.reverse().slice(startIndex, endIndex));
  };

  useEffect(() => setCurrentPage(1), [searchQuery, statusFilter, ratingFilter, priceFilter, usersFilter]);
  useEffect(() => applyFilters(allRestaurants), [currentPage]);

  const handleEdit = (restaurant) => {
    setEditRestaurant({ ...restaurant });
    setEditImageFile(null);
    // Set preview from existing image
    if (restaurant.image?.url) {
      setEditImagePreview(restaurant.image.url);
    } else {
      setEditImagePreview("");
    }
    setIsEditOpen(true);
  };

  const handleView = (restaurant) => {
    setViewRestaurant(restaurant);
    setIsViewOpen(true);
  };

  const handleAddToWallet = (restaurant) => {
    setWalletRestaurant(restaurant);
    setAmount("");
    setDescription("");
    setIsWalletOpen(true);
  };

  const handleAssignCategory = (restaurant) => {
    setCategoryRestaurant(restaurant);
    setSelectedCategories(restaurant.categories?.map(cat => typeof cat === 'object' ? cat._id : cat) || []);
    setCategorySearch("");
    setIsCategoryOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    try {
      const subAdminId = getSubAdminId();
      const config = subAdminId ? { data: { subAdminId } } : {};
      const res = await axios.delete(`https://api.vegiffy.in/api/restaurant/${id}`, config);
      if (res.data?.success) fetchRestaurants();
      else alert(res.data?.message || "Delete failed");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Server error");
    }
  };

  // ✅ Updated handleSaveEdit with image upload support
  const handleSaveEdit = async () => {
    if (!editRestaurant) return;
    setEditLoading(true);
    try {
      const subAdminId = getSubAdminId();
      const formData = new FormData();

      // Append all text fields
      const fields = [
        "restaurantName", "description", "locationName", "rating", "status",
        "commission", "discount", "email", "mobile", "gstNumber", "fullAddress", "fssaiNo"
      ];
      fields.forEach(field => {
        if (editRestaurant[field] !== undefined && editRestaurant[field] !== "") {
          formData.append(field, editRestaurant[field]);
        }
      });

      // Append commission (number)
      if (editRestaurant.commission !== undefined) {
        formData.append("commission", editRestaurant.commission);
      }

      // Append categories if needed (optional - can be added later via category modal)
      if (editRestaurant.categories && editRestaurant.categories.length > 0) {
        formData.append("categories", JSON.stringify(editRestaurant.categories));
      }

      // Append subAdminId if exists
      if (subAdminId) {
        formData.append("subAdminId", subAdminId);
      }

      // Append image file if changed
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      const res = await axios.put(
        `https://api.vegiffy.in/api/restaurant/${editRestaurant._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data?.success) {
        fetchRestaurants();
        setIsEditOpen(false);
        setEditRestaurant(null);
        setEditImageFile(null);
        setEditImagePreview("");
        alert("Restaurant updated successfully ✅");
      } else {
        alert(res.data?.message || "Update failed");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Server error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveCategories = async () => {
    if (!categoryRestaurant) return;
    setCategoryLoading(true);
    try {
      const subAdminId = getSubAdminId();
      const requestData = { categories: selectedCategories };
      if (subAdminId) requestData.subAdminId = subAdminId;
      const res = await axios.put(`https://api.vegiffy.in/api/restaurant/${categoryRestaurant._id}`, requestData);
      if (res.data?.success) {
        alert(`Categories successfully assigned to ${categoryRestaurant.restaurantName}`);
        setIsCategoryOpen(false);
        setCategoryRestaurant(null);
        setSelectedCategories([]);
        fetchRestaurants();
      } else {
        alert(res.data?.message || "Failed to assign categories");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Server error");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleAddAmount = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setWalletLoading(true);
    try {
      const subAdminId = getSubAdminId();
      const requestData = { amount: parseFloat(amount), description: description || `Amount added by admin to ${walletRestaurant.restaurantName}` };
      if (subAdminId) requestData.subAdminId = subAdminId;
      const res = await axios.post(`https://api.vegiffy.in/api/add-to-wallet/${walletRestaurant._id}`, requestData);
      if (res.data?.success) {
        alert(`₹${amount} successfully added to ${walletRestaurant.restaurantName}'s wallet`);
        setIsWalletOpen(false);
        setWalletRestaurant(null);
        setAmount("");
        setDescription("");
        fetchRestaurants();
      } else {
        alert(res.data?.message || "Failed to add amount to wallet");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Server error");
    } finally {
      setWalletLoading(false);
    }
  };

  const downloadCSV = () => {
    if (filteredRestaurants.length === 0) return alert("No data to export");
    const headers = ["Name", "Location", "Mobile", "Email", "Rating", "Total Orders", "Total Earnings", "Total Users", "Wallet Balance", "Status", "Referral Code", "GST Number", "FSSAI Number", "Commission", "Categories"];
    const rows = filteredRestaurants.map(r => [
      `"${r.restaurantName}"`,
      `"${r.locationName}"`,
      r.mobile || "-",
      r.email || "-",
      r.rating || "-",
      r.totalOrders || "0",
      `₹${r.totalEarnings || "0.00"}`,
      r.totalUsers || "0",
      `₹${r.walletBalance || "0.00"}`,
      r.status,
      r.referralCode || "-",
      r.gstNumber || "-",
      r.fssaiNo || "-",
      `${r.commission || "0"}%`,
      `"${r.categories?.map(c => typeof c === 'object' ? c.categoryName : c).join(', ') || ''}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `restaurants_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setRatingFilter("All");
    setPriceFilter("All");
    setUsersFilter("All");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const isAnyFilterActive = statusFilter !== "All" || ratingFilter !== "All" || priceFilter !== "All" || usersFilter !== "All" || searchQuery !== "";
  const userInfo = getUserInfo();
  const hasDocument = (doc) => doc && doc.url && doc.url !== null;
  const filteredCategories = categories.filter(cat => cat.categoryName?.toLowerCase().includes(categorySearch.toLowerCase()));
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
  };

  // Handle image file selection in edit modal
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="p-3 bg-blue-100 rounded-lg"><FiUsers className="w-6 h-6 text-blue-600" /></div>
              <div><h1 className="text-2xl font-bold text-gray-900">Restaurant Management</h1><p className="text-gray-600">Manage all restaurants and their data</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${userInfo.role === "subadmin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                Logged in as: {userInfo.role === "subadmin" ? "Sub-Admin" : "Admin"}{userInfo.name && ` - ${userInfo.name}`}
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-2xl font-bold text-blue-600">{totalRestaurants}</p><p className="text-sm text-gray-600">Total Restaurants</p></div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-2xl font-bold text-green-600">{allRestaurants.filter(r => r.status === 'active').length}</p><p className="text-sm text-gray-600">Active</p></div>
              </div>
            </div>
          </div>
          {userInfo.role === "subadmin" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800"><strong>Note:</strong> All updates will be recorded under your name: <strong>{userInfo.name}</strong></p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiFilter className="text-gray-400" /></div>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, location, mobile, email, GST..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters || isAnyFilterActive ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                <FiFilter size={16} /> Filters {isAnyFilterActive && <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">!</span>}
              </button>
            </div>
            <div className="flex gap-2">
              {isAnyFilterActive && <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Reset Filters</button>}
              <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><FiDownload size={18} /> Export CSV</button>
            </div>
          </div>
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-medium text-gray-800">Filters</h3><button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700"><FiX size={20} /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2"><option value="All">All Status</option><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="rejected">Rejected</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label><select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2"><option value="All">All Ratings</option><option value="4.5">4.5+ Stars</option><option value="4.0">4.0+ Stars</option><option value="3.5">3.5+ Stars</option><option value="3.0">3.0+ Stars</option><option value="2.5">2.5+ Stars</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Users</label><select value={usersFilter} onChange={(e) => setUsersFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2"><option value="All">All Users</option><option value="0">0 Users</option><option value="1-10">1-10 Users</option><option value="10-50">10-50 Users</option><option value="50-100">50-100 Users</option><option value="100+">100+ Users</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Orders</label><select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2"><option value="All">All Orders</option><option value="0">0 Orders</option><option value="1-10">1-10 Orders</option><option value="10-50">10-50 Orders</option><option value="50-100">50-100 Orders</option><option value="100+">100+ Orders</option></select></div>
              </div>
              {isAnyFilterActive && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusFilter !== "All" && <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Status: {statusFilter}<button onClick={() => setStatusFilter("All")} className="text-blue-600"><FiX size={12} /></button></span>}
                    {ratingFilter !== "All" && <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Rating: {ratingFilter}+<button onClick={() => setRatingFilter("All")} className="text-green-600"><FiX size={12} /></button></span>}
                    {priceFilter !== "All" && <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Orders: {priceFilter}<button onClick={() => setPriceFilter("All")} className="text-purple-600"><FiX size={12} /></button></span>}
                    {usersFilter !== "All" && <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Users: {usersFilter}<button onClick={() => setUsersFilter("All")} className="text-orange-600"><FiX size={12} /></button></span>}
                    {searchQuery && <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Search: "{searchQuery}"<button onClick={() => setSearchQuery("")} className="text-yellow-600"><FiX size={12} /></button></span>}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRestaurants)} of {totalRestaurants} restaurants{isAnyFilterActive && " (filtered)"}</div>
            <div className="flex gap-2 text-xs">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active: {allRestaurants.filter(r => r.status === 'active').length}</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending: {allRestaurants.filter(r => r.status === 'pending').length}</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Inactive: {allRestaurants.filter(r => r.status === 'inactive').length}</span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading restaurants...</p></div>
          ) : error ? (
            <div className="text-center py-12"><div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto"><p className="font-medium">Error loading restaurants</p><p className="text-sm mt-1">{error}</p><button onClick={fetchRestaurants} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try Again</button></div></div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12"><FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3><p className="text-gray-500 mb-4">{isAnyFilterActive ? 'No restaurants match your current filters' : 'No restaurants available'}</p>{isAnyFilterActive && <button onClick={resetFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Clear all filters</button>}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Location</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Stats</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRestaurants.map((restaurant) => (
                      <tr key={restaurant._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative">
                              <img src={restaurant.image?.url || ""} alt={restaurant.restaurantName} className="h-12 w-12 rounded-lg object-cover" onError={(e) => { e.target.src = ""; }} />
                              {restaurant.rating && <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-1 rounded-full flex items-center">⭐ {restaurant.rating}</div>}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{restaurant.restaurantName}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[180px]">{restaurant.description || 'No description'}</div>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1"><FiMapPin size={10} />{restaurant.locationName || 'Location not set'}</div>
                              {restaurant.categories && restaurant.categories.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{restaurant.categories.map((cat, idx) => <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{typeof cat === 'object' ? cat.categoryName : cat}</span>)}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1"><div className="text-sm text-gray-900 flex items-center gap-1"><FiUser size={12} />{restaurant.email}</div><div className="text-sm text-gray-600 flex items-center gap-1">📱 {restaurant.mobile || 'No phone'}</div><div className="text-xs text-gray-500 flex items-center gap-1"><FiCreditCard size={12} /> GST: {restaurant.gstNumber || 'Not provided'}</div><div className="text-xs text-gray-500 flex items-center gap-1"><FiFileText size={12} /> FSSAI No: {restaurant.fssaiNo || 'Not provided'}</div></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-2 text-xs"><div className="text-center bg-blue-50 p-2 rounded"><div className="font-bold text-blue-700">{restaurant.totalOrders || 0}</div><div className="text-blue-600">Orders</div></div><div className="text-center bg-green-50 p-2 rounded"><div className="font-bold text-green-700">{restaurant.totalUsers || 0}</div><div className="text-green-600">Users</div></div><div className="text-center bg-purple-50 p-2 rounded col-span-2"><div className="font-bold text-purple-700">₹{restaurant.totalEarnings || "0.00"}</div><div className="text-purple-600">Earnings</div></div><div className="text-center bg-yellow-50 p-2 rounded col-span-2"><div className="text-xs text-yellow-700 flex items-center justify-center gap-1"><FiPercent size={10} /> Commission: {restaurant.commission || 0}%</div></div></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${restaurant.status === "active" ? "bg-green-100 text-green-800" : restaurant.status === "pending" ? "bg-yellow-100 text-yellow-800" : restaurant.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>{restaurant.status}</span><div className="text-xs text-gray-500"><div className="flex items-center gap-1"><FiDollarSign size={10} /> Wallet: ₹{restaurant.walletBalance || "0.00"}</div><div className="flex items-center gap-1 mt-1">Referral: {restaurant.referralCode || 'N/A'}</div>{restaurant.note && <div className="text-xs text-gray-400 mt-1 italic">{restaurant.note}</div>}</div></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleView(restaurant)} className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View Details"><FiEye size={18} /></button>
                            <button onClick={() => handleEdit(restaurant)} className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors" title="Edit"><FiEdit size={18} /></button>
                            <button onClick={() => handleAssignCategory(restaurant)} className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors" title="Assign Categories"><FiFolder size={18} /></button>
                            <button onClick={() => handleAddToWallet(restaurant)} className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors" title="Add to Wallet"><FiDollarSign size={18} /></button>
                            {storedRole === 'admin' && (<button onClick={() => handleDelete(restaurant._id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><FiTrash2 size={18} /></button>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600 mb-4 sm:mb-0">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRestaurants)} of {totalRestaurants} restaurants</div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm flex items-center gap-1"><FiX className="w-3 h-3" /> First</button>
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm flex items-center gap-1">← Previous</button>
                    <div className="flex space-x-1">{getPageNumbers().map(page => <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-2 border text-sm min-w-[40px] ${currentPage === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-100"} rounded-lg`}>{page}</button>)}</div>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm flex items-center gap-1">Next →</button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm flex items-center gap-1">Last <FiX className="w-3 h-3" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===================== EDIT MODAL WITH IMAGE UPLOAD ===================== */}
      {isEditOpen && editRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Restaurant</h3>
                <button onClick={() => { setIsEditOpen(false); setEditImageFile(null); setEditImagePreview(""); }} className="text-gray-400 hover:text-gray-600"><FiX className="w-6 h-6" /></button>
              </div>
              {userInfo.role === "subadmin" && <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg"><p className="text-sm text-purple-800">You are editing as <strong>{userInfo.name}</strong> (Sub-Admin)</p></div>}

              {/* Image Upload Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Image</label>
                <div className="flex items-center gap-4">
                  {editImagePreview && (
                    <img src={editImagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-300" />
                  )}
                  <div className="flex-1">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                      <FiUpload /> {editImageFile ? "Change Image" : "Upload New Image"}
                      <input type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                    </label>
                    {editImageFile && <p className="text-xs text-gray-500 mt-1">{editImageFile.name}</p>}
                    {!editImageFile && editRestaurant.image?.url && <p className="text-xs text-gray-500 mt-1">Current image will be kept if not replaced</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label><input type="text" value={editRestaurant.restaurantName} onChange={(e) => setEditRestaurant({ ...editRestaurant, restaurantName: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Description</label><textarea value={editRestaurant.description} onChange={(e) => setEditRestaurant({ ...editRestaurant, description: e.target.value })} rows="3" className="w-full border border-gray-300 rounded-lg p-3" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Location</label><input type="text" value={editRestaurant.locationName} onChange={(e) => setEditRestaurant({ ...editRestaurant, locationName: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Rating</label><input type="number" value={editRestaurant.rating} onChange={(e) => setEditRestaurant({ ...editRestaurant, rating: e.target.value })} min="0" max="5" step="0.1" className="w-full border border-gray-300 rounded-lg p-3" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Commission (%)</label><input type="number" value={editRestaurant.commission} onChange={(e) => setEditRestaurant({ ...editRestaurant, commission: e.target.value })} min="0" max="50" step="1" className="w-full border border-gray-300 rounded-lg p-3" /><p className="text-xs text-gray-500 mt-1">Must be between 0-50</p></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><select value={editRestaurant.status} onChange={(e) => setEditRestaurant({ ...editRestaurant, status: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3"><option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="rejected">Rejected</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label><input type="text" value={editRestaurant.gstNumber} onChange={(e) => setEditRestaurant({ ...editRestaurant, gstNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">FSSAI Number</label><input type="text" value={editRestaurant.fssaiNo} onChange={(e) => setEditRestaurant({ ...editRestaurant, fssaiNo: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={editRestaurant.email} onChange={(e) => setEditRestaurant({ ...editRestaurant, email: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label><input type="tel" value={editRestaurant.mobile} onChange={(e) => setEditRestaurant({ ...editRestaurant, mobile: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label><textarea value={editRestaurant.fullAddress} onChange={(e) => setEditRestaurant({ ...editRestaurant, fullAddress: e.target.value })} rows="2" className="w-full border border-gray-300 rounded-lg p-3" /></div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => { setIsEditOpen(false); setEditImageFile(null); setEditImagePreview(""); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
                <button onClick={handleSaveEdit} disabled={editLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{editLoading ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW MODAL ===================== */}
      {isViewOpen && viewRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6"><div><h3 className="text-2xl font-bold text-gray-900">{viewRestaurant.restaurantName}</h3><p className="text-gray-600">{viewRestaurant.description}</p></div><button onClick={() => setIsViewOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX className="w-6 h-6" /></button></div>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3"><div className="bg-gray-50 rounded-xl p-4"><img src={viewRestaurant.image?.url || "https://via.placeholder.com/400x192"} alt={viewRestaurant.restaurantName} className="w-full h-48 object-cover rounded-lg mb-4" /><div className="space-y-3"><div className="flex items-center justify-between"><span className="text-gray-600">Rating</span><span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">⭐ {viewRestaurant.rating || 'N/A'}</span></div><div className="flex items-center justify-between"><span className="text-gray-600">Categories</span><div className="flex flex-wrap gap-1 justify-end">{viewRestaurant.categories && viewRestaurant.categories.length > 0 ? viewRestaurant.categories.map((cat, idx) => <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{typeof cat === 'object' ? cat.categoryName : cat}</span>) : <span className="text-gray-500 text-xs">No categories</span>}</div></div><div className="flex items-center justify-between"><span className="text-gray-600">Status</span><span className={`px-3 py-1 rounded-full text-sm font-medium ${viewRestaurant.status === "active" ? "bg-green-100 text-green-800" : viewRestaurant.status === "pending" ? "bg-yellow-100 text-yellow-800" : viewRestaurant.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>{viewRestaurant.status}</span></div></div></div></div>
                  <div className="md:w-2/3"><div className="grid grid-cols-2 md:grid-cols-3 gap-4"><StatCard title="Total Orders" value={viewRestaurant.totalOrders || 0} icon="📊" color="blue" /><StatCard title="Total Users" value={viewRestaurant.totalUsers || 0} icon="👥" color="green" /><StatCard title="Total Earnings" value={`₹${viewRestaurant.totalEarnings || "0.00"}`} icon="💰" color="purple" /><StatCard title="Wallet Balance" value={`₹${viewRestaurant.walletBalance || "0.00"}`} icon="💳" color="yellow" /><StatCard title="Commission" value={`${viewRestaurant.commission || 0}%`} icon="📈" color="indigo" /><StatCard title="Discount" value={`${viewRestaurant.discount || 0}%`} icon="🎁" color="pink" /></div><div className="mt-6 grid grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2"><FiCreditCard /> Business Details</h4><DetailItem label="GST Number" value={viewRestaurant.gstNumber} /><DetailItem label="FSSAI Number" value={viewRestaurant.fssaiNo} /><DetailItem label="Commission Percentage" value={`${viewRestaurant.commission || 0}%`} /></div><div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2"><FiCalendar /> Timeline</h4><DetailItem label="Created At" value={new Date(viewRestaurant.createdAt).toLocaleString()} /><DetailItem label="Updated At" value={new Date(viewRestaurant.updatedAt).toLocaleString()} />{viewRestaurant.note && <DetailItem label="Last Updated By" value={viewRestaurant.note} className="text-blue-600" />}</div></div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-5"><h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiUser /> Contact Information</h4><div className="space-y-3"><DetailItem label="Email" value={viewRestaurant.email} /><DetailItem label="Mobile" value={viewRestaurant.mobile} /><DetailItem label="Location" value={viewRestaurant.locationName} />{viewRestaurant.location?.coordinates && <div><div className="flex items-center gap-2 text-gray-800 mb-2"><FiMapPin /> Coordinates</div><div className="grid grid-cols-2 gap-3 pl-6"><div className="bg-gray-50 p-2 rounded"><div className="text-xs text-gray-500">Latitude</div><div className="font-medium">{viewRestaurant.location.coordinates[1]}</div></div><div className="bg-gray-50 p-2 rounded"><div className="text-xs text-gray-500">Longitude</div><div className="font-medium">{viewRestaurant.location.coordinates[0]}</div></div></div></div>}</div></div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5"><h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiFileText /> Business Information</h4><div className="space-y-3"><DetailItem label="Referral Code" value={viewRestaurant.referralCode} /><DetailItem label="Referred By" value={viewRestaurant.referredBy || "Not referred"} /><DetailItem label="OTP" value={viewRestaurant.otp || "Not set"} /><DetailItem label="Categories" value={viewRestaurant.categories?.length ? viewRestaurant.categories.map(c => typeof c === 'object' ? c.categoryName : c).join(', ') : "No categories"} /></div></div>
                </div>
                {viewRestaurant.disclaimers && viewRestaurant.disclaimers.length > 0 && <div className="border-t pt-6"><h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiFileText /> Disclaimers</h5><div className="bg-orange-50 border border-orange-200 rounded-lg p-4"><ul className="list-disc list-inside space-y-2">{viewRestaurant.disclaimers.map((disclaimer, index) => <li key={index} className="text-sm text-gray-700">{disclaimer}</li>)}</ul></div></div>}
                <div className="border-t pt-6"><h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiFileText /> Restaurant Documents & Certificates</h5><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{hasDocument(viewRestaurant.gstCertificate) ? <DocumentCard title="GST Certificate" document={viewRestaurant.gstCertificate} restaurantName={viewRestaurant.restaurantName} /> : <EmptyDocumentCard title="GST Certificate" />}{hasDocument(viewRestaurant.fssaiLicense) ? <DocumentCard title="FSSAI License" document={viewRestaurant.fssaiLicense} restaurantName={viewRestaurant.restaurantName} /> : <EmptyDocumentCard title="FSSAI License" />}{hasDocument(viewRestaurant.panCard) ? <DocumentCard title="PAN Card" document={viewRestaurant.panCard} restaurantName={viewRestaurant.restaurantName} /> : <EmptyDocumentCard title="PAN Card" />}{hasDocument(viewRestaurant.aadharCardFront) ? <DocumentCard title="Aadhar Card Front" document={viewRestaurant.aadharCardFront} restaurantName={viewRestaurant.restaurantName} /> : <EmptyDocumentCard title="Aadhar Card Front" />}{hasDocument(viewRestaurant.aadharCardBack) ? <DocumentCard title="Aadhar Card Back" document={viewRestaurant.aadharCardBack} restaurantName={viewRestaurant.restaurantName} /> : <EmptyDocumentCard title="Aadhar Card Back" />}{hasDocument(viewRestaurant.declarationForm) ? <DocumentCard title="Declaration Form" document={viewRestaurant.declarationForm} restaurantName={viewRestaurant.restaurantName} /> : <EmptyDocumentCard title="Declaration Form" />}{hasDocument(viewRestaurant.vendorAgreement) ? <DocumentCard title="Vendor Agreement" document={viewRestaurant.vendorAgreement} restaurantName={viewRestaurant.restaurantName} /> : <EmptyDocumentCard title="Vendor Agreement" />}{hasDocument(viewRestaurant.image) ? <DocumentCard title="Restaurant Image" document={viewRestaurant.image} restaurantName={viewRestaurant.restaurantName} /> : <EmptyDocumentCard title="Restaurant Image" />}</div></div>
                {viewRestaurant.walletTransactions && viewRestaurant.walletTransactions.length > 0 && <div className="border-t pt-6"><h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiDollarSign /> Wallet Transactions</h5><div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-200"><th className="text-left py-2 px-2">Date</th><th className="text-left py-2 px-2">Amount</th><th className="text-left py-2 px-2">Type</th><th className="text-left py-2 px-2">Description</th></tr></thead><tbody>{viewRestaurant.walletTransactions.map((transaction, index) => (<tr key={index} className="border-b border-gray-200 last:border-0"><td className="py-2 px-2">{new Date(transaction.dateAdded).toLocaleDateString()}</td><td className="py-2 px-2 font-medium text-green-600">+₹{transaction.amount}</td><td className="py-2 px-2"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{transaction.type}</span></td><td className="py-2 px-2 text-xs text-gray-600">{transaction.description}</td></tr>))}</tbody></table></div></div>}
                {(viewRestaurant.myAccounts?.length > 0 || viewRestaurant.reviews?.length > 0 || viewRestaurant.myPlans?.length > 0) && <div className="border-t pt-6"><h5 className="font-semibold text-gray-800 mb-4">Additional Information</h5><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{viewRestaurant.walletTransactions?.length > 0 && <div className="bg-blue-50 p-3 rounded"><div className="text-blue-700 font-medium">{viewRestaurant.walletTransactions.length}</div><div className="text-blue-600 text-sm">Wallet Transactions</div></div>}{viewRestaurant.myAccounts?.length > 0 && <div className="bg-green-50 p-3 rounded"><div className="text-green-700 font-medium">{viewRestaurant.myAccounts.length}</div><div className="text-green-600 text-sm">Linked Accounts</div></div>}{viewRestaurant.reviews?.length > 0 && <div className="bg-yellow-50 p-3 rounded"><div className="text-yellow-700 font-medium">{viewRestaurant.reviews.length}</div><div className="text-yellow-600 text-sm">Customer Reviews</div></div>}{viewRestaurant.myPlans?.length > 0 && <div className="bg-purple-50 p-3 rounded"><div className="text-purple-700 font-medium">{viewRestaurant.myPlans.length}</div><div className="text-purple-600 text-sm">Active Plans</div></div>}</div></div>}
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t"><button onClick={() => setIsViewOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Close</button><button onClick={() => handleEdit(viewRestaurant)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit Restaurant</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {isWalletOpen && walletRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full"><div className="p-6"><div className="flex justify-between items-start mb-6"><h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FiDollarSign className="text-green-600" /> Add to Wallet</h3><button onClick={() => setIsWalletOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX className="w-6 h-6" /></button></div><div className="space-y-4"><div className="bg-gray-50 p-4 rounded-lg"><p className="font-medium text-gray-900">{walletRestaurant.restaurantName}</p><p className="text-sm text-gray-600">Current Wallet: ₹{walletRestaurant.walletBalance || "0.00"}</p></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Amount to Add (₹)</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" min="1" step="0.01" className="w-full border border-gray-300 rounded-lg p-3" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add description for this transaction" rows="3" className="w-full border border-gray-300 rounded-lg p-3" /></div><div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-sm text-yellow-800">This amount will be credited to the restaurant's wallet balance and will be reflected immediately.</p></div></div><div className="flex justify-end space-x-3 mt-6"><button onClick={() => setIsWalletOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" disabled={walletLoading}>Cancel</button><button onClick={handleAddAmount} disabled={walletLoading || !amount} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{walletLoading ? "Adding..." : "Add Amount"}</button></div></div></div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryOpen && categoryRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div className="p-6"><div className="flex justify-between items-start mb-6"><div><h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FiFolder className="text-indigo-600" /> Assign Categories</h3><p className="text-gray-600 mt-1">{categoryRestaurant.restaurantName}</p></div><button onClick={() => setIsCategoryOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX className="w-6 h-6" /></button></div><div className="mb-4"><input type="text" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} placeholder="Search categories..." className="w-full border border-gray-300 rounded-lg p-3" /></div><div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">{filteredCategories.length === 0 ? <div className="text-center py-8 text-gray-500">No categories found</div> : filteredCategories.map((category) => (<div key={category._id} onClick={() => toggleCategory(category._id)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedCategories.includes(category._id) ? "bg-indigo-50 border border-indigo-200" : "hover:bg-gray-50 border border-transparent"}`}><div className="flex items-center gap-3">{category.imageUrl ? <img src={category.imageUrl} alt={category.categoryName} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { e.target.src = "https://via.placeholder.com/40x40?text=Category"; }} /> : <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center"><FiFolder className="w-5 h-5 text-gray-500" /></div>}<div><div className="font-medium text-gray-900">{category.categoryName}</div><div className="text-xs text-gray-500">Status: {category.status}</div></div></div><div className="flex items-center"><input type="checkbox" checked={selectedCategories.includes(category._id)} onChange={() => toggleCategory(category._id)} className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /></div></div>))}</div><div className="mt-4 text-sm text-gray-600">{selectedCategories.length} categories selected</div><div className="flex justify-end space-x-3 mt-6 pt-6 border-t"><button onClick={() => setIsCategoryOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" disabled={categoryLoading}>Cancel</button><button onClick={handleSaveCategories} disabled={categoryLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">{categoryLoading ? "Saving..." : "Save Categories"}</button></div></div></div>
        </div>
      )}
    </div>
  );
};

// Helper Components (unchanged)
const DetailItem = ({ label, value, className = "" }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-medium text-gray-600 text-sm">{label}</span>
    <span className={`text-gray-900 font-medium text-sm ${className}`}>{value || "-"}</span>
  </div>
);

const StatCard = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = { blue: "bg-blue-50 border-blue-200 text-blue-700", green: "bg-green-50 border-green-200 text-green-700", purple: "bg-purple-50 border-purple-200 text-purple-700", yellow: "bg-yellow-50 border-yellow-200 text-yellow-700", indigo: "bg-indigo-50 border-indigo-200 text-indigo-700", pink: "bg-pink-50 border-pink-200 text-pink-700" };
  return <div className={`border rounded-xl p-4 ${colorClasses[color]}`}><div className="flex items-center justify-between"><div><div className="text-2xl font-bold">{value}</div><div className="text-sm opacity-80">{title}</div></div><div className="text-2xl">{icon}</div></div></div>;
};

const EmptyDocumentCard = ({ title }) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50"><div className="flex items-center justify-between mb-3"><h6 className="font-medium text-gray-500 text-sm">{title}</h6></div><div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300"><span className="text-gray-400 text-sm">Not uploaded</span></div></div>
);

const DocumentCard = ({ title, document, restaurantName }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const downloadDocument = () => {
    if (!document?.url) return alert("No document available");
    const link = document.createElement('a');
    link.href = document.url;
    link.target = '_blank';
    const isPDF = document.url.split('.').pop()?.toLowerCase() === 'pdf';
    if (isPDF) window.open(document.url, '_blank');
    else { const fileName = `${restaurantName}_${title.replace(/\s+/g, '_')}_${document.public_id || 'document'}.${document.url.split('.').pop()}`; link.download = fileName; document.body.appendChild(link); link.click(); document.body.removeChild(link); }
  };
  const isImage = (url) => {
    if (!url) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const ext = url.split('.').pop()?.split('?')[0].toLowerCase();
    return imageExtensions.includes(ext);
  };
  const documentIsImage = isImage(document?.url);
  return (<><div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"><div className="flex items-center justify-between mb-3"><h6 className="font-medium text-gray-700 text-sm">{title}</h6><div className="flex gap-1"><button onClick={downloadDocument} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"><FiDownload className="w-3 h-3" /></button><button onClick={() => setIsImageModalOpen(true)} className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"><FiEye className="w-3 h-3" /></button></div></div><div className="relative group">{documentIsImage ? <img src={document.url} alt={title} className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 cursor-pointer" onClick={() => setIsImageModalOpen(true)} onError={(e) => { e.target.src = "https://via.placeholder.com/300x128?text=Document+Not+Available"; e.target.className = "w-full h-32 object-contain rounded-lg border border-gray-200 bg-gray-100 p-4"; }} /> : <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border border-gray-200 group-hover:bg-gray-200" onClick={() => setIsImageModalOpen(true)}><div className="text-center"><FiFileText className="w-8 h-8 text-gray-400 mx-auto mb-2" /><span className="text-xs text-gray-500">PDF Document</span></div></div>}<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center"><FiZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" /></div></div><div className="mt-2 text-xs text-gray-500"><div className="truncate">ID: {document?.public_id || "N/A"}</div>{document?.uploadedAt && <div className="text-xs text-gray-400 mt-1">Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</div>}</div></div>
    {isImageModalOpen && document?.url && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"><div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full"><div className="p-4 border-b flex justify-between items-center bg-gray-50"><div><h3 className="font-semibold text-gray-900">{title}</h3><p className="text-sm text-gray-600">{restaurantName}</p></div><div className="flex gap-2"><button onClick={downloadDocument} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><FiDownload /> Download</button><a href={document.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"><FiExternalLink /> Open</a><button onClick={() => setIsImageModalOpen(false)} className="text-gray-500 hover:text-gray-700 p-1"><FiX className="w-6 h-6" /></button></div></div><div className="p-4 flex justify-center">{documentIsImage ? <img src={document.url} alt={title} className="max-w-full h-auto rounded max-h-[70vh]" onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=Document+Not+Available"; e.target.className = "max-w-full h-auto rounded bg-gray-100 p-8"; }} /> : <iframe src={document.url} title={title} className="w-full h-[70vh] border-0" />}</div><div className="p-4 border-t bg-gray-50"><div className="flex justify-between items-center"><div className="text-sm text-gray-600"><div>Document ID: {document?.public_id || "N/A"}</div>{document?.uploadedAt && <div>Uploaded: {new Date(document.uploadedAt).toLocaleString()}</div>}</div><button onClick={() => setIsImageModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button></div></div></div></div>)}
  </>);
};

export default RestaurantList;