import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiPieChart,
  FiArrowUp,
  FiArrowDown,
  FiCreditCard,
  FiActivity,
  FiStar,
  FiX
} from 'react-icons/fi';

const AmbassadorAnalytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month, year
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/ambsdor/alltransactions/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        console.error('Failed to fetch analytics data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle withdrawal button click
  const handleWithdrawalClick = () => {
    navigate('/ambassador/wallet');
  };

  // Calculate analytics metrics
  const calculateMetrics = () => {
    if (!analyticsData?.transactionHistory) return {};

    const transactions = analyticsData.transactionHistory;
    
    const totalCommission = transactions.reduce((sum, transaction) => sum + (transaction.commission || 0), 0);
    const totalOrders = transactions.length;
    const averageCommission = totalOrders > 0 ? totalCommission / totalOrders : 0;
    
    // This month's commission (example calculation)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthCommission = transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, transaction) => sum + (transaction.commission || 0), 0);

    // Last month's commission (example calculation)
    const lastMonthCommission = transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return transactionDate.getMonth() === lastMonth && transactionDate.getFullYear() === year;
      })
      .reduce((sum, transaction) => sum + (transaction.commission || 0), 0);

    const monthlyGrowth = lastMonthCommission > 0 
      ? ((thisMonthCommission - lastMonthCommission) / lastMonthCommission) * 100 
      : thisMonthCommission > 0 ? 100 : 0;

    return {
      totalCommission,
      totalOrders,
      averageCommission,
      thisMonthCommission,
      monthlyGrowth,
      walletBalance: analyticsData.walletBalance || 0
    };
  };

  const openTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const closeTransactionDetails = () => {
    setSelectedTransaction(null);
    setShowTransactionModal(false);
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ambassador Analytics</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your referral performance, commissions, and earnings in real-time
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Commission Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {formatCurrency(metrics.totalCommission)}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time earnings</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiDollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(metrics.walletBalance)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Available for withdrawal</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiCreditCard className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {metrics.totalOrders}
                </p>
                <p className="text-xs text-gray-500 mt-1">Referred orders</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiShoppingBag className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Monthly Growth Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <div className="flex items-center mt-2">
                  {metrics.monthlyGrowth >= 0 ? (
                    <FiArrowUp className="w-5 h-5 text-green-500 mr-1" />
                  ) : (
                    <FiArrowDown className="w-5 h-5 text-red-500 mr-1" />
                  )}
                  <p className={`text-2xl font-bold ${metrics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metrics.monthlyGrowth).toFixed(1)}%
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FiTrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transactions List - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                  <div className="flex space-x-2">
                    <select 
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {!analyticsData?.transactionHistory || analyticsData.transactionHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FiActivity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-500">Your referral transactions will appear here</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticsData.transactionHistory.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Order #{transaction.orderId?._id?.substring(0, 8).toUpperCase() || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.orderId?.restaurantId?.restaurantName || 'Restaurant'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDate(transaction.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600">
                              {formatCurrency(transaction.commission)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.orderId?.orderStatus)}`}>
                              {transaction.orderId?.orderStatus || 'Completed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openTransactionDetails(transaction)}
                              className="text-blue-600 hover:text-blue-900 transition-colors font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Average Commission Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Average Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Commission per Order</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {formatCurrency(metrics.averageCommission)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month Commission</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(metrics.thisMonthCommission)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <FiStar className="w-4 h-4 text-yellow-500" />
                    <span>Performance Score: {Math.min(100, Math.round((metrics.totalOrders / 10) * 100))}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Referred Users</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analyticsData?.referredUsersCount || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-semibold text-green-600">
                    {metrics.totalOrders > 0 ? 'High' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Active Since</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analyticsData?.transactionHistory?.[0]?.date ? 
                      formatDate(analyticsData.transactionHistory[0].date).split(',')[0] : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Withdrawal Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Ready to Withdraw?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Your earnings are available for withdrawal
              </p>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(metrics.walletBalance)}
                </p>
                <p className="text-blue-100 text-xs">Available Balance</p>
              </div>
              <button 
                onClick={handleWithdrawalClick}
                className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Transaction Details - Order #{selectedTransaction.orderId?._id?.substring(0, 8).toUpperCase()}
                  </h3>
                  <button
                    onClick={closeTransactionDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Commission Highlight */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-green-800 mb-1">Commission Earned</h4>
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(selectedTransaction.commission)}
                        </p>
                      </div>
                      <FiDollarSign className="w-12 h-12 text-green-400 opacity-50" />
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="font-medium">{formatDate(selectedTransaction.orderId?.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.orderId?.orderStatus)}`}>
                            {selectedTransaction.orderId?.orderStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium">{selectedTransaction.orderId?.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Value:</span>
                          <span className="font-medium">{formatCurrency(selectedTransaction.orderId?.totalPayable)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission Rate:</span>
                          <span className="font-medium">
                            {selectedTransaction.orderId?.totalPayable > 0 ? 
                              `${((selectedTransaction.commission / selectedTransaction.orderId.totalPayable) * 100).toFixed(2)}%` : 
                              'N/A'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission Date:</span>
                          <span className="font-medium">{formatDate(selectedTransaction.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  {selectedTransaction.orderId?.products && selectedTransaction.orderId.products.length > 0 && (
                    <div className="border rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 p-4 border-b">Order Items</h4>
                      <div className="p-4 space-y-3">
                        {selectedTransaction.orderId.products.map((product, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                                {product.addOn && (
                                  <p className="text-xs text-gray-500">
                                    {product.addOn.variation} • {product.addOn.plateitems} plates
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(product.basePrice * product.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeTransactionDetails}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbassadorAnalytics;