import { useState, useEffect } from "react";
import { 
  RiMenu2Line, 
  RiMenu3Line, 
  RiNotification3Line, 
  RiUser3Line,
  RiCalendar2Line,
  RiTimeLine,
  RiSunLine,
  RiMoonLine,
  RiSunFoggyLine,
  RiShieldUserLine
} from "react-icons/ri";
import { 
  FaBell, 
  FaShoppingCart, 
  FaBox, 
  FaUserCircle,
  FaCalendarAlt,
  FaClock,
  FaCog,
  FaSignOutAlt,
  FaStore,
  FaUserTie,
  FaUserShield,
  FaUserCheck
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import veggyfyLogo from '../Images/veggifylogo.jpeg';

const Navbar = ({ setIsCollapsed, isCollapsed, isMobile }) => {
  const navigate = useNavigate();
  
  const [productRequests, setProductRequests] = useState(0);
  const [orderRequests, setOrderRequests] = useState(0);
  const [vendorRequests, setVendorRequests] = useState(0);
  const [riderRequests, setRiderRequests] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [timeIcon, setTimeIcon] = useState(<RiSunLine />);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    email: "",
    role: "User",
    userId: "",
    fullName: "",
    phone: "",
    gender: "",
    photo: "",
    accessCount: 0
  });

  const API_BASE_URL = "https://api.vegiffy.in";
  const LOCAL_API_URL = "https://api.vegiffy.in";

  const getRoleFromStorage = () => {
    const role = localStorage.getItem("role");
    const adminId = localStorage.getItem("adminId");
    const staffId = localStorage.getItem("staffId");
    const adminName = localStorage.getItem("adminName");
    const adminEmail = localStorage.getItem("adminEmail");
    const phoneNumber = localStorage.getItem("phoneNumber");
    const access = JSON.parse(localStorage.getItem("access") || "[]");
    
    if (role === "admin") {
      return {
        role: "Administrator",
        name: adminName || "Admin User",
        email: adminEmail || "",
        userId: adminId || "",
        phone: phoneNumber || "",
        accessCount: 0
      };
    } else if (role === "subadmin") {
      return {
        role: "Sub-Admin",
        name: adminName || "Sub-Admin User",
        email: adminEmail || "",
        userId: adminId || "",
        phone: phoneNumber || "",
        accessCount: access.length || 0
      };
    } else if (role === "staff" || role === "Manager") {
      return {
        role: role === "Manager" ? "Manager" : "Staff",
        name: adminName || "Loading Staff...",
        email: adminEmail || "",
        userId: staffId || "",
        accessCount: 0
      };
    } else {
      return {
        role: "User",
        name: "Guest User",
        email: "",
        userId: "",
        accessCount: 0
      };
    }
  };

  const fetchStaffProfile = async (staffId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/myprofile/${staffId}`);
      if (response.data && response.data.staff) {
        const staffData = response.data.staff;
        localStorage.setItem("staffName", staffData.fullName || staffData.name);
        setUserInfo(prev => ({
          ...prev,
          name: staffData.fullName || staffData.name || "Staff User",
          fullName: staffData.fullName || "",
          email: staffData.email || "",
          phone: staffData.phone || "",
          gender: staffData.gender || "",
          photo: staffData.photo || ""
        }));
        return staffData;
      }
    } catch (error) {
      console.error("Error fetching staff profile:", error);
      const storedName = localStorage.getItem("staffName");
      if (storedName) {
        setUserInfo(prev => ({
          ...prev,
          name: storedName
        }));
      }
    }
    return null;
  };

  const getRoleIcon = (role) => {
    switch(role.toLowerCase()) {
      case 'administrator':
        return <FaUserShield className="text-white" />;
      case 'sub-admin':
        return <FaUserCheck className="text-white" />;
      case 'manager':
        return <FaUserTie className="text-white" />;
      case 'staff':
        return <FaUserTie className="text-white" />;
      default:
        return <FaUserCircle className="text-white" />;
    }
  };

  const getRoleColors = (role) => {
    switch(role.toLowerCase()) {
      case 'administrator':
        return {
          gradient: "from-purple-600 to-pink-600",
          bg: "from-purple-50 to-pink-50",
          border: "border-purple-200",
          text: "text-purple-700",
          badge: "bg-purple-100 text-purple-800 border-purple-200"
        };
      case 'sub-admin':
        return {
          gradient: "from-blue-600 to-indigo-600",
          bg: "from-blue-50 to-indigo-50",
          border: "border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case 'manager':
        return {
          gradient: "from-green-600 to-emerald-600",
          bg: "from-green-50 to-emerald-50",
          border: "border-green-200",
          text: "text-green-700",
          badge: "bg-green-100 text-green-800 border-green-200"
        };
      case 'staff':
        return {
          gradient: "from-teal-600 to-cyan-600",
          bg: "from-teal-50 to-cyan-50",
          border: "border-teal-200",
          text: "text-teal-700",
          badge: "bg-teal-100 text-teal-800 border-teal-200"
        };
      default:
        return {
          gradient: "from-gray-600 to-gray-700",
          bg: "from-gray-50 to-gray-100",
          border: "border-gray-200",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800 border-gray-200"
        };
    }
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(timeString);
      
      const dateString = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setCurrentDate(dateString);
      
      const hours = now.getHours();
      let greetingText = "";
      let icon = <RiSunLine />;
      
      if (hours >= 5 && hours < 12) {
        greetingText = "Good Morning";
        icon = <RiSunLine className="text-yellow-500" />;
      } else if (hours >= 12 && hours < 16) {
        greetingText = "Good Afternoon";
        icon = <RiSunLine className="text-orange-500" />;
      } else if (hours >= 16 && hours < 20) {
        greetingText = "Good Evening";
        icon = <RiSunFoggyLine className="text-purple-500" />;
      } else {
        greetingText = "Good Night";
        icon = <RiMoonLine className="text-blue-500" />;
      }
      
      setGreeting(greetingText);
      setTimeIcon(icon);
    };
    
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const initializeUserData = async () => {
      const userData = getRoleFromStorage();
      setUserInfo(prev => ({ ...prev, ...userData }));
      
      if (userData.role === "Staff" || userData.role === "Manager") {
        const staffId = localStorage.getItem("staffId");
        if (staffId) {
          await fetchStaffProfile(staffId);
        } else {
          const storedName = localStorage.getItem("staffName");
          if (storedName) {
            setUserInfo(prev => ({
              ...prev,
              name: storedName
            }));
          }
        }
      }
      
      if (userData.role === "Administrator" || (userData.role === "Sub-Admin" && hasAccess("/productlist"))) {
        fetchCounts();
      }
      
      if (userData.role === "Administrator" || (userData.role === "Sub-Admin" && hasAccess("/notifications"))) {
        fetchNotifications();
      }
    };

    initializeUserData();
  }, []);

  const hasAccess = (path) => {
    const role = localStorage.getItem("role");
    if (role === "admin") return true;
    if (role === "subadmin") {
      const access = JSON.parse(localStorage.getItem("access") || "[]");
      return access.includes(path);
    }
    return false;
  };

  const fetchCounts = async () => {
    try {
      setProductRequests(0);
      setOrderRequests(0);
      setVendorRequests(0);
      setRiderRequests(0);
    } catch (error) {
      console.error("Error fetching counts:", error);
      setProductRequests(0);
      setOrderRequests(0);
      setVendorRequests(0);
      setRiderRequests(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/delivery-boy/notification`);
      setNotifications(response.data.notifications || []);
      setNotificationCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = () => {
    navigate("/notifications");
    setIsMobileMenuOpen(false);
  };

  const handleProductClick = () => {
    if (hasAccess("/productlist")) {
      navigate("/productlist");
    }
  };

  const handleOrderClick = () => {
    if (hasAccess("/allorders")) {
      navigate("/allorders");
    }
  };

  const handleVendorClick = () => {
    if (hasAccess("/vendorlist")) {
      navigate("/vendorlist");
    }
  };

  const handleRiderClick = () => {
    if (hasAccess("/riderlist")) {
      navigate("/riderlist");
    }
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminId");
    localStorage.removeItem("staffId");
    localStorage.removeItem("access");
    localStorage.removeItem("role");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("staffName");
    localStorage.removeItem("phoneNumber");
    localStorage.removeItem("createdBy");

    alert("Logout successful");
    window.location.href = "/";
  };

  const handleSettings = () => {
    if (hasAccess("/setting")) {
      navigate("/setting");
      setShowProfileDropdown(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleProfile = () => {
    const role = userInfo.role;
    if (role === "Staff" || role === "Manager") {
      navigate("/staffprofile");
    } else if (role === "Sub-Admin") {
      navigate("/setting");
    } else {
      navigate("/setting");
    }
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
  };

  const getQuote = () => {
    const adminQuotes = [
      "Lead with purpose, inspire with action. 🌟",
      "Great things never come from comfort zones. 💪",
      "Success is not final, failure is not fatal. 🚀",
      "The only way to do great work is to love what you do. ❤️",
      "Believe you can and you're halfway there. ✨",
    ];
    
    const subAdminQuotes = [
      "Assist with excellence, support with care. 👏",
      "Your contribution makes a big difference! 🌟",
      "Precision in assistance leads to perfection. 🔧",
      "Support is not just helping, it's empowering. 💪",
      "Every task well done builds trust. 🤝",
    ];
    
    const staffQuotes = [
      "Your hard work makes a difference every day! 👏",
      "Small steps every day lead to big results. 🏃‍♂️",
      "Teamwork makes the dream work! 🤝",
      "Excellence is not a skill, it's an attitude. 🌟",
      "Stay focused and keep moving forward! 💪",
    ];
    
    let quotes = [];
    if (userInfo.role === "Administrator") quotes = adminQuotes;
    else if (userInfo.role === "Sub-Admin") quotes = subAdminQuotes;
    else quotes = staffQuotes;
    
    return quotes[new Date().getDay() % quotes.length];
  };

  const roleColors = getRoleColors(userInfo.role);
  const roleIcon = getRoleIcon(userInfo.role);

  const getFirstName = () => {
    if (!userInfo.name) return "User";
    const firstName = userInfo.name.split(" ")[0];
    if (firstName.length > 12) {
      return firstName.substring(0, 10) + "...";
    }
    return firstName;
  };

  const canSeeStats = () => {
    const role = userInfo.role;
    if (role === "Administrator") return true;
    if (role === "Sub-Admin") {
      return hasAccess("/productlist") || hasAccess("/allorders") || 
             hasAccess("/vendorlist") || hasAccess("/riderlist");
    }
    return false;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileDropdown && !e.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileDropdown]);

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 text-gray-800 sticky top-0 w-full p-2 sm:p-3 md:p-4 flex items-center justify-between shadow-lg z-40 border-b border-gray-200 min-h-[60px] sm:min-h-[70px] md:min-h-[80px] flex-shrink-0">
      
      {/* Left Section - Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 group flex-shrink-0"
        >
          {isCollapsed ? (
            <RiMenu2Line className="text-xl sm:text-2xl text-gray-600 group-hover:text-indigo-600" />
          ) : (
            <RiMenu3Line className="text-xl sm:text-2xl text-gray-600 group-hover:text-indigo-600" />
          )}
        </button>

        {/* Logo - Mobile */}
        <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
            <img src={veggyfyLogo} alt="Veggyfy Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-gray-800 truncate">Vegiffy</span>
        </div>
      </div>

      {/* Center: Welcome Message */}
      <div className="hidden sm:flex flex-1 flex-col ml-3 md:ml-6 min-w-0 max-w-[40%] md:max-w-[50%] overflow-hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base sm:text-lg md:text-xl flex-shrink-0">{timeIcon}</span>
          <h1 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
            {greeting}, {getFirstName()}! 👋
          </h1>
          <div className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${roleColors.badge} flex-shrink-0 hidden xl:block`}>
            {userInfo.role}
          </div>
        </div>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-0.5 sm:mt-1 italic truncate">
          {getQuote()}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6 flex-shrink-0">
        
        {/* Mobile User Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <RiUser3Line className="text-xl sm:text-2xl text-gray-600" />
        </button>

        {/* Time */}
        <div className="hidden md:flex flex-col items-end flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 text-gray-700">
            <FaClock className="text-blue-500 text-xs sm:text-sm flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{currentTime}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-600">
            <FaCalendarAlt className="text-green-500 text-xs sm:text-sm flex-shrink-0" />
            <span className="whitespace-nowrap">{currentDate}</span>
          </div>
        </div>

        {/* Mobile Time */}
        <div className="md:hidden flex items-center gap-1 bg-blue-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex-shrink-0">
          <FaClock className="text-blue-500 text-[10px] sm:text-sm flex-shrink-0" />
          <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{currentTime.split(' ')[0]}</span>
        </div>

        {/* Quick Stats */}
        {canSeeStats() && (
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink-0">
            {(userInfo.role === "Administrator" || hasAccess("/productlist")) && productRequests > 0 && (
              <div onClick={handleProductClick} className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group flex-shrink-0">
                <div className="relative">
                  <FaBox className="text-blue-600 text-sm xl:text-base" />
                  <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] xl:text-xs rounded-full w-4 h-4 xl:w-5 xl:h-5 flex items-center justify-center animate-pulse">
                    {productRequests}
                  </div>
                </div>
                <span className="text-[10px] xl:text-xs font-medium text-gray-700 group-hover:text-blue-700 hidden 2xl:inline">Products</span>
              </div>
            )}

            {(userInfo.role === "Administrator" || hasAccess("/allorders")) && orderRequests > 0 && (
              <div onClick={handleOrderClick} className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-300 group flex-shrink-0">
                <div className="relative">
                  <FaShoppingCart className="text-green-600 text-sm xl:text-base" />
                  <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] xl:text-xs rounded-full w-4 h-4 xl:w-5 xl:h-5 flex items-center justify-center animate-pulse">
                    {orderRequests}
                  </div>
                </div>
                <span className="text-[10px] xl:text-xs font-medium text-gray-700 group-hover:text-green-700 hidden 2xl:inline">Orders</span>
              </div>
            )}

            {(userInfo.role === "Administrator" || hasAccess("/vendorlist")) && vendorRequests > 0 && (
              <div onClick={handleVendorClick} className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 cursor-pointer hover:from-orange-100 hover:to-orange-200 transition-all duration-300 group flex-shrink-0">
                <div className="relative">
                  <FaStore className="text-orange-600 text-sm xl:text-base" />
                  <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] xl:text-xs rounded-full w-4 h-4 xl:w-5 xl:h-5 flex items-center justify-center animate-pulse">
                    {vendorRequests}
                  </div>
                </div>
                <span className="text-[10px] xl:text-xs font-medium text-gray-700 group-hover:text-orange-700 hidden 2xl:inline">Vendors</span>
              </div>
            )}

            {(userInfo.role === "Administrator" || hasAccess("/riderlist")) && riderRequests > 0 && (
              <div onClick={handleRiderClick} className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group flex-shrink-0">
                <div className="relative">
                  <RiShieldUserLine className="text-purple-600 text-sm xl:text-base" />
                  <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] xl:text-xs rounded-full w-4 h-4 xl:w-5 xl:h-5 flex items-center justify-center animate-pulse">
                    {riderRequests}
                  </div>
                </div>
                <span className="text-[10px] xl:text-xs font-medium text-gray-700 group-hover:text-purple-700 hidden 2xl:inline">Riders</span>
              </div>
            )}
          </div>
        )}

        {/* Logo Desktop */}
        <div className={`hidden lg:flex items-center gap-2 px-2 py-1 bg-gradient-to-r ${roleColors.bg} rounded-lg border ${roleColors.border} flex-shrink-0`}>
          <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
            <img src={veggyfyLogo} alt="Veggyfy Logo" className="w-full h-full object-cover" />
          </div>
          <div className={`text-xs xl:text-sm font-bold bg-gradient-to-r ${roleColors.gradient} bg-clip-text text-transparent hidden 2xl:block truncate`}>
            Vegiffy
          </div>
        </div>

        {/* Notifications */}
        {(userInfo.role === "Administrator" || hasAccess("/notifications")) && (
          <div className="relative flex-shrink-0">
            <button onClick={handleNotificationClick} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all duration-300 relative group">
              <div className="relative">
                <FaBell className={`text-base sm:text-xl ${notificationCount > 0 ? 'text-gray-600' : 'text-gray-300'} group-hover:text-purple-600 transition-colors duration-300`} />
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </div>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Profile */}
        <div className="relative profile-dropdown-container flex-shrink-0">
          <button onClick={handleProfileClick} className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 group">
            <div className="relative">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 xl:w-10 xl:h-10 rounded-full bg-gradient-to-r ${roleColors.gradient} flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0`}>
                {roleIcon}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-white ${
                userInfo.role === "Administrator" ? "bg-purple-500" :
                userInfo.role === "Sub-Admin" ? "bg-blue-500" :
                userInfo.role === "Manager" ? "bg-green-500" : "bg-teal-500"
              }`}></div>
            </div>
            
            <div className="hidden lg:block text-left min-w-[80px] xl:min-w-[100px] overflow-hidden">
              <div className={`text-xs xl:text-sm font-semibold ${roleColors.text} group-hover:text-indigo-700 truncate`}>
                {userInfo.name}
              </div>
              <div className="text-[10px] xl:text-xs text-gray-500 truncate">{userInfo.role}</div>
            </div>
            
            <RiUser3Line className="hidden lg:block text-gray-400 group-hover:text-indigo-600 ml-0.5 text-sm xl:text-base flex-shrink-0" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 max-h-[80vh] overflow-y-auto">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  {userInfo.photo ? (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                      <img src={userInfo.photo} alt={userInfo.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${roleColors.gradient} text-white font-semibold flex-shrink-0`}>
                      {roleIcon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{userInfo.name}</div>
                    <div className={`text-[10px] sm:text-xs ${roleColors.text} mt-0.5`}>{userInfo.role}</div>
                    {userInfo.email && <div className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">{userInfo.email}</div>}
                    {userInfo.phone && <div className="text-[10px] sm:text-xs text-gray-500 truncate">{userInfo.phone}</div>}
                  </div>
                </div>
              </div>
              
              <button onClick={handleProfile} className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 sm:gap-3 transition-colors duration-200">
                <RiUser3Line className="text-gray-400 text-sm sm:text-base flex-shrink-0" />
                <span className="truncate">Profile</span>
              </button>
              
              {(userInfo.role === "Administrator" || (userInfo.role === "Sub-Admin" && hasAccess("/setting"))) && (
                <button onClick={handleSettings} className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 sm:gap-3 transition-colors duration-200">
                  <FaCog className="text-gray-400 text-sm sm:text-base flex-shrink-0" />
                  <span className="truncate">Settings</span>
                </button>
              )}
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button onClick={handleLogout} className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 sm:gap-3 transition-colors duration-200">
                <FaSignOutAlt className="text-red-500 text-sm sm:text-base flex-shrink-0" />
                <span className="truncate">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-b border-gray-200 p-4 lg:hidden z-50 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${roleColors.gradient} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                {roleIcon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</div>
                <div className={`text-xs ${roleColors.text} truncate`}>{userInfo.role}</div>
                {userInfo.email && <div className="text-xs text-gray-500 truncate">{userInfo.email}</div>}
              </div>
            </div>
            
            <button onClick={handleProfile} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <RiUser3Line className="text-gray-600 text-base flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">Profile</span>
            </button>
            
            {(userInfo.role === "Administrator" || (userInfo.role === "Sub-Admin" && hasAccess("/setting"))) && (
              <button onClick={handleSettings} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <FaCog className="text-gray-600 text-base flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">Settings</span>
              </button>
            )}
            
            <button onClick={handleNotificationClick} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <FaBell className="text-gray-600 text-base flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">Notifications</span>
              {notificationCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">{notificationCount}</span>
              )}
            </button>
            
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors border-t border-gray-100 pt-3">
              <FaSignOutAlt className="text-red-500 text-base flex-shrink-0" />
              <span className="text-sm text-red-600 truncate">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;