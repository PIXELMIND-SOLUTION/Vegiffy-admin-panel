import React from "react";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable"; // for tabular PDF content

const BookingList = () => {
  // Sample booking data
  const bookings = [
    {
      bookingId: 2,
      restaurantName: "Green Leaf Café",
      userName: "Jane Smith",
      userEmail: "jane.smith@example.com",
      userPhone: "+1987654321",
      bookingDate: "2025-04-18",
      productName: "Veg Pizza",
      quantity: 1,
      price: 400,
      totalAmount: 400,
      status: "Pending",
    },
    {
      bookingId: 3,
      restaurantName: "Italiano Kitchen",
      userName: "Sarah Connor",
      userEmail: "sarah.connor@example.com",
      userPhone: "+1122334455",
      bookingDate: "2025-04-19",
      productName: "Spaghetti Aglio Olio",
      quantity: 3,
      price: 300,
      totalAmount: 900,
      status: "Delivered",
    },
    {
      bookingId: 5,
      restaurantName: "Sweet Bites Bakery",
      userName: "Emily Stone",
      userEmail: "emily.stone@example.com",
      userPhone: "+1445566778",
      bookingDate: "2025-04-17",
      productName: "Chocolate Cake",
      quantity: 2,
      price: 180,
      totalAmount: 360,
      status: "Confirmed",
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Delivered":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Download Excel file
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(bookings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "Booking_List.xlsx");
  };

  // Generate PDF invoice
  const generateInvoicePDF = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Order Invoice", 14, 20);
    doc.setFontSize(10);

    doc.autoTable({
      startY: 30,
      head: [["Field", "Details"]],
      body: [
        ["Booking ID", booking.bookingId],
        ["Restaurant", booking.restaurantName],
        ["Customer Name", booking.userName],
        ["Email", booking.userEmail],
        ["Phone", booking.userPhone],
        ["Booking Date", booking.bookingDate],
        ["Product", booking.productName],
        ["Quantity", booking.quantity],
        ["Price (each)", `₹${booking.price}`],
        ["Total Amount", `₹${booking.totalAmount}`],
        ["Status", booking.status],
      ],
    });

    doc.save(`Invoice_${booking.bookingId}.pdf`);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md w-full max-w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-semibold text-gray-700">Order List</h2>
        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          <FaFileExcel />
          Download Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full text-xs text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">#ID</th>
              <th className="p-2 border">Restaurant</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.bookingId} className="border-t">
                <td className="p-2 border">{booking.bookingId}</td>
                <td className="p-2 border whitespace-nowrap">{booking.restaurantName}</td>
                <td className="p-2 border">{booking.userName}</td>
                <td className="p-2 border">{booking.userEmail}</td>
                <td className="p-2 border">{booking.userPhone}</td>
                <td className="p-2 border">{booking.bookingDate}</td>
                <td className="p-2 border">{booking.productName}</td>
                <td className="p-2 border">{booking.quantity}</td>
                <td className="p-2 border">₹{booking.price}</td>
                <td className="p-2 border">₹{booking.totalAmount}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="p-2 border">
                  <div className="flex gap-1 text-sm">
                    <button
                      title="Download PDF"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => generateInvoicePDF(booking)}
                    >
                      <FaFilePdf />
                    </button>
                    <button title="View" className="text-blue-500 hover:text-blue-700">
                      <FaEye />
                    </button>
                    <button title="Edit" className="text-yellow-500 hover:text-yellow-700">
                      <FaEdit />
                    </button>
                    <button title="Delete" className="text-gray-500 hover:text-gray-700">
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingList;
