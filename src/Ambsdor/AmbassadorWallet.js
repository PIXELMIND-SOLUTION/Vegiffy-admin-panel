import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiDownload,
  FiCreditCard,
  FiCheck,
  FiX,
  FiBook,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUser,
  FiFileText,
  FiPercent,
  FiCalendar
} from 'react-icons/fi';
import axios from 'axios';

const AmbassadorWallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  
  // Calculate fee and net amount
  const calculateWithdrawAmount = (amount) => {
    if (!amount || isNaN(amount)) return { gross: 0, fee: 0, net: 0 };
    
    const grossAmount = parseFloat(amount);
    const fee = (grossAmount * 2) / 100; // 2% fee
    const netAmount = grossAmount - fee;
    
    return {
      gross: grossAmount.toFixed(2),
      fee: fee.toFixed(2),
      net: netAmount.toFixed(2)
    };
  };

  useEffect(() => {
    fetchWalletData();
    fetchWithdrawalHistory();
    fetchBankAccounts();
  }, []);

  const fetchWalletData = async () => {
    try {
      const ambassadorId = sessionStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffy.in/api/ambsdor/profile/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setWalletData(result.data);
      } else {
        console.error('Failed to fetch wallet data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const ambassadorId = sessionStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffy.in/api/ambsdor/allwithdrawal/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setWithdrawalHistory(result.data || []);
      } else {
        console.error('Failed to fetch withdrawal history:', result.message);
      }
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      setAccountLoading(true);
      const ambassadorId = sessionStorage.getItem("ambassadorId");
      
      if (!ambassadorId) {
        console.error("Ambassador ID not found");
        setAccountLoading(false);
        return;
      }

      const response = await axios.get(
        `https://api.vegiffy.in/api/ambsdor/allaccounts/${ambassadorId}`
      );
      
      if (response.data.success) {
        setAccounts(response.data.data || []);
        // Auto select primary account if exists
        const primaryAccount = response.data.data.find(acc => acc.isPrimary);
        if (primaryAccount) {
          setSelectedAccountId(primaryAccount._id);
        }
      } else {
        console.error("Failed to fetch accounts:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setAccountLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > walletData.wallet) {
      alert('Insufficient balance in wallet');
      return;
    }

    if (withdrawAmount < 100) {
      alert('Minimum withdrawal amount is ₹100');
      return;
    }

    // Check if account is selected
    if (!selectedAccountId) {
      alert('Please select a bank account for withdrawal');
      return;
    }

    const selectedAccount = accounts.find(acc => acc._id === selectedAccountId);
    if (!selectedAccount) {
      alert('Selected account not found');
      return;
    }

    const amountDetails = calculateWithdrawAmount(withdrawAmount);
    const netAmount = amountDetails.net;

    setWithdrawLoading(true);
    try {
      const ambassadorId = sessionStorage.getItem('ambassadorId');
      
      const withdrawalData = {
        amount: parseFloat(withdrawAmount),
        netAmount: parseFloat(netAmount),
        processingFee: parseFloat(amountDetails.fee),
        accountDetails: {
          accountNumber: selectedAccount.accountNumber,
          accountHolderName: selectedAccount.accountHolderName,
          ifscCode: selectedAccount.ifscCode,
          bankName: selectedAccount.bankName,
          branchName: selectedAccount.branchName,
          accountType: selectedAccount.accountType
        }
      };

      const response = await fetch(`https://api.vegiffy.in/api/ambsdor/withdrawal/${ambassadorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawalData)
      });

      const result = await response.json();

      if (result.success) {
        // Update wallet balance (deduct full amount)
        setWalletData(prev => ({
          ...prev,
          wallet: prev.wallet - parseFloat(withdrawAmount)
        }));
        
        // Refresh withdrawal history
        fetchWithdrawalHistory();
        
        alert(`Withdrawal request of ₹${withdrawAmount} submitted successfully!\nProcessing Fee (2%): ₹${amountDetails.fee}\nNet Amount: ₹${netAmount}`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
      } else {
        throw new Error(result.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert(error.message || 'Failed to process withdrawal request');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'accepted':
        return { icon: FiCheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'rejected':
        return { icon: FiXCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'pending':
        return { icon: FiClock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      default:
        return { icon: FiAlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
      case 'accepted':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  const amountDetails = calculateWithdrawAmount(withdrawAmount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg">
              <FiCreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ambassador Wallet</h1>
          <p className="text-lg text-gray-600">Manage your earnings and withdrawals</p>
        </div>

        {/* Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Wallet Balance */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Wallet Balance</h3>
              <FiCreditCard className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(walletData?.wallet)}
            </p>
            <p className="text-sm text-gray-500">Available for withdrawal</p>
          </div>

          {/* Total Commission */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Commission</h3>
              <FiTrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(walletData?.totalCommission)}
            </p>
            <p className="text-sm text-gray-500">Lifetime earnings</p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Withdraw Your Earnings</h2>
            <p className="text-gray-600 mb-6">
              Transfer your earnings to your bank account
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={!walletData?.wallet || walletData.wallet <= 0}
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 text-lg font-semibold"
              >
                <FiDownload className="w-6 h-6" />
                <span>Withdraw Funds</span>
              </button>
              
              <a
                href="/ambassador/accounts"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 text-lg font-semibold"
              >
                <span>Manage Accounts</span>
              </a>
            </div>
            
            {(!walletData?.wallet || walletData.wallet <= 0) && (
              <p className="text-sm text-red-500 mt-3">
                No funds available for withdrawal
              </p>
            )}
            
            {accounts.length === 0 && (
              <p className="text-sm text-yellow-600 mt-3">
                Please add a bank account first to withdraw funds
              </p>
            )}
          </div>
        </div>

        {/* Withdrawal History Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FiBook className="w-6 h-6 mr-2 text-gray-600" />
                Withdrawal History
              </h2>
              <span className="text-sm text-gray-500">
                {withdrawalHistory.length} requests
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {historyLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading withdrawal history...</p>
              </div>
            ) : withdrawalHistory.length === 0 ? (
              <div className="text-center py-12">
                <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests</h3>
                <p className="text-gray-500">Your withdrawal history will appear here</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalHistory.map((withdrawal) => {
                    const statusConfig = getStatusIcon(withdrawal.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(withdrawal.amount)}
                            </div>
                            {withdrawal.processingFee > 0 && (
                              <div className="text-sm text-gray-600">
                                Fee: {formatCurrency(withdrawal.processingFee)}
                              </div>
                            )}
                            {withdrawal.netAmount > 0 && (
                              <div className="text-sm text-gray-500">
                                Net: {formatCurrency(withdrawal.netAmount)}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {withdrawal._id.substring(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {withdrawal.accountDetails?.bankName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ****{withdrawal.accountDetails?.accountNumber?.slice(-4)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {withdrawal.accountDetails?.accountHolderName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {getStatusText(withdrawal.status)}
                            </span>
                            {withdrawal.rejectionReason && (
                              <div className="ml-2 text-xs text-red-600" title={withdrawal.rejectionReason}>
                                <FiAlertCircle className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          {withdrawal.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1 truncate max-w-xs">
                              {withdrawal.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(withdrawal.requestedAt)}
                          </div>
                          {withdrawal.approvedAt && (
                            <div className="text-xs text-green-600">
                              Approved: {formatDate(withdrawal.approvedAt)}
                            </div>
                          )}
                          {withdrawal.rejectedAt && (
                            <div className="text-xs text-red-600">
                              Rejected: {formatDate(withdrawal.rejectedAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 🔥 FIX: Info Section with "Every Month 10th" - NO DATE */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <FiCalendar className="mr-2" />
            Withdrawal Processing Schedule
          </h3>
          <div className="space-y-3 text-yellow-700">
            <div className="flex items-start">
              <FiCheck className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Earn commission</span> when your referred users place orders
              </div>
            </div>
            <div className="flex items-start">
              <FiCheck className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Commission automatically added</span> to your wallet
              </div>
            </div>

            <div className="flex items-start">
              <FiCheck className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">2% processing fee</span> applied on all withdrawals
              </div>
            </div>
            <div className="flex items-start">
              <FiCheck className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Withdrawal requests are processed on the 10th of every month</span>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheck className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Manage bank accounts</span> in the "Manage Accounts" section
              </div>
            </div>
          </div>
          
       
        </div>

        {/* Withdraw Modal with Account Selection */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawAmount('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Available Balance */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">Available Balance</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(walletData?.wallet)}
                    </p>
                  </div>

                  {/* Processing Date Info - WITHOUT ACTUAL DATE */}
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <FiCalendar className="text-yellow-600 mr-2 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Withdrawal Processing</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Your withdrawal request will be processed on the next 10th of the month.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Amount to Withdraw *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        max={walletData?.wallet}
                        min="100"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum withdrawal: ₹100 | Maximum: {formatCurrency(walletData?.wallet)}
                    </p>
                  </div>

                  {/* Amount Breakdown */}
                  {withdrawAmount && !isNaN(withdrawAmount) && parseFloat(withdrawAmount) >= 100 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                        <FiPercent className="mr-2" />
                        Amount Breakdown
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Withdrawal Amount:</span>
                          <span className="font-medium">₹{amountDetails.gross}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Processing Fee (2%):</span>
                          <span className="font-medium">- ₹{amountDetails.fee}</span>
                        </div>
                        <div className="flex justify-between text-green-700 border-t border-blue-200 pt-2 mt-2">
                          <span className="font-bold">You will receive:</span>
                          <span className="font-bold text-lg">₹{amountDetails.net}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Account Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Bank Account *
                    </label>
                    
                    {accountLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading accounts...</p>
                      </div>
                    ) : accounts.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800">
                          No bank accounts found. Please add a bank account first.
                        </p>
                        <a 
                          href="/ambassador/accounts" 
                          className="text-green-600 hover:text-green-800 text-sm font-medium inline-flex items-center mt-2"
                        >
                          <FiUser className="mr-1" />
                          Add Bank Account
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {accounts.map((account) => (
                          <div
                            key={account._id}
                            className={`p-3 border rounded cursor-pointer transition-all ${selectedAccountId === account._id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            onClick={() => setSelectedAccountId(account._id)}
                          >
                            <div className="flex items-start">
                              <div className={`w-4 h-4 border rounded-full flex items-center justify-center mr-3 mt-1 ${selectedAccountId === account._id
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-400'
                                }`}>
                                {selectedAccountId === account._id && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {account.accountHolderName}
                                      {account.isPrimary && (
                                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                          Primary
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {account.bankName} • {account.accountType}
                                    </p>
                                  </div>
                                  {selectedAccountId === account._id && (
                                    <FiCheckCircle className="text-green-500 ml-2" />
                                  )}
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                  <div>
                                    <span className="font-medium">A/C:</span> ****{account.accountNumber?.slice(-4)}
                                  </div>
                                  <div>
                                    <span className="font-medium">IFSC:</span> {account.ifscCode}
                                  </div>
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  <FiFileText className="inline mr-1" />
                                  {account.branchName}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info Note */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="flex items-start">
                      <FiAlertCircle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-yellow-800 font-medium">Important Notes:</p>
                        <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                          <li>• 2% processing fee will be deducted from withdrawal amount</li>
                          <li>• Minimum withdrawal amount is ₹100</li>
                          <li>• Requests submitted before 10th are processed on that month's 10th</li>
                          <li>• Requests after 10th are processed on next month's 10th</li>
                          <li>• Funds will be transferred to selected bank account</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawAmount('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={
                      withdrawLoading || 
                      !withdrawAmount || 
                      withdrawAmount < 100 || 
                      withdrawAmount > walletData?.wallet || 
                      !selectedAccountId
                    }
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {withdrawLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Confirm Withdrawal'
                    )}
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

export default AmbassadorWallet;