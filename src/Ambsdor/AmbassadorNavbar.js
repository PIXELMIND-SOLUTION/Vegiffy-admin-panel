import { useState, useEffect } from "react";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const AmbassadorNavbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();
  const [currentRank, setCurrentRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ambassadorName, setAmbassadorName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    fetchCurrentRank();
    fetchAmbassadorProfile();
  }, []);

  const fetchAmbassadorProfile = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) return;

      const response = await fetch(`https://api.vegiffyy.com/api/ambsdor/profile/${ambassadorId}`);
      const result = await response.json();

      if (result.success && result.data) {
        setAmbassadorName(result.data.fullName || "");
        setProfileImage(result.data.profileImage || "");
        localStorage.setItem('ambassadorFullName', result.data.fullName || "");
      }
    } catch (error) {
      console.error('Error fetching ambassador profile:', error);
    }
  };

  const fetchCurrentRank = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) return;

      const response = await fetch(`https://api.vegiffyy.com/api/ambsdor/top10/${ambassadorId}`);
      const result = await response.json();

      if (result.success && result.data.currentAmbassadorRank) {
        setCurrentRank(result.data.currentAmbassadorRank);
      }
    } catch (error) {
      console.error('Error fetching rank:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankSuffix = (rank) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  return (
    <nav className="bg-white text-black sticky top-0 w-full py-2 px-4 flex items-center shadow-md z-50 border-b border-gray-200 h-16">
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {isCollapsed ? (
          <RiMenu2Line className="text-xl text-gray-600" />
        ) : (
          <RiMenu3Line className="text-xl text-gray-600" />
        )}
      </button>

      <div className="flex justify-between items-center w-full">
        {/* Left Section - Current Position */}
        <div className="flex gap-3 ml-3 items-center">
          {!loading && currentRank && (
            <div className="relative">
              {/* Compact Position Card */}
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-md transform transition-all duration-200">
                <div className="flex items-center gap-2">
                  <div className="text-lg">
                    {getRankIcon(currentRank)}
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-medium opacity-90">Your Position</div>
                    <div className="text-lg font-bold flex items-center gap-1">
                      {currentRank}
                      <span className="text-xs font-normal">
                        {getRankSuffix(currentRank)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Small Ribbon */}
                {currentRank <= 3 && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    TOP {currentRank}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-xl shadow-md">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <div className="text-center">
                  <div className="text-[10px] font-medium">Loading...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - User Info & Actions */}
        <div className="flex gap-2 items-center">
          {/* Compact User Profile */}
          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
            <div className="relative">
              <img
                className="rounded-full w-9 h-9 object-cover border-2 border-green-400 group-hover:border-purple-500 transition-colors"
                src={profileImage || "/ambassador-avatar.png"}
                alt="Ambassador"
                onError={(e) => {
                  e.target.src = "https://tse3.mm.bing.net/th/id/OIP.YhwHGSKm8lroxEoztI93XQHaEK?rs=1&pid=ImgDetMain&o=7&rm=3";
                }}
              />
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors leading-tight">
                {ambassadorName.split(' ')[0] || "Ambassador"}
              </span>
              <span className="text-xs text-gray-500 leading-tight">Ambassador</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AmbassadorNavbar;