import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaFileExcel,
  FaFilePdf,
  FaSearch,
  FaFileCsv,
  FaFilter,
  FaReceipt,
  FaStore,
  FaUsers,
  FaRupeeSign,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUser,
  FaList,
  FaDownload,
  FaFileArchive,
  FaPercent,
  FaCreditCard,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChartLine,
  FaIdCard,
  FaFileAlt,
  FaBuilding,
  FaStar
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const VendorOrders = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [expandedVendors, setExpandedVendors] = useState({});
  const [filters, setFilters] = useState({
    status: "All",
    paymentStatus: "All",
    restaurantName: "All",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: ""
  });

  const storedRole = localStorage.getItem("role");


  const [sortConfig, setSortConfig] = useState({
    key: "totalOrders",
    direction: "desc"
  });

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.vegiffy.in/api/resturantorders");
      if (!res.ok) throw new Error("Failed to fetch vendor orders");
      const json = await res.json();

      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("Invalid data format from API");
      }

      // Extract restaurant details from orders
      const vendorsWithDetails = json.data.map(vendor => {
        // Get restaurant details from the first order's restaurant object
        const restaurantInfo = vendor.orders[0]?.restaurant || {};
        return {
          ...vendor,
          email: restaurantInfo.email || vendor.email || "-",
          mobile: restaurantInfo.mobile || vendor.mobile || "-",
          commission: restaurantInfo.commission || vendor.commission || 0,
          commissionPercentage: restaurantInfo.commissionPercentage || 0,
          gstNumber: restaurantInfo.gstNumber || "-",
          fssaiNo: restaurantInfo.fssaiNo || "-",
          fullAddress: restaurantInfo.fullAddress || "-",
          rating: restaurantInfo.rating || 0,
          status: restaurantInfo.status || "active",
          walletBalance: restaurantInfo.walletBalance || 0,
          totalEarnings: restaurantInfo.totalEarnings || 0,
          totalCommissionPaid: restaurantInfo.totalCommissionPaid || 0,
          referralCode: restaurantInfo.referralCode || "-",
          image: restaurantInfo.image || null,
          aadharCard: restaurantInfo.aadharCardFront || null,
          panCard: restaurantInfo.panCard || null,
          gstCertificate: restaurantInfo.gstCertificate || null,
          fssaiLicense: restaurantInfo.fssaiLicense || null
        };
      });

      setVendors(vendorsWithDetails);
      setFilteredVendors(vendorsWithDetails);
      setError(null);
    } catch (err) {
      setError(err.message);
      setVendors([]);
      setFilteredVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...vendors];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(vendor => {
        const vendorName = vendor.restaurantName?.toLowerCase() || "";
        const location = vendor.locationName?.toLowerCase() || "";

        return (
          vendorName.includes(searchTerm.toLowerCase()) ||
          location.includes(searchTerm.toLowerCase()) ||
          vendor._id.includes(searchTerm)
        );
      });
    }

    if (filters.status !== "All") {
      filtered = filtered.map(vendor => {
        const filteredOrders = vendor.orders.filter(order =>
          order.orderStatus === filters.status
        );
        return {
          ...vendor,
          orders: filteredOrders,
          totalOrders: filteredOrders.length
        };
      }).filter(vendor => vendor.orders.length > 0);
    }

    if (filters.paymentStatus !== "All") {
      filtered = filtered.map(vendor => {
        const filteredOrders = vendor.orders.filter(order =>
          order.paymentStatus === filters.paymentStatus
        );
        return {
          ...vendor,
          orders: filteredOrders,
          totalOrders: filteredOrders.length
        };
      }).filter(vendor => vendor.orders.length > 0);
    }

    if (filters.restaurantName !== "All" && filters.restaurantName) {
      filtered = filtered.filter(vendor =>
        vendor.restaurantName === filters.restaurantName
      );
    }

    if (filters.minAmount || filters.maxAmount) {
      filtered = filtered.map(vendor => {
        const filteredOrders = vendor.orders.filter(order => {
          const amount = order.totalPayable || 0;
          const min = filters.minAmount ? parseFloat(filters.minAmount) : 0;
          const max = filters.maxAmount ? parseFloat(filters.maxAmount) : Infinity;
          return amount >= min && amount <= max;
        });
        return {
          ...vendor,
          orders: filteredOrders,
          totalOrders: filteredOrders.length
        };
      }).filter(vendor => vendor.orders.length > 0);
    }

    if (filters.startDate || filters.endDate) {
      filtered = filtered.map(vendor => {
        const filteredOrders = vendor.orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const startDate = filters.startDate ? new Date(filters.startDate) : new Date(0);
          const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
          endDate.setHours(23, 59, 59, 999);
          return orderDate >= startDate && orderDate <= endDate;
        });
        return {
          ...vendor,
          orders: filteredOrders,
          totalOrders: filteredOrders.length
        };
      }).filter(vendor => vendor.orders.length > 0);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === 'totalOrders') {
        aValue = a.totalOrders || 0;
        bValue = b.totalOrders || 0;
      } else if (sortConfig.key === 'restaurantName') {
        aValue = a.restaurantName?.toLowerCase() || '';
        bValue = b.restaurantName?.toLowerCase() || '';
      } else if (sortConfig.key === 'revenue') {
        aValue = a.orders?.reduce((sum, order) => sum + (order.totalPayable || 0), 0) || 0;
        bValue = b.orders?.reduce((sum, order) => sum + (order.totalPayable || 0), 0) || 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredVendors(filtered);
  }, [vendors, searchTerm, filters, sortConfig]);

  const toggleVendorExpansion = (vendorId) => {
    setExpandedVendors(prev => ({
      ...prev,
      [vendorId]: !prev[vendorId]
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "All",
      paymentStatus: "All",
      restaurantName: "All",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: ""
    });
    setSearchTerm("");
  };

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' ?
      <FaSortUp className="text-blue-600" /> :
      <FaSortDown className="text-blue-600" />;
  };

  const exportAllToExcel = () => {
    if (filteredVendors.length === 0) return alert("No data to export");

    const excelData = [];
    filteredVendors.forEach(vendor => {
      vendor.orders.forEach(order => {
        excelData.push({
          VendorID: vendor._id,
          RestaurantName: vendor.restaurantName || "-",
          Location: vendor.locationName || "-",
          OrderID: order._id,
          CustomerName: `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim(),
          CustomerEmail: order.userId?.email || "-",
          CustomerPhone: order.userId?.phoneNumber || "-",
          OrderDate: new Date(order.createdAt).toLocaleString(),
          PaymentMethod: order.paymentMethod,
          PaymentStatus: order.paymentStatus,
          OrderStatus: order.orderStatus,
          TotalItems: order.totalItems,
          SubTotal: order.subTotal,
          DeliveryCharge: order.deliveryCharge,
          GSTAmount: order.gstAmount,
          PlatformCharge: order.platformCharge,
          CouponDiscount: order.couponDiscount,
          TotalPayable: order.totalPayable,
          DeliveryAddress: order.deliveryAddress?.street || "-"
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VendorOrders");
    XLSX.writeFile(wb, `Vendor_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportVendorToExcel = (vendor) => {
    if (!vendor.orders || vendor.orders.length === 0) return alert("No orders to export");

    const excelData = vendor.orders.map(order => ({
      OrderID: order._id,
      CustomerName: `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim(),
      CustomerEmail: order.userId?.email || "-",
      CustomerPhone: order.userId?.phoneNumber || "-",
      OrderDate: new Date(order.createdAt).toLocaleString(),
      PaymentMethod: order.paymentMethod,
      PaymentStatus: order.paymentStatus,
      OrderStatus: order.orderStatus,
      TotalItems: order.totalItems,
      SubTotal: order.subTotal,
      DeliveryCharge: order.deliveryCharge,
      GSTAmount: order.gstAmount,
      PlatformCharge: order.platformCharge,
      CouponDiscount: order.couponDiscount,
      TotalPayable: order.totalPayable,
      DeliveryAddress: order.deliveryAddress?.street || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `${vendor.restaurantName}_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportAllToCSV = () => {
    if (filteredVendors.length === 0) return alert("No data to export");

    const csvData = [];
    filteredVendors.forEach(vendor => {
      vendor.orders.forEach(order => {
        csvData.push({
          VendorID: vendor._id,
          RestaurantName: vendor.restaurantName || "-",
          Location: vendor.locationName || "-",
          OrderID: order._id,
          CustomerName: `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim(),
          CustomerEmail: order.userId?.email || "-",
          CustomerPhone: order.userId?.phoneNumber || "-",
          OrderDate: new Date(order.createdAt).toLocaleString(),
          PaymentMethod: order.paymentMethod,
          PaymentStatus: order.paymentStatus,
          OrderStatus: order.orderStatus,
          TotalItems: order.totalItems,
          SubTotal: order.subTotal,
          DeliveryCharge: order.deliveryCharge,
          GSTAmount: order.gstAmount,
          PlatformCharge: order.platformCharge,
          CouponDiscount: order.couponDiscount,
          TotalPayable: order.totalPayable,
          DeliveryAddress: order.deliveryAddress?.street || "-"
        });
      });
    });

    const header = Object.keys(csvData[0]);
    const rows = csvData.map(row =>
      header.map(field => `"${row[field] ?? ""}"`).join(",")
    );
    rows.unshift(header.join(","));

    const csvString = rows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Vendor_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateInvoicePDF = (order) => {
    const doc = new jsPDF();

    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER INVOICE", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Vendor Order Receipt", 105, 22, { align: "center" });

    doc.setTextColor(0, 0, 0);
    let yPosition = 40;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Vendor Information", 14, yPosition);
    yPosition += 8;

    const vendor = vendors.find(v => v._id === order.restaurantId);
    const vendorDetails = [
      ["Restaurant:", vendor?.restaurantName || "-"],
      ["Location:", vendor?.locationName || "-"],
      ["Vendor ID:", vendor?._id || "-"],
      ["Contact:", vendor?.mobile || "-"],
      ["Email:", vendor?.email || "-"],
      ["Commission Rate:", `${vendor?.commission || 0}%`]
    ];

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    vendorDetails.forEach(([label, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text(label, 14, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(value, 50, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Order Information", 14, yPosition);
    yPosition += 8;

    const orderDetails = [
      ["Order ID:", order._id],
      ["Customer:", `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim()],
      ["Email:", order.userId?.email || "-"],
      ["Phone:", order.userId?.phoneNumber || "-"],
      ["Order Date:", new Date(order.createdAt).toLocaleString()],
      ["Payment Method:", order.paymentMethod],
      ["Payment Status:", order.paymentStatus],
      ["Order Status:", order.orderStatus]
    ];

    doc.setFontSize(10);
    orderDetails.forEach(([label, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text(label, 14, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(value, 50, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Order Items", 14, yPosition);
    yPosition += 8;

    if (order.products && order.products.length > 0) {
      const tableData = order.products.map((product, index) => [
        index + 1,
        product.name,
        product.quantity,
        `₹${product.price}`,
        `₹${product.price * product.quantity}`
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Item Name', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        styles: { fontSize: 9 },
        margin: { left: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 5;
    }

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Pricing Summary", 14, yPosition);
    yPosition += 8;

    const pricingDetails = [
      ["Subtotal:", `₹${order.subTotal}`],
      ["Delivery Charge:", `₹${order.deliveryCharge}`],
      ["GST Amount:", `₹${order.gstCharges || 0}`],
      ["Platform Charge:", `₹${order.platformCharge}`],
      ["Coupon Discount:", `-₹${order.couponDiscount || 0}`]
    ];

    doc.setFontSize(11);
    pricingDetails.forEach(([label, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(label, 14, yPosition);
      doc.text(value, 150, yPosition);
      yPosition += 7;
    });

    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setDrawColor(0, 0, 0);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Payable:", 14, yPosition);
    doc.text(`₹${order.totalPayable}`, 150, yPosition);

    const vendorCommission = vendor?.commission || 0;
    const commissionAmount = (order.totalPayable * vendorCommission) / 100;
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Commission (${vendorCommission}%): ₹${commissionAmount.toFixed(2)}`, 14, yPosition);

    const footerY = 285;
    doc.setFontSize(8);
    doc.text("This is a computer generated invoice. No signature required.", 105, footerY, { align: "center" });
    doc.text("Generated on: " + new Date().toLocaleString(), 105, footerY + 4, { align: "center" });

    doc.save(`Invoice_${order._id}.pdf`);
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`https://api.vegiffy.in/api/deleteorders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      alert("Order deleted successfully");
      fetchVendorOrders();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openEditModal = (order) => {
    setEditOrder(order);
    setEditStatus(order.orderStatus);
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!editOrder) return;
    try {
      const res = await fetch(`https://api.vegiffy.in/api/updateorders/${editOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: editStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      alert("Order status updated");
      setShowEditModal(false);
      fetchVendorOrders();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
      case 'completed':
        return "bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium";
      case 'pending':
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium";
      case 'delivered':
        return "bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium";
      case 'cancelled':
      case 'failed':
        return "bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium";
    }
  };

  const getUniqueRestaurants = () => {
    const restaurants = vendors.map(v => v.restaurantName).filter(Boolean);
    return ["All", ...new Set(restaurants)];
  };

  const getOrderStatuses = () => {
    const statuses = new Set();
    vendors.forEach(vendor => {
      vendor.orders.forEach(order => {
        if (order.orderStatus) statuses.add(order.orderStatus);
      });
    });
    return ["All", ...Array.from(statuses)];
  };

  const getPaymentStatuses = () => {
    const statuses = new Set();
    vendors.forEach(vendor => {
      vendor.orders.forEach(order => {
        if (order.paymentStatus) statuses.add(order.paymentStatus);
      });
    });
    return ["All", ...Array.from(statuses)];
  };

  const calculateVendorStats = (vendor) => {
    const orders = vendor.orders || [];
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPayable || 0), 0);
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Completed').length;

    return {
      totalRevenue,
      pendingOrders,
      completedOrders,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading vendor orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <FaStore className="text-white text-2xl" />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Vendor Orders Management
                </span>
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and track all vendor orders across restaurants
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportAllToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              >
                <FaFileExcel /> Export Excel
              </button>
              <button
                onClick={exportAllToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              >
                <FaFileCsv /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{vendors.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaStore className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {vendors.reduce((sum, vendor) => sum + (vendor.totalOrders || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaBox className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ₹{vendors.reduce((sum, vendor) => {
                    const revenue = vendor.orders?.reduce((s, order) => s + (order.totalPayable || 0), 0) || 0;
                    return sum + revenue;
                  }, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaRupeeSign className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {vendors.reduce((sum, vendor) => {
                    const active = vendor.orders?.filter(o => o.orderStatus === 'Pending').length || 0;
                    return sum + active;
                  }, 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaClock className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Vendors/Orders
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, location, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant
              </label>
              <select
                name="restaurantName"
                value={filters.restaurantName}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {getUniqueRestaurants().map(restaurant => (
                  <option key={restaurant} value={restaurant}>{restaurant}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {getOrderStatuses().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {getPaymentStatuses().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Range (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minAmount"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  name="maxAmount"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
              >
                Reset Filters
              </button>
              {error && (
                <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendors List */}
        <div className="space-y-6">
          {filteredVendors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="p-4 bg-gray-50 rounded-full inline-flex mb-4">
                  <FaStore className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-500 text-sm">No vendor records match your filters</p>
              </div>
            </div>
          ) : (
            filteredVendors.map((vendor) => {
              const stats = calculateVendorStats(vendor);
              const isExpanded = expandedVendors[vendor._id];

              return (
                <div key={vendor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Vendor Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => toggleVendorExpansion(vendor._id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {vendor.image?.url ? (
                            <img
                              src={vendor.image.url}
                              alt={vendor.restaurantName}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center">
                              <FaStore className="text-indigo-400 text-2xl" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{vendor.totalOrders || 0}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {vendor.restaurantName}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVendor(vendor);
                                setShowVendorModal(true);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              <FaEye />
                            </button>
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <FaMapMarkerAlt className="text-xs" />
                              {vendor.locationName}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <FaPhone className="text-xs" />
                              {vendor.mobile}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <FaPercent className="text-xs" />
                              Commission: {vendor.commission || 0}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700">{vendor.totalOrders || 0}</div>
                            <div className="text-xs text-gray-500">Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700">₹{stats.totalRevenue.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-700">{stats.pendingOrders}</div>
                            <div className="text-xs text-gray-500">Pending</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportVendorToExcel(vendor);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200 text-sm"
                          >
                            <FaFileExcel /> Export
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVendor(vendor);
                              setShowVendorModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm"
                          >
                            <FaEye /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orders Table (Collapsible) */}
                  {isExpanded && vendor.orders && vendor.orders.length > 0 && (
                    <div className="border-t border-gray-200">
                      <div className="p-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Order ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date & Time
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Items
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Payment
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {vendor.orders.reverse().map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {order._id.slice(-8)}
                                    <div className="text-xs text-gray-500">
                                      {order.paymentMethod}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : "-"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {order.userId?.email || "-"}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                    <div className="text-xs text-gray-500">
                                      {new Date(order.createdAt).toLocaleTimeString()}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {order.totalItems}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-green-700">₹{order.totalPayable}</div>
                                    <div className="text-xs text-gray-500">
                                      Items: ₹{order.subTotal}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={getStatusClass(order.orderStatus)}>
                                      {order.orderStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={getStatusClass(order.paymentStatus)}>
                                      {order.paymentStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setSelectedOrder(order);
                                          setShowOrderModal(true);
                                        }}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                        title="View Details"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() => openEditModal(order)}
                                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                        title="Edit Status"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        onClick={() => generateInvoicePDF(order)}
                                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                                        title="Download Invoice"
                                      >
                                        <FaReceipt />
                                      </button>
                                      {storedRole === 'admin' && (
                                        <button
                                          onClick={() => deleteOrder(order._id)}
                                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                          title="Delete Order"
                                        >
                                          <FaTrashAlt />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Vendor Details Modal - Complete Restaurant Details */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {selectedVendor.image?.url ? (
                    <img
                      src={selectedVendor.image.url}
                      alt={selectedVendor.restaurantName}
                      className="w-16 h-16 rounded-full border-4 border-white/30 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center shadow-lg">
                      <FaStore className="text-white text-2xl" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedVendor.restaurantName}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
                        ID: {selectedVendor._id}
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${selectedVendor.status === 'active' ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                        {selectedVendor.status || 'Active'}
                      </span>
                      <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                        <FaStar className="text-yellow-400" /> {selectedVendor.rating || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowVendorModal(false)}
                  className="text-white/80 hover:text-white text-2xl transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaBuilding className="text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <DetailItem label="Restaurant Name" value={selectedVendor.restaurantName} />
                    <DetailItem label="Location Name" value={selectedVendor.locationName} />
                    <DetailItem label="Full Address" value={selectedVendor.fullAddress} />
                    <DetailItem label="Email" value={selectedVendor.email} />
                    <DetailItem label="Mobile Number" value={selectedVendor.mobile} />
                    <DetailItem label="GST Number" value={selectedVendor.gstNumber} />
                    <DetailItem label="FSSAI Number" value={selectedVendor.fssaiNo} />
                    <DetailItem label="Referral Code" value={selectedVendor.referralCode} />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaRupeeSign className="text-green-600" />
                    Financial Information
                  </h3>
                  <div className="space-y-3">
                    <DetailItem label="Commission Rate" value={`${selectedVendor.commission}%`} />
                    <DetailItem label="Commission Percentage" value={`${selectedVendor.commissionPercentage}%`} />
                    <DetailItem label="Wallet Balance" value={`₹${selectedVendor.walletBalance?.toFixed(2) || 0}`} />
                    <DetailItem label="Total Earnings" value={`₹${selectedVendor.totalEarnings?.toFixed(2) || 0}`} />
                    <DetailItem label="Total Commission Paid" value={`₹${selectedVendor.totalCommissionPaid?.toFixed(2) || 0}`} />
                  </div>
                </div>

                {/* Vendor Statistics */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaChartLine className="text-orange-600" />
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard
                      title="Total Orders"
                      value={selectedVendor.totalOrders || 0}
                      icon={<FaBox className="text-blue-600" />}
                      color="blue"
                    />
                    <StatCard
                      title="Total Revenue"
                      value={`₹${calculateVendorStats(selectedVendor).totalRevenue.toFixed(2)}`}
                      icon={<FaRupeeSign className="text-green-600" />}
                      color="green"
                    />
                    <StatCard
                      title="Pending Orders"
                      value={calculateVendorStats(selectedVendor).pendingOrders}
                      icon={<FaClock className="text-orange-600" />}
                      color="orange"
                    />
                    <StatCard
                      title="Avg Order Value"
                      value={`₹${calculateVendorStats(selectedVendor).avgOrderValue.toFixed(2)}`}
                      icon={<FaPercent className="text-purple-600" />}
                      color="purple"
                    />
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaFileArchive className="text-gray-600" />
                    Documents
                  </h3>
                  <div className="space-y-3">
                    {selectedVendor.image?.url && (
                      <DocumentItem label="Restaurant Image" url={selectedVendor.image.url} isImage={true} />
                    )}
                    {selectedVendor.aadharCard?.url && (
                      <DocumentItem label="Aadhar Card" url={selectedVendor.aadharCard.url} />
                    )}
                    {selectedVendor.panCard?.url && (
                      <DocumentItem label="PAN Card" url={selectedVendor.panCard.url} isImage={true} />
                    )}
                    {selectedVendor.gstCertificate?.url && (
                      <DocumentItem label="GST Certificate" url={selectedVendor.gstCertificate.url} />
                    )}
                    {selectedVendor.fssaiLicense?.url && (
                      <DocumentItem label="FSSAI License" url={selectedVendor.fssaiLicense.url} />
                    )}
                    {!selectedVendor.image?.url && !selectedVendor.aadharCard?.url && !selectedVendor.panCard?.url && !selectedVendor.gstCertificate?.url && !selectedVendor.fssaiLicense?.url && (
                      <p className="text-gray-500 text-center py-4">No documents available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaList className="text-gray-600" />
                  Recent Orders ({selectedVendor.orders?.length || 0})
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedVendor.orders?.slice(0, 10).map((order) => (
                    <div key={order._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">Order #{order._id.slice(-8)}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Items: {order.totalItems} | Customer: {order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : "-"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-700 text-lg">₹{order.totalPayable}</div>
                          <span className={getStatusClass(order.orderStatus)}>
                            {order.orderStatus}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.paymentMethod}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Vendor ID: <span className="font-medium text-gray-900">{selectedVendor._id}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => exportVendorToExcel(selectedVendor)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium"
                  >
                    Export Orders
                  </button>
                  <button
                    onClick={() => setShowVendorModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Order Details</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
                      Order ID: {selectedOrder._id}
                    </span>
                    <span className={getStatusClass(selectedOrder.orderStatus)}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-white/80 hover:text-white text-2xl transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Order Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaReceipt className="text-blue-600" />
                    Order Information
                  </h3>
                  <div className="space-y-3">
                    <DetailItem label="Order ID" value={selectedOrder._id} />
                    <DetailItem label="Order Date" value={new Date(selectedOrder.createdAt).toLocaleString()} />
                    <DetailItem label="Payment Method" value={selectedOrder.paymentMethod} />
                    <DetailItem label="Payment Status" value={selectedOrder.paymentStatus} />
                    <DetailItem label="Order Status" value={selectedOrder.orderStatus} />
                    <DetailItem label="Total Items" value={selectedOrder.totalItems} />
                    <DetailItem label="Transaction ID" value={selectedOrder.transactionId} />
                    <DetailItem label="Delivery Status" value={selectedOrder.deliveryStatus} />
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUser className="text-green-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <DetailItem
                      label="Customer Name"
                      value={`${selectedOrder.userId?.firstName || ''} ${selectedOrder.userId?.lastName || ''}`.trim()}
                    />
                    <DetailItem label="Email" value={selectedOrder.userId?.email} />
                    <DetailItem label="Phone" value={selectedOrder.userId?.phoneNumber} />
                    <DetailItem label="Delivery Address" value={selectedOrder.deliveryAddress?.street} />
                    <DetailItem label="City" value={selectedOrder.deliveryAddress?.city} />
                    <DetailItem label="Postal Code" value={selectedOrder.deliveryAddress?.postalCode} />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaBox className="text-gray-600" />
                  Order Items ({selectedOrder.products?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.products?.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">Price: ₹{product.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">Qty: {product.quantity}</div>
                        <div className="text-sm text-gray-600">Total: ₹{product.price * product.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaRupeeSign className="text-orange-600" />
                  Pricing Details
                </h3>
                <div className="space-y-3">
                  <PriceItem label="Subtotal" value={selectedOrder.subTotal} />
                  <PriceItem label="Delivery Charge" value={selectedOrder.deliveryCharge} />
                  <PriceItem label="GST Amount" value={selectedOrder.gstCharges || 0} />
                  <PriceItem label="Platform Charge" value={selectedOrder.platformCharge} />
                  <PriceItem label="Coupon Discount" value={selectedOrder.couponDiscount || 0} />
                  <div className="border-t border-orange-200 pt-3 mt-3">
                    <PriceItem label="Total Payable" value={selectedOrder.totalPayable} isTotal={true} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => generateInvoicePDF(selectedOrder)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium"
                >
                  Download Invoice
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Status Modal */}
      {showEditModal && editOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaEdit className="text-green-600" />
                  Edit Order Status
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
              <div className="mb-6">
                <label className="block mb-3 font-medium text-gray-700">Order Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-800 font-semibold">{value || "-"}</span>
  </div>
);

const PriceItem = ({ label, value, isTotal = false }) => (
  <div className={`flex justify-between items-center py-2 ${isTotal ? 'border-t border-gray-300' : ''}`}>
    <span className={`${isTotal ? 'font-bold text-lg text-gray-800' : 'font-medium text-gray-600'}`}>
      {label}:
    </span>
    <span className={`${isTotal ? 'font-bold text-lg text-green-700' : 'font-semibold text-gray-800'}`}>
      ₹{value}
    </span>
  </div>
);

const DocumentItem = ({ label, url, isImage = false }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
  >
    <span className="font-medium text-gray-900">{label}</span>
    {isImage ? <FaEye className="text-gray-400 hover:text-gray-600" /> : <FaDownload className="text-gray-400 hover:text-gray-600" />}
  </a>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className={`text-2xl font-bold text-${color}-700 mb-1`}>{value}</div>
    <div className="text-xs text-gray-500">{title}</div>
  </div>
);

export default VendorOrders;