import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiRefreshCw, FiTrash2, FiEdit, FiImage, FiCheck, FiX, FiCheckCircle, FiAlertCircle, FiClock, FiPauseCircle } from "react-icons/fi";

const API_BASE = "https://api.vegiffy.in/api";

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
  const [updateLoadingId, setUpdateLoadingId] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const [modalStatus, setModalStatus] = useState("");

  // Get subAdminId from localStorage
  const getSubAdminId = () => {
    try {
      const userRole = localStorage.getItem("role");
      if (userRole === "subadmin") {
        return localStorage.getItem("adminId");
      }
      return null;
    } catch (error) {
      console.error("Error getting subAdminId:", error);
      return null;
    }
  };

  // Get user info for display
  const getUserInfo = () => {
    try {
      return {
        role: localStorage.getItem("role") || "unknown",
        name: localStorage.getItem("adminName") || "",
        email: localStorage.getItem("adminEmail") || "",
        id: localStorage.getItem("adminId") || ""
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
      if (!file.type.startsWith('image/')) {
        setUploadMessage("❌ Please select an image file.");
        return;
      }
      
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
    setUploadMessage("Uploading...");

    const formData = new FormData();
    // ✅ SINGLE image with field name 'image' (not images)
    formData.append("image", uploadImage);
    
    const subAdminId = getSubAdminId();
    if (subAdminId && subAdminId !== 'null') {
      formData.append("subAdminId", subAdminId);
    }

    try {
      const res = await fetch(`${API_BASE}/banner`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
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
      if (!file.type.startsWith('image/')) {
        alert("❌ Please select an image file.");
        return;
      }
      
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
      const subAdminId = getSubAdminId();
      
      // Update image if new file is selected
      if (modalFile) {
        const formData = new FormData();
        // ✅ SINGLE image with field name 'image'
        formData.append("image", modalFile);
        
        if (subAdminId && subAdminId !== 'null') {
          formData.append("subAdminId", subAdminId);
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
        const updateData = { status: modalStatus };
        
        if (subAdminId && subAdminId !== 'null') {
          updateData.subAdminId = subAdminId;
        }

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
      
      if (subAdminId && subAdminId !== 'null') {
        deleteData.subAdminId = subAdminId;
      }

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

  // Get status display
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

  const userInfo = getUserInfo();

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) {
      return `https://api.vegiffy.in${imagePath}`;
    }
    return imagePath;
  };

  return (
    <div style={{
      display: "flex",
      maxWidth: 1400,
      margin: "40px auto",
      gap: 40,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "0 20px",
      flexWrap: "wrap",
    }}>
      {/* Upload Panel */}
      <div style={{ flex: 1, minWidth: "320px" }}>
        <div style={{
          backgroundColor: "#ffffff",
          padding: "28px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e9ecef",
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            <h2 style={{ 
              color: "#2c3e50", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              margin: 0,
              fontSize: "24px"
            }}>
              <FiUpload size={24} color="#3498db" />
              Upload New Banner
            </h2>
            <div style={{
              fontSize: "12px",
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: userInfo.role === "subadmin" ? "#e3f2fd" : "#e8f5e9",
              color: userInfo.role === "subadmin" ? "#1976d2" : "#2e7d32",
              border: `1px solid ${userInfo.role === "subadmin" ? "#bbdef5" : "#c8e6c9"}`,
              fontWeight: "500"
            }}>
              👤 {userInfo.role === "subadmin" ? "Sub-Admin" : "Admin"}
              {userInfo.name && ` - ${userInfo.name}`}
            </div>
          </div>
          
          {userInfo.role === "subadmin" && (
            <div style={{
              marginBottom: "20px",
              padding: "12px",
              backgroundColor: "#fff3e0",
              border: "1px solid #ffe0b2",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#e65100",
            }}>
              📝 <strong>Note:</strong> Banner will be created under your name: <strong>{userInfo.name || "Sub-Admin"}</strong>
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
            
            <div
              onClick={handleUploadClick}
              style={{
                border: "2px dashed #3498db",
                borderRadius: "12px",
                padding: "40px 20px",
                textAlign: "center",
                cursor: uploadLoading ? "not-allowed" : "pointer",
                backgroundColor: uploadLoading ? "#f8f9fa" : "#f8f9ff",
                transition: "all 0.3s ease",
                marginBottom: "20px",
              }}
            >
              {uploadImage ? (
                <div>
                  <div style={{ color: "#27ae60", marginBottom: "10px" }}>
                    <FiCheck size={40} />
                  </div>
                  <div style={{ fontWeight: "600", color: "#2c3e50", marginBottom: "5px" }}>
                    Image Ready for Upload
                  </div>
                  <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                    {uploadImage.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#95a5a6", marginTop: "5px" }}>
                    {(uploadImage.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ color: "#7f8c8d", marginBottom: "10px" }}>
                    <FiUpload size={40} />
                  </div>
                  <div style={{ fontWeight: "600", color: "#2c3e50", marginBottom: "5px" }}>
                    Click to choose file
                  </div>
                  <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                    Supports: JPG, PNG, GIF, WEBP (max 5MB)
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={uploadLoading || !uploadImage}
              style={{
                padding: "14px 24px",
                fontSize: "16px",
                cursor: uploadLoading || !uploadImage ? "not-allowed" : "pointer",
                backgroundColor: uploadLoading || !uploadImage ? "#bdc3c7" : "#27ae60",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontWeight: "600",
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
                marginTop: "20px",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: uploadMessage.startsWith("✅") ? "#e8f5e9" : uploadMessage.startsWith("❌") ? "#ffebee" : "#fff3e0",
                color: uploadMessage.startsWith("✅") ? "#2e7d32" : uploadMessage.startsWith("❌") ? "#c62828" : "#e65100",
                border: `1px solid ${uploadMessage.startsWith("✅") ? "#c8e6c9" : uploadMessage.startsWith("❌") ? "#ffcdd2" : "#ffe0b2"}`,
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {uploadMessage}
            </div>
          )}
        </div>
      </div>

      {/* Banner List Panel - Same as before */}
      <div style={{ flex: 2, minWidth: "500px" }}>
        <div style={{
          backgroundColor: "#ffffff",
          padding: "28px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e9ecef",
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <h2 style={{ 
              color: "#2c3e50", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              margin: 0,
              fontSize: "24px"
            }}>
              <FiImage size={24} color="#3498db" />
              Existing Banners
              <span style={{ 
                fontSize: "14px", 
                color: "#7f8c8d", 
                fontWeight: "normal",
                backgroundColor: "#ecf0f1",
                padding: "2px 8px",
                borderRadius: "20px"
              }}>
                {banners.length}
              </span>
            </h2>
            <button
              onClick={fetchBanners}
              disabled={listLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#95a5a6",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: listLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <FiRefreshCw className={listLoading ? "spin" : ""} size={16} />
              Refresh
            </button>
          </div>

          {listLoading && (
            <div style={{ textAlign: "center", padding: "50px", color: "#7f8c8d" }}>
              <FiRefreshCw className="spin" size={32} />
              <p style={{ marginTop: "10px" }}>Loading banners...</p>
            </div>
          )}
          
          {listError && (
            <div style={{
              padding: "15px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "10px",
              border: "1px solid #ffcdd2",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              ❌ {listError}
            </div>
          )}
          
          {!listLoading && banners.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "#7f8c8d" }}>
              <FiImage size={48} style={{ opacity: 0.5, marginBottom: "15px" }} />
              <p>No banners found. Upload your first banner!</p>
            </div>
          )}

          {!listLoading && banners.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                borderRadius: "12px",
                overflow: "hidden",
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#34495e" }}>
                    <th style={{ padding: "16px", color: "white", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>
                      Preview & Info
                    </th>
                    <th style={{ padding: "16px", color: "white", textAlign: "center", width: "100px", fontSize: "14px", fontWeight: "600" }}>
                      Status
                    </th>
                    <th style={{ padding: "16px", color: "white", textAlign: "center", width: "100px", fontSize: "14px", fontWeight: "600" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner, index) => (
                    <tr key={banner._id} style={{ 
                      borderBottom: "1px solid #ecf0f1",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafbfc"
                    }}>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                          <img
                            src={getFullImageUrl(banner.image)}
                            alt="banner"
                            style={{
                              width: "100px",
                              height: "60px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "1px solid #e0e0e0",
                              backgroundColor: "#f5f5f5"
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/100x60?text=No+Image";
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: "600", color: "#2c3e50", marginBottom: "4px" }}>
                              Banner #{index + 1}
                            </div>
                            <div style={{ fontSize: "11px", color: "#7f8c8d", fontFamily: "monospace" }}>
                              {banner.image?.split('/').pop() || "No filename"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#95a5a6", marginTop: "4px" }}>
                              🕒 {new Date(banner.createdAt).toLocaleDateString('en-IN')}
                            </div>
                            {banner.note && (
                              <div style={{ fontSize: "10px", color: "#3498db", marginTop: "2px", fontStyle: "italic" }}>
                                📌 {banner.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {getStatusDisplay(banner.status)}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                          <button
                            onClick={() => openUpdateModal(banner)}
                            disabled={updateLoadingId === banner._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "8px",
                              backgroundColor: updateLoadingId === banner._id ? "#bdc3c7" : "#3498db",
                              border: "none",
                              borderRadius: "8px",
                              color: "white",
                              cursor: updateLoadingId === banner._id ? "not-allowed" : "pointer",
                              width: "36px",
                              height: "36px",
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
                              backgroundColor: updateLoadingId === banner._id ? "#bdc3c7" : "#e74c3c",
                              border: "none",
                              borderRadius: "8px",
                              color: "white",
                              cursor: updateLoadingId === banner._id ? "not-allowed" : "pointer",
                              width: "36px",
                              height: "36px",
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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            backdropFilter: "blur(4px)"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "550px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, color: "#2c3e50", display: "flex", alignItems: "center", gap: "10px", fontSize: "22px" }}>
                <FiEdit size={22} color="#3498db" />
                Update Banner
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#95a5a6",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiX size={24} />
              </button>
            </div>

            {selectedBanner && (
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ marginBottom: "12px", color: "#34495e", fontSize: "14px", fontWeight: "600" }}>Current Banner:</h4>
                  <div style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "12px",
                    textAlign: "center"
                  }}>
                    <img
                      src={getFullImageUrl(selectedBanner.image)}
                      alt="Current banner"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "180px",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x180?text=No+Image";
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ marginBottom: "12px", color: "#34495e", fontSize: "14px", fontWeight: "600" }}>Change Status:</h4>
                  <select
                    value={modalStatus}
                    onChange={handleModalStatusChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "10px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      cursor: "pointer",
                    }}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="active">✅ Active</option>
                    <option value="inactive">⏸️ Inactive</option>
                  </select>
                  <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "8px" }}>
                    Current status: <strong style={{ color: "#2c3e50" }}>{selectedBanner.status}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ marginBottom: "12px", color: "#34495e", fontSize: "14px", fontWeight: "600" }}>Update Image (Optional):</h4>
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
                      border: "2px dashed #3498db",
                      borderRadius: "12px",
                      padding: "30px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: "#f8f9ff",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {modalFile ? (
                      <div>
                        <div style={{ color: "#27ae60", marginBottom: "10px" }}>
                          <FiCheck size={28} />
                        </div>
                        <div style={{ fontWeight: "600", color: "#2c3e50" }}>Image Ready for Update</div>
                        <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "8px" }}>
                          {modalFile.name}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ color: "#7f8c8d", marginBottom: "10px" }}>
                          <FiUpload size={28} />
                        </div>
                        <div style={{ fontWeight: "600", color: "#2c3e50" }}>Click to choose new image</div>
                        <div style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "8px" }}>
                          Optional - JPG, PNG, GIF, WEBP (max 5MB)
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                {selectedBanner.note && (
                  <div style={{ 
                    marginBottom: "24px", 
                    padding: "12px", 
                    backgroundColor: "#f0f7ff", 
                    borderRadius: "10px",
                    fontSize: "12px",
                    color: "#1976d2",
                    borderLeft: "3px solid #3498db"
                  }}>
                    <strong>📝 Note:</strong> {selectedBanner.note}
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#95a5a6",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalUpdate}
                    disabled={updateLoadingId === selectedBanner._id}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: updateLoadingId === selectedBanner._id ? "#bdc3c7" : "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: updateLoadingId === selectedBanner._id ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
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