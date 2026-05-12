// import React from "react";
// import { Route, Routes } from "react-router-dom";

// // Import your components
// import AdminLayout from "./Layout/AdminLayout.jsx";
// import AmbassadorLayout from "./Layout/AmbassadorLayout.js";
// import Dashboard from "./Pages/Dashboard.jsx";
// import Settings from "./Pages/Setting";
// import StaffList from "./Pages/StaffList.js";
// import LoginPage from "./Pages/Login.js";
// import CategoryForm from "./Pages/CategoryForm.js";
// import CategoryList from "./Pages/CategoryList.js";
// import DocumentTable from "./Pages/DocumentTable.js";
// import CreateProductForm from "./Pages/CreateProduct.js";
// import ProductList from "./Pages/ProductList.js";
// import BookingList from "./Pages/BookingList.js";
// import PendingBookingList from "./Pages/PendingBookingList.js";
// import UserList from "./Pages/Userlist.js";
// import ActiveUserList from "./Pages/ActiveUserList.js";
// import AddVendorForm from "./Pages/AddVendorForm.js";
// import VendorList from "./Pages/VendorList.js";
// import BannerManager from "./Pages/BannerManager.js";
// import AddDeliveryBoy from "./Pages/AddDeliveryBoy.js";
// import DeliveryBoyList from "./Pages/DeliveryBoyList.js";
// import NotificationList from "./Pages/NotificationList.js";
// import ActiveDeliveryBoyList from "./Pages/ActiveDeliveryBoyList.js";
// import ActiveVendorList from "./Pages/ActiveVendorList.js";
// import AddStaff from "./Pages/AddStaff.js";
// import RiderWithdrawalList from "./Pages/RiderWithdrawalList.js";
// import CompletedBookingList from "./Pages/CompletedBookingList.js";
// import VendorWithdrawalList from "./Pages/VendorWithdrawalList.js";
// import StaffLoginPage from "./Pages/StaffLogin.js";
// import PendingBanner from "./Pages/PendingBanner.js";
// import PendingDeliveryBoyList from "./Pages/PendingDeliveryBoyList.js";
// import PendingVendorList from "./Pages/PendingVendorList.js";
// import CreateVeggyfyAmbassador from "./Pages/CreateVeggyfyAmbassador.js";

// // Ambassador Components
// import AmbassadorDashboard from "./Ambsdor/AmbassadorDashboard.js";
// import PendingProductList from "./Pages/PendingProductList.js";
// import PendingCategoryList from "./Pages/PendingCategoryList.js";
// import PendingStaffList from "./Pages/PendingStaffList.js";
// import AmbassadorList from "./Pages/AmbassadorList.js";
// import PendingAmbassadorList from "./Pages/PendingAmbassadorList.js";
// import AmbassadorLoginPage from "./Pages/AmbassadorLoginPage.js";
// import AmbassadorProfile from "./Pages/AmbassadorProfile.js";
// import AmbassadorUsers from "./Ambsdor/AmbassadorUsers.js";
// import AmbassadorOrders from "./Ambsdor/AmbassadorOrders.js";
// import AmbassadorAnalytics from "./Ambsdor/AmbassadorAnalytics.js";
// import AmbassadorCommissionReport from "./Ambsdor/AmbassadorCommissionReport.js";
// import TopAmbassadors from "./Ambsdor/TopAmbassadors.js";
// import AmbassadorReferralPage from "./Ambsdor/AmbassadorReferralPage.js";
// import AmbassadorWallet from "./Ambsdor/AmbassadorWallet.js"
// import AmbassadorWithdrawalList from "./Pages/AmbassadorWithdrawalList.js"
// import AmountManagement from "./Pages/AmountManagement.js";
// import AmbassadorVendorList from "./Ambsdor/AmbassadorVendors.js";
// import AmbassadorAmbassadorList from "./Ambsdor/AmbassadorAmbassadorList.js";
// import AmbassadorJoiningFee from "./Ambsdor/AmbassadorJoiningFee.js";
// import AmbassadorPlanManagement from "./Pages/AmbassadorPlanManagement.js";
// import AmbassadorMyPlans from "./Ambsdor/AmbassadorMyPlans.js";
// import AmbassadorSupport from "./Ambsdor/AmbassadorSupport.js";
// import AmbassadorPayments from "./Pages/AmbassadorPayments.js";
// import VendorPlanManagement from "./Pages/VendorPlanManagement.js";
// import VendorPayments from "./Pages/VendorPayments.js";
// import HelpList from "./Pages/HelpList.js";
// import RegisterPage from "./Pages/RegisterPage.js";
// import CommissionManagement from "./Pages/CommissionManagement.js";
// import ChargesManagement from "./Pages/ChargesManagement.js";
// import RestaurantOrders from "./Pages/RestaurantOrders.js";
// import WebsiteEnquiries from "./Pages/WebsiteEnquiries.js";
// import VendorOrders from "./Pages/VendorOrders.js";
// import OrderPayments from "./Pages/OrderPayments.js";
// import StaffProfile from "./Pages/StaffProfile.js";
// import AdminWallet from "./Pages/AdminWallet.js";
// import AmbassadorAccountManagement from "./Ambsdor/AmbassadorAccountManagement.js";
// import ReferralRewardManagement from "./Pages/ReferralRewardManagement.js";
// import CredentialManager from "./Pages/CredentialManager.js";
// import CouponManager from "./Pages/CouponManager.js";
// import ReelsManagementPage from "./Pages/ReelsManagementPage.js";
// import AmbassadorNotifications from "./Ambsdor/AmbassadorNotifications.js";

// function App() {
//   return (
//     <Routes>
//       {/* Login pages rendered outside layouts */}
//       <Route path="/" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />
//       <Route path="/staff-login" element={<StaffLoginPage />} />
//       <Route path="/vegiffy-ambassador" element={<CreateVeggyfyAmbassador />} />
//       <Route path="/ambassador-login" element={<AmbassadorLoginPage />} />

//       {/* Ambassador Routes - Direct access without login */}
//       <Route
//         path="/ambassador/*"
//         element={
//           <AmbassadorLayout>
//             <Routes>
//               <Route path="dashboard" element={<AmbassadorDashboard />} />
//               <Route path="profile" element={<AmbassadorProfile />} />
//               <Route path="users" element={<AmbassadorUsers />} />
//               <Route path="orders" element={<AmbassadorOrders />} />
//               <Route path="orderanalytics" element={<AmbassadorAnalytics />} />
//               <Route path="commission" element={<AmbassadorCommissionReport />} />
//               <Route path="topambassadors" element={<TopAmbassadors />} />
//               <Route path="reffralcode" element={<AmbassadorReferralPage />} />
//               <Route path="wallet" element={<AmbassadorWallet/>} />
//               <Route path="vendors" element={<AmbassadorVendorList />} />
//                <Route path="ambassadors" element={<AmbassadorAmbassadorList />} />
//               <Route path="payments" element={<AmbassadorJoiningFee />} />
//               <Route path="myplans" element={<AmbassadorMyPlans />} />
//               <Route path="vendorplan" element={<VendorPlanManagement />} />
//               <Route path="support" element={<AmbassadorSupport />} />
//               <Route path="accounts" element={<AmbassadorAccountManagement />} />
//               <Route path="notifications" element={<AmbassadorNotifications />} />
//               {/* Default ambassador route */}
//               <Route path="" element={<AmbassadorDashboard />} />
//             </Routes>
//           </AmbassadorLayout>
//         }
//       />

//       {/* All other routes inside AdminLayout */}
//       <Route
//         path="/*"
//         element={
//           <AdminLayout>
//             <Routes>
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/setting" element={<Settings />} />
//               <Route path="/categoryform" element={<CategoryForm />} />
//               <Route path="/categorylist" element={<CategoryList />} />
//               <Route path="/add-product" element={<CreateProductForm />} />
//               <Route path="/productlist" element={<ProductList />} />
//               <Route path="/allorders" element={<BookingList />} />
//               <Route path="/pendingorders" element={<PendingBookingList />} />
//               <Route path="/completedorders" element={<CompletedBookingList />} />
//               <Route path="/docs" element={<DocumentTable />} />
//               <Route path="/users" element={<UserList />} />
//               <Route path="/active-users" element={<ActiveUserList />} />
//               <Route path="/add-vendor" element={<AddVendorForm />} />
//               <Route path="/vendorlist" element={<VendorList />} />
//               <Route path="/activevendorlist" element={<ActiveVendorList />} />
//               <Route path="/create-banner" element={<BannerManager />} />
//               <Route path="/add-rider" element={<AddDeliveryBoy />} />
//               <Route path="/riderlist" element={<DeliveryBoyList />} />
//               <Route path="/pendingriderlist" element={<PendingDeliveryBoyList />} />
//               <Route path="/activeriderlist" element={<ActiveDeliveryBoyList />} />
//               <Route path="/notifications" element={<NotificationList />} />
//               <Route path="/add-staff" element={<AddStaff />} />
//               <Route path="/stafflist" element={<StaffList />} />
//               <Route path="/withdrawallist" element={<RiderWithdrawalList />} />
//               <Route path="/vendorwithdrawallist" element={<VendorWithdrawalList />} />
//               <Route path="/pendingbanners" element={<PendingBanner />} />
//               <Route path="/pendingvendorlist" element={<PendingVendorList />} />
//               <Route path="/pendingproductlist" element={<PendingProductList />} />
//               <Route path="/pendingcategory" element={<PendingCategoryList />} />
//               <Route path="/pendingstafflist" element={<PendingStaffList />} />
//               <Route path="/ambassadorlist" element={<AmbassadorList />} />
//                <Route path="/pendingambassadorlist" element={<PendingAmbassadorList />} />
//                <Route path="/ambassadorWithdrawalList" element={<AmbassadorWithdrawalList />} />
//                 <Route path="/amount" element={<AmountManagement />} />
//                  <Route path="/ambassadorplan" element={<AmbassadorPlanManagement />} />
//                 <Route path="/ambassadorpayments" element={<AmbassadorPayments />} />
//                 <Route path="/vendorplan" element={<VendorPlanManagement />} />
//                <Route path="/vendorpayment" element={<VendorPayments />} />
//               <Route path="/helplist" element={<HelpList />} />
//               <Route path="/comission" element={<CommissionManagement />} />
//               <Route path="/charges" element={<ChargesManagement />} />
//               <Route path="/resturantorders" element={<RestaurantOrders />} />
//               <Route path="/websiteenquiry" element={<WebsiteEnquiries />} />
//               <Route path="/vendororders" element={<VendorOrders />} />
//               <Route path="/orderpayments" element={<OrderPayments />} />
//               <Route path="/staffprofile" element={<StaffProfile />} />
//               <Route path="/wallet" element={<AdminWallet />} />
//               <Route path="/refrralrewards" element={<ReferralRewardManagement />} />
//               <Route path="/credential" element={<CredentialManager />} />
//               <Route path="/coupon" element={<CouponManager />} />
//               <Route path="/reels" element={<ReelsManagementPage />} />

//             </Routes>
//           </AdminLayout>
//         }
//       />
//     </Routes>
//   );
// }

// export default App;



import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

// Import your components (same as before)
import AdminLayout from "./Layout/AdminLayout.jsx";
import AmbassadorLayout from "./Layout/AmbassadorLayout.js";
import Dashboard from "./Pages/Dashboard.jsx";
import Settings from "./Pages/Setting";
import StaffList from "./Pages/StaffList.js";
import LoginPage from "./Pages/Login.js";
import CategoryForm from "./Pages/CategoryForm.js";
import CategoryList from "./Pages/CategoryList.js";
import DocumentTable from "./Pages/DocumentTable.js";
import CreateProductForm from "./Pages/CreateProduct.js";
import ProductList from "./Pages/ProductList.js";
import BookingList from "./Pages/BookingList.js";
import PendingBookingList from "./Pages/PendingBookingList.js";
import UserList from "./Pages/Userlist.js";
import ActiveUserList from "./Pages/ActiveUserList.js";
import AddVendorForm from "./Pages/AddVendorForm.js";
import VendorList from "./Pages/VendorList.js";
import BannerManager from "./Pages/BannerManager.js";
import AddDeliveryBoy from "./Pages/AddDeliveryBoy.js";
import DeliveryBoyList from "./Pages/DeliveryBoyList.js";
import NotificationList from "./Pages/NotificationList.js";
import ActiveDeliveryBoyList from "./Pages/ActiveDeliveryBoyList.js";
import ActiveVendorList from "./Pages/ActiveVendorList.js";
import AddStaff from "./Pages/AddStaff.js";
import RiderWithdrawalList from "./Pages/RiderWithdrawalList.js";
import CompletedBookingList from "./Pages/CompletedBookingList.js";
import VendorWithdrawalList from "./Pages/VendorWithdrawalList.js";
import StaffLoginPage from "./Pages/StaffLogin.js";
import PendingBanner from "./Pages/PendingBanner.js";
import PendingDeliveryBoyList from "./Pages/PendingDeliveryBoyList.js";
import PendingVendorList from "./Pages/PendingVendorList.js";
import CreateVeggyfyAmbassador from "./Pages/CreateVeggyfyAmbassador.js";

// Ambassador Components
import AmbassadorDashboard from "./Ambsdor/AmbassadorDashboard.js";
import PendingProductList from "./Pages/PendingProductList.js";
import PendingCategoryList from "./Pages/PendingCategoryList.js";
import PendingStaffList from "./Pages/PendingStaffList.js";
import AmbassadorList from "./Pages/AmbassadorList.js";
import PendingAmbassadorList from "./Pages/PendingAmbassadorList.js";
import AmbassadorLoginPage from "./Pages/AmbassadorLoginPage.js";
import AmbassadorProfile from "./Pages/AmbassadorProfile.js";
import AmbassadorUsers from "./Ambsdor/AmbassadorUsers.js";
import AmbassadorOrders from "./Ambsdor/AmbassadorOrders.js";
import AmbassadorAnalytics from "./Ambsdor/AmbassadorAnalytics.js";
import AmbassadorCommissionReport from "./Ambsdor/AmbassadorCommissionReport.js";
import TopAmbassadors from "./Ambsdor/TopAmbassadors.js";
import AmbassadorReferralPage from "./Ambsdor/AmbassadorReferralPage.js";
import AmbassadorWallet from "./Ambsdor/AmbassadorWallet.js";
import AmbassadorWithdrawalList from "./Pages/AmbassadorWithdrawalList.js";
import AmountManagement from "./Pages/AmountManagement.js";
import AmbassadorVendorList from "./Ambsdor/AmbassadorVendors.js";
import AmbassadorAmbassadorList from "./Ambsdor/AmbassadorAmbassadorList.js";
import AmbassadorJoiningFee from "./Ambsdor/AmbassadorJoiningFee.js";
import AmbassadorPlanManagement from "./Pages/AmbassadorPlanManagement.js";
import AmbassadorMyPlans from "./Ambsdor/AmbassadorMyPlans.js";
import AmbassadorSupport from "./Ambsdor/AmbassadorSupport.js";
import AmbassadorPayments from "./Pages/AmbassadorPayments.js";
import VendorPlanManagement from "./Pages/VendorPlanManagement.js";
import VendorPayments from "./Pages/VendorPayments.js";
import HelpList from "./Pages/HelpList.js";
import RegisterPage from "./Pages/RegisterPage.js";
import CommissionManagement from "./Pages/CommissionManagement.js";
import ChargesManagement from "./Pages/ChargesManagement.js";
import RestaurantOrders from "./Pages/RestaurantOrders.js";
import WebsiteEnquiries from "./Pages/WebsiteEnquiries.js";
import VendorOrders from "./Pages/VendorOrders.js";
import OrderPayments from "./Pages/OrderPayments.js";
import StaffProfile from "./Pages/StaffProfile.js";
import AdminWallet from "./Pages/AdminWallet.js";
import AmbassadorAccountManagement from "./Ambsdor/AmbassadorAccountManagement.js";
import ReferralRewardManagement from "./Pages/ReferralRewardManagement.js";
import CredentialManager from "./Pages/CredentialManager.js";
import CouponManager from "./Pages/CouponManager.js";
import ReelsManagementPage from "./Pages/ReelsManagementPage.js";
import AmbassadorNotifications from "./Ambsdor/AmbassadorNotifications.js";

// Helper: Check if token is expired (if JWT)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const exp = payload.exp;
    if (exp) {
      return Date.now() >= exp * 1000;
    }
    return false; // No expiry claim, assume valid
  } catch (e) {
    return false; // Not a JWT, assume valid
  }
};

// ==================== PROTECTED ROUTE COMPONENT ====================
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAllowed, setIsAllowed] = useState(null);
  const location = useLocation();

  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    // Token missing or expired
    if (!token || isTokenExpired(token)) {
      if (token && isTokenExpired(token)) {
        // Expired token - clear it
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
      }
      setIsAllowed(false);
      return;
    }
    // Role mismatch
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      setIsAllowed(false);
      return;
    }
    setIsAllowed(true);
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "authToken" || e.key === "role") {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for window focus (tab becomes active)
    const handleFocus = () => {
      checkAuth();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [allowedRoles, location.pathname]); // Re-check on route change as well

  if (isAllowed === null) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  return isAllowed ? children : <Navigate to="/" replace />;
};
// ============================================================================

