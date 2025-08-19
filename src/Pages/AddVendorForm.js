import React, { useState } from "react";

const AddVendorForm = ({ onAddVendor }) => {
  const [vendorName, setVendorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");

  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!vendorName.trim()) {
      alert("Vendor name is required");
      return;
    }

    const newVendor = {
      id: Date.now(),
      vendorName,
      contactPerson,
      phone,
      email,
      vendorAddress,
      restaurantName,
      restaurantAddress,
      restaurantPhone,
    };

    onAddVendor(newVendor);

    // Reset form fields
    setVendorName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setVendorAddress("");
    setRestaurantName("");
    setRestaurantAddress("");
    setRestaurantPhone("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl bg-white p-6 rounded shadow space-y-6 ml-16"
    >
      <h2 className="text-2xl font-semibold mb-6">Add New Vendor</h2>

      {/* Vendor Info in 2 columns */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2" htmlFor="vendorName">
            Vendor Name <span className="text-red-500">*</span>
          </label>
          <input
            id="vendorName"
            type="text"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2" htmlFor="contactPerson">
            Contact Person
          </label>
          <input
            id="contactPerson"
            type="text"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vendor@example.com"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2" htmlFor="vendorAddress">
          Vendor Address
        </label>
        <textarea
          id="vendorAddress"
          value={vendorAddress}
          onChange={(e) => setVendorAddress(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Restaurant Details heading */}
      <h3 className="text-xl font-semibold mt-8 mb-4">Restaurant Details</h3>

      {/* Restaurant Info in 2 columns */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2" htmlFor="restaurantName">
            Restaurant Name
          </label>
          <input
            id="restaurantName"
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2" htmlFor="restaurantPhone">
            Restaurant Phone
          </label>
          <input
            id="restaurantPhone"
            type="tel"
            value={restaurantPhone}
            onChange={(e) => setRestaurantPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2" htmlFor="restaurantAddress">
          Restaurant Address
        </label>
        <textarea
          id="restaurantAddress"
          value={restaurantAddress}
          onChange={(e) => setRestaurantAddress(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Add Vendor
      </button>
    </form>
  );
};

export default AddVendorForm;
