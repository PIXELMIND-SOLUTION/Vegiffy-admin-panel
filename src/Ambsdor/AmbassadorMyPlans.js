import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiDollarSign, 
  FiCheck, 
  FiClock,
  FiAward,
  FiUser,
  FiX,
  FiAlertCircle,
  FiFileText,
  FiPercent,
  FiCreditCard,
  FiTag,
  FiDownload,
  FiInfo,
  FiImage,
  FiEye,
  FiCopy,
  FiExternalLink,
  FiShield,
  FiCheckCircle
} from 'react-icons/fi';
import { FaCloudDownloadAlt } from 'react-icons/fa';

const AmbassadorMyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    fetchMyPlans();
  }, []);

  const fetchMyPlans = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffy.in/api/ambsdor/myplan/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setPlans(result.data || []);
      } else {
        console.error('Failed to fetch plans:', result.message);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 🔥 FIXED: Sahi expiry date calculation
  // ========================
  const formatPlanData = (plan) => {
    const purchaseDate = new Date(plan.planPurchaseDate);
    const validityDays = plan.planId?.validity || 730; // Default 730 days (2 years)
    
    // 🔥 FIX 1: Expiry date calculate kar sahi se
    let expiryDate;
    
    if (plan.expiryDate) {
      // API se expiry date aa rahi hai
      expiryDate = new Date(plan.expiryDate);
      
      // 🔥 FIX 2: Check for wrong expiry date (like 2755)
      const currentYear = new Date().getFullYear();
      const expiryYear = expiryDate.getFullYear();
      
      // Agar expiry date current year se 10+ saal aage hai toh wrong hai
      if (expiryYear > currentYear + 10) {
        console.warn('⚠️ Wrong expiry date detected, recalculating...');
        // Sahi expiry date calculate kar
        expiryDate = new Date(purchaseDate);
        expiryDate.setDate(expiryDate.getDate() + validityDays);
      }
    } else {
      // Agar expiry date nahi hai toh validity se calculate kar
      expiryDate = new Date(purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + validityDays);
    }
    
    const now = new Date();
    
    // 🔥 FIX 3: Active status check
    const isActive = now < expiryDate && plan.isActive === true && plan.paymentStatus === 'completed';
    
    // 🔥 FIX 4: Days remaining ka sahi calculation
    const timeDiff = expiryDate - now;
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    // 🔥 FIX 5: Plan status based on actual days
    let planStatus = 'expired';
    if (isActive) {
      if (daysRemaining <= 0) planStatus = 'expired';
      else if (daysRemaining <= 30) planStatus = 'expiring-soon';
      else planStatus = 'active';
    }
    
    // 🔥 FIX 6: Validity in human readable format
    const years = Math.floor(validityDays / 365);
    const months = Math.floor((validityDays % 365) / 30);
    const days = validityDays % 30;
    
    let validityText = '';
    if (years > 0) validityText += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) validityText += `${months} month${months > 1 ? 's' : ''} `;
    if (days > 0 && years === 0) validityText += `${days} day${days > 1 ? 's' : ''}`;
    
    // Calculate GST percentage
    const gstPercentage = plan.baseAmount > 0 
      ? Math.round((plan.gstAmount / plan.baseAmount) * 100) 
      : 18;

    // Calculate actual discount percentage
    const originalPrice = plan.planId?.price || 0;
    const discountPercentage = originalPrice > 0 
      ? Math.round(((originalPrice - plan.baseAmount) / originalPrice) * 100)
      : plan.discount || 0;

    // 🔥 FIX 7: Purchase and expiry formatted dates
    const purchaseFormatted = purchaseDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    const expiryFormatted = expiryDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return {
      _id: plan._id,
      planId: plan.planId?._id,
      planName: plan.planId?.name || 'N/A',
      price: plan.planId?.price || 0,
      validity: validityDays,
      validityText: validityText.trim() || `${validityDays} days`,
      benefits: plan.planId?.benefits || [],
      transactionId: plan.transactionId || 'N/A',
      purchaseDate: plan.planPurchaseDate,
      purchaseDateFormatted: purchaseFormatted,
      expiryDate: expiryDate.toISOString(),
      expiryDateFormatted: expiryFormatted,
      isPurchased: plan.isPurchased,
      baseAmount: plan.baseAmount || 0,
      gstAmount: plan.gstAmount || 0,
      totalAmount: plan.totalAmount || 0,
      gstPercentage: gstPercentage,
      discount: plan.discount || 0,
      discountAmount: plan.discountAmount || 0,
      discountedPrice: plan.discountedPrice || plan.baseAmount,
      originalPrice: originalPrice,
      discountPercentage: discountPercentage,
      paymentStatus: plan.paymentStatus || 'pending',
      paymentMethod: plan.paymentMethod || 'N/A',
      bankDetails: plan.bankDetails || null,
      status: plan.status || 'pending',
      planStatus: planStatus,
      daysRemaining: daysRemaining,
      isActive: isActive,
      createdAt: plan.createdAt,
      note: plan.note || '',
      paymentScreenshot: plan.paymentScreenshot || null,
      screenshotUploadedAt: plan.screenshotUploadedAt || null,
      submittedAt: plan.submittedAt || null,
      verifiedAt: plan.verifiedAt || null,
      verifiedBy: plan.verifiedBy || null
    };
  };

  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const closePlanDetails = () => {
    setSelectedPlan(null);
    setShowPlanModal(false);
  };

  const openScreenshotModal = (screenshotUrl) => {
    setSelectedScreenshot(screenshotUrl);
    setShowScreenshotModal(true);
  };

  const closeScreenshotModal = () => {
    setSelectedScreenshot(null);
    setShowScreenshotModal(false);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case 'expiring-soon':
        return <FiAlertCircle className="w-4 h-4 text-orange-600" />;
      case 'expired':
      case 'failed':
      case 'cancelled':
        return <FiX className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <FiClock className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <FiCheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (plan) => {
    if (plan.paymentStatus === 'pending') {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Payment Pending'
      };
    }
    
    if (!plan.isActive) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Expired'
      };
    }
    
    if (plan.daysRemaining <= 7) {
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: `Expires in ${plan.daysRemaining} days`
      };
    }
    
    if (plan.daysRemaining <= 30) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: `Expiring soon (${plan.daysRemaining} days)`
      };
    }
    
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: `Active (${plan.daysRemaining} days left)`
    };
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'upi':
        return 'UPI Payment';
      case 'card':
        return 'Credit/Debit Card';
      case 'cash':
        return 'Cash Payment';
      default:
        return method || 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadScreenshot = (url, fileName = 'payment-receipt') => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error('Error downloading screenshot:', error);
        window.open(url, '_blank');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your plans...</p>
        </div>
      </div>
    );
  }

  const formattedPlans = plans.map(formatPlanData);

  // Calculate statistics
  const activePlans = formattedPlans.filter(p => p.isActive && p.paymentStatus === 'completed').length;
  const expiringSoonPlans = formattedPlans.filter(p => p.isActive && p.daysRemaining <= 30 && p.daysRemaining > 0).length;
  const pendingPlans = formattedPlans.filter(p => p.paymentStatus === 'pending').length;
  const expiredPlans = formattedPlans.filter(p => !p.isActive && p.paymentStatus === 'completed').length;
  const totalInvestment = formattedPlans.reduce((sum, plan) => sum + (plan.totalAmount || 0), 0);
  const plansWithScreenshot = formattedPlans.filter(p => p.paymentScreenshot).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <FiAward className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Ambassador Plans</h1>
                <p className="text-gray-600">Your purchased plans with payment receipts</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="text-center px-3">
                <p className="text-2xl font-bold text-purple-600">{formattedPlans.length}</p>
                <p className="text-xs text-gray-600">Total Plans</p>
              </div>
              <div className="text-center px-3 border-l">
                <p className="text-2xl font-bold text-green-600">{activePlans}</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
              <div className="text-center px-3 border-l">
                <p className="text-2xl font-bold text-orange-600">{expiringSoonPlans}</p>
                <p className="text-xs text-gray-600">Expiring Soon</p>
              </div>
              <div className="text-center px-3 border-l">
                <p className="text-2xl font-bold text-red-600">{expiredPlans}</p>
                <p className="text-xs text-gray-600">Expired</p>
              </div>
              <div className="text-center px-3 border-l">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalInvestment)}</p>
                <p className="text-xs text-gray-600">Total Investment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedPlans.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FiAward className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Found</h3>
                <p className="text-gray-500 mb-6">
                  You haven't purchased any ambassador plans yet.
                </p>
                <button
                  onClick={() => window.location.href = '/ambassador/payments'}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  Purchase a Plan
                </button>
              </div>
            </div>
          ) : (
            formattedPlans.map((plan) => {
              const statusBadge = getStatusBadge(plan);
              
              return (
                <div
                  key={plan._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Plan Header */}
                  <div className={`p-6 text-white relative ${
                    plan.paymentStatus === 'completed' 
                      ? plan.isActive 
                        ? plan.daysRemaining <= 30 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                      : plan.paymentStatus === 'pending'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}>
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text} font-medium`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{plan.planName}</h3>
                      <p className="opacity-90 text-sm mt-1">Validity: {plan.validityText}</p>
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">{formatCurrency(plan.totalAmount)}</div>
                      <div className="opacity-90 text-sm">Total Paid (incl. GST)</div>
                    </div>
                  </div>

                  {/* Plan Content */}
                  <div className="p-6">
                    {/* Discount Display */}
                    {plan.discountAmount > 0 && (
                      <div className="mb-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-yellow-800">
                            <FiTag className="inline mr-1" /> 
                            {plan.discountPercentage}% OFF Applied
                          </span>
                          <span className="font-bold text-green-600">
                            -{formatCurrency(plan.discountAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment Screenshot Preview */}
                    {plan.paymentScreenshot && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <FiImage className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm font-semibold text-blue-800">Payment Receipt</span>
                          </div>
                          <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            ✓ Uploaded
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => openScreenshotModal(plan.paymentScreenshot)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          >
                            <FiEye className="w-3 h-3 mr-1" /> View Receipt
                          </button>
                          <button
                            onClick={() => downloadScreenshot(plan.paymentScreenshot, `${plan.planName}-receipt`)}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                          >
                            <FiDownload className="w-3 h-3 mr-1" /> Download
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center">
                        <FiFileText className="mr-2" /> Price Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        {plan.discountAmount > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Original Price:</span>
                              <span className="font-medium line-through text-gray-400">{formatCurrency(plan.originalPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Discount:</span>
                              <span className="font-medium text-green-600">-{formatCurrency(plan.discountAmount)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Amount:</span>
                          <span className="font-medium">{formatCurrency(plan.baseAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST ({plan.gstPercentage}%):</span>
                          <span className="text-red-600">+{formatCurrency(plan.gstAmount)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300">
                          <span className="font-bold text-gray-900">Total Paid:</span>
                          <span className="font-bold text-purple-700">{formatCurrency(plan.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Validity Progress */}
                    {plan.isActive && plan.validity > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Validity Progress</span>
                          <span className="font-medium text-gray-900">
                            {plan.daysRemaining} / {plan.validity} days left
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              plan.daysRemaining <= 7 
                                ? 'bg-red-500' 
                                : plan.daysRemaining <= 30 
                                ? 'bg-orange-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${(plan.daysRemaining / plan.validity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Payment Method */}
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <FiCreditCard className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">
                          Paid via {getPaymentMethodText(plan.paymentMethod)}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500 flex items-center">
                          <FiCalendar className="mr-1 w-3 h-3" /> Purchased:
                        </span>
                        <span className="font-medium">{plan.purchaseDateFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 flex items-center">
                          <FiClock className="mr-1 w-3 h-3" /> Expires:
                        </span>
                        <span className={`font-medium ${!plan.isActive ? 'text-red-600' : ''}`}>
                          {plan.expiryDateFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openPlanDetails(plan)}
                      className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <FiFileText className="mr-2" /> View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Plan Details Modal */}
        {showPlanModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Plan Details</h3>
                    <p className="text-gray-500 text-sm">Complete plan information</p>
                  </div>
                  <button
                    onClick={closePlanDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Plan Header */}
                  <div className={`rounded-lg p-5 text-white ${
                    selectedPlan.paymentStatus === 'completed'
                      ? selectedPlan.isActive
                        ? selectedPlan.daysRemaining <= 30
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                      : selectedPlan.paymentStatus === 'pending'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-bold">{selectedPlan.planName}</h4>
                        <p className="opacity-90 text-sm">Validity: {selectedPlan.validityText}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(selectedPlan.totalAmount)}</div>
                        <div className="opacity-90 text-sm">Total Paid</div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FiCreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Transaction ID</p>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900 font-mono text-sm mr-2">
                              {selectedPlan.transactionId}
                            </p>
                            <button
                              onClick={() => copyToClipboard(selectedPlan.transactionId, 'Transaction ID')}
                              className="text-gray-400 hover:text-purple-600 transition-colors"
                              title="Copy to clipboard"
                            >
                              <FiCopy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FiCreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Method</p>
                          <p className="font-medium text-gray-900 text-sm">
                            {getPaymentMethodText(selectedPlan.paymentMethod)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT SCREENSHOT SECTION */}
                  {selectedPlan.paymentScreenshot && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-green-900 flex items-center">
                          <FiImage className="mr-2" /> Payment Receipt
                        </h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          ✓ Uploaded on {formatDate(selectedPlan.screenshotUploadedAt)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Screenshot Preview */}
                        <div className="relative group">
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <div className="aspect-video rounded-lg overflow-hidden border border-gray-300">
                              <img 
                                src={selectedPlan.paymentScreenshot} 
                                alt="Payment Receipt" 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onClick={() => openScreenshotModal(selectedPlan.paymentScreenshot)}
                              />
                            </div>
                            <div className="mt-2 text-xs text-gray-600 text-center">
                              Click to view full image
                            </div>
                          </div>
                        </div>

                        {/* Screenshot Details */}
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Screenshot URL:</span>
                              <button
                                onClick={() => copyToClipboard(selectedPlan.paymentScreenshot, 'Screenshot URL')}
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                              >
                                <FiCopy className="w-3 h-3 mr-1" /> Copy
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {selectedPlan.paymentScreenshot}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500">Upload Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedPlan.screenshotUploadedAt ? formatDate(selectedPlan.screenshotUploadedAt) : 'N/A'}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500">Verification Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {selectedPlan.verifiedAt ? formatDate(selectedPlan.verifiedAt) : 'Pending'}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => openScreenshotModal(selectedPlan.paymentScreenshot)}
                              className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                            >
                              <FiEye className="mr-2" /> View Full
                            </button>
                            <button
                              onClick={() => downloadScreenshot(selectedPlan.paymentScreenshot, `${selectedPlan.planName}-receipt`)}
                              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                            >
                              <FiDownload className="mr-2" /> Download
                            </button>
                            <button
                              onClick={() => window.open(selectedPlan.paymentScreenshot, '_blank')}
                              className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                              title="Open in new tab"
                            >
                              <FiExternalLink className="mr-2" /> Open
                            </button>
                          </div>
                        </div>
                      </div>

                      {copiedText === 'Screenshot URL' && (
                        <div className="mt-2 text-center">
                          <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-flex items-center">
                            <FiCheckCircle className="w-3 h-3 mr-1" /> URL copied to clipboard
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Details */}
                  {selectedPlan.bankDetails && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FiUser className="mr-2" /> Bank Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Bank Name</p>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900">{selectedPlan.bankDetails.bankName}</p>
                            <button
                              onClick={() => copyToClipboard(selectedPlan.bankDetails.bankName, 'Bank Name')}
                              className="ml-2 text-gray-400 hover:text-blue-600"
                              title="Copy"
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Account Name</p>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900">{selectedPlan.bankDetails.accountName}</p>
                            <button
                              onClick={() => copyToClipboard(selectedPlan.bankDetails.accountName, 'Account Name')}
                              className="ml-2 text-gray-400 hover:text-blue-600"
                              title="Copy"
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Account Number</p>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900 font-mono">{selectedPlan.bankDetails.accountNumber}</p>
                            <button
                              onClick={() => copyToClipboard(selectedPlan.bankDetails.accountNumber, 'Account Number')}
                              className="ml-2 text-gray-400 hover:text-blue-600"
                              title="Copy"
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">IFSC Code</p>
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900 font-mono">{selectedPlan.bankDetails.ifscCode}</p>
                            <button
                              onClick={() => copyToClipboard(selectedPlan.bankDetails.ifscCode, 'IFSC Code')}
                              className="ml-2 text-gray-400 hover:text-blue-600"
                              title="Copy"
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {copiedText && copiedText.includes('Bank') && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-flex items-center">
                            <FiCheckCircle className="w-3 h-3 mr-1" /> {copiedText} copied
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price Details */}
                  <div className="p-4 bg-white border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FiDollarSign className="mr-2" /> Payment Details
                    </h4>
                    
                    <div className="space-y-3">
                      {selectedPlan.discountAmount > 0 && (
                        <>
                          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                            <div>
                              <p className="text-sm text-gray-600">Original Plan Price</p>
                              <p className="text-xs text-gray-500">MRP</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 line-through">{formatCurrency(selectedPlan.originalPrice)}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                            <div className="flex items-center">
                              <div className="p-1 bg-green-100 rounded mr-2">
                                <FiTag className="w-3 h-3 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Discount Applied</p>
                                <p className="text-xs text-gray-500">{selectedPlan.discountPercentage}% OFF</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">-{formatCurrency(selectedPlan.discountAmount)}</p>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Base Plan Amount</p>
                          <p className="text-xs text-gray-500">Plan: {selectedPlan.planName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(selectedPlan.baseAmount)}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <div className="flex items-center">
                          <div className="p-1 bg-red-100 rounded mr-2">
                            <FiPercent className="w-3 h-3 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Goods & Services Tax</p>
                            <p className="text-xs text-gray-500">GST @ {selectedPlan.gstPercentage}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">+{formatCurrency(selectedPlan.gstAmount)}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Total Amount Paid</p>
                          <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-purple-700">{formatCurrency(selectedPlan.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FiCalendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Purchase Date</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(selectedPlan.purchaseDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <FiClock className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Expiry Date</p>
                          <p className="font-medium text-gray-900">
                            {selectedPlan.expiryDateFormatted}
                          </p>
                          {selectedPlan.isActive && (
                            <p className={`text-xs font-medium ${
                              selectedPlan.daysRemaining <= 7 
                                ? 'text-red-600' 
                                : selectedPlan.daysRemaining <= 30 
                                ? 'text-orange-600' 
                                : 'text-green-600'
                            }`}>
                              {selectedPlan.daysRemaining} days remaining
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Details */}
                  {(selectedPlan.verifiedAt || selectedPlan.verifiedBy) && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                        <FiShield className="mr-2" /> Verification Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedPlan.verifiedAt && (
                          <div>
                            <p className="text-xs text-gray-500">Verified At</p>
                            <p className="text-sm font-medium text-green-900">
                              {formatDate(selectedPlan.verifiedAt)}
                            </p>
                          </div>
                        )}
                        {selectedPlan.verifiedBy && (
                          <div>
                            <p className="text-xs text-gray-500">Verified By</p>
                            <p className="text-sm font-medium text-green-900">
                              {selectedPlan.verifiedBy}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedPlan.note && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <FiInfo className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 mb-1">Admin Note:</p>
                          <p className="text-xs text-yellow-700">{selectedPlan.note}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {selectedPlan.benefits && selectedPlan.benefits.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Plan Benefits</h4>
                      <ul className="space-y-2">
                        {selectedPlan.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <FiCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expiry Alert */}
                  {!selectedPlan.isActive && selectedPlan.paymentStatus === 'completed' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <FiAlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <p className="text-sm text-red-800">
                          This plan expired on {selectedPlan.expiryDateFormatted}. Purchase a new plan to continue enjoying benefits.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {selectedPlan.paymentScreenshot && (
                    <button
                      onClick={() => downloadScreenshot(selectedPlan.paymentScreenshot, `${selectedPlan.planName}-receipt`)}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors flex items-center shadow-md"
                    >
                      <FaCloudDownloadAlt className="mr-2" /> Download Receipt
                    </button>
                  )}
                  <button
                    onClick={closePlanDetails}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screenshot Full View Modal */}
        {showScreenshotModal && selectedScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-5xl max-h-[90vh]">
              <button
                onClick={closeScreenshotModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
              >
                <FiX className="w-6 h-6" />
              </button>
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => downloadScreenshot(selectedScreenshot, 'payment-receipt')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg"
                >
                  <FiDownload className="mr-2" /> Download
                </button>
              </div>
              <img 
                src={selectedScreenshot} 
                alt="Payment Receipt Full View" 
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              />
              <div className="text-center mt-4">
                <p className="text-white text-sm">Payment Receipt Screenshot</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        {formattedPlans.length > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <FiInfo className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-800">
                  All prices include GST as per Indian tax regulations. {plansWithScreenshot > 0 && 
                    <span className="font-medium">{plansWithScreenshot} out of {formattedPlans.length} plans have payment receipts uploaded.</span>
                  }
                </p>
                {plansWithScreenshot > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    You can view and download payment receipts for each plan in the details modal.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbassadorMyPlans;