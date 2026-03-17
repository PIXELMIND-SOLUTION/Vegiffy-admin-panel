import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaTrashAlt,
  FaFileExcel,
  FaFilePdf,
  FaSearch,
  FaFileCsv,
  FaFilter,
  FaCheckCircle,
  FaMotorcycle,
  FaBicycle,
  FaCar,
  FaWalking,
  FaTruck,
  FaUser,
  FaInfoCircle,
  FaTag,
  FaPercentage,
  FaRupeeSign
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CompletedBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewBooking, setViewBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("All");

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

  useEffect(() => {
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
      
      // Filter only completed/delivered orders
      const completedBookings = json.data.filter(booking => 
        booking.orderStatus === "Delivered" || booking.orderStatus === "delivered" ||
        booking.orderStatus === "Completed" || booking.orderStatus === "completed"
      );
      
      // Process each order to add delivery info
      const processedData = completedBookings.map(order => ({
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
        const firstName = b.userId?.firstName || "";
        const lastName = b.userId?.lastName || "";
        const name = firstName + " " + lastName;
        return (
          (b.restaurantId?.restaurantName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.paymentStatus || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply payment filter
    if (paymentFilter !== "All") {
      filtered = filtered.filter((b) => b.paymentStatus === paymentFilter);
    }

    setFilteredBookings(filtered);
  }, [searchTerm, bookings, paymentFilter]);

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
        BookingID: b._id || "-",
        Restaurant: b.restaurantId?.restaurantName || "-",
        CustomerName: `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.trim() || "-",
        Email: b.userId?.email || "-",
        Phone: b.userId?.phoneNumber || "-",
        BookingDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "-",
        DeliveryDate: b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : "-",
        PaymentMethod: b.paymentMethod || "-",
        PaymentStatus: b.paymentStatus || "-",
        OrderStatus: b.orderStatus || "-",
        TotalItems: b.totalItems || 0,
        SubTotal: b.subTotal || 0,
        DeliveryCharge: b.deliveryCharge || 0,
        GSTCharges: b.gstCharges || 0,
        GSTOnDelivery: b.gstOnDelivery || 0,
        PlatformCharge: b.platformCharge || 0,
        CouponDiscount: b.couponDiscount || 0,
        TotalDiscount: b.totalDiscount || 0,
        TotalPayable: b.totalPayable || 0,
        DeliveryPerson: deliveryDetails,
        AcceptedAt: b.acceptedAt ? new Date(b.acceptedAt).toLocaleString() : 'N/A'
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CompletedBookings");
    XLSX.writeFile(wb, "Completed_Bookings.xlsx");
  };

  const downloadCSV = () => {
    if (filteredBookings.length === 0) return alert("No data to export");
    
    const csvData = filteredBookings.map((b) => {
      const deliveryInfo = b.deliveryInfo || {};
      let deliveryDetails = "Not Assigned";
      
      if (deliveryInfo.isAssigned) {
        deliveryDetails = `${deliveryInfo.name} - ${deliveryInfo.vehicleType}`;
      } else if (deliveryInfo.availableCount > 0) {
        deliveryDetails = `${deliveryInfo.availableCount} available`;
      }

      return {
        BookingID: b._id || "-",
        Restaurant: b.restaurantId?.restaurantName || "-",
        CustomerName: `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.trim() || "-",
        Email: b.userId?.email || "-",
        Phone: b.userId?.phoneNumber || "-",
        BookingDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "-",
        DeliveryDate: b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : "-",
        PaymentMethod: b.paymentMethod || "-",
        PaymentStatus: b.paymentStatus || "-",
        OrderStatus: b.orderStatus || "-",
        TotalItems: b.totalItems || 0,
        SubTotal: b.subTotal || 0,
        DeliveryCharge: b.deliveryCharge || 0,
        GSTCharges: b.gstCharges || 0,
        GSTOnDelivery: b.gstOnDelivery || 0,
        PlatformCharge: b.platformCharge || 0,
        CouponDiscount: b.couponDiscount || 0,
        TotalDiscount: b.totalDiscount || 0,
        TotalPayable: b.totalPayable || 0,
        DeliveryPerson: deliveryDetails
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
    a.download = "Completed_Bookings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF Invoice generation
  const generateInvoicePDF = (booking) => {
    try {
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Invoice-${booking._id?.slice(-8) || 'unknown'}`,
        subject: 'Order Invoice',
        author: 'Veggyfy',
        keywords: 'invoice, order, veggyfy',
        creator: 'Veggyfy Admin'
      });

      // Add company header
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("VEGGYFY", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Fresh & Healthy Food Delivery", 105, 28, { align: "center" });

      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      let yPosition = 45;

      // Get values safely
      const orderId = booking._id || 'N/A';
      const restaurantName = booking.restaurantId?.restaurantName || '-';
      const restaurantLocation = booking.restaurantId?.locationName || '-';
      
      const firstName = booking.userId?.firstName || '';
      const lastName = booking.userId?.lastName || '';
      const customerName = firstName + ' ' + lastName || 'Guest Customer';
      
      const customerEmail = booking.userId?.email || '-';
      const customerPhone = booking.userId?.phoneNumber || '-';
      
      const orderDate = booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A';
      const deliveryDate = booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : 'N/A';
      const acceptedAt = booking.acceptedAt ? new Date(booking.acceptedAt).toLocaleString() : 'N/A';
      
      const paymentMethod = booking.paymentMethod || 'N/A';
      const paymentStatus = booking.paymentStatus || 'N/A';
      const orderStatus = booking.orderStatus || 'N/A';
      const totalItems = booking.totalItems || 0;
      
      const subtotal = booking.subTotal || 0;
      const deliveryCharge = booking.deliveryCharge || 0;
      const gstCharges = booking.gstCharges || 0;
      const gstOnDelivery = booking.gstOnDelivery || 0;
      const platformCharge = booking.platformCharge || 0;
      const couponDiscount = booking.couponDiscount || 0;
      const totalDiscount = booking.totalDiscount || 0;
      const totalPayable = booking.totalPayable || 0;

      // Order Information Section
      doc.setFillColor(245, 245, 245);
      doc.rect(14, yPosition - 5, 182, 8, 'F');
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);
      doc.text("Order Information", 14, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      // Two column layout
      const leftColumn = [
        ["Order ID:", orderId],
        ["Restaurant:", restaurantName],
        ["Location:", restaurantLocation],
        ["Order Date:", orderDate],
        ["Delivery Date:", deliveryDate],
        ["Accepted At:", acceptedAt],
      ];

      const rightColumn = [
        ["Customer Name:", customerName],
        ["Email:", customerEmail],
        ["Phone:", customerPhone],
        ["Payment Method:", paymentMethod],
        ["Payment Status:", paymentStatus],
        ["Order Status:", orderStatus],
      ];

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Left column
      leftColumn.forEach(([label, value]) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.text(label, 14, yPosition);
        doc.setFont("helvetica", "normal");
        
        const valueStr = String(value);
        const lines = doc.splitTextToSize(valueStr, 70);
        doc.text(lines, 50, yPosition);
        
        yPosition += lines.length * 5 + 2;
      });

      // Reset yPosition for right column
      yPosition = 45 + 10;
      
      // Right column
      rightColumn.forEach(([label, value]) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.text(label, 120, yPosition);
        doc.setFont("helvetica", "normal");
        
        const valueStr = String(value);
        const lines = doc.splitTextToSize(valueStr, 70);
        doc.text(lines, 155, yPosition);
        
        yPosition += lines.length * 5 + 2;
      });

      // Delivery Boy Info if assigned
      const deliveryInfo = booking.deliveryInfo || {};
      if (deliveryInfo.isAssigned) {
        yPosition += 5;
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFillColor(230, 247, 255);
        doc.rect(14, yPosition - 5, 182, 20, 'F');
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 123, 255);
        doc.text("Delivery Partner", 14, yPosition);
        yPosition += 7;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Name: ${deliveryInfo.name}`, 20, yPosition);
        doc.text(`Phone: ${deliveryInfo.phone}`, 100, yPosition);
        yPosition += 5;
        doc.text(`Vehicle: ${deliveryInfo.vehicleType}`, 20, yPosition);
        doc.text(`Status: ${deliveryInfo.status}`, 100, yPosition);
        yPosition += 10;
      }

      // Order Items Section
      yPosition += 5;
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFillColor(245, 245, 245);
      doc.rect(14, yPosition - 5, 182, 8, 'F');
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);
      doc.text("Order Items", 14, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      if (booking.products && booking.products.length > 0) {
        // Table header
        doc.setFillColor(60, 60, 60);
        doc.rect(14, yPosition, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("#", 16, yPosition + 5);
        doc.text("Item Name", 30, yPosition + 5);
        doc.text("Qty", 120, yPosition + 5);
        doc.text("Price", 140, yPosition + 5);
        doc.text("Discount", 155, yPosition + 5);
        doc.text("Total", 175, yPosition + 5);
        yPosition += 8;

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        booking.products.forEach((product, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
            // Redraw header on new page
            doc.setFillColor(60, 60, 60);
            doc.rect(14, yPosition, 182, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("#", 16, yPosition + 5);
            doc.text("Item Name", 30, yPosition + 5);
            doc.text("Qty", 120, yPosition + 5);
            doc.text("Price", 140, yPosition + 5);
            doc.text("Discount", 155, yPosition + 5);
            doc.text("Total", 175, yPosition + 5);
            yPosition += 8;
            doc.setTextColor(0, 0, 0);
          }

          // Alternate row colors
          doc.setFillColor(index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 250 : 255);
          doc.rect(14, yPosition, 182, 8, 'F');
          
          doc.text(String(index + 1), 16, yPosition + 5);
          
          const itemName = String(product.name || 'Unknown Item');
          const displayName = itemName.length > 25 ? itemName.substring(0, 25) + "..." : itemName;
          doc.text(displayName, 30, yPosition + 5);
          doc.text(String(product.quantity || 1), 120, yPosition + 5);
          doc.text("₹" + String(product.price || 0), 140, yPosition + 5);
          doc.text("₹" + String(product.discountAmount || 0), 155, yPosition + 5);
          doc.text("₹" + String((product.price || 0) * (product.quantity || 1)), 175, yPosition + 5);
          
          yPosition += 8;
          
          if (product.isHalfPlate) {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text("(Half Plate)", 30, yPosition);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            yPosition += 5;
          }
          if (product.isFullPlate) {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text("(Full Plate)", 30, yPosition);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            yPosition += 5;
          }
        });
      } else {
        doc.text("No items found", 14, yPosition);
        yPosition += 10;
      }

      // Pricing Section
      yPosition += 10;
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFillColor(245, 245, 245);
      doc.rect(14, yPosition - 5, 182, 8, 'F');
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);
      doc.text("Pricing Breakdown", 14, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      // Price details
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const pricingDetails = [
        ["Subtotal:", "₹" + subtotal.toFixed(2)],
        ["Delivery Charge:", "₹" + deliveryCharge.toFixed(2)],
        ["GST on Food:", "₹" + gstCharges.toFixed(2)],
        ["GST on Delivery:", "₹" + gstOnDelivery.toFixed(2)],
        ["Platform Charge:", "₹" + platformCharge.toFixed(2)],
      ];

      pricingDetails.forEach(([label, value]) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(label, 14, yPosition);
        doc.text(String(value), 180, yPosition, { align: "right" });
        yPosition += 8;
      });

      // Discount (if any)
      if (totalDiscount > 0) {
        doc.setTextColor(220, 53, 69);
        doc.text("Total Discount:", 14, yPosition);
        doc.text("-₹" + totalDiscount.toFixed(2), 180, yPosition, { align: "right" });
        doc.setTextColor(0, 0, 0);
        yPosition += 8;
      }

      // Coupon Discount (if any)
      if (couponDiscount > 0) {
        doc.setTextColor(220, 53, 69);
        doc.text("Coupon Discount:", 14, yPosition);
        doc.text("-₹" + couponDiscount.toFixed(2), 180, yPosition, { align: "right" });
        doc.setTextColor(0, 0, 0);
        yPosition += 8;
      }

      // Total
      yPosition += 5;
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(14, yPosition - 3, 196, yPosition - 3);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(40, 167, 69);
      doc.text("Total Payable:", 14, yPosition);
      doc.text("₹" + totalPayable.toFixed(2), 180, yPosition, { align: "right" });
      
      // Footer
      const footerY = 285;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("This is a computer generated invoice. No signature required.", 105, footerY, { align: "center" });
      doc.text("Generated on: " + new Date().toLocaleString(), 105, footerY + 4, { align: "center" });

      // Save the PDF
      const fileName = `Invoice_${String(booking._id).slice(-8)}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate invoice. Error: " + error.message);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this completed order?")) return;
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

  // Get unique payment statuses for filter dropdown
  const paymentStatuses = ["All", ...new Set(bookings.map(b => b.paymentStatus).filter(Boolean))];

  return (
    <div className="p-4 bg-white shadow rounded w-full max-w-full overflow-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <div className="flex items-center gap-2 w-full lg:max-w-xs">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search completed orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
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

      {/* Stats Card */}
      <div className="mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Completed Orders Summary
              </h3>
              <p className="text-green-700 text-sm">
                Total {filteredBookings.length} successfully delivered orders
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-800">{filteredBookings.length}</div>
              <div className="text-green-600 text-sm">Orders Completed</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-lg">Loading completed orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 font-semibold text-lg">No completed orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 border text-left font-semibold">Customer</th>
                <th className="p-3 border text-left font-semibold">Restaurant</th>
                <th className="p-3 border text-left font-semibold">Order Date</th>
                <th className="p-3 border text-left font-semibold">Delivery Date</th>
                <th className="p-3 border text-left font-semibold">Items</th>
                <th className="p-3 border text-left font-semibold">Total</th>
                <th className="p-3 border text-left font-semibold">Payment Status</th>
                <th className="p-3 border text-left font-semibold">Delivery Person</th>
                <th className="p-3 border text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const deliveryInfo = booking.deliveryInfo || {};
                
                return (
                  <tr
                    key={booking._id}
                    className="border-b hover:bg-green-50 transition-colors"
                  >
                    <td className="p-3 border">
                      <div>
                        <div className="font-medium">
                          {booking.userId ? `${booking.userId.firstName || ''} ${booking.userId.lastName || ''}`.trim() : "-"}
                        </div>
                        <div className="text-xs text-gray-500">{booking.userId?.email || "-"}</div>
                        <div className="text-xs text-gray-500">{booking.userId?.phoneNumber || "-"}</div>
                        {booking.userId?.referredBy && (
                          <div className="text-xs text-blue-600">Referred: {booking.userId.referredBy}</div>
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
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '-'}
                      <div className="text-xs text-gray-500">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="p-3 border">
                      {booking.updatedAt ? new Date(booking.updatedAt).toLocaleDateString() : '-'}
                      <div className="text-xs text-gray-500">
                        {booking.updatedAt ? new Date(booking.updatedAt).toLocaleTimeString() : ''}
                      </div>
                      {booking.acceptedAt && (
                        <div className="text-xs text-green-600">
                          Accepted: {new Date(booking.acceptedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="p-3 border text-center font-medium">
                      {booking.totalItems || 0}
                    </td>
                    <td className="p-3 border">
                      <div className="font-bold text-green-700">₹{booking.totalPayable || 0}</div>
                      <div className="text-xs text-gray-500">
                        Items: ₹{booking.subTotal || 0}
                      </div>
                      {booking.totalDiscount > 0 && (
                        <div className="text-xs text-red-600">
                          Saved: -₹{booking.totalDiscount}
                        </div>
                      )}
                    </td>
                    <td className="p-3 border">
                      <span className={getPaymentStatusClass(booking.paymentStatus)}>
                        {booking.paymentStatus || 'N/A'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.paymentMethod || 'N/A'}
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
                          <FaFilePdf />
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
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Completed Order Details</h2>
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Order Information</h3>
                <DetailItem label="Order ID" value={viewBooking._id} />
                <DetailItem label="Restaurant" value={viewBooking.restaurantId?.restaurantName} />
                <DetailItem label="Location" value={viewBooking.restaurantId?.locationName} />
                <DetailItem label="Order Date" value={viewBooking.createdAt ? new Date(viewBooking.createdAt).toLocaleString() : 'N/A'} />
                <DetailItem label="Delivery Date" value={viewBooking.updatedAt ? new Date(viewBooking.updatedAt).toLocaleString() : 'N/A'} />
                <DetailItem label="Accepted At" value={viewBooking.acceptedAt ? new Date(viewBooking.acceptedAt).toLocaleString() : 'N/A'} />
                <DetailItem label="Order Status" value={viewBooking.orderStatus} />
                <DetailItem label="Total Items" value={viewBooking.totalItems || 0} />
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Customer Information</h3>
                <DetailItem label="Customer Name" value={`${viewBooking.userId?.firstName || ''} ${viewBooking.userId?.lastName || ''}`.trim()} />
                <DetailItem label="Email" value={viewBooking.userId?.email} />
                <DetailItem label="Phone" value={viewBooking.userId?.phoneNumber} />
                <DetailItem label="Payment Method" value={viewBooking.paymentMethod} />
                <DetailItem label="Payment Status" value={viewBooking.paymentStatus} />
                <DetailItem label="Referred By" value={viewBooking.userId?.referredBy || 'N/A'} />
              </div>
            </div>

            {/* Delivery Information */}
            {viewBooking.deliveryInfo?.isAssigned && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Delivery Information</h3>
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
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium">{viewBooking.deliveryInfo.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Available Delivery Boys */}
            {viewBooking.deliveryInfo?.availableCount > 0 && !viewBooking.deliveryInfo.isAssigned && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">
                  Available Delivery Partners ({viewBooking.deliveryInfo.availableCount})
                </h3>
                <div className="space-y-2">
                  {viewBooking.deliveryInfo.availableBoys?.map((boy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-3">
                        {getVehicleIcon(boy.vehicleType)}
                        <div>
                          <span className="font-medium">{boy.name}</span>
                          <span className="text-xs text-gray-500 ml-2">{boy.phone}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {boy.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Order Items</h3>
              <div className="space-y-2">
                {viewBooking.products && viewBooking.products.length > 0 ? (
                  viewBooking.products.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{product.name || 'Unknown Item'}</div>
                        <div className="text-sm text-gray-600">
                          Price: ₹{product.price || 0} | Qty: {product.quantity || 1}
                        </div>
                        {product.discountAmount > 0 && (
                          <div className="text-xs text-green-600">
                            Discount: ₹{product.discountAmount} ({product.discountPercent}% off)
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {product.isHalfPlate && "Half Plate "}
                          {product.isFullPlate && "Full Plate"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{(product.price || 0) * (product.quantity || 1)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No items found</p>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Pricing Details</h3>
              <div className="space-y-2">
                <PriceItem label="Subtotal" value={viewBooking.subTotal || 0} />
                <PriceItem label="Delivery Charge" value={viewBooking.deliveryCharge || 0} />
                <PriceItem label="GST on Food" value={viewBooking.gstCharges || 0} />
                <PriceItem label="GST on Delivery" value={viewBooking.gstOnDelivery || 0} />
                <PriceItem label="Platform Charge" value={viewBooking.platformCharge || 0} />
                
                {viewBooking.totalDiscount > 0 && (
                  <PriceItem label="Total Discount" value={viewBooking.totalDiscount || 0} isDiscount={true} />
                )}
                
                {viewBooking.couponDiscount > 0 && (
                  <PriceItem label="Coupon Discount" value={viewBooking.couponDiscount || 0} isDiscount={true} />
                )}
                
                <div className="border-t pt-2 mt-2">
                  <PriceItem label="Total Payable" value={viewBooking.totalPayable || 0} isTotal={true} />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {viewBooking.deliveryAddress && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Delivery Address</h3>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{viewBooking.deliveryAddress.street}</p>
                  <p className="text-gray-600">
                    {viewBooking.deliveryAddress.city}, {viewBooking.deliveryAddress.state} - {viewBooking.deliveryAddress.postalCode}
                  </p>
                  <p className="text-gray-600">{viewBooking.deliveryAddress.country}</p>
                  <p className="text-xs text-gray-500 mt-1">Type: {viewBooking.deliveryAddress.addressType}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components
const DetailItem = ({ label, value }) => {
  const displayValue = value !== null && value !== undefined ? String(value) : "-";
  
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-800 font-semibold">{displayValue}</span>
    </div>
  );
};

const PriceItem = ({ label, value, isTotal = false, isDiscount = false }) => {
  const numValue = Number(value) || 0;
  
  return (
    <div className="flex justify-between py-2">
      <span className={`${isTotal ? 'font-bold text-lg' : 'font-medium'} text-gray-600`}>
        {label}:
      </span>
      <span className={`${isTotal ? 'font-bold text-lg text-green-700' : 
                        isDiscount ? 'font-semibold text-red-600' : 'font-medium'}`}>
        {isDiscount ? '-₹' : '₹'}{numValue.toFixed(2)}
      </span>
    </div>
  );
};

export default CompletedBookingList;