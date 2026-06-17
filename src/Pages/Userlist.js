import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Pagination,
  PaginationItem,
  PaginationLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Spinner
} from "reactstrap";
import {
  FaEye,
  FaTrash,
  FaUser,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSort,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaFileExport,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle
} from "react-icons/fa";
import axios from "axios";
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const storedRole = localStorage.getItem("role");


  // View Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filter and Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [filterOpen, setFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("https://api.vegiffy.in/api/admin/users");
      if (data.success) {
        setUsers(data.users || []);
        toast.success("Users loaded successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setError("Failed to fetch users");
        toast.error("Failed to fetch users", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      setError(err.message || "Server error");
      toast.error(err.message || "Server error", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        (user.firstName?.toLowerCase() || '').includes(term) ||
        (user.lastName?.toLowerCase() || '').includes(term) ||
        (user.email?.toLowerCase() || '').includes(term) ||
        (user.phoneNumber || '').includes(term) ||
        (user.referralCode?.toLowerCase() || '').includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(user =>
        statusFilter === "verified" ? user.isVerified : !user.isVerified
      );
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchTerm, statusFilter, sortConfig]);

  // Sort handler
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination calculations
  const paginatedUsers = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / itemsPerPage);
  }, [filteredUsers.length, itemsPerPage]);

  // WhatsApp function
  const handleWhatsApp = (phoneNumber) => {
    if (!phoneNumber) {
      toast.warning("Phone number not available", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    let whatsappNumber = cleanNumber;
    if (!cleanNumber.startsWith('91') && cleanNumber.length === 10) {
      whatsappNumber = `91${cleanNumber}`;
    }
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  // Open delete confirmation modal
  const confirmDelete = (userId) => {
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  // Delete user
  const handleDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await axios.delete(`https://api.vegiffy.in/api/admin/deleteuser/${userToDelete}`);
      await fetchUsers();
      toast.success("User deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Delete failed";
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // View user details
  const handleView = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const dataToExport = filteredUsers.map(user => ({
        'ID': user._id,
        'First Name': user.firstName,
        'Last Name': user.lastName,
        'Email': user.email,
        'Phone': user.phoneNumber,
        'Status': user.isVerified ? 'Verified' : 'Pending',
        'Referral Code': user.referralCode,
        'Referred By': user.referredBy || 'N/A',
        'Joined Date': new Date(user.createdAt).toLocaleDateString('en-IN'),
        'Total Addresses': user.addresses?.length || 0,
        'Total Notifications': user.notifications?.length || 0
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, `Veggyfy_Users_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success("Export successful!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error("Export failed: " + err.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get user initials
  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];

    // Previous button
    items.push(
      <PaginationItem key="prev" disabled={currentPage === 1}>
        <PaginationLink previous onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
          <FaChevronLeft />
        </PaginationLink>
      </PaginationItem>
    );

    // Always show first page
    items.push(
      <PaginationItem key={1} active={currentPage === 1}>
        <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis1" disabled>
          <PaginationLink>...</PaginationLink>
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <PaginationItem key={i} active={currentPage === i}>
            <PaginationLink onClick={() => setCurrentPage(i)}>{i}</PaginationLink>
          </PaginationItem>
        );
      }
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis2" disabled>
          <PaginationLink>...</PaginationLink>
        </PaginationItem>
      );
    }

    // Always show last page if there is more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages} active={currentPage === totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next" disabled={currentPage === totalPages || totalPages === 0}>
        <PaginationLink next onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
          <FaChevronRight />
        </PaginationLink>
      </PaginationItem>
    );

    return items;
  };

  return (
    <Container fluid className="py-4">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-gradient text-primary mb-1">User Management</h2>
          <p className="text-muted mb-0">Manage all user accounts and their activities</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            color="success"
            className="d-flex align-items-center gap-2"
            onClick={exportToExcel}
            disabled={loading}
          >
            <FaFileExport /> Export Excel
          </Button>
          <Button
            color="primary"
            className="d-flex align-items-center gap-2"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : <FaDownload />} Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <Card className="card-stats border-0 shadow">
            <CardBody className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-0">Total Users</h6>
                  <h3 className="mb-0">{users.length}</h3>
                </div>
                <div className="icon icon-shape bg-gradient-primary text-white rounded-circle shadow">
                  <FaUser />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <Card className="card-stats border-0 shadow">
            <CardBody className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-0">Verified Users</h6>
                  <h3 className="mb-0">{users.filter(u => u.isVerified).length}</h3>
                </div>
                <div className="icon icon-shape bg-gradient-success text-white rounded-circle shadow">
                  <FaCheckCircle />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <Card className="card-stats border-0 shadow">
            <CardBody className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-0">Pending Users</h6>
                  <h3 className="mb-0">{users.filter(u => !u.isVerified).length}</h3>
                </div>
                <div className="icon icon-shape bg-gradient-warning text-white rounded-circle shadow">
                  <FaTimesCircle />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <Card className="card-stats border-0 shadow">
            <CardBody className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted mb-0">Avg. Referrals</h6>
                  <h3 className="mb-0">{users.filter(u => u.referredBy).length}</h3>
                </div>
                <div className="icon icon-shape bg-gradient-info text-white rounded-circle shadow">
                  <FaStar />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="border-0 shadow mb-4">
        <CardBody className="p-3">
          <div className="row g-3 align-items-center">
            <div className="col-lg-4 col-md-6">
              <div className="input-group input-group-alternative">
                <span className="input-group-text bg-transparent border-0">
                  <FaSearch className="text-muted" />
                </span>
                <Input
                  type="text"
                  placeholder="Search users by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control-alternative border-0 ps-0"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <Dropdown isOpen={filterOpen} toggle={() => setFilterOpen(!filterOpen)}>
                <DropdownToggle
                  color="secondary"
                  outline
                  className="w-100 d-flex justify-content-between align-items-center"
                  disabled={loading}
                >
                  <FaFilter className="me-2" />
                  {statusFilter === "all" ? "All Status" : statusFilter === "verified" ? "Verified Only" : "Pending Only"}
                </DropdownToggle>
                <DropdownMenu className="w-100">
                  <DropdownItem onClick={() => setStatusFilter("all")}>All Users</DropdownItem>
                  <DropdownItem onClick={() => setStatusFilter("verified")}>Verified Only</DropdownItem>
                  <DropdownItem onClick={() => setStatusFilter("pending")}>Pending Only</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div className="col-lg-5 col-md-12">
              <div className="d-flex gap-2 justify-content-md-end">
                <Button
                  color={sortConfig.key === 'createdAt' && sortConfig.direction === 'desc' ? 'primary' : 'secondary'}
                  outline={!(sortConfig.key === 'createdAt' && sortConfig.direction === 'desc')}
                  onClick={() => requestSort('createdAt')}
                  className="d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FaSort />
                  {sortConfig.key === 'createdAt' && sortConfig.direction === 'desc' ? 'Newest First' : 'Oldest First'}
                </Button>
                <Button
                  color={sortConfig.key === 'firstName' ? 'primary' : 'secondary'}
                  outline={sortConfig.key !== 'firstName'}
                  onClick={() => requestSort('firstName')}
                  className="d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FaSort />
                  Sort by Name
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow">
        <CardBody className="p-0">
          {loading && users.length === 0 ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : error ? (
            <Alert color="danger" className="m-4">
              <strong>Error:</strong> {error}
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-items-center table-flush mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th className="ps-4" scope="col">User</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Status</th>
                      <th scope="col">Referral</th>
                      <th scope="col">Joined</th>
                      <th scope="col" className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="py-5">
                            <FaUser className="text-muted mb-3" size={48} />
                            <h5 className="text-muted">No users found</h5>
                            <p className="text-muted">Try adjusting your search or filter</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr key={user._id} className="border-bottom">
                          <th scope="row" className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm me-3">
                                {user.profileImg ? (
                                  <img
                                    src={user.profileImg}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="rounded-circle"
                                  />
                                ) : (
                                  <div className={`avatar-initials rounded-circle bg-gradient-${user.isVerified ? 'success' : 'warning'} text-white d-flex align-items-center justify-content-center`}>
                                    {getUserInitials(user.firstName, user.lastName)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="fw-bold text-dark">
                                  {user.firstName} {user.lastName}
                                </span>
                                <div className="small text-muted">ID: {user._id?.slice(-8) || 'N/A'}</div>
                              </div>
                            </div>
                          </th>
                          <td>
                            <div className="d-flex flex-column">
                              <div className="d-flex align-items-center mb-1">
                                <FaEnvelope className="text-primary me-2" size={12} />
                                <small className="text-truncate" style={{ maxWidth: '150px' }}>{user.email || 'N/A'}</small>
                              </div>
                              <div className="d-flex align-items-center">
                                <FaPhone className="text-success me-2" size={12} />
                                <small>{user.phoneNumber || 'N/A'}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge
                              color={user.isVerified ? "success" : "warning"}
                              className="px-3 py-2 rounded-pill"
                              pill
                            >
                              {user.isVerified ? (
                                <>
                                  <FaCheckCircle className="me-1" /> Verified
                                </>
                              ) : (
                                "Pending"
                              )}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <code className="fw-bold">{user.referralCode || 'N/A'}</code>
                              {user.referredBy && (
                                <small className="text-muted">Referred by: {user.referredBy}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="text-muted me-2" size={12} />
                              <small>{formatDate(user.createdAt)}</small>
                            </div>
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              <Button
                                color="primary"
                                size="sm"
                                className="btn-icon-only rounded-circle"
                                onClick={() => handleView(user)}
                                title="View Details"
                              >
                                <FaEye />
                              </Button>
                              <Button
                                color="success"
                                size="sm"
                                className="btn-icon-only rounded-circle"
                                onClick={() => handleWhatsApp(user.phoneNumber)}
                                title="Message on WhatsApp"
                              >
                                <FaWhatsapp />
                              </Button>
                              {storedRole === 'admin' && (
                                <Button
                                  color="danger"
                                  size="sm"
                                  className="btn-icon-only rounded-circle"
                                  onClick={() => confirmDelete(user._id)}
                                  disabled={loading || deleting}
                                  title="Delete User"
                                >
                                  <FaTrash />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="card-footer border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                    </small>
                    <Pagination className="mb-0">
                      {getPaginationItems()}
                    </Pagination>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* View User Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setModalOpen(false)} className="border-0 pb-0">
          <div className="d-flex align-items-center">
            {selectedUser?.profileImg ? (
              <img
                src={selectedUser.profileImg}
                alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                className="rounded-circle me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
            ) : (
              <div className={`avatar-initials rounded-circle bg-gradient-${selectedUser?.isVerified ? 'success' : 'warning'} text-white d-flex align-items-center justify-content-center me-3`}
                style={{ width: '60px', height: '60px' }}>
                {getUserInitials(selectedUser?.firstName, selectedUser?.lastName)}
              </div>
            )}
            <div>
              <h5 className="mb-0 fw-bold">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </h5>
              <small className="text-muted">User ID: {selectedUser?._id?.slice(-12) || 'N/A'}</small>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pt-4">
          {selectedUser && (
            <div className="row">
              {/* Personal Info */}
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold text-primary mb-3">
                  <FaUser className="me-2" />
                  Personal Information
                </h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0 py-2">
                    <strong>Email:</strong> {selectedUser.email}
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <strong>Phone:</strong> {selectedUser.phoneNumber}
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <strong>Status:</strong>
                    <Badge color={selectedUser.isVerified ? "success" : "warning"} className="ms-2">
                      {selectedUser.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <strong>Joined:</strong> {formatDate(selectedUser.createdAt)}
                  </div>
                </div>
              </div>

              {/* Referral Info */}
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold text-success mb-3">
                  <FaStar className="me-2" />
                  Referral Information
                </h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0 py-2">
                    <strong>Referral Code:</strong>
                    <Badge color="info" className="ms-2">{selectedUser.referralCode}</Badge>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <strong>Referred By:</strong> {selectedUser.referredBy || "Not referred"}
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <strong>Coins:</strong> {selectedUser.coins ?? 0}
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="col-12 mb-4">
                <h6 className="fw-bold text-warning mb-3">
                  <FaMapMarkerAlt className="me-2" />
                  Addresses ({selectedUser.addresses?.length || 0})
                </h6>
                {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                  <div className="row g-3">
                    {selectedUser.addresses.map((addr, i) => (
                      <div key={i} className="col-md-6">
                        <Card className="border-0 shadow-sm h-100">
                          <CardBody className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Badge color="primary">{addr.addressType || "Primary"}</Badge>
                              <small className="text-muted">#{i + 1}</small>
                            </div>
                            <p className="mb-2 small">{addr.street || addr.addressLine || 'N/A'}</p>
                            <p className="mb-2 small">
                              {addr.city || 'N/A'}, {addr.state || 'N/A'} - {addr.pincode || addr.postalCode || 'N/A'}
                            </p>
                            <p className="mb-2 small">{addr.country || 'N/A'}</p>
                            {addr.phone && (
                              <div className="d-flex align-items-center">
                                <FaPhone className="text-success me-2" size={12} />
                                <small>{addr.phone}</small>
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No addresses available</p>
                )}
              </div>

              {/* Notifications */}
              {selectedUser.notifications && selectedUser.notifications.length > 0 && (
                <div className="col-12">
                  <h6 className="fw-bold text-info mb-3">
                    <FaBell className="me-2" />
                    Recent Notifications ({selectedUser.notifications.length})
                  </h6>
                  <div className="list-group">
                    {selectedUser.notifications.slice(0, 3).map((notif, i) => (
                      <div key={i} className="list-group-item border-0 mb-2 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <strong>{notif.title}</strong>
                          <Badge color={notif.status === 'unread' ? 'warning' : 'secondary'}>
                            {notif.status}
                          </Badge>
                        </div>
                        <p className="mb-1 small">{notif.message}</p>
                        <small className="text-muted">
                          {new Date(notif.timestamp).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-0">
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={cancelDelete} centered>
        <ModalHeader toggle={cancelDelete} className="border-0">
          <div className="d-flex align-items-center text-danger">
            <FaExclamationTriangle size={24} className="me-2" />
            <h5 className="mb-0">Confirm Delete</h5>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="mb-0">
            Are you sure you want to delete this user? This action cannot be undone and all user data will be permanently removed.
          </p>
        </ModalBody>
        <ModalFooter className="border-0">
          <Button color="secondary" onClick={cancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete User
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <style jsx>{`
        .card-stats .icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .avatar {
          width: 40px;
          height: 40px;
        }
        
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-initials {
          width: 40px;
          height: 40px;
          font-weight: bold;
          font-size: 14px;
        }
        
        .bg-gradient-primary { background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%) !important; }
        .bg-gradient-success { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%) !important; }
        .bg-gradient-warning { background: linear-gradient(87deg, #fb6340 0, #fbb140 100%) !important; }
        .bg-gradient-info { background: linear-gradient(87deg, #11cdef 0, #1171ef 100%) !important; }
        
        .btn-icon-only {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .form-control-alternative {
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          transition: all 0.15s ease;
        }
        
        .form-control-alternative:focus {
          border-color: #5e72e4;
          box-shadow: 0 3px 9px rgba(50, 50, 9, 0), 3px 4px 8px rgba(94, 114, 228, 0.1);
        }
        
        .text-gradient {
          background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .list-group-item {
          background: transparent;
        }
      `}</style>
    </Container>
  );
};

export default UserList;