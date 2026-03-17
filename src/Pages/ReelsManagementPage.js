import { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaSort, FaSortUp, FaSortDown, FaTimesCircle } from "react-icons/fa";
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
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // API Base URL
  const API_BASE_URL = "http://localhost:5054/api/vendor";

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
    if (!window.confirm("Are you sure you want to delete this reel?")) {
      return;
    }

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
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="inline ml-1" /> 
      : <FaSortDown className="inline ml-1" />;
  };

  // Filter and sort reels
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
      
      // Handle nested vendorId
      if (sortConfig.key === 'vendorName') {
        aValue = a.vendorId?.restaurantName || '';
        bValue = b.vendorId?.restaurantName || '';
      }
      
      // Handle dates
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
          <button 
            onClick={fetchReels}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Reels Management</h1>
          
          {/* Search Box */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search reels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Table */}
        {processedReels.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No reels found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('title')}>
                      Title {getSortIcon('title')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('vendorName')}>
                      Vendor {getSortIcon('vendorName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thumbnail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('status')}>
                      Status {getSortIcon('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('createdAt')}>
                      Created {getSortIcon('createdAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedReels.map((reel, index) => (
                    <tr key={reel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reel.title || "Untitled"}
                        </div>
                        {reel.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {reel.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reel.vendorId?.restaurantName || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {reel.vendorId?._id?.slice(-6) || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={reel.thumbUrl} 
                          alt={reel.title}
                          className="h-10 w-10 rounded object-cover cursor-pointer hover:opacity-80"
                          onClick={() => handleView(reel)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingReelId === reel._id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="text-xs border rounded px-2 py-1 w-20"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                            </select>
                            <button
                              onClick={() => handleStatusUpdate(reel._id)}
                              className="text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(reel.status)}`}>
                            {reel.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(reel.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleView(reel)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          <button
                            onClick={() => startEditing(reel)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Status"
                            disabled={editingReelId === reel._id}
                          >
                            <FaEdit className={`text-lg ${editingReelId === reel._id ? 'opacity-50 cursor-not-allowed' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDelete(reel._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Reel"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer with Count */}
            <div className="bg-gray-50 px-6 py-3 border-t">
              <div className="text-sm text-gray-500">
                Showing {processedReels.length} of {reels.length} reels
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedReel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Reel Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimesCircle className="text-2xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Video & Thumbnail */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Media</h3>
                  
                  {/* Video Player */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Video:</p>
                    <video 
                      src={selectedReel.videoUrl} 
                      controls
                      className="w-full rounded-lg border"
                      poster={selectedReel.thumbUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Thumbnail:</p>
                    <img 
                      src={selectedReel.thumbUrl} 
                      alt="Thumbnail"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                </div>

                {/* Right Column - Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Information</h3>
                  
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div>
                      <p className="text-sm text-gray-500">Reel ID</p>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedReel._id}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Title</p>
                      <p className="font-medium">{selectedReel.title || "Untitled"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{selectedReel.description || "No description"}</p>
                    </div>

                    {/* Vendor Info */}
                    <div>
                      <p className="text-sm text-gray-500">Vendor Details</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">Name: {selectedReel.vendorId?.restaurantName || "Unknown"}</p>
                        <p className="text-xs text-gray-600">Vendor ID: {selectedReel.vendorId?._id || "N/A"}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeColor(selectedReel.status)}`}>
                        {selectedReel.status}
                      </span>
                    </div>

                    {/* Deep Link */}
                    {selectedReel.deepLink && (
                      <div>
                        <p className="text-sm text-gray-500">Deep Link</p>
                        <a 
                          href={selectedReel.deepLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm break-all"
                        >
                          {selectedReel.deepLink}
                        </a>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-mono text-sm">{formatDate(selectedReel.createdAt)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Updated At</p>
                      <p className="font-mono text-sm">{formatDate(selectedReel.updatedAt)}</p>
                    </div>

                    {/* Video URL */}
                    <div>
                      <p className="text-sm text-gray-500">Video URL</p>
                      <a 
                        href={selectedReel.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs break-all"
                      >
                        {selectedReel.videoUrl}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelsManagementTable;