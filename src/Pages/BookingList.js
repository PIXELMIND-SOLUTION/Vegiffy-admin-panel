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

  const storedRole = sessionStorage.getItem("role");


  // 🛵 Function to get vehicle icon (compact icon size)
  const getVehicleIcon = (vehicleType) => {
    if (!vehicleType) return <FaMotorcycle className="text-gray-400 text-xs" />;
    const type = vehicleType.toLowerCase();
    if (type.includes("bike") || type.includes("motor")) return <FaMotorcycle className="text-blue-500 text-xs" />;
    if (type.includes("cycle") || type.includes("bicycle")) return <FaBicycle className="text-green-500 text-xs" />;
    if (type.includes("car") || type.includes("auto")) return <FaCar className="text-purple-500 text-xs" />;
    if (type.includes("walk")) return <FaWalking className="text-yellow-500 text-xs" />;
    return <FaMotorcycle className="text-gray-400 text-xs" />;
  };

  // 🏍️ Function to get delivery boy details
  const getDeliveryBoyDetails = (order) => {
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
    if (order.deliveryBoyId) {
      return {
        isAssigned: true,
        id: order.deliveryBoyId._id || order.deliveryBoyId,
        name: order.deliveryBoyId.fullName || "Delivery Boy",
        phone: order.deliveryBoyId.mobileNumber || "N/A",
        vehicleType: order.deliveryBoyId.vehicleType || "Not specified"
      };
    }
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

  const getUserInfo = () => {
    try {
      const role = sessionStorage.getItem("role");
      const name = sessionStorage.getItem("adminName");
      const email = sessionStorage.getItem("adminEmail");
      const id = sessionStorage.getItem("adminId");
      setUserInfo({ role: role || "unknown", name: name || "", email: email || "", id: id || "" });
    } catch (error) {
      console.error("Error getting user info:", error);
    }
  };

  const getSubAdminId = () => {
    try {
      const userRole = sessionStorage.getItem("role");
      if (userRole === "subadmin") return sessionStorage.getItem("adminId");
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
      const res = await fetch("https://api.vegiffy.in/api/orders");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid data format from API");
      const processedData = json.data.reverse().map(order => ({ ...order, deliveryInfo: getDeliveryBoyDetails(order) }));
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
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((b) => {
        const name = (b.userId?.firstName || "") + " " + (b.userId?.lastName || "");
        return (
          (b.restaurantId?.restaurantName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.orderStatus || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.paymentStatus || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.note || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    if (statusFilter !== "All") filtered = filtered.filter((b) => b.orderStatus === statusFilter);
    if (paymentFilter !== "All") filtered = filtered.filter((b) => b.paymentStatus === paymentFilter);
    setFilteredBookings(filtered);
  }, [searchTerm, bookings, statusFilter, paymentFilter]);

  const downloadExcel = () => {
    if (filteredBookings.length === 0) return alert("No data to export");
    const excelData = filteredBookings.map((b) => {
      const deliveryInfo = b.deliveryInfo || {};
      let deliveryDetails = "Not Assigned";
      if (deliveryInfo.isAssigned) deliveryDetails = `${deliveryInfo.name} (${deliveryInfo.phone}) - ${deliveryInfo.vehicleType}`;
      else if (deliveryInfo.availableCount > 0) deliveryDetails = `${deliveryInfo.availableCount} available delivery boys`;
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
      if (deliveryInfo.isAssigned) deliveryDetails = `${deliveryInfo.name} (${deliveryInfo.phone}) - ${deliveryInfo.vehicleType}`;
      else if (deliveryInfo.availableCount > 0) deliveryDetails = `${deliveryInfo.availableCount} available`;
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
    const rows = csvData.map((row) => header.map((field) => `"${row[field] ?? ""}"`).join(","));
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
    if (deliveryInfo.isAssigned) {
      orderDetails.push(["Delivery Boy:", deliveryInfo.name]);
      orderDetails.push(["Delivery Phone:", deliveryInfo.phone]);
      orderDetails.push(["Vehicle:", deliveryInfo.vehicleType]);
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    orderDetails.forEach(([label, value]) => {
      if (yPosition > 270) { doc.addPage(); yPosition = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, yPosition);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(value.toString(), 120);
      doc.text(lines, 50, yPosition);
      yPosition += lines.length * 5 + 3;
    });
    yPosition += 5;
    if (yPosition > 250) { doc.addPage(); yPosition = 20; }
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
    yPosition += 10;
    if (yPosition > 250) { doc.addPage(); yPosition = 20; }
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
      if (yPosition > 270) { doc.addPage(); yPosition = 20; }
      doc.text(label, 14, yPosition);
      doc.text(value, 150, yPosition);
      yPosition += 8;
    });
    if (yPosition > 270) { doc.addPage(); yPosition = 20; }
    doc.setDrawColor(0, 0, 0);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Payable:", 14, yPosition);
    doc.text("₹" + booking.totalPayable, 150, yPosition);
    yPosition += 10;
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
      const res = await fetch(`https://api.vegiffy.in/api/deleteorders/${id}`, { method: "DELETE" });
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
    if (subAdminId) requestBody.subAdminId = subAdminId;
    try {
      const res = await fetch(`https://api.vegiffy.in/api/updateorders/${editBooking._id}`, {
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
      case "Confirmed": return "bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
      case "Pending": return "bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
      case "Delivered": return "bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
      case "Cancelled": return "bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
      default: return "bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "Completed":
      case "Paid": return "bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
      case "Pending": return "bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
      case "Failed": return "bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
      default: return "bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-medium";
    }
  };

  const orderStatuses = ["All", ...new Set(bookings.map(b => b.orderStatus).filter(Boolean))];
  const paymentStatuses = ["All", ...new Set(bookings.map(b => b.paymentStatus).filter(Boolean))];

  return (
    <div className="p-2 bg-white shadow rounded w-full max-w-full overflow-x-auto">
      {/* User Info Display - Compact */}
      <div className="flex justify-between items-center mb-2 pb-1 border-b">
        <div>
          <h1 className="text-base font-bold text-gray-800">Order Management</h1>
          <p className="text-[10px] text-gray-500">Manage and track all restaurant orders</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-[10px]">
          <FaUser className="text-blue-600 text-[10px]" />
          <div className="font-medium text-blue-800 truncate max-w-[100px]">{userInfo.name || 'User'}</div>
          <div className="text-[9px] text-blue-600">{userInfo.role}</div>
        </div>
      </div>

      {/* Filters - Compact */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
        <div className="flex items-center gap-1 w-full md:w-64">
          <FaSearch className="text-gray-400 text-[10px]" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1 border rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-1 border rounded text-[11px]">
            {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="px-2 py-1 border rounded text-[11px]">
            {paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={downloadExcel} className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-[10px]"><FaFileExcel className="text-[10px]" /> Excel</button>
          <button onClick={downloadCSV} className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded text-[10px]"><FaFileCsv className="text-[10px]" /> CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><p className="text-sm">Loading orders...</p></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded p-2"><p className="text-red-600 text-xs font-semibold">{error}</p></div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex justify-center py-4"><p className="text-gray-500 text-sm">No orders found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-[11px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-1 border text-left font-semibold">Customer</th>
                <th className="p-1 border text-left font-semibold">Restaurant</th>
                <th className="p-1 border text-left font-semibold">Order Date</th>
                <th className="p-1 border text-center font-semibold">Items</th>
                <th className="p-1 border text-left font-semibold">Total</th>
                <th className="p-1 border text-left font-semibold">Order Status</th>
                <th className="p-1 border text-left font-semibold">Payment Status</th>
                <th className="p-1 border text-left font-semibold">Delivery Boy</th>
                <th className="p-1 border text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const deliveryInfo = booking.deliveryInfo || {};
                return (
                  <tr key={booking._id} className="border-b hover:bg-gray-50">
                    <td className="p-1 border">
                      <div className="font-medium text-[11px]">{booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : "-"}</div>
                      <div className="text-[9px] text-gray-500 truncate max-w-[100px]">{booking.userId?.email || "-"}</div>
                      <div className="text-[9px] text-gray-500">{booking.userId?.phoneNumber || "-"}</div>
                      {booking.userId?.referredBy && <div className="text-[9px] text-blue-600 mt-0.5">Referred: {booking.userId.referredBy}</div>}
                    </td>
                    <td className="p-1 border">
                      <div className="font-medium text-[11px]">{booking.restaurantId?.restaurantName || "-"}</div>
                      <div className="text-[9px] text-gray-500 truncate max-w-[100px]">{booking.restaurantId?.locationName || "-"}</div>
                    </td>
                    <td className="p-1 border whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString()}
                      <div className="text-[9px] text-gray-500">{new Date(booking.createdAt).toLocaleTimeString()}</div>
                      {booking.acceptedAt && <div className="text-[9px] text-green-600">Acc: {new Date(booking.acceptedAt).toLocaleTimeString()}</div>}
                      {booking.note && <div className="text-[9px] text-blue-500 truncate max-w-[100px] flex items-center gap-0.5"><FaInfoCircle className="text-[7px]" /> {booking.note}</div>}
                    </td>
                    <td className="p-1 border text-center font-medium">{booking.totalItems}</td>
                    <td className="p-1 border">
                      <div className="font-bold text-green-700 text-[11px]">₹{booking.totalPayable}</div>
                      <div className="text-[9px] text-gray-500">₹{booking.subTotal}</div>
                      {booking.totalDiscount > 0 && <div className="text-[9px] text-red-500">-₹{booking.totalDiscount}</div>}
                    </td>
                    <td className="p-1 border"><span className={getStatusClass(booking.orderStatus)}>{booking.orderStatus}</span></td>
                    <td className="p-1 border">
                      <span className={getPaymentStatusClass(booking.paymentStatus)}>{booking.paymentStatus}</span>
                      <div className="text-[9px] text-gray-500">{booking.paymentMethod}</div>
                    </td>
                    <td className="p-1 border">
                      {deliveryInfo.isAssigned ? (
                        <div className="flex items-center gap-1">
                          {getVehicleIcon(deliveryInfo.vehicleType)}
                          <div><div className="text-[11px] font-medium">{deliveryInfo.name}</div><div className="text-[9px] text-gray-500">{deliveryInfo.phone}</div></div>
                        </div>
                      ) : deliveryInfo.availableCount > 0 ? (
                        <span className="text-[10px] text-blue-600">{deliveryInfo.availableCount} available</span>
                      ) : (
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5"><FaTruck className="text-[9px]" /> Not Assigned</span>
                      )}
                    </td>
                    <td className="p-1 border text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => { setViewBooking(booking); setShowViewModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View"><FaEye className="text-[10px]" /></button>
                        <button onClick={() => openEditModal(booking)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Edit"><FaEdit className="text-[10px]" /></button>
                        {storedRole === 'admin' && (<button onClick={() => deleteBooking(booking._id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete"><FaTrashAlt className="text-[10px]" /></button>)}
                        <button onClick={() => generateInvoicePDF(booking)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Invoice"><FaReceipt className="text-[10px]" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal - Compact */}
      {showViewModal && viewBooking && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-3 max-w-3xl w-full max-h-[90vh] overflow-auto relative">
            <h2 className="text-base font-bold mb-2 text-gray-800 border-b pb-2">Order Details</h2>
            <button onClick={() => setShowViewModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">✕</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 rounded p-2 text-[11px]">
                <h3 className="font-semibold text-sm mb-2">Order Info</h3>
                <DetailItem label="Order ID" value={viewBooking._id} />
                <DetailItem label="Restaurant" value={viewBooking.restaurantId?.restaurantName} />
                <DetailItem label="Location" value={viewBooking.restaurantId?.locationName} />
                <DetailItem label="Order Date" value={new Date(viewBooking.createdAt).toLocaleString()} />
                <DetailItem label="Order Status" value={viewBooking.orderStatus} />
                <DetailItem label="Total Items" value={viewBooking.totalItems} />
                <DetailItem label="Distance" value={viewBooking.distanceKm ? `${viewBooking.distanceKm} km` : "0 km"} />
                <DetailItem label="Per Km Rate" value={`₹${viewBooking.perKmRate || 0}`} />
                <DetailItem label="Free Delivery" value={viewBooking.isDeliveryFree ? "Yes" : "No"} />
                {viewBooking.note && <DetailItem label="Note" value={viewBooking.note} />}
                {viewBooking.acceptedAt && <DetailItem label="Accepted At" value={new Date(viewBooking.acceptedAt).toLocaleString()} />}
              </div>
              <div className="bg-green-50 rounded p-2 text-[11px]">
                <h3 className="font-semibold text-sm mb-2">Customer Info</h3>
                <DetailItem label="Name" value={`${viewBooking.userId?.firstName || ''} ${viewBooking.userId?.lastName || ''}`.trim()} />
                <DetailItem label="Email" value={viewBooking.userId?.email} />
                <DetailItem label="Phone" value={viewBooking.userId?.phoneNumber} />
                <DetailItem label="Payment Method" value={viewBooking.paymentMethod} />
                <DetailItem label="Payment Status" value={viewBooking.paymentStatus} />
                <DetailItem label="Referred By" value={viewBooking.userId?.referredBy || 'N/A'} />
              </div>
            </div>
            {viewBooking.deliveryInfo?.isAssigned && (
              <div className="bg-purple-50 rounded p-2 mb-3 text-[11px]">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><FaTruck /> Delivery Partner</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-gray-500">Name</p><p className="font-medium">{viewBooking.deliveryInfo.name}</p></div>
                  <div><p className="text-gray-500">Phone</p><p className="font-medium">{viewBooking.deliveryInfo.phone}</p></div>
                  <div><p className="text-gray-500">Vehicle</p><p className="font-medium flex items-center gap-1">{getVehicleIcon(viewBooking.deliveryInfo.vehicleType)}{viewBooking.deliveryInfo.vehicleType}</p></div>
                  <div><p className="text-gray-500">Email</p><p className="font-medium">{viewBooking.deliveryInfo.email || "N/A"}</p></div>
                </div>
              </div>
            )}
            {viewBooking.deliveryInfo?.availableCount > 0 && !viewBooking.deliveryInfo.isAssigned && (
              <div className="bg-yellow-50 rounded p-2 mb-3">
                <h3 className="font-semibold text-sm mb-2">Available Delivery Boys ({viewBooking.deliveryInfo.availableCount})</h3>
                {viewBooking.deliveryInfo.availableBoys?.map((boy, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1 border-b last:border-0 text-[11px]">
                    <div className="flex items-center gap-2">{getVehicleIcon(boy.vehicleType)}<span>{boy.name}</span><span className="text-gray-500">{boy.phone}</span></div>
                    <span className="text-[10px] bg-yellow-100 px-1 rounded">{boy.status}</span>
                  </div>
                ))}
              </div>
            )}
            {viewBooking.totalDiscount > 0 && (
              <div className="bg-yellow-50 rounded p-2 mb-3">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><FaTag /> Discount Details</h3>
                <div className="bg-white p-2 rounded mb-2"><div className="flex justify-between"><span className="font-bold">Total Discount</span><span className="font-bold text-green-600">-₹{viewBooking.totalDiscount}</span></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {viewBooking.products?.map((p, i) => p.discountAmount > 0 && (
                    <div key={i} className="bg-white p-1 rounded"><div className="flex justify-between"><span>{p.name}</span><span className="text-green-600">-₹{p.discountAmount}</span></div><div className="text-[10px]">{p.discountPercent}% off</div></div>
                  ))}
                  {viewBooking.couponDiscount > 0 && <div className="bg-white p-1 rounded"><div className="flex justify-between"><span>Coupon</span><span className="text-green-600">-₹{viewBooking.couponDiscount}</span></div></div>}
                </div>
                {viewBooking.chargeCalculations && (
                  <div className="mt-2 p-2 bg-blue-50 text-[10px]">
                    <div>Delivery: ₹{viewBooking.chargeCalculations.deliveryCharge?.baseAmount} + distance</div>
                    <div>GST Food: ₹{viewBooking.chargeCalculations.gstOnFood?.amount}</div>
                    <div>GST Delivery: ₹{viewBooking.chargeCalculations.gstOnDelivery?.amount}</div>
                  </div>
                )}
              </div>
            )}
            <div className="bg-gray-50 rounded p-2 mb-3">
              <h3 className="font-semibold text-sm mb-2">Order Items</h3>
              {viewBooking.products?.map((p, i) => (
                <div key={i} className="flex justify-between text-[11px] py-1 border-b last:border-0">
                  <div><span>{p.name}</span> {p.isHalfPlate && <span className="text-[9px] bg-blue-100 px-1 ml-1">Half</span>}{p.isFullPlate && <span className="text-[9px] bg-green-100 px-1 ml-1">Full</span>}<span className="text-gray-500 ml-2">x{p.quantity}</span></div>
                  <span className="font-medium">₹{p.price * p.quantity}</span>
                </div>
              ))}
            </div>
            <div className="bg-orange-50 rounded p-2">
              <h3 className="font-semibold text-sm mb-2">Pricing Breakdown</h3>
              <PriceItem label="Subtotal" value={viewBooking.subTotal} />
              {viewBooking.totalDiscount > 0 && <PriceItem label="Total Discount" value={viewBooking.totalDiscount} isDiscount />}
              <PriceItem label="Packing Charges" value={viewBooking.packingCharges || 0} />
              <PriceItem label="GST Charges" value={viewBooking.gstCharges || 0} />
              <PriceItem label="Delivery Charge" value={viewBooking.deliveryCharge} />
              <PriceItem label="GST on Delivery" value={viewBooking.gstOnDelivery || 0} />
              <PriceItem label="Platform Charge" value={viewBooking.platformCharge || 0} />
              <div className="border-t pt-1 mt-1"><PriceItem label="Total Payable" value={viewBooking.totalPayable} isTotal /></div>
              {viewBooking.totalDiscount > 0 && <div className="text-[10px] text-green-600 text-center mt-1">You saved ₹{viewBooking.totalDiscount}</div>}
            </div>
            {viewBooking.deliveryAddress && (
              <div className="mt-3 bg-gray-100 rounded p-2 text-[11px]">
                <h3 className="font-semibold text-sm mb-1">Delivery Address</h3>
                <p>{viewBooking.deliveryAddress.street}</p>
                <p>{viewBooking.deliveryAddress.city}, {viewBooking.deliveryAddress.state} - {viewBooking.deliveryAddress.postalCode}</p>
                <p className="text-[10px] text-gray-500">Type: {viewBooking.deliveryAddress.addressType}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal - Compact */}
      {showEditModal && editBooking && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full">
            <h2 className="text-base font-semibold mb-3">Edit Order Status {userInfo.role === 'subadmin' && <span className="ml-1 text-[10px] bg-blue-100 px-1 py-0.5 rounded">Sub-admin</span>}</h2>
            <button onClick={() => setShowEditModal(false)} className="absolute top-2 right-2 text-gray-500 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">✕</button>
            {userInfo.role === 'subadmin' && <div className="mb-3 p-2 bg-blue-50 text-[10px] rounded">Your sub-admin ID ({getSubAdminId()}) will be sent.</div>}
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full border px-3 py-2 rounded text-sm mb-4">
              <option>Pending</option><option>Confirmed</option><option>Delivered</option><option>Cancelled</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)} className="px-3 py-1.5 border rounded text-sm">Cancel</button>
              <button onClick={submitEdit} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components (compact)
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between py-1 border-b last:border-0">
    <span className="font-medium text-gray-600 text-[11px]">{label}:</span>
    <span className="text-gray-800 text-[11px] font-medium break-all text-right max-w-[60%]">{value || "-"}</span>
  </div>
);

const PriceItem = ({ label, value, isTotal = false, isDiscount = false }) => (
  <div className="flex justify-between py-1">
    <span className={`${isTotal ? 'font-bold text-sm' : 'text-[11px]'} ${isDiscount ? 'text-red-600' : 'text-gray-700'}`}>{label}:</span>
    <span className={`${isTotal ? 'font-bold text-sm text-green-700' : 'text-[11px] font-medium'} ${isDiscount ? 'text-red-600' : 'text-gray-800'}`}>
      {isDiscount ? '-₹' : '₹'}{value}
    </span>
  </div>
);

export default BookingList;