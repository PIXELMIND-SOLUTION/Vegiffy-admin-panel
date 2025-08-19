import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload } from "react-icons/fa"; // For download icon
import * as XLSX from "xlsx"; // For exporting to Excel

const SingleDiagnosticBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const diagnosticId = localStorage.getItem("diagnosticId");

      console.log("📌 diagnosticId from localStorage:", diagnosticId);

      if (!diagnosticId) {
        alert("Diagnostic ID not found in localStorage");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4000/api/admin/get-bookings/${diagnosticId}`
        );

        console.log("📦 Bookings Response:", response.data);
        setBookings(response.data.bookings || []);
      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        alert("Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // 🧾 Handle prescription upload
  const handleFileChange = async (e, bookingId) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log(`📤 Uploading prescription for bookingId: ${bookingId}`);
    console.log("📎 File:", file);

    const formData = new FormData();
    formData.append("prescription", file);

    try {
      setUploadingId(bookingId);

      // 🔁 API call to upload prescription (adjust URL as needed)
      const response = await axios.post(
        `http://localhost:4000/api/admin/upload-prescription/${bookingId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Prescription uploaded successfully!");
      console.log("✅ Server Response:", response.data);
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to upload prescription.");
    } finally {
      setUploadingId(null);
    }
  };

  // Export bookings to Excel
  const handleExportToExcel = () => {
    const dataToExport = bookings.map((booking) => ({
      "Patient Name": booking.patient_name,
      Age: booking.patient_age,
      Gender: booking.patient_gender,
      Staff: booking.staff_name,
      "Consultation Fee": `₹${booking.consultation_fee}`,
      Tests: booking.tests.map((test) => `${test.test_name} (₹${test.offerPrice})`).join(", "),
      Total: `₹${booking.total}`,
      Status: booking.status,
      "Appointment Date": new Date(booking.appointment_date).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");

    // Download the Excel file
    XLSX.writeFile(wb, "Diagnostic_Bookings.xlsx");
  };

  if (loading) return <div className="p-4">Loading bookings...</div>;
  if (bookings.length === 0) return <div className="p-4">No bookings found.</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Diagnostic Center Bookings</h2>

        {/* Excel Export Button */}
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2 text-sm"
        >
          <FaDownload /> Download Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Patient Name</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Gender</th>
              <th className="p-2 border">Staff</th>
              <th className="p-2 border">Consultation Fee</th>
              <th className="p-2 border">Tests</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Appointment Date</th>
              <th className="p-2 border">Add Prescription</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{booking.patient_name}</td>
                <td className="p-2 border">{booking.patient_age}</td>
                <td className="p-2 border">{booking.patient_gender}</td>
                <td className="p-2 border">{booking.staff_name}</td>
                <td className="p-2 border">₹{booking.consultation_fee}</td>
                <td className="p-2 border">
                  <ul className="list-disc list-inside">
                    {booking.tests.map((test, i) => (
                      <li key={i}>{test.test_name} (₹{test.offerPrice})</li>
                    ))}
                  </ul>
                </td>
                <td className="p-2 border font-semibold">₹{booking.total}</td>
                <td className="p-2 border">{booking.status}</td>
                <td className="p-2 border">
                  {new Date(booking.appointment_date).toLocaleDateString()}
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => document.getElementById(`file-input-${booking.bookingId}`).click()}
                    className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
                  >
                    {uploadingId === booking.bookingId ? "Uploading..." : "Add"}
                  </button>
                  <input
                    id={`file-input-${booking.bookingId}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, booking.bookingId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SingleDiagnosticBookings;
