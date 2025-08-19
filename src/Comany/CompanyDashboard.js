import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaUserPlus, FaUserAlt } from "react-icons/fa"; // Importing icons
import { useNavigate } from "react-router-dom";  // For React Router v6

const CompanyDashboard = () => {
  const navigate = useNavigate();  // Initialize the useNavigate hook
  const [timeframe, setTimeframe] = useState("Yearly");
  const [staffCount, setStaffCount] = useState(0);
  const [walletTotal, setWalletTotal] = useState(0);

  useEffect(() => {
    const fetchCompanyStats = async () => {
      try {
        const companyId = localStorage.getItem("companyId");

        if (!companyId) {
          alert("Company ID not found in localStorage");
          return;
        }

        const res = await axios.get(`https://credenhealth.onrender.com/api/admin/staffscount/${companyId}`);
        const { totalStaff, totalWalletBalance } = res.data;

        setStaffCount(totalStaff);
        setWalletTotal(totalWalletBalance);
      } catch (error) {
        console.error("Error fetching company stats:", error);
      }
    };

    fetchCompanyStats();
  }, []);

  // Updated company metrics array with icons and paths for redirection
  const companyMetrics = [
    { name: "Beneficiaries", value: staffCount },
    { name: "Add Beneficiaries", icon: <FaUserPlus size={24} />, path: "/company/add-benificary" },
    { name: "View Profile", icon: <FaUserAlt size={24} />, path: "/company/profile" },
    { name: "Total Wallet Amount", value: `₹${walletTotal.toLocaleString()}` },
  ];

  // Sample revenue data (static)
  const revenueData = [
    { name: "Jan", revenue: 20000 },
    { name: "Feb", revenue: 22000 },
    { name: "Mar", revenue: 24000 },
    { name: "Apr", revenue: 28000 },
    { name: "May", revenue: 30000 },
  ];

  // Handle card click and redirect
  const handleCardClick = (path) => {
    if (path) {
      navigate(path);  // Redirect to the specified path
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-100">
      {/* Stats Cards */}
      <div className="md:col-span-4 p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {companyMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white shadow-lg rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200"
            onClick={() => handleCardClick(metric.path)}  // Trigger redirection on click
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

      {/* Monthly Revenue Chart */}
      <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Monthly Revenue (Last 5 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#4CAF50" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
