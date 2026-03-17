import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiDownload,
  FiCalendar,
  FiShoppingBag,
  FiUser,
  FiMapPin,
  FiTrendingUp,
  FiPieChart,
  FiPrinter,
  FiSearch,
  FiX
} from 'react-icons/fi';

const AmbassadorCommissionReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    search: ''
  });
  const [ambassadorPercentage, setAmbassadorPercentage] = useState(3); // Default 3%

  useEffect(() => {
    fetchOrders();
  }, []);

  // Using allorders API
  const fetchOrders = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/ambsdor/allorders/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data || []);
        if (result.ambassadorCommissionPercentage) {
          setAmbassadorPercentage(result.ambassadorCommissionPercentage);
        }
        console.log('📊 Orders fetched:', result.data?.length || 0);
        console.log('💰 Total Commission:', result.totalCommission);
      } else {
        console.error('Failed to fetch orders:', result.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats from orders data
  const calculateStats = () => {
    if (!orders.length) return {
      totalCommission: 0,
      totalOrders: 0,
      averageCommission: 0,
      thisMonthCommission: 0,
      thisMonthOrders: 0,
      highestCommission: 0,
      lowestCommission: 0,
      walletBalance: 0
    };

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let totalCommission = 0;
    let thisMonthCommission = 0;
    let thisMonthOrders = 0;
    let commissions = [];

    orders.forEach(order => {
      const commission = order.commission || 0;
      totalCommission += commission;
      commissions.push(commission);

      const orderDate = new Date(order.createdAt);
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        thisMonthCommission += commission;
        thisMonthOrders++;
      }
    });

    const totalOrders = orders.length;
    const averageCommission = totalOrders > 0 ? totalCommission / totalOrders : 0;
    const highestCommission = commissions.length > 0 ? Math.max(...commissions) : 0;
    const lowestCommission = commissions.length > 0 ? Math.min(...commissions) : 0;

    return {
      totalCommission,
      totalOrders,
      averageCommission,
      thisMonthCommission,
      thisMonthOrders,
      highestCommission,
      lowestCommission,
      walletBalance: totalCommission // Wallet balance = total earned commission
    };
  };

  // Filter orders based on filters
  const getFilteredOrders = () => {
    if (!orders.length) return [];

    let filtered = [...orders];

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (filters.dateRange) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return orderDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return orderDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.restaurantId?.restaurantName?.toLowerCase().includes(searchLower) ||
        order._id?.toLowerCase().includes(searchLower) ||
        `${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const stats = calculateStats();
  const filteredOrders = getFilteredOrders();

  // Export to CSV function
  const exportToCSV = () => {
    if (!filteredOrders.length) return;

    const headers = ['Order ID', 'Date', 'Restaurant', 'Customer', 'Subtotal', 'Commission', 'Commission Rate'];
    
    const csvData = filteredOrders.map(order => [
      order._id?.substring(0, 8).toUpperCase() || 'N/A',
      formatDate(order.createdAt),
      order.restaurantId?.restaurantName || 'N/A',
      `${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.trim() || 'N/A',
      formatCurrency(order.subTotal || 0),
      formatCurrency(order.commission || 0),
      `${ambassadorPercentage}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading commission report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Commission Report</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Detailed breakdown of your referral commissions and earnings
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(stats.totalCommission)}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-blue-500 opacity-70" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(stats.walletBalance)}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-green-500 opacity-70" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {stats.totalOrders}
                </p>
              </div>
              <FiShoppingBag className="w-8 h-8 text-purple-500 opacity-70" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {ambassadorPercentage}%
                </p>
              </div>
              <FiPieChart className="w-8 h-8 text-orange-500 opacity-70" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Date Range Filter */}
              <div className="flex items-center space-x-2">
                <FiCalendar className="text-gray-400" />
                <select 
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              {/* Search Filter */}
              <div className="flex items-center space-x-2 flex-1">
                <FiSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by restaurant, order ID, or customer..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 w-full lg:w-auto">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full lg:w-auto justify-center"
              >
                <FiDownload className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full lg:w-auto justify-center"
              >
                <FiPrinter className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Commission Report Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Commission Transactions</h2>
            <p className="text-gray-600 mt-1">
              Showing {filteredOrders.length} of {orders.length} transactions
            </p>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">
                {filters.search || filters.dateRange !== 'all' ? 
                  'No transactions match your filters' : 
                  'No commission transactions available'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {/* 🔥 FIX: Actions column completely removed */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id?.substring(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateTime(order.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.restaurantId?.restaurantName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.restaurantId?.locationName || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {`${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.trim() || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Referred Customer
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.subTotal || 0)}
                        </div>
                        {/* 🔥 FIX: Total Payable line completely removed */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(order.commission || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600 font-medium">
                          {ambassadorPercentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          of subtotal
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      {/* 🔥 FIX: Actions cell removed */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month Commission</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(stats.thisMonthCommission)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month Orders</span>
                <span className="text-lg font-bold text-purple-600">
                  {stats.thisMonthOrders}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Commission Range</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Highest Commission</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(stats.highestCommission)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lowest Commission</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(stats.lowestCommission)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Referred Customers:</span>
                <span className="font-medium">
                  {new Set(orders.map(o => o.userId?._id)).size || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Restaurants:</span>
                <span className="font-medium">
                  {new Set(orders.map(o => o.restaurantId?._id)).size || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Report Period:</span>
                <span className="font-medium">
                  {orders.length > 0 ? 
                    `${formatDate(orders[orders.length-1]?.createdAt)} - ${formatDate(orders[0]?.createdAt)}` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 FIX: Order Details Modal completely removed */}
      </div>
    </div>
  );
};

export default AmbassadorCommissionReport;