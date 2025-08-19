import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash } from "react-icons/fi";

const CompanyAllDiagnostics = () => {
  const [centers, setCenters] = useState([]);
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const res = await axios.get(`https://credenhealth.onrender.com/api/admin/companydiag/${companyId}`);
        setCenters(res.data.diagnostics || []);
      } catch (err) {
        console.error("Error fetching diagnostics:", err);
      }
    };

    if (companyId) fetchDiagnostics();
  }, [companyId]);

  const handleDeleteDiagnostic = async (id) => {
    if (!window.confirm("Are you sure you want to delete this diagnostic center?")) return;
    try {
      await axios.delete(`https://credenhealth.onrender.com/api/admin/deletediagnostic/${id}`);
      setCenters(prev => prev.filter(center => center._id !== id));
    } catch (err) {
      console.error("Error deleting diagnostic:", err);
      alert("Failed to delete diagnostic.");
    }
  };

  return (
    <div className="p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-purple-900">Company Diagnostic Centers</h1>

      {/* Check if there are no centers available */}
      {centers.length === 0 ? (
        <div className="text-center text-lg font-semibold text-red-500">
          No diagnostic centers associated with this company.
        </div>
      ) : (
        centers.map((center, centerIndex) => (
          <div key={centerIndex} className="bg-white rounded shadow p-4 mb-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{center.name}</h2>
              <div className="space-x-2">
                <button onClick={() => alert("Edit logic here")} className="text-blue-600 text-sm">
                  <FiEdit />
                </button>
                <button onClick={() => handleDeleteDiagnostic(center._id)} className="text-red-600 text-sm">
                  <FiTrash />
                </button>
              </div>
            </div>

            {/* Center Info */}
            <table className="w-full border rounded text-sm mb-4">
              <thead className="bg-purple-100">
                <tr>
                  <th className="p-2 border text-left">Email</th>
                  <th className="p-2 border text-left">Phone</th>
                  <th className="p-2 border text-left">Address</th>
                  <th className="p-2 border text-left">Center Type</th>
                  <th className="p-2 border text-left">Country</th>
                  <th className="p-2 border text-left">State</th>
                  <th className="p-2 border text-left">City</th>
                  <th className="p-2 border text-left">Pincode</th>
                  <th className="p-2 border text-left">GST</th>
                  <th className="p-2 border text-left">Strength</th>
                  <th className="p-2 border text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
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
                  <td className="p-2 border text-center">
                    <button className="text-blue-600 text-sm mr-2">
                      <FiEdit />
                    </button>
                    <button onClick={() => handleDeleteDiagnostic(center._id)} className="text-red-600 text-sm">
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Contact Persons */}
            <h3 className="text-lg font-semibold mt-4">Contact Persons</h3>
            <table className="w-full border rounded text-sm mb-4">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Designation</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {center.contactPersons?.map((cp, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{cp.name}</td>
                    <td className="p-2 border">{cp.designation}</td>
                    <td className="p-2 border">{cp.contactEmail}</td>
                    <td className="p-2 border">{cp.contactNumber}</td>
                    <td className="p-2 border text-center">
                      <button className="text-blue-600 text-sm mr-2">
                        <FiEdit />
                      </button>
                      <button className="text-red-600 text-sm">
                        <FiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tests */}
            <h3 className="text-lg font-semibold mt-4">Tests Offered</h3>
            <table className="w-full border rounded text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 border">Test Name</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Offer Price</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {center.tests?.map((test, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{test.test_name}</td>
                    <td className="p-2 border">{test.description}</td>
                    <td className="p-2 border">{test.price}</td>
                    <td className="p-2 border">{test.offerPrice}</td>
                    <td className="p-2 border text-center">
                      <button className="text-blue-600 text-sm mr-2">
                        <FiEdit />
                      </button>
                      <button className="text-red-600 text-sm">
                        <FiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default CompanyAllDiagnostics;
