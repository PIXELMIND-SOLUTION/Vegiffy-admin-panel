import React from "react";
import {
  Table,
  Container,
  Card,
  CardBody,
  CardTitle,
  Button,
} from "reactstrap";
import { FaEye, FaTrash } from "react-icons/fa";

const dummyUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    registeredAt: "2024-06-01",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Vendor",
    status: "Inactive",
    registeredAt: "2024-07-12",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "Active",
    registeredAt: "2024-08-05",
  },
];

const UserList = () => {
  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <CardBody className="p-2">
          <CardTitle tag="h5" className="mb-3 fw-bold text-primary" style={{ fontSize: "1rem" }}>
            User List
          </CardTitle>
          <Table responsive bordered hover size="sm" className="mb-0">
            <thead className="table-dark" style={{ fontSize: "0.85rem" }}>
              <tr>
                <th className="py-1 px-2">#</th>
                <th className="py-1 px-2">Name</th>
                <th className="py-1 px-2">Email</th>
                <th className="py-1 px-2">Role</th>
                <th className="py-1 px-2">Status</th>
                <th className="py-1 px-2">Registered At</th>
                <th className="py-1 px-2">Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "0.85rem" }}>
              {dummyUsers.map((user, index) => (
                <tr key={user.id}>
                  <td className="py-1 px-2">{index + 1}</td>
                  <td className="py-1 px-2">{user.name}</td>
                  <td className="py-1 px-2">{user.email}</td>
                  <td className="py-1 px-2">{user.role}</td>
                  <td className="py-1 px-2">
                    <span
                      className={`badge ${
                        user.status === "Active" ? "bg-success" : "bg-secondary"
                      }`}
                      style={{ fontSize: "0.75rem", padding: "0.25em 0.4em" }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-1 px-2">{user.registeredAt}</td>
                  <td className="py-1 px-2">
                    <Button size="sm" color="info" className="me-2" style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem" }}>
                      <FaEye />
                    </Button>
                    <Button size="sm" color="danger" style={{ padding: "0.25rem 0.4rem", fontSize: "0.75rem" }}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Container>
  );
};

export default UserList;
