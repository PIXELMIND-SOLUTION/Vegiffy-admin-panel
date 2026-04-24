import React, { useState, useEffect } from 'react';
import { 
  FiAward, 
  FiUser, 
  FiTrendingUp, 
  FiPhone,
  FiMail,
  FiMapPin,
  FiDollarSign,
  FiStar,
  FiUsers
} from 'react-icons/fi'; 

const TopAmbassadors = () => {
  const [topAmbassadors, setTopAmbassadors] = useState([]);
  const [currentRank, setCurrentRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopAmbassadors();
  }, []);

  const fetchTopAmbassadors = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffy.in/api/ambsdor/top10/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setTopAmbassadors(result.data.topAmbassadors || []);
        setCurrentRank(result.data.currentAmbassadorRank);
      } else {
        console.error('Failed to fetch top ambassadors:', result.message);
      }
    } catch (error) {
      console.error('Error fetching top ambassadors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: FiAward };
      case 1:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: FiAward };
      case 2:
        return { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: FiAward };
      default:
        return { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: FiUser };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-lg">
              <FiAward className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ambassador Leaderboard</h1>
          <p className="text-lg text-gray-600 mb-4">Top performing Veggyfy Ambassadors</p>
          
          {/* Current User Rank */}
          {currentRank && (
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md border">
              <FiStar className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Your Rank:</span>
              <span className="ml-2 text-lg font-bold text-green-600">#{currentRank}</span>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-white font-semibold">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Ambassador</div>
              <div className="col-span-2 text-center">Total Commission</div>
              <div className="col-span-2 text-center">Users</div>
              <div className="col-span-3 text-center">Location</div>
            </div>
          </div>

          {/* Ambassadors List */}
          <div className="divide-y divide-gray-100">
            {topAmbassadors.map((ambassador, index) => {
              const rankBadge = getRankBadge(index);
              const BadgeIcon = rankBadge.icon;
              
              return (
                <div 
                  key={ambassador._id} 
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    ambassador._id === localStorage.getItem('ambassadorId') ? 'bg-green-50 border-l-4 border-green-500' : ''
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${rankBadge.color}`}>
                        {index < 3 ? (
                          <BadgeIcon className="w-5 h-5" />
                        ) : (
                          <span className="font-bold text-sm">{index + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Ambassador Info */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={ambassador.profileImage || '/default-avatar.png'}
                          alt={ambassador.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{ambassador.fullName}</h3>
                            {ambassador._id === localStorage.getItem('ambassadorId') && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <FiMail className="w-3 h-3" />
                            <span className="truncate">{ambassador.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Commission */}
                    <div className="col-span-2 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-1 text-lg font-bold text-green-600">
                          <FiDollarSign className="w-4 h-4" />
                          <span>{formatCurrency(ambassador.totalCommission || 0)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Total Earnings</div>
                      </div>
                    </div>

                    {/* Users Count */}
                    <div className="col-span-2 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-1 text-lg font-bold text-blue-600">
                          <FiUsers className="w-4 h-4" />
                          <span>{ambassador.users?.length || 0}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Referred Users</div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="col-span-3 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-1 text-sm font-medium text-gray-700">
                          <FiMapPin className="w-3 h-3 text-gray-400" />
                          <span>{ambassador.city || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ambassador.area || 'Location not specified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats for Current User */}
                  {ambassador._id === localStorage.getItem('ambassadorId') && ambassador.transactionHistory && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Wallet Balance</div>
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(ambassador.wallet || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Total Transactions</div>
                          <div className="text-sm font-semibold text-blue-600">
                            {ambassador.transactionHistory?.length || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Status</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ambassador.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : ambassador.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {ambassador.status?.charAt(0).toUpperCase() + ambassador.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {topAmbassadors.length === 0 && (
            <div className="text-center py-12">
              <FiAward className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ambassadors found</h3>
              <p className="text-gray-500">Leaderboard data is not available yet</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Ranking Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded-full flex items-center justify-center">
                <FiAward className="w-3 h-3 text-yellow-700" />
              </div>
              <span className="text-sm text-gray-600">1st Rank</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center">
                <FiAward className="w-3 h-3 text-gray-700" />
              </div>
              <span className="text-sm text-gray-600">2nd Rank</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-100 border-2 border-orange-300 rounded-full flex items-center justify-center">
                <FiAward className="w-3 h-3 text-orange-700" />
              </div>
              <span className="text-sm text-gray-600">3rd Rank</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">4+</span>
              </div>
              <span className="text-sm text-gray-600">Other Ranks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopAmbassadors;