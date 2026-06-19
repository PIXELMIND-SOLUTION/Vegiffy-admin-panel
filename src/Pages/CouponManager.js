import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiEdit,
  FiUser,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiType,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiShoppingBag,
  FiAward,
  FiUsers,
  FiUserCheck,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiTag,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiHash,
  FiBarChart2,
  FiToggleLeft,
  FiToggleRight,
  FiCreditCard,
  FiGift,
  FiEye,
  FiCopy,
  FiExternalLink,
  FiShoppingCart,
  FiUsers as FiUsersIcon,
  FiClock as FiClockIcon,
  FiCalendar as FiCalendarIcon,
  FiGlobe,
  FiCreditCard as FiCreditCardIcon,
  FiActivity,
  FiDatabase,
  FiTrendingUp,
  FiDollarSign as FiDollarSignIcon,
  FiPercent as FiPercentIcon
} from "react-icons/fi";

const API_BASE = "https://api.vegiffy.in/api/admin";

const CouponManager = () => {
  // Form state
  const [formData, setFormData] = useState({
    couponCode: "",
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Coupons list state
  const [coupons, setCoupons] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    couponCode: "",
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true
  });
  const [modalErrors, setModalErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  // User info state
  const [userInfo, setUserInfo] = useState({
    role: "",
    name: "",
    email: "",
    id: ""
  });

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const storedRole = sessionStorage.getItem("role");


  // Discount types
  const discountTypes = [
    { value: "percentage", label: "Percentage", icon: <FiPercent size={12} /> },
    { value: "fixed", label: "Fixed Amount", icon: <FiDollarSign size={12} /> }
  ];

  // Get user info from sessionStorage
  const getUserInfo = () => {
    try {
      const role = sessionStorage.getItem("role") || "";
      const name = sessionStorage.getItem("adminName") || "";
      const email = sessionStorage.getItem("adminEmail") || "";
      const id = sessionStorage.getItem("adminId") || "";

      return {
        role: role.toLowerCase(),
        name,
        email,
        id
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      return { role: "", name: "", email: "", id: "" };
    }
  };

  // Get subAdminId if user is subadmin
  const getSubAdminId = () => {
    const info = getUserInfo();
    return info.role === "subadmin" ? info.id : null;
  };

  // Check screen size
  const checkScreenSize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) {
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  };

  useEffect(() => {
    fetchCoupons();
    setUserInfo(getUserInfo());
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch all coupons
  const fetchCoupons = async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await fetch(`https://api.vegiffy.in/api/getallcoupons`);
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(data.data || []);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked :
        type === "number" ? Number(value) : value
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle modal input changes
  const handleModalInputChange = (e) => {
    const { name, value, type } = e.target;

    setModalFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked :
        type === "number" ? Number(value) : value
    }));

    // Clear error for this field
    if (modalErrors[name]) {
      setModalErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form data
  const validateForm = (data) => {
    const errors = {};

    if (!data.couponCode.trim()) {
      errors.couponCode = "Coupon code is required";
    }

    if (!data.discountType) {
      errors.discountType = "Discount type is required";
    }

    if (!data.discountValue) {
      errors.discountValue = "Discount value is required";
    } else if (data.discountValue <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    } else if (data.discountType === "percentage" && data.discountValue > 100) {
      errors.discountValue = "Percentage cannot exceed 100%";
    }

    if (!data.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!data.endDate) {
      errors.endDate = "End date is required";
    } else if (data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
      errors.endDate = "End date must be after start date";
    }

    if (data.minOrderAmount && data.minOrderAmount < 0) {
      errors.minOrderAmount = "Minimum order amount cannot be negative";
    }

    if (data.maxDiscountAmount && data.maxDiscountAmount < 0) {
      errors.maxDiscountAmount = "Maximum discount amount cannot be negative";
    }

    if (data.usageLimit && data.usageLimit < 1) {
      errors.usageLimit = "Usage limit must be at least 1";
    }

    return errors;
  };

  // Prepare request data with subAdminId if applicable
  const prepareRequestData = (data) => {
    const subAdminId = getSubAdminId();
    const userInfo = getUserInfo();

    const requestData = { ...data };

    if (subAdminId) {
      requestData.subAdminId = subAdminId;
    }

    return requestData;
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setFormLoading(true);
    setFormMessage("");

    try {
      const requestData = prepareRequestData(formData);

      const res = await fetch(`${API_BASE}/createcoupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (res.ok) {
        setFormMessage({
          type: "success",
          text: `✅ Coupon created successfully${userInfo.role === "subadmin" ? ` by ${userInfo.name}` : ""}!`
        });

        // Reset form
        setFormData({
          couponCode: "",
          title: "",
          description: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "",
          maxDiscountAmount: "",
          startDate: "",
          endDate: "",
          usageLimit: "",
          isActive: true
        });

        // Refresh list
        fetchCoupons();
      } else {
        setFormMessage({
          type: "error",
          text: `❌ Error: ${data.message || "Failed to create coupon"}`
        });
      }
    } catch (error) {
      setFormMessage({
        type: "error",
        text: `❌ Network error: ${error.message}`
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Open view modal
  const openViewModal = (coupon) => {
    setSelectedCoupon(coupon);
    setViewModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setModalFormData({
      couponCode: coupon.couponCode,
      title: coupon.title || "",
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      startDate: formatDateForInput(coupon.startDate),
      endDate: formatDateForInput(coupon.endDate),
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive
    });
    setModalErrors({});
    setEditModalOpen(true);
  };

  // Close view modal
  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedCoupon(null);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingCoupon(null);
    setModalFormData({
      couponCode: "",
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      isActive: true
    });
    setModalErrors({});
  };

  // Handle coupon update
  const handleUpdate = async () => {
    // Validate form
    const errors = validateForm(modalFormData);
    setModalErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setUpdateLoading(true);

    try {
      const requestData = prepareRequestData(modalFormData);

      const res = await fetch(`${API_BASE}/updatecoupon/${editingCoupon._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Coupon updated successfully${userInfo.role === "subadmin" ? ` by ${userInfo.name}` : ""}!`);
        closeEditModal();
        fetchCoupons();
      } else {
        alert(`❌ Error: ${data.message || "Failed to update coupon"}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle coupon deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      const config = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        ...(subAdminId && {
          body: JSON.stringify({ subAdminId })
        })
      };

      const res = await fetch(`${API_BASE}/deletecoupon/${id}`, config);

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Coupon deleted successfully${userInfo.role === "subadmin" ? ` by ${userInfo.name}` : ""}!`);
        fetchCoupons();
      } else {
        alert(`❌ Error: ${data.message || "Failed to delete coupon"}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    }
  };

  // Format discount display
  const formatDiscount = (coupon) => {
    if (coupon.discountType === "percentage") {
      return (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          color: "#28a745",
          fontWeight: "600",
          fontSize: "12px"
        }}>
          <FiPercent size={10} />
          {coupon.discountValue}% OFF
          {coupon.maxDiscountAmount && (
            <span style={{
              fontSize: "9px",
              color: "#6c757d",
              marginLeft: "4px"
            }}>
              (Max: ₹{coupon.maxDiscountAmount})
            </span>
          )}
        </div>
      );
    } else {
      return (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          color: "#28a745",
          fontWeight: "600",
          fontSize: "12px"
        }}>
          <FiDollarSign size={10} />
          ₹{coupon.discountValue} OFF
        </div>
      );
    }
  };

  // Status badge
  const getStatusBadge = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) {
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 6px",
          borderRadius: "10px",
          fontSize: "9px",
          fontWeight: "500",
          color: "#dc3545",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb"
        }}>
          <FiX size={8} />
          Inactive
        </div>
      );
    } else if (now < start) {
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 6px",
          borderRadius: "10px",
          fontSize: "9px",
          fontWeight: "500",
          color: "#ffc107",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7"
        }}>
          <FiClock size={8} />
          Upcoming
        </div>
      );
    } else if (now > end) {
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 6px",
          borderRadius: "10px",
          fontSize: "9px",
          fontWeight: "500",
          color: "#6c757d",
          backgroundColor: "#e9ecef",
          border: "1px solid #dee2e6"
        }}>
          <FiClock size={8} />
          Expired
        </div>
      );
    } else {
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 6px",
          borderRadius: "10px",
          fontSize: "9px",
          fontWeight: "500",
          color: "#28a745",
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb"
        }}>
          <FiCheck size={8} />
          Active
        </div>
      );
    }
  };

  // Calculate remaining days
  const getRemainingDays = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Copy coupon code to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied: ${text}`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCoupons = coupons.slice(startIndex, endIndex);

  // Info item component for view modal
  const InfoItem = ({ icon, label, value, color = "#495057" }) => (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 10px",
      backgroundColor: "#f8f9fa",
      borderRadius: "6px",
      border: "1px solid #e9ecef",
      marginBottom: "6px"
    }}>
      <div style={{
        color: "#6c757d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        backgroundColor: "white",
        borderRadius: "4px",
        border: "1px solid #dee2e6"
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "10px", color: "#6c757d", fontWeight: "500", marginBottom: "2px" }}>
          {label}
        </div>
        <div style={{ fontSize: "12px", color: color, fontWeight: "500" }}>
          {value || "N/A"}
        </div>
      </div>
    </div>
  );

  // Status badge for view modal
  const getDetailedStatusBadge = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const remainingDays = getRemainingDays(endDate);

    if (!isActive) {
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "600",
          color: "#dc3545",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb"
        }}>
          <FiX size={12} />
          Inactive
        </div>
      );
    } else if (now < start) {
      const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "600",
          color: "#ffc107",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7"
        }}>
          <FiClock size={12} />
          Upcoming (in {daysUntil} days)
        </div>
      );
    } else if (now > end) {
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "600",
          color: "#6c757d",
          backgroundColor: "#e9ecef",
          border: "1px solid #dee2e6"
        }}>
          <FiClock size={12} />
          Expired
        </div>
      );
    } else {
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "600",
          color: "#28a745",
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb"
        }}>
          <FiCheck size={12} />
          Active ({remainingDays} days left)
        </div>
      );
    }
  };

  // Render form section
  const renderFormSection = () => (
    <div style={{
      backgroundColor: "#f8f9fa",
      padding: "15px",
      borderRadius: "8px",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
      border: "1px solid #e9ecef",
      marginBottom: "15px",
      width: "100%"
    }}>
      <div style={{ marginBottom: "12px" }}>
        <h2 style={{
          marginBottom: "6px",
          color: "#495057",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "16px"
        }}>
          <FiPlus size={16} />
          Create New Coupon
        </h2>

        {/* User Role Display */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "12px",
          padding: "6px 8px",
          backgroundColor: userInfo.role === "subadmin" ? "#f3e8ff" : "#dbeafe",
          borderRadius: "5px",
          border: `1px solid ${userInfo.role === "subadmin" ? "#e9d5ff" : "#bfdbfe"}`,
        }}>
          <FiUserCheck size={12} color={userInfo.role === "subadmin" ? "#7c3aed" : "#1d4ed8"} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: "11px",
              fontWeight: "600",
              color: userInfo.role === "subadmin" ? "#7c3aed" : "#1d4ed8",
              lineHeight: "1.2"
            }}>
              {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Coupon Code Field */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{
            display: "block",
            marginBottom: "4px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px"
          }}>
            <FiHash size={11} />
            Coupon Code *
          </label>
          <input
            type="text"
            name="couponCode"
            value={formData.couponCode}
            onChange={handleInputChange}
            placeholder="e.g., SUMMER20"
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${formErrors.couponCode ? "#dc3545" : "#ced4da"}`,
              borderRadius: "5px",
              fontSize: "12px",
              textTransform: "uppercase"
            }}
          />
          {formErrors.couponCode && (
            <div style={{
              color: "#dc3545",
              fontSize: "10px",
              marginTop: "3px",
              display: "flex",
              alignItems: "center",
              gap: "3px"
            }}>
              <FiAlertCircle size={9} />
              {formErrors.couponCode}
            </div>
          )}
        </div>

        {/* Title Field */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{
            display: "block",
            marginBottom: "4px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px"
          }}>
            <FiTag size={11} />
            Title (Optional)
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Summer Sale"
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${formErrors.title ? "#dc3545" : "#ced4da"}`,
              borderRadius: "5px",
              fontSize: "12px",
            }}
          />
        </div>

        {/* Description Field */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{
            display: "block",
            marginBottom: "4px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px"
          }}>
            <FiMessageSquare size={11} />
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Coupon description..."
            rows={2}
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${formErrors.description ? "#dc3545" : "#ced4da"}`,
              borderRadius: "5px",
              fontSize: "12px",
              resize: "vertical",
              minHeight: "60px"
            }}
          />
        </div>

        {/* Discount Type and Value */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "120px" }}>
            <label style={{
              display: "block",
              marginBottom: "4px",
              color: "#495057",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px"
            }}>
              <FiPercent size={11} />
              Discount Type *
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: `1px solid ${formErrors.discountType ? "#dc3545" : "#ced4da"}`,
                borderRadius: "5px",
                fontSize: "12px",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              {discountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "120px" }}>
            <label style={{
              display: "block",
              marginBottom: "4px",
              color: "#495057",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px"
            }}>
              {formData.discountType === "percentage" ? <FiPercent size={11} /> : <FiDollarSign size={11} />}
              Discount Value *
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleInputChange}
              placeholder={formData.discountType === "percentage" ? "e.g., 20" : "e.g., 100"}
              min="0"
              max={formData.discountType === "percentage" ? "100" : undefined}
              step="0.01"
              style={{
                width: "100%",
                padding: "8px",
                border: `1px solid ${formErrors.discountValue ? "#dc3545" : "#ced4da"}`,
                borderRadius: "5px",
                fontSize: "12px",
              }}
            />
            {formErrors.discountValue && (
              <div style={{
                color: "#dc3545",
                fontSize: "10px",
                marginTop: "3px",
                display: "flex",
                alignItems: "center",
                gap: "3px"
              }}>
                <FiAlertCircle size={9} />
                {formErrors.discountValue}
              </div>
            )}
          </div>
        </div>

        {/* Min Order Amount */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{
            display: "block",
            marginBottom: "4px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px"
          }}>
            <FiCreditCard size={11} />
            Min Order (Optional)
          </label>
          <input
            type="number"
            name="minOrderAmount"
            value={formData.minOrderAmount}
            onChange={handleInputChange}
            placeholder="e.g., 500"
            min="0"
            step="0.01"
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${formErrors.minOrderAmount ? "#dc3545" : "#ced4da"}`,
              borderRadius: "5px",
              fontSize: "12px",
            }}
          />
        </div>

        {/* Max Discount Amount (for percentage) */}
        {formData.discountType === "percentage" && (
          <div style={{ marginBottom: "12px" }}>
            <label style={{
              display: "block",
              marginBottom: "4px",
              color: "#495057",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px"
            }}>
              <FiBarChart2 size={11} />
              Max Discount (Optional)
            </label>
            <input
              type="number"
              name="maxDiscountAmount"
              value={formData.maxDiscountAmount}
              onChange={handleInputChange}
              placeholder="e.g., 200"
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: "8px",
                border: `1px solid ${formErrors.maxDiscountAmount ? "#dc3545" : "#ced4da"}`,
                borderRadius: "5px",
                fontSize: "12px",
              }}
            />
          </div>
        )}

        {/* Date Range */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <label style={{
              display: "block",
              marginBottom: "4px",
              color: "#495057",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px"
            }}>
              <FiCalendar size={11} />
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: `1px solid ${formErrors.startDate ? "#dc3545" : "#ced4da"}`,
                borderRadius: "5px",
                fontSize: "12px",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "140px" }}>
            <label style={{
              display: "block",
              marginBottom: "4px",
              color: "#495057",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px"
            }}>
              <FiCalendar size={11} />
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate}
              style={{
                width: "100%",
                padding: "8px",
                border: `1px solid ${formErrors.endDate ? "#dc3545" : "#ced4da"}`,
                borderRadius: "5px",
                fontSize: "12px",
              }}
            />
          </div>
        </div>

        {/* Usage Limit */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{
            display: "block",
            marginBottom: "4px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px"
          }}>
            <FiUsers size={11} />
            Usage Limit (Optional)
          </label>
          <input
            type="number"
            name="usageLimit"
            value={formData.usageLimit}
            onChange={handleInputChange}
            placeholder="e.g., 100"
            min="1"
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${formErrors.usageLimit ? "#dc3545" : "#ced4da"}`,
              borderRadius: "5px",
              fontSize: "12px",
            }}
          />
        </div>

        {/* Active Status */}
        <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#495057",
            fontWeight: "500",
            fontSize: "12px",
            cursor: "pointer"
          }}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer"
              }}
            />
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              Active Coupon
            </span>
          </label>

          <button
            type="submit"
            disabled={formLoading}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              cursor: formLoading ? "not-allowed" : "pointer",
              backgroundColor: formLoading ? "#6c757d" : "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            {formLoading ? (
              <>
                <FiRefreshCw className="spin" size={12} />
                Creating...
              </>
            ) : (
              <>
                <FiPlus size={12} />
                Create
              </>
            )}
          </button>
        </div>
      </form>

      {formMessage && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px",
            borderRadius: "5px",
            backgroundColor: formMessage.type === "success" ? "#d4edda" : "#f8d7da",
            color: formMessage.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${formMessage.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
            textAlign: "center",
            wordBreak: "break-word",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px"
          }}
        >
          {formMessage.type === "success" ? <FiCheckCircle size={10} /> : <FiAlertCircle size={10} />}
          {formMessage.text}
        </div>
      )}
    </div>
  );

  // Render coupons list
  const renderCouponsList = () => (
    <div style={{
      backgroundColor: "#f8f9fa",
      padding: "15px",
      borderRadius: "8px",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
      border: "1px solid #e9ecef",
      width: "100%"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        flexWrap: "wrap",
        gap: "8px"
      }}>
        <h2 style={{
          color: "#495057",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          margin: 0,
          fontSize: "16px"
        }}>
          <FiGift size={16} />
          Manage Coupons
          <span style={{
            fontSize: "11px",
            backgroundColor: "#007bff",
            color: "white",
            padding: "2px 6px",
            borderRadius: "8px",
            marginLeft: "6px"
          }}>
            {coupons.length}
          </span>
        </h2>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {isMobile && showForm && (
            <button
              onClick={() => setShowForm(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              <FiChevronUp size={10} />
              Hide Form
            </button>
          )}

          <button
            onClick={fetchCoupons}
            disabled={listLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 10px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: listLoading ? "not-allowed" : "pointer",
              fontSize: "11px",
              transition: "all 0.2s ease",
            }}
          >
            <FiRefreshCw className={listLoading ? "spin" : ""} size={11} />
            Refresh
          </button>
        </div>
      </div>

      {listLoading && (
        <div style={{ textAlign: "center", padding: "20px", color: "#6c757d" }}>
          <FiRefreshCw className="spin" size={18} />
          <p style={{ marginTop: "8px", fontSize: "12px" }}>Loading coupons...</p>
        </div>
      )}

      {listError && (
        <div style={{
          padding: "8px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "5px",
          border: "1px solid #f5c6cb",
          marginBottom: "12px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontSize: "11px"
        }}>
          <FiAlertCircle size={10} />
          {listError}
        </div>
      )}

      {!listLoading && coupons.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px", color: "#6c757d" }}>
          <FiGift size={24} style={{ opacity: 0.5, marginBottom: "8px" }} />
          <p style={{ fontSize: "12px" }}>No coupons found</p>
        </div>
      )}

      {!listLoading && coupons.length > 0 && (
        <>
          {/* Pagination Controls */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            flexWrap: "wrap",
            gap: "8px",
            fontSize: "11px"
          }}>
            <div style={{ color: "#6c757d" }}>
              {startIndex + 1}-{Math.min(endIndex, coupons.length)} of {coupons.length}
            </div>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(0);
                }}
                style={{
                  padding: "4px 6px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "11px",
                  backgroundColor: "white"
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>

              <div style={{ display: "flex", gap: "3px" }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: currentPage === 0 ? "#e9ecef" : "#007bff",
                    color: currentPage === 0 ? "#6c757d" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === 0 ? "not-allowed" : "pointer",
                    fontSize: "11px"
                  }}
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: currentPage >= totalPages - 1 ? "#e9ecef" : "#007bff",
                    color: currentPage >= totalPages - 1 ? "#6c757d" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                    fontSize: "11px"
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Table for larger screens */}
          {!isMobile && (
            <div style={{ overflowX: "auto", fontSize: "12px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  overflow: "hidden",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#007bff" }}>
                    <th style={{ padding: "8px", borderBottom: "1px solid #dee2e6", color: "white", textAlign: "left", width: "100px", fontSize: "11px" }}>
                      Code
                    </th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #dee2e6", color: "white", textAlign: "left", width: "120px", fontSize: "11px" }}>
                      Discount
                    </th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #dee2e6", color: "white", textAlign: "center", width: "70px", fontSize: "11px" }}>
                      Status
                    </th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #dee2e6", color: "white", textAlign: "center", width: "100px", fontSize: "11px" }}>
                      Validity
                    </th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #dee2e6", color: "white", textAlign: "center", width: "100px", fontSize: "11px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCoupons.map((coupon) => (
                    <tr key={coupon._id} style={{ borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "8px" }}>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "3px"
                        }}>
                          <div style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#495057",
                            letterSpacing: "0.5px"
                          }}>
                            {coupon.couponCode}
                          </div>
                          {coupon.title && (
                            <div style={{ fontSize: "10px", color: "#6c757d" }}>
                              {coupon.title}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "8px" }}>
                        {formatDiscount(coupon)}
                        {coupon.minOrderAmount > 0 && (
                          <div style={{ fontSize: "10px", color: "#6c757d", marginTop: "3px" }}>
                            Min: ₹{coupon.minOrderAmount}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        {getStatusBadge(coupon.isActive, coupon.startDate, coupon.endDate)}
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "11px" }}>
                          <div style={{ color: "#28a745", fontWeight: "500" }}>
                            {new Date(coupon.startDate).toLocaleDateString()}
                          </div>
                          <div style={{ color: "#dc3545", marginTop: "2px" }}>
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                          <button
                            onClick={() => openViewModal(coupon)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px",
                              backgroundColor: "#6c757d",
                              border: "none",
                              borderRadius: "4px",
                              color: "white",
                              cursor: "pointer",
                              fontSize: "11px",
                              width: "26px",
                              height: "26px",
                            }}
                            title="View"
                          >
                            <FiEye size={11} />
                          </button>
                          <button
                            onClick={() => openEditModal(coupon)}
                            disabled={updateLoading}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px",
                              backgroundColor: updateLoading ? "#e9ecef" : "#17a2b8",
                              border: "none",
                              borderRadius: "4px",
                              color: updateLoading ? "#6c757d" : "white",
                              cursor: updateLoading ? "not-allowed" : "pointer",
                              fontSize: "11px",
                              width: "26px",
                              height: "26px",
                            }}
                            title="Edit"
                          >
                            <FiEdit size={11} />
                          </button>
                          {storedRole === 'admin' && (
                            <button
                              onClick={() => handleDelete(coupon._id)}
                              disabled={updateLoading}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "4px",
                                backgroundColor: updateLoading ? "#e9ecef" : "#dc3545",
                                border: "none",
                                borderRadius: "4px",
                                color: updateLoading ? "#6c757d" : "white",
                                cursor: updateLoading ? "not-allowed" : "pointer",
                                fontSize: "11px",
                                width: "26px",
                                height: "26px",
                              }}
                              title="Delete"
                            >
                              <FiTrash2 size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards for mobile view */}
          {isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {displayedCoupons.map((coupon) => (
                <div key={coupon._id} style={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  padding: "10px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e9ecef"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#495057",
                        letterSpacing: "0.5px"
                      }}>
                        {coupon.couponCode}
                      </div>
                      {coupon.title && (
                        <div style={{ fontSize: "11px", color: "#6c757d", marginTop: "2px" }}>
                          {coupon.title}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "3px" }}>
                      {getStatusBadge(coupon.isActive, coupon.startDate, coupon.endDate)}
                      <div style={{ display: "flex", gap: "3px", marginLeft: "6px" }}>
                        <button
                          onClick={() => openViewModal(coupon)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                            backgroundColor: "#6c757d",
                            border: "none",
                            borderRadius: "4px",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "10px",
                            width: "24px",
                            height: "24px",
                          }}
                          title="View"
                        >
                          <FiEye size={10} />
                        </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          disabled={updateLoading}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                            backgroundColor: updateLoading ? "#e9ecef" : "#17a2b8",
                            border: "none",
                            borderRadius: "4px",
                            color: updateLoading ? "#6c757d" : "white",
                            cursor: updateLoading ? "not-allowed" : "pointer",
                            fontSize: "10px",
                            width: "24px",
                            height: "24px",
                          }}
                          title="Edit"
                        >
                          <FiEdit size={10} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          disabled={updateLoading}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                            backgroundColor: updateLoading ? "#e9ecef" : "#dc3545",
                            border: "none",
                            borderRadius: "4px",
                            color: updateLoading ? "#6c757d" : "white",
                            cursor: updateLoading ? "not-allowed" : "pointer",
                            fontSize: "10px",
                            width: "24px",
                            height: "24px",
                          }}
                          title="Delete"
                        >
                          <FiTrash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div>
                      {formatDiscount(coupon)}
                      {coupon.minOrderAmount > 0 && (
                        <div style={{ fontSize: "10px", color: "#6c757d", marginTop: "2px" }}>
                          Min order: ₹{coupon.minOrderAmount}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#6c757d" }}>
                      <div>
                        <div style={{ fontWeight: "500" }}>Starts:</div>
                        <div>{new Date(coupon.startDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: "500" }}>Ends:</div>
                        <div>{new Date(coupon.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {coupon.usageLimit && (
                      <div style={{
                        fontSize: "10px",
                        color: "#6c757d",
                        padding: "3px 6px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        border: "1px solid #e9ecef"
                      }}>
                        Usage limit: {coupon.usageLimit}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "12px",
            flexWrap: "wrap",
            gap: "4px"
          }}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: currentPage === pageNum ? "#007bff" : "#e9ecef",
                    color: currentPage === pageNum ? "white" : "#495057",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                    minWidth: "28px"
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  // Render View Modal with all data
  const renderViewModal = () => {
    if (!selectedCoupon) return null;

    const remainingDays = getRemainingDays(selectedCoupon.endDate);
    const isExpired = new Date() > new Date(selectedCoupon.endDate);
    const isUpcoming = new Date() < new Date(selectedCoupon.startDate);
    const isActive = selectedCoupon.isActive && !isExpired && !isUpcoming;

    // Calculate discount amount display
    const discountDisplay = selectedCoupon.discountType === "percentage"
      ? `${selectedCoupon.discountValue}% OFF`
      : `₹${selectedCoupon.discountValue} OFF`;

    // Format dates
    const startDate = new Date(selectedCoupon.startDate);
    const endDate = new Date(selectedCoupon.endDate);
    const createdAt = selectedCoupon.createdAt ? new Date(selectedCoupon.createdAt) : null;
    const updatedAt = selectedCoupon.updatedAt ? new Date(selectedCoupon.updatedAt) : null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
          padding: "15px",
          overflowY: "auto"
        }}
        onClick={(e) => e.target === e.currentTarget && closeViewModal()}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            maxWidth: "700px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Modal Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h3 style={{
                margin: 0,
                color: "#495057",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "20px"
              }}>
                <FiGift size={20} />
                Coupon Details
              </h3>
              <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>ID: {selectedCoupon._id}</span>
                <span>•</span>
                <span>Created: {createdAt ? formatDate(createdAt) : "N/A"}</span>
              </div>
            </div>
            <button
              onClick={closeViewModal}
              style={{
                background: "none",
                border: "none",
                fontSize: "22px",
                cursor: "pointer",
                color: "#6c757d",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              <FiX />
            </button>
          </div>

          {/* Coupon Header Section */}
          <div style={{
            backgroundColor: isActive ? "#d4edda" : isExpired ? "#f8d7da" : "#fff3cd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            border: `2px solid ${isActive ? "#c3e6cb" : isExpired ? "#f5c6cb" : "#ffeaa7"}`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Corner decoration */}
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "80px",
              height: "80px",
              backgroundColor: isActive ? "#28a745" : isExpired ? "#dc3545" : "#ffc107",
              opacity: 0.1,
              borderRadius: "50%"
            }} />

            <div style={{
              fontSize: "28px",
              fontWeight: "800",
              color: isActive ? "#155724" : isExpired ? "#721c24" : "#856404",
              letterSpacing: "2px",
              marginBottom: "10px",
              fontFamily: "'Courier New', monospace",
              position: "relative",
              zIndex: 1
            }}>
              {selectedCoupon.couponCode}
            </div>

            <div style={{
              fontSize: "20px",
              fontWeight: "700",
              color: isActive ? "#28a745" : isExpired ? "#dc3545" : "#ffc107",
              marginBottom: "10px",
              position: "relative",
              zIndex: 1
            }}>
              {discountDisplay}
            </div>

            {selectedCoupon.title && (
              <div style={{
                fontSize: "18px",
                fontWeight: "600",
                color: isActive ? "#155724" : isExpired ? "#721c24" : "#856404",
                marginBottom: "15px",
                position: "relative",
                zIndex: 1
              }}>
                {selectedCoupon.title}
              </div>
            )}

            <div style={{ position: "relative", zIndex: 1 }}>
              {getDetailedStatusBadge(selectedCoupon.isActive, selectedCoupon.startDate, selectedCoupon.endDate)}
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: "15px",
            marginBottom: "20px"
          }}>
            {/* Left Column - Basic Information */}
            <div>
              <h4 style={{
                color: "#495057",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                paddingBottom: "8px",
                borderBottom: "2px solid #e9ecef"
              }}>
                <FiInfo size={16} />
                Basic Information
              </h4>

              <InfoItem
                icon={<FiMessageSquare size={14} />}
                label="Description"
                value={selectedCoupon.description || "No description provided"}
              />

              <InfoItem
                icon={selectedCoupon.discountType === "percentage" ? <FiPercentIcon size={14} /> : <FiDollarSignIcon size={14} />}
                label="Discount Type"
                value={selectedCoupon.discountType === "percentage" ? "Percentage Discount" : "Fixed Amount Discount"}
                color="#28a745"
              />

              <InfoItem
                icon={<FiBarChart2 size={14} />}
                label="Discount Value"
                value={selectedCoupon.discountType === "percentage" ? `${selectedCoupon.discountValue}%` : `₹${selectedCoupon.discountValue}`}
                color="#28a745"
              />

              {selectedCoupon.maxDiscountAmount && selectedCoupon.discountType === "percentage" && (
                <InfoItem
                  icon={<FiTrendingUp size={14} />}
                  label="Maximum Discount"
                  value={`₹${selectedCoupon.maxDiscountAmount}`}
                  color="#28a745"
                />
              )}
            </div>

            {/* Right Column - Requirements & Limits */}
            <div>
              <h4 style={{
                color: "#495057",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                paddingBottom: "8px",
                borderBottom: "2px solid #e9ecef"
              }}>
                <FiCreditCardIcon size={16} />
                Requirements & Limits
              </h4>

              <InfoItem
                icon={<FiShoppingCart size={14} />}
                label="Minimum Order Amount"
                value={selectedCoupon.minOrderAmount ? `₹${selectedCoupon.minOrderAmount}` : "No minimum"}
                color={selectedCoupon.minOrderAmount ? "#007bff" : "#6c757d"}
              />

              <InfoItem
                icon={<FiUsersIcon size={14} />}
                label="Usage Limit"
                value={selectedCoupon.usageLimit ? selectedCoupon.usageLimit : "Unlimited"}
                color={selectedCoupon.usageLimit ? "#007bff" : "#6c757d"}
              />

              <InfoItem
                icon={<FiActivity size={14} />}
                label="Times Used"
                value={selectedCoupon.usedCount ? `${selectedCoupon.usedCount} times` : "0 times"}
                color={selectedCoupon.usedCount && selectedCoupon.usedCount > 0 ? "#28a745" : "#6c757d"}
              />

              {selectedCoupon.remainingUsage && (
                <InfoItem
                  icon={<FiDatabase size={14} />}
                  label="Remaining Usage"
                  value={selectedCoupon.remainingUsage}
                  color={selectedCoupon.remainingUsage > 0 ? "#28a745" : "#dc3545"}
                />
              )}
            </div>

            {/* Validity Period */}
            <div style={{ gridColumn: isMobile ? "1" : "1 / span 2" }}>
              <h4 style={{
                color: "#495057",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                paddingBottom: "8px",
                borderBottom: "2px solid #e9ecef"
              }}>
                <FiCalendarIcon size={16} />
                Validity Period
              </h4>

              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                gap: "10px"
              }}>
                <div style={{
                  padding: "12px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "8px",
                  border: "1px solid #c8e6c9",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#2e7d32", fontWeight: "500", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <FiCalendar size={12} />
                    Start Date
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#2e7d32" }}>
                    {formatDate(startDate)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#4caf50", marginTop: "4px" }}>
                    {formatTime(startDate)}
                  </div>
                </div>

                <div style={{
                  padding: "12px",
                  backgroundColor: isExpired ? "#ffebee" : "#fff3e0",
                  borderRadius: "8px",
                  border: `1px solid ${isExpired ? "#ffcdd2" : "#ffe0b2"}`,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: isExpired ? "#c62828" : "#f57c00", fontWeight: "500", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <FiCalendar size={12} />
                    End Date
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: isExpired ? "#c62828" : "#f57c00" }}>
                    {formatDate(endDate)}
                  </div>
                  <div style={{ fontSize: "12px", color: isExpired ? "#e53935" : "#ff9800", marginTop: "4px" }}>
                    {formatTime(endDate)}
                  </div>
                  {!isExpired && !isUpcoming && remainingDays > 0 && (
                    <div style={{ fontSize: "11px", color: "#4caf50", marginTop: "6px", padding: "4px 8px", backgroundColor: "#e8f5e9", borderRadius: "4px" }}>
                      {remainingDays} days remaining
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Information */}
            <div style={{ gridColumn: isMobile ? "1" : "1 / span 2" }}>
              <h4 style={{
                color: "#495057",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                paddingBottom: "8px",
                borderBottom: "2px solid #e9ecef"
              }}>
                <FiUser size={16} />
                Admin Information
              </h4>

              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: "10px"
              }}>
                {selectedCoupon.createdBy && (
                  <div style={{
                    padding: "12px",
                    backgroundColor: "#f3e5f5",
                    borderRadius: "8px",
                    border: "1px solid #e1bee7",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "12px", color: "#7b1fa2", fontWeight: "500", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <FiUser size={12} />
                      Created By
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#7b1fa2" }}>
                      {selectedCoupon.createdBy.name || selectedCoupon.createdBy}
                    </div>
                    {selectedCoupon.createdBy.role && (
                      <div style={{ fontSize: "11px", color: "#9c27b0", marginTop: "4px" }}>
                        {selectedCoupon.createdBy.role}
                      </div>
                    )}
                  </div>
                )}

                {createdAt && (
                  <div style={{
                    padding: "12px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "8px",
                    border: "1px solid #bbdefb",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "12px", color: "#1565c0", fontWeight: "500", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <FiClockIcon size={12} />
                      Created On
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1565c0" }}>
                      {formatDate(createdAt)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#1976d2", marginTop: "4px" }}>
                      {formatTime(createdAt)}
                    </div>
                  </div>
                )}

                {updatedAt && (
                  <div style={{
                    padding: "12px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "8px",
                    border: "1px solid #c8e6c9",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "12px", color: "#2e7d32", fontWeight: "500", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <FiClockIcon size={12} />
                      Last Updated
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#2e7d32" }}>
                      {formatDate(updatedAt)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#4caf50", marginTop: "4px" }}>
                      {formatTime(updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {selectedCoupon.note && (
              <div style={{ gridColumn: isMobile ? "1" : "1 / span 2" }}>
                <h4 style={{
                  color: "#495057",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  paddingBottom: "8px",
                  borderBottom: "2px solid #e9ecef"
                }}>
                  <FiMessageSquare size={16} />
                  Additional Notes
                </h4>

                <div style={{
                  padding: "12px",
                  backgroundColor: "#fff3e0",
                  borderRadius: "8px",
                  border: "1px solid #ffe0b2",
                  fontSize: "14px",
                  color: "#f57c00"
                }}>
                  {selectedCoupon.note}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "space-between",
            flexWrap: isMobile ? "wrap" : "nowrap",
            paddingTop: "15px",
            borderTop: "1px solid #e9ecef"
          }}>
            <button
              onClick={() => copyToClipboard(selectedCoupon.couponCode)}
              style={{
                padding: "10px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flex: 1,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#5a6268"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#6c757d"}
            >
              <FiCopy size={14} />
              Copy Code
            </button>

            <button
              onClick={() => {
                closeViewModal();
                openEditModal(selectedCoupon);
              }}
              style={{
                padding: "10px 16px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flex: 1,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#138496"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#17a2b8"}
            >
              <FiEdit size={14} />
              Edit Coupon
            </button>

            <button
              onClick={closeViewModal}
              style={{
                padding: "10px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flex: 1,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#218838"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#28a745"}
            >
              <FiCheck size={14} />
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        maxWidth: "1000px",
        margin: "20px auto",
        gap: "15px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "15px",
      }}
    >
      {/* Mobile Toggle Button */}
      {isMobile && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
            width: "100%",
            marginBottom: "8px"
          }}
        >
          <FiPlus size={12} />
          Create New Coupon
        </button>
      )}

      {/* Form Section */}
      {(!isMobile || showForm) && (
        <div style={{ flex: isMobile ? 1 : 1, width: "100%" }}>
          {renderFormSection()}
        </div>
      )}

      {/* Coupons List Section */}
      <div style={{ flex: isMobile ? 1 : 2, width: "100%" }}>
        {renderCouponsList()}
      </div>

      {/* View Modal */}
      {viewModalOpen && renderViewModal()}

      {/* Edit Modal */}
      {editModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "15px",
            overflowY: "auto"
          }}
          onClick={(e) => e.target === e.currentTarget && closeEditModal()}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              maxWidth: "450px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{
                margin: 0,
                color: "#495057",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "16px"
              }}>
                <FiEdit size={14} />
                Edit Coupon
              </h3>
              <button
                onClick={closeEditModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#6c757d",
                  padding: "5px",
                }}
              >
                <FiX />
              </button>
            </div>

            {editingCoupon && (
              <div>
                {/* Coupon Code Field */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "4px",
                    color: "#495057",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px"
                  }}>
                    <FiHash size={11} />
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    name="couponCode"
                    value={modalFormData.couponCode}
                    onChange={handleModalInputChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: `1px solid ${modalErrors.couponCode ? "#dc3545" : "#ced4da"}`,
                      borderRadius: "5px",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}
                  />
                </div>

                {/* Discount Type and Value */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "120px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "4px",
                      color: "#495057",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px"
                    }}>
                      <FiPercent size={11} />
                      Discount Type *
                    </label>
                    <select
                      name="discountType"
                      value={modalFormData.discountType}
                      onChange={handleModalInputChange}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: `1px solid ${modalErrors.discountType ? "#dc3545" : "#ced4da"}`,
                        borderRadius: "5px",
                        fontSize: "12px",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                    >
                      {discountTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: "120px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "4px",
                      color: "#495057",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px"
                    }}>
                      {modalFormData.discountType === "percentage" ? <FiPercent size={11} /> : <FiDollarSign size={11} />}
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={modalFormData.discountValue}
                      onChange={handleModalInputChange}
                      min="0"
                      max={modalFormData.discountType === "percentage" ? "100" : undefined}
                      step="0.01"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: `1px solid ${modalErrors.discountValue ? "#dc3545" : "#ced4da"}`,
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "140px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "4px",
                      color: "#495057",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px"
                    }}>
                      <FiCalendar size={11} />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={modalFormData.startDate}
                      onChange={handleModalInputChange}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: `1px solid ${modalErrors.startDate ? "#dc3545" : "#ced4da"}`,
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: "140px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "4px",
                      color: "#495057",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px"
                    }}>
                      <FiCalendar size={11} />
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={modalFormData.endDate}
                      onChange={handleModalInputChange}
                      min={modalFormData.startDate}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: `1px solid ${modalErrors.endDate ? "#dc3545" : "#ced4da"}`,
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#495057",
                    fontWeight: "500",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={modalFormData.isActive}
                      onChange={handleModalInputChange}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer"
                      }}
                    />
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      Active Coupon
                    </span>
                  </label>
                </div>

                <div style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={closeEditModal}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "12px",
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updateLoading}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: updateLoading ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: updateLoading ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      flex: 1
                    }}
                  >
                    {updateLoading ? (
                      <>
                        <FiRefreshCw className="spin" size={12} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave size={12} />
                        Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        input:focus, select:focus, textarea:focus, button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        /* Improve scrollbar */
        div::-webkit-scrollbar {
          width: 4px;
        }
        
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 8px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        /* Better touch experience on mobile */
        @media (max-width: 768px) {
          button, input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CouponManager;