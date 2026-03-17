import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaSearch,
  FaFileExcel,
  FaFileCsv,
  FaReceipt,
  FaRupeeSign,
  FaCreditCard,
  FaStore,
  FaUser,
  FaTruck,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaDownload,
  FaChartLine,
  FaMoneyBillWave,
  FaSort,
  FaSortUp,
  FaSortDown
} from "react-icons/fa";
import * as XLSX from "xlsx";

// Helper function to clean corrupted number strings
const cleanNumberString = (value) => {
  if (value === null || value === undefined) return 0;
  
  // Convert to string if not already
  const str = String(value);
  
  // Remove all '&' characters and any other non-numeric except decimal point
  const cleaned = str.replace(/[^0-9.-]/g, '');
  
  // Parse as float
  const num = parseFloat(cleaned);
  
  // Return 0 if NaN, otherwise the number
  return isNaN(num) ? 0 : num;
};

// Helper function to format numbers safely
const formatNumber = (value) => {
  const num = cleanNumberString(value);
  return num.toFixed(2);
};

const OrderPayments = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filters, setFilters] = useState({
    paymentMethod: "All",
    paymentStatus: "All",
    orderStatus: "All",
    restaurantName: "All",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: ""
  });

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc"
  });

  useEffect(() => {
    fetchOrderPayments();
  }, []);

  // Function to clean an entire order object
  const cleanOrderData = (order) => {
    // Clean all numeric fields
    const cleanedOrder = {
      ...order,
      subTotal: cleanNumberString(order.subTotal),
      deliveryCharge: cleanNumberString(order.deliveryCharge),
      gstAmount: cleanNumberString(order.gstAmount),
      platformCharge: cleanNumberString(order.platformCharge),
      couponDiscount: cleanNumberString(order.couponDiscount),
      totalPayable: cleanNumberString(order.totalPayable),
      totalItems: cleanNumberString(order.totalItems),
      distanceKm: cleanNumberString(order.distanceKm),
    };

    // Clean products array
    if (order.products && Array.isArray(order.products)) {
      cleanedOrder.products = order.products.map(product => ({
        ...product,
        price: cleanNumberString(product.price),
        quantity: cleanNumberString(product.quantity) || 1,
      }));
    }

    return cleanedOrder;
  };

  const fetchOrderPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.vegiffyy.com/api/orderspayment");
      if (!res.ok) throw new Error("Failed to fetch order payments");
      const json = await res.json();
      
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("Invalid data format from API");
      }
      
      const cleanedData = json.data.map(cleanOrderData);
      
      setOrders(cleanedData);
      setFilteredOrders(cleanedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(order => {
        const customerName = `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.toLowerCase();
        const restaurantName = order.restaurantId?.restaurantName?.toLowerCase() || "";
        const orderId = order._id.toLowerCase();
        const customerEmail = order.userId?.email?.toLowerCase() || "";
        
        return (
          customerName.includes(searchTerm.toLowerCase()) ||
          restaurantName.includes(searchTerm.toLowerCase()) ||
          orderId.includes(searchTerm.toLowerCase()) ||
          customerEmail.includes(searchTerm.toLowerCase())
        );
      });
    }

    if (filters.paymentMethod !== "All") {
      filtered = filtered.filter(order => 
        order.paymentMethod === filters.paymentMethod
      );
    }

    if (filters.paymentStatus !== "All") {
      filtered = filtered.filter(order => 
        order.paymentStatus === filters.paymentStatus
      );
    }

    if (filters.orderStatus !== "All") {
      filtered = filtered.filter(order => 
        order.orderStatus === filters.orderStatus
      );
    }

    if (filters.restaurantName !== "All" && filters.restaurantName) {
      filtered = filtered.filter(order => 
        order.restaurantId?.restaurantName === filters.restaurantName
      );
    }

    if (filters.minAmount || filters.maxAmount) {
      filtered = filtered.filter(order => {
        const amount = order.totalPayable || 0;
        const min = filters.minAmount ? parseFloat(filters.minAmount) : 0;
        const max = filters.maxAmount ? parseFloat(filters.maxAmount) : Infinity;
        return amount >= min && amount <= max;
      });
    }

    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const startDate = filters.startDate ? new Date(filters.startDate) : new Date(0);
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortConfig.key === 'totalPayable') {
        aValue = a.totalPayable || 0;
        bValue = b.totalPayable || 0;
      } else if (sortConfig.key === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortConfig.key === 'restaurantName') {
        aValue = a.restaurantId?.restaurantName?.toLowerCase() || '';
        bValue = b.restaurantId?.restaurantName?.toLowerCase() || '';
      } else if (sortConfig.key === 'customerName') {
        aValue = `${a.userId?.firstName || ""} ${a.userId?.lastName || ""}`.toLowerCase();
        bValue = `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.toLowerCase();
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, filters, sortConfig]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      paymentMethod: "All",
      paymentStatus: "All",
      orderStatus: "All",
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
    if (sortConfig.key !== key) return <FaSort className="text-gray-400 text-xs" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-blue-600 text-xs" /> : 
      <FaSortDown className="text-blue-600 text-xs" />;
  };

  const exportToExcel = () => {
    if (filteredOrders.length === 0) return alert("No data to export");
    
    const excelData = filteredOrders.map(order => ({
      'Order ID': order._id,
      'Customer Name': `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim(),
      'Customer Email': order.userId?.email || "-",
      'Restaurant': order.restaurantId?.restaurantName || "-",
      'Order Date': new Date(order.createdAt).toLocaleString(),
      'Payment Method': order.paymentMethod,
      'Payment Status': order.paymentStatus,
      'Order Status': order.orderStatus,
      'Delivery Status': order.deliveryStatus,
      'Total Items': order.totalItems || 0,
      'Subtotal (₹)': formatNumber(order.subTotal),
      'Delivery Charge (₹)': formatNumber(order.deliveryCharge),
      'GST Amount (₹)': formatNumber(order.gstAmount),
      'Platform Charge (₹)': formatNumber(order.platformCharge),
      'Coupon Discount (₹)': formatNumber(order.couponDiscount),
      'Total Payable (₹)': formatNumber(order.totalPayable),
      'Delivery Address': order.deliveryAddress?.street || "-",
      'Transaction ID': order.transactionId || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "OrderPayments");
    XLSX.writeFile(wb, `Order_Payments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return alert("No data to export");
    
    const csvData = filteredOrders.map(order => ({
      'Order ID': order._id,
      'Customer Name': `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim(),
      'Customer Email': order.userId?.email || "-",
      'Restaurant': order.restaurantId?.restaurantName || "-",
      'Order Date': new Date(order.createdAt).toLocaleString(),
      'Payment Method': order.paymentMethod,
      'Payment Status': order.paymentStatus,
      'Order Status': order.orderStatus,
      'Delivery Status': order.deliveryStatus,
      'Total Items': order.totalItems || 0,
      'Subtotal (₹)': formatNumber(order.subTotal),
      'Delivery Charge (₹)': formatNumber(order.deliveryCharge),
      'GST Amount (₹)': formatNumber(order.gstAmount),
      'Platform Charge (₹)': formatNumber(order.platformCharge),
      'Coupon Discount (₹)': formatNumber(order.couponDiscount),
      'Total Payable (₹)': formatNumber(order.totalPayable),
      'Delivery Address': order.deliveryAddress?.street || "-",
      'Transaction ID': order.transactionId || "-"
    }));

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
    a.download = `Order_Payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== HTML INVOICE GENERATOR ====================
  const generateReceiptHTML = (order) => {
    const subtotal = cleanNumberString(order.subTotal);
    const deliveryCharge = cleanNumberString(order.deliveryCharge);
    const gstAmount = cleanNumberString(order.gstAmount);
    const platformCharge = cleanNumberString(order.platformCharge);
    const couponDiscount = cleanNumberString(order.couponDiscount);
    const totalPayable = cleanNumberString(order.totalPayable);
    const distance = cleanNumberString(order.distanceKm);
    
    const customerName = `${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.trim() || 'N/A';
    const customerEmail = order.userId?.email || 'N/A';
    const customerPhone = order.userId?.phoneNumber || 'N/A';
    
    const restaurantName = order.restaurantId?.restaurantName || 'N/A';
    const restaurantLocation = order.restaurantId?.locationName || 'N/A';
    
    const address = order.deliveryAddress ? 
      `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}, ${order.deliveryAddress.state || ''} - ${order.deliveryAddress.postalCode || ''}`.replace(/^, |, $/g, '') : 'N/A';
    
    const orderDate = new Date(order.createdAt).toLocaleString();
    const orderId = order._id;
    const shortOrderId = orderId.slice(-8);
    
    // Generate HTML for invoice
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${shortOrderId}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
            padding: 30px 20px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .invoice-header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            padding: 30px;
            color: white;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          .invoice-subtitle {
            font-size: 14px;
            opacity: 0.9;
          }
          .order-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 10px;
          }
          .invoice-body {
            padding: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-card {
            background: #f9fafb;
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
          }
          .info-card h3 {
            font-size: 14px;
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            border-bottom: 1px dashed #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #6b7280;
            font-weight: 500;
          }
          .info-value {
            color: #1f2937;
            font-weight: 600;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 13px;
          }
          .items-table th {
            background: #f3f4f6;
            color: #374151;
            font-weight: 600;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #d1d5db;
          }
          .items-table td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          .items-table tr:last-child td {
            border-bottom: none;
          }
          .item-name {
            font-weight: 500;
            color: #1f2937;
          }
          .item-badge {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 12px;
            margin-left: 5px;
          }
          .badge-half {
            background: #fef3c7;
            color: #92400e;
          }
          .badge-full {
            background: #d1fae5;
            color: #065f46;
          }
          .price-summary {
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            margin-top: 20px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .summary-total {
            display: flex;
            justify-content: space-between;
            padding: 12px 0 0;
            margin-top: 8px;
            border-top: 2px solid #d1d5db;
            font-size: 16px;
            font-weight: 700;
          }
          .text-green {
            color: #059669;
          }
          .text-red {
            color: #dc2626;
          }
          .footer-note {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 11px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
          }
          .status-paid {
            background: #d1fae5;
            color: #065f46;
          }
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          .status-failed {
            background: #fee2e2;
            color: #991b1b;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="invoice-title">🧾 PAYMENT RECEIPT</div>
            <div class="invoice-subtitle">Order Payment Confirmation</div>
            <div class="order-badge">Order ID: #${shortOrderId}</div>
          </div>
          
          <div class="invoice-body">
            <!-- Payment Information -->
            <div class="section-title">💰 Payment Information</div>
            <div class="info-grid">
              <div class="info-card">
                <h3>📋 Order Details</h3>
                <div class="info-row">
                  <span class="info-label">Order ID:</span>
                  <span class="info-value">${orderId}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Order Date:</span>
                  <span class="info-value">${orderDate}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${order.paymentMethod || 'N/A'}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h3>💳 Payment Status</h3>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="info-value">
                    <span class="status-badge ${order.paymentStatus === 'Paid' ? 'status-paid' : order.paymentStatus === 'Pending' ? 'status-pending' : 'status-failed'}">
                      ${order.paymentStatus || 'N/A'}
                    </span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Transaction ID:</span>
                  <span class="info-value">${order.transactionId || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Order Status:</span>
                  <span class="info-value">${order.orderStatus || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="section-title">👤 Customer Information</div>
            <div class="info-grid">
              <div class="info-card">
                <h3>📱 Contact Details</h3>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${customerName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${customerEmail}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${customerPhone}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h3>🏠 Delivery Address</h3>
                <div class="info-row">
                  <span class="info-value">${address}</span>
                </div>
              </div>
            </div>

            <!-- Restaurant Information -->
            <div class="section-title">🍽️ Restaurant Information</div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${restaurantName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Location:</span>
                  <span class="info-value">${restaurantLocation}</span>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="section-title">📦 Order Items</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                ${order.products && order.products.length > 0 ? 
                  order.products.map((product, index) => {
                    const price = cleanNumberString(product.price);
                    const quantity = cleanNumberString(product.quantity) || 1;
                    const total = price * quantity;
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td class="item-name">${product.name || 'N/A'}</td>
                        <td>${quantity}</td>
                        <td>₹${price.toFixed(2)}</td>
                        <td>₹${total.toFixed(2)}</td>
                        <td>
                          ${product.isHalfPlate ? '<span class="item-badge badge-half">Half</span>' : ''}
                          ${product.isFullPlate ? '<span class="item-badge badge-full">Full</span>' : ''}
                          ${!product.isHalfPlate && !product.isFullPlate ? 'Regular' : ''}
                        </td>
                      </tr>
                    `;
                  }).join('') 
                  : '<tr><td colspan="6" style="text-align:center; padding:20px;">No items found</td></tr>'
                }
              </tbody>
            </table>

            <!-- Payment Summary -->
            <div class="price-summary">
              <div class="section-title" style="margin-top:0; border-bottom: none; padding-bottom:0;">🧮 Payment Summary</div>
              
              <div class="summary-row">
                <span>Subtotal:</span>
                <span class="text-green">₹${subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Delivery Charge:</span>
                <span class="text-green">₹${deliveryCharge.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>GST Amount:</span>
                <span class="text-green">₹${gstAmount.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Platform Charge:</span>
                <span class="text-green">₹${platformCharge.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Coupon Discount:</span>
                <span class="text-red">-₹${couponDiscount.toFixed(2)}</span>
              </div>
              
              <div class="summary-total">
                <span>Total Payable:</span>
                <span class="text-green" style="font-size:20px;">₹${totalPayable.toFixed(2)}</span>
              </div>
            </div>

            <!-- Delivery Information -->
            <div style="margin-top:30px; background:#f3f4f6; padding:15px; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span><strong>Delivery Boy:</strong> ${order.deliveryBoyId || 'Not Assigned'}</span>
                <span><strong>Delivery Status:</strong> ${order.deliveryStatus || 'Pending'}</span>
                <span><strong>Distance:</strong> ${distance.toFixed(2)} km</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer-note">
              This is a computer generated payment receipt. No signature required.<br>
              Generated on: ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  };

  // Function to download HTML as file
  const downloadHTML = (htmlContent, filename) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Modified generateReceiptPDF function (now generates HTML)
  const generateReceiptPDF = (order) => {
    try {
      const htmlContent = generateReceiptHTML(order);
      const shortOrderId = order._id.slice(-8);
      downloadHTML(htmlContent, `Invoice_${shortOrderId}.html`);
    } catch (error) {
      console.error("HTML Generation Error:", error);
      alert("Error generating invoice: " + error.message);
    }
  };

  const getUniqueRestaurants = () => {
    const restaurants = orders.map(order => order.restaurantId?.restaurantName).filter(Boolean);
    return ["All", ...new Set(restaurants)];
  };

  const getPaymentMethods = () => {
    const methods = new Set();
    orders.forEach(order => {
      if (order.paymentMethod) methods.add(order.paymentMethod);
    });
    return ["All", ...Array.from(methods)];
  };

  const getOrderStatuses = () => {
    const statuses = new Set();
    orders.forEach(order => {
      if (order.orderStatus) statuses.add(order.orderStatus);
    });
    return ["All", ...Array.from(statuses)];
  };

  const getPaymentStatuses = () => {
    const statuses = new Set();
    orders.forEach(order => {
      if (order.paymentStatus) statuses.add(order.paymentStatus);
    });
    return ["All", ...Array.from(statuses)];
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPayable || 0), 0);
    const paidOrders = orders.filter(order => order.paymentStatus === 'Paid').length;
    const pendingOrders = orders.filter(order => order.paymentStatus === 'Pending').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      paidOrders,
      pendingOrders,
      avgOrderValue
    };
  };

  const stats = calculateStats();

  const PaymentStatusBadge = ({ status }) => {
    const getStatusClass = () => {
      switch (status?.toLowerCase()) {
        case 'paid':
        case 'completed':
          return "bg-green-100 text-green-800";
        case 'pending':
          return "bg-yellow-100 text-yellow-800";
        case 'failed':
        case 'cancelled':
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const getStatusIcon = () => {
      switch (status?.toLowerCase()) {
        case 'paid':
        case 'completed':
          return <FaCheckCircle className="text-xs" />;
        case 'pending':
          return <FaClock className="text-xs" />;
        case 'failed':
        case 'cancelled':
          return <FaTimesCircle className="text-xs" />;
        default:
          return <FaClock className="text-xs" />;
      }
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
        {getStatusIcon()}
        {status}
      </span>
    );
  };

  const OrderStatusBadge = ({ status }) => {
    const getStatusClass = () => {
      switch (status?.toLowerCase()) {
        case 'delivered':
        case 'completed':
          return "bg-green-100 text-green-800";
        case 'pending':
        case 'processing':
          return "bg-yellow-100 text-yellow-800";
        case 'cancelled':
          return "bg-red-100 text-red-800";
        case 'confirmed':
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
        {status}
      </span>
    );
  };

  const PaymentMethodBadge = ({ method }) => {
    const getMethodClass = () => {
      switch (method?.toLowerCase()) {
        case 'online':
        case 'card':
          return "bg-blue-100 text-blue-800";
        case 'cod':
          return "bg-purple-100 text-purple-800";
        case 'wallet':
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMethodClass()}`}>
        <FaCreditCard className="text-xs" />
        {method}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading order payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-2 sm:px-3 lg:px-3">
        
        {/* Header */}
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-sm p-3">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                    <FaMoneyBillWave className="text-white text-sm" />
                  </div>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-base">
                    Order Payments Management
                  </span>
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  View and manage all order payments
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow"
                >
                  <FaFileExcel className="text-xs" /> Excel
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow"
                >
                  <FaFileCsv className="text-xs" /> CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Payments</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <FaMoneyBillWave className="text-blue-600 text-xs" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Revenue</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[80px]">
                  ₹{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-1.5 bg-green-100 rounded-lg">
                <FaRupeeSign className="text-green-600 text-xs" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Paid Orders</p>
                <p className="text-lg font-bold text-gray-900">{stats.paidOrders}</p>
              </div>
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <FaCheckCircle className="text-purple-600 text-xs" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Avg Order</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[80px]">
                  ₹{stats.avgOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <FaChartLine className="text-orange-600 text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            <div>
              <div className="relative">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <select
                name="restaurantName"
                value={filters.restaurantName}
                onChange={handleFilterChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {getUniqueRestaurants().map(restaurant => (
                  <option key={restaurant} value={restaurant}>{restaurant}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                name="paymentMethod"
                value={filters.paymentMethod}
                onChange={handleFilterChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {getPaymentMethods().map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {getPaymentStatuses().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            <div>
              <select
                name="orderStatus"
                value={filters.orderStatus}
                onChange={handleFilterChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {getOrderStatuses().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1">
              <input
                type="number"
                name="minAmount"
                placeholder="Min ₹"
                value={filters.minAmount}
                onChange={handleFilterChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="number"
                name="maxAmount"
                placeholder="Max ₹"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-1">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <button
                onClick={resetFilters}
                className="w-full px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-xs font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order Info
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button 
                      onClick={() => requestSort('totalPayable')}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Payment
                      {getSortIcon('totalPayable')}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-2 py-6 text-center">
                      <div className="max-w-sm mx-auto">
                        <div className="p-2 bg-gray-50 rounded-full inline-flex mb-2">
                          <FaMoneyBillWave className="text-lg text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500">No order payments found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 text-xs">
                            #{order._id.slice(-6)}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <OrderStatusBadge status={order.orderStatus} />
                            <PaymentMethodBadge method={order.paymentMethod} />
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <div className="p-1 bg-blue-100 rounded">
                              <FaUser className="text-blue-600 text-[10px]" />
                            </div>
                            <span className="text-xs font-medium text-gray-900 truncate max-w-[80px]">
                              {order.userId?.firstName || ''} {order.userId?.lastName || ''}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[100px]">
                            {order.userId?.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <div className="p-1 bg-green-100 rounded">
                              <FaStore className="text-green-600 text-[10px]" />
                            </div>
                            <span className="text-xs font-medium text-gray-900 truncate max-w-[80px]">
                              {order.restaurantId?.restaurantName}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[100px]">
                            {order.restaurantId?.locationName}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-green-700">
                              ₹{formatNumber(order.totalPayable)}
                            </span>
                            <PaymentStatusBadge status={order.paymentStatus} />
                          </div>
                          <div className="text-[10px] text-gray-600">
                            <span className="inline-block bg-gray-100 px-1 rounded">
                              {order.totalItems || 0} items
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            title="View Details"
                          >
                            <FaEye className="text-xs" />
                          </button>
                          <button
                            onClick={() => generateReceiptPDF(order)}
                            className="p-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                            title="Download Receipt"
                          >
                            <FaReceipt className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-white">Order Payment Details</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                        Order ID: {selectedOrder._id.slice(-8)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-white/80 hover:text-white text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-3 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <div className="p-1 bg-blue-200 rounded">
                        <FaUser className="text-blue-700 text-xs" />
                      </div>
                      Customer Information
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">
                          {`${selectedOrder.userId?.firstName || ''} ${selectedOrder.userId?.lastName || ''}`.trim() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.userId?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.userId?.phoneNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <div className="p-1 bg-green-200 rounded">
                        <FaCreditCard className="text-green-700 text-xs" />
                      </div>
                      Payment Information
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-green-700">₹{formatNumber(selectedOrder.totalPayable)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium text-gray-900 text-[10px] truncate max-w-[120px]">
                          {selectedOrder.transactionId || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <div className="p-1 bg-orange-200 rounded">
                        <FaStore className="text-orange-700 text-xs" />
                      </div>
                      Restaurant Information
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.restaurantId?.restaurantName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.restaurantId?.locationName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <div className="p-1 bg-purple-200 rounded">
                        <FaTruck className="text-purple-700 text-xs" />
                      </div>
                      Delivery Information
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.deliveryStatus || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium text-gray-900">{formatNumber(selectedOrder.distanceKm)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Boy:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.deliveryBoyId || 'Not Assigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-gray-600 text-xs" />
                      Delivery Address
                    </h3>
                    <p className="text-xs text-gray-700">
                      {selectedOrder.deliveryAddress?.street || 'N/A'}, {selectedOrder.deliveryAddress?.city || 'N/A'}, {selectedOrder.deliveryAddress?.state || 'N/A'} - {selectedOrder.deliveryAddress?.postalCode || 'N/A'}
                    </p>
                  </div>

                  {selectedOrder.products && selectedOrder.products.length > 0 && (
                    <div className="md:col-span-2 bg-white rounded-lg p-3 border border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-900 mb-2">Order Items ({selectedOrder.products.length})</h3>
                      <div className="space-y-2">
                        {selectedOrder.products.map((product, idx) => {
                          const price = cleanNumberString(product.price);
                          const quantity = cleanNumberString(product.quantity) || 1;
                          const total = price * quantity;
                          
                          return (
                            <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-1 last:border-0">
                              <div>
                                <span className="text-xs font-medium text-gray-900">{product.name || 'N/A'}</span>
                                <span className="text-[10px] text-gray-500 ml-2">x{quantity}</span>
                                {product.isHalfPlate && (
                                  <span className="text-[8px] bg-yellow-100 text-yellow-800 px-1 ml-2 rounded">Half</span>
                                )}
                                {product.isFullPlate && (
                                  <span className="text-[8px] bg-green-100 text-green-800 px-1 ml-2 rounded">Full</span>
                                )}
                              </div>
                              <span className="text-xs font-medium text-green-700">₹{total.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">₹{formatNumber(selectedOrder.subTotal)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-600">Delivery Charge:</span>
                          <span className="font-medium">₹{formatNumber(selectedOrder.deliveryCharge)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-600">GST:</span>
                          <span className="font-medium">₹{formatNumber(selectedOrder.gstAmount)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-600">Platform Charge:</span>
                          <span className="font-medium">₹{formatNumber(selectedOrder.platformCharge)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-600">Coupon Discount:</span>
                          <span className="font-medium text-red-600">-₹{formatNumber(selectedOrder.couponDiscount)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200 mt-1">
                          <span>Total Payable:</span>
                          <span className="text-green-700">₹{formatNumber(selectedOrder.totalPayable)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => generateReceiptPDF(selectedOrder)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 text-xs font-medium flex items-center gap-1"
                  >
                    <FaDownload className="text-xs" />
                    Download Receipt
                  </button>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPayments;