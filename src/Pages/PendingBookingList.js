import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaFileExcel,
  FaFileCsv,
  FaSearch,
  FaFilter,
  FaClock,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const PendingBookingList = () => {
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
  const [paymentFilter, setPaymentFilter] = useState("All");

  const storedRole = sessionStorage.getItem("role");


  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.vegiffy.in/api/orders");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("Invalid data format from API");
      }
      // Filter only pending orders
      const pendingBookings = json.data.filter(booking =>
        booking.orderStatus === "Pending" || booking.orderStatus === "pending"
      );
      setBookings(pendingBookings);
      setFilteredBookings(pendingBookings);
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
    const excelData = filteredBookings.map((b) => ({
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
      CouponDiscount: b.couponDiscount,
      TotalPayable: b.totalPayable,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PendingBookings");
    XLSX.writeFile(wb, "Pending_Bookings.xlsx");
  };

  const downloadCSV = () => {
    if (filteredBookings.length === 0) return alert("No data to export");
    const csvData = filteredBookings.map((b) => ({
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
      CouponDiscount: b.couponDiscount,
      TotalPayable: b.totalPayable,
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
    a.download = "Pending_Bookings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pending order?")) return;
    try {
      const res = await fetch(`https://api.vegiffy.in/api/deleteorders/${id}`, {
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
    try {
      const res = await fetch(`https://api.vegiffy.in/api/updateorders/${editBooking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: editStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      alert("Order status updated");
      setShowEditModal(false);
      fetchBookings();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "Completed":
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
            placeholder="Search pending orders..."
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                <FaClock className="text-yellow-600" />
                Pending Orders Summary
              </h3>
              <p className="text-yellow-700 text-sm">
                Total {filteredBookings.length} pending orders requiring attention
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-800">{filteredBookings.length}</div>
              <div className="text-yellow-600 text-sm">Orders Pending</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-lg">Loading pending orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 font-semibold text-lg">No pending orders found.</p>
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
                <th className="p-3 border text-left font-semibold">Payment Status</th>
                <th className="p-3 border text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b hover:bg-yellow-50 transition-colors"
                >
                  <td className="p-3 border">
                    <div>
                      <div className="font-medium">
                        {booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : "-"}
                      </div>
                      <div className="text-xs text-gray-500">{booking.userId?.email || "-"}</div>
                      <div className="text-xs text-gray-500">{booking.userId?.phoneNumber || "-"}</div>
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
                  </td>
                  <td className="p-3 border text-center font-medium">
                    {booking.totalItems}
                  </td>
                  <td className="p-3 border">
                    <div className="font-bold text-green-700">₹{booking.totalPayable}</div>
                    <div className="text-xs text-gray-500">
                      Items: ₹{booking.subTotal}
                    </div>
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
                        title="Update Status"
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      >
                        <FaEdit />
                      </button>
                      {storedRole === 'admin' && (
                        <button
                          onClick={() => deleteBooking(booking._id)}
                          title="Delete Order"
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
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
      )}

      {/* View Modal */}
      {showViewModal && viewBooking && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Pending Order Details</h2>
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
                <DetailItem label="Order Date" value={new Date(viewBooking.createdAt).toLocaleString()} />
                <DetailItem label="Order Status" value={viewBooking.orderStatus} />
                <DetailItem label="Total Items" value={viewBooking.totalItems} />
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Customer Information</h3>
                <DetailItem label="Customer Name" value={`${viewBooking.userId?.firstName || ''} ${viewBooking.userId?.lastName || ''}`.trim()} />
                <DetailItem label="Email" value={viewBooking.userId?.email} />
                <DetailItem label="Phone" value={viewBooking.userId?.phoneNumber} />
                <DetailItem label="Payment Method" value={viewBooking.paymentMethod} />
                <DetailItem label="Payment Status" value={viewBooking.paymentStatus} />
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Order Items</h3>
              <div className="space-y-2">
                {viewBooking.products?.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.addOn && (
                        <div className="text-sm text-gray-600">
                          Variation: {product.addOn.variation} • Plates: {product.addOn.plateitems}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{product.basePrice}</div>
                      <div className="text-sm text-gray-600">Qty: {product.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Pricing Details</h3>
              <div className="space-y-2">
                <PriceItem label="Subtotal" value={viewBooking.subTotal} />
                <PriceItem label="Delivery Charge" value={viewBooking.deliveryCharge} />
                <PriceItem label="Coupon Discount" value={viewBooking.couponDiscount} />
                <div className="border-t pt-2 mt-2">
                  <PriceItem label="Total Payable" value={viewBooking.totalPayable} isTotal={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editBooking && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Order Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components for better organization
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-800">{value || "-"}</span>
  </div>
);

const PriceItem = ({ label, value, isTotal = false }) => (
  <div className="flex justify-between">
    <span className={`${isTotal ? 'font-bold text-lg' : 'font-medium'} text-gray-600`}>
      {label}:
    </span>
    <span className={`${isTotal ? 'font-bold text-lg text-green-700' : 'font-medium'}`}>
      ₹{value}
    </span>
  </div>
);

export default PendingBookingList;