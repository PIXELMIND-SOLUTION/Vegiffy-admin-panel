import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaTrashAlt,
  FaFileExcel,
  FaFilePdf,
  FaSearch,
  FaFileCsv,
  FaFilter,
  FaReceipt,
  FaUtensils,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaStore,
  FaMapMarkerAlt,
  FaBox,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const RestaurantOrders = () => {
  const [restaurantGroups, setRestaurantGroups] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewOrder, setViewOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [restaurantFilter, setRestaurantFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedRestaurants, setExpandedRestaurants] = useState({});
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRestaurants: 0
  });

  useEffect(() => {
    fetchRestaurantOrders();
  }, []);

  useEffect(() => {
    updateStats();
  }, [orders]);

  const fetchRestaurantOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.vegiffyy.com/api/resturantorders");
      if (!res.ok) throw new Error("Failed to fetch restaurant orders");
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setRestaurantGroups(data.data);
        
        // Flatten orders from all restaurants for easy filtering
        const allOrders = data.data.flatMap(restaurant => 
          restaurant.orders.map(order => ({
            _id: order._id, // Full order ID from DB
            orderId: order._id, // Full order ID from DB
            restaurantName: restaurant.restaurantName,
            restaurantLocation: restaurant.locationName,
            restaurantId: restaurant._id,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            deliveryStatus: order.deliveryStatus,
            totalPayable: order.totalPayable,
            subTotal: order.subTotal,
            deliveryCharge: order.deliveryCharge,
            gstCharges: order.gstCharges,
            gstOnDelivery: order.gstOnDelivery,
            platformCharge: order.platformCharge || 0,
            totalDiscount: order.totalDiscount,
            couponDiscount: order.couponDiscount,
            distanceKm: order.distanceKm,
            perKmRate: order.perKmRate,
            freeDeliveryThreshold: order.freeDeliveryThreshold,
            isDeliveryFree: order.isDeliveryFree,
            totalItems: order.totalItems,
            products: order.products,
            createdAt: order.createdAt,
            chargeCalculations: order.chargeCalculations,
            appliedCharges: order.appliedCharges
          }))
        );
        
        setOrders(allOrders);
        setFilteredOrders(allOrders);
        
        // Initialize expanded state for all restaurants
        const expanded = {};
        data.data.forEach(restaurant => {
          expanded[restaurant._id] = true;
        });
        setExpandedRestaurants(expanded);
        
        setError(null);
      } else {
        throw new Error("Invalid data format from API");
      }
    } catch (err) {
      setError(err.message);
      setRestaurantGroups([]);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    if (orders.length === 0) {
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRestaurants: restaurantGroups.length
      });
      return;
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPayable || 0), 0);
    const pendingOrders = orders.filter(order => order.orderStatus === "Pending").length;
    const completedOrders = orders.filter(order => 
      order.orderStatus === "Delivered" || order.orderStatus === "Completed"
    ).length;

    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalRestaurants: restaurantGroups.length
    });
  };

  const toggleRestaurant = (restaurantId) => {
    setExpandedRestaurants(prev => ({
      ...prev,
      [restaurantId]: !prev[restaurantId]
    }));
  };

  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((order) => {
        const orderId = order._id?.toLowerCase() || "";
        const restaurantName = order.restaurantName?.toLowerCase() || "";
        
        return (
          orderId.includes(searchTerm.toLowerCase()) ||
          restaurantName.includes(searchTerm.toLowerCase()) ||
          (order.orderStatus || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.paymentStatus || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== "All") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
    }

    // Apply restaurant filter
    if (restaurantFilter !== "All") {
      filtered = filtered.filter((order) => order.restaurantName === restaurantFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        
        switch (dateFilter) {
          case "today":
            return orderDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, orders, statusFilter, paymentFilter, restaurantFilter, dateFilter]);

  // Export All Orders to Excel
  const exportAllToExcel = () => {
    if (filteredOrders.length === 0) return alert("No data to export");
    
    const excelData = filteredOrders.map((order) => ({
      OrderID: order._id, // Full order ID from DB
      Restaurant: order.restaurantName,
      Date: new Date(order.createdAt).toLocaleDateString(),
      Items: order.totalItems || order.products?.length || 0,
      Method: order.paymentMethod,
      SubTotal: order.subTotal,
      DeliveryCharge: order.deliveryCharge,
      PlatformCharge: order.platformCharge || 0,
      GSTFood: order.gstCharges,
      GSTDelivery: order.gstOnDelivery,
      Discount: order.totalDiscount || order.couponDiscount,
      TotalPayable: order.totalPayable,
      OrderStatus: order.orderStatus,
      PaymentStatus: order.paymentStatus
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export Single Restaurant Orders to Excel
  const exportRestaurantToExcel = (restaurantName, restaurantOrders) => {
    if (restaurantOrders.length === 0) return alert("No orders for this restaurant");
    
    const excelData = restaurantOrders.map((order) => ({
      OrderID: order._id, // Full order ID from DB
      Date: new Date(order.createdAt).toLocaleDateString(),
      Items: order.totalItems || order.products?.length || 0,
      Method: order.paymentMethod,
      SubTotal: order.subTotal,
      DeliveryCharge: order.deliveryCharge,
      PlatformCharge: order.platformCharge || 0,
      GSTFood: order.gstCharges,
      GSTDelivery: order.gstOnDelivery,
      Discount: order.totalDiscount || order.couponDiscount,
      TotalPayable: order.totalPayable,
      OrderStatus: order.orderStatus,
      PaymentStatus: order.paymentStatus
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, restaurantName);
    XLSX.writeFile(wb, `${restaurantName}_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export All Orders to CSV
  const exportAllToCSV = () => {
    if (filteredOrders.length === 0) return alert("No data to export");
    
    const csvData = filteredOrders.map((order) => ({
      OrderID: order._id, // Full order ID from DB
      Restaurant: order.restaurantName,
      Date: new Date(order.createdAt).toLocaleDateString(),
      Items: order.totalItems || order.products?.length || 0,
      Method: order.paymentMethod,
      SubTotal: order.subTotal,
      DeliveryCharge: order.deliveryCharge,
      PlatformCharge: order.platformCharge || 0,
      GSTFood: order.gstCharges,
      GSTDelivery: order.gstOnDelivery,
      Discount: order.totalDiscount || order.couponDiscount,
      TotalPayable: order.totalPayable,
      OrderStatus: order.orderStatus,
      PaymentStatus: order.paymentStatus
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
    a.download = `Orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateInvoicePDF = (order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER INVOICE", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(order.restaurantName, 105, 30, { align: "center" });

    doc.setTextColor(0, 0, 0);
    let yPosition = 50;

    // Order Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", 14, yPosition);
    yPosition += 10;

    const orderDetails = [
      ["Order ID:", order._id], // Full order ID from DB
      ["Restaurant:", order.restaurantName],
      ["Date:", new Date(order.createdAt).toLocaleString()],
      ["Method:", order.paymentMethod],
      ["Order Status:", order.orderStatus],
      ["Payment Status:", order.paymentStatus]
    ];

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    orderDetails.forEach(([label, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, yPosition);
      doc.setFont("helvetica", "normal");
      
      const lines = doc.splitTextToSize(value.toString(), 120);
      doc.text(lines, 60, yPosition);
      
      yPosition += lines.length * 5 + 3;
    });

    // Order Items
    yPosition += 5;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Order Items", 14, yPosition);
    yPosition += 10;

    if (order.products && order.products.length > 0) {
      // Table Header
      doc.setFillColor(63, 81, 181);
      doc.rect(14, yPosition, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("#", 16, yPosition + 6);
      doc.text("Item", 30, yPosition + 6);
      doc.text("Qty", 130, yPosition + 6);
      doc.text("Price", 150, yPosition + 6);
      doc.text("Total", 170, yPosition + 6);
      yPosition += 10;

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      // Table Rows
      order.products.forEach((product, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
          doc.setFillColor(63, 81, 181);
          doc.rect(14, yPosition, 182, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("#", 16, yPosition + 6);
          doc.text("Item", 30, yPosition + 6);
          doc.text("Qty", 130, yPosition + 6);
          doc.text("Price", 150, yPosition + 6);
          doc.text("Total", 170, yPosition + 6);
          yPosition += 10;
          doc.setTextColor(0, 0, 0);
        }

        doc.setFillColor(index % 2 === 0 ? 240 : 255, 240, 240);
        doc.rect(14, yPosition, 182, 8, 'F');
        
        doc.text((index + 1).toString(), 16, yPosition + 6);
        
        const itemName = product.name || "Unknown Item";
        const displayName = itemName.length > 25 ? itemName.substring(0, 25) + "..." : itemName;
        doc.text(displayName, 30, yPosition + 6);
        doc.text((product.quantity || 1).toString(), 130, yPosition + 6);
        doc.text("₹" + (product.price || 0), 150, yPosition + 6);
        doc.text("₹" + ((product.price || 0) * (product.quantity || 1)), 170, yPosition + 6);
        
        yPosition += 10;
      });
    }

    // Payment Summary - Direct API values, no calculation
    yPosition += 5;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Summary", 14, yPosition);
    yPosition += 8;

    const pricingDetails = [
      ["Subtotal:", "₹" + (order.subTotal || 0)],
      ["Delivery Charge:", "₹" + (order.deliveryCharge || 0)],
      ["Platform Charge:", "₹" + (order.platformCharge || 0)],
      ["GST on Food:", "₹" + (order.gstCharges || 0)],
      ["GST on Delivery:", "₹" + (order.gstOnDelivery || 0)],
      ["Discount:", "-₹" + (order.totalDiscount || order.couponDiscount || 0)],
    ];

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    pricingDetails.forEach(([label, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(label, 14, yPosition);
      doc.text(value, 150, yPosition);
      yPosition += 7;
    });

    // Total - Direct API totalPayable
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setDrawColor(0, 0, 0);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 5;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(63, 81, 181);
    doc.text("Total Payable:", 14, yPosition);
    doc.text("₹" + (order.totalPayable || 0), 150, yPosition);

    doc.save(`Invoice_${order._id}.pdf`);
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`https://api.vegiffyy.com/api/deleteorders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      alert("Order deleted successfully");
      fetchRestaurantOrders();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
      case "Completed":
      case "Delivered":
        return "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium";
      case "Preparing":
        return "bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium";
      case "Cancelled":
        return "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium";
      case "Failed":
        return "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium";
    }
  };

  // Get unique values for filters
  const orderStatuses = ["All", ...new Set(orders.map(o => o.orderStatus).filter(Boolean))];
  const paymentStatuses = ["All", ...new Set(orders.map(o => o.paymentStatus).filter(Boolean))];
  const restaurantNames = ["All", ...new Set(orders.map(o => o.restaurantName).filter(Boolean))];

  return (
    <div className="p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaUtensils className="text-orange-500 text-sm" />
            Restaurant Orders
          </h1>
          <p className="text-xs text-gray-600">Direct API values - Full Order IDs</p>
        </div>
        <div className="mt-2 md:mt-0 flex gap-1">
          <button
            onClick={exportAllToExcel}
            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs flex items-center gap-1"
          >
            <FaFileExcel size={10} /> Excel
          </button>
          <button
            onClick={exportAllToCSV}
            className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs flex items-center gap-1"
          >
            <FaFileCsv size={10} /> CSV
          </button>
          <button
            onClick={fetchRestaurantOrders}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1"
          >
            <FaChartLine size={10} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <StatCard
          title="Orders"
          value={stats.totalOrders}
          icon={<FaChartLine className="text-blue-500" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Revenue"
          value={`₹${(stats.totalRevenue/1000).toFixed(1)}k`}
          icon={<FaMoneyBillWave className="text-green-500" />}
          color="bg-green-50"
        />
        <StatCard
          title="Pending"
          value={stats.pendingOrders}
          icon={<FaClock className="text-yellow-500" />}
          color="bg-yellow-50"
        />
        <StatCard
          title="Completed"
          value={stats.completedOrders}
          icon={<FaCheckCircle className="text-purple-500" />}
          color="bg-purple-50"
        />
        <StatCard
          title="Restaurants"
          value={stats.totalRestaurants}
          icon={<FaStore className="text-indigo-500" />}
          color="bg-indigo-50"
        />
      </div>

      {/* Filters - Compact */}
      <div className="bg-white rounded shadow-sm border border-gray-200 p-2 mb-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 flex-1 min-w-[200px]">
            <FaSearch className="text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search order ID, restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded min-w-[100px]"
          >
            {restaurantNames.map(name => (
              <option key={name} value={name}>{name === "All" ? "All" : name.substring(0, 10)}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded min-w-[80px]"
          >
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded min-w-[80px]"
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded min-w-[80px]"
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      {/* Orders by Restaurant */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-3 rounded text-center">
          <p className="text-red-600 text-xs">{error}</p>
          <button onClick={fetchRestaurantOrders} className="mt-1 px-2 py-1 bg-red-600 text-white rounded text-xs">Retry</button>
        </div>
      ) : restaurantGroups.length === 0 ? (
        <div className="bg-white p-6 text-center rounded shadow-sm">
          <p className="text-gray-500 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {restaurantGroups.map((restaurant) => {
            const restaurantOrders = restaurant.orders.map(order => ({
              _id: order._id, // Full order ID from DB
              orderId: order._id, // Full order ID from DB
              restaurantName: restaurant.restaurantName,
              restaurantLocation: restaurant.locationName,
              orderStatus: order.orderStatus,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              totalPayable: order.totalPayable,
              subTotal: order.subTotal,
              deliveryCharge: order.deliveryCharge,
              gstCharges: order.gstCharges,
              gstOnDelivery: order.gstOnDelivery,
              platformCharge: order.platformCharge || 0,
              totalDiscount: order.totalDiscount,
              couponDiscount: order.couponDiscount,
              distanceKm: order.distanceKm,
              perKmRate: order.perKmRate,
              totalItems: order.totalItems,
              products: order.products,
              createdAt: order.createdAt,
              chargeCalculations: order.chargeCalculations
            }));
            
            if (restaurantOrders.length === 0) return null;
            
            return (
              <div key={restaurant._id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                {/* Restaurant Header */}
                <div 
                  className="bg-gray-50 p-2 border-b cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => toggleRestaurant(restaurant._id)}
                >
                  <div className="flex items-center gap-2">
                    <FaStore className="text-indigo-600 text-xs" />
                    <span className="text-sm font-semibold">{restaurant.restaurantName}</span>
                    <span className="text-xs text-gray-600">({restaurant.locationName})</span>
                    <span className="text-xs bg-blue-100 px-1.5 py-0.5 rounded">{restaurantOrders.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportRestaurantToExcel(restaurant.restaurantName, restaurantOrders);
                      }}
                      className="px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs flex items-center gap-1"
                    >
                      <FaDownload size={8} /> Export
                    </button>
                    <span className="text-gray-500 text-xs">{expandedRestaurants[restaurant._id] ? '▼' : '▶'}</span>
                  </div>
                </div>

                {/* Orders Table - Compact with all API values including platformCharge */}
                {expandedRestaurants[restaurant._id] && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left">Order ID</th>
                          <th className="px-2 py-1 text-left">Date</th>
                          <th className="px-2 py-1 text-left">Items</th>
                          <th className="px-2 py-1 text-left">Method</th>
                          <th className="px-2 py-1 text-left">Sub</th>
                          <th className="px-2 py-1 text-left">Del</th>
                          <th className="px-2 py-1 text-left">Platform</th>
                          <th className="px-2 py-1 text-left">GST Food</th>
                          <th className="px-2 py-1 text-left">GST Del</th>
                          <th className="px-2 py-1 text-left">Disc</th>
                          <th className="px-2 py-1 text-left font-bold text-green-600">Total</th>
                          <th className="px-2 py-1 text-left">Order Status</th>
                          <th className="px-2 py-1 text-left">Payment Status</th>
                          <th className="px-2 py-1 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restaurantOrders.map((order) => (
                          <tr key={order._id} className="border-t hover:bg-gray-50">
                            <td className="px-2 py-1 font-mono">{order._id}</td>
                            <td className="px-2 py-1 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-2 py-1">{order.totalItems || order.products?.length || 0}</td>
                            <td className="px-2 py-1">{order.paymentMethod === "COD" ? "COD" : "Online"}</td>
                            <td className="px-2 py-1">₹{order.subTotal || 0}</td>
                            <td className="px-2 py-1">₹{order.deliveryCharge || 0}</td>
                            <td className="px-2 py-1">₹{order.platformCharge || 0}</td>
                            <td className="px-2 py-1">₹{order.gstCharges || 0}</td>
                            <td className="px-2 py-1">₹{order.gstOnDelivery || 0}</td>
                            <td className="px-2 py-1 text-red-600">-₹{order.totalDiscount || order.couponDiscount || 0}</td>
                            <td className="px-2 py-1 font-bold text-green-600">₹{order.totalPayable || 0}</td>
                            <td className="px-2 py-1">
                              <span className={getOrderStatusClass(order.orderStatus)}>{order.orderStatus}</span>
                            </td>
                            <td className="px-2 py-1">
                              <span className={getPaymentStatusClass(order.paymentStatus)}>{order.paymentStatus}</span>
                            </td>
                            <td className="px-2 py-1">
                              <div className="flex gap-1 justify-center">
                                <button onClick={() => { setViewOrder(order); setShowViewModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View"><FaEye size={10} /></button>
                                <button onClick={() => generateInvoicePDF(order)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Invoice"><FaReceipt size={10} /></button>
                                <button onClick={() => deleteOrder(order._id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete"><FaTrashAlt size={10} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* View Order Modal - Shows all API values with full Order ID including platformCharge */}
      {showViewModal && viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded shadow-lg max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-2 flex justify-between items-center">
              <h2 className="text-sm font-bold">Order Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
            </div>
            <div className="p-3">
              <div className="bg-blue-50 p-2 rounded mb-2 text-xs">
                <div className="grid grid-cols-1 gap-1">
                  <div><span className="text-gray-600">Order ID:</span> <span className="font-mono">{viewOrder._id}</span></div>
                  <div><span className="text-gray-600">Date:</span> {new Date(viewOrder.createdAt).toLocaleString()}</div>
                  <div><span className="text-gray-600">Restaurant:</span> {viewOrder.restaurantName}</div>
                  <div><span className="text-gray-600">Method:</span> {viewOrder.paymentMethod}</div>
                  <div><span className="text-gray-600">Order Status:</span> <span className={getOrderStatusClass(viewOrder.orderStatus)}>{viewOrder.orderStatus}</span></div>
                  <div><span className="text-gray-600">Payment Status:</span> <span className={getPaymentStatusClass(viewOrder.paymentStatus)}>{viewOrder.paymentStatus}</span></div>
                  <div><span className="text-gray-600">Items:</span> {viewOrder.totalItems || viewOrder.products?.length || 0}</div>
                </div>
              </div>

              {viewOrder.products && viewOrder.products.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold mb-1">Items</h3>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {viewOrder.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between bg-gray-50 p-1 rounded text-xs">
                        <span>{product.name.substring(0, 20)} x{product.quantity}</span>
                        <span>₹{product.price * product.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-green-50 p-2 rounded text-xs">
                <h3 className="font-semibold mb-1">Payment Details (API Values)</h3>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Subtotal:</span> <span>₹{viewOrder.subTotal || 0}</span></div>
                  <div className="flex justify-between"><span>Delivery Charge:</span> <span>₹{viewOrder.deliveryCharge || 0}</span></div>
                  <div className="flex justify-between"><span>Platform Charge:</span> <span>₹{viewOrder.platformCharge || 0}</span></div>
                  <div className="flex justify-between"><span>GST on Food:</span> <span>₹{viewOrder.gstCharges || 0}</span></div>
                  <div className="flex justify-between"><span>GST on Delivery:</span> <span>₹{viewOrder.gstOnDelivery || 0}</span></div>
                  {(viewOrder.totalDiscount > 0 || viewOrder.couponDiscount > 0) && (
                    <div className="flex justify-between text-red-600"><span>Discount:</span> <span>-₹{viewOrder.totalDiscount || viewOrder.couponDiscount || 0}</span></div>
                  )}
                  <div className="border-t pt-1 mt-1 font-bold flex justify-between">
                    <span>Total Payable:</span> <span className="text-green-600">₹{viewOrder.totalPayable || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t p-2 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} border border-gray-200 rounded p-2`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[10px] text-gray-600">{title}</p>
        <p className="text-xs font-bold text-gray-800">{value}</p>
      </div>
      <div className="text-xs">{icon}</div>
    </div>
  </div>
);

export default RestaurantOrders;