import { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendar, FaUserInjured, FaUserCircle } from "react-icons/fa"; // ✅ Changed icons to valid ones
import { useNavigate } from "react-router-dom";

const DiagnosticDashboard = () => {
  const navigate = useNavigate();
  const [bookingCount, setBookingCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [diagnosticDetails, setDiagnosticDetails] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDiagnosticStats = async () => {
      try {
        const diagnosticId = localStorage.getItem("diagnosticId");

        if (!diagnosticId) {
          alert("Diagnostic ID not found in localStorage");
          return;
        }

        const res = await axios.get(
          `https://credenhealth.onrender.com/api/diagnostic/stats/${diagnosticId}`
        );

        const { totalBookings, totalPatients, diagnosticInfo } = res.data;

        setBookingCount(totalBookings);
        setPatientCount(totalPatients);
        setDiagnosticDetails(diagnosticInfo);
      } catch (error) {
        console.error("Error fetching diagnostic stats:", error);
        setError("Error fetching diagnostic data.");
      }
    };

    fetchDiagnosticStats();
  }, []);

  const diagnosticMetrics = [
    {
      name: "Bookings",
      value: bookingCount,
      icon: <FaCalendar size={24} />, // ✅ Updated
      path: "/diagnostic/all-bookings",
    },
    {
      name: "Patients",
      value: patientCount,
      icon: <FaUserInjured size={24} />,
      path: "/diagnostic/patients",
    },
    {
      name: "Profile",
      icon: <FaUserCircle size={24} />, // ✅ Updated
      path: "/diagnostic/profile",
    },
  ];

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-100">
      <div className="md:col-span-4 p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {diagnosticMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white shadow-lg rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200"
            onClick={() => handleCardClick(metric.path)}
          >
            <div className="text-4xl mb-2 text-blue-600">{metric.icon}</div>
            {metric.value !== undefined && (
              <div className="text-3xl font-bold text-blue-900">
                {metric.value || "-"}
              </div>
            )}
            <h4 className="text-lg font-semibold text-[#188753]">
              {metric.name}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticDashboard;
