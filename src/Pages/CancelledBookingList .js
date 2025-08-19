import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CancelledBookingList = () => {
  const cancelledBookings = [
    {
      id: 1,
      userName: "John Doe",
      productName: "Veg Pizza",
      quantity: 2,
      price: 300,
      totalPrice: 600,
      status: "Cancelled",
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
      status: "Cancelled",
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
      status: "Cancelled",
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
      status: "Cancelled",
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
      status: "Cancelled",
      bookingDate: "2025-04-16",
      deliveryDate: "2025-04-18",
    },
  ];

  // Status badge styles similar to CompletedBookingList
  const getStatusClass = (status) => {
    switch (status) {
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Delivered":
        return "bg-blue-100 text-blue-700";
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // PDF generation for the whole list
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Cancelled Booking List", 14, 20);

    const tableColumn = [
      "ID",
      "User Name",
      "Product",
      "Quantity",
      "Price",
      "Total Price",
      "Booking Date",
      "Delivery Date",
      "Status",
    ];
    const tableRows = [];

    cancelledBookings.forEach((booking) => {
      const bookingData = [
        booking.id,
        booking.userName,
        booking.productName,
        booking.quantity,
        `₹${booking.price}`,
        `₹${booking.totalPrice}`,
        booking.bookingDate,
        booking.deliveryDate,
        booking.status,
      ];
      tableRows.push(bookingData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [244, 67, 54] }, // Red header
    });

    doc.save("Cancelled_Booking_List.pdf");
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md w-full max-w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-semibold text-gray-700">Cancelled Orders</h2>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          title="Download PDF"
        >
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full text-xs text-left border border-gray-200">
          <thead className="bg-red-100 text-red-700">
            <tr>
              <th className="p-2 border">#ID</th>
              <th className="p-2 border">User Name</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total Price</th>
              <th className="p-2 border">Booking Date</th>
              <th className="p-2 border">Delivery Date</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {cancelledBookings.map((booking) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CancelledBookingList;
