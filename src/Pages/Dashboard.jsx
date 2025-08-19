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
import { useState } from "react";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("Today");

  const vendorSalesData = {
    Today: [{ name: "Today", sales: 1200 }],
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

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const barColors = [
    "#FF9800",
    "#4CAF50",
    "#2196F3",
    "#9C27B0",
    "#FF5722",
    "#FFC107",
    "#03A9F4",
  ];

  const orders = [
    { orderId: "ORD12345", product: "Pizza Margherita", category: "Restaurant", price: "₹250", status: "Pending" },
    { orderId: "ORD12346", product: "Organic Vegetables", category: "Groceries", price: "₹450", status: "Completed" },
    { orderId: "ORD12347", product: "Frozen Paneer", category: "Dairy", price: "₹320", status: "Pending" },
    { orderId: "ORD12348", product: "Masala Dosa", category: "Restaurant", price: "₹180", status: "Completed" },
    { orderId: "ORD12349", product: "Chocolates", category: "Snacks", price: "₹200", status: "Pending" },
  ];

  const vendors = [
    { id: 1, name: "FreshFarm", products: 120, status: "Active" },
    { id: 2, name: "TastyBites", products: 95, status: "Active" },
    { id: 3, name: "LocalMart", products: 80, status: "Inactive" },
  ];

  const banners = [
    { id: 1, title: "Welcome Discount", status: "Active" },
    { id: 2, title: "Festival Sale", status: "Active" },
    { id: 3, title: "Weekend Deal", status: "Inactive" },
  ];

  const pendingOrders = orders.filter((order) => order.status === "Pending");

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">Complete overview of your platform</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 mb-8">
        <StatCard title="Total Orders" value="50" color="blue" />
        <StatCard title="Completed Orders" value="45" color="green" />
        <StatCard title="Total Sales" value="₹8,000" color="yellow" />
        <StatCard title="Total Products" value="200" color="purple" />
        <StatCard title="Vendors" value={vendors.length} color="indigo" />
        <StatCard title="Banners" value={banners.length} color="pink" />
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
          <select
            value={timeframe}
            onChange={handleTimeframeChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {Object.keys(vendorSalesData).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vendorSalesData[timeframe]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {vendorSalesData[timeframe].map((_, index) => (
              <Bar
                key={index}
                dataKey="sales"
                name={vendorSalesData[timeframe][index].name}
                fill={barColors[index % barColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vendor Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendors</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="border p-4 rounded shadow-sm bg-gray-50">
              <h4 className="text-md font-semibold text-gray-700">{vendor.name}</h4>
              <p className="text-sm text-gray-500">Products: {vendor.products}</p>
              <p
                className={`text-sm font-medium ${
                  vendor.status === "Active" ? "text-green-600" : "text-red-600"
                }`}
              >
                {vendor.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Banners</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="border p-4 rounded bg-gray-50">
              <h4 className="text-md font-semibold text-gray-700">{banner.title}</h4>
              <p
                className={`text-sm font-medium ${
                  banner.status === "Active" ? "text-green-600" : "text-red-600"
                }`}
              >
                {banner.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <TableSection title="Recent Orders" orders={orders} />

      {/* Pending Orders */}
      <TableSection title="Pending Orders" orders={pendingOrders} />
    </div>
  );
};

// ✅ Reusable Components

const StatCard = ({ title, value, color }) => {
  const colorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    indigo: "text-indigo-600",
    pink: "text-pink-600",
  };
  return (
    <div className="bg-white shadow rounded-lg p-4 text-center">
      <h2 className={`text-2xl font-bold ${colorMap[color]}`}>{value}</h2>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
};

const TableSection = ({ title, orders }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">Order ID</th>
              <th className="px-4 py-2 border-b">Product</th>
              <th className="px-4 py-2 border-b">Category</th>
              <th className="px-4 py-2 border-b">Price</th>
              <th className="px-4 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{order.orderId}</td>
                <td className="px-4 py-2 border-b">{order.product}</td>
                <td className="px-4 py-2 border-b">{order.category}</td>
                <td className="px-4 py-2 border-b">{order.price}</td>
                <td
                  className={`px-4 py-2 border-b font-medium ${
                    order.status === "Completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
