import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const DiagnosticSidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [diagnosticName, setDiagnosticName] = useState(""); // State to store diagnostic name

  // Fetch diagnostic name from localStorage
  useEffect(() => {
    const storedDiagnosticName = localStorage.getItem("diagnosticName");
    if (storedDiagnosticName) {
      setDiagnosticName(storedDiagnosticName);
    }
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://credenhealth.onrender.com/api/diagnostic/logout-diagnostic", {}, { withCredentials: true });

      localStorage.removeItem("authToken");
      localStorage.removeItem("diagnosticId");
      localStorage.removeItem("diagnosticName");

      alert("Logout successful");
      window.location.href = "/diagnostic-login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-home-2-fill text-purple-600"></i>,
      name: "Dashboard",
      path: "/diagnostic/dashboard",
    },
    {
      icon: <i className="ri-profile-fill text-purple-600"></i>,
      name: "Profile",
      dropdown: [
        { name: "View Profile", path: "/diagnostic/mydiagnostic" },
      ],
    },
    {
      icon: <i className="ri-calendar-check-fill text-purple-600"></i>,
      name: "Booking",
      dropdown: [
        { name: "All Bookings", path: "/diagnostic/mybookings" },
      ],
    },
    {
      icon: <i className="ri-logout-box-fill text-purple-600"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`text-white transition-all duration-300 ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
        } overflow-y-scroll no-scrollbar h-full flex flex-col bg-white`}
    >
      <div className="sticky top-0 p-4 font-bold bg-purple-600 flex justify-center text-xl text-white">
        <span>{diagnosticName ? `${diagnosticName}` : "Diagnostic Panel"}</span>
      </div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-bold text-sm text-[#464255] mx-4 rounded-lg hover:bg-[#D9F3EA] hover:text-[#00B074] duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"} font-bold`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${openDropdown === item.name ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm text-[#464255]">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-bold cursor-pointer hover:text-[#00B074] hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
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
                className="flex items-center py-3 px-4 font-bold text-sm text-[#464255] mx-4 rounded-lg hover:bg-[#D9F3EA] hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"} font-bold`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default DiagnosticSidebar;
