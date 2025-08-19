import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://credenhealth.onrender.com/api/admin/logout", {}, { withCredentials: true });
      localStorage.removeItem("authToken");
      alert("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const sections = [
    {
      icon: <i className="ri-dashboard-fill text-white"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-3-fill text-white"></i>,
      name: "Users",
      dropdown: [
        { name: "All Users", path: "/users" },
        { name: "Active Users", path: "/active-users" },
      ],
    },
    {
      icon: <i className="ri-folders-fill text-white"></i>,
      name: "Categories",
      dropdown: [
        { name: "Create Category", path: "/categoryform" },
        { name: "All Categories", path: "/categorylist" },
      ],
    },
    {
      icon: <i className="ri-truck-fill text-white"></i>,
      name: "Orders",
      dropdown: [
        { name: "All Orders", path: "/allorders" },
        { name: "Pending Orders", path: "/pendingorders" },
        { name: "Completed Orders", path: "/completedorders" },
        { name: "Cancelled Orders", path: "/cancelledorders" },
      ],
    },
    {
      icon: <i className="ri-image-fill text-white"></i>,
      name: "Banners",
      dropdown: [
        { name: "Create Banner", path: "/create-banner" },
        { name: "All Banners", path: "/banner-list" },
      ],
    },
    {
      icon: <i className="ri-store-fill text-white"></i>,
      name: "Vendors",
      dropdown: [
        { name: "Add Vendor", path: "/add-vendor" },
        { name: "All Vendors", path: "/vendorlist" },
      ],
    },
    {
      icon: <i className="ri-settings-3-fill text-white"></i>,
      name: "Settings",
      path: "/settings",
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
        } h-screen overflow-y-auto no-scrollbar flex flex-col bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white`}
    >
      {/* Header */}
      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl border-b border-gray-700 bg-[#0f172a]">
        {isCollapsed && !isMobile ? (
          <i className="ri-shield-user-line text-2xl"></i>
        ) : (
          <span>Admin Panel</span>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex flex-col ${isCollapsed && !isMobile ? "items-center" : "px-2"} mt-4 space-y-1`}>
        {sections.map((item, idx) => (
          <div key={idx} className="w-full">
            {item.dropdown ? (
              <>
                <div
                  onClick={() => toggleDropdown(item.name)}
                  className="flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#334155] hover:text-[#22c55e] transition"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>{item.name}</span>
                  {!isCollapsed && (
                    <FaChevronDown
                      className={`ml-auto transition-transform duration-200 text-xs ${openDropdown === item.name ? "rotate-180" : "rotate-0"
                        }`}
                    />
                  )}
                </div>
                {!isCollapsed && openDropdown === item.name && (
                  <ul className="ml-8 text-sm space-y-1 text-gray-300">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center space-x-2 py-2 px-2 hover:text-[#22c55e] hover:underline"
                        >
                          <span className="text-[#22c55e]">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                onClick={item.action ? item.action : null}
                className="flex items-center py-3 px-3 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#334155] hover:text-[#22c55e] transition"
              >
                <span className="text-lg">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
