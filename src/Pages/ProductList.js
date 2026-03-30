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

  const getUserInfo = () => {
    try {
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("adminName");
      const email = localStorage.getItem("adminEmail");
      const id = localStorage.getItem("adminId");
      setUserInfo({ role: role || "unknown", name: name || "", email: email || "", id: id || "" });
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

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400 ml-1" size={10} />;
    return sortConfig.direction === "asc" ?
      <FaSortUp className="text-blue-600 ml-1" size={10} /> :
      <FaSortDown className="text-blue-600 ml-1" size={10} />;
  };

  useEffect(() => {
    let filtered = [...products];
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
    if (statusFilter !== "All") filtered = filtered.filter((p) => p.status === statusFilter);
    if (categoryFilter !== "All") filtered = filtered.filter((p) => p.category === categoryFilter);
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    } else {
      filtered.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }
    setFilteredProducts(filtered);
    setCurrentPage(1);
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
    const rows = csvData.map((row) => header.map((field) => `"${row[field] ?? ""}"`).join(","));
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
      const res = await fetch(`https://api.vegiffyy.com/api/restaurant-products/${productId}/${recommendedId}`, { method: "DELETE" });
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
      const originalProduct = products.find(p => p._id === recommendedId);
      if (!originalProduct) {
        alert("Product not found");
        setUpdateLoading(false);
        return;
      }
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
      if (editProduct.tags) {
        recommendedData.tags = Array.isArray(editProduct.tags) ? editProduct.tags : [editProduct.tags];
      }
      if (editProduct.category) {
        recommendedData.category = editProduct.category;
      }
      formData.append("recommended", JSON.stringify(recommendedData));
      if (editProduct.newImage) {
        formData.append("recommendedImage", editProduct.newImage);
      }
      const response = await axios.put(
        `https://api.vegiffyy.com/api/restaurant-product/${productId}/${recommendedId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        alert("Product updated successfully!");
        setShowEditModal(false);
        setEditProduct(null);
        fetchProducts();
      } else {
        alert("Failed to update product: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProduct(prev => ({ ...prev, newImage: file, image: URL.createObjectURL(file) }));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium";
      case "inactive": return "bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium";
      default: return "bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium";
    }
  };

  const categoriesList = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  const statuses = ["All", ...new Set(products.map(p => p.status).filter(Boolean))];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "";
    const category = categories.find(c => c._id === categoryId);
    return category?.categoryName || categoryId;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="min-h-screen bg-gray-50 p-2 overflow-x-auto">
      {/* Header - Compact */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 pb-2 border-b bg-white p-2 rounded shadow-sm">
        <div>
          <h1 className="text-base font-bold text-gray-800 flex items-center gap-1">
            <FaUtensils className="text-orange-500 text-sm" />
            Product Management
          </h1>
          <p className="text-[10px] text-gray-500">Manage and track all restaurant products (Ascending order)</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-[10px] mt-2 md:mt-0">
          <FaUser className="text-blue-600 text-[10px]" />
          <div className="font-medium text-blue-800 truncate max-w-[100px]">{userInfo.name || 'Admin'}</div>
          <div className="text-[9px] text-blue-600 capitalize">{userInfo.role}</div>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded shadow">
          <p className="text-[9px] text-blue-100">Total Products</p>
          <p className="text-base font-bold">{products.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-2 rounded shadow">
          <p className="text-[9px] text-green-100">Active</p>
          <p className="text-base font-bold">{products.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 rounded shadow">
          <p className="text-[9px] text-orange-100">Restaurants</p>
          <p className="text-base font-bold">{restaurants.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-2 rounded shadow">
          <p className="text-[9px] text-purple-100">Avg Price</p>
          <p className="text-xs font-bold">{formatCurrency(products.reduce((sum, p) => sum + (p.price || 0), 0) / (products.length || 1))}</p>
        </div>
      </div>

      {/* Search & Filters - Compact */}
      <div className="bg-white p-2 rounded shadow mb-3">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2">
          <div className="relative w-full lg:max-w-xs">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px]" />
            <input type="text" placeholder="Search products, restaurants, tags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-7 pr-2 py-1 border rounded text-[11px]" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-1 border rounded text-[11px]">
              {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-2 py-1 border rounded text-[11px]">
              {categoriesList.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
            </select>
            <button onClick={downloadExcel} className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-[10px]"><FaFileExcel size={10} /> Excel</button>
            <button onClick={downloadCSV} className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded text-[10px]"><FaFileCsv size={10} /> CSV</button>
          </div>
        </div>
        <div className="mt-1 text-[10px] text-gray-500">Showing {currentProducts.length} of {filteredProducts.length} products (Sorted by Name)</div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4 bg-white rounded shadow"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div><p className="ml-2 text-xs">Loading...</p></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-center"><p className="text-red-600 text-xs">{error}</p><button onClick={fetchProducts} className="mt-1 px-2 py-0.5 bg-red-600 text-white rounded text-[10px]">Try Again</button></div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-center"><FaBoxOpen className="text-gray-300 text-3xl mx-auto mb-2" /><p className="text-gray-500 text-sm">No products found.</p></div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold">#</th>
                  <th className="px-2 py-1 text-left font-semibold cursor-pointer" onClick={() => requestSort("name")}><div className="flex items-center">Product Name {getSortIcon("name")}</div></th>
                  <th className="px-2 py-1 text-left font-semibold">Restaurant</th>
                  <th className="px-2 py-1 text-left font-semibold">Location</th>
                  <th className="px-2 py-1 text-left font-semibold cursor-pointer" onClick={() => requestSort("price")}><div className="flex items-center">Price {getSortIcon("price")}</div></th>
                  <th className="px-2 py-1 text-left font-semibold cursor-pointer" onClick={() => requestSort("discount")}><div className="flex items-center">Discount {getSortIcon("discount")}</div></th>
                  <th className="px-2 py-1 text-left font-semibold cursor-pointer" onClick={() => requestSort("status")}><div className="flex items-center">Status {getSortIcon("status")}</div></th>
                  <th className="px-2 py-1 text-left font-semibold">Tags</th>
                  <th className="px-2 py-1 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product, idx) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 text-gray-600">{(currentPage-1)*itemsPerPage+idx+1}</td>
                    <td className="px-2 py-1"><div className="flex items-center gap-1"><img src={product.image || "https://via.placeholder.com/30x30"} alt={product.name} className="w-6 h-6 rounded object-cover border" /><div><div className="font-medium text-[11px]">{product.name}</div><div className="text-[9px] text-gray-500 truncate max-w-[120px]">{product.content?.substring(0,30)}...</div></div></div></td>
                    <td className="px-2 py-1"><div className="font-medium text-[11px]">{product.restaurantName}</div><div className="text-[9px] text-gray-500">ID: {product.restaurantId?.substring(0,6)}...</div></td>
                    <td className="px-2 py-1"><div className="flex items-center gap-0.5"><FaMapMarkerAlt className="text-gray-400 text-[8px]" /><span>{product.locationName || "N/A"}</span></div></td>
                    <td className="px-2 py-1"><div className="font-bold text-green-700 text-[11px]">{formatCurrency(product.price)}</div>{product.halfPlatePrice > 0 && <div className="text-[9px] text-gray-500">½: ₹{product.halfPlatePrice}</div>}{product.fullPlatePrice > 0 && <div className="text-[9px] text-gray-500">Full: ₹{product.fullPlatePrice}</div>}</td>
                    <td className="px-2 py-1">{product.discount > 0 ? <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-[9px] font-medium">{product.discount}% OFF</span> : <span className="text-gray-400 text-[9px]">No Discount</span>}</td>
                    <td className="px-2 py-1"><span className={getStatusClass(product.status)}>{product.status}</span></td>
                    <td className="px-2 py-1"><div className="flex flex-wrap gap-0.5 max-w-[100px]">{product.tags && product.tags.slice(0,2).map((tag,i) => <span key={i} className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[9px]">#{tag}</span>)}{product.tags && product.tags.length > 2 && <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[9px]">+{product.tags.length-2}</span>}</div>{product.preparationTime && <div className="flex items-center gap-0.5 text-[9px] text-gray-500 mt-0.5"><FaClock size={8} />{product.preparationTime} mins</div>}</td>
                    <td className="px-2 py-1 text-center"><div className="flex gap-1 justify-center"><button onClick={() => { setViewProduct(product); setShowViewModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View"><FaEye size={12} /></button><button onClick={() => { setEditProduct(product); setShowEditModal(true); }} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Edit"><FaEdit size={12} /></button><button onClick={() => deleteProduct(product.restaurantId, product._id)} disabled={deleteLoading === product._id} className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50">{deleteLoading === product._id ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div> : <FaTrashAlt size={12} />}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Compact */}
          {filteredProducts.length > itemsPerPage && (
            <div className="flex justify-between items-center px-2 py-1 border-t bg-gray-50 text-[10px]">
              <div className="text-gray-600">Showing {indexOfFirstItem+1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}</div>
              <div className="flex gap-1">
                <button onClick={prevPage} disabled={currentPage===1} className={`px-2 py-0.5 rounded ${currentPage===1 ? 'bg-gray-100 text-gray-400' : 'bg-white border'}`}>Prev</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i+1;
                  if (totalPages>5 && currentPage>3) p = currentPage-2+i;
                  if (totalPages>5 && currentPage>=totalPages-2) p = totalPages-4+i;
                  return <button key={p} onClick={() => paginate(p)} className={`px-2 py-0.5 rounded ${currentPage===p ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{p}</button>;
                })}
                <button onClick={nextPage} disabled={currentPage===totalPages} className={`px-2 py-0.5 rounded ${currentPage===totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white border'}`}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Modal - Compact */}
      {showViewModal && viewProduct && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 p-2">
          <div className="bg-white rounded p-3 max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-start mb-2 pb-1 border-b"><h2 className="text-base font-bold">Product Details</h2><button onClick={() => setShowViewModal(false)} className="text-gray-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">✕</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2 rounded"><img src={viewProduct.image || "https://via.placeholder.com/300x200"} alt={viewProduct.name} className="w-full h-40 object-cover rounded" /></div>
              <div className="space-y-2">
                <div className="bg-blue-50 p-2 rounded"><h3 className="font-semibold text-sm">{viewProduct.name}</h3><DetailItem label="Restaurant" value={viewProduct.restaurantName} /><DetailItem label="Location" value={viewProduct.locationName} /><DetailItem label="Category" value={getCategoryName(viewProduct.category)} /><DetailItem label="Status" value={viewProduct.status} /></div>
                <div className="bg-green-50 p-2 rounded"><h4 className="font-semibold text-xs">Pricing</h4><div className="grid grid-cols-2 gap-1"><div className="bg-white p-1 rounded"><div className="text-[9px]">Regular</div><div className="font-bold text-xs">{formatCurrency(viewProduct.price)}</div></div>{viewProduct.halfPlatePrice>0 && <div className="bg-white p-1 rounded"><div className="text-[9px]">Half</div><div className="font-bold text-xs">{formatCurrency(viewProduct.halfPlatePrice)}</div></div>}{viewProduct.fullPlatePrice>0 && <div className="bg-white p-1 rounded"><div className="text-[9px]">Full</div><div className="font-bold text-xs">{formatCurrency(viewProduct.fullPlatePrice)}</div></div>}<div className="bg-white p-1 rounded"><div className="text-[9px]">Discount</div><div className="font-bold text-xs text-red-600">{viewProduct.discount}%</div></div></div></div>
                <div className="bg-purple-50 p-2 rounded"><h4 className="font-semibold text-xs">Tags</h4><div className="flex flex-wrap gap-1">{viewProduct.tags?.map((t,i) => <span key={i} className="bg-white px-1 py-0.5 rounded text-[9px]">#{t}</span>)}</div><DetailItem label="Prep Time" value={viewProduct.preparationTime ? `${viewProduct.preparationTime} mins` : "N/A"} /></div>
                {viewProduct.content && <div className="bg-gray-50 p-2 rounded"><h4 className="font-semibold text-xs">Description</h4><p className="text-[10px]">{viewProduct.content}</p></div>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t"><button onClick={() => setShowViewModal(false)} className="px-3 py-1 border rounded text-[11px]">Close</button><button onClick={() => { setEditProduct(viewProduct); setShowViewModal(false); setShowEditModal(true); }} className="px-3 py-1 bg-blue-600 text-white rounded text-[11px]">Edit</button></div>
          </div>
        </div>
      )}

      {/* Edit Modal - Compact */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 p-2">
          <div className="bg-white rounded p-3 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-start mb-2 border-b pb-1"><h2 className="text-base font-bold">Edit Product {userInfo.role === 'subadmin' && <span className="ml-1 text-[9px] bg-blue-100 px-1 rounded">Sub-admin</span>}</h2><button onClick={() => { setShowEditModal(false); setEditProduct(null); }} className="text-gray-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-sm"><FaTimes /></button></div>
            <form onSubmit={handleUpdate} className="space-y-2">
              <div className="grid grid-cols-2 gap-2"><div><label className="block text-[10px] font-medium">Name *</label><input type="text" value={editProduct.name || ""} onChange={(e) => handleEditChange("name", e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" required /></div><div><label className="block text-[10px] font-medium">Status</label><select value={editProduct.status || "active"} onChange={(e) => handleEditChange("status", e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]"><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2"><div><label className="block text-[10px] font-medium">Price (₹) *</label><input type="number" value={editProduct.price || ""} onChange={(e) => handleEditChange("price", e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" required /></div><div><label className="block text-[10px] font-medium">Half Plate</label><input type="number" value={editProduct.halfPlatePrice || ""} onChange={(e) => handleEditChange("halfPlatePrice", e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" /></div><div><label className="block text-[10px] font-medium">Full Plate</label><input type="number" value={editProduct.fullPlatePrice || ""} onChange={(e) => handleEditChange("fullPlatePrice", e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" /></div><div><label className="block text-[10px] font-medium">Discount %</label><input type="number" value={editProduct.discount || ""} onChange={(e) => handleEditChange("discount", e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" min="0" max="100" /></div></div>
              <div className="grid grid-cols-2 gap-2"><div><label className="block text-[10px] font-medium">Category</label><select value={editProduct.category || ""} onChange={(e) => handleEditChange("category", e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]"><option value="">Select</option>{categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}</select></div><div><label className="block text-[10px] font-medium">Prep Time (mins)</label><input type="number" value={editProduct.preparationTime || ""} onChange={(e) => handleEditChange("preparationTime", e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" /></div></div>
              <div><label className="block text-[10px] font-medium">Tags (comma separated)</label><input type="text" value={(editProduct.tags || []).join(", ")} onChange={(e) => handleEditChange("tags", e.target.value.split(",").map(t=>t.trim()).filter(t=>t))} className="w-full px-2 py-1 border rounded text-[11px]" placeholder="Spicy, Veg" /></div>
              <div><label className="block text-[10px] font-medium">Description</label><textarea value={editProduct.content || ""} onChange={(e) => handleEditChange("content", e.target.value)} rows="2" className="w-full px-2 py-1 border rounded text-[11px]"></textarea></div>
              <div><label className="block text-[10px] font-medium">Product Image</label><div className="flex items-center gap-2"><img src={editProduct.image || "https://via.placeholder.com/50x50"} alt="Preview" className="w-10 h-10 rounded object-cover border" /><input type="file" accept="image/*" onChange={handleImageChange} className="flex-1 text-[10px]" /></div><p className="text-[8px] text-gray-500">Leave empty to keep current</p></div>
              <div className="bg-gray-50 p-2 rounded"><h4 className="font-medium text-[10px]">Restaurant Info</h4><div className="grid grid-cols-2 gap-1 text-[10px]"><span>{editProduct.restaurantName}</span><span>{editProduct.locationName}</span></div></div>
              <div className="flex justify-end gap-2 pt-2 border-t"><button type="button" onClick={() => { setShowEditModal(false); setEditProduct(null); }} className="px-3 py-1 border rounded text-[11px]">Cancel</button><button type="submit" disabled={updateLoading} className="px-3 py-1 bg-blue-600 text-white rounded text-[11px] flex items-center gap-1">{updateLoading ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> Updating...</> : <><FaSave size={10} /> Update</>}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between py-0.5 border-b last:border-0">
    <span className="font-medium text-gray-600 text-[10px]">{label}:</span>
    <span className="text-gray-800 text-[10px] font-medium break-all text-right max-w-[60%]">{value || "-"}</span>
  </div>
);

export default ProductList;