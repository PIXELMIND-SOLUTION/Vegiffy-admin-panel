import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateProductForm = () => {
  const navigate = useNavigate();

  // Dummy categories and subcategories data
  const dummyCategories = [
    { _id: "cat1", name: "Pizza" },
    { _id: "cat2", name: "Pasta" },
    { _id: "cat3", name: "Dessert" },
    { _id: "cat4", name: "Biryani" },
  ];

  const dummySubcategories = {
    cat1: [
      { _id: "subcat1", name: "Vegetarian" },
      { _id: "subcat2", name: "Non-Vegetarian" },
    ],
    cat2: [
      { _id: "subcat3", name: "Italian" },
      { _id: "subcat4", name: "Continental" },
    ],
    cat3: [
      { _id: "subcat5", name: "Cake" },
      { _id: "subcat6", name: "Ice Cream" },
    ],
    cat4: [
      { _id: "subcat7", name: "Vegetarian" },
      { _id: "subcat8", name: "Non-Vegetarian" },
    ],
  };

  // State variables
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update subcategories when category changes
  useEffect(() => {
    if (category) {
      setSubcategories(dummySubcategories[category] || []);
      setSubcategory(""); // reset subcategory on category change
    } else {
      setSubcategories([]);
      setSubcategory("");
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Here you can handle form submission (e.g., send to API)
    // For now, just alert the form data
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert("Product created successfully!\n" + JSON.stringify({
        restaurantName,
        address,
        category,
        subcategory,
        price,
        offerPrice,
        productName,
        description,
        imagesCount: images.length,
      }, null, 2));

      navigate("/");
    } catch (error) {
      alert("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">
      <h3 className="text-lg font-bold mb-6">Create Product</h3>
      <form onSubmit={handleSubmit}>
        {/* Restaurant Info */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Restaurant Name</label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
            />
          </div>

          <div className="w-1/2">
            <label className="block text-sm mb-1">Address</label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Category, Subcategory, Price */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/3">
            <label className="block text-sm mb-1">Category</label>
            <select
              className="p-2 border rounded w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {dummyCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/3">
            <label className="block text-sm mb-1">Subcategory</label>
            <select
              className="p-2 border rounded w-full"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              required
              disabled={!category}
            >
              <option value="">Select a subcategory</option>
              {subcategories.map((subcat) => (
                <option key={subcat._id} value={subcat._id}>
                  {subcat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/6">
            <label className="block text-sm mb-1">Price</label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="w-1/6">
            <label className="block text-sm mb-1">Offer Price</label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Product Name */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Product Name</label>
          <input
            type="text"
            className="p-2 border rounded w-full"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Description</label>
          <textarea
            className="p-2 border rounded w-full"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Images */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Upload Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="p-2 border rounded w-full"
          />
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((image, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${i}`}
                  className="h-16 w-16 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 text-red-700 bg-red-100 border border-red-600 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-blue-700 bg-blue-100 border border-blue-600 rounded"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
