import React from "react";

const VendorList = ({ vendors }) => {
  // Fallback dummy data if no props provided
  const defaultVendors = [
    {
      id: 1,
      vendorName: "FreshMart Supplies",
      contactPerson: "Ravi Kumar",
      phone: "+91 9876543210",
      email: "ravi@freshmart.com",
      vendorAddress: "123 MG Road, Bangalore, Karnataka",
      restaurantName: "Spice Villa",
      restaurantAddress: "45 Food Street, Bangalore",
      restaurantPhone: "+91 9876501234",
    },
    {
      id: 2,
      vendorName: "GreenGrocers Pvt Ltd",
      contactPerson: "Anjali Mehta",
      phone: "+91 9765432100",
      email: "anjali@greengrocers.in",
      vendorAddress: "Plot 22, Market Lane, Pune",
      restaurantName: "Urban Tadka",
      restaurantAddress: "56 Aroma Avenue, Pune",
      restaurantPhone: "+91 9898989898",
    },
  ];

  const vendorList = vendors && vendors.length > 0 ? vendors : defaultVendors;

  return (
    <div className="overflow-x-auto bg-white rounded shadow p-4 max-w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Vendor List
      </h2>

      <table className="min-w-[900px] w-full text-sm border-collapse border border-gray-300">
        <thead className="bg-blue-100 text-blue-800">
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Vendor Name</th>
            <th className="border p-2 text-left">Contact Person</th>
            <th className="border p-2 text-left">Phone</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Vendor Address</th>
            <th className="border p-2 text-left">Restaurant Name</th>
            <th className="border p-2 text-left">Restaurant Address</th>
            <th className="border p-2 text-left">Restaurant Phone</th>
          </tr>
        </thead>
        <tbody>
          {vendorList.map((vendor) => (
            <tr key={vendor.id} className="border-t border-gray-300">
              <td className="border p-2">{vendor.id}</td>
              <td className="border p-2">{vendor.vendorName}</td>
              <td className="border p-2">{vendor.contactPerson || "-"}</td>
              <td className="border p-2">{vendor.phone || "-"}</td>
              <td className="border p-2">{vendor.email || "-"}</td>
              <td className="border p-2" style={{ whiteSpace: "pre-wrap" }}>
                {vendor.vendorAddress || "-"}
              </td>
              <td className="border p-2">{vendor.restaurantName || "-"}</td>
              <td className="border p-2" style={{ whiteSpace: "pre-wrap" }}>
                {vendor.restaurantAddress || "-"}
              </td>
              <td className="border p-2">{vendor.restaurantPhone || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorList;
