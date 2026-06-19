import React, { useState, useEffect } from 'react';
import { 
  FiShoppingBag, 
  FiSearch, 
  FiEye, 
  FiCalendar,
  FiUser,
  FiMapPin,
  FiPackage,
  FiX,
  FiCreditCard,
  FiShoppingCart
} from 'react-icons/fi';

const AmbassadorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ambassadorId = sessionStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffy.in/api/ambsdor/allorders/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data || []);
      } else {
        console.error('Failed to fetch orders:', result.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatOrderData = (order) => {
    return {
      _id: order._id,
      orderId: order._id?.substring(0, 8).toUpperCase() || 'N/A',
      customerName: `${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.trim() || 'N/A',
      // 🔥 FIX: Phone number removed from display
      restaurantName: order.restaurantId?.restaurantName || 'N/A',
      // 🔥 FIX: Using subTotal instead of totalPayable
      subTotal: order.subTotal || 0,
      totalPayable: order.totalPayable || 0,
      commission: order.commission || 0,
      orderStatus: order.orderStatus || 'Pending',
      paymentStatus: order.paymentStatus || 'Pending',
      deliveryStatus: order.deliveryStatus || 'Pending',
      orderDate: order.createdAt,
      totalItems: order.totalItems || 0,
      products: order.products || [],
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      deliveryBoy: order.deliveryBoyId,
      // Additional fields for details
      deliveryCharge: order.deliveryCharge || 0,
      gstCharges: order.gstCharges || 0,
      gstOnDelivery: order.gstOnDelivery || 0,
      couponDiscount: order.couponDiscount || 0,
      totalDiscount: order.totalDiscount || 0,
      appliedCoupon: order.appliedCoupon
    };
  };

  const filteredOrders = orders
    .map(formatOrderData)
    .filter(order =>
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Calculate total commission and total sales (subtotal)
  const totalCommission = filteredOrders.reduce((sum, order) => sum + (order.commission || 0), 0);
  const totalSales = filteredOrders.reduce((sum, order) => sum + (order.subTotal || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Referred Users Orders</h1>
                <p className="text-gray-600">Orders placed by your referred users</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{filteredOrders.length}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalSales)}</p>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalCommission)}</p>
                <p className="text-sm text-gray-600">Total Commission</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by customer name, restaurant or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No orders match your search' : 'No orders found from your referred users'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiPackage className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.totalItems} item{order.totalItems !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </div>
                        {/* 🔥 FIX: Phone number removed from display */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.restaurantName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(order.subTotal)}
                        </div>
                       
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          {formatCurrency(order.commission)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-900 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Order Details - {selectedOrder.orderId}</h3>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedOrder.customerName}</span>
                        </div>
                        {/* 🔥 FIX: Phone number removed from modal */}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Restaurant Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FiShoppingBag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedOrder.restaurantName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commission Card */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                      <FiCreditCard className="w-4 h-4 mr-2" />
                      Commission Earned
                    </h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedOrder.commission)}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          {selectedOrder.subTotal > 0 ? 
                            `${((selectedOrder.commission / selectedOrder.subTotal) * 100).toFixed(2)}% of subtotal` : 
                            'Commission calculated'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-700">Order Subtotal</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {formatCurrency(selectedOrder.subTotal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {selectedOrder.deliveryAddress && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                        <FiMapPin className="w-4 h-4 mr-2" />
                        Delivery Address
                      </h4>
                      <p className="text-sm text-blue-900">
                        {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}, 
                        {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.postalCode}
                      </p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="border rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 p-4 border-b flex items-center">
                      <FiShoppingCart className="mr-2" />
                      Order Items
                    </h4>
                    <div className="p-4 space-y-3">
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={product.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                              }}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                              {product.addOn && (
                                <p className="text-xs text-gray-500">
                                  {product.addOn.variation} • {product.addOn.plateitems} plates
                                </p>
                              )}
                              {product.discountAmount > 0 && (
                                <p className="text-xs text-green-600">Discount: ₹{product.discountAmount}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(product.price * product.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Price Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(selectedOrder.subTotal)}</span>
                      </div>
                      
                      {selectedOrder.totalDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Total Discount:</span>
                          <span>-{formatCurrency(selectedOrder.totalDiscount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Charge:</span>
                        <span className="font-medium">{formatCurrency(selectedOrder.deliveryCharge)}</span>
                      </div>
                      
                      {selectedOrder.gstCharges > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">GST on Food:</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.gstCharges)}</span>
                        </div>
                      )}
                      
                      {selectedOrder.gstOnDelivery > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">GST on Delivery:</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.gstOnDelivery)}</span>
                        </div>
                      )}
                      
                      {selectedOrder.couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Coupon Discount:</span>
                          <span>-{formatCurrency(selectedOrder.couponDiscount)}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-gray-900">Total Payable:</span>
                          <span className="text-base font-bold text-green-600">
                            {formatCurrency(selectedOrder.totalPayable)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-medium text-green-700 mb-2">Payment Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-green-800">Method:</span>
                          <span className="text-sm font-medium text-green-900">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-green-800">Status:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-medium text-purple-700 mb-2">Delivery Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-purple-800">Status:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.deliveryStatus)}`}>
                            {selectedOrder.deliveryStatus}
                          </span>
                        </div>
                        {selectedOrder.deliveryBoy && (
                          <div className="flex justify-between">
                            <span className="text-sm text-purple-800">Delivery Boy:</span>
                            <span className="text-sm font-medium text-purple-900">
                              {selectedOrder.deliveryBoy.fullName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Coupon Details (if any) */}
                  {selectedOrder.appliedCoupon && selectedOrder.appliedCoupon.amount > 0 && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-medium text-purple-700 mb-2">Coupon Applied</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-purple-900">Code: {selectedOrder.appliedCoupon.couponCode}</p>
                        <p className="text-sm text-purple-900">
                          Discount: {selectedOrder.appliedCoupon.discountType === 'percentage' 
                            ? `${selectedOrder.appliedCoupon.discountValue}%` 
                            : formatCurrency(selectedOrder.appliedCoupon.discountValue)}
                        </p>
                        <p className="text-sm font-medium text-green-600">Saved: {formatCurrency(selectedOrder.appliedCoupon.amount)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeOrderDetails}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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

export default AmbassadorOrders;