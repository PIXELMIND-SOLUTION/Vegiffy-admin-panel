import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const SingleDiagnosticDetail = () => {
  const [center, setCenter] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestEditModal, setShowTestEditModal] = useState(false);
  const [showContactEditModal, setShowContactEditModal] = useState(false);
  const [editedContact, setEditedContact] = useState(null);
  const [editedTest, setEditedTest] = useState(null);

  useEffect(() => {
    const fetchCenterDetails = async () => {
      const diagnosticId = localStorage.getItem("diagnosticId");
  
      console.log("🧾 Diagnostic ID from localStorage:", diagnosticId); // 🔍 Log kar raha hai ID
  
      if (!diagnosticId) {
        alert("Diagnostic ID not found in localStorage");
        return;
      }
  
      try {
        const response = await fetch(
          `http://localhost:4000/api/admin/get-single/${diagnosticId}`
        );
        const data = await response.json();
  
        console.log("✅ Diagnostic data from API:", data.diagnostic); // Full API response
  
        setCenter(data.diagnostic);
      } catch (error) {
        console.error("❌ Error fetching center details:", error);
      }
    };
  
    fetchCenterDetails();
  }, []);
  

  if (!center) return <div>Loading...</div>;

  const handleEditCenter = () => setShowEditModal(true);

  const handleEditContact = (contact) => {
    setEditedContact(contact);
    setShowContactEditModal(true);
  };

  const handleEditTest = (test) => {
    setEditedTest(test);
    setShowTestEditModal(true);
  };

  const handleDeleteContact = (index) => {
    const updated = center.contactPersons.filter((_, i) => i !== index);
    setCenter({ ...center, contactPersons: updated });
  };

  const handleDeleteTest = (index) => {
    const updated = center.tests.filter((_, i) => i !== index);
    setCenter({ ...center, tests: updated });
  };

  const handleSubmitEditCenter = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:4000/api/admin/edit-center/${center._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(center),
      });
      alert("Center updated successfully!");
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating center", err);
    }
  };

  const handleSubmitEditContact = (e) => {
    e.preventDefault();
    const updated = center.contactPersons.map((c) =>
      c._id === editedContact._id ? editedContact : c
    );
    setCenter({ ...center, contactPersons: updated });
    setShowContactEditModal(false);
  };

  const handleSubmitEditTest = (e) => {
    e.preventDefault();
    const updated = center.tests.map((t) =>
      t._id === editedTest._id ? editedTest : t
    );
    setCenter({ ...center, tests: updated });
    setShowTestEditModal(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">Diagnostic Center Details</h2>

      {/* Center Info */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              {["Name", "Email", "Phone", "Address", "Center Type", "Country", "State", "City", "Pincode", "GST Number", "Strength", "Actions"].map((h, i) => (
                <th key={i} className="p-2 border text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">{center.name}</td>
              <td className="p-2 border">{center.email}</td>
              <td className="p-2 border">{center.phone}</td>
              <td className="p-2 border">{center.address}</td>
              <td className="p-2 border">{center.centerType}</td>
              <td className="p-2 border">{center.country}</td>
              <td className="p-2 border">{center.state}</td>
              <td className="p-2 border">{center.city}</td>
              <td className="p-2 border">{center.pincode}</td>
              <td className="p-2 border">{center.gstNumber}</td>
              <td className="p-2 border">{center.centerStrength}</td>
              <td className="p-2 border">
                <button onClick={handleEditCenter} className="text-blue-500 hover:text-blue-700">
                  <FaEdit />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Contact Persons */}
      <h3 className="mt-6 text-lg font-semibold">Contact Persons</h3>
      <div className="overflow-x-auto mt-2">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              {["Name", "Designation", "Gender", "Email", "Phone", "Actions"].map((h, i) => (
                <th key={i} className="p-2 border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {center.contactPersons.map((c, i) => (
              <tr key={c._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.designation}</td>
                <td className="p-2 border">{c.gender}</td>
                <td className="p-2 border">{c.contactEmail}</td>
                <td className="p-2 border">{c.contactNumber}</td>
                <td className="p-2 border">
                  <button onClick={() => handleEditContact(c)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                  <button onClick={() => handleDeleteContact(i)} className="text-red-500 hover:text-red-700 ml-2"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tests */}
      <h3 className="mt-6 text-lg font-semibold">Tests Offered</h3>
      <div className="overflow-x-auto mt-2">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              {["Test Name", "Description", "Price", "Offer Price", "Actions"].map((h, i) => (
                <th key={i} className="p-2 border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {center.tests.map((t, i) => (
              <tr key={t._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{t.test_name}</td>
                <td className="p-2 border">{t.description}</td>
                <td className="p-2 border">₹{t.price}</td>
                <td className="p-2 border">₹{t.offerPrice}</td>
                <td className="p-2 border">
                  <button onClick={() => handleEditTest(t)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                  <button onClick={() => handleDeleteTest(i)} className="text-red-500 hover:text-red-700 ml-2"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showEditModal && (
        <Modal title="Edit Center" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleSubmitEditCenter}>
            <label className="block mt-4">Name</label>
            <input type="text" className="w-full border px-3 py-2 mt-1 rounded"
              value={center.name}
              onChange={(e) => setCenter({ ...center, name: e.target.value })}
            />
            <ModalButtons onClose={() => setShowEditModal(false)} />
          </form>
        </Modal>
      )}

      {showContactEditModal && editedContact && (
        <Modal title="Edit Contact" onClose={() => setShowContactEditModal(false)}>
          <form onSubmit={handleSubmitEditContact}>
            <label className="block mt-4">Name</label>
            <input type="text" className="w-full border px-3 py-2 mt-1 rounded"
              value={editedContact.name}
              onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
            />
            <ModalButtons onClose={() => setShowContactEditModal(false)} />
          </form>
        </Modal>
      )}

      {showTestEditModal && editedTest && (
        <Modal title="Edit Test" onClose={() => setShowTestEditModal(false)}>
          <form onSubmit={handleSubmitEditTest}>
            <label className="block mt-4">Test Name</label>
            <input type="text" className="w-full border px-3 py-2 mt-1 rounded"
              value={editedTest.test_name}
              onChange={(e) => setEditedTest({ ...editedTest, test_name: e.target.value })}
            />
            <label className="block mt-4">Description</label>
            <textarea className="w-full border px-3 py-2 mt-1 rounded"
              value={editedTest.description}
              onChange={(e) => setEditedTest({ ...editedTest, description: e.target.value })}
            />
            <label className="block mt-4">Price</label>
            <input type="number" className="w-full border px-3 py-2 mt-1 rounded"
              value={editedTest.price}
              onChange={(e) => setEditedTest({ ...editedTest, price: e.target.value })}
            />
            <label className="block mt-4">Offer Price</label>
            <input type="number" className="w-full border px-3 py-2 mt-1 rounded"
              value={editedTest.offerPrice}
              onChange={(e) => setEditedTest({ ...editedTest, offerPrice: e.target.value })}
            />
            <ModalButtons onClose={() => setShowTestEditModal(false)} />
          </form>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-96">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  </div>
);

const ModalButtons = ({ onClose }) => (
  <div>
    <button type="submit" className="bg-blue-500 text-white mt-4 py-2 px-4 rounded">
      Save Changes
    </button>
    <button type="button" className="bg-gray-300 text-gray-700 mt-2 ml-4 py-2 px-4 rounded" onClick={onClose}>
      Cancel
    </button>
  </div>
);

export default SingleDiagnosticDetail;
