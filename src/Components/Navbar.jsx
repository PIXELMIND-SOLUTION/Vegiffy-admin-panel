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
import veggyfyLogo from '../Images/veggifylogo.jpeg'; // Logo import

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();
  
  // State to store counts
  const [productRequests, setProductRequests] = useState(0);
  const [orderRequests, setOrderRequests] = useState(0);
  const [vendorRequests, setVendorRequests] = useState(0);
  const [riderRequests, setRiderRequests] = useState(0);
  
  // State to store notifications and count
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // State for current time and date
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [timeIcon, setTimeIcon] = useState(<RiSunLine />);
  
  // State for dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // State for user info with role detection
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

  // API base URL
  const API_BASE_URL = "https://api.vegiffy.in";
  const LOCAL_API_URL = "https://api.vegiffy.in";

  // Get role from localStorage
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
        accessCount: 0 // Admin has access to everything
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

  // Fetch sub-admin data
  const fetchSubAdminData = async (subAdminId) => {
    try {
      console.log(`Fetching sub-admin data for ID: ${subAdminId}`);
      // You would implement this API endpoint
      const response = await axios.get(`${LOCAL_API_URL}/api/admin/subadmin/${subAdminId}`);
      
      if (response.data && response.data.success) {
        const subAdminData = response.data.data;
        console.log("Sub-admin data fetched:", subAdminData);
        
        return subAdminData;
      }
    } catch (error) {
      console.error("Error fetching sub-admin data:", error);
    }
    return null;
  };

  // Fetch staff profile from API
  const fetchStaffProfile = async (staffId) => {
    try {
      console.log(`Fetching staff profile for ID: ${staffId}`);
      const response = await axios.get(`${API_BASE_URL}/api/admin/myprofile/${staffId}`);
      
      if (response.data && response.data.staff) {
        const staffData = response.data.staff;
        console.log("Staff data fetched:", staffData);
        
        // Update localStorage with staff name
        localStorage.setItem("staffName", staffData.fullName || staffData.name);
        
        // Update userInfo state
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
      // If API fails, try to get name from localStorage
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

  // Get role-based icon
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

  // Get role-based color scheme
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

  // Update time, date and greeting every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format time (HH:MM:SS AM/PM)
      const timeString = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(timeString);
      
      // Format date (Day, DD Month YYYY)
      const dateString = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setCurrentDate(dateString);
      
      // Set greeting based on time of day
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
    
    // Update immediately
    updateDateTime();
    
    // Update every second
    const intervalId = setInterval(updateDateTime, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Initialize user info and fetch data
  useEffect(() => {
    const initializeUserData = async () => {
      // Set user info from localStorage
      const userData = getRoleFromStorage();
      setUserInfo(prev => ({ ...prev, ...userData }));
      
      // If user is sub-admin, fetch their data
      if (userData.role === "Sub-Admin") {
        const subAdminId = localStorage.getItem("adminId");
        if (subAdminId) {
          await fetchSubAdminData(subAdminId);
        }
      }
      
      // If user is staff, fetch their profile
      if (userData.role === "Staff" || userData.role === "Manager") {
        const staffId = localStorage.getItem("staffId");
        if (staffId) {
          await fetchStaffProfile(staffId);
        } else {
          console.error("No staffId found in localStorage");
          // Try to get name from localStorage
          const storedName = localStorage.getItem("staffName");
          if (storedName) {
            setUserInfo(prev => ({
              ...prev,
              name: storedName
            }));
          }
        }
      }
      
      // Fetch counts only for admin and sub-admin (if they have access)
      if (userData.role === "Administrator" || (userData.role === "Sub-Admin" && hasAccess("/productlist"))) {
        fetchCounts();
      }
      
      // Fetch notifications for admin and sub-admin (if they have access to notifications)
      if (userData.role === "Administrator" || (userData.role === "Sub-Admin" && hasAccess("/notifications"))) {
        fetchNotifications();
      }
    };

    initializeUserData();
  }, []);

  // Check if user has access to a path
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
      // Fetch product requests count
      const productRes = await axios.get(`${API_BASE_URL}/api/admin/pending-product-count`);
      setProductRequests(productRes.data.count || 0);
      
      // Fetch order requests count
      const orderRes = await axios.get(`${API_BASE_URL}/api/admin/pending-order-count`);
      setOrderRequests(orderRes.data.count || 0);
      
      // Fetch vendor requests count
      const vendorRes = await axios.get(`${API_BASE_URL}/api/admin/pending-vendor-count`);
      setVendorRequests(vendorRes.data.count || 0);
      
      // Fetch rider requests count
      const riderRes = await axios.get(`${API_BASE_URL}/api/admin/pending-rider-count`);
      setRiderRequests(riderRes.data.count || 0);
      
    } catch (error) {
      console.error("Error fetching counts:", error);
      // Set default values
      setProductRequests(0);
      setOrderRequests(0);
      setVendorRequests(0);
      setRiderRequests(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/notifications`);
      setNotifications(response.data.notifications || []);
      setNotificationCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = () => {
    navigate("/notifications");
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
    // Clear all localStorage
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
    
    // Redirect to login page
    window.location.href = "/";
  };

  const handleSettings = () => {
    if (hasAccess("/setting")) {
      navigate("/setting");
    }
  };

  const handleProfile = () => {
    const role = userInfo.role;
    if (role === "Staff" || role === "Manager") {
      navigate("/staffprofile");
    } else if (role === "Sub-Admin") {
      navigate("/setting"); // You can create a sub-admin profile page
    } else {
      navigate("/setting");
    }
  };

  // Get today's quote based on role
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

  // Get role colors
  const roleColors = getRoleColors(userInfo.role);
  const roleIcon = getRoleIcon(userInfo.role);

  // Get first name for greeting
  const getFirstName = () => {
    if (!userInfo.name) return "User";
    
    // Split by space and get first part
    const firstName = userInfo.name.split(" ")[0];
    
    // If name contains special characters or is too long, truncate
    if (firstName.length > 12) {
      return firstName.substring(0, 10) + "...";
    }
    
    return firstName;
  };

  // Check if user can see quick stats
  const canSeeStats = () => {
    const role = userInfo.role;
    if (role === "Administrator") return true;
    if (role === "Sub-Admin") {
      return hasAccess("/productlist") || hasAccess("/allorders") || 
             hasAccess("/vendorlist") || hasAccess("/riderlist");
    }
    return false;
  };

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 text-gray-800 sticky top-0 w-full p-4 flex items-center shadow-lg z-50 border-b border-gray-200">
      {/* Left Side: Menu Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 group"
        title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
      >
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-gray-600 group-hover:text-indigo-600 transition-colors duration-300" />
        ) : (
          <RiMenu3Line className="text-2xl text-gray-600 group-hover:text-indigo-600 transition-colors duration-300" />
        )}
      </button>

      {/* Center: Welcome Message and Quote */}
      <div className="flex-1 flex flex-col ml-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">{timeIcon}</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {greeting}, {getFirstName()}! 👋
          </h1>
          {/* Role Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors.badge}`}>
            {userInfo.role}
            {userInfo.role === "Sub-Admin" && userInfo.accessCount > 0 && (
              <span className="ml-1 text-xs">({userInfo.accessCount} access)</span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1 italic">
          {getQuote()}
        </p>
      </div>

      {/* Right Side: Time, Date, Stats, and Profile */}
      <div className="flex items-center gap-6">
        
        {/* Time and Date Display */}
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2 text-gray-700">
            <FaClock className="text-blue-500" />
            <span className="font-semibold">{currentTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaCalendarAlt className="text-green-500" />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Mobile Time Display */}
        <div className="md:hidden flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
          <FaClock className="text-blue-500 text-sm" />
          <span className="text-xs font-medium">{currentTime.split(' ')[0]}</span>
        </div>

        {/* Quick Stats - For Admin and Sub-Admin with access */}
        {canSeeStats() && (
          <div className="hidden lg:flex items-center gap-3">
            {/* Product Requests - Only show if user has access */}
            {(userInfo.role === "Administrator" || hasAccess("/productlist")) && productRequests > 0 && (
              <div 
                onClick={handleProductClick}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
                title={`${productRequests} Product Requests`}
              >
                <div className="relative">
                  <FaBox className="text-blue-600 text-lg" />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {productRequests}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  Products
                </span>
              </div>
            )}

            {/* Order Requests - Only show if user has access */}
            {(userInfo.role === "Administrator" || hasAccess("/allorders")) && orderRequests > 0 && (
              <div 
                onClick={handleOrderClick}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-300 group"
                title={`${orderRequests} Order Requests`}
              >
                <div className="relative">
                  <FaShoppingCart className="text-green-600 text-lg" />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {orderRequests}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Orders
                </span>
              </div>
            )}

            {/* Vendor Requests - Only show if user has access */}
            {(userInfo.role === "Administrator" || hasAccess("/vendorlist")) && vendorRequests > 0 && (
              <div 
                onClick={handleVendorClick}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 cursor-pointer hover:from-orange-100 hover:to-orange-200 transition-all duration-300 group"
                title={`${vendorRequests} Vendor Requests`}
              >
                <div className="relative">
                  <FaStore className="text-orange-600 text-lg" />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {vendorRequests}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
                  Vendors
                </span>
              </div>
            )}

            {/* Rider Requests - Only show if user has access */}
            {(userInfo.role === "Administrator" || hasAccess("/riderlist")) && riderRequests > 0 && (
              <div 
                onClick={handleRiderClick}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group"
                title={`${riderRequests} Rider Requests`}
              >
                <div className="relative">
                  <RiShieldUserLine className="text-purple-600 text-lg" />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {riderRequests}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                  Riders
                </span>
              </div>
            )}
          </div>
        )}

        {/* Logo with Role-specific colors */}
        <div className={`hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${roleColors.bg} rounded-lg border ${roleColors.border}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img
              src={veggyfyLogo}
              alt="Veggyfy Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`text-sm font-bold bg-gradient-to-r ${roleColors.gradient} bg-clip-text text-transparent`}>
            Vegiffy {userInfo.role === "Sub-Admin" ? "Sub-Admin" : userInfo.role === "Staff" ? "Staff" : userInfo.role === "Manager" ? "Manager" : ""}
          </div>
        </div>

        {/* Notifications - Only for users with access */}
        {(userInfo.role === "Administrator" || hasAccess("/notifications")) && (
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300 relative group"
              title="Notifications"
            >
              <div className="relative">
                <FaBell className={`text-xl ${notificationCount > 0 ? 'text-gray-600' : 'text-gray-300'} group-hover:text-purple-600 transition-colors duration-300`} />
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </div>
                )}
              </div>
            </button>
            {/* Notification Tooltip */}
            {notificationCount > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl p-3 hidden group-hover:block z-50 border border-gray-200">
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  {notificationCount} new notification{notificationCount > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-600">
                  Click to view all notifications
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Section for all roles */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 group"
          >
            <div className="relative">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${roleColors.gradient} flex items-center justify-center text-white font-semibold`}>
                {roleIcon}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                userInfo.role === "Administrator" ? "bg-purple-500" :
                userInfo.role === "Sub-Admin" ? "bg-blue-500" :
                userInfo.role === "Manager" ? "bg-green-500" : "bg-teal-500"
              }`}></div>
            </div>
            
            <div className="hidden lg:block text-left min-w-[120px]">
              <div className={`text-sm font-semibold ${roleColors.text} group-hover:text-indigo-700 truncate`}>
                {userInfo.name}
              </div>
              <div className="text-xs text-gray-500">
                {userInfo.role}
              </div>
            </div>
            
            <RiUser3Line className="hidden lg:block text-gray-400 group-hover:text-indigo-600 ml-1" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {userInfo.photo ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={userInfo.photo}
                        alt={userInfo.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = veggyfyLogo;
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${roleColors.gradient} text-white font-semibold`}>
                      {roleIcon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</div>
                    <div className={`text-xs ${roleColors.text} mt-1`}>{userInfo.role}</div>
                    {userInfo.email && (
                      <div className="text-xs text-gray-500 truncate mt-1">{userInfo.email}</div>
                    )}
                    {userInfo.phone && (
                      <div className="text-xs text-gray-500 mt-1">{userInfo.phone}</div>
                    )}
                    {userInfo.accessCount > 0 && userInfo.role === "Sub-Admin" && (
                      <div className="text-xs text-blue-600 mt-1">
                        {userInfo.accessCount} accessible pages
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200"
              >
                <RiUser3Line className="text-gray-400" />
                {userInfo.role === "Staff" || userInfo.role === "Manager" ? "Staff Profile" : "My Profile"}
              </button>
              
              {(userInfo.role === "Administrator" || (userInfo.role === "Sub-Admin" && hasAccess("/setting"))) && (
                <button
                  onClick={handleSettings}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200"
                >
                  <FaCog className="text-gray-400" />
                  Settings
                </button>
              )}
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors duration-200"
              >
                <FaSignOutAlt className="text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;