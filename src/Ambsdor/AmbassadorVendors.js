import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiSearch, 
  FiEye, 
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiX,
  FiStar,
  FiDollarSign
} from 'react-icons/fi';

const AmbassadorVendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/ambsdor/allvendors/${ambassadorId}`);
      const result = await response.json();

      if (result.success && result.message === "Vendors fetched successfully") {
        setVendors(result.data || []);
      } else {
        console.error('Failed to fetch vendors:', result.message);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format vendor data based on API response structure
  const formatVendorData = (vendor) => {
    return {
      _id: vendor._id,
      restaurantName: vendor.restaurantName || 'N/A',
      description: vendor.description || 'No description',
      email: vendor.email || 'No email',
      mobile: vendor.mobile || 'N/A',
      locationName: vendor.locationName || 'N/A',
      rating: vendor.rating || 0,
      startingPrice: vendor.startingPrice || 0,
      status: vendor.status || 'pending',
      referralCode: vendor.referralCode || 'N/A',
      walletBalance: vendor.walletBalance || 0,
      image: vendor.image?.url || null,
      createdAt: vendor.createdAt,
      categories: vendor.categories || []
    };
  };

  const filteredVendors = vendors
    .map(formatVendorData)
    .filter(vendor =>
      vendor.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.mobile?.includes(searchTerm) ||
      vendor.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const closeVendorDetails = () => {
    setSelectedVendor(null);
    setShowVendorModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendors data...</p>
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Referred Vendors</h1>
                <p className="text-gray-600">Vendors who joined through your referral</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{filteredVendors.length}</p>
              <p className="text-sm text-gray-600">Total Vendors</p>
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
              placeholder="Search vendors by name, email, mobile, location or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No vendors match your search' : 'No vendors have joined through your referral yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location & Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {vendor.image ? (
                              <img 
                                src={vendor.image} 
                                alt={vendor.restaurantName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <FiUser className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vendor.restaurantName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vendor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                          {vendor.mobile}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center mb-1">
                          <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {vendor.locationName}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <FiStar className="w-4 h-4 mr-1 text-yellow-400" />
                          {vendor.rating}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiDollarSign className="w-4 h-4 mr-1 text-green-500" />
                          Starts from ₹{vendor.startingPrice}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                          {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openVendorDetails(vendor)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 transition-colors"
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

        {/* Vendor Details Modal */}
        {showVendorModal && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Vendor Details</h3>
                  <button
                    onClick={closeVendorDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      {selectedVendor.image ? (
                        <img 
                          src={selectedVendor.image} 
                          alt={selectedVendor.restaurantName}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedVendor.restaurantName}
                      </h4>
                      <p className="text-gray-600">{selectedVendor.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Mobile Number</p>
                        <p className="font-medium text-gray-900">
                          {selectedVendor.mobile}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">
                          {selectedVendor.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiMapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">
                          {selectedVendor.locationName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiStar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <p className="font-medium text-gray-900">
                          {selectedVendor.rating} / 5
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiDollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Starting Price</p>
                        <p className="font-medium text-gray-900">
                          ₹{selectedVendor.startingPrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Join Date</p>
                        <p className="font-medium text-gray-900">
                          {selectedVendor.createdAt ? new Date(selectedVendor.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedVendor.status)}`}>
                          {selectedVendor.status}
                        </span>
                      </div>
                    </div>

                    {selectedVendor.description && (
                      <div className="p-3 bg-white border rounded-lg">
                        <p className="text-sm text-gray-500 mb-2">Description</p>
                        <p className="font-medium text-gray-900">
                          {selectedVendor.description}
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-white border rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Referral Code</p>
                      <p className="font-medium text-gray-900">
                        {selectedVendor.referralCode}
                      </p>
                    </div>

                    <div className="p-3 bg-white border rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Wallet Balance</p>
                      <p className="font-medium text-gray-900">
                        ₹{selectedVendor.walletBalance}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeVendorDetails}
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

export default AmbassadorVendorList;