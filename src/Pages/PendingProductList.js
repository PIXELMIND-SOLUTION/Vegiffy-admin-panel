import React, { useEffect, useState } from "react";
import {
  Table,
  Container,
  Card,
  CardBody,
  CardTitle,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Row,
  Col,
  Badge,
  ButtonGroup,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaEdit,
  FaTrashAlt,
  FaFileCsv, 
  FaSearch, 
  FaRupeeSign, 
  FaAngleLeft, 
  FaAngleRight, 
  FaAngleDoubleLeft, 
  FaAngleDoubleRight, 
  FaClock,
  FaSave,
  FaTag,
  FaStore,
  FaMapMarkerAlt,
  FaPercent
} from "react-icons/fa";
import axios from "axios";
import Papa from "papaparse";

const PendingProductList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [inactiveProducts, setInactiveProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://api.vegiffy.in/api/category");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch pending products (inactive status)
  const fetchInactiveProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("https://api.vegiffy.in/api/restaurant-products");
      if (data.success && Array.isArray(data.data)) {
        setRestaurants(data.data);
        
        // Filter products with inactive status
        const inactive = data.data.flatMap((rest) =>
          rest.recommended
            ?.filter((prod) => prod.status === "inactive")
            .map((prod) => ({
              ...prod,
              restaurantId: rest._id,
              restaurantName: rest.restaurantName,
              locationName: rest.locationName,
              restaurantStatus: rest.status,
              restaurantImage: rest.image?.url,
              timeAndKm: rest.timeAndKm
            })) || []
        );
        
        setInactiveProducts(inactive);
        setFilteredProducts(inactive);
      } else {
        setError("No inactive products found");
      }
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveProducts();
    fetchCategories();
  }, []);

  // Filter products by search
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProducts(inactiveProducts);
    } else {
      const filtered = inactiveProducts.filter((prod) =>
        (prod.name + prod.restaurantName + prod.locationName + prod.content)
          .toLowerCase()
          .includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
    setCurrentPage(1);
  }, [search, inactiveProducts]);

  // Approve product (change status to active)
  const handleApprove = async (product) => {
    const productId = product.restaurantId;
    const recommendedId = product._id;
    
    if (!productId || !recommendedId) {
      alert("Product ID not found");
      return;
    }

    setActionLoading(recommendedId);
    try {
      const formData = new FormData();
      
      const recommendedData = {
        name: product.name,
        price: product.price,
        halfPlatePrice: product.halfPlatePrice,
        fullPlatePrice: product.fullPlatePrice,
        discount: product.discount,
        content: product.content,
        preparationTime: product.preparationTime,
        status: "active", // Change to active
      };

      if (product.tags) {
        recommendedData.tags = Array.isArray(product.tags) ? product.tags : [product.tags];
      }

      if (product.category) {
        recommendedData.category = product.category;
      }

      formData.append("recommended", JSON.stringify(recommendedData));

      const response = await axios.put(
        `https://api.vegiffy.in/api/restaurant-product/${productId}/${recommendedId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        alert("Product approved successfully!");
        fetchInactiveProducts();
      } else {
        alert("Failed to approve product");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject product (delete)
  const handleReject = async (product) => {
    const productId = product.restaurantId;
    const recommendedId = product._id;
    
    if (!productId || !recommendedId) {
      alert("Product ID not found");
      return;
    }

    if (!window.confirm("Are you sure you want to reject this product?")) return;

    setActionLoading(recommendedId);
    try {
      const res = await fetch(`https://api.vegiffy.in/api/restaurant-products/${productId}/${recommendedId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to reject product");
      }
      
      alert("Product rejected successfully!");
      fetchInactiveProducts();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditProduct({ ...product });
    setShowEditModal(true);
  };

  // Update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    setUpdateLoading(true);
    try {
      const formData = new FormData();
      
      const productId = editProduct.restaurantId;
      const recommendedId = editProduct._id;
      
      if (!productId || !recommendedId) {
        alert("Product ID not found");
        setUpdateLoading(false);
        return;
      }

      const recommendedData = {
        name: editProduct.name,
        price: editProduct.price,
        halfPlatePrice: editProduct.halfPlatePrice,
        fullPlatePrice: editProduct.fullPlatePrice,
        discount: editProduct.discount,
        content: editProduct.content,
        preparationTime: editProduct.preparationTime,
        status: editProduct.status || "inactive",
      };

      if (editProduct.tags) {
        recommendedData.tags = Array.isArray(editProduct.tags) 
          ? editProduct.tags 
          : [editProduct.tags];
      }

      if (editProduct.category) {
        recommendedData.category = editProduct.category;
      }

      formData.append("recommended", JSON.stringify(recommendedData));
      
      if (editProduct.newImage) {
        formData.append("recommendedImage", editProduct.newImage);
      }

      const response = await axios.put(
        `https://api.vegiffy.in/api/restaurant-product/${productId}/${recommendedId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        alert("Product updated successfully!");
        setShowEditModal(false);
        setEditProduct(null);
        fetchInactiveProducts();
      } else {
        alert("Failed to update product: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProduct(prev => ({
        ...prev,
        newImage: file,
        image: URL.createObjectURL(file)
      }));
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
    
    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Export CSV
  const handleExport = () => {
    const csv = Papa.unparse(
      filteredProducts.map((p) => ({
        Name: p.name,
        Description: p.content,
        Price: p.price,
        HalfPlate: p.halfPlatePrice || 0,
        FullPlate: p.fullPlatePrice || 0,
        Discount: p.discount + "%",
        Restaurant: p.restaurantName,
        Location: p.locationName,
        Status: p.status,
        Tags: (p.tags || []).join(", "),
        'Prep Time': p.preparationTime || 0,
        'Submitted Date': p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inactive-products.csv");
    link.click();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "bg-success text-white";
      case "inactive":
        return "bg-warning text-dark";
      case "rejected":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <Container fluid className="mt-2 px-2">
      <Card className="shadow-sm border-0 rounded-3">
        <CardBody className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <CardTitle tag="h5" className="fw-bold text-dark mb-1">
                Inactive Products
              </CardTitle>
              <p className="text-muted small mb-0">
                Manage inactive restaurant products
              </p>
            </div>
            <Button color="outline-success" size="sm" className="px-3 py-1 rounded-pill d-flex align-items-center" onClick={handleExport}>
              <FaFileCsv className="me-1" size={12} /> CSV
            </Button>
          </div>

          {/* Search */}
          <Row className="mb-3">
            <Col md={8}>
              <div className="position-relative">
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={12} />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, restaurants..."
                  className="ps-5 py-2 rounded-pill border-0 bg-light"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
            </Col>
            <Col md={4} className="d-flex align-items-center justify-content-end">
              <Badge color="warning" className="px-3 py-2 d-flex align-items-center">
                <FaClock className="me-1" size={10} />
                <span style={{ fontSize: "0.75rem" }}>{filteredProducts.length} Inactive</span>
              </Badge>
            </Col>
          </Row>

          {/* Loading/Error */}
          {loading ? (
            <div className="text-center my-4 py-4">
              <Spinner color="warning" size="sm" />
              <p className="mt-2 small text-muted">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center my-4 py-4">
              <div className="text-danger small mb-2">{error}</div>
              <Button color="warning" size="sm" onClick={fetchInactiveProducts}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive rounded-3 border">
                <Table hover size="sm" className="mb-0" style={{ fontSize: "0.8rem" }}>
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 ps-3 py-2">#</th>
                      <th className="border-0 py-2">Product</th>
                      <th className="border-0 py-2">Price</th>
                      <th className="border-0 py-2">Restaurant</th>
                      <th className="border-0 py-2">Location</th>
                      <th className="border-0 py-2">Status</th>
                      <th className="border-0 text-center pe-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="text-muted">
                            <FaCheck size={24} className="mb-2 opacity-50" />
                            <p className="small mb-0">No inactive products found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentProducts.map((prod, idx) => (
                        <tr key={prod._id} className="border-top">
                          <td className="ps-3 py-2 text-muted">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                          <td className="py-2">
                            <div className="d-flex align-items-center">
                              <img
                                src={prod.image || "https://via.placeholder.com/30x30"}
                                alt={prod.name}
                                className="rounded-2 me-2"
                                style={{ width: 30, height: 30, objectFit: "cover" }}
                              />
                              <div>
                                <div className="fw-semibold">{prod.name}</div>
                                <small className="text-muted">{prod.content?.substring(0, 20)}...</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-2">
                            <span className="fw-bold text-success">₹{prod.price}</span>
                            {prod.discount > 0 && (
                              <small className="text-danger d-block">{prod.discount}% off</small>
                            )}
                          </td>
                          <td className="py-2">
                            <div className="d-flex align-items-center">
                              <FaStore className="text-muted me-1" size={10} />
                              <span>{prod.restaurantName}</span>
                            </div>
                          </td>
                          <td className="py-2">
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt className="text-muted me-1" size={10} />
                              <span>{prod.locationName}</span>
                            </div>
                          </td>
                          <td className="py-2">
                            <Badge color="warning" className="px-2 py-1" style={{ fontSize: "0.7rem" }}>
                              <FaClock className="me-1" size={8} />
                              Inactive
                            </Badge>
                          </td>
                          <td className="pe-3 py-2 text-center">
                            <ButtonGroup size="sm">
                              <Button 
                                color="outline-info" 
                                className="border-0 rounded-2 mx-1 p-1"
                                onClick={() => setViewProduct(prod)}
                                title="View Details"
                              >
                                <FaEye size={12} />
                              </Button>
                              <Button 
                                color="outline-warning" 
                                className="border-0 rounded-2 mx-1 p-1"
                                onClick={() => handleEdit(prod)}
                                title="Edit Product"
                              >
                                <FaEdit size={12} />
                              </Button>
                              <Button 
                                color="outline-success" 
                                className="border-0 rounded-2 mx-1 p-1"
                                onClick={() => handleApprove(prod)}
                                disabled={actionLoading === prod._id}
                                title="Approve (Make Active)"
                              >
                                {actionLoading === prod._id ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <FaCheck size={12} />
                                )}
                              </Button>
                              <Button 
                                color="outline-danger" 
                                className="border-0 rounded-2 mx-1 p-1"
                                onClick={() => handleReject(prod)}
                                disabled={actionLoading === prod._id}
                                title="Reject (Delete)"
                              >
                                {actionLoading === prod._id ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <FaTimes size={12} />
                                )}
                              </Button>
                            </ButtonGroup>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredProducts.length > itemsPerPage && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="small text-muted">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Pagination size="sm" className="mb-0">
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink first onClick={firstPage}>
                        <FaAngleDoubleLeft size={10} />
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink previous onClick={prevPage}>
                        <FaAngleLeft size={10} />
                      </PaginationLink>
                    </PaginationItem>
                    
                    {getPageNumbers().map(number => (
                      <PaginationItem key={number} active={number === currentPage}>
                        <PaginationLink onClick={() => paginate(number)} style={{ fontSize: "0.75rem" }}>
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink next onClick={nextPage}>
                        <FaAngleRight size={10} />
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink last onClick={lastPage}>
                        <FaAngleDoubleRight size={10} />
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* View Product Modal */}
      <Modal isOpen={!!viewProduct} toggle={() => setViewProduct(null)} size="md" className="rounded-3">
        <ModalHeader toggle={() => setViewProduct(null)} className="border-0 pb-0 pt-3 px-3">
          <h5 className="fw-bold text-dark mb-0">Product Details</h5>
        </ModalHeader>
        <ModalBody className="pt-2 px-3 pb-3">
          {viewProduct && (
            <div className="row g-3">
              <div className="col-12 text-center">
                <img
                  src={viewProduct.image || "https://via.placeholder.com/150x150"}
                  alt={viewProduct.name}
                  className="rounded-3 shadow-sm mb-2"
                  style={{ maxHeight: 150, width: 'auto', objectFit: "cover" }}
                />
              </div>
              
              <div className="col-md-6">
                <div className="bg-light p-2 rounded-3">
                  <h6 className="fw-bold text-warning small mb-2">Product Info</h6>
                  <p className="small mb-1"><strong>Name:</strong> {viewProduct.name}</p>
                  <p className="small mb-1"><strong>Price:</strong> ₹{viewProduct.price}</p>
                  <p className="small mb-1"><strong>Discount:</strong> {viewProduct.discount}%</p>
                  {viewProduct.halfPlatePrice > 0 && (
                    <p className="small mb-1"><strong>Half:</strong> ₹{viewProduct.halfPlatePrice}</p>
                  )}
                  {viewProduct.fullPlatePrice > 0 && (
                    <p className="small mb-1"><strong>Full:</strong> ₹{viewProduct.fullPlatePrice}</p>
                  )}
                  <p className="small mb-0"><strong>Prep:</strong> {viewProduct.preparationTime || 0} mins</p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="bg-light p-2 rounded-3">
                  <h6 className="fw-bold text-warning small mb-2">Restaurant Info</h6>
                  <p className="small mb-1"><strong>Name:</strong> {viewProduct.restaurantName}</p>
                  <p className="small mb-1"><strong>Location:</strong> {viewProduct.locationName}</p>
                  <p className="small mb-0"><strong>Status:</strong> {viewProduct.status}</p>
                </div>
              </div>

              <div className="col-12">
                <div className="bg-light p-2 rounded-3">
                  <h6 className="fw-bold text-warning small mb-2">Description</h6>
                  <p className="small mb-0">{viewProduct.content || "No description"}</p>
                </div>
              </div>

              {viewProduct.tags?.length > 0 && (
                <div className="col-12">
                  <div className="bg-light p-2 rounded-3">
                    <h6 className="fw-bold text-warning small mb-2">Tags</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {viewProduct.tags.map((tag, idx) => (
                        <Badge key={idx} color="secondary" className="px-2 py-1" style={{ fontSize: "0.7rem" }}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="col-12">
                <div className="d-flex justify-content-between">
                  <Button 
                    color="secondary" 
                    size="sm"
                    className="rounded-2 px-3"
                    onClick={() => setViewProduct(null)}
                  >
                    Close
                  </Button>
                  <div>
                    <Button 
                      color="outline-warning" 
                      size="sm"
                      className="rounded-2 me-1 px-3"
                      onClick={() => {
                        handleEdit(viewProduct);
                        setViewProduct(null);
                      }}
                    >
                      <FaEdit size={12} className="me-1" />
                      Edit
                    </Button>
                    <Button 
                      color="success" 
                      size="sm"
                      className="rounded-2 me-1 px-3"
                      onClick={() => {
                        handleApprove(viewProduct);
                        setViewProduct(null);
                      }}
                      disabled={actionLoading === viewProduct._id}
                    >
                      {actionLoading === viewProduct._id ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <FaCheck size={12} className="me-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button 
                      color="danger" 
                      size="sm"
                      className="rounded-2 px-3"
                      onClick={() => {
                        handleReject(viewProduct);
                        setViewProduct(null);
                      }}
                      disabled={actionLoading === viewProduct._id}
                    >
                      {actionLoading === viewProduct._id ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <FaTimes size={12} className="me-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)} size="md" className="rounded-3">
        <ModalHeader toggle={() => setShowEditModal(false)} className="border-0 pb-0 pt-3 px-3">
          <h5 className="fw-bold text-dark mb-0">Edit Product</h5>
        </ModalHeader>
        <ModalBody className="pt-2 px-3 pb-3">
          {editProduct && (
            <form onSubmit={handleUpdate}>
              <div className="row g-2">
                <div className="col-12">
                  <label className="small fw-medium mb-1">Product Name *</label>
                  <Input
                    type="text"
                    value={editProduct.name || ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    size="sm"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-medium mb-1">Price (₹) *</label>
                  <Input
                    type="number"
                    value={editProduct.price || ""}
                    onChange={(e) => handleEditChange("price", e.target.value)}
                    size="sm"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-medium mb-1">Discount (%)</label>
                  <Input
                    type="number"
                    value={editProduct.discount || ""}
                    onChange={(e) => handleEditChange("discount", e.target.value)}
                    size="sm"
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-medium mb-1">Half Plate</label>
                  <Input
                    type="number"
                    value={editProduct.halfPlatePrice || ""}
                    onChange={(e) => handleEditChange("halfPlatePrice", e.target.value)}
                    size="sm"
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-medium mb-1">Full Plate</label>
                  <Input
                    type="number"
                    value={editProduct.fullPlatePrice || ""}
                    onChange={(e) => handleEditChange("fullPlatePrice", e.target.value)}
                    size="sm"
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-medium mb-1">Category</label>
                  <Input
                    type="select"
                    value={editProduct.category || ""}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                    size="sm"
                  >
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                    ))}
                  </Input>
                </div>

                <div className="col-md-6">
                  <label className="small fw-medium mb-1">Prep Time (mins)</label>
                  <Input
                    type="number"
                    value={editProduct.preparationTime || ""}
                    onChange={(e) => handleEditChange("preparationTime", e.target.value)}
                    size="sm"
                  />
                </div>

                <div className="col-12">
                  <label className="small fw-medium mb-1">Tags (comma)</label>
                  <Input
                    type="text"
                    value={(editProduct.tags || []).join(", ")}
                    onChange={(e) => handleEditChange("tags", e.target.value.split(",").map(t => t.trim()))}
                    size="sm"
                    placeholder="spicy, veg, bestseller"
                  />
                </div>

                <div className="col-12">
                  <label className="small fw-medium mb-1">Description</label>
                  <Input
                    type="textarea"
                    value={editProduct.content || ""}
                    onChange={(e) => handleEditChange("content", e.target.value)}
                    rows="2"
                    size="sm"
                  />
                </div>

                <div className="col-12">
                  <label className="small fw-medium mb-1">Image</label>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={editProduct.image || "https://via.placeholder.com/40x40"}
                      alt="Preview"
                      className="rounded-2 border"
                      style={{ width: 40, height: 40, objectFit: "cover" }}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="col-12 mt-3">
                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      type="button" 
                      color="secondary" 
                      size="sm"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      color="primary" 
                      size="sm"
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <Spinner size="sm" className="me-1" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FaSave size={12} className="me-1" />
                          Update
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default PendingProductList;