import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="min-h-screen w-full bg-[#EFF0F1] overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobile={isMobile} 
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          isMobile ? 'ml-0 w-full' : isCollapsed ? 'ml-20 w-[calc(100%-80px)]' : 'ml-64 w-[calc(100%-256px)]'
        }`}
      >
        {/* Navbar */}
        <Navbar 
          setIsCollapsed={setIsCollapsed} 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
        />
        
        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
          <div className="w-full max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}