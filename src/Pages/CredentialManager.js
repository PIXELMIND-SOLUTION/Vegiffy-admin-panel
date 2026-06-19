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
  FiChevronUp
} from "react-icons/fi";

const API_BASE = "https://api.vegiffy.in/api/admin";

const CredentialManager = () => {
  // Form state
  const [formData, setFormData] = useState({
    type: "",
    email: "",
    mobile: "",
    whatsappNumber: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Credentials list state
  const [credentials, setCredentials] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    type: "",
    email: "",
    mobile: "",
    whatsappNumber: ""
  });
  const [modalErrors, setModalErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  const storedRole = sessionStorage.getItem("role");


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

  // Available credential types with icons
  const credentialTypes = [
    { value: "user", label: "User", icon: <FiUser size={14} /> },
    { value: "rider", label: "Rider", icon: <FiTruck size={14} /> },
    { value: "vendor", label: "Vendor", icon: <FiShoppingBag size={14} /> },
    { value: "ambassador", label: "Ambassador", icon: <FiAward size={14} /> },
    { value: "staff", label: "Staff", icon: <FiUsers size={14} /> }
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
    fetchCredentials();
    setUserInfo(getUserInfo());
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch all credentials
  const fetchCredentials = async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await fetch(`https://api.vegiffy.in/api/getallcredential`);
      if (!res.ok) throw new Error("Failed to fetch credentials");
      const data = await res.json();
      setCredentials(data.credentials || []);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    const { name, value } = e.target;
    setModalFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!data.type.trim()) {
      errors.type = "Type is required";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(data.mobile)) {
      errors.mobile = "Mobile number must be 10 digits";
    }

    // WhatsApp number validation (optional but must be 10 digits if provided)
    if (data.whatsappNumber && !/^\d{10}$/.test(data.whatsappNumber)) {
      errors.whatsappNumber = "WhatsApp number must be 10 digits";
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
      // Add note for sub-admin action
      requestData.note = `${userInfo.role === "subadmin" ? "Sub-admin" : "Admin"}: ${userInfo.name}`;
    }

    return requestData;
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

      const res = await fetch(`${API_BASE}/addcredential`, {
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
          text: `✅ Credential added successfully${userInfo.role === "subadmin" ? ` by ${userInfo.name}` : ""}!`
        });

        // Reset form
        setFormData({
          type: "",
          email: "",
          mobile: "",
          whatsappNumber: ""
        });

        // Refresh list
        fetchCredentials();
      } else {
        setFormMessage({
          type: "error",
          text: `❌ Error: ${data.message || "Failed to add credential"}`
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

  // Open edit modal
  const openEditModal = (credential) => {
    setEditingCredential(credential);
    setModalFormData({
      type: credential.type,
      email: credential.email,
      mobile: credential.mobile,
      whatsappNumber: credential.whatsappNumber || ""
    });
    setModalErrors({});
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingCredential(null);
    setModalFormData({
      type: "",
      email: "",
      mobile: "",
      whatsappNumber: ""
    });
    setModalErrors({});
  };

  // Handle credential update
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

      const res = await fetch(`${API_BASE}/updatecredential/${editingCredential._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Credential updated successfully${userInfo.role === "subadmin" ? ` by ${userInfo.name}` : ""}!`);
        closeModal();
        fetchCredentials();
      } else {
        alert(`❌ Error: ${data.message || "Failed to update credential"}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle credential deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this credential?")) return;

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

      const res = await fetch(`${API_BASE}/deletecredential/${id}`, config);

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Credential deleted successfully${userInfo.role === "subadmin" ? ` by ${userInfo.name}` : ""}!`);
        fetchCredentials();
      } else {
        alert(`❌ Error: ${data.message || "Failed to delete credential"}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    }
  };

  // Get type display with icon
  const getTypeDisplay = (type) => {
    const typeConfig = credentialTypes.find(t => t.value === type);

    if (typeConfig) {
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: isMobile ? "10px" : "12px",
          fontWeight: "500",
          color: "#495057",
          backgroundColor: "#e9ecef",
          border: "1px solid #dee2e6",
          textTransform: "capitalize"
        }}>
          {typeConfig.icon}
          {isMobile ? typeConfig.label.substring(0, 3) : typeConfig.label}
        </div>
      );
    }

    return (
      <div style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: isMobile ? "10px" : "12px",
        fontWeight: "500",
        color: "#495057",
        backgroundColor: "#e9ecef",
        border: "1px solid #dee2e6",
        textTransform: "capitalize"
      }}>
        {isMobile ? type.substring(0, 3) : type}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: isMobile ? 'numeric' : 'short',
      day: 'numeric'
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(credentials.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCredentials = credentials.slice(startIndex, endIndex);

  // Render form section
  const renderFormSection = () => (
    <div style={{
      backgroundColor: "#f8f9fa",
      padding: isMobile ? "15px" : "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      border: "1px solid #e9ecef",
      marginBottom: isMobile ? "15px" : "0"
    }}>
      <div style={{ marginBottom: "15px" }}>
        <h2 style={{
          marginBottom: "8px",
          color: "#495057",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: isMobile ? "18px" : "22px"
        }}>
          <FiPlus size={isMobile ? 18 : 22} />
          Add New Credential
        </h2>

        {/* User Role Display */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "15px",
          padding: "8px 12px",
          backgroundColor: userInfo.role === "subadmin" ? "#f3e8ff" : "#dbeafe",
          borderRadius: "6px",
          border: `1px solid ${userInfo.role === "subadmin" ? "#e9d5ff" : "#bfdbfe"}`,
        }}>
          <FiUserCheck size={isMobile ? 14 : 16} color={userInfo.role === "subadmin" ? "#7c3aed" : "#1d4ed8"} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: isMobile ? "12px" : "13px",
              fontWeight: "600",
              color: userInfo.role === "subadmin" ? "#7c3aed" : "#1d4ed8",
              lineHeight: "1.2"
            }}>
              {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
            </div>
            {userInfo.role === "subadmin" && (
              <div style={{
                fontSize: "10px",
                color: "#6b7280",
                marginTop: "2px"
              }}>
                Actions recorded under your name
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Type Field */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{
            display: "block",
            marginBottom: "6px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: isMobile ? "13px" : "14px"
          }}>
            <FiType size={14} />
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: isMobile ? "10px" : "12px",
              border: `1px solid ${formErrors.type ? "#dc3545" : "#ced4da"}`,
              borderRadius: "6px",
              fontSize: isMobile ? "13px" : "14px",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <option value="">Select Type</option>
            {credentialTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {formErrors.type && (
            <div style={{
              color: "#dc3545",
              fontSize: "11px",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <FiAlertCircle size={10} />
              {formErrors.type}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{
            display: "block",
            marginBottom: "6px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: isMobile ? "13px" : "14px"
          }}>
            <FiMail size={14} />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            style={{
              width: "100%",
              padding: isMobile ? "10px" : "12px",
              border: `1px solid ${formErrors.email ? "#dc3545" : "#ced4da"}`,
              borderRadius: "6px",
              fontSize: isMobile ? "13px" : "14px",
              transition: "all 0.2s ease",
            }}
          />
          {formErrors.email && (
            <div style={{
              color: "#dc3545",
              fontSize: "11px",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <FiAlertCircle size={10} />
              {formErrors.email}
            </div>
          )}
        </div>

        {/* Mobile Field */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{
            display: "block",
            marginBottom: "6px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: isMobile ? "13px" : "14px"
          }}>
            <FiPhone size={14} />
            Mobile Number *
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            style={{
              width: "100%",
              padding: isMobile ? "10px" : "12px",
              border: `1px solid ${formErrors.mobile ? "#dc3545" : "#ced4da"}`,
              borderRadius: "6px",
              fontSize: isMobile ? "13px" : "14px",
              transition: "all 0.2s ease",
            }}
          />
          {formErrors.mobile && (
            <div style={{
              color: "#dc3545",
              fontSize: "11px",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <FiAlertCircle size={10} />
              {formErrors.mobile}
            </div>
          )}
        </div>

        {/* WhatsApp Number Field */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "6px",
            color: "#495057",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: isMobile ? "13px" : "14px"
          }}>
            <FiMessageSquare size={14} />
            WhatsApp Number (Optional)
          </label>
          <input
            type="tel"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleInputChange}
            placeholder="Enter 10-digit WhatsApp number"
            maxLength="10"
            style={{
              width: "100%",
              padding: isMobile ? "10px" : "12px",
              border: `1px solid ${formErrors.whatsappNumber ? "#dc3545" : "#ced4da"}`,
              borderRadius: "6px",
              fontSize: isMobile ? "13px" : "14px",
              transition: "all 0.2s ease",
            }}
          />
          {formErrors.whatsappNumber && (
            <div style={{
              color: "#dc3545",
              fontSize: "11px",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <FiAlertCircle size={10} />
              {formErrors.whatsappNumber}
            </div>
          )}
          <p style={{ fontSize: "11px", color: "#6c757d", marginTop: "4px" }}>
            Leave empty if same as mobile number
          </p>
        </div>

        <button
          type="submit"
          disabled={formLoading}
          style={{
            padding: isMobile ? "10px" : "12px",
            fontSize: isMobile ? "14px" : "15px",
            cursor: formLoading ? "not-allowed" : "pointer",
            backgroundColor: formLoading ? "#6c757d" : "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontWeight: "500",
            transition: "all 0.2s ease",
          }}
        >
          {formLoading ? (
            <>
              <FiRefreshCw className="spin" size={16} />
              Adding...
            </>
          ) : (
            <>
              <FiPlus size={16} />
              Add Credential
            </>
          )}
        </button>
      </form>

      {formMessage && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: formMessage.type === "success" ? "#d4edda" : "#f8d7da",
            color: formMessage.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${formMessage.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
            textAlign: "center",
            wordBreak: "break-word",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          {formMessage.type === "success" ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
          {formMessage.text}
        </div>
      )}
    </div>
  );

  // Render credentials list
  const renderCredentialsList = () => (
    <div style={{
      backgroundColor: "#f8f9fa",
      padding: isMobile ? "15px" : "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      border: "1px solid #e9ecef",
      flex: isMobile ? 1 : 2
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
        flexWrap: isMobile ? "wrap" : "nowrap",
        gap: isMobile ? "10px" : "0"
      }}>
        <h2 style={{
          color: "#495057",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: 0,
          fontSize: isMobile ? "18px" : "22px"
        }}>
          <FiShield size={isMobile ? 18 : 22} />
          Manage Credentials
          {isMobile && (
            <span style={{
              fontSize: "12px",
              backgroundColor: "#007bff",
              color: "white",
              padding: "2px 8px",
              borderRadius: "10px",
              marginLeft: "8px"
            }}>
              {credentials.length}
            </span>
          )}
        </h2>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isMobile && showForm && (
            <button
              onClick={() => setShowForm(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              <FiChevronUp size={12} />
              Hide Form
            </button>
          )}

          <button
            onClick={fetchCredentials}
            disabled={listLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: listLoading ? "not-allowed" : "pointer",
              fontSize: isMobile ? "12px" : "14px",
              transition: "all 0.2s ease",
            }}
          >
            <FiRefreshCw className={listLoading ? "spin" : ""} size={14} />
            {isMobile ? "Refresh" : "Refresh List"}
          </button>
        </div>
      </div>

      {listLoading && (
        <div style={{ textAlign: "center", padding: "30px", color: "#6c757d" }}>
          <FiRefreshCw className="spin" size={24} />
          <p style={{ marginTop: "10px", fontSize: "14px" }}>Loading credentials...</p>
        </div>
      )}

      {listError && (
        <div style={{
          padding: "10px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "6px",
          border: "1px solid #f5c6cb",
          marginBottom: "15px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: "13px"
        }}>
          <FiAlertCircle size={14} />
          {listError}
        </div>
      )}

      {!listLoading && credentials.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
          <FiShield size={36} style={{ opacity: 0.5, marginBottom: "10px" }} />
          <p style={{ fontSize: "14px" }}>No credentials found. Add your first credential!</p>
        </div>
      )}

      {!listLoading && credentials.length > 0 && (
        <>
          {/* Pagination Controls */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            <div style={{ fontSize: "13px", color: "#6c757d" }}>
              Showing {startIndex + 1}-{Math.min(endIndex, credentials.length)} of {credentials.length} credentials
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(0);
                }}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "13px",
                  backgroundColor: "white"
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: currentPage === 0 ? "#e9ecef" : "#007bff",
                    color: currentPage === 0 ? "#6c757d" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === 0 ? "not-allowed" : "pointer",
                    fontSize: "13px"
                  }}
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: currentPage >= totalPages - 1 ? "#e9ecef" : "#007bff",
                    color: currentPage >= totalPages - 1 ? "#6c757d" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                    fontSize: "13px"
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Table for larger screens */}
          {!isMobile && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  fontSize: "14px"
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#007bff" }}>
                    <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "left", width: "100px" }}>
                      Type
                    </th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "left" }}>
                      Email
                    </th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "left", width: "120px" }}>
                      Mobile
                    </th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "left", width: "120px" }}>
                      WhatsApp
                    </th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "center", width: "140px" }}>
                      Admin Info
                    </th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "center", width: "90px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCredentials.map((credential) => (
                    <tr key={credential._id} style={{ borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "12px" }}>
                        {getTypeDisplay(credential.type)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiMail size={12} color="#6c757d" />
                          <span style={{ fontWeight: "500", color: "#495057", fontSize: "13px" }}>
                            {credential.email}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiPhone size={12} color="#6c757d" />
                          <span style={{ fontWeight: "500", color: "#495057", fontSize: "13px" }}>
                            {credential.mobile}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiMessageSquare size={12} color={credential.whatsappNumber ? "#25D366" : "#6c757d"} />
                          <span style={{
                            fontWeight: "500",
                            color: credential.whatsappNumber ? "#25D366" : "#6c757d",
                            fontStyle: !credential.whatsappNumber ? "italic" : "normal",
                            fontSize: "13px"
                          }}>
                            {credential.whatsappNumber || "Not set"}
                          </span>
                        </div>
                        {!credential.whatsappNumber && (
                          <div style={{ fontSize: "10px", color: "#999", marginTop: "2px" }}>
                            Same as mobile
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ fontSize: "12px" }}>
                          {credential.note && (
                            <div style={{
                              color: "#6c757d",
                              marginBottom: "4px",
                              padding: "4px 6px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "4px",
                              border: "1px solid #e9ecef",
                              fontSize: "11px"
                            }}>
                              {credential.note}
                            </div>
                          )}
                          <div style={{ fontSize: "11px", color: "#999" }}>
                            {formatDate(credential.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            onClick={() => openEditModal(credential)}
                            disabled={updateLoading}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px",
                              backgroundColor: updateLoading ? "#e9ecef" : "#17a2b8",
                              border: "none",
                              borderRadius: "4px",
                              color: updateLoading ? "#6c757d" : "white",
                              cursor: updateLoading ? "not-allowed" : "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              width: "32px",
                              height: "32px",
                            }}
                            title="Edit Credential"
                          >
                            <FiEdit size={14} />
                          </button>
                          {storedRole === 'admin' && (
                            <button
                              onClick={() => handleDelete(credential._id)}
                              disabled={updateLoading}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "6px",
                                backgroundColor: updateLoading ? "#e9ecef" : "#dc3545",
                                border: "none",
                                borderRadius: "4px",
                                color: updateLoading ? "#6c757d" : "white",
                                cursor: updateLoading ? "not-allowed" : "pointer",
                                fontSize: "14px",
                                transition: "all 0.2s ease",
                                width: "32px",
                                height: "32px",
                              }}
                              title="Delete Credential"
                            >
                              <FiTrash2 size={14} />
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
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {displayedCredentials.map((credential) => (
                <div key={credential._id} style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "12px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #e9ecef"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      {getTypeDisplay(credential.type)}
                      <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
                        {formatDate(credential.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => openEditModal(credential)}
                        disabled={updateLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px",
                          backgroundColor: updateLoading ? "#e9ecef" : "#17a2b8",
                          border: "none",
                          borderRadius: "4px",
                          color: updateLoading ? "#6c757d" : "white",
                          cursor: updateLoading ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          width: "28px",
                          height: "28px",
                        }}
                        title="Edit"
                      >
                        <FiEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(credential._id)}
                        disabled={updateLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px",
                          backgroundColor: updateLoading ? "#e9ecef" : "#dc3545",
                          border: "none",
                          borderRadius: "4px",
                          color: updateLoading ? "#6c757d" : "white",
                          cursor: updateLoading ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          width: "28px",
                          height: "28px",
                        }}
                        title="Delete"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiMail size={12} color="#6c757d" />
                      <span style={{
                        fontSize: "13px",
                        color: "#495057",
                        wordBreak: "break-all"
                      }}>
                        {credential.email}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiPhone size={12} color="#6c757d" />
                      <span style={{ fontSize: "13px", color: "#495057" }}>
                        {credential.mobile}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiMessageSquare size={12} color={credential.whatsappNumber ? "#25D366" : "#6c757d"} />
                      <span style={{
                        fontSize: "13px",
                        color: credential.whatsappNumber ? "#25D366" : "#6c757d",
                        fontStyle: !credential.whatsappNumber ? "italic" : "normal"
                      }}>
                        {credential.whatsappNumber || "WhatsApp not set"}
                      </span>
                    </div>

                    {credential.note && (
                      <div style={{
                        fontSize: "11px",
                        color: "#6c757d",
                        padding: "6px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        border: "1px solid #e9ecef",
                        marginTop: "4px"
                      }}>
                        <strong>Note:</strong> {credential.note}
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
            marginTop: "15px",
            flexWrap: "wrap",
            gap: "5px"
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
                    padding: "6px 10px",
                    backgroundColor: currentPage === pageNum ? "#007bff" : "#e9ecef",
                    color: currentPage === pageNum ? "white" : "#495057",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    minWidth: "32px"
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        maxWidth: 1200,
        margin: isMobile ? "20px auto" : "40px auto",
        gap: isMobile ? "15px" : "30px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: isMobile ? "10px" : "20px",
        minHeight: "100vh"
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
            gap: "8px",
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            width: "100%",
            marginBottom: "10px"
          }}
        >
          <FiPlus size={16} />
          Add New Credential
          <FiChevronDown size={16} style={{ marginLeft: "auto" }} />
        </button>
      )}

      {/* Form Section */}
      {(!isMobile || showForm) && (
        <div style={{ flex: isMobile ? 1 : 1 }}>
          {renderFormSection()}
        </div>
      )}

      {/* Credentials List Section */}
      <div style={{ flex: isMobile ? 1 : 2 }}>
        {renderCredentialsList()}
      </div>

      {/* Edit Modal */}
      {modalOpen && (
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
            padding: "20px",
            overflowY: "auto"
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: isMobile ? "20px" : "25px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{
                margin: 0,
                color: "#495057",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: isMobile ? "18px" : "20px"
              }}>
                <FiEdit size={isMobile ? 16 : 18} />
                Edit Credential
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#6c757d",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FiX />
              </button>
            </div>

            {/* User Role Display in Modal */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "15px",
              padding: "8px 12px",
              backgroundColor: userInfo.role === "subadmin" ? "#f3e8ff" : "#dbeafe",
              borderRadius: "6px",
              border: `1px solid ${userInfo.role === "subadmin" ? "#e9d5ff" : "#bfdbfe"}`,
            }}>
              <FiInfo size={14} color={userInfo.role === "subadmin" ? "#7c3aed" : "#1d4ed8"} />
              <div style={{ fontSize: "12px", color: userInfo.role === "subadmin" ? "#7c3aed" : "#1d4ed8" }}>
                {userInfo.role === "subadmin"
                  ? `Editing as Sub-Admin: ${userInfo.name}`
                  : "Editing as Admin"}
              </div>
            </div>

            {editingCredential && (
              <div>
                {/* Type Field */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#495057",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px"
                  }}>
                    <FiType size={14} />
                    Type
                  </label>
                  <select
                    name="type"
                    value={modalFormData.type}
                    onChange={handleModalInputChange}
                    style={{
                      width: "100%",
                      padding: isMobile ? "10px" : "12px",
                      border: `1px solid ${modalErrors.type ? "#dc3545" : "#ced4da"}`,
                      borderRadius: "6px",
                      fontSize: isMobile ? "13px" : "14px",
                      backgroundColor: "white",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Select Type</option>
                    {credentialTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {modalErrors.type && (
                    <div style={{
                      color: "#dc3545",
                      fontSize: "11px",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <FiAlertCircle size={10} />
                      {modalErrors.type}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#495057",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px"
                  }}>
                    <FiMail size={14} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={modalFormData.email}
                    onChange={handleModalInputChange}
                    placeholder="Enter email address"
                    style={{
                      width: "100%",
                      padding: isMobile ? "10px" : "12px",
                      border: `1px solid ${modalErrors.email ? "#dc3545" : "#ced4da"}`,
                      borderRadius: "6px",
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  />
                  {modalErrors.email && (
                    <div style={{
                      color: "#dc3545",
                      fontSize: "11px",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <FiAlertCircle size={10} />
                      {modalErrors.email}
                    </div>
                  )}
                </div>

                {/* Mobile Field */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#495057",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px"
                  }}>
                    <FiPhone size={14} />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={modalFormData.mobile}
                    onChange={handleModalInputChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    style={{
                      width: "100%",
                      padding: isMobile ? "10px" : "12px",
                      border: `1px solid ${modalErrors.mobile ? "#dc3545" : "#ced4da"}`,
                      borderRadius: "6px",
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  />
                  {modalErrors.mobile && (
                    <div style={{
                      color: "#dc3545",
                      fontSize: "11px",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <FiAlertCircle size={10} />
                      {modalErrors.mobile}
                    </div>
                  )}
                </div>

                {/* WhatsApp Number Field */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#495057",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px"
                  }}>
                    <FiMessageSquare size={14} />
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={modalFormData.whatsappNumber}
                    onChange={handleModalInputChange}
                    placeholder="Enter 10-digit WhatsApp number"
                    maxLength="10"
                    style={{
                      width: "100%",
                      padding: isMobile ? "10px" : "12px",
                      border: `1px solid ${modalErrors.whatsappNumber ? "#dc3545" : "#ced4da"}`,
                      borderRadius: "6px",
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  />
                  {modalErrors.whatsappNumber && (
                    <div style={{
                      color: "#dc3545",
                      fontSize: "11px",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <FiAlertCircle size={10} />
                      {modalErrors.whatsappNumber}
                    </div>
                  )}
                  <p style={{ fontSize: "11px", color: "#6c757d", marginTop: "4px" }}>
                    Leave empty if same as mobile number
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  flexWrap: isMobile ? "wrap" : "nowrap"
                }}>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: isMobile ? "8px 16px" : "10px 20px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: isMobile ? "13px" : "14px",
                      flex: isMobile ? 1 : "auto"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updateLoading}
                    style={{
                      padding: isMobile ? "8px 16px" : "10px 20px",
                      backgroundColor: updateLoading ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: updateLoading ? "not-allowed" : "pointer",
                      fontSize: isMobile ? "13px" : "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      flex: isMobile ? 1 : "auto"
                    }}
                  >
                    {updateLoading ? (
                      <>
                        <FiRefreshCw className="spin" size={14} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave size={14} />
                        Update Credential
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
        
        input:focus, select:focus, button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        /* Improve scrollbar for modal */
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        /* Better touch experience on mobile */
        @media (max-width: 768px) {
          button, input, select {
            font-size: 16px !important; /* Prevents iOS zoom on focus */
          }
        }
      `}</style>
    </div>
  );
};

export default CredentialManager;