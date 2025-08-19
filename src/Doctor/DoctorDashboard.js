import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarCheck,
  FaUserAlt,
  FaClipboardList,
} from "react-icons/fa"; // Importing icons
import { useNavigate } from "react-router-dom"; // For React Router v6

const DoctorDashboard = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [doctorDetails, setDoctorDetails] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctorStats = async () => {
      try {
        const doctorId = localStorage.getItem("doctorId");

        if (!doctorId) {
          alert("Doctor ID not found in localStorage");
          return;
        }

        // Fetch doctor stats (appointments, patients, etc.)
        const res = await axios.get(
          `https://credenhealth.onrender.com/api/doctor/stats/${doctorId}`
        );
        const { totalAppointments, totalPatients, doctorInfo } = res.data;

        setAppointmentCount(totalAppointments);
        setPatientCount(totalPatients);
        setDoctorDetails(doctorInfo);
      } catch (error) {
        console.error("Error fetching doctor stats:", error);
        setError("Error fetching doctor data.");
      }
    };

    fetchDoctorStats();
  }, []);

  // Updated doctor metrics array with icons and paths for redirection
  const doctorMetrics = [
    { name: "Appointments", value: appointmentCount, icon: <FaCalendarCheck size={24} />, path: "/doctor/appointments" },
    { name: "Patients", value: patientCount, icon: <FaUserAlt size={24} />, path: "/doctor/patients" },
    { name: "Profile", icon: <FaClipboardList size={24} />, path: "/doctor/doctorprofile" },
  ];

  // Handle card click and redirect
  const handleCardClick = (path) => {
    if (path) {
      navigate(path); // Redirect to the specified path
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-100">
      {/* Stats Cards */}
      <div className="md:col-span-4 p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {doctorMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white shadow-lg rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200"
            onClick={() => handleCardClick(metric.path)} // Trigger redirection on click
          >
            {/* Render the icon if it exists */}
            <div className="text-4xl mb-2 text-blue-600">
              {metric.icon && metric.icon} {/* Show icon if it exists */}
            </div>
            {/* Render value if it exists */}
            <div className="text-3xl font-bold text-blue-900">
              {metric.value || "-"} {/* Show value or placeholder if not available */}
            </div>
            <h4 className="text-lg font-semibold text-[#188753]">{metric.name}</h4>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DoctorDashboard;