function App() {
  return (
    <Routes>
      {/* Public routes – no protection */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/staff-login" element={<StaffLoginPage />} />
      <Route path="/vegiffy-ambassador" element={<CreateVeggyfyAmbassador />} />
      <Route path="/ambassador-login" element={<AmbassadorLoginPage />} />

      {/* Ambassador Routes – protected */}
      <Route
        path="/ambassador/*"
        element={
          <ProtectedRoute allowedRoles={["ambassador"]}>
            <AmbassadorLayout>
              <Routes>
                <Route path="dashboard" element={<AmbassadorDashboard />} />
                <Route path="profile" element={<AmbassadorProfile />} />
                <Route path="users" element={<AmbassadorUsers />} />
                <Route path="orders" element={<AmbassadorOrders />} />
                <Route path="orderanalytics" element={<AmbassadorAnalytics />} />
                <Route path="commission" element={<AmbassadorCommissionReport />} />
                <Route path="topambassadors" element={<TopAmbassadors />} />
                <Route path="reffralcode" element={<AmbassadorReferralPage />} />
                <Route path="wallet" element={<AmbassadorWallet />} />
                <Route path="vendors" element={<AmbassadorVendorList />} />
                <Route path="ambassadors" element={<AmbassadorAmbassadorList />} />
                <Route path="payments" element={<AmbassadorJoiningFee />} />
                <Route path="myplans" element={<AmbassadorMyPlans />} />
                <Route path="vendorplan" element={<VendorPlanManagement />} />
                <Route path="support" element={<AmbassadorSupport />} />
                <Route path="accounts" element={<AmbassadorAccountManagement />} />
                <Route path="notifications" element={<AmbassadorNotifications />} />
                <Route path="" element={<AmbassadorDashboard />} />
              </Routes>
            </AmbassadorLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin & Sub-admin Routes – protected */}
      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "subadmin"]}>
            <AdminLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/setting" element={<Settings />} />
                <Route path="/categoryform" element={<CategoryForm />} />
                <Route path="/categorylist" element={<CategoryList />} />
                <Route path="/add-product" element={<CreateProductForm />} />
                <Route path="/productlist" element={<ProductList />} />
                <Route path="/allorders" element={<BookingList />} />
                <Route path="/pendingorders" element={<PendingBookingList />} />
                <Route path="/completedorders" element={<CompletedBookingList />} />
                <Route path="/docs" element={<DocumentTable />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/active-users" element={<ActiveUserList />} />
                <Route path="/add-vendor" element={<AddVendorForm />} />
                <Route path="/vendorlist" element={<VendorList />} />
                <Route path="/activevendorlist" element={<ActiveVendorList />} />
                <Route path="/create-banner" element={<BannerManager />} />
                <Route path="/add-rider" element={<AddDeliveryBoy />} />
                <Route path="/riderlist" element={<DeliveryBoyList />} />
                <Route path="/pendingriderlist" element={<PendingDeliveryBoyList />} />
                <Route path="/activeriderlist" element={<ActiveDeliveryBoyList />} />
                <Route path="/notifications" element={<NotificationList />} />
                <Route path="/add-staff" element={<AddStaff />} />
                <Route path="/stafflist" element={<StaffList />} />
                <Route path="/withdrawallist" element={<RiderWithdrawalList />} />
                <Route path="/vendorwithdrawallist" element={<VendorWithdrawalList />} />
                <Route path="/pendingbanners" element={<PendingBanner />} />
                <Route path="/pendingvendorlist" element={<PendingVendorList />} />
                <Route path="/pendingproductlist" element={<PendingProductList />} />
                <Route path="/pendingcategory" element={<PendingCategoryList />} />
                <Route path="/pendingstafflist" element={<PendingStaffList />} />
                <Route path="/ambassadorlist" element={<AmbassadorList />} />
                <Route path="/pendingambassadorlist" element={<PendingAmbassadorList />} />
                <Route path="/ambassadorWithdrawalList" element={<AmbassadorWithdrawalList />} />
                <Route path="/amount" element={<AmountManagement />} />
                <Route path="/ambassadorplan" element={<AmbassadorPlanManagement />} />
                <Route path="/ambassadorpayments" element={<AmbassadorPayments />} />
                <Route path="/vendorplan" element={<VendorPlanManagement />} />
                <Route path="/vendorpayment" element={<VendorPayments />} />
                <Route path="/helplist" element={<HelpList />} />
                <Route path="/comission" element={<CommissionManagement />} />
                <Route path="/charges" element={<ChargesManagement />} />
                <Route path="/resturantorders" element={<RestaurantOrders />} />
                <Route path="/websiteenquiry" element={<WebsiteEnquiries />} />
                <Route path="/vendororders" element={<VendorOrders />} />
                <Route path="/orderpayments" element={<OrderPayments />} />
                <Route path="/staffprofile" element={<StaffProfile />} />
                <Route path="/wallet" element={<AdminWallet />} />
                <Route path="/refrralrewards" element={<ReferralRewardManagement />} />
                <Route path="/credential" element={<CredentialManager />} />
                <Route path="/coupon" element={<CouponManager />} />
                <Route path="/reels" element={<ReelsManagementPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;