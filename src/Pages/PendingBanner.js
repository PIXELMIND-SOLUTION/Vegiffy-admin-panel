import React, { useState, useEffect, useRef } from "react";
import { 
  FiRefreshCw, 
  FiTrash2, 
  FiEdit, 
  FiImage, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiPauseCircle,
  FiX,
  FiCheck,
  FiUpload,
  FiEye,
  FiUser,
  FiInfo
} from "react-icons/fi";

const API_BASE = "https://api.vegiffy.in/api";

const PendingBanner = () => {
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
  
  // View Details Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewBanner, setViewBanner] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await fetch(`${API_BASE}/pendingbanners`);
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      
      // Check if data is in response.data or direct
      const bannersData = data.data || data || [];
      setBanners(bannersData);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  // Modal handlers
  const openUpdateModal = (banner) => {
    setSelectedBanner(banner);
    setModalFile(null);
    setModalStatus(banner.status || 'pending');
    setModalOpen(true);
  };

  const openViewModal = (banner) => {
    setViewBanner(banner);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBanner(null);
    setModalFile(null);
    setModalStatus("");
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewBanner(null);
  };

  const handleModalFileChange = (e) => {
    setModalFile(e.target.files[0]);
  };

  const handleModalStatusChange = (e) => {
    setModalStatus(e.target.value);
  };

  // Get user info from localStorage (for subAdminId tracking)
  const getSubAdminId = () => {
    try {
      const userRole = localStorage.getItem("role");
      if (userRole === "subadmin") {
        const adminId = localStorage.getItem("adminId");
        return adminId;
      }
      return null;
    } catch (error) {
      console.error("Error getting subAdminId:", error);
      return null;
    }
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
      
      // If status changed to active, remove from the list immediately
      if (modalStatus === 'active') {
        setBanners(prevBanners => prevBanners.filter(banner => banner._id !== selectedBanner._id));
      } else {
        // For other status changes, refetch to get updated data
        fetchBanners();
      }
    } catch (error) {
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
        // Remove from local state immediately
        setBanners(prevBanners => prevBanners.filter(banner => banner._id !== id));
      } else {
        alert(`❌ Error: ${data.message || "Delete failed"}`);
      }
    } catch (error) {
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "40px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "0 20px",
      }}
    >
      {/* Banner List Panel */}
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
            Pending Banners
          </h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{
              fontSize: "14px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffeaa7",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <FiInfo size={16} />
              Total: {banners.length} banners
            </div>
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
            <p>No pending banners found.</p>
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
                  <th style={{ padding: "15px", borderBottom: "2px solid #dee2e6", color: "white", textAlign: "center", width: "140px" }}>
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
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "500", color: "#495057" }}>
                            Banner Image
                          </div>
                          <div style={{ fontSize: "12px", color: "#6c757d" }}>
                            {banner.image.split('/').pop()}
                          </div>
                          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                            Created: {formatDate(banner.createdAt)}
                          </div>
                          {banner.note && (
                            <div style={{ 
                              fontSize: "11px", 
                              color: "#666", 
                              marginTop: "4px",
                              padding: "4px 8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "4px",
                              borderLeft: "3px solid #007bff"
                            }}>
                              <strong>Note:</strong> {banner.note}
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
                          onClick={() => openViewModal(banner)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px",
                            backgroundColor: "#6c757d",
                            border: "none",
                            borderRadius: "6px",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "16px",
                            transition: "all 0.3s ease",
                            width: "36px",
                            height: "36px",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#5a6268";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#6c757d";
                          }}
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
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
                  {modalStatus === 'active' && (
                    <div style={{ fontSize: "12px", color: "#28a745", marginTop: "5px", fontStyle: "italic" }}>
                      Note: This banner will be removed from the pending list once activated.
                    </div>
                  )}
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
                        <div style={{ fontWeight: "500" }}>{modalFile.name}</div>
                      </div>
                    ) : (
                      <div style={{ color: "#6c757d" }}>
                        <FiUpload size={24} style={{ marginBottom: "10px" }} />
                        <div style={{ fontWeight: "500" }}>Click to choose new image</div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
                          Optional - leave empty to keep current image
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

      {/* View Details Modal */}
      {viewModalOpen && viewBanner && (
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
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#495057", display: "flex", alignItems: "center", gap: "10px" }}>
                <FiInfo size={20} />
                Banner Details
              </h3>
              <button
                onClick={closeViewModal}
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

            <div style={{ marginBottom: "25px" }}>
              <h4 style={{ marginBottom: "10px", color: "#495057" }}>Banner Preview:</h4>
              <img
                src={viewBanner.image}
                alt="Banner"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
              <div>
                <h4 style={{ marginBottom: "10px", color: "#495057", fontSize: "16px" }}>Basic Information</h4>
                <div style={{ 
                  backgroundColor: "#f8f9fa", 
                  padding: "15px", 
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }}>
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "3px" }}>Banner ID</div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#495057", wordBreak: "break-all" }}>
                      {viewBanner._id}
                    </div>
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "3px" }}>Status</div>
                    <div>
                      {getStatusDisplay(viewBanner.status)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "3px" }}>Created</div>
                    <div style={{ fontSize: "14px", color: "#495057" }}>
                      {formatDate(viewBanner.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: "10px", color: "#495057", fontSize: "16px" }}>Creator Information</h4>
                <div style={{ 
                  backgroundColor: "#f8f9fa", 
                  padding: "15px", 
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }}>
                  {viewBanner.createdBy ? (
                    <>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "3px" }}>Created By ID</div>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#495057", wordBreak: "break-all" }}>
                          {viewBanner.createdBy}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "3px" }}>Note</div>
                        <div style={{ fontSize: "14px", color: "#495057", fontStyle: "italic" }}>
                          {viewBanner.note || "No note available"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px", 
                      color: "#6c757d",
                      fontStyle: "italic"
                    }}>
                      <FiUser size={16} />
                      Created by Main Admin
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <h4 style={{ marginBottom: "10px", color: "#495057", fontSize: "16px" }}>Image Details</h4>
              <div style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "15px", 
                borderRadius: "8px",
                border: "1px solid #e9ecef"
              }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "3px" }}>Image URL</div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#495057", 
                    wordBreak: "break-all",
                    padding: "8px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6"
                  }}>
                    {viewBanner.image}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: "#e3f2fd", 
              padding: "15px", 
              borderRadius: "8px",
              border: "1px solid #bbdefb",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <FiInfo size={18} color="#1976d2" />
              <div style={{ fontSize: "14px", color: "#0d47a1" }}>
                <strong>Note:</strong> This banner is currently pending approval. You can activate it using the Update button.
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                onClick={() => {
                  closeViewModal();
                  openUpdateModal(viewBanner);
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FiEdit size={16} />
                Update Banner
              </button>
              <button
                onClick={closeViewModal}
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
                Close
              </button>
            </div>
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

export default PendingBanner;