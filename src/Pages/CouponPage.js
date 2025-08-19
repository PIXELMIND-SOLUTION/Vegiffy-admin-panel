import { useState } from "react";
import { FaHamburger, FaShoppingBag, FaTv, FaFilter } from "react-icons/fa"; // Icons for categories

// Function to generate a random 5-character alphanumeric coupon code
const generateCouponCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const CouponsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [coupons] = useState([
    // Coupons for Restaurants
    {
      category: "Restaurant",
      coupons: [
        { id: 1, name: "Summer Feast", discount: 20, validTill: "31-07-2025", code: generateCouponCode(), color: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
        { id: 2, name: "Family Dinner", discount: 15, validTill: "31-12-2025", code: generateCouponCode(), color: "bg-gradient-to-r from-orange-400 to-orange-600" },
        { id: 3, name: "Pizza Night", discount: 10, validTill: "15-06-2025", code: generateCouponCode(), color: "bg-gradient-to-r from-red-400 to-red-600" },
      ]
    },
    // Coupons for Meat Shop
    {
      category: "Meat Shop",
      coupons: [
        { id: 4, name: "Meat Lovers Special", discount: 25, validTill: "31-08-2025", code: generateCouponCode(), color: "bg-gradient-to-r from-red-400 to-red-600" },
        { id: 5, name: "Butcher's Deal", discount: 30, validTill: "30-11-2025", code: generateCouponCode(), color: "bg-gradient-to-r from-green-400 to-green-600" },
      ]
    },
    // Coupons for Groceries
    {
      category: "Groceries",
      coupons: [
        { id: 6, name: "Grocery Discount", discount: 20, validTill: "31-07-2025", code: generateCouponCode(), color: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
        { id: 7, name: "Healthy Groceries", discount: 15, validTill: "30-09-2025", code: generateCouponCode(), color: "bg-gradient-to-r from-blue-400 to-blue-600" },
      ]
    },
  ]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const filteredCoupons = selectedCategory === "All" 
    ? coupons 
    : coupons.filter((category) => category.category === selectedCategory);

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 to-green-100">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-700">Vendor Coupons by Category</h1>

      {/* Category Filter */}
      <div className="flex justify-center space-x-4 mb-6">
        <button 
          onClick={() => handleCategorySelect("All")}
          className={`px-4 py-2 rounded-md text-white ${selectedCategory === "All" ? "bg-blue-500" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          <FaFilter className="inline-block mr-2" /> All
        </button>
        <button 
          onClick={() => handleCategorySelect("Restaurant")}
          className={`px-4 py-2 rounded-md text-white ${selectedCategory === "Restaurant" ? "bg-yellow-500" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          <FaHamburger className="inline-block mr-2" /> Restaurant
        </button>
        <button 
          onClick={() => handleCategorySelect("Meat Shop")}
          className={`px-4 py-2 rounded-md text-white ${selectedCategory === "Meat Shop" ? "bg-red-500" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          <FaShoppingBag className="inline-block mr-2" /> Meat Shop
        </button>
        <button 
          onClick={() => handleCategorySelect("Groceries")}
          className={`px-4 py-2 rounded-md text-white ${selectedCategory === "Groceries" ? "bg-green-500" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          <FaTv className="inline-block mr-2" /> Groceries
        </button>
      </div>

      {/* Loop through each category and display its coupons */}
      {filteredCoupons.map((category) => (
        <div key={category.category} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{category.category}</h2>

          {/* Coupons List for each category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {category.coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`${coupon.color} shadow-lg rounded-lg p-4 text-white hover:shadow-xl transition-all`}
              >
                <div className="text-sm font-semibold mb-2">{coupon.name}</div>
                <div className="text-xs mb-1">Discount: {coupon.discount}%</div>
                <div className="text-xs mb-1">Coupon Code: {coupon.code}</div> {/* Show coupon code */}
                <div className="text-xs mb-2">Valid Till: {coupon.validTill}</div>
                <div className="flex justify-between items-center mt-3 text-xs">
                  <button className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200">
                    Edit
                  </button>
                  <button className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CouponsPage;
