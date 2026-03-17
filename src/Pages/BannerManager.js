import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiRefreshCw, FiTrash2, FiEdit, FiImage, FiCheck, FiX, FiCheckCircle, FiAlertCircle, FiClock, FiPauseCircle } from "react-icons/fi";

const API_BASE = "https://api.vegiffyy.com/api";

const BannerManager = () => {
  // Upload state
  const [uploadImage, setUploadImage] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const uploadInputRef = useRef(null);

  // Banner list state
  const [banners, setBanners] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // Update state
  const [updateImages, setUpdateImages] = useState({});
  const [updateLoadingId, setUpdateLoadingId] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const [modalStatus, setModalStatus] = useState("");

  // Get subAdminId from localStorage (Login वाले format के अनुसार)
  const getSubAdminId = () => {
    try {
      // पहले check करें कि user subadmin है या नहीं
      const userRole = localStorage.getItem("role");
      
      if (userRole === "subadmin") {
        // Login में जैसे store किया था: localStorage.setItem('adminId', data.data.subAdminId)
        const adminId = localStorage.getItem("adminId");
        return adminId;
      }
      
      // अगर admin है या कोई role नहीं है तो null return करें
      return null;
    } catch (error) {
      console.error("Error getting subAdminId:", error);
      return null;
    }
  };

  // Get user info for display
  const getUserInfo = () => {
    try {
      const role = localStorage.getItem("role");
      const name = localStorage.getItem("adminName");
      const email = localStorage.getItem("adminEmail");
      const id = localStorage.getItem("adminId");
      
      return {
        role: role || "unknown",
        name: name || "",
        email: email || "",
        id: id || ""
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      return { role: "unknown", name: "", email: "", id: "" };
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await fetch(`${API_BASE}/banners`);
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      setBanners(data.data || []);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  // Upload handlers
  const handleUploadClick = () => uploadInputRef.current?.click();

  const handleUploadFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadMessage("❌ Please select an image file.");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadMessage("❌ File size should be less than 5MB.");
        return;
      }
      
      setUploadImage(file);
      setUploadMessage("✅ Image selected. Click Upload to proceed.");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadImage) {
      setUploadMessage("Please select an image first.");
      return;
    }
    setUploadLoading(true);
    setUploadMessage("");

    // FormData बनाएं
    const formData = new FormData();
    formData.append("image", uploadImage);
    
    // सबसे पहले subAdminId को JSON string में convert करें
    const subAdminId = getSubAdminId();
    console.log("SubAdmin ID from localStorage:", subAdminId);
    console.log("User Role:", localStorage.getItem("role"));
    
    if (subAdminId) {
      // subAdminId को string के रूप में append करें
      formData.append("subAdminId", subAdminId);
    }

    // Debug के लिए FormData contents check करें
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }

    try {
      const res = await fetch(`${API_BASE}/banner`, {
        method: "POST",
        body: formData,
        // Content-Type header ना डालें, browser automatically set करेगा multipart/form-data
      });
      
      const data = await res.json();
      console.log("Upload response:", data);
      
      if (res.ok) {
        setUploadMessage("✅ Banner uploaded successfully!");
        setUploadImage(null);
        if (uploadInputRef.current) uploadInputRef.current.value = "";
        fetchBanners();
      } else {
        setUploadMessage(`❌ Error: ${data.message || "Upload failed"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("❌ Network error: " + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Modal handlers
  const openUpdateModal = (banner) => {
    setSelectedBanner(banner);
    setModalFile(null);
    setModalStatus(banner.status || 'pending');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBanner(null);
    setModalFile(null);
    setModalStatus("");
  };

  const handleModalFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("❌ Please select an image file.");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ File size should be less than 5MB.");
        return;
      }
      
      setModalFile(file);
    }
  };

  const handleModalStatusChange = (e) => {
    setModalStatus(e.target.value);
  };

  const handleModalUpdate = async () => {
    if (!modalFile && modalStatus === selectedBanner.status) {
      alert("Please select a new image or change the status to update.");
      return;
    }

    setUpdateLoadingId(selectedBanner._id);

    try {
      // Update image if new file is selected
      if (modalFile) {
        const formData = new FormData();
        formData.append("image", modalFile);
        
        // Add subAdminId for update tracking
        const subAdminId = getSubAdminId();
        if (subAdminId) {
          formData.append("subAdminId", subAdminId);
        }

        console.log("Update FormData contents:");
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ', pair[1]);
        }

        const res = await fetch(`${API_BASE}/banners/${selectedBanner._id}`, {
          method: "PUT",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          alert(`❌ Error: ${data.message || "Update failed"}`);
          setUpdateLoadingId(null);
          return;
        }
      }

      // Update status if changed
      if (modalStatus !== selectedBanner.status) {
        const subAdminId = getSubAdminId();
        const updateData = { status: modalStatus };
        
        if (subAdminId) {
          updateData.subAdminId = subAdminId;
        }

        console.log("Status update data:", updateData);

        const statusRes = await fetch(`${API_BASE}/banners/${selectedBanner._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });
        const statusData = await statusRes.json();
        if (!statusRes.ok) {
          alert(`❌ Error: ${statusData.message || "Status update failed"}`);
          setUpdateLoadingId(null);
          return;
        }
      }

      alert("✅ Banner updated successfully!");
      closeModal();
      fetchBanners();
    } catch (error) {
      console.error("Update error:", error);
      alert("❌ Network error: " + error.message);
    } finally {
      setUpdateLoadingId(null);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const subAdminId = getSubAdminId();
      const deleteData = {};
      
      if (subAdminId) {
        deleteData.subAdminId = subAdminId;
      }

      console.log("Delete data:", deleteData);

      const res = await fetch(`${API_BASE}/banners/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deleteData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Banner deleted successfully!");
        fetchBanners();
      } else {
        alert(`❌ Error: ${data.message || "Delete failed"}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Network error: " + error.message);
    }
  };

  // Get status display for table
  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: {
        icon: <FiCheckCircle size={14} />,
        text: "Active",
        color: "#28a745",
        bgColor: "#d4edda",
        borderColor: "#c3e6cb"
      },
      inactive: {
        icon: <FiPauseCircle size={14} />,
        text: "Inactive",
        color: "#6c757d",
        bgColor: "#e2e3e5",
        borderColor: "#d6d8db"
      },
      pending: {
        icon: <FiClock size={14} />,
        text: "Pending",
        color: "#ffc107",
        bgColor: "#fff3cd",
        borderColor: "#ffeaa7"
      },
      updating: {
        icon: <FiRefreshCw className="spin" size={14} />,
        text: "Updating",
        color: "#17a2b8",
        bgColor: "#d1ecf1",
        borderColor: "#bee5eb"
      },
      error: {
        icon: <FiAlertCircle size={14} />,
        text: "Error",
        color: "#dc3545",
        bgColor: "#f8d7da",
        borderColor: "#f5c6cb"
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "500",
          color: config.color,
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}`,
        }}
      >
        {config.icon}
        {config.text}
      </div>
    );
  };

  // Get current user info for display
  const userInfo = getUserInfo();

  return (
    <div
      style={{
        display: "flex",
        maxWidth: 1200,
        margin: "40px auto",
        gap: 60,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "0 20px",
      }}
    >
      {/* Upload Panel */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e9ecef",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ color: "#495057", display: "flex", alignItems: "center", gap: "10px" }}>
              <FiUpload size={24} />
              Upload New Banner
            </h2>
            <div style={{
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: userInfo.role === "subadmin" ? "#d1ecf1" : "#d4edda",
              color: userInfo.role === "subadmin" ? "#0c5460" : "#155724",
              border: `1px solid ${userInfo.role === "subadmin" ? "#bee5eb" : "#c3e6cb"}`,
            }}>
              Logged in as: {userInfo.role === "subadmin" ? "Sub-Admin" : "Admin"}
            </div>
          </div>
          
          {userInfo.role === "subadmin" && (
            <div style={{
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#856404",
            }}>
              <strong>Note:</strong> Banner will be created under your name: <strong>{userInfo.name}</strong>
            </div>
          )}

          <form onSubmit={handleUploadSubmit}>
            <input
              type="file"
              accept="image/*"
              ref={uploadInputRef}
              onChange={handleUploadFileChange}
              style={{ display: "none" }}
              disabled={uploadLoading}
            />
            
            {/* Improved File Upload Area */}
            <div
              onClick={handleUploadClick}
              style={{
                border: "2px dashed #007bff",
                borderRadius: "8px",
                padding: "30px 20px",
                textAlign: "center",
                cursor: uploadLoading ? "not-allowed" : "pointer",
                backgroundColor: uploadLoading ? "#f8f9fa" : "#f8fbff",
                transition: "all 0.3s ease",
                marginBottom: "15px",
              }}
              onMouseOver={(e) => {
                if (!uploadLoading) {
                  e.target.style.borderColor = "#0056b3";
                  e.target.style.backgroundColor = "#e3f2fd";
                }
              }}
              onMouseOut={(e) => {
                if (!uploadLoading) {
                  e.target.style.borderColor = "#007bff";
                  e.target.style.backgroundColor = "#f8fbff";
                }
              }}
            >
              {uploadImage ? (
                <div style={{ color: "#28a745" }}>
                  <FiCheck size={32} style={{ marginBottom: "10px" }} />
                  <div style={{ fontWeight: "500" }}>Image Ready for Upload</div>
                  <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
                    {uploadImage.name}
                  </div>
                </div>
              ) : (
                <div style={{ color: "#6c757d" }}>
                  <FiUpload size={32} style={{ marginBottom: "10px" }} />
                  <div style={{ fontWeight: "500" }}>Click to choose file</div>
                  <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
                    Supports: JPG, PNG, GIF (max 5MB)
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={uploadLoading || !uploadImage}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                cursor: uploadLoading || !uploadImage ? "not-allowed" : "pointer",
                backgroundColor: uploadLoading || !uploadImage ? "#6c757d" : "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                if (!uploadLoading && uploadImage) e.target.style.backgroundColor = "#218838";
              }}
              onMouseOut={(e) => {
                if (!uploadLoading && uploadImage) e.target.style.backgroundColor = "#28a745";
              }}
            >
              {uploadLoading ? (
                <>
                  <FiRefreshCw className="spin" size={18} />
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload size={18} />
                  Upload Banner
                </>
              )}
            </button>
          </form>
          {uploadMessage && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: uploadMessage.startsWith("✅") ? "#d4edda" : "#f8d7da",
                color: uploadMessage.startsWith("✅") ? "#155724" : "#721c24",
                border: `1px solid ${uploadMessage.startsWith("✅") ? "#c3e6cb" : "#f5c6cb"}`,
                textAlign: "center",
                wordBreak: "break-word",
                fontSize: "14px",
              }}
            >
              {uploadMessage}
            </div>
          )}
          
          {/* Debug info (optional, remove in production) */}
          <div style={{ marginTop: "15px", fontSize: "11px", color: "#6c757d" }}>
            <div>User ID: {userInfo.id || "Not available"}</div>
            <div>User Role: {userInfo.role}</div>
          </div>
        </div>
      </div>

      {/* Banner List Panel */}
      <div style={{ flex: 2 }}>
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e9ecef",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ color: "#495057", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <FiImage size={24} />
              Existing Banners
            </h2>
            <button
              onClick={fetchBanners}
              disabled={listLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: listLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                if (!listLoading) e.target.style.backgroundColor = "#5a6268";
              }}
              onMouseOut={(e) => {
                if (!listLoading) e.target.style.backgroundColor = "#6c757d";
              }}
            >
              <FiRefreshCw className={listLoading ? "spin" : ""} size={16} />
              Refresh
            </button>
          </div>

          {listLoading && (
            <div style={{ textAlign: "center", padding: "20px", color: "#6c757d" }}>
              <FiRefreshCw className="spin" size={24} />
              <p>Loading banners...</p>
            </div>
          )}
          
          {listError && (
            <div style={{
              padding: "12px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              borderRadius: "6px",
              border: "1px solid #f5c6cb",
              marginBottom: "15px",
              textAlign: "center"
            }}>
              {listError}
            </div>
          )}
          
          {!listLoading && banners.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
              <FiImage size={48} style={{ opacity: 0.5, marginBottom: "10px" }} />
              <p>No banners found. Upload your first banner!</p>
            </div>
          )}

          {!listLoading && banners.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#007bff" }}>
                    <th style={{ padding: "15px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "left" }}>
                      Preview & Info
                    </th>
                    <th style={{ padding: "15px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "center", width: "100px" }}>
                      Status
                    </th>
                    <th style={{ padding: "15px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "center", width: "100px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner._id} style={{ borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "15px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          <img
                            src={banner.image}
                            alt="banner"
                            style={{
                              width: "120px",
                              height: "60px",
                              borderRadius: "6px",
                              objectFit: "cover",
                              border: "1px solid #dee2e6",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: "500", color: "#495057" }}>
                              Banner Image
                            </div>
                            <div style={{ fontSize: "12px", color: "#6c757d" }}>
                              {banner.image.split('/').pop()}
                            </div>
                            <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                              Created: {new Date(banner.createdAt).toLocaleDateString()}
                            </div>
                            {banner.note && (
                              <div style={{ fontSize: "11px", color: "#666", marginTop: "2px", fontStyle: "italic" }}>
                                {banner.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {getStatusDisplay(banner.status)}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => openUpdateModal(banner)}
                            disabled={updateLoadingId === banner._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "8px",
                              backgroundColor: updateLoadingId === banner._id ? "#e9ecef" : "#17a2b8",
                              border: "none",
                              borderRadius: "6px",
                              color: updateLoadingId === banner._id ? "#6c757d" : "white",
                              cursor: updateLoadingId === banner._id ? "not-allowed" : "pointer",
                              fontSize: "16px",
                              transition: "all 0.3s ease",
                              width: "36px",
                              height: "36px",
                            }}
                            onMouseOver={(e) => {
                              if (updateLoadingId !== banner._id) {
                                e.target.style.backgroundColor = "#138496";
                              }
                            }}
                            onMouseOut={(e) => {
                              if (updateLoadingId !== banner._id) {
                                e.target.style.backgroundColor = "#17a2b8";
                              }
                            }}
                            title="Update Banner"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            disabled={updateLoadingId === banner._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "8px",
                              backgroundColor: updateLoadingId === banner._id ? "#e9ecef" : "#dc3545",
                              border: "none",
                              borderRadius: "6px",
                              color: updateLoadingId === banner._id ? "#6c757d" : "white",
                              cursor: updateLoadingId === banner._id ? "not-allowed" : "pointer",
                              fontSize: "16px",
                              transition: "all 0.3s ease",
                              width: "36px",
                              height: "36px",
                            }}
                            onMouseOver={(e) => {
                              if (updateLoadingId !== banner._id) {
                                e.target.style.backgroundColor = "#c82333";
                              }
                            }}
                            onMouseOut={(e) => {
                              if (updateLoadingId !== banner._id) {
                                e.target.style.backgroundColor = "#dc3545";
                              }
                            }}
                            title="Delete Banner"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
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
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#495057", display: "flex", alignItems: "center", gap: "10px" }}>
                <FiEdit size={20} />
                Update Banner
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6c757d",
                  padding: "5px",
                }}
              >
                <FiX />
              </button>
            </div>

            {selectedBanner && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#495057" }}>Current Banner:</h4>
                  <img
                    src={selectedBanner.image}
                    alt="Current banner"
                    style={{
                      width: "100%",
                      maxHeight: "150px",
                      objectFit: "contain",
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#495057" }}>Change Status:</h4>
                  <select
                    value={modalStatus}
                    onChange={handleModalStatusChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ced4da",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
                    Current status: <strong>{selectedBanner.status}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#495057" }}>Update Image (Optional):</h4>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleModalFileChange}
                    style={{ display: "none" }}
                    id="modal-file-input"
                  />
                  <label
                    htmlFor="modal-file-input"
                    style={{
                      display: "block",
                      border: "2px dashed #007bff",
                      borderRadius: "8px",
                      padding: "20px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: "#f8fbff",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.borderColor = "#0056b3";
                      e.target.style.backgroundColor = "#e3f2fd";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.borderColor = "#007bff";
                      e.target.style.backgroundColor = "#f8fbff";
                    }}
                  >
                    {modalFile ? (
                      <div style={{ color: "#28a745" }}>
                        <FiCheck size={24} style={{ marginBottom: "10px" }} />
                        <div style={{ fontWeight: "500" }}>Image Ready for Update</div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
                          {modalFile.name}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: "#6c757d" }}>
                        <FiUpload size={24} style={{ marginBottom: "10px" }} />
                        <div style={{ fontWeight: "500" }}>Click to choose new image</div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
                          Optional - Supports: JPG, PNG, GIF (max 5MB)
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalUpdate}
                    disabled={updateLoadingId === selectedBanner._id}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: updateLoadingId === selectedBanner._id ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: updateLoadingId === selectedBanner._id ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {updateLoadingId === selectedBanner._id ? (
                      <>
                        <FiRefreshCw className="spin" size={16} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiCheck size={16} />
                        Update Banner
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
      `}</style>
    </div>
  );
};

export default BannerManager;