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
  FiDollarSign,
  FiAward
} from 'react-icons/fi';

const AmbassadorAmbassadorList = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmbassador, setSelectedAmbassador] = useState(null);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffy.in/api/ambsdor/allambassadors/${ambassadorId}`);
      const result = await response.json();

      console.log("API Response:", result); // Debug log

      // FIXED: Check for success message instead of success property
      if (result.message === "Referred ambassadors fetched successfully") {
        setAmbassadors(result.data || []);
      } else {
        console.error('Failed to fetch ambassadors:', result.message);
        setAmbassadors([]); // Set empty array on failure
      }
    } catch (error) {
      console.error('Error fetching ambassadors:', error);
      setAmbassadors([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Format ambassador data based on API response structure
  const formatAmbassadorData = (ambassador) => {
    return {
      _id: ambassador._id,
      fullName: ambassador.fullName || 'N/A',
      email: ambassador.email || 'No email',
      mobileNumber: ambassador.mobileNumber || 'N/A',
      city: ambassador.city || 'N/A',
      area: ambassador.area || 'N/A',
      status: ambassador.status || 'pending',
      referralCode: ambassador.referralCode || 'N/A',
      wallet: ambassador.wallet || 0,
      profileImage: ambassador.profileImage || null,
      createdAt: ambassador.createdAt,
      gender: ambassador.gender || 'N/A',
      whyVeggyfy: ambassador.whyVeggyfy || 'No description',
      marketingIdeas: ambassador.marketingIdeas || 'Not specified',
      dateOfBirth: ambassador.dateOfBirth || '',
      pincode: ambassador.pincode || '',
      instagram: ambassador.instagram || '',
      facebook: ambassador.facebook || '',
      twitter: ambassador.twitter || '',
      targetAudience: ambassador.targetAudience || '',
      expectedCommission: ambassador.expectedCommission || '',
      referredBy: ambassador.referredBy || ''
    };
  };

  const filteredAmbassadors = ambassadors
    .map(formatAmbassadorData)
    .filter(ambassador =>
      ambassador.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambassador.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambassador.mobileNumber?.includes(searchTerm) ||
      ambassador.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambassador.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openAmbassadorDetails = (ambassador) => {
    setSelectedAmbassador(ambassador);
    setShowAmbassadorModal(true);
  };

  const closeAmbassadorDetails = () => {
    setSelectedAmbassador(null);
    setShowAmbassadorModal(false);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ambassadors data...</p>
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiAward className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Referred Ambassadors</h1>
                <p className="text-gray-600">Ambassadors who joined through your referral</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600">{filteredAmbassadors.length}</p>
              <p className="text-sm text-gray-600">Total Ambassadors</p>
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
              placeholder="Search ambassadors by name, email, mobile, city or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> {ambassadors.length} ambassadors loaded from API
            </p>
          </div>
        )}

        {/* Ambassadors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredAmbassadors.length === 0 ? (
            <div className="text-center py-12">
              <FiAward className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ambassadors found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No ambassadors match your search' : 'No ambassadors have joined through your referral yet'}
              </p>
              {ambassadors.length > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  (Data loaded but filtered out by search)
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ambassador Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet Balance
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
                  {filteredAmbassadors.map((ambassador) => (
                    <tr key={ambassador._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                            {ambassador.profileImage ? (
                              <img 
                                src={ambassador.profileImage} 
                                alt={ambassador.fullName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <FiUser className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ambassador.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ambassador.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                          {ambassador.mobileNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {ambassador.city}, {ambassador.area}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiDollarSign className="w-4 h-4 mr-1 text-green-500" />
                          ₹{ambassador.wallet}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                          {ambassador.createdAt ? new Date(ambassador.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ambassador.status)}`}>
                          {ambassador.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openAmbassadorDetails(ambassador)}
                          className="flex items-center space-x-1 text-purple-600 hover:text-purple-900 transition-colors"
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

        {/* Ambassador Details Modal */}
        {showAmbassadorModal && selectedAmbassador && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Ambassador Details</h3>
                  <button
                    onClick={closeAmbassadorDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                      {selectedAmbassador.profileImage ? (
                        <img 
                          src={selectedAmbassador.profileImage} 
                          alt={selectedAmbassador.fullName}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedAmbassador.fullName}
                      </h4>
                      <p className="text-gray-600">{selectedAmbassador.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Mobile Number</p>
                        <p className="font-medium text-gray-900">
                          {selectedAmbassador.mobileNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">
                          {selectedAmbassador.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiMapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">
                          {selectedAmbassador.city}, {selectedAmbassador.area}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {selectedAmbassador.gender}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiDollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Wallet Balance</p>
                        <p className="font-medium text-gray-900">
                          ₹{selectedAmbassador.wallet}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Join Date</p>
                        <p className="font-medium text-gray-900">
                          {selectedAmbassador.createdAt ? new Date(selectedAmbassador.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiAward className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAmbassador.status)}`}>
                          {selectedAmbassador.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white border rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Referral Code</p>
                      <p className="font-medium text-gray-900">
                        {selectedAmbassador.referralCode}
                      </p>
                    </div>

                    <div className="p-3 bg-white border rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Referred By</p>
                      <p className="font-medium text-gray-900">
                        {selectedAmbassador.referredBy}
                      </p>
                    </div>

                    {selectedAmbassador.whyVeggyfy && (
                      <div className="p-3 bg-white border rounded-lg">
                        <p className="text-sm text-gray-500 mb-2">Why Veggyfy?</p>
                        <p className="font-medium text-gray-900">
                          {selectedAmbassador.whyVeggyfy}
                        </p>
                      </div>
                    )}

                    {selectedAmbassador.marketingIdeas && (
                      <div className="p-3 bg-white border rounded-lg">
                        <p className="text-sm text-gray-500 mb-2">Marketing Ideas</p>
                        <p className="font-medium text-gray-900">
                          {selectedAmbassador.marketingIdeas}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeAmbassadorDetails}
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

export default AmbassadorAmbassadorList;