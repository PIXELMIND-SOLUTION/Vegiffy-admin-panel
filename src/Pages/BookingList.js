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
  FaUser,
  FaInfoCircle,
  FaTag,
  FaPercentage,
  FaRupeeSign,
  FaMotorcycle,
  FaBicycle,
  FaCar,
  FaWalking,
  FaTruck
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewBooking, setViewBooking] = useState(null);
  const [editBooking, setEditBooking] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [userInfo, setUserInfo] = useState({ role: 'unknown', name: '', email: '', id: '' });

  // 🛵 Function to get vehicle icon
  const getVehicleIcon = (vehicleType) => {
    if (!vehicleType) return <FaMotorcycle className="text-gray-400" />;
    const type = vehicleType.toLowerCase();
    if (type.includes("bike") || type.includes("motor")) return <FaMotorcycle className="text-blue-500" />;
    if (type.includes("cycle") || type.includes("bicycle")) return <FaBicycle className="text-green-500" />;
    if (type.includes("car") || type.includes("auto")) return <FaCar className="text-purple-500" />;
    if (type.includes("walk")) return <FaWalking className="text-yellow-500" />;
    return <FaMotorcycle className="text-gray-400" />;
  };

  // 🏍️ Function to get delivery boy details
  const getDeliveryBoyDetails = (order) => {
    // Check if riderId exists (assigned delivery boy)
    if (order.riderId) {
      return {
        isAssigned: true,
        id: order.riderId._id,
        name: order.riderId.fullName || "N/A",
        phone: order.riderId.mobileNumber || "N/A",
        vehicleType: order.riderId.vehicleType || "Not specified",
        email: order.riderId.email || "N/A",
        isActive: order.riderId.isActive || false,
        status: order.riderId.deliveryBoyStatus || "Assigned"
      };
    }
    
    // Check if deliveryBoyId exists (older format)
    if (order.deliveryBoyId) {
      return {
        isAssigned: true,
        id: order.deliveryBoyId._id || order.deliveryBoyId,
        name: order.deliveryBoyId.fullName || "Delivery Boy",
        phone: order.deliveryBoyId.mobileNumber || "N/A",
        vehicleType: order.deliveryBoyId.vehicleType || "Not specified"
      };
    }
    
    // Check if availableDeliveryBoys exists
    if (order.availableDeliveryBoys && order.availableDeliveryBoys.length > 0) {
      return {
        isAssigned: false,
        availableCount: order.availableDeliveryBoys.length,
        availableBoys: order.availableDeliveryBoys.map(boy => ({
          id: boy.deliveryBoyId || boy._id,
          name: boy.fullName || "N/A",
          phone: boy.mobileNumber || "N/A",
          vehicleType: boy.vehicleType || "Not specified",
          status: boy.status || "available"
        }))
      };
    }
    
    return {
      isAssigned: false,
      availableCount: 0,
      message: "No delivery boy assigned"
    };
  };

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

  // Get subAdminId for API calls
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

  useEffect(() => {
    getUserInfo();
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.vegiffyy.com/api/orders");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("Invalid data format from API");
      }
      
      // Process each order to add delivery info
      const processedData = json.data.map(order => ({
        ...order,
        deliveryInfo: getDeliveryBoyDetails(order)
      }));
      
      setBookings(processedData);
      setFilteredBookings(processedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((b) => {
        const name = (b.userId?.firstName || "") + " " + (b.userId?.lastName || "");
        return (
          (b.restaurantId?.restaurantName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.orderStatus || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.paymentStatus || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.note || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((b) => b.orderStatus === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== "All") {
      filtered = filtered.filter((b) => b.paymentStatus === paymentFilter);
    }

    setFilteredBookings(filtered);
  }, [searchTerm, bookings, statusFilter, paymentFilter]);

  const downloadExcel = () => {
    if (filteredBookings.length === 0) return alert("No data to export");
    
    const excelData = filteredBookings.map((b) => {
      const deliveryInfo = b.deliveryInfo || {};
      let deliveryDetails = "Not Assigned";
      
      if (deliveryInfo.isAssigned) {
        deliveryDetails = `${deliveryInfo.name} (${deliveryInfo.phone}) - ${deliveryInfo.vehicleType}`;
      } else if (deliveryInfo.availableCount > 0) {
        deliveryDetails = `${deliveryInfo.availableCount} available delivery boys`;
      }

      return {
        BookingID: b._id,
        Restaurant: b.restaurantId?.restaurantName || "-",
        CustomerName: `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.trim(),
        Email: b.userId?.email || "-",
        Phone: b.userId?.phoneNumber || "-",
        BookingDate: new Date(b.createdAt).toLocaleDateString(),
        PaymentMethod: b.paymentMethod,
        PaymentStatus: b.paymentStatus,
        OrderStatus: b.orderStatus,
        TotalItems: b.totalItems,
        SubTotal: b.subTotal,
        DeliveryCharge: b.deliveryCharge,
        DistanceKm: b.distanceKm || 0,
        PerKmRate: b.perKmRate || 0,
        GSTCharges: b.gstCharges || 0,
        PackingCharges: b.packingCharges || 0,
        GSTOnDelivery: b.gstOnDelivery || 0,
        TotalDiscount: b.totalDiscount || 0,
        CouponDiscount: b.couponDiscount || 0,
        FreeDeliveryThreshold: b.freeDeliveryThreshold || 0,
        IsDeliveryFree: b.isDeliveryFree ? "Yes" : "No",
        TotalPayable: b.totalPayable,
        Note: b.note || "",
        DeliveryBoy: deliveryDetails,
        UpdatedBy: b.note?.includes("Sub-admin") ? "Sub-admin" : "Admin"
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "Booking_List.xlsx");
  };

  const downloadCSV = () => {
    if (filteredBookings.length === 0) return alert("No data to export");
    
    const csvData = filteredBookings.map((b) => {
      const deliveryInfo = b.deliveryInfo || {};
      let deliveryDetails = "Not Assigned";
      
      if (deliveryInfo.isAssigned) {
        deliveryDetails = `${deliveryInfo.name} (${deliveryInfo.phone}) - ${deliveryInfo.vehicleType}`;
      } else if (deliveryInfo.availableCount > 0) {
        deliveryDetails = `${deliveryInfo.availableCount} available`;
      }

      return {
        BookingID: b._id,
        Restaurant: b.restaurantId?.restaurantName || "-",
        CustomerName: `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.trim(),
        Email: b.userId?.email || "-",
        Phone: b.userId?.phoneNumber || "-",
        BookingDate: new Date(b.createdAt).toLocaleDateString(),
        PaymentMethod: b.paymentMethod,
        PaymentStatus: b.paymentStatus,
        OrderStatus: b.orderStatus,
        TotalItems: b.totalItems,
        SubTotal: b.subTotal,
        DeliveryCharge: b.deliveryCharge,
        DistanceKm: b.distanceKm || 0,
        PerKmRate: b.perKmRate || 0,
        GSTCharges: b.gstCharges || 0,
        PackingCharges: b.packingCharges || 0,
        GSTOnDelivery: b.gstOnDelivery || 0,
        TotalDiscount: b.totalDiscount || 0,
        CouponDiscount: b.couponDiscount || 0,
        FreeDeliveryThreshold: b.freeDeliveryThreshold || 0,
        IsDeliveryFree: b.isDeliveryFree ? "Yes" : "No",
        TotalPayable: b.totalPayable,
        DeliveryBoy: deliveryDetails,
        Note: b.note || "",
        UpdatedBy: b.note?.includes("Sub-admin") ? "Sub-admin" : "Admin"
      };
    });

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
    a.download = "Booking_List.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateInvoicePDF = (booking) => {
    const doc = new jsPDF();
    
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER INVOICE", 105, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your order!", 105, 22, { align: "center" });

    doc.setTextColor(0, 0, 0);
    
    let yPosition = 40;

    // Order Information Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Order Information", 14, yPosition);
    yPosition += 10;

    const deliveryInfo = booking.deliveryInfo || {};
    const orderDetails = [
      ["Order ID:", booking._id],
      ["Restaurant:", booking.restaurantId?.restaurantName || "-"],
      ["Customer Name:", `${booking.userId?.firstName || ""} ${booking.userId?.lastName || ""}`.trim() || "-"],
      ["Email:", booking.userId?.email || "-"],
      ["Phone:", booking.userId?.phoneNumber || "-"],
      ["Order Date:", new Date(booking.createdAt).toLocaleString()],
      ["Payment Method:", booking.paymentMethod],
      ["Payment Status:", booking.paymentStatus],
      ["Order Status:", booking.orderStatus],
      ["Note:", booking.note || "No notes"],
      ["Distance:", (booking.distanceKm || 0) + " km"],
      ["Per Km Rate:", "₹" + (booking.perKmRate || 0)],
      ["Free Delivery Threshold:", "₹" + (booking.freeDeliveryThreshold || 0)],
      ["Free Delivery:", booking.isDeliveryFree ? "Yes" : "No"],
    ];

    // Add delivery boy info if available
    if (deliveryInfo.isAssigned) {
      orderDetails.push(["Delivery Boy:", deliveryInfo.name]);
      orderDetails.push(["Delivery Phone:", deliveryInfo.phone]);
      orderDetails.push(["Vehicle:", deliveryInfo.vehicleType]);
    }

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
      doc.text(lines, 50, yPosition);
      
      yPosition += lines.length * 5 + 3;
    });

    // Order Items Section
    yPosition += 5;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Order Items", 14, yPosition);
    yPosition += 10;

    if (booking.products && booking.products.length > 0) {
      doc.setFillColor(60, 60, 60);
      doc.rect(14, yPosition, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("#", 16, yPosition + 6);
      doc.text("Item Name", 25, yPosition + 6);
      doc.text("Qty", 130, yPosition + 6);
      doc.text("Price", 150, yPosition + 6);
      doc.text("Total", 170, yPosition + 6);
      yPosition += 10;

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      booking.products.forEach((product, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
          doc.setFillColor(60, 60, 60);
          doc.rect(14, yPosition, 182, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("#", 16, yPosition + 6);
          doc.text("Item Name", 25, yPosition + 6);
          doc.text("Qty", 130, yPosition + 6);
          doc.text("Price", 150, yPosition + 6);
          doc.text("Total", 170, yPosition + 6);
          yPosition += 10;
          doc.setTextColor(0, 0, 0);
        }

        doc.setFillColor(index % 2 === 0 ? 240 : 255, index % 2 === 0 ? 240 : 255, index % 2 === 0 ? 240 : 255);
        doc.rect(14, yPosition, 182, 8, 'F');
        
        doc.text((index + 1).toString(), 16, yPosition + 6);
        
        const itemName = product.name.length > 30 ? product.name.substring(0, 30) + "..." : product.name;
        doc.text(itemName, 25, yPosition + 6);
        doc.text(product.quantity.toString(), 130, yPosition + 6);
        doc.text("₹" + product.price, 150, yPosition + 6);
        doc.text("₹" + (product.price * product.quantity), 170, yPosition + 6);
        
        yPosition += 10;
      });
    }

    // Detailed Pricing Section
    yPosition += 10;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Pricing Breakdown", 14, yPosition);
    yPosition += 10;

    const pricingDetails = [
      ["Subtotal:", "₹" + booking.subTotal],
      ["Packing Charges:", "₹" + (booking.packingCharges || 0)],
      ["Total Discount:", "-₹" + (booking.totalDiscount || 0)],
      ["GST Charges:", "₹" + (booking.gstCharges || 0)],
      ["Delivery Charge:", "₹" + booking.deliveryCharge],
      ["GST on Delivery:", "₹" + (booking.gstOnDelivery || 0)],
      ["Platform Charge:", "₹" + (booking.platformCharge || 0)],
      ["Coupon Discount:", "-₹" + booking.couponDiscount],
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
      yPosition += 8;
    });

    // Total
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
    doc.text("₹" + booking.totalPayable, 150, yPosition);
    yPosition += 10;

    // Footer
    const footerY = 285;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer generated invoice. No signature required.", 105, footerY, { align: "center" });
    doc.text("Generated on: " + new Date().toLocaleString(), 105, footerY + 4, { align: "center" });

    doc.save("Invoice_" + booking._id + ".pdf");
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`https://api.vegiffyy.com/api/deleteorders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      alert("Order deleted successfully");
      fetchBookings();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openEditModal = (booking) => {
    setEditBooking(booking);
    setEditStatus(booking.orderStatus);
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!editBooking) return;
    
    const subAdminId = getSubAdminId();
    const requestBody = { orderStatus: editStatus };
    
    // Add subAdminId to request body if user is sub-admin
    if (subAdminId) {
      requestBody.subAdminId = subAdminId;
      console.log("Updating order as sub-admin:", subAdminId);
    }

    try {
      const res = await fetch(`https://api.vegiffyy.com/api/updateorders/${editBooking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update order status");
      }
      
      alert("Order status updated successfully!");
      setShowEditModal(false);
      fetchBookings();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium";
      case "Delivered":
        return "bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium";
      case "Cancelled":
        return "bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return "bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium";
      case "Failed":
        return "bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium";
    }
  };

  // Get unique statuses for filter dropdown
  const orderStatuses = ["All", ...new Set(bookings.map(b => b.orderStatus).filter(Boolean))];
  const paymentStatuses = ["All", ...new Set(bookings.map(b => b.paymentStatus).filter(Boolean))];

  return (
    <div className="p-4 bg-white shadow rounded w-full max-w-full overflow-auto">
      {/* User Info Display */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600">Manage and track all restaurant orders</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <FaUser className="text-blue-600" />
          <div>
            <div className="font-medium text-blue-800 truncate max-w-[150px]">
              {userInfo.name || 'User'}
            </div>
            <div className="text-xs text-blue-600">{userInfo.role}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <div className="flex items-center gap-2 w-full lg:max-w-xs">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500 text-sm" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {orderStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500 text-sm" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {paymentStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
            >
              <FaFileCsv /> CSV
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-lg">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 font-semibold text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 border text-left font-semibold">Customer</th>
                <th className="p-3 border text-left font-semibold">Restaurant</th>
                <th className="p-3 border text-left font-semibold">Order Date</th>
                <th className="p-3 border text-left font-semibold">Items</th>
                <th className="p-3 border text-left font-semibold">Total</th>
                <th className="p-3 border text-left font-semibold">Order Status</th>
                <th className="p-3 border text-left font-semibold">Payment Status</th>
                <th className="p-3 border text-left font-semibold">Delivery Boy</th>
                <th className="p-3 border text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const deliveryInfo = booking.deliveryInfo || {};
                
                return (
                  <tr
                    key={booking._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 border">
                      <div>
                        <div className="font-medium">
                          {booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : "-"}
                        </div>
                        <div className="text-xs text-gray-500">{booking.userId?.email || "-"}</div>
                        <div className="text-xs text-gray-500">{booking.userId?.phoneNumber || "-"}</div>
                        {booking.userId?.referredBy && (
                          <div className="text-xs text-blue-600 mt-1">
                            Referred by: {booking.userId.referredBy}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border">
                      <div className="font-medium">
                        {booking.restaurantId?.restaurantName || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.restaurantId?.locationName || "-"}
                      </div>
                    </td>
                    <td className="p-3 border">
                      {new Date(booking.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleTimeString()}
                      </div>
                      {booking.acceptedAt && (
                        <div className="text-xs text-green-600">
                          Accepted: {new Date(booking.acceptedAt).toLocaleTimeString()}
                        </div>
                      )}
                      {booking.note && (
                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <FaInfoCircle className="text-xs" />
                          <span className="truncate max-w-[150px]">{booking.note}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 border text-center font-medium">
                      {booking.totalItems}
                    </td>
                    <td className="p-3 border">
                      <div className="font-bold text-green-700">₹{booking.totalPayable}</div>
                      <div className="text-xs text-gray-500">
                        Items: ₹{booking.subTotal}
                      </div>
                      {booking.totalDiscount > 0 && (
                        <div className="text-xs text-red-600">
                          Saved: -₹{booking.totalDiscount}
                        </div>
                      )}
                    </td>
                    <td className="p-3 border">
                      <span className={getStatusClass(booking.orderStatus)}>
                        {booking.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <span className={getPaymentStatusClass(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.paymentMethod}
                      </div>
                    </td>
                    <td className="p-3 border">
                      {deliveryInfo.isAssigned ? (
                        <div className="flex items-center gap-2">
                          {getVehicleIcon(deliveryInfo.vehicleType)}
                          <div>
                            <div className="text-sm font-medium">{deliveryInfo.name}</div>
                            <div className="text-xs text-gray-500">{deliveryInfo.phone}</div>
                          </div>
                        </div>
                      ) : deliveryInfo.availableCount > 0 ? (
                        <div className="text-xs text-blue-600">
                          {deliveryInfo.availableCount} available
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaTruck className="text-gray-400" />
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="p-3 border">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setViewBooking(booking);
                            setShowViewModal(true);
                          }}
                          title="View Details"
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(booking)}
                          title="Edit Status"
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteBooking(booking._id)}
                          title="Delete Order"
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <FaTrashAlt />
                        </button>
                        <button
                          onClick={() => generateInvoicePDF(booking)}
                          title="Download Invoice PDF"
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                        >
                          <FaReceipt />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewBooking && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-3">Order Details</h2>
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Order Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 shadow-sm border border-blue-100">
                <h3 className="font-semibold text-lg text-blue-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Order Information
                </h3>
                <div className="space-y-3">
                  <DetailItem label="Order ID" value={viewBooking._id} />
                  <DetailItem label="Restaurant" value={viewBooking.restaurantId?.restaurantName} />
                  <DetailItem label="Location" value={viewBooking.restaurantId?.locationName} />
                  <DetailItem label="Order Date" value={new Date(viewBooking.createdAt).toLocaleString()} />
                  <DetailItem label="Order Status" value={viewBooking.orderStatus} />
                  <DetailItem label="Total Items" value={viewBooking.totalItems} />
                  <DetailItem label="Distance" value={viewBooking.distanceKm ? `${viewBooking.distanceKm} km` : "0 km"} />
                  <DetailItem label="Per Km Rate" value={`₹${viewBooking.perKmRate || 0}`} />
                  <DetailItem label="Free Delivery" value={viewBooking.isDeliveryFree ? "Yes" : "No"} />
                  {viewBooking.note && (
                    <div className="pt-3 border-t border-blue-200">
                      <DetailItem label="Note" value={viewBooking.note} />
                    </div>
                  )}
                  {viewBooking.acceptedAt && (
                    <DetailItem label="Accepted At" value={new Date(viewBooking.acceptedAt).toLocaleString()} />
                  )}
                </div>
              </div>

              {/* Customer Information Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 shadow-sm border border-green-100">
                <h3 className="font-semibold text-lg text-green-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <DetailItem label="Customer Name" value={`${viewBooking.userId?.firstName || ''} ${viewBooking.userId?.lastName || ''}`.trim()} />
                  <DetailItem label="Email" value={viewBooking.userId?.email} />
                  <DetailItem label="Phone" value={viewBooking.userId?.phoneNumber} />
                  <DetailItem label="Payment Method" value={viewBooking.paymentMethod} />
                  <DetailItem label="Payment Status" value={viewBooking.paymentStatus} />
                  <DetailItem label="Referred By" value={viewBooking.userId?.referredBy || 'N/A'} />
                </div>
              </div>
            </div>

            {/* Delivery Boy Details */}
            {viewBooking.deliveryInfo?.isAssigned && (
              <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 shadow-sm border border-purple-100">
                <h3 className="font-semibold text-lg text-purple-800 mb-4 flex items-center gap-2">
                  <FaTruck className="text-purple-600" />
                  Delivery Partner Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{viewBooking.deliveryInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{viewBooking.deliveryInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="font-medium flex items-center gap-1">
                      {getVehicleIcon(viewBooking.deliveryInfo.vehicleType)}
                      {viewBooking.deliveryInfo.vehicleType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{viewBooking.deliveryInfo.email || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Available Delivery Boys */}
            {viewBooking.deliveryInfo?.availableCount > 0 && !viewBooking.deliveryInfo.isAssigned && (
              <div className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-5 shadow-sm border border-yellow-100">
                <h3 className="font-semibold text-lg text-yellow-800 mb-4 flex items-center gap-2">
                  <FaTruck className="text-yellow-600" />
                  Available Delivery Partners ({viewBooking.deliveryInfo.availableCount})
                </h3>
                <div className="space-y-2">
                  {viewBooking.deliveryInfo.availableBoys?.map((boy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200">
                      <div className="flex items-center gap-3">
                        {getVehicleIcon(boy.vehicleType)}
                        <div>
                          <span className="font-medium">{boy.name}</span>
                          <span className="text-xs text-gray-500 ml-2">{boy.phone}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        {boy.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discount Details Section */}
            {viewBooking.totalDiscount > 0 && (
              <div className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-5 shadow-sm border border-yellow-100">
                <h3 className="font-semibold text-lg text-yellow-800 mb-4 flex items-center gap-2">
                  <FaTag className="text-yellow-600" />
                  Discount Details
                </h3>
                
                <div className="space-y-4">
                  {/* Total Discount Summary */}
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-gray-700">Total Discount Applied</div>
                      <div className="font-bold text-2xl text-green-600">-₹{viewBooking.totalDiscount || 0}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Amount saved on this order: ₹{viewBooking.amountSavedOnOrder || 0}
                    </div>
                  </div>

                  {/* Individual Discount Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Discounts */}
                    {viewBooking.products?.map((product, index) => (
                      product.discountAmount > 0 && (
                        <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-800">{product.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                Original: ₹{product.price}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">-₹{product.discountAmount}</div>
                              <div className="text-xs text-gray-500">
                                {product.discountPercent}% off
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Final Price: ₹{product.price - product.discountAmount}
                          </div>
                        </div>
                      )
                    ))}

                    {/* Coupon Discount */}
                    {viewBooking.couponDiscount > 0 && (
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">Coupon Discount</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {viewBooking.appliedCoupon?.couponCode || "Coupon"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">-₹{viewBooking.couponDiscount}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Applied Charges Details */}
                  {viewBooking.chargeCalculations && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-700 mb-2">Detailed Charge Calculations</h4>
                      
                      {/* Delivery Charge Details */}
                      {viewBooking.chargeCalculations.deliveryCharge && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-700">Delivery Charge:</div>
                          <div className="text-xs text-gray-600 ml-2">
                            Base: ₹{viewBooking.chargeCalculations.deliveryCharge.baseAmount} + 
                            Distance: ₹{viewBooking.chargeCalculations.deliveryCharge.distanceCharge} = 
                            ₹{viewBooking.deliveryCharge}
                            {viewBooking.chargeCalculations.deliveryCharge.freeDeliveryApplied && 
                              " (Free delivery applied)"}
                          </div>
                        </div>
                      )}

                      {/* GST on Food */}
                      {viewBooking.chargeCalculations.gstOnFood && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-700">GST on Food:</div>
                          <div className="text-xs text-gray-600 ml-2">
                            Rate: {viewBooking.chargeCalculations.gstOnFood.rate}% = 
                            ₹{viewBooking.chargeCalculations.gstOnFood.amount}
                          </div>
                        </div>
                      )}

                      {/* GST on Delivery */}
                      {viewBooking.chargeCalculations.gstOnDelivery && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-700">GST on Delivery:</div>
                          <div className="text-xs text-gray-600 ml-2">
                            Rate: {viewBooking.chargeCalculations.gstOnDelivery.rate}% = 
                            ₹{viewBooking.chargeCalculations.gstOnDelivery.amount}
                          </div>
                        </div>
                      )}

                      {/* Packing Charges */}
                      {viewBooking.chargeCalculations.packingCharges?.amount > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-700">Packing Charges:</div>
                          <div className="text-xs text-gray-600 ml-2">
                            Rate: {viewBooking.chargeCalculations.packingCharges.rate} = 
                            ₹{viewBooking.chargeCalculations.packingCharges.amount}
                          </div>
                        </div>
                      )}

                      {/* Platform Charge */}
                      {viewBooking.chargeCalculations.platformCharge?.amount > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-700">Platform Charge:</div>
                          <div className="text-xs text-gray-600 ml-2">
                            Rate: {viewBooking.chargeCalculations.platformCharge.rate} = 
                            ₹{viewBooking.chargeCalculations.platformCharge.amount}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Section */}
            <div className="mb-6 bg-white rounded-lg p-5 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Order Items
              </h3>
              <div className="space-y-3">
                {viewBooking.products?.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{product.name}</div>
                      {product.isHalfPlate && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2">Half Plate</span>}
                      {product.isFullPlate && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Full Plate</span>}
                      
                      {/* Show product discount if available */}
                      {product.discountAmount > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded mr-2">
                            <FaTag className="inline mr-1" /> 
                            Discount: ₹{product.discountAmount} ({product.discountPercent}% off)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">₹{product.price}</div>
                      <div className="text-sm text-gray-600">Qty: {product.quantity}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: ₹{product.price * product.quantity}
                      </div>
                      {product.discountAmount > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          After discount: ₹{(product.price - product.discountAmount) * product.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Pricing Section */}
            <div className="mb-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-5 shadow-sm border border-orange-100">
              <h3 className="font-semibold text-lg text-orange-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Detailed Pricing Breakdown
              </h3>
              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center py-2 border-b border-orange-200">
                  <div className="font-medium text-gray-700">Subtotal</div>
                  <div className="font-semibold text-gray-800">₹{viewBooking.subTotal}</div>
                </div>

                {/* Discounts Section */}
                {viewBooking.totalDiscount > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="font-medium text-green-700 mb-2 flex items-center gap-2">
                      <FaTag className="text-green-600" />
                      Discounts Applied
                    </div>
                    
                    {/* Product Discounts */}
                    {viewBooking.products?.some(p => p.discountAmount > 0) && (
                      <div className="flex justify-between items-center py-1">
                        <div className="text-sm text-gray-600 ml-4">
                          <FaPercentage className="inline mr-1 text-xs" />
                          Product Discounts
                        </div>
                        <div className="text-sm font-semibold text-red-600">
                          -₹{viewBooking.products.reduce((sum, p) => sum + (p.discountAmount * p.quantity), 0)}
                        </div>
                      </div>
                    )}

                    {/* Coupon Discount */}
                    {viewBooking.couponDiscount > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <div className="text-sm text-gray-600 ml-4">
                          <FaTag className="inline mr-1 text-xs" />
                          Coupon Discount
                        </div>
                        <div className="text-sm font-semibold text-red-600">
                          -₹{viewBooking.couponDiscount}
                        </div>
                      </div>
                    )}

                    {/* Total Discount */}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-green-200">
                      <div className="font-medium text-gray-700">Total Discount</div>
                      <div className="font-bold text-red-600">-₹{viewBooking.totalDiscount}</div>
                    </div>
                  </div>
                )}

                {/* Other Charges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PriceItem label="Packing Charges" value={viewBooking.packingCharges || 0} />
                  <PriceItem label="GST Charges" value={viewBooking.gstCharges || 0} />
                  <PriceItem label="Delivery Charge" value={viewBooking.deliveryCharge} />
                  <PriceItem label="GST on Delivery" value={viewBooking.gstOnDelivery || 0} />
                  <PriceItem label="Platform Charge" value={viewBooking.platformCharge || 0} />
                </div>
              </div>
              
              {/* Total Payable */}
              <div className="mt-4 pt-4 border-t border-orange-300">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg text-gray-800">Total Payable</div>
                  <div className="font-bold text-2xl text-green-700">₹{viewBooking.totalPayable}</div>
                </div>
                {viewBooking.totalDiscount > 0 && (
                  <div className="text-sm text-green-600 mt-2 text-center">
                    You saved ₹{viewBooking.totalDiscount} on this order!
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            {viewBooking.deliveryAddress && (
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <FaTruck className="text-gray-600" />
                  Delivery Address
                </h3>
                <div>
                  <p className="font-medium">{viewBooking.deliveryAddress.street}</p>
                  <p className="text-gray-600">
                    {viewBooking.deliveryAddress.city}, {viewBooking.deliveryAddress.state}
                  </p>
                  <p className="text-gray-600">
                    {viewBooking.deliveryAddress.postalCode} - {viewBooking.deliveryAddress.country}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Type: {viewBooking.deliveryAddress.addressType}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editBooking && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Edit Order Status
              {userInfo.role === 'subadmin' && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Sub-admin Mode
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
            
            {userInfo.role === 'subadmin' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <FaInfoCircle />
                  <span className="text-sm font-medium">Sub-admin Update Tracking</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Your sub-admin ID ({getSubAdminId()}) will be sent with this update for tracking.
                </p>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block mb-3 font-medium text-gray-700">Order Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
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
                {userInfo.role === 'subadmin' ? 'Update (Sub-admin)' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-800 font-semibold">{value || "-"}</span>
  </div>
);

const PriceItem = ({ label, value, isTotal = false, isDiscount = false }) => (
  <div className={`flex justify-between items-center py-2 ${isTotal ? 'border-t border-gray-300' : ''}`}>
    <span className={`${isTotal ? 'font-bold text-lg text-gray-800' : 'font-medium text-gray-600'}`}>
      {label}:
    </span>
    <span className={`${isTotal ? 'font-bold text-lg text-green-700' : 
                      isDiscount ? 'font-semibold text-red-600' : 'font-semibold text-gray-800'}`}>
      {isDiscount ? '-₹' : '₹'}{value}
    </span>
  </div>
);

export default BookingList;