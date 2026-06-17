import { useState, useEffect } from "react";
import {
  FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaSort, FaSortUp, FaSortDown,
  FaTimesCircle, FaPlus, FaUpload, FaVideo, FaImage, FaSpinner
} from "react-icons/fa";
import axios from "axios";

const ReelsManagementTable = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReelId, setEditingReelId] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);

  // Create Reel Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    deepLink: "",
    status: "active",
    isHot: false,
    video: null,
    thumbnail: null
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const storedRole = localStorage.getItem("role");


  // API Base URL
  const API_BASE_URL = "https://api.vegiffy.in/api/vendor";

  // Get adminId from localStorage
  const getAdminId = () => {
    try {
      const role = localStorage.getItem("role");
      const id = localStorage.getItem("adminId");
      if (role === "admin" && id) return id;
      return null;
    } catch (error) {
      console.error("Error getting adminId:", error);
      return null;
    }
  };

  // Fetch all reels on component mount
  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/getallreelsforadmin`);

      if (response.data.success) {
        setReels(response.data.data);
      } else {
        setError("Failed to fetch reels");
      }
    } catch (err) {
      console.error("Error fetching reels:", err);
      setError("Network error while fetching reels");
    } finally {
      setLoading(false);
    }
  };

  // Handle create reel submit
  const handleCreateReel = async (e) => {
    e.preventDefault();
    const adminId = getAdminId();

    if (!adminId) {
      alert("Admin ID not found. Please login as admin.");
      return;
    }

    if (!createForm.video) {
      alert("Please select a video file");
      return;
    }

    setCreateLoading(true);

    try {
      const formData = new FormData();
      formData.append("video", createForm.video);
      if (createForm.thumbnail) formData.append("thumbnail", createForm.thumbnail);
      if (createForm.title) formData.append("title", createForm.title);
      if (createForm.description) formData.append("description", createForm.description);
      if (createForm.deepLink) formData.append("deepLink", createForm.deepLink);
      formData.append("status", createForm.status);
      formData.append("isHot", createForm.isHot ? "true" : "false");

      const response = await axios.post(
        `https://api.vegiffy.in/api/vendor/createreelbyadmin/${adminId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        alert("Reel created successfully!");
        setShowCreateModal(false);
        resetCreateForm();
        fetchReels();
      } else {
        alert("Failed to create reel: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error creating reel:", err);
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: "",
      description: "",
      deepLink: "",
      status: "active",
      isHot: false,
      video: null,
      thumbnail: null
    });
  };

  const handleCreateChange = (field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    if (file) {
      setCreateForm(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleStatusUpdate = async (reelId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/updatereels/${reelId}`, {
        status: editStatus
      });

      if (response.data.success) {
        setReels(reels.map(reel =>
          reel._id === reelId
            ? { ...reel, status: editStatus }
            : reel
        ));
        setEditingReelId(null);
        setEditStatus("");
      }
    } catch (err) {
      console.error("Error updating reel:", err);
      alert("Failed to update reel status");
    }
  };

  const handleDelete = async (reelId) => {
    if (!window.confirm("Are you sure you want to delete this reel?")) return;
    try {
      const response = await axios.delete(`${API_BASE_URL}/deletereel/${reelId}`);
      if (response.data.success) {
        setReels(reels.filter(reel => reel._id !== reelId));
      }
    } catch (err) {
      console.error("Error deleting reel:", err);
      alert("Failed to delete reel");
    }
  };

  const handleView = (reel) => {
    setSelectedReel(reel);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReel(null);
  };

  const startEditing = (reel) => {
    setEditingReelId(reel._id);
    setEditStatus(reel.status);
  };

  const cancelEditing = () => {
    setEditingReelId(null);
    setEditStatus("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 text-gray-400" size={12} />;
    return sortConfig.direction === 'asc'
      ? <FaSortUp className="inline ml-1" size={12} />
      : <FaSortDown className="inline ml-1" size={12} />;
  };

  const processedReels = reels
    .filter(reel => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (reel.title?.toLowerCase() || '').includes(searchLower) ||
        (reel.vendorId?.restaurantName?.toLowerCase() || '').includes(searchLower) ||
        (reel.status?.toLowerCase() || '').includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'vendorName') {
        aValue = a.vendorId?.restaurantName || '';
        bValue = b.vendorId?.restaurantName || '';
      }
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button onClick={fetchReels} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title, Search and Create Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h1 className="text-xl font-bold text-gray-800">Reels Management</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search reels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm w-full sm:w-64"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <FaPlus size={12} /> Create Reel
            </button>
          </div>
        </div>

        {/* Table */}
        {processedReels.length === 0 ? (
          <div className="bg-white rounded shadow p-6 text-center">
            <p className="text-gray-500">No reels found</p>
          </div>
        ) : (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.No</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer" onClick={() => requestSort('title')}>Title {getSortIcon('title')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer" onClick={() => requestSort('vendorName')}>Vendor {getSortIcon('vendorName')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Thumbnail</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer" onClick={() => requestSort('status')}>Status {getSortIcon('status')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer" onClick={() => requestSort('createdAt')}>Created {getSortIcon('createdAt')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedReels.map((reel, index) => (
                    <tr key={reel._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900">{reel.title || "Untitled"}</div>
                        {reel.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{reel.description}</div>}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-gray-900">{reel.vendorId?.restaurantName || "Unknown"}</div>
                        <div className="text-xs text-gray-500">ID: {reel.vendorId?._id?.slice(-6) || "N/A"}</div>
                      </td>
                      <td className="px-3 py-2">
                        <img src={reel.thumbUrl} alt={reel.title} className="h-10 w-10 rounded object-cover cursor-pointer hover:opacity-80" onClick={() => handleView(reel)} />
                      </td>
                      <td className="px-3 py-2">
                        {editingReelId === reel._id ? (
                          <div className="flex items-center gap-1">
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="text-xs border rounded px-1 py-0.5 w-20">
                              <option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option>
                            </select>
                            <button onClick={() => handleStatusUpdate(reel._id)} className="text-green-600"><FaCheck size={12} /></button>
                            <button onClick={cancelEditing} className="text-red-600"><FaTimes size={12} /></button>
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeColor(reel.status)}`}>{reel.status}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{formatDate(reel.createdAt)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleView(reel)} className="text-blue-600 hover:text-blue-800" title="View"><FaEye size={14} /></button>
                          <button onClick={() => startEditing(reel)} className="text-green-600 hover:text-green-800" title="Edit Status"><FaEdit size={14} /></button>
                          {storedRole === 'admin' && (<button onClick={() => handleDelete(reel._id)} className="text-red-600 hover:text-red-800" title="Delete"><FaTrash size={14} /></button>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-3 py-2 border-t text-xs text-gray-500">Showing {processedReels.length} of {reels.length} reels</div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedReel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3"><h2 className="text-xl font-bold">Reel Details</h2><button onClick={closeModal} className="text-gray-500"><FaTimesCircle size={20} /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><h3 className="font-semibold text-sm mb-2">Media</h3><video src={selectedReel.videoUrl} controls className="w-full rounded border" poster={selectedReel.thumbUrl} /><img src={selectedReel.thumbUrl} alt="Thumb" className="mt-2 w-full h-32 object-cover rounded border" /></div>
                <div><h3 className="font-semibold text-sm mb-2">Information</h3><div className="space-y-2 text-sm"><div><span className="text-gray-500">ID:</span> <span className="font-mono text-xs">{selectedReel._id}</span></div><div><span className="text-gray-500">Title:</span> {selectedReel.title || "Untitled"}</div><div><span className="text-gray-500">Description:</span> {selectedReel.description || "No description"}</div><div><span className="text-gray-500">Vendor:</span> {selectedReel.vendorId?.restaurantName || "Unknown"}</div><div><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadgeColor(selectedReel.status)}`}>{selectedReel.status}</span></div><div><span className="text-gray-500">Created:</span> {formatDate(selectedReel.createdAt)}</div>{selectedReel.deepLink && <div><span className="text-gray-500">Deep Link:</span> <a href={selectedReel.deepLink} target="_blank" rel="noopener" className="text-blue-600 text-xs break-all">{selectedReel.deepLink}</a></div>}</div></div>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-end"><button onClick={closeModal} className="px-4 py-1.5 bg-gray-500 text-white rounded text-sm">Close</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Create Reel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3"><h2 className="text-xl font-bold">Create New Reel (Admin)</h2><button onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="text-gray-500"><FaTimesCircle size={20} /></button></div>
              <form onSubmit={handleCreateReel} className="space-y-3">
                <div><label className="block text-sm font-medium mb-1">Video *</label><input type="file" accept="video/*" onChange={(e) => handleFileChange('video', e.target.files[0])} className="w-full text-sm border rounded p-1" required /></div>
                <div><label className="block text-sm font-medium mb-1">Thumbnail (optional)</label><input type="file" accept="image/*" onChange={(e) => handleFileChange('thumbnail', e.target.files[0])} className="w-full text-sm border rounded p-1" /></div>
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={createForm.title} onChange={(e) => handleCreateChange('title', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={createForm.description} onChange={(e) => handleCreateChange('description', e.target.value)} rows="2" className="w-full border rounded px-3 py-1.5 text-sm"></textarea></div>
                <div><label className="block text-sm font-medium mb-1">Deep Link (optional)</label><input type="url" value={createForm.deepLink} onChange={(e) => handleCreateChange('deepLink', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="https://..." /></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium mb-1">Status</label><select value={createForm.status} onChange={(e) => handleCreateChange('status', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option></select></div><div><label className="block text-sm font-medium mb-1">Hot Reel?</label><select value={createForm.isHot ? "true" : "false"} onChange={(e) => handleCreateChange('isHot', e.target.value === "true")} className="w-full border rounded px-3 py-1.5 text-sm"><option value="false">No</option><option value="true">Yes</option></select></div></div>
                <div className="flex justify-end gap-2 pt-3 border-t"><button type="button" onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="px-4 py-1.5 border rounded text-sm">Cancel</button><button type="submit" disabled={createLoading} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm flex items-center gap-1">{createLoading ? <FaSpinner className="animate-spin" /> : <FaUpload size={12} />} {createLoading ? "Creating..." : "Create Reel"}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelsManagementTable;