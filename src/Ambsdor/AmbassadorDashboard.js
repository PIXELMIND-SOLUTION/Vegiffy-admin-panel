import React, { useState, useEffect } from 'react';
import { FiUser, FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, FiCalendar, FiStar, FiAward, FiShare2, FiLock } from 'react-icons/fi';
import axios from 'axios';

const AmbassadorDashboard = () => {
  const [ambassadorData, setAmbassadorData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ambassadorId = localStorage.getItem('ambassadorId');
      
      if (!ambassadorId) {
        setError('Ambassador ID not found. Please login again.');
        setLoading(false);
        return;
      }

      // Get ambassador profile data
      const profileResponse = await axios.get(`https://api.vegiffyy.com/api/ambsdor/profile/${ambassadorId}`);
      
      if (profileResponse.data.success) {
        const profileData = profileResponse.data.data;
        setAmbassadorData(profileData);
        
        // Get all data in parallel
        const [ordersResponse, usersResponse, vendorsResponse, ambassadorsResponse] = await Promise.all([
          axios.get(`https://api.vegiffyy.com/api/ambsdor/allorders/${ambassadorId}`),
          axios.get(`https://api.vegiffyy.com/api/ambsdor/allusers/${ambassadorId}`),
          axios.get(`https://api.vegiffyy.com/api/ambsdor/allvendors/${ambassadorId}`),
          axios.get(`https://api.vegiffyy.com/api/ambsdor/allambassadors/${ambassadorId}`)
        ]);

        // Format orders with better details - Mobile aur Email completely hidden
        const formattedOrders = (ordersResponse.data.data || []).map(order => {
          const user = order.userId || {};
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Customer';
          
          return {
            id: order._id,
            orderId: order._id ? order._id.substring(0, 8) + '...' : 'N/A',
            customer: fullName,
            customerPhone: '**********', // Hidden mobile - sirf stars
            customerEmail: '********@***.***', // Hidden email - sirf stars
            restaurant: order.restaurantId?.restaurantName || 'Unknown Restaurant',
            amount: `₹${order.totalPayable?.toLocaleString() || '0'}`,
            status: order.orderStatus || 'Pending',
            date: formatTimeAgo(order.createdAt),
            fullDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A',
            items: order.products?.length || 0,
            paymentMethod: order.paymentMethod || 'N/A',
            paymentStatus: order.paymentStatus || 'N/A'
          };
        });

        // Prepare dashboard data
        const dashboardData = {
          stats: {
            totalUsers: usersResponse.data.data?.length || 0,
            totalVendors: vendorsResponse.data.data?.length || 0,
            totalOrders: ordersResponse.data.data?.length || 0,
            totalEarnings: `₹${(profileData.wallet || 0).toLocaleString()}`,
            totalAmbassadors: ambassadorsResponse.data.data?.length || 0
          },
          recentOrders: formattedOrders.slice(0, 3), // Show 3 recent orders
          achievements: getAchievements(profileData.wallet || 0, usersResponse.data.data?.length || 0, ordersResponse.data.data?.length || 0),
          ambassadorInfo: {
            fullName: profileData.fullName,
            referralCode: profileData.referralCode,
            wallet: profileData.wallet || 0,
            commissionPercentage: profileData.commissionPercentage || 0
          }
        };

        setDashboardData(dashboardData);
      } else {
        setError('Failed to fetch ambassador profile');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error loading dashboard. Please try again.');
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getAchievements = (earnings, users, orders) => {
    const achievements = [];
    
    if (earnings > 10000) {
      achievements.push({
        icon: '🏆',
        title: 'Top Earner',
        desc: 'Earned over ₹10,000'
      });
    } else if (earnings > 5000) {
      achievements.push({
        icon: '💰',
        title: 'Gold Earner',
        desc: 'Earned over ₹5,000'
      });
    }
    
    if (users > 50) {
      achievements.push({
        icon: '🚀',
        title: 'Network Builder',
        desc: 'Referred 50+ users'
      });
    } else if (users > 20) {
      achievements.push({
        icon: '👥',
        title: 'Connector',
        desc: 'Referred 20+ users'
      });
    }
    
    if (orders > 100) {
      achievements.push({
        icon: '⭐',
        title: 'Sales Champion',
        desc: '100+ successful orders'
      });
    } else if (orders > 50) {
      achievements.push({
        icon: '📦',
        title: 'Active Seller',
        desc: '50+ successful orders'
      });
    }
    
    // Default achievements if none met
    if (achievements.length === 0) {
      achievements.push(
        {
          icon: '🌟',
          title: 'Rising Star',
          desc: 'Keep going!'
        },
        {
          icon: '🎯',
          title: 'Getting Started',
          desc: 'Start your journey'
        }
      );
    }
    
    return achievements.slice(0, 3); // Show only 3 achievements
  };

  // Navigation functions
  const navigateTo = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statsData = dashboardData?.stats || {
    totalUsers: '0',
    totalVendors: '0',
    totalOrders: '0',
    totalEarnings: '₹0',
    totalAmbassadors: '0'
  };

  const latestOrders = dashboardData?.recentOrders || [];
  const achievements = dashboardData?.achievements || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6 relative overflow-hidden">
      
      {/* Floating Emojis Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${20 + Math.random() * 20}s`,
              fontSize: `${20 + Math.random() * 20}px`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          >
            {['🥗', '🍕', '🍔', '🌮', '🍜', '🍣', '🍦', '🍩', '🥑', '🥦', '🍓', '🥝', '🍇', '🥬', '🍋'][i]}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="backdrop-blur-lg bg-white/30 rounded-2xl p-6 border border-white/40 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
              {dashboardData?.ambassadorInfo?.fullName || ambassadorData?.fullName || 'Ambassador'}! 👋
            </span>
          </h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
            Here's your performance overview
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {dashboardData?.ambassadorInfo?.referralCode && (
              <p className="text-sm text-purple-600 font-medium bg-purple-100 px-3 py-1.5 rounded-lg">
                Referral Code: <span className="font-bold">{dashboardData.ambassadorInfo.referralCode}</span>
              </p>
            )}
            {dashboardData?.ambassadorInfo?.commissionPercentage > 0 && (
              <p className="text-sm text-green-600 font-medium bg-green-100 px-3 py-1.5 rounded-lg">
                Commission Rate: <span className="font-bold">{dashboardData.ambassadorInfo.commissionPercentage}%</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="backdrop-blur-lg bg-white/30 rounded-xl p-3 border border-white/40 shadow-lg flex items-center space-x-2">
            <FiCalendar className="text-purple-600" />
            <span className="text-sm text-gray-700 font-medium">{new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid with Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 relative z-10">
        {/* Total Users - Navigate to /ambassador/users */}
        <button 
          onClick={() => navigateTo('/ambassador/users')}
          className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statsData.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <FiTrendingUp className="mr-1" />
                Active referrals
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <FiUsers className="text-white text-xl" />
            </div>
          </div>
        </button>

        {/* Total Vendors - Navigate to /ambassador/vendors */}
        <button 
          onClick={() => navigateTo('/ambassador/vendors')}
          className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statsData.totalVendors}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <FiTrendingUp className="mr-1" />
                Restaurant partners
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <FiUser className="text-white text-xl" />
            </div>
          </div>
        </button>

        {/* Total Orders - Navigate to /ambassador/orders */}
        <button 
          onClick={() => navigateTo('/ambassador/orders')}
          className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statsData.totalOrders}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <FiTrendingUp className="mr-1" />
                Successful orders
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <FiShoppingBag className="text-white text-xl" />
            </div>
          </div>
        </button>

        {/* Total Earnings - Navigate to /ambassador/wallet */}
        <button 
          onClick={() => navigateTo('/ambassador/wallet')}
          className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statsData.totalEarnings}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <FiTrendingUp className="mr-1" />
                Lifetime commission
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <FiDollarSign className="text-white text-xl" />
            </div>
          </div>
        </button>

        {/* Total Ambassadors - Navigate to /ambassador/ambassadors */}
        <button 
          onClick={() => navigateTo('/ambassador/ambassadors')}
          className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Ambassadors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statsData.totalAmbassadors}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <FiTrendingUp className="mr-1" />
                Your network
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
              <FiAward className="text-white text-xl" />
            </div>
          </div>
        </button>
      </div>

      {/* Achievements and Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 relative z-10">
        {/* Achievements */}
        <div className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
            <FiAward className="mr-2 text-yellow-500" />
            Your Achievements
          </h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/60 hover:bg-white/70 transition-all duration-300 group">
                <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{achievement.title}</p>
                  <p className="text-xs text-gray-600">{achievement.desc}</p>
                </div>
                <FiStar className="text-yellow-500" />
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-200/50">
            <p className="text-sm text-gray-700 text-center">
              <strong>Pro Tip:</strong> Share your referral code to earn more! 🚀
            </p>
          </div>
        </div>

        {/* Recent Orders with Better Details - Mobile aur Email COMPLETELY HIDDEN */}
        <div className="lg:col-span-2 backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiShoppingBag className="mr-2 text-purple-500" />
              Recent Orders
            </h3>
            <button 
              onClick={() => navigateTo('/ambassador/orders')}
              className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center font-medium"
            >
              View All Orders <FiShare2 className="ml-2" />
            </button>
          </div>
          
          {latestOrders.length > 0 ? (
            <div className="space-y-4">
              {latestOrders.map((order, index) => (
                <div key={index} className="bg-white/60 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {order.customer?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.customer}</p>
                       
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 text-right">
                      <p className="text-lg font-bold text-gray-900">{order.amount}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Restaurant</p>
                      <p className="font-medium truncate">{order.restaurant}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Items</p>
                      <p className="font-medium">{order.items} items</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Payment</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600 text-xs">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Completed' || order.status === 'DELIVERED' || order.status === 'delivered'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : order.status === 'Processing' || order.status === 'PENDING' || order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : order.status === 'Cancelled' || order.status === 'CANCELLED' || order.status === 'Rejected'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-xs text-gray-500 font-mono">
                      Order ID: {order.orderId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiShoppingBag className="text-4xl text-gray-300 mx-auto mb-3" />
              <p>No orders found</p>
              <p className="text-sm text-gray-400 mt-1">Orders from your referrals will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-xl border border-white/50 p-6 mb-8 relative z-10">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <FiTrendingUp className="mr-2 text-green-500" />
          Performance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <p className="text-sm text-gray-600">Commission Rate</p>
            <p className="text-2xl font-bold text-emerald-700">
              {dashboardData?.ambassadorInfo?.commissionPercentage || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Per successful order</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-600">Total Referrals</p>
            <p className="text-2xl font-bold text-blue-700">{statsData.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">Active users</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <p className="text-sm text-gray-600">Average Order Value</p>
            <p className="text-2xl font-bold text-purple-700">
              {statsData.totalOrders > 0 ? 
                `₹${Math.round(dashboardData?.ambassadorInfo?.wallet / statsData.totalOrders)}` : 
                '₹0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per order commission</p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-6 relative z-10">
        <button
          onClick={fetchDashboardData}
          className="bg-white/80 backdrop-blur-lg border border-white/50 text-purple-600 hover:bg-white hover:text-purple-700 px-6 py-2 rounded-xl transition duration-300 font-medium shadow-lg hover:shadow-xl"
        >
          Refresh Dashboard
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AmbassadorDashboard;