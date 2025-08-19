import React, { useEffect, useState } from "react";
import { FaFileCsv, FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import axios from "axios";

const dummyImage =
  "https://play-lh.googleusercontent.com/Q06nVYXRyFRTgqVu8sNeBbHvCyJguq6aqVLWnFcNjYhUcdvvSoac56KPuOr9ZQlnldqo";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios
      .get("https://credenhealth.onrender.com/api/admin/getallcategory")
      .then((res) => {
        const withImages = res.data.map((cat) => ({
          ...cat,
          image: dummyImage,
        }));
        setCategories(withImages);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handleBulkImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const imported = XLSX.utils.sheet_to_json(worksheet);
      console.log("Imported Categories:", imported);
      alert("Category data imported successfully!");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEdit = (id) => {
    console.log(`Edit category with ID: ${id}`);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter((cat) => cat._id !== id));
  };

  const headers = [
    { label: "Category Name", key: "name" },
    { label: "Description", key: "description" },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Category List</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by category name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <CSVLink
          data={filteredCategories}
          headers={headers}
          filename="category_list.csv"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
        >
          <FaFileCsv /> CSV
        </CSVLink>

        <label
          htmlFor="import-cat"
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <FaUpload /> Bulk Import
          <input
            type="file"
            accept=".xlsx, .xls"
            id="import-cat"
            onChange={handleBulkImport}
            className="hidden"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border text-left">Image</th>
              <th className="p-2 border text-left">Category Name</th>
              <th className="p-2 border text-left">Description</th>
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                </td>
                <td className="p-2 border">{cat.name}</td>
                <td className="p-2 border">{cat.description || "-"}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleEdit(cat._id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
