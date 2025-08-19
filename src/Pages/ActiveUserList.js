import React from "react";
import {
  Table,
  Container,
  Card,
  CardBody,
  CardTitle,
  Button,
} from "reactstrap";
import { FaEye } from "react-icons/fa";

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

const ActiveUserList = () => {
  const activeUsers = dummyUsers.filter((user) => user.status === "Active");

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <CardBody className="p-3">
          <CardTitle
            tag="h5"
            className="mb-3 fw-bold text-success"
            style={{ fontSize: "1.1rem" }}
          >
            Active Users
          </CardTitle>
          <Table responsive bordered hover size="sm" className="mb-0">
            <thead className="table-success" style={{ fontSize: "0.9rem" }}>
              <tr>
                <th className="py-1 px-2">#</th>
                <th className="py-1 px-2">Name</th>
                <th className="py-1 px-2">Email</th>
                <th className="py-1 px-2">Role</th>
                <th className="py-1 px-2">Registered At</th>
                <th className="py-1 px-2">Action</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "0.9rem" }}>
              {activeUsers.length > 0 ? (
                activeUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td className="py-1 px-2">{index + 1}</td>
                    <td className="py-1 px-2">{user.name}</td>
                    <td className="py-1 px-2">{user.email}</td>
                    <td className="py-1 px-2">{user.role}</td>
                    <td className="py-1 px-2">{user.registeredAt}</td>
                    <td className="py-1 px-2">
                      <Button
                        size="sm"
                        color="info"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
                        title="View User"
                      >
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    No active users found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Container>
  );
};

export default ActiveUserList;
