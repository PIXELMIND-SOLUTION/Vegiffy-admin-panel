import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile, setIsCollapsed }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [pagesAccess, setPagesAccess] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const location = useLocation();

  // Load data from sessionStorage
  useEffect(() => {
    const storedPagesAccess = JSON.parse(sessionStorage.getItem("access") || sessionStorage.getItem("pagesAccess") || "[]");
    const storedAdminId = sessionStorage.getItem("adminId");
    const storedStaffId = sessionStorage.getItem("staffId");
    const storedRole = sessionStorage.getItem("role");
    const storedName = sessionStorage.getItem("adminName") || "";
    const storedEmail = sessionStorage.getItem("adminEmail") || "";

    if (!storedRole) {
      window.location.href = "/";
      return;
    }

    setRole(storedRole);
    setUserName(storedName);
    setUserEmail(storedEmail);

    if (storedRole === "subadmin") {
      setPagesAccess(storedPagesAccess);
      setUserId(storedAdminId || "subadmin");
    } else if (
      storedRole === "CEO" ||
      storedRole === "General Manager" ||
      storedRole === "HR Manager" ||
      storedRole === "HR Executive" ||
      storedRole === "Technical Team Lead" ||
      storedRole === "Technical Team Member" ||
      storedRole === "Testing Team Lead" ||
      storedRole === "Testing Team Member" ||
      storedRole === "Accountant" ||
      storedRole === "Senior Accountant" ||
      storedRole === "CA (Chartered Accountant)" ||
      storedRole === "Finance Manager" ||
      storedRole === "Operations Manager" ||
      storedRole === "Marketing Manager" ||
      storedRole === "Sales Manager" ||
      storedRole === "IT Manager" ||
      storedRole === "Admin Staff" ||
      storedRole === "Support Staff" ||
      storedRole === "Other"
    ) {
      setPagesAccess(storedPagesAccess);
      setUserId(storedStaffId || "staff");
    } else if (storedRole === "admin") {
      setPagesAccess([]);
      setUserId(storedAdminId || "admin");
    }
  }, []);

  const handleLogout = () => {
    const role = sessionStorage.getItem("role");
    sessionStorage.clear();

    if (role === "ambassador") {
      window.location.replace("/ambassador-login");
    } else if (
      role === "staff" ||
      role === "CEO" ||
      role === "Manager" ||
      role === "General Manager" ||
      role === "HR Manager" ||
      role === "HR Executive" ||
      role === "Technical Team Lead" ||
      role === "Technical Team Member" ||
      role === "Testing Team Lead" ||
      role === "Testing Team Member" ||
      role === "Accountant" ||
      role === "Senior Accountant" ||
      role === "CA (Chartered Accountant)" ||
      role === "Finance Manager" ||
      role === "Operations Manager" ||
      role === "Marketing Manager" ||
      role === "Sales Manager" ||
      role === "IT Manager" ||
      role === "Admin Staff" ||
      role === "Support Staff" ||
      role === "Other"
    ) {
      window.location.replace("/staff-login");
    } else {
      window.location.replace("/");
    }
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Your full menu - keep as is
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

  const hasAccessToPath = (path) => {
    if (!path) return true;
    if (role === "admin") return true;
    return pagesAccess.includes(path);
  };

  const shouldShowDropdownItem = (item) => {
    if (item.onlyFor) {
      return item.onlyFor.includes(role);
    }
    if (role === "admin") return true;
    return hasAccessToPath(item.requiredAccess || item.path);
  };

  const hasAccessToDropdown = (dropdownItems) => {
    if (role === "admin") {
      return dropdownItems.some(item => shouldShowDropdownItem(item));
    }
    return dropdownItems.some(item => shouldShowDropdownItem(item));
  };

  const getFilteredDropdown = (dropdownItems) => {
    return dropdownItems.filter(item => shouldShowDropdownItem(item));
  };

  const shouldShowItem = (item) => {
    if (item.action) return true;
    if (item.dropdown) {
      return hasAccessToDropdown(item.dropdown) && getFilteredDropdown(item.dropdown).length > 0;
    }
    if (item.path) {
      return hasAccessToPath(item.requiredAccess || item.path);
    }
    return false;
  };

  const filteredElements = elements.filter(shouldShowItem);

  const getRoleDisplayName = () => {
    switch (role) {
      case "admin": return "Admin Panel";
      case "subadmin": return "Sub-Admin Panel";
      case "staff": return "Staff Panel";
      case "Manager": return "Manager Panel";
      default: return "Dashboard";
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "subadmin": return "bg-blue-500";
      case "staff": return "bg-green-500";
      case "Manager": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getRoleTextColor = () => {
    switch (role) {
      case "admin": return "text-red-100";
      case "subadmin": return "text-blue-100";
      case "staff": return "text-green-100";
      case "Manager": return "text-purple-100";
      default: return "text-gray-100";
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && !isCollapsed) {
        const sidebar = document.getElementById('sidebar-container');
        if (sidebar && !sidebar.contains(e.target)) {
          setIsCollapsed(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isCollapsed, setIsCollapsed]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar-container"
        className={`fixed top-0 left-0 h-full z-50 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col overflow-hidden
          ${isMobile ? 'w-72' : (isCollapsed ? 'w-20' : 'w-64')}
          ${isMobile ? (isCollapsed ? '-translate-x-full' : 'translate-x-0') : 'translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 font-bold text-white flex items-center justify-center text-xl border-b border-gray-700 bg-[#0f172a] min-h-[64px]">
          {isCollapsed && !isMobile ? (
            <i className="ri-shield-user-line text-2xl"></i>
          ) : (
            <span className="text-sm sm:text-base md:text-lg">{getRoleDisplayName()}</span>
          )}
          {isMobile && !isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute right-4 p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          )}
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getRoleColor()} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`ri-user-fill ${getRoleTextColor()} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userName || (role === "admin" ? "Administrator" : role === "subadmin" ? "Sub-Admin" : role)}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {userEmail || `${role}@vegiffy.com`}
                </p>
                {userId && (
                  <p className="text-xs text-gray-500 mt-1 truncate">ID: {userId.substring(0, 8)}...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${isCollapsed && !isMobile ? "px-2" : "px-2"} mt-2 space-y-1 pb-4`}>
          {filteredElements.map((item, idx) => (
            <div key={idx} className="w-full">
              {item.dropdown ? (
                <>
                  <div
                    onClick={() => toggleDropdown(item.name)}
                    className={`flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#334155] text-white transition-all duration-200
                      ${location.pathname === item.path ? 'bg-[#334155]' : ''}
                      ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"} flex-1 truncate`}>
                      {item.name}
                    </span>
                    {!isCollapsed && (
                      <FaChevronDown
                        className={`ml-auto transition-transform duration-200 text-xs flex-shrink-0 ${openDropdown === item.name ? "rotate-180" : "rotate-0"}`}
                      />
                    )}
                  </div>
                  {!isCollapsed && openDropdown === item.name && (
                    <div className="ml-8 text-sm space-y-1 border-l border-gray-600 pl-2 max-h-48 overflow-y-auto">
                      {getFilteredDropdown(item.dropdown).map((subItem, subIdx) => (
                        <Link
                          key={subIdx}
                          to={subItem.path}
                          onClick={() => {
                            setOpenDropdown(null);
                            if (isMobile) setIsCollapsed(true);
                          }}
                          className={`flex items-center space-x-2 py-2 px-3 rounded transition-all duration-200 no-underline hover:no-underline
                            ${location.pathname === subItem.path
                              ? 'bg-[#334155] text-white'
                              : 'text-gray-300 hover:text-white hover:bg-[#334155]'
                            }`}
                          style={{ textDecoration: 'none' }}
                        >
                          <span className="text-xs flex-shrink-0">•</span>
                          <span className="text-sm truncate">{subItem.name}</span>
                          {subItem.name === "Staff Profile" && role === "admin" && (
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500 text-white flex-shrink-0">
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
                  onClick={(e) => {
                    if (item.action) {
                      e.preventDefault();
                      item.action();
                    }
                    if (isMobile) setIsCollapsed(true);
                  }}
                  className={`flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#334155] text-white transition-all duration-200 no-underline hover:no-underline
                    ${location.pathname === item.path ? 'bg-[#334155]' : ''}
                    ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"} flex-1 truncate`}>
                    {item.name}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (role === "subadmin" || role === "staff" || role === "Manager") && (
          <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-[#0f172a]">
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

        {/* Version */}
        <div className={`flex-shrink-0 p-2 text-center text-xs text-gray-600 border-t border-gray-700 ${isCollapsed && !isMobile ? 'hidden' : 'block'} bg-[#0f172a]`}>
          v2.0.1
        </div>
      </div>
    </>
  );
};

export default Sidebar;