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

    doc.setFontSize(18);
    doc.text(`${deliveryBoyName} - ${documentType}`, 20, 20);

    doc.setFontSize(12);
    doc.text(`Document Type: ${documentType}`, 20, 35);
    doc.text(`Delivery Boy: ${deliveryBoyName}`, 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 49);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 56);

    if (imageUrl) {
      try {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Document Image:", 20, 20);

        doc.addImage(imageUrl, 'JPEG', 20, 30, 170, 100);
      } catch (error) {
        console.error("Error adding image to PDF:", error);
        doc.text("Image could not be added to PDF", 20, 30);
      }
    }

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

      console.log('Pending delivery boys:', pendingDeliveryBoys);

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

  // Handle Edit
  const handleEdit = (deliveryBoy) => {
    setEditData({ ...deliveryBoy });
    setShowEditModal(true);
  };

  // Handle Delete
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

  // Handle Form Submit with sub-admin ID
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      // Prepare request data with sub-admin info
      const requestData = {
        ...editData,
        fullName: editData.fullName,
        email: editData.email,
        mobileNumber: editData.mobileNumber,
        vehicleType: editData.vehicleType,
        baseDeliveryCharge: editData.baseDeliveryCharge,
        deliveryBoyStatus: editData.deliveryBoyStatus,
        isActive: editData.isActive,
        location: editData.location,
        documentStatus: editData.documentStatus
      };

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Updated by Sub-admin: ${userInfo.name}`;
      }

      const response = await axios.put(
        `${API_BASE_URL}/updatedeliverybody/${editData._id}`,
        requestData
      );

      if (response.data.success) {
        setShowEditModal(false);
        fetchDeliveryBoys();
        alert("Delivery boy updated successfully!");
      } else {
        alert(response.data.message || "Failed to update delivery boy");
      }
    } catch (error) {
      console.error("Error updating delivery boy:", error);
      alert(error.response?.data?.message || "Error updating delivery boy. Please try again.");
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
    console.log('Viewing document:', { deliveryBoy, documentType });

    let imageUrl = '';
    let docTypeName = '';

    if (documentType === 'aadhar') {
      imageUrl = deliveryBoy.aadharCard;
      docTypeName = 'Aadhar Card';
    } else if (documentType === 'license') {
      imageUrl = deliveryBoy.drivingLicense;
      docTypeName = 'Driving License';
    }

    console.log('Document data:', { imageUrl, docTypeName, name: deliveryBoy.fullName });

    setDocumentModalData({
      documentType: docTypeName,
      imageUrl: imageUrl,
      deliveryBoyName: deliveryBoy.fullName
    });
    setShowDocumentModal(true);
  };

  // Handle Set Delivery Charge with sub-admin ID
  const handleSetDeliveryCharge = async () => {
    if (!deliveryCharge || isNaN(deliveryCharge) || parseFloat(deliveryCharge) <= 0) {
      alert("Please enter a valid delivery charge amount");
      return;
    }

    try {
      setIsSettingCharge(true);
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      const requestData = {
        baseDeliveryCharge: parseFloat(deliveryCharge)
      };

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Delivery charge updated by Sub-admin: ${userInfo.name}`;
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

  // Handle individual delivery charge update with sub-admin ID
  const handleIndividualChargeUpdate = async (deliveryBoyId, newCharge) => {
    try {
      const subAdminId = getSubAdminId();
      const userInfo = getUserInfo();

      const requestData = {
        baseDeliveryCharge: parseFloat(newCharge)
      };

      // Add subAdminId if user is sub-admin
      if (subAdminId) {
        requestData.subAdminId = subAdminId;
        requestData.note = `Charge updated by Sub-admin: ${userInfo.name}`;
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

  const userInfo = getUserInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto">

        {/* Header with User Info */}
        <div className="mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaMotorcycle className="text-indigo-600" />
                  Pending Delivery Boys
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {deliveryBoys.length} pending approval
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* User Role Display */}
                <div className={`px-3 py-1 rounded text-xs font-medium ${userInfo.role === "subadmin"
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
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition duration-200 text-xs font-medium"
                >
                  <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Sub-Admin Note */}
            {userInfo.role === "subadmin" && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-800 flex items-center gap-1">
                  <FaInfoCircle size={10} />
                  <span>All updates will be recorded under your name</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Delivery Boy</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Charge</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admin Info</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryBoys.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-2 py-6 text-center text-xs text-gray-500">
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

                      {/* Admin Info Column */}
                      <td className="px-2 py-3">
                        <div className="text-xs">
                          {deliveryBoy.note && (
                            <div className="text-purple-600 italic mb-1" title={deliveryBoy.note}>
                              {deliveryBoy.note.length > 20 ? deliveryBoy.note.substring(0, 20) + '...' : deliveryBoy.note}
                            </div>
                          )}
                          {deliveryBoy.updatedBy && (
                            <div className="text-gray-500">
                              Updated by: {deliveryBoy.updatedBy}
                            </div>
                          )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded shadow-lg max-w-sm w-full">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
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

                {/* User Info for Charge Update */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                    <p className="text-purple-800">
                      Updating as <strong>{userInfo.name}</strong> (Sub-Admin)
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Base Delivery Charge (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      placeholder="Enter amount in rupees"
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will set the base delivery charge for all {deliveryBoys.length} delivery boys
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="flex items-start gap-1">
                      <FaClock className="text-yellow-600 mt-0.5 text-xs" />
                      <div>
                        <p className="text-xs font-medium text-yellow-800">
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

                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={handleSetDeliveryCharge}
                    disabled={isSettingCharge || !deliveryCharge}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition duration-200 text-xs font-medium flex items-center justify-center gap-1"
                  >
                    {isSettingCharge ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaDollarSign className="text-xs" />
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
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition duration-200 text-xs font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded shadow w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Personal Information
                    </h3>

                    <div className="flex items-center gap-3">
                      {viewData.image ? (
                        <img
                          src={viewData.image}
                          alt={viewData.fullName}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {viewData.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {viewData._id}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Mobile</label>
                        <div className="text-gray-900">{viewData.mobileNumber}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Email</label>
                        <div className="text-gray-900">{viewData.email || 'Not provided'}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Vehicle Type</label>
                        <div className="text-gray-900 capitalize">{viewData.vehicleType}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Base Delivery Charge</label>
                        <div className="text-gray-900 flex items-center gap-1">
                          <FaDollarSign className="text-green-600 text-xs" />
                          {viewData.baseDeliveryCharge ? `₹${viewData.baseDeliveryCharge}` : 'Not set'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Location */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Status & Location
                    </h3>

                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Account Status</label>
                        <div className="mt-1">
                          <PendingStatusBadge />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Active Status</label>
                        <div className="text-gray-900 text-sm">
                          {viewData.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Location</label>
                        <div className="text-gray-900 text-sm flex items-center gap-1">
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
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Wallet Information
                    </h3>

                    <div className="space-y-2">
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-medium text-green-800">Current Balance</div>
                            <div className="text-lg font-bold text-green-900 flex items-center gap-1">
                              <FaWallet className="text-green-600" />
                              ₹{viewData.walletBalance || '0.00'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Total Transactions</label>
                        <div className="text-gray-900 text-sm">
                          {viewData.walletTransactions?.length || 0} transactions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Info */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Admin Information
                    </h3>

                    <div className="space-y-2 text-sm">
                      {viewData.note && (
                        <div>
                          <label className="text-xs font-medium text-gray-700">Note</label>
                          <div className="text-purple-600 italic text-xs">{viewData.note}</div>
                        </div>
                      )}
                      {viewData.updatedBy && (
                        <div>
                          <label className="text-xs font-medium text-gray-700">Updated By</label>
                          <div className="text-gray-900 text-xs">{viewData.updatedBy}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200 text-xs font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded shadow w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
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

                {/* User Info for Edit Form */}
                {userInfo.role === "subadmin" && (
                  <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                    <p className="text-purple-800">
                      Editing as <strong>{userInfo.name}</strong> (Sub-Admin)
                    </p>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Personal Information
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={editData?.fullName || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={editData?.mobileNumber || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Vehicle Type *
                      </label>
                      <select
                        name="vehicleType"
                        value={editData?.vehicleType || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editData?.email || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Base Delivery Charge (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="baseDeliveryCharge"
                        value={editData?.baseDeliveryCharge || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="Enter base delivery charge"
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Location Information
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Status */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Document Status
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-1">
                      Account Status
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Delivery Boy Status
                        </label>
                        <select
                          value={editData?.deliveryBoyStatus || 'pending'}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            deliveryBoyStatus: e.target.value
                          }))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="rejected">Rejected</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Active Status
                        </label>
                        <select
                          name="isActive"
                          value={editData?.isActive?.toString() || 'true'}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            isActive: e.target.value === 'true'
                          }))}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200 text-xs font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition duration-200 text-xs font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded shadow max-w-sm w-full">
              <div className="p-4">
                <div className="text-center">
                  <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <FaTrash className="text-red-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 text-xs mb-3">
                    Are you sure you want to delete this delivery boy? This action cannot be undone.
                  </p>

                  {/* User Info for Delete */}
                  {userInfo.role === "subadmin" && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="text-yellow-800">
                        Deleting as <strong>{userInfo.name}</strong> (Sub-Admin)
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-1.5 rounded hover:bg-gray-400 transition duration-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-1.5 rounded hover:bg-red-700 transition duration-200 text-xs font-medium"
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