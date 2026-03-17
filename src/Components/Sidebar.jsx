import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [pagesAccess, setPagesAccess] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const location = useLocation();

  // ✅ Load data from localStorage
  useEffect(() => {
    const storedPagesAccess = JSON.parse(localStorage.getItem("access") || "[]");
    const storedAdminId = localStorage.getItem("adminId");
    const storedStaffId = localStorage.getItem("staffId");
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("adminName") || "";
    const storedEmail = localStorage.getItem("adminEmail") || "";

    console.log('Sidebar - Loaded from localStorage:', {
      storedRole,
      storedName,
      storedEmail,
      storedPagesAccess,
      storedAdminId,
      storedStaffId
    });

    // Check if user is logged in
    if (!storedRole) {
      console.log('No user found, redirecting to login');
      window.location.href = "/";
      return;
    }

    setRole(storedRole);
    setUserName(storedName);
    setUserEmail(storedEmail);

    if (storedRole === "subadmin") {
      setPagesAccess(storedPagesAccess);
      setUserId(storedAdminId || "subadmin");
    } else if (storedRole === "staff" || storedRole === "Manager") {
      setPagesAccess(storedPagesAccess);
      setUserId(storedStaffId || "staff");
    } else if (storedRole === "admin") {
      setPagesAccess([]); // Admin has access to everything
      setUserId(storedAdminId || "admin");
    }
  }, []);

  // ✅ Role-based logout function
  const handleLogout = async () => {
    try {
      // Clear all localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminId");
      localStorage.removeItem("staffId");
      localStorage.removeItem("access");
      localStorage.removeItem("role");
      localStorage.removeItem("adminName");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("phoneNumber");
      localStorage.removeItem("createdBy");

      alert("Logout successful");

      // Redirect to login page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // ✅ Complete menu structure (ALL SECTIONS PRESERVED)
  const elements = [
    {
      icon: <i className="ri-dashboard-fill text-white"></i>,
      name: "Dashboard",
      path: "/dashboard",
      requiredAccess: "/dashboard"
    },
    {
      icon: <i className="ri-user-3-fill text-white"></i>,
      name: "Users",
      dropdown: [
        { name: "All Users", path: "/users", requiredAccess: "/users" },
      ],
    },
    {
      icon: <i className="ri-folders-fill text-white"></i>,
      name: "Categories",
      dropdown: [
        { name: "Create Category", path: "/categoryform", requiredAccess: "/categoryform" },
        { name: "All Categories", path: "/categorylist", requiredAccess: "/categorylist" },
      ],
    },
    {
      icon: <i className="ri-shopping-bag-3-fill text-white"></i>,
      name: "Products",
      dropdown: [
        { name: "Add Product", path: "/add-product", requiredAccess: "/add-product" },
        { name: "All Products", path: "/productlist", requiredAccess: "/productlist" },
      ],
    },
    {
      icon: <i className="ri-truck-fill text-white"></i>,
      name: "Orders",
      dropdown: [
        { name: "All Orders", path: "/allorders", requiredAccess: "/allorders" },
        { name: "Vendor Orders", path: "/vendororders", requiredAccess: "/vendororders" },
        { name: "Pending Orders", path: "/pendingorders", requiredAccess: "/pendingorders" },
        { name: "Completed Orders", path: "/completedorders", requiredAccess: "/completedorders" },
        { name: "Restaurant Orders", path: "/resturantorders", requiredAccess: "/resturantorders" },
      ],
    },
    {
      icon: <i className="ri-image-fill text-white"></i>,
      name: "Banners",
      dropdown: [
        { name: "Create Banner", path: "/create-banner", requiredAccess: "/create-banner" },
        { name: "Pending Banners", path: "/pendingbanners", requiredAccess: "/pendingbanners" },
      ],
    },
    {
      icon: <i className="ri-restaurant-2-fill text-white"></i>,
      name: "Vendors",
      dropdown: [
        { name: "Add Vendor", path: "/add-vendor", requiredAccess: "/add-vendor" },
        { name: "All Vendors", path: "/vendorlist", requiredAccess: "/vendorlist" },
        { name: "Active Vendors", path: "/activevendorlist", requiredAccess: "/activevendorlist" },
        { name: "Pending Vendors", path: "/pendingvendorlist", requiredAccess: "/pendingvendorlist" },
        { name: "Vendor Withdrawal", path: "/vendorwithdrawallist", requiredAccess: "/vendorwithdrawallist" },
      ],
    },
    {
      icon: <i className="ri-team-fill text-white"></i>,
      name: "Staff",
      dropdown: [
        { name: "Add Staff", path: "/add-staff", requiredAccess: "/add-staff" },
        { name: "All Staff", path: "/stafflist", requiredAccess: "/stafflist" },
        { name: "Pending Staff", path: "/pendingstafflist", requiredAccess: "/pendingstafflist" },
        { name: "Staff Profile", path: "/staffprofile", requiredAccess: "/staffprofile", onlyFor: ["staff", "Manager"] }
      ],
    },
    {
      icon: <i className="ri-bike-line text-white"></i>,
      name: "Riders",
      dropdown: [
        { name: "Add Rider", path: "/add-rider", requiredAccess: "/add-rider" },
        { name: "All Riders", path: "/riderlist", requiredAccess: "/riderlist" },
        { name: "Pending Riders", path: "/pendingriderlist", requiredAccess: "/pendingriderlist" },
        { name: "Withdrawal List", path: "/withdrawallist", requiredAccess: "/withdrawallist" },
      ],
    },
    {
      icon: <i className="ri-group-line text-white"></i>,
      name: "Ambassadors",
      dropdown: [
        { name: "All Ambassadors", path: "/ambassadorlist", requiredAccess: "/ambassadorlist" },
        { name: "Pending Ambassadors", path: "/pendingambassadorlist", requiredAccess: "/pendingambassadorlist" },
        { name: "Ambassadors Withdrawal", path: "/ambassadorWithdrawalList", requiredAccess: "/ambassadorWithdrawalList" },
      ],
    },
    {
      icon: <i className="ri-price-tag-3-line text-white"></i>,
      name: "Ambassador Plans",
      dropdown: [
        { name: "Ambassador Plans", path: "/ambassadorplan", requiredAccess: "/ambassadorplan" },
        { name: "Ambassador Payments", path: "/ambassadorpayments", requiredAccess: "/ambassadorpayments" },
      ],
    },
    {
      icon: <i className="ri-store-2-line text-white"></i>,
      name: "Vendor Plan",
      dropdown: [
        { name: "Vendor Plan", path: "/vendorplan", requiredAccess: "/vendorplan" },
        { name: "Vendor Payments", path: "/vendorpayment", requiredAccess: "/vendorpayment" },
      ],
    },
    {
      icon: <i className="ri-checkbox-line text-white"></i>,
      name: "Approved",
      dropdown: [
        { name: "Approved Banner", path: "/pendingbanners", requiredAccess: "/pendingbanners" },
        { name: "Approved Riders", path: "/pendingriderlist", requiredAccess: "/pendingriderlist" },
        { name: "Approved Vendor", path: "/pendingvendorlist", requiredAccess: "/pendingvendorlist" },
        { name: "Approved Product", path: "/pendingproductlist", requiredAccess: "/pendingproductlist" },
        { name: "Approved Category", path: "/pendingcategory", requiredAccess: "/pendingcategory" },
        { name: "Approved Staff", path: "/pendingstafflist", requiredAccess: "/pendingstafflist" },
        { name: "Approved Ambassador", path: "/pendingambassadorlist", requiredAccess: "/pendingambassadorlist" },
      ],
    },
    {
      icon: <i className="ri-money-dollar-circle-fill text-white"></i>,
      name: "Amount",
      path: "/amount",
      requiredAccess: "/amount"
    },
    {
      icon: <i className="ri-wallet-line text-white"></i>,
      name: "Order Payment",
      path: "/orderpayments",
      requiredAccess: "/orderpayments"
    },
    {
      icon: <i className="ri-flag-2-line text-white"></i>,
      name: "Commission",
      path: "/comission",
      requiredAccess: "/comission"
    },
    {
      icon: <i className="ri-flag-2-line text-white"></i>,
      name: "Referral Reward",
      path: "/refrralrewards",
      requiredAccess: "/refrralrewards"
    },
    {
      icon: <i className="ri-money-cny-circle-line text-white"></i>,
      name: "Charges",
      path: "/charges",
      requiredAccess: "/charges"
    },
    {
      icon: <i className="ri-key-2-line text-white"></i>,
      name: "Credentials",
      path: "/credential",
      requiredAccess: "/credential"
    },
    {
      icon: <i className="ri-coupon-3-line text-white"></i>,
      name: "Coupons",
      path: "/coupon",
      requiredAccess: "/coupon"
    },
     {
      icon: <i className="ri-money-cny-circle-line text-white"></i>,
      name: "Reels",
      path: "/reels",
      requiredAccess: "/reels"
    },
    {
      icon: <i className="ri-settings-3-fill text-white"></i>,
      name: "Settings",
      path: "/setting",
      requiredAccess: "/setting"
    },
    {
      icon: <i className="ri-notification-3-line text-white"></i>,
      name: "Notifications",
      path: "/notifications",
      requiredAccess: "/notifications"
    },
    {
      icon: <i className="ri-question-line text-white"></i>,
      name: "Help List",
      path: "/helplist",
      requiredAccess: "/helplist"
    },
    {
      icon: <i className="ri-question-line text-white"></i>,
      name: "Website Enquiries",
      path: "/websiteenquiry",
      requiredAccess: "/websiteenquiry"
    },
    {
      icon: <i className="ri-wallet-3-line text-white"></i>,
      name: "Wallet",
      path: "/wallet",
      requiredAccess: "/wallet"
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  // ✅ Check if user has access to a specific path
  const hasAccessToPath = (path) => {
    if (!path) return true; // For items without path (like logout)

    // Admin has access to everything
    if (role === "admin") return true;

    // Check if path is in pagesAccess array
    return pagesAccess.includes(path);
  };

  // ✅ Check if dropdown item should be visible based on role
  const shouldShowDropdownItem = (item) => {
    // Check if item has role restriction
    if (item.onlyFor) {
      // If item has role restriction, check if current role is allowed
      return item.onlyFor.includes(role);
    }

    // For items without role restriction, check access
    // Admin can see all items except those restricted by onlyFor
    if (role === "admin") return true;

    return hasAccessToPath(item.requiredAccess || item.path);
  };

  // ✅ Check if user has access to any item in dropdown
  const hasAccessToDropdown = (dropdownItems) => {
    // Admin has access to everything except restricted items
    if (role === "admin") {
      return dropdownItems.some(item => shouldShowDropdownItem(item));
    }

    return dropdownItems.some(item => shouldShowDropdownItem(item));
  };

  // ✅ Get filtered dropdown items based on access and role
  const getFilteredDropdown = (dropdownItems) => {
    // Filter items based on access and role
    return dropdownItems.filter(item => shouldShowDropdownItem(item));
  };

  // ✅ Check if item should be visible
  const shouldShowItem = (item) => {
    // Always show logout
    if (item.action) return true;

    // For dropdown items
    if (item.dropdown) {
      return hasAccessToDropdown(item.dropdown) && getFilteredDropdown(item.dropdown).length > 0;
    }

    // For single path items
    if (item.path) {
      return hasAccessToPath(item.requiredAccess || item.path);
    }

    return false;
  };

  // ✅ Filter elements based on shouldShowItem function
  const filteredElements = elements.filter(shouldShowItem);

  // ✅ Get role display name
  const getRoleDisplayName = () => {
    switch (role) {
      case "admin": return "Admin Panel";
      case "subadmin": return "Sub-Admin Panel";
      case "staff": return "Staff Panel";
      case "Manager": return "Manager Panel";
      default: return "Dashboard";
    }
  };

  // ✅ Get role-based color
  const getRoleColor = () => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "subadmin": return "bg-blue-500";
      case "staff": return "bg-green-500";
      case "Manager": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  // ✅ Get role-based text color
  const getRoleTextColor = () => {
    switch (role) {
      case "admin": return "text-red-100";
      case "subadmin": return "text-blue-100";
      case "staff": return "text-green-100";
      case "Manager": return "text-purple-100";
      default: return "text-gray-100";
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${isMobile
        ? isCollapsed
          ? "w-0"
          : "w-64"
        : isCollapsed
          ? "w-16"
          : "w-64"
        } h-screen overflow-y-auto no-scrollbar flex flex-col bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white`}
    >
      {/* Header */}
      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl border-b border-gray-700 bg-[#0f172a]">
        {isCollapsed && !isMobile ? (
          <i className="ri-shield-user-line text-2xl"></i>
        ) : (
          <span>{getRoleDisplayName()}</span>
        )}
      </div>

      {/* User Info (Only show when expanded) */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${getRoleColor()} rounded-full flex items-center justify-center`}>
              <i className={`ri-user-fill ${getRoleTextColor()} text-sm`}></i>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {userName || (role === "admin" ? "Administrator" : role === "subadmin" ? "Sub-Admin" : role)}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userEmail || `${role}@vegiffy.com`}
              </p>
              {userId && (
                <p className="text-xs text-gray-500 mt-1">ID: {userId.substring(0, 8)}...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`flex flex-col ${isCollapsed && !isMobile ? "items-center" : "px-2"
          } mt-4 space-y-1`}
      >
        {filteredElements.map((item, idx) => (
          <div key={idx} className="w-full">
            {item.dropdown ? (
              <>
                <div
                  onClick={() => toggleDropdown(item.name)}
                  className={`flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#334155] text-white transition ${location.pathname === item.path ? 'bg-[#334155]' : ''
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"
                      }`}
                  >
                    {item.name}
                  </span>
                  {!isCollapsed && (
                    <FaChevronDown
                      className={`ml-auto transition-transform duration-200 text-xs ${openDropdown === item.name ? "rotate-180" : "rotate-0"
                        }`}
                    />
                  )}
                </div>
                {!isCollapsed && openDropdown === item.name && (
                  <div className="ml-8 text-sm space-y-1 border-l border-gray-600 pl-2">
                    {getFilteredDropdown(item.dropdown).map((subItem, subIdx) => (
                      <Link
                        key={subIdx}
                        to={subItem.path}
                        onClick={() => setOpenDropdown(null)}
                        className={`flex items-center space-x-2 py-2 px-3 rounded transition no-underline hover:no-underline focus:no-underline ${location.pathname === subItem.path
                          ? 'bg-[#334155] text-white'
                          : 'text-gray-300 hover:text-white hover:bg-[#334155]'
                          }`}
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="text-xs">•</span>
                        <span className="text-sm">{subItem.name}</span>
                        {/* Role badge for Staff Profile */}
                        {subItem.name === "Staff Profile" && role === "admin" && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">
                            Not for Admin
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path || "#"}
                onClick={item.action || undefined}
                className={`flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#334155] text-white transition no-underline hover:no-underline ${location.pathname === item.path ? 'bg-[#334155]' : ''
                  }`}
                style={{ textDecoration: 'none' }}
              >
                <span className="text-lg">{item.icon}</span>
                <span
                  className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"
                    }`}
                >
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Access Info (Show for sub-admin and staff) */}
      {!isCollapsed && (role === "subadmin" || role === "staff" || role === "Manager") && (
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <div className="flex items-center mb-1">
              <i className="ri-shield-keyhole-line mr-2"></i>
              <span>Access Permissions</span>
            </div>
            <div className="text-xs mt-1">
              <span className="text-green-400">{pagesAccess.length}</span> accessible pages
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && !isCollapsed && (
        <div className="mt-auto p-4 text-xs bg-gray-800 text-gray-400">
          <div>Role: {role}</div>
          <div>User ID: {userId}</div>
          <div>Access Count: {pagesAccess.length}</div>
          <div>Visible Items: {filteredElements.length}</div>
          <div className="mt-2">
            <span className="text-yellow-400">Accessible Paths:</span>
            <div className="text-xs mt-1 max-h-20 overflow-y-auto">
              {pagesAccess.map((path, i) => (
                <div key={i} className="text-gray-300 truncate">{path}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;