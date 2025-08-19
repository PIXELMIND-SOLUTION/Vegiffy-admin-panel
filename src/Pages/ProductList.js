import React from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const ProductList = () => {
  const products = [
    {
      id: 2,
      name: "Veg Pizza",
      description: "A classic vegetarian pizza with fresh vegetables and cheese.",
      price: 450,
      offerPrice: 400,
      image: "https://i.pinimg.com/originals/db/89/b4/db89b4276ee53c3571c939e7970fb0fd.png",
      category: "Pizza",
      subcategory: "Vegetarian",
      restaurantName: "Pizza Palace",
      address: "456 Pizza Avenue, Food City",
    },
    {
      id: 3,
      name: "Spaghetti Aglio Olio",
      description: "Italian pasta with garlic, olive oil, and chili flakes.",
      price: 350,
      offerPrice: 300,
      image: "https://i.pinimg.com/originals/db/89/b4/db89b4276ee53c3571c939e7970fb0fd.png",
      category: "Pasta",
      subcategory: "Italian",
      restaurantName: "Pasta World",
      address: "789 Pasta Street, Food City",
    },
    {
      id: 5,
      name: "Chocolate Cake",
      description: "Rich and creamy chocolate cake with a smooth frosting.",
      price: 200,
      offerPrice: 180,
      image: "https://i.pinimg.com/originals/db/89/b4/db89b4276ee53c3571c939e7970fb0fd.png",
      category: "Dessert",
      subcategory: "Cake",
      restaurantName: "Dessert Delight",
      address: "101 Dessert Road, Food City",
    },
    {
      id: 6,
      name: "Veg Biryani",
      description: "Aromatic rice with mixed vegetables and fragrant spices.",
      price: 350,
      offerPrice: 300,
      image: "https://i.pinimg.com/originals/db/89/b4/db89b4276ee53c3571c939e7970fb0fd.png",
      category: "Biryani",
      subcategory: "Vegetarian",
      restaurantName: "Biryani Delights",
      address: "102 Biryani Lane, Food City",
    },
  ];

  return (
    <div className="overflow-x-auto bg-white rounded shadow p-4 max-w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Product List - Vegetarian Food Items
      </h2>

      <table className="min-w-[900px] w-full text-sm border-collapse border border-gray-300">
        <thead className="bg-green-100 text-green-800">
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Image</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Description</th>
            <th className="border p-2 text-left">Price</th>
            <th className="border p-2 text-left">Offer Price</th>
            <th className="border p-2 text-left">Restaurant</th>
            <th className="border p-2 text-left">Address</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-left">Subcategory</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-gray-300">
              <td className="border p-2">{product.id}</td>
              <td className="border p-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </td>
              <td className="border p-2">{product.name}</td>
              <td className="border p-2" style={{ whiteSpace: "pre-wrap", maxWidth: 200 }}>
                {product.description}
              </td>
              <td className="border p-2">₹{product.price}</td>
              <td className="border p-2">
                ₹{product.offerPrice}{" "}
                <span className="text-xs text-gray-500 line-through">
                  ₹{product.price}
                </span>
              </td>
              <td className="border p-2">{product.restaurantName}</td>
              <td className="border p-2" style={{ whiteSpace: "pre-wrap", maxWidth: 150 }}>
                {product.address}
              </td>
              <td className="border p-2">{product.category}</td>
              <td className="border p-2">{product.subcategory}</td>
              <td className="border p-2 flex space-x-2">
                <button className="text-blue-500 hover:text-blue-700" title="View">
                  <FaEye />
                </button>
                <button className="text-yellow-500 hover:text-yellow-700" title="Edit">
                  <FaEdit />
                </button>
                <button className="text-red-500 hover:text-red-700" title="Delete">
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
