import React from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const PendingBookingList = () => {
  const pendingBookings = [
    {
      id: 1,
      userName: "John Doe",
      productName: "Veg Pizza",
      quantity: 2,
      price: 300,
      totalPrice: 600,
      status: "Pending",
      bookingDate: "2025-04-20",
      deliveryDate: "2025-04-22",
    },
    {
      id: 2,
      userName: "Jane Smith",
      productName: "Veg Pizza",
      quantity: 1,
      price: 450,
      totalPrice: 450,
      status: "Pending",
      bookingDate: "2025-04-18",
      deliveryDate: "2025-04-20",
    },
    {
      id: 3,
      userName: "Emily Johnson",
      productName: "Spaghetti Aglio Olio",
      quantity: 3,
      price: 350,
      totalPrice: 1050,
      status: "Pending",
      bookingDate: "2025-04-19",
      deliveryDate: "2025-04-21",
    },
    {
      id: 4,
      userName: "Michael Brown",
      productName: "Cheese Burger",
      quantity: 1,
      price: 250,
      totalPrice: 250,
      status: "Pending",
      bookingDate: "2025-04-17",
      deliveryDate: "2025-04-19",
    },
    {
      id: 5,
      userName: "Sarah Davis",
      productName: "Chocolate Cake",
      quantity: 2,
      price: 200,
      totalPrice: 400,
      status: "Pending",
      bookingDate: "2025-04-16",
      deliveryDate: "2025-04-18",
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

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(pendingBookings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Bookings");
    XLSX.writeFile(wb, "Pending_Bookings.xlsx");
  };

  const generateInvoice = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Pending Booking Invoice", 14, 20);

    doc.autoTable({
      startY: 30,
      head: [["Field", "Details"]],
      body: [
        ["Order ID", booking.id],
        ["Customer Name", booking.userName],
        ["Product", booking.productName],
        ["Quantity", booking.quantity],
        ["Price (each)", `₹${booking.price}`],
        ["Total Price", `₹${booking.totalPrice}`],
        ["Booking Date", booking.bookingDate],
        ["Delivery Date", booking.deliveryDate],
        ["Status", booking.status],
      ],
    });

    doc.save(`Pending_Invoice_${booking.id}.pdf`);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md w-full max-w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-semibold text-gray-700">Pending Orders</h2>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          <FaFileExcel />
          Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full text-xs text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">#ID</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Booking</th>
              <th className="p-2 border">Delivery</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingBookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <td className="p-2 border">{booking.id}</td>
                <td className="p-2 border">{booking.userName}</td>
                <td className="p-2 border">{booking.productName}</td>
                <td className="p-2 border">{booking.quantity}</td>
                <td className="p-2 border">₹{booking.price}</td>
                <td className="p-2 border">₹{booking.totalPrice}</td>
                <td className="p-2 border">{booking.bookingDate}</td>
                <td className="p-2 border">{booking.deliveryDate}</td>
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
                  <button
                    onClick={() => generateInvoice(booking)}
                    className="text-red-500 hover:text-red-700"
                    title="Download PDF"
                  >
                    <FaFilePdf />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingBookingList;
