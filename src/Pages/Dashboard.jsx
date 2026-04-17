import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useState, useEffect } from "react";
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiImage,
  FiTag,
  FiTrendingUp,
  FiCoffee,
  FiCheckCircle,
  FiClock,
  FiShare2,
  FiAward,
  FiStar
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("Today");
  const [dashboardData, setDashboardData] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const [ridersData, setRidersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: convert "HH:MM:SS" to "hh:MM AM/PM"
  const formatTimeToAMPM = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 'Recently';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  // Fetch all data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch main dashboard data
        const dashboardResponse = await fetch("https://api.vegiffyy.com/api/admin/getdashboard");
        if (!dashboardResponse.ok) {
          throw new Error(`HTTP error! status: ${dashboardResponse.status}`);
        }
        const dashboardResult = await dashboardResponse.json();
        
        // Fetch referral data
        const referralResponse = await fetch("https://api.vegiffyy.com/api/admin/getreffred");
        const referralResult = referralResponse.ok ? await referralResponse.json() : { success: false };
        
        // Fetch riders data
        const ridersResponse = await fetch("https://api.vegiffyy.com/api/delivery-boy/alldeliveryboy");
        let ridersResult;
        if (ridersResponse.ok) {
          ridersResult = await ridersResponse.json();
          console.log("Riders API Response:", ridersResult);
        } else {
          ridersResult = { success: false };
        }
        
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
        
        if (referralResult.success) {
          setReferralData(referralResult.data);
        }
        
        if (ridersResult.message === "Delivery boys fetched successfully.") {
          setRidersData(ridersResult.data);
        } else if (ridersResult.success && ridersResult.data) {
          setRidersData(ridersResult.data);
        } else {
          console.log("Riders data not in expected format:", ridersResult);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate riders stats
  const calculateRidersStats = () => {
    console.log("Riders Data for calculation:", ridersData);
    
    if (!ridersData) return { totalRiders: 0, activeRiders: 0 };
    
    let totalRiders = 0;
    let activeRiders = 0;
    
    if (Array.isArray(ridersData)) {
      totalRiders = ridersData.length;
      activeRiders = ridersData.filter(rider => {
        const status = rider.deliveryBoyStatus || rider.status || rider.isActive;
        return status === "active" || status === "Active" || status === true;
      }).length;
    } 
    else if (ridersData.data && Array.isArray(ridersData.data)) {
      totalRiders = ridersData.data.length;
      activeRiders = ridersData.data.filter(rider => 
        (rider.deliveryBoyStatus || rider.status || rider.isActive) === "active" || 
        (rider.deliveryBoyStatus || rider.status || rider.isActive) === true
      ).length;
    }
    
    console.log("Calculated Stats:", { totalRiders, activeRiders });
    return { totalRiders, activeRiders };
  };

  // Sample data structure with API data
  const salesData = {
    Today: [{ name: "Today", sales: dashboardData?.revenueToday || 0 }],
    "This Week": [
      { name: "Mon", sales: 300 },
      { name: "Tue", sales: 250 },
      { name: "Wed", sales: 450 },
      { name: "Thu", sales: 500 },
      { name: "Fri", sales: 400 },
      { name: "Sat", sales: 700 },
      { name: "Sun", sales: 600 },
    ],
    "Last Week": [
      { name: "Mon", sales: 250 },
      { name: "Tue", sales: 300 },
      { name: "Wed", sales: 350 },
      { name: "Thu", sales: 400 },
      { name: "Fri", sales: 450 },
      { name: "Sat", sales: 500 },
      { name: "Sun", sales: 550 },
    ],
    "Last Month": [
      { name: "Week 1", sales: 1200 },
      { name: "Week 2", sales: 1500 },
      { name: "Week 3", sales: 1800 },
      { name: "Week 4", sales: 2000 },
    ],
  };

  // Order status data from API
  const orderStatusData = dashboardData ? [
    { 
      name: "Delivered", 
      value: dashboardData.orderStats?.delivered?.count || 0, 
      color: "#10B981",
      sales: dashboardData.orderStats?.delivered?.sales || 0
    },
    { 
      name: "Pending", 
      value: dashboardData.orderStats?.pending?.count || 0, 
      color: "#F59E0B",
      sales: dashboardData.orderStats?.pending?.sales || 0
    },
    { 
      name: "Cancelled", 
      value: dashboardData.orderStats?.cancelled?.count || 0, 
      color: "#EF4444",
      sales: dashboardData.orderStats?.cancelled?.sales || 0
    }
  ] : [];

  // Latest orders from API with formatted time
  const latestOrders = dashboardData?.latestOrders?.map(order => ({
    orderId: order._id || order.orderId || "N/A",
    customer: order.customerName || order.customer || "N/A",
    product: order.productName || order.product || "N/A",
    category: order.category || "N/A",
    price: order.price ? `₹${order.price}` : "N/A",
    status: order.orderStatus || order.status || "Pending",
    totalPayable: order.totalPayable ? `₹${order.totalPayable}` : "N/A",
    time: formatTimeToAMPM(order.timeAgo) // Fixed: show AM/PM
  })) || [];

  // Get riders stats
  const ridersStats = calculateRidersStats();

  // Stats from API - Total Income now has no decimals
  const stats = {
    totalUsers: dashboardData?.totalUsers || 0,
    totalRestaurants: dashboardData?.totalVendors || 0,
    activeRestaurants: dashboardData?.activeVendors || dashboardData?.totalVendors || 0,
    totalRiders: ridersStats.totalRiders,
    activeRiders: ridersStats.activeRiders,
    totalOrders: dashboardData?.totalOrders || 0,
    totalProducts: dashboardData?.totalProducts || 0,
    totalIncome: `₹${Math.floor(dashboardData?.totalRevenue || 0).toLocaleString()}`, // Fixed: no decimals
    totalBanners: dashboardData?.totalBanners || 0,
    totalCategories: dashboardData?.totalCategories || 23
  };

  // Referral stats from API
  const referralStats = referralData ? {
    referredUsers: referralData.referredUsersCount || 0,
    referredRestaurants: referralData.referredRestaurantsCount || 0,
    referredAmbassadors: referralData.referredAmbassadorsCount || 0,
    totalReferrals: (referralData.referredUsersCount || 0) + 
                   (referralData.referredRestaurantsCount || 0) + 
                   (referralData.referredAmbassadorsCount || 0)
  } : {
    referredUsers: 0,
    referredRestaurants: 0,
    referredAmbassadors: 0,
    totalReferrals: 0
  };

  // Quick stats from API
  const quickStats = {
    ordersToday: dashboardData?.ordersToday || 0,
    revenueToday: dashboardData?.revenueToday || 0,
    successRate: dashboardData?.successRate || 0,
    pendingActions: dashboardData?.pendingActions || 0,
    deliveredOrders: dashboardData?.salesOverview?.deliveredOrders || 0,
    pendingOrders: dashboardData?.salesOverview?.pendingOrders || 0
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const barColors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#84CC16"];

  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Complete overview of your platform performance</p>
      </div>

      {/* Referral Stats Grid - Clean cards without white spots */}
      {referralData && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Referral Program Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/dashboard")}
            >
              <div className="mb-4">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <FiShare2 className="text-white" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{referralStats.totalReferrals}</div>
              <div className="text-lg font-semibold mb-1">Total Referrals</div>
              <div className="text-white/80 text-sm">All referred entities</div>
            </div>

            <div 
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/dashboard")}
            >
              <div className="mb-4">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <FiUsers className="text-white" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{referralStats.referredUsers}</div>
              <div className="text-lg font-semibold mb-1">Referred Users</div>
              <div className="text-white/80 text-sm">New users through referrals</div>
            </div>

            <div 
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/dashboard")}
            >
              <div className="mb-4">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <FiCoffee className="text-white" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{referralStats.referredRestaurants}</div>
              <div className="text-lg font-semibold mb-1">Referred Restaurants</div>
              <div className="text-white/80 text-sm">Partner restaurants joined</div>
            </div>

            <div 
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/dashboard")}
            >
              <div className="mb-4">
                <div className="p-3 bg-white/20 rounded-xl w-fit">
                  <FiAward className="text-white" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{referralStats.referredAmbassadors}</div>
              <div className="text-lg font-semibold mb-1">Referred Ambassadors</div>
              <div className="text-white/80 text-sm">Brand ambassadors onboarded</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<FiUsers className="text-blue-500" />}
          color="blue"
          onClick={() => navigate("/users")}
        />
        <StatCard 
          title="Restaurants" 
          value={stats.totalRestaurants} 
          icon={<FiCoffee className="text-green-500" />}
          color="green"
          onClick={() => navigate("/vendorlist")}
        />
        <StatCard 
          title="Active Restaurants" 
          value={stats.activeRestaurants} 
          icon={<FiCheckCircle className="text-emerald-500" />}
          color="emerald"
          onClick={() => navigate("/vendorlist")}
        />
        <StatCard 
          title="Total Riders" 
          value={stats.totalRiders} 
          icon={<FiTruck className="text-purple-500" />}
          color="purple"
          onClick={() => navigate("/riderlist")}
        />
        <StatCard 
          title="Active Riders" 
          value={stats.activeRiders} 
          icon={<FiCheckCircle className="text-indigo-500" />}
          color="indigo"
          onClick={() => navigate("/riderlist")}
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={<FiShoppingBag className="text-orange-500" />}
          color="orange"
          onClick={() => navigate("/allorders")}
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={<FiPackage className="text-pink-500" />}
          color="pink"
          onClick={() => navigate("/productlist")}
        />
        <StatCard 
          title="Total Income" 
          value={stats.totalIncome} 
          icon={<FiDollarSign className="text-green-500" />}
          color="green"
          onClick={() => navigate("/orderpayments")}
        />
        <StatCard 
          title="Banners" 
          value={stats.totalBanners} 
          icon={<FiImage className="text-cyan-500" />}
          color="cyan"
          onClick={() => navigate("/create-banner")}
        />
        <StatCard 
          title="Categories" 
          value={stats.totalCategories} 
          icon={<FiTag className="text-violet-500" />}
          color="violet"
          onClick={() => navigate("/categorylist")}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
            <select
              value={timeframe}
              onChange={handleTimeframeChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.keys(salesData).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData[timeframe]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`₹${value}`, "Sales Amount"]}
              />
              <Legend />
              <Bar 
                dataKey="sales" 
                name="Sales Amount"
                radius={[4, 4, 0, 0]}
              >
                {salesData[timeframe].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} orders (₹${props.payload.sales || 0})`, 
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {orderStatusData.map((status, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-sm text-gray-600">{status.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Latest Orders</h3>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => navigate("/allorders")}
          >
            View All Orders
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.length > 0 ? (
                latestOrders.map((order, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/allorders`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {order.orderId.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-gray-700">{order.customer}</td>
                    <td className="px-4 py-3 text-gray-700">{order.product}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{order.price}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{order.totalPayable}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "Delivered" || order.status === "delivered"
                          ? "bg-green-100 text-green-800" 
                          : order.status === "Pending" || order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {order.status === "Pending" && <FiClock className="mr-1" size={12} />}
                        {order.status === "Delivered" && <FiCheckCircle className="mr-1" size={12} />}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{order.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-2xl font-bold">{quickStats.ordersToday}</div>
          <div className="text-blue-100 text-sm">Orders Today</div>
        </div>
        <div 
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-2xl font-bold">₹{quickStats.revenueToday}</div>
          <div className="text-green-100 text-sm">Revenue Today</div>
        </div>
        <div 
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-2xl font-bold">{quickStats.successRate}%</div>
          <div className="text-purple-100 text-sm">Success Rate</div>
        </div>
        <div 
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-2xl font-bold">{quickStats.pendingActions}</div>
          <div className="text-orange-100 text-sm">Pending Actions</div>
        </div>
      </div>

      {/* Order Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-2xl font-bold">{quickStats.deliveredOrders}</div>
          <div className="text-emerald-100 text-sm">Delivered Orders</div>
        </div>
        <div 
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-2xl font-bold">{quickStats.pendingOrders}</div>
          <div className="text-yellow-100 text-sm">Pending Orders</div>
        </div>
        <div 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-2xl font-bold">{stats.totalRiders}</div>
          <div className="text-indigo-100 text-sm">Total Riders</div>
        </div>
        <div 
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-4 text-white cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-2xl font-bold">{stats.activeRiders}</div>
          <div className="text-cyan-100 text-sm">Active Riders</div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component - Clean without white spots with navigation
const StatCard = ({ title, value, icon, color, onClick }) => {
  const colorMap = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    emerald: "border-emerald-200 bg-emerald-50",
    purple: "border-purple-200 bg-purple-50",
    indigo: "border-indigo-200 bg-indigo-50",
    orange: "border-orange-200 bg-orange-50",
    pink: "border-pink-200 bg-pink-50",
    cyan: "border-cyan-200 bg-cyan-50",
    violet: "border-violet-200 bg-violet-50"
  };

  return (
    <div 
      className={`rounded-xl border-2 p-5 transition-all hover:shadow-md hover:scale-105 cursor-pointer ${colorMap[color]}`}
      onClick={onClick}
    >
      <div className="mb-3">
        <div className="p-2 bg-white rounded-lg border border-gray-200 w-fit">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{title}</div>
    </div>
  );
};

export default Dashboard;