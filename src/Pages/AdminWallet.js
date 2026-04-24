import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FiDollarSign, 
  FiDownload, 
  FiRefreshCw,
  FiCalendar,
  FiFilter
} from "react-icons/fi";
import { FaRupeeSign, FaWallet } from "react-icons/fa";

const AdminWallet = () => {
  const adminId = localStorage.getItem('adminId');
  
  const [walletData, setWalletData] = useState({
    walletBalance: 0,
    name: "",
    adminId: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch wallet data
  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.vegiffy.in/api/admin/getwallet/${adminId}`
      );
      
      if (response.data.success) {
        const data = response.data.data;
        setWalletData({
          walletBalance: data.walletBalance || 0,
          name: data.name || "",
          adminId: data.adminId || ""
        });
      } else {
        console.error("Failed to fetch wallet data:", response.data.message);
      }

    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWalletData();
  };

  const handleExport = () => {
    // Simple export functionality
    const dataStr = JSON.stringify(walletData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `admin_wallet_${adminId}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wallet Dashboard</h1>
          <p className="text-gray-600">{formatDate()}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            <FiDownload size={18} />
            Export Data
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            <FiRefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <FaWallet size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium">Wallet Balance</h3>
              <p className="text-sm opacity-90">Current available balance</p>
            </div>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-full">
            <span className="text-sm font-medium">Admin ID: {walletData.adminId.substring(0, 8)}...</span>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <FaRupeeSign size={32} className="opacity-80" />
            <span className="text-5xl font-bold">
              {walletData.walletBalance.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-sm opacity-90">Hello, {walletData.name}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Info */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiDollarSign className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Wallet Status</h4>
              <p className="text-sm text-gray-500">Account Information</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account ID</span>
              <span className="font-medium">{walletData.adminId.substring(0, 12)}...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account Name</span>
              <span className="font-medium">{walletData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Balance Details */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaRupeeSign className="text-green-600" size={20} />
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Balance Details</h4>
              <p className="text-sm text-gray-500">Financial Overview</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Current Balance</span>
                <span className="text-lg font-bold text-green-600">₹{walletData.walletBalance.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(walletData.walletBalance / 1000 * 100, 100)}` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <p className="text-gray-600">Your wallet transactions will appear here</p>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <FiFilter size={18} />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <FaWallet className="text-gray-400" size={24} />
          </div>
          <h4 className="text-gray-700 font-medium mb-2">Transaction History</h4>
          <p className="text-gray-500 max-w-md mx-auto">
            Transaction history feature will be available soon. You'll be able to view all your earnings, commissions, and withdrawals here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminWallet;