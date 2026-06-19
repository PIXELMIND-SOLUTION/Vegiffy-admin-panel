import React, { useState, useEffect } from "react";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const AmbassadorSidebar = ({ isCollapsed, isMobile, toggleSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [ambassadorFullName, setAmbassadorFullName] = useState("");
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planDetails, setPlanDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fullName = sessionStorage.getItem('ambassadorFullName');
    if (fullName) {
      setAmbassadorFullName(fullName);
    }
  }, []);

  useEffect(() => {
    checkActivePlan();
  }, [location.pathname]);

  const checkActivePlan = async () => {
    try {
      setPlanLoading(true);
      const ambassadorId = sessionStorage.getItem("ambassadorId");
      const token = sessionStorage.getItem("authToken");

      if (!ambassadorId || !token) {
        setHasActivePlan(false);
        setPlanLoading(false);
        return;
      }

      const exemptPaths = [
        "/ambassador/dashboard",
        "/ambassador/payments", 
        "/ambassador/myplans",
        "/ambassador-login",
        "/ambassador/register",
        "/ambassador/accounts"
      ];

      if (exemptPaths.includes(location.pathname)) {
        setPlanLoading(false);
        return;
      }

      const response = await axios.get(
        `https://api.vegiffy.in/api/ambsdor/myplan/${ambassadorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const now = new Date();
        
        const plansWithDetails = response.data.data.map((plan) => {
          let expiryDate;
          const purchaseDate = new Date(plan.planPurchaseDate);
          const validityDays = plan.planId?.validity || 730;
          
          if (plan.expiryDate) {
            expiryDate = new Date(plan.expiryDate);
            const expiryYear = expiryDate.getFullYear();
            const currentYear = now.getFullYear();
            
            if (expiryYear > currentYear + 10) {
              expiryDate = new Date(purchaseDate);
              expiryDate.setDate(expiryDate.getDate() + validityDays);
            }
          } else {
            expiryDate = new Date(purchaseDate);
            expiryDate.setDate(expiryDate.getDate() + validityDays);
          }
          
          const isExpired = expiryDate <= now;
          const isActivePlan = plan.isPurchased === true && 
                               plan.paymentStatus === 'completed' && 
                               !isExpired;
          
          return {
            ...plan,
            calculatedExpiryDate: expiryDate,
            isActivePlan
          };
        });
        
        const activePlan = plansWithDetails.find(plan => plan.isActivePlan === true);
        
        if (activePlan) {
          setHasActivePlan(true);
          setPlanDetails(activePlan);
          setShowPlanPopup(false);
        } else {
          setHasActivePlan(false);
          if (location.pathname !== "/ambassador/payments" && location.pathname !== "/ambassador/myplans") {
            setShowPlanPopup(true);
          }
        }
      } else {
        setHasActivePlan(false);
        if (location.pathname !== "/ambassador/payments" && location.pathname !== "/ambassador/myplans") {
          setShowPlanPopup(true);
        }
      }
    } catch (error) {
      setHasActivePlan(false);
    } finally {
      setPlanLoading(false);
    }
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("ambassadorToken");
      sessionStorage.removeItem("ambassadorId");
      sessionStorage.removeItem("ambassadorData");
      sessionStorage.removeItem("ambassadorFullName");

      alert("Logout successful");
      window.location.href = "/ambassador-login";
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  const handleMenuClick = (itemPath, itemAction) => {
    if (itemAction) {
      itemAction();
      return;
    }

    if (isMobile && toggleSidebar) {
      toggleSidebar();
    }

    const protectedRoutes = [
      "/ambassador/profile",
      "/ambassador/orders",
      "/ambassador/orderanalytics",
      "/ambassador/users",
      "/ambassador/vendors",
      "/ambassador/ambassadors",
      "/ambassador/commission",
      "/ambassador/topambassadors",
      "/ambassador/reffralcode",
      "/ambassador/wallet",
      "/ambassador/support",
      "/ambassador/notifications"
    ];

    const exemptRoutes = [
      "/ambassador/dashboard",
      "/ambassador/payments",
      "/ambassador/myplans",
      "/ambassador/accounts"
    ];

    if (exemptRoutes.includes(itemPath)) {
      navigate(itemPath);
      return;
    }

    if (protectedRoutes.includes(itemPath) && hasActivePlan === false) {
      setShowPlanPopup(true);
      return;
    }

    navigate(itemPath);
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const currentYear = now.getFullYear();
    const expiryYear = expiry.getFullYear();
    
    if (expiryYear > currentYear + 10 && planDetails?.planPurchaseDate) {
      const purchaseDate = new Date(planDetails.planPurchaseDate);
      const validityDays = planDetails.planId?.validity || 730;
      const correctExpiry = new Date(purchaseDate);
      correctExpiry.setDate(correctExpiry.getDate() + validityDays);
      return Math.max(0, Math.ceil((correctExpiry - now) / (1000 * 60 * 60 * 24)));
    }
    
    const diffTime = expiry - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getValidityText = (plan) => {
    if (!plan?.planId?.validity) return "730 days";
    const days = plan.planId.validity;
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;
    
    let text = '';
    if (years > 0) text += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) text += `${months} month${months > 1 ? 's' : ''} `;
    if (remainingDays > 0 && years === 0) text += `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    
    return text.trim() || `${days} days`;
  };

  const PlanRequiredPopup = () => {
    if (!showPlanPopup) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full animate-popupIn">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <i className="ri-lock-line text-white"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Plan Required</h3>
                  <p className="text-gray-500 text-xs">Unlock all features</p>
                </div>
              </div>
              <button
                onClick={() => setShowPlanPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-gray-600 text-sm mb-3">
              You need to purchase an ambassador plan to access this section.
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <i className="ri-money-rupee-circle-line text-green-500 mr-2"></i>
                <span className="text-gray-700 text-xs">Earn Commissions</span>
              </div>
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <i className="ri-user-line text-green-500 mr-2"></i>
                <span className="text-gray-700 text-xs">Manage Users</span>
              </div>
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <i className="ri-line-chart-line text-green-500 mr-2"></i>
                <span className="text-gray-700 text-xs">Analytics</span>
              </div>
              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <i className="ri-megaphone-line text-green-500 mr-2"></i>
                <span className="text-gray-700 text-xs">Marketing Tools</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPlanPopup(false);
                  navigate("/ambassador/payments");
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 text-sm"
              >
                Buy Plan
              </button>
              <button
                onClick={() => {
                  setShowPlanPopup(false);
                  navigate("/ambassador/myplans");
                }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PlanStatusIndicator = () => {
    if (isCollapsed && !isMobile) return null;

    if (planLoading) {
      return (
        <div className="px-3 py-1.5 mb-3 mx-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-blue-500 text-xs">Checking...</span>
          </div>
        </div>
      );
    }

    if (hasActivePlan === true && planDetails) {
      const daysRemaining = getDaysRemaining(planDetails.expiryDate);
      const validityText = getValidityText(planDetails);

      return (
        <div className="px-3 py-1.5 mb-3 mx-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="ri-checkbox-circle-fill text-green-500 mr-2"></i>
              <div>
                <p className="text-green-700 text-xs font-medium">
                  {planDetails.planId?.name || 'Active Plan'}
                </p>
                <p className="text-green-600 text-xs">
                  {daysRemaining} days left • {validityText}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/ambassador/myplans")}
              className="text-green-600 hover:text-green-800 text-xs font-medium"
            >
              View
            </button>
          </div>
        </div>
      );
    }

    if (hasActivePlan === false) {
      return (
        <div className="px-3 py-1.5 mb-3 mx-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="ri-alert-line text-yellow-500 mr-2"></i>
              <div>
                <p className="text-yellow-700 text-xs font-medium">No Active Plan</p>
                <p className="text-yellow-600 text-xs">Purchase required</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/ambassador/payments")}
              className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
            >
              Buy
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const ambassadorElements = [
    {
      icon: <i className="ri-dashboard-fill text-white"></i>,
      name: "Dashboard",
      path: "/ambassador/dashboard",
    },
    {
      icon: <i className="ri-user-3-fill text-white"></i>,
      name: "Profile",
      dropdown: [
        { name: "My Profile", path: "/ambassador/profile" },
      ],
    },
    {
      icon: <i className="ri-shopping-bag-3-fill text-white"></i>,
      name: "Orders",
      dropdown: [
        { name: "All Orders", path: "/ambassador/orders" },
        { name: "Order Analytics", path: "/ambassador/orderanalytics" },
      ],
    },
    {
      icon: <i className="ri-team-fill text-white"></i>,
      name: "Users",
      dropdown: [
        { name: "My Users", path: "/ambassador/users" },
      ],
    },
    {
      icon: <i className="ri-store-2-fill text-white"></i>,
      name: "Vendors",
      dropdown: [
        { name: "My Vendors", path: "/ambassador/vendors" },
      ],
    },
    {
      icon: <i className="ri-team-fill text-white"></i>,
      name: "Ambassadors",
      dropdown: [
        { name: "My Ambassadors", path: "/ambassador/ambassadors" },
      ],
    },
    {
      icon: <i className="ri-wallet-3-fill text-white"></i>,
      name: "Pay Joining Fee",
      dropdown: [
        { name: "Pay", path: "/ambassador/payments" },
        { name: "My Paid Plan", path: "/ambassador/myplans" },
      ],
    },
    {
      icon: <i className="ri-line-chart-fill text-white"></i>,
      name: "Performance",
      dropdown: [
        { name: "Commission Report", path: "/ambassador/commission" },
        { name: "Leaderboard", path: "/ambassador/topambassadors" },
      ],
    },
    {
      icon: <i className="ri-share-fill text-white"></i>,
      name: "Marketing",
      dropdown: [
        { name: "Promo Codes", path: "/ambassador/reffralcode" },
      ],
    },
    {
      icon: <i className="ri-wallet-3-fill text-white"></i>,
      name: "Wallet",
      path: "/ambassador/wallet",
    },
    {
      icon: <i className="ri-bank-fill text-white"></i>,
      name: "Account",
      path: "/ambassador/accounts",
    },
    {
      icon: <i className="ri-notification-3-fill text-white"></i>,
      name: "Notifications",
      path: "/ambassador/notifications",
    },
    {
      icon: <i className="ri-customer-service-2-fill text-white"></i>,
      name: "Support",
      path: "/ambassador/support",
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  const AmbassadorProfileSection = () => {
    if (isCollapsed && !isMobile) return null;

    return (
      <div className="p-3 border-b border-purple-300/30 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
            <i className="ri-user-3-fill text-white text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-semibold text-xs truncate">
              {ambassadorFullName || "Ambassador"}
            </p>
            <p className="text-purple-600 text-xs truncate font-medium">
              VEGIFFY Ambassador
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (isMobile && isCollapsed) {
    return null;
  }

  return (
    <>
      <PlanRequiredPopup />

      <div
        className={`transition-all duration-300 relative ${
          isMobile 
            ? "fixed left-0 top-0 z-50 w-64 h-screen shadow-2xl" 
            : isCollapsed 
              ? "w-16" 
              : "w-64"
        } h-screen flex flex-col bg-gradient-to-b from-purple-50 to-pink-50 text-gray-800 border-r border-purple-200 overflow-hidden`}
      >
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute top-3 right-3 z-50 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <FaTimes className="text-gray-600" />
          </button>
        )}

        <div className="sticky top-0 p-3 font-bold text-gray-800 flex justify-center text-lg border-b border-purple-300/30 bg-white/90 backdrop-blur-sm z-30 shrink-0">
          {isCollapsed && !isMobile ? (
            <i className="ri-user-star-line text-xl text-purple-600"></i>
          ) : (
            <div className="flex items-center gap-2">
              <i className="ri-user-star-line text-purple-600"></i>
              <span className="text-sm">VEGIFFY Ambassador</span>
            </div>
          )}
        </div>

        <AmbassadorProfileSection />

        {!isCollapsed && <PlanStatusIndicator />}

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <nav
            className={`flex flex-col ${isCollapsed && !isMobile ? "items-center" : "px-2"} py-3 space-y-1`}
          >
            {ambassadorElements.map((item, idx) => (
              <div key={idx} className="w-full">
                {item.dropdown ? (
                  <>
                    <div
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center py-2.5 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                          : "bg-white/80 hover:bg-white text-gray-700 hover:text-purple-600 border border-purple-200/50 hover:border-purple-300 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span
                        className={`ml-2 ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                      >
                        {item.name}
                      </span>
                      {!isCollapsed && (
                        <FaChevronDown
                          className={`ml-auto transition-transform duration-200 text-xs ${
                            openDropdown === item.name ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      )}
                    </div>
                    {!isCollapsed && openDropdown === item.name && (
                      <ul className="ml-3 mt-1 text-xs space-y-0.5 bg-white/90 rounded-lg p-1.5 border border-purple-200/50 shadow-sm">
                        {item.dropdown.map((subItem, subIdx) => (
                          <li key={subIdx}>
                            <button
                              onClick={() => handleMenuClick(subItem.path)}
                              className={`w-full text-left flex items-center space-x-1.5 py-1.5 px-2 rounded-md transition-all duration-200 ${
                                location.pathname === subItem.path
                                  ? "bg-purple-50 text-purple-700 font-medium"
                                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                              }`}
                            >
                              <span className="text-purple-400 text-xs">›</span>
                              <span>{subItem.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleMenuClick(item.path, item.action)}
                    className={`w-full flex items-center py-2.5 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-white/80 hover:bg-white text-gray-700 hover:text-purple-600 border border-purple-200/50 hover:border-purple-300 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span
                      className={`ml-2 ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                    >
                      {item.name}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {!isCollapsed && (
          <div className="sticky bottom-0 p-3 border-t border-purple-300/30 bg-white/90 backdrop-blur-sm shrink-0">
            <div className="text-center">
              <p className="text-purple-600 text-xs font-semibold mb-1">
                Need Help?
              </p>
              <p className="text-gray-500 text-xs mb-2">
                vegiffyambassador@vegiffy.in
              </p>
              <div className="flex justify-center space-x-2">
                <button className="text-gray-400 hover:text-purple-500 transition-all duration-200 hover:scale-110">
                  <i className="ri-question-line text-sm"></i>
                </button>
                <button className="text-gray-400 hover:text-purple-500 transition-all duration-200 hover:scale-110">
                  <i className="ri-customer-service-2-line text-sm"></i>
                </button>
                <button className="text-gray-400 hover:text-purple-500 transition-all duration-200 hover:scale-110">
                  <i className="ri-information-line text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes popupIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-popupIn {
            animation: popupIn 0.2s ease-out;
          }
          
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.5);
          }

          button {
            background: none;
            border: none;
            cursor: pointer;
            font-family: inherit;
            padding: 0;
          }
        `}</style>
      </div>
    </>
  );
};

export default AmbassadorSidebar;