import React, { useState, useEffect } from "react";
import AmbassadorNavbar from "../Ambsdor/AmbassadorNavbar";
import AmbassadorSidebar from "../Ambsdor/AmbsdorSidebar";

const AmbassadorLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ambassadorData, setAmbassadorData] = useState(null);

  // ✅ Auto-set ambassador data on component mount (no login required)
  useEffect(() => {
    const defaultAmbassadorData = {
      fullName: 'Demo Ambassador',
      city: 'Mumbai',
      area: 'Andheri',
      rating: '4.8',
      totalEarnings: '12500',
      totalReferrals: '45',
      totalOrders: '89',
      activeUsers: '28',
      profileImage: null
    };

    // Set default data if not already set
    if (!localStorage.getItem('ambassadorData')) {
      localStorage.setItem('ambassadorData', JSON.stringify(defaultAmbassadorData));
      localStorage.setItem('ambassadorToken', 'demo-token');
      localStorage.setItem('ambassadorId', 'demo-123');
    }

    // Load ambassador data
    const storedData = localStorage.getItem('ambassadorData');
    if (storedData) {
      setAmbassadorData(JSON.parse(storedData));
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for the Ambassador */}
      <AmbassadorSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar for the Ambassador */}
        <AmbassadorNavbar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
        
        {/* Main content area */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AmbassadorLayout;