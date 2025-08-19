import React, { useState, useEffect } from "react";
import axios from "axios";

const PositionList = () => {
  const [positions, setPositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [formData, setFormData] = useState({ name: "", details: "", status: "Active" });

  // Fetch positions from the API when the component mounts
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get("https://hr-backend-hifb.onrender.com/api/hr/get-position");
        setPositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };

    fetchPositions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (formData.name && formData.details) {
      try {
        const response = await axios.post("https://hr-backend-hifb.onrender.com/api/hr/create-position", {
          positionName: formData.name,
          status: formData.status,
          positionDetails: formData.details,
        });

        setPositions([...positions, response.data]);
        setShowForm(false);
        setFormData({ name: "", details: "", status: "Active" });
      } catch (error) {
        console.error("Error creating position:", error);
      }
    }
  };

  const handleEdit = (position) => {
    setCurrentPosition(position);
    setFormData({ name: position.positionName, details: position.positionDetails, status: position.status });
    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    if (currentPosition) {
      try {
        const response = await axios.put(`https://hr-backend-hifb.onrender.com/api/hr/update-position/${currentPosition._id}`, {
          positionName: formData.name,
          status: formData.status,
          positionDetails: formData.details,
        });

        setPositions(
          positions.map((pos) =>
            pos._id === currentPosition._id ? { ...pos, ...response.data } : pos
          )
        );
        setShowEditForm(false);
        setFormData({ name: "", details: "", status: "Active" });
      } catch (error) {
        console.error("Error updating position:", error);
      }
    }
  };

  // Handle position deletion
  const handleDelete = async (id) => {
    try {
      // Call the DELETE API
      const response = await axios.delete(`https://hr-backend-hifb.onrender.com/api/hr/delete-position/${id}`);

      // Remove the deleted position from the list in state
      if (response.status === 200) {
        setPositions(positions.filter((pos) => pos._id !== id));
      }
    } catch (error) {
      console.error("Error deleting position:", error);
    }
  };

  return (
    <div className="p-4 bg-white">
      <h2 className="mb-4 text-xl font-bold">Position List</h2>
      <button
        onClick={() => setShowForm(true)}
        className="p-2 mb-4 text-green-700 bg-green-100 border border-green-600 rounded"
      >
        + Add Position
      </button>
      <table className="w-full bg-white border border-collapse border-gray-300">
        <thead>
          <tr>
            <th className="p-2 border">SI</th>
            <th className="p-2 border">Position Name</th>
            <th className="p-2 border">Position Details</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr key={position._id}>
              <td className="p-2 border text-center">{index + 1}</td>
              <td className="p-2 border text-center">{position.positionName}</td>
              <td className="p-2 border text-center">{position.positionDetails}</td>
              <td className="p-2 border text-center">
                <span
                  className={`px-2 py-1 rounded ${
                    position.status === "Active"
                      ? "text-green-700 bg-green-100 border border-green-600"
                      : "text-red-700 bg-red-100 border border-red-600"
                  }`}
                >
                  {position.status}
                </span>
              </td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => handleEdit(position)}
                  className="p-1 mr-2 text-blue-700 bg-blue-100 border border-blue-600 rounded"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(position._id)}
                  className="p-1 text-red-700 bg-red-100 border border-red-600 rounded"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Position Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="p-4 bg-white rounded shadow-md">
            <h2 className="mb-2 text-lg font-bold">New Position</h2>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Position Name"
              className="w-full p-2 mb-2 border"
            />
            <input
              type="text"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder="Position Details"
              className="w-full p-2 mb-2 border"
            />
            <div className="mb-2">
              <label>
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={formData.status === "Active"}
                  onChange={handleInputChange}
                />{" "}
                Active
              </label>
              <label className="ml-4">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={formData.status === "Inactive"}
                  onChange={handleInputChange}
                />{" "}
                Inactive
              </label>
            </div>
            <button
              onClick={handleSubmit}
              className="p-2 mr-2 text-blue-700 bg-blue-100 border border-blue-600 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 text-red-700 bg-red-100 border border-red-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Position Form */}
      {showEditForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="p-4 bg-white rounded shadow-md">
            <h2 className="mb-2 text-lg font-bold">Edit Position</h2>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border"
            />
            <input
              type="text"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border"
            />
            <div className="mb-2">
              <label>
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={formData.status === "Active"}
                  onChange={handleInputChange}
                />{" "}
                Active
              </label>
              <label className="ml-4">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={formData.status === "Inactive"}
                  onChange={handleInputChange}
                />{" "}
                Inactive
              </label>
            </div>
            <button
              onClick={handleUpdate}
              className="p-2 mr-2 text-blue-700 bg-blue-100 border border-blue-600 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setShowEditForm(false)}
              className="p-2 text-red-700 bg-red-100 border border-red-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionList;
