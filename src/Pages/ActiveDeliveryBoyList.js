import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaMotorcycle,
  FaMapMarkerAlt,
  FaIdCard,
  FaCar,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaImage,
  FaDollarSign,
  FaCog,
  FaSave,
  FaTimes,
  FaSync,
  FaWallet,
  FaDownload,
  FaFilePdf,
  FaExpand,
  FaUserShield,
  FaInfoCircle
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Pending Status Badge Component
const PendingStatusBadge = () => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <FaClock className="text-xs" />
      Pending
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
      case 'verified':
      case 'active':
        return { color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'rejected':
      case 'suspended':
        return { color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: FaClock };
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-800', icon: FaTimesCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FaClock };
    }
  };

  const { color, icon: Icon } = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="text-xs" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// Document Viewer Modal Component
const DocumentViewerModal = ({ isOpen, onClose, documentType, imageUrl, deliveryBoyName }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    setIsDownloading(true);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Add title
    doc.setFontSize(18);
    doc.text(`${deliveryBoyName} - ${documentType}`, 20, 20);

    // Add details
    doc.setFontSize(12);
    doc.text(`Document Type: ${documentType}`, 20, 35);
    doc.text(`Delivery Boy: ${deliveryBoyName}`, 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 49);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 56);

    // Add image if available
    if (imageUrl) {
      try {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Document Image:", 20, 20);

        // Add image (scaled to fit)
        doc.addImage(imageUrl, 'JPEG', 20, 30, 170, 100);
      } catch (error) {
        console.error("Error adding image to PDF:", error);
        doc.text("Image could not be added to PDF", 20, 30);
      }
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    doc.save(`${deliveryBoyName}_${documentType}_${new Date().getTime()}.pdf`);

    setTimeout(() => {
      setIsDownloading(false);
    }, 500);
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${deliveryBoyName}_${documentType}_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    const elem = document.getElementById('document-image');

    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full m-0 rounded-none' : 'max-w-4xl w-full max-h-[90vh]'}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
            <FaIdCard className="text-blue-600 text-xl" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {documentType} Document
              </h2>
              <p className="text-sm text-gray-600">{deliveryBoyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {imageUrl && (
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <FaExpand className="text-lg" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-4 overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '70vh' }}>
          {imageUrl ? (
            <div className="flex flex-col items-center">
              <img
                id="document-image"
                src={imageUrl}
                alt={documentType}
                className="max-w-full max-h-full object-contain rounded-lg shadow-md"
              />
              <p className="text-sm text-gray-500 mt-4 text-center">
                Click the fullscreen button for better view
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <FaImage className="text-gray-400 text-6xl mb-4" />
              <p className="text-gray-500 text-lg">No document image available</p>
              <p className="text-gray-400 text-sm mt-2">The delivery boy has not uploaded this document yet</p>
            </div>
          )}
        </div>

        {/* Footer with Download Options */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-600">
              {imageUrl ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">●</span>
                  <span>Document available for download</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">●</span>
                  <span>Document not uploaded yet</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {imageUrl && (
                <>
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    <FaDownload />
                    Download Image
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition duration-200"
                  >
                    <FaFilePdf />
                    {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>

          {imageUrl && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              <p>PDF includes document image and delivery boy details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PendingDeliveryBoyList = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeliveryChargeModal, setShowDeliveryChargeModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentModalData, setDocumentModalData] = useState({
    documentType: '',
    imageUrl: '',
    deliveryBoyName: ''
  });
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [isSettingCharge, setIsSettingCharge] = useState(false);
  const [editingChargeId, setEditingChargeId] = useState(null);
  const [tempCharge, setTempCharge] = useState("");

  const storedRole = localStorage.getItem("role");


  // API base URL
  const API_BASE_URL = "https://api.vegiffy.in/api/delivery-boy";

  // Get subAdminId from localStorage
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

  // Fetch Delivery Boys
  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/alldeliveryboy`);

      // Filter only pending delivery boys
      const pendingDeliveryBoys = response.data.data.filter(
        boy => boy.deliveryBoyStatus === 'pending'
      );

      setDeliveryBoys(pendingDeliveryBoys);
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
      alert("Error fetching delivery boys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  // Handle View
  const handleView = (deliveryBoy) => {
    setViewData(deliveryBoy);
    setShowViewModal(true);
  };

  // Handle Edit with subAdminId
  const handleEdit = (deliveryBoy) => {
    setEditData({ ...deliveryBoy });
    setShowEditModal(true);
  };

  // Handle Delete with subAdminId
  const handleDelete = async () => {
    try {
      const subAdminId = getSubAdminId();
      const config = {
        data: subAdminId ? { subAdminId } : {}
      };

      await axios.delete(`${API_BASE_URL}/deletedeliveryboy/${deleteId}`, config);
      setShowDeleteModal(false);
      fetchDeliveryBoys();
      alert("Delivery boy deleted successfully!");
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
      alert("Error deleting delivery boy. Please try again.");
    }
  };

  // Handle Form Submit with subAdminId
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const subAdminId = getSubAdminId();
      const requestData = { ...editData };

      // Remove _id from request data
      delete requestData._id;

      if (subAdminId) {
        requestData.subAdminId = subAdminId;

        // Add note about who updated
        requestData.note = `Updated by Sub-admin: ${getUserInfo().name} at ${new Date().toLocaleString()}`;
      }

      await axios.put(
        `${API_BASE_URL}/updatedeliverybody/${editData._id}`,
        requestData
      );
      setShowEditModal(false);
      fetchDeliveryBoys();
      alert("Delivery boy updated successfully!");
    } catch (error) {
      console.error("Error updating delivery boy:", error);
      alert("Error updating delivery boy. Please try again.");
    }
  };

  // Handle input change for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle View Document
  const handleViewDocument = (deliveryBoy, documentType) => {
    let imageUrl = '';
    let docTypeName = '';

    if (documentType === 'aadhar') {
      imageUrl = deliveryBoy.aadharCard;
      docTypeName = 'Aadhar Card';
    } else if (documentType === 'license') {
      imageUrl = deliveryBoy.drivingLicense;
      docTypeName = 'Driving License';
    }

    setDocumentModalData({
      documentType: docTypeName,
      imageUrl: imageUrl,
      deliveryBoyName: deliveryBoy.fullName
    });
    setShowDocumentModal(true);
  };

  // Handle Set Delivery Charge with subAdminId
  const handleSetDeliveryCharge = async () => {
    if (!deliveryCharge || isNaN(deliveryCharge) || parseFloat(deliveryCharge) <= 0) {
      alert("Please enter a valid delivery charge amount");
      return;
    }

    try {
      setIsSettingCharge(true);

      const subAdminId = getSubAdminId();
      const requestData = {
        baseDeliveryCharge: parseFloat(deliveryCharge)
      };

      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      const response = await axios.put(
        `${API_BASE_URL}/set-base-delivery-charge`,
        requestData
      );

      if (response.data.success) {
        setTimeout(() => {
          fetchDeliveryBoys();
        }, 500);

        setShowDeliveryChargeModal(false);
        setDeliveryCharge("");
        alert(response.data.message);
      } else {
        alert(response.data.message || "Failed to update delivery charge");
      }

    } catch (error) {
      console.error("Error updating delivery charges:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Error updating delivery charges. Please try again.");
      }
    } finally {
      setIsSettingCharge(false);
    }
  };

  // Handle individual delivery charge update with subAdminId
  const handleIndividualChargeUpdate = async (deliveryBoyId, newCharge) => {
    try {
      const subAdminId = getSubAdminId();
      const requestData = {
        baseDeliveryCharge: parseFloat(newCharge)
      };

      if (subAdminId) {
        requestData.subAdminId = subAdminId;
      }

      const response = await axios.put(
        `${API_BASE_URL}/update-delivery-charge/${deliveryBoyId}`,
        requestData
      );

      if (response.data.success) {
        fetchDeliveryBoys();
        setEditingChargeId(null);
        setTempCharge("");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating individual delivery charge:", error);
      alert("Error updating delivery charge. Please try again.");
      return false;
    }
  };

  // Start editing individual charge
  const startEditingCharge = (deliveryBoy) => {
    setEditingChargeId(deliveryBoy._id);
    setTempCharge(deliveryBoy.baseDeliveryCharge || "");
  };

  // Cancel editing individual charge
  const cancelEditingCharge = () => {
    setEditingChargeId(null);
    setTempCharge("");
  };

  // Save individual charge
  const saveIndividualCharge = async (deliveryBoyId) => {
    if (tempCharge === "" || isNaN(tempCharge) || parseFloat(tempCharge) < 0) {
      alert("Please enter a valid delivery charge amount");
      return;
    }
    await handleIndividualChargeUpdate(deliveryBoyId, tempCharge);
  };

  // Document Status Component with clickable badges
  const DocumentStatus = ({ documentStatus, deliveryBoy }) => {
    return (
      <div className="flex flex-col gap-2 text-xs">
        <div
          className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded transition duration-200"
          onClick={() => handleViewDocument(deliveryBoy, 'aadhar')}
        >
          <FaIdCard className="text-gray-500 text-xs" />
          <span className="text-xs">Aadhar: </span>
          {documentStatus?.aadharCard === 'pending' ? (
            <PendingStatusBadge />
          ) : (
            <StatusBadge status={documentStatus?.aadharCard} />
          )}
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded transition duration-200"
          onClick={() => handleViewDocument(deliveryBoy, 'license')}
        >
          <FaCar className="text-gray-500 text-xs" />
          <span className="text-xs">License: </span>
          {documentStatus?.drivingLicense === 'pending' ? (
            <PendingStatusBadge />
          ) : (
            <StatusBadge status={documentStatus?.drivingLicense} />
          )}
        </div>
      </div>
    );
  };

  // Get current user info
  const userInfo = getUserInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-4">

        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg">
                  <FaMotorcycle className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      Pending Delivery Boys
                    </span>
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm">
                    {deliveryBoys.length} pending approval
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* User Role Display */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${userInfo.role === "subadmin"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                  }`}>
                  <FaUserShield className="inline mr-1" size={12} />
                  {userInfo.role === "subadmin" ? `Sub-Admin: ${userInfo.name}` : "Admin"}
                </div>

                <button
                  onClick={() => {
                    setLoading(true);
                    fetchDeliveryBoys();
                  }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition duration-200 text-xs font-medium"
                >
                  <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Sub-Admin Note */}
            {userInfo.role === "subadmin" && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-center gap-1">
                  <FaInfoCircle className="text-xs" />
                  <strong>Note:</strong> All updates will be recorded under your name: <strong>{userInfo.name}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Boy
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charge
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryBoys.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-2 py-6 text-center text-xs text-gray-500">
                      <FaUser className="mx-auto text-xl text-gray-400 mb-2" />
                      No pending delivery boys found
                    </td>
                  </tr>
                ) : (
                  deliveryBoys.map((deliveryBoy) => (
                    <tr key={deliveryBoy._id} className="hover:bg-gray-50">
                      {/* Info Column */}
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          {deliveryBoy.image ? (
                            <img
                              src={deliveryBoy.image}
                              alt={deliveryBoy.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <FaUser className="text-gray-400 text-xs" />
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-medium text-gray-900">
                              {deliveryBoy.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {deliveryBoy._id.slice(-6)}
                            </div>
                            {deliveryBoy.note && (
                              <div className="text-xs text-blue-600 mt-0.5 italic">
                                {deliveryBoy.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Column */}
                      <td className="px-2 py-3">
                        <div className="text-xs text-gray-900">
                          {deliveryBoy.mobileNumber}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                          {deliveryBoy.email || 'No email'}
                        </div>
                      </td>

                      {/* Vehicle Column */}
                      <td className="px-2 py-3">
                        <div className="text-xs font-medium text-gray-900 capitalize">
                          {deliveryBoy.vehicleType}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <FaMapMarkerAlt className="text-xs" />
                          {deliveryBoy.location?.coordinates ?
                            `${deliveryBoy.location.coordinates[1]?.toFixed(2)}, ${deliveryBoy.location.coordinates[0]?.toFixed(2)}`
                            : 'No location'
                          }
                        </div>
                      </td>

                      {/* Documents Column */}
                      <td className="px-2 py-3">
                        <DocumentStatus
                          documentStatus={deliveryBoy.documentStatus}
                          deliveryBoy={deliveryBoy}
                        />
                      </td>

                      {/* Delivery Charge Column */}
                      <td className="px-2 py-3">
                        {editingChargeId === deliveryBoy._id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tempCharge}
                              onChange={(e) => setTempCharge(e.target.value)}
                              className="w-16 p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                              placeholder="0.00"
                            />
                            <button
                              onClick={() => saveIndividualCharge(deliveryBoy._id)}
                              className="text-green-600 hover:text-green-800 transition duration-200"
                              title="Save"
                            >
                              <FaSave className="text-xs" />
                            </button>
                            <button
                              onClick={cancelEditingCharge}
                              className="text-red-600 hover:text-red-800 transition duration-200"
                              title="Cancel"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-900">
                              <FaDollarSign className="text-green-600 text-xs" />
                              {deliveryBoy.baseDeliveryCharge ?
                                `₹${deliveryBoy.baseDeliveryCharge}` :
                                <span className="text-gray-400 text-xs">Not set</span>
                              }
                            </div>
                            <button
                              onClick={() => startEditingCharge(deliveryBoy)}
                              className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-all duration-200"
                              title="Edit Charge"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Wallet Balance Column */}
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-900">
                          <FaWallet className="text-purple-600 text-xs" />
                          ₹{deliveryBoy.walletBalance || '0.00'}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(deliveryBoy)}
                            className="text-blue-600 hover:text-blue-900 transition duration-200 p-1 rounded"
                            title="View Details"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleEdit(deliveryBoy)}
                            className="text-green-600 hover:text-green-900 transition duration-200 p-1 rounded"
                            title="Edit"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          {storedRole === 'admin' && (
                            <button
                              onClick={() => {
                                setDeleteId(deliveryBoy._id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 transition duration-200 p-1 rounded"
                              title="Delete"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Viewer Modal */}
        <DocumentViewerModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          documentType={documentModalData.documentType}
          imageUrl={documentModalData.imageUrl}
          deliveryBoyName={documentModalData.deliveryBoyName}
        />

        {/* Delivery Charge Modal */}
        {showDeliveryChargeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaDollarSign className="text-green-600" />
                    Set Base Delivery Charge
                  </h2>
                  <button
                    onClick={() => setShowDeliveryChargeModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* User Info Display */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      You are setting charges as <strong>{userInfo.name}</strong> (Sub-Admin)
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Delivery Charge (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      placeholder="Enter amount in rupees"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will set the base delivery charge for all {deliveryBoys.length} delivery boys
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FaClock className="text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Important Note
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This action will update the base delivery charge for ALL delivery boys in the system.
                          This cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={handleSetDeliveryCharge}
                    disabled={isSettingCharge || !deliveryCharge}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition duration-200 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {isSettingCharge ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaDollarSign className="text-sm" />
                        Set for All Riders
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeliveryChargeModal(false);
                      setDeliveryCharge("");
                    }}
                    disabled={isSettingCharge}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Delivery Boy Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* User Info Display */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Viewing as <strong>{userInfo.name}</strong> (Sub-Admin)
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Personal Information
                    </h3>

                    <div className="flex items-center gap-4">
                      {viewData.image ? (
                        <img
                          src={viewData.image}
                          alt={viewData.fullName}
                          className="w-16 h-16 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-400 text-xl" />
                        </div>
                      )}
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {viewData.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {viewData._id}
                        </div>
                        {viewData.note && (
                          <div className="text-xs text-blue-600 mt-1 italic">
                            {viewData.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Mobile</label>
                        <div className="text-sm text-gray-900">{viewData.mobileNumber}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <div className="text-sm text-gray-900">{viewData.email || 'Not provided'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                        <div className="text-sm text-gray-900 capitalize">{viewData.vehicleType}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Base Delivery Charge</label>
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FaDollarSign className="text-green-600 text-xs" />
                          {viewData.baseDeliveryCharge ? `₹${viewData.baseDeliveryCharge}` : 'Not set'}
                        </div>
                      </div>
                      {viewData.updatedBy && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Updated By</label>
                          <div className="text-sm text-gray-900">{viewData.updatedBy}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Status & Location
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Account Status</label>
                        <div className="mt-1">
                          <PendingStatusBadge />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Active Status</label>
                        <div className="text-sm text-gray-900">
                          {viewData.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs" />
                          {viewData.location?.coordinates ?
                            `Lat: ${viewData.location.coordinates[1]?.toFixed(6)}, Lng: ${viewData.location.coordinates[0]?.toFixed(6)}`
                            : 'Not available'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Wallet Information
                    </h3>

                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-green-800">Current Balance</div>
                            <div className="text-2xl font-bold text-green-900 flex items-center gap-2">
                              <FaWallet className="text-green-600" />
                              ₹{viewData.walletBalance || '0.00'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Total Transactions</label>
                        <div className="text-sm text-gray-900">
                          {viewData.walletTransactions?.length || 0} transactions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Information */}
                  {viewData.myAccountDetails && viewData.myAccountDetails.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                        Bank Account Details
                      </h3>

                      <div className="space-y-2">
                        {viewData.myAccountDetails.map((account, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Bank:</span>
                                <span className="text-gray-900">{account.bankName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Account No:</span>
                                <span className="text-gray-900">{account.accountNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Holder:</span>
                                <span className="text-gray-900">{account.accountHolderName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-700">IFSC:</span>
                                <span className="text-gray-900">{account.ifscCode}</span>
                              </div>
                              {account.upiId && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-700">UPI ID:</span>
                                  <span className="text-gray-900">{account.upiId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents Section */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Documents
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Aadhar Card */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <FaIdCard className="text-blue-600" />
                            Aadhar Card
                          </h4>
                          <div className="flex items-center gap-2">
                            {viewData.documentStatus?.aadharCard === 'pending' ? (
                              <PendingStatusBadge />
                            ) : (
                              <StatusBadge status={viewData.documentStatus?.aadharCard} />
                            )}
                            <button
                              onClick={() => handleViewDocument(viewData, 'aadhar')}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition duration-200 ml-2 p-2 hover:bg-blue-50 rounded"
                              title="View Aadhar Card"
                            >
                              <FaEye className="text-sm" />
                              <span className="text-xs">View</span>
                            </button>
                          </div>
                        </div>
                        {viewData.aadharCard ? (
                          <div
                            className="cursor-pointer group relative"
                            onClick={() => handleViewDocument(viewData, 'aadhar')}
                          >
                            <img
                              src={viewData.aadharCard}
                              alt="Aadhar Card"
                              className="w-full h-32 object-cover rounded border border-gray-200 group-hover:opacity-90 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-200 flex items-center justify-center">
                              <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                                <FaEye className="text-blue-600" />
                                Click to View
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="w-full h-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition duration-200"
                            onClick={() => handleViewDocument(viewData, 'aadhar')}
                          >
                            <div className="text-center">
                              <FaImage className="text-gray-400 text-2xl mb-2" />
                              <p className="text-gray-500 text-sm">No Aadhar Card Uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Driving License */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <FaCar className="text-green-600" />
                            Driving License
                          </h4>
                          <div className="flex items-center gap-2">
                            {viewData.documentStatus?.drivingLicense === 'pending' ? (
                              <PendingStatusBadge />
                            ) : (
                              <StatusBadge status={viewData.documentStatus?.drivingLicense} />
                            )}
                            <button
                              onClick={() => handleViewDocument(viewData, 'license')}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition duration-200 ml-2 p-2 hover:bg-blue-50 rounded"
                              title="View Driving License"
                            >
                              <FaEye className="text-sm" />
                              <span className="text-xs">View</span>
                            </button>
                          </div>
                        </div>
                        {viewData.drivingLicense ? (
                          <div
                            className="cursor-pointer group relative"
                            onClick={() => handleViewDocument(viewData, 'license')}
                          >
                            <img
                              src={viewData.drivingLicense}
                              alt="Driving License"
                              className="w-full h-32 object-cover rounded border border-gray-200 group-hover:opacity-90 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-200 flex items-center justify-center">
                              <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                                <FaEye className="text-blue-600" />
                                Click to View
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="w-full h-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition duration-200"
                            onClick={() => handleViewDocument(viewData, 'license')}
                          >
                            <div className="text-center">
                              <FaImage className="text-gray-400 text-2xl mb-2" />
                              <p className="text-gray-500 text-sm">No Driving License Uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Actions */}
                    <div className="flex justify-end gap-3 mt-4">
                      {(viewData.aadharCard || viewData.drivingLicense) && (
                        <div className="text-xs text-gray-500">
                          Click on document image or "View" button to open in full screen with download options
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Wallet Transactions */}
                  {viewData.walletTransactions && viewData.walletTransactions.length > 0 && (
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                        Recent Wallet Transactions
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {viewData.walletTransactions.slice(0, 5).map((transaction, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                                  {new Date(transaction.dateAdded).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'delivery'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {transaction.type}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-900 text-xs">
                                  {transaction.orderId ? transaction.orderId.slice(-8) : 'N/A'}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-gray-900 font-medium">
                                  ₹{transaction.amount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="md:col-span-2 space-y-2 text-sm text-gray-500 border-t pt-4">
                    <div>Created: {new Date(viewData.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(viewData.updatedAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaEdit className="text-green-600" />
                    Edit Delivery Boy
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* User Info Display */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      You are editing as <strong>{userInfo.name}</strong> (Sub-Admin)
                    </p>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Personal Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={editData?.fullName || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={editData?.mobileNumber || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Type *
                      </label>
                      <select
                        name="vehicleType"
                        value={editData?.vehicleType || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                        <option value="bicycle">Bicycle</option>
                        <option value="car">Car</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editData?.email || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Delivery Charge (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="baseDeliveryCharge"
                        value={editData?.baseDeliveryCharge || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter base delivery charge"
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Location Information
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          value={editData?.location?.coordinates[1] || ''}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              coordinates: [prev.location?.coordinates[0] || 0, parseFloat(e.target.value)]
                            }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          value={editData?.location?.coordinates[0] || ''}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              coordinates: [parseFloat(e.target.value), prev.location?.coordinates[1] || 0]
                            }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Document Status
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aadhar Card Status
                        </label>
                        <select
                          value={editData?.documentStatus?.aadharCard || 'pending'}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            documentStatus: {
                              ...prev.documentStatus,
                              aadharCard: e.target.value
                            }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Driving License Status
                        </label>
                        <select
                          value={editData?.documentStatus?.drivingLicense || 'pending'}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            documentStatus: {
                              ...prev.documentStatus,
                              drivingLicense: e.target.value
                            }
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Account Status
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Boy Status
                        </label>
                        <select
                          value={editData?.deliveryBoyStatus || 'pending'}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            deliveryBoyStatus: e.target.value
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="rejected">Rejected</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Active Status
                        </label>
                        <select
                          name="isActive"
                          value={editData?.isActive?.toString() || 'true'}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            isActive: e.target.value === 'true'
                          }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200 text-sm font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition duration-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <FaTrash className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Are you sure you want to delete this delivery boy? This action cannot be undone.
                  </p>
                </div>

                {/* User Info Display */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      This deletion will be recorded under your name: <strong>{userInfo.name}</strong>
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition duration-200 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingDeliveryBoyList;