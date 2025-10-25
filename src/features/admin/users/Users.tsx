import React, { useEffect, useState, ChangeEvent } from "react";
import { Modal, Button, Form, Table, Badge, Spinner } from "react-bootstrap";
import { IOrder } from "src/features/order/OrdersPage";


interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  age?: string;
  createdAt?: string;
  ordersCount?: number;
  totalSpent?: string;
}

interface EditForm {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  role: string;
  age: string;
}

const UsersManagement: React.FC = () => {
  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected / modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<IOrder[]>([]);

  // Forms
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    email: "",
    password: "",
    rePassword: "",
    role: "user",
    age: "",
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
    age: "",
    role: "user",
  });

  // Pagination & Filters / Search
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "admin" | "user">("All");
  const [ageFilter, setAgeFilter] = useState<"All" | "lt18" | "gte18">("All");

  // Fetch data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch("https://68e83849f2707e6128ca32fb.mockapi.io/users"),
          fetch("https://68e43ee28e116898997b5bf8.mockapi.io/orders"),
        ]);

        const usersData: User[] = await usersRes.json();
        const ordersData: IOrder[] = await ordersRes.json();

        // enrich users with ordersCount and totalSpent
        const enrichedUsers = usersData.map((user) => {
          const userOrders = ordersData.filter((o) => o.userID === user.id);
          const totalSpent = userOrders.reduce(
            (sum, o) => sum + parseFloat(o.totalPrice || "0"),
            0
          );

          return {
            ...user,
            ordersCount: userOrders.length,
            totalSpent: totalSpent.toFixed(2),
          };
        });

        setUsers(enrichedUsers);
        setOrders(ordersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --------- Helpers: filtering / searching / pagination ---------
  const normalize = (s?: string) => (s || "").toLowerCase();

  // Apply search + filters client-side
  const filteredUsers = users.filter((u) => {
    // searchTerm: id or name or email
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const matchesTerm =
        (u.id && u.id.toLowerCase().includes(term)) ||
        normalize(u.name).includes(term) ||
        normalize(u.email).includes(term);
      if (!matchesTerm) return false;
    }

    // roleFilter
    if (roleFilter !== "All") {
      if (u.role !== roleFilter) return false;
    }

    // ageFilter
    if (ageFilter !== "All") {
      const ageNum = u.age ? Number(u.age) : NaN;
      if (ageFilter === "lt18") {
        if (!(ageNum && ageNum < 18)) return false;
      } else if (ageFilter === "gte18") {
        if (!(ageNum && ageNum >= 18)) return false;
      }
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  // keep currentPage valid whenever filteredUsers changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUsers.length, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  // --------- Form handlers & validation ---------
  const handleEditFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateEditForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

    if (editForm.email && !emailRegex.test(editForm.email)) {
      alert("Invalid email format!");
      return false;
    }
    if ((editForm.password || editForm.rePassword) && !passRegex.test(editForm.password)) {
      alert(
        "Password must be at least 8 chars, include uppercase, lowercase, and number."
      );
      return false;
    }
    if (editForm.password !== editForm.rePassword) {
      alert("Passwords do not match!");
      return false;
    }
    if (editForm.age && (isNaN(Number(editForm.age)) || Number(editForm.age) < 10)) {
      alert("Please enter a valid age (10+).");
      return false;
    }
    return true;
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      rePassword: "",
      role: user.role || "user",
      age: user.age || "",
    });
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    if (!validateEditForm()) return;

    const updatedData: Partial<User> = {
      name: editForm.name || selectedUser.name,
      email: editForm.email || selectedUser.email,
      role: editForm.role || selectedUser.role,
      age: editForm.age || selectedUser.age || "",
    };
    if (editForm.password) {
      (updatedData as any).password = editForm.password;
    }

    try {
      const res = await fetch(
        `https://68e83849f2707e6128ca32fb.mockapi.io/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );


      
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setShowEditModal(false);
      alert("User updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  // Add user validation (including rePassword)
  const validateNewUser = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

    if (!newUser.name || !newUser.email || !newUser.password || !newUser.age) {
      alert("Please fill in all required fields.");
      return false;
    }
    if (!emailRegex.test(newUser.email)) {
      alert("Invalid email format!");
      return false;
    }
    if (!passRegex.test(newUser.password)) {
      alert(
        "Password must be at least 8 chars, include uppercase, lowercase, and number."
      );
      return false;
    }
    if (newUser.password !== newUser.rePassword) {
      alert("Passwords do not match!");
      return false;
    }
    if (isNaN(Number(newUser.age)) || Number(newUser.age) < 10) {
      alert("Please enter a valid age (10+).");
      return false;
    }
    return true;
  };

  const handleAddUser = async () => {
    if (!validateNewUser()) return;

    try {
      // check existing emails
      const res = await fetch("https://68e83849f2707e6128ca32fb.mockapi.io/users");
      const existingUsers: User[] = await res.json();



      const emailExists = existingUsers.some(
        (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
      );



      if (emailExists) {
        alert("⚠️ This email already exists. Please use another one.");
        return;
      }

      const addRes = await fetch("https://68e83849f2707e6128ca32fb.mockapi.io/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          age: newUser.age,
        }),
      });

      const created = await addRes.json();




      setUsers((prev) => [...prev, { ...(created as any), ordersCount: 0, totalSpent: "0.00" }]);
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        rePassword: "",
        age: "",
        role: "user",
      });
      // after adding, jump to last page that contains the new user
      const afterFiltered = [...filteredUsers, created];
      const newTotalPages = Math.max(1, Math.ceil(afterFiltered.length / itemsPerPage));
      setCurrentPage(newTotalPages);
      alert("✅ User added successfully!");
    } catch (err) {
      console.error("Error adding user:", err);
      alert("❌ Something went wrong while adding the user.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`https://68e83849f2707e6128ca32fb.mockapi.io/users/${id}`, {
        method: "DELETE",
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert("User deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete user.");
    }
  };

  const handleViewOrders = (userId: string) => {
    const userOrders = orders.filter((o) => o.userID === userId);
    setSelectedOrders(userOrders);
    setShowOrdersModal(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setAgeFilter("All");
    setCurrentPage(1);
  };

  // Loading state
  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> Loading...
      </div>
    );

  // ---------------- UI ----------------
  return (
    <div className=" users-container">
      {/* Filters / Search box (like product management box) */}
      <div className="p-4 bg-white rounded-4 shadow-sm mb-4">
        <div className="d-md-flex justify-content-between d-flex-column ">
          <h4 className="fw-bold mb-4 main-color">
            Users Management
          </h4>

          <button
            className="col-12 col-md-2 col-lg-1 mb-4 mb-md-2 p-md-0 btn btn-success"
            onClick={() => {
              setNewUser({
                name: "",
                email: "",
                password: "",
                rePassword: "",
                age: "",
                role: "user",
              });
              setShowAddModal(true);
            }}
          >
            Add User
          </button>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 ">
          <input
            type="text"
            placeholder="Search by name, email or id"
            style={{ width: "300px", height: "2.3rem" }}
            className="form-control"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Form.Select
            style={{
              width: "200px",
              backgroundColor: "#FDFBF8",
              border: "1px solid #79253D",
              color: "#79253D",
            }}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as "All" | "admin" | "user");
              setCurrentPage(1);
            }}
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </Form.Select>

          <Form.Select
            style={{
              width: "200px",
              backgroundColor: "#FDFBF8",
              border: "1px solid #79253D",
              color: "#79253D",
            }}
            value={ageFilter}
            onChange={(e) => {
              setAgeFilter(e.target.value as "All" | "lt18" | "gte18");
              setCurrentPage(1);
            }}
          >
            <option value="All">All Ages</option>
            <option value="lt18">Under 18</option>
            <option value="gte18">18 and above</option>
          </Form.Select>

          <Button
            variant="outline-secondary"
            className="ms-auto col-12 col-md-2 col-lg-1 px-0"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Users table */}
    
       <div className="table-responsive mt-4 bg-white rounded-4 shadow-sm">
          <Table hover responsive className="align-middle rounded-4 table-hover mb-0">
    
              <tr className="rounded-4 bg-success text-white">
                <th className="p-3">User Info</th>
                <th className="p-3">Email</th>
                <th className="p-3">Age</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3 ps-5">Role</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
          
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td className="p-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#79253D",
                            fontSize: "1.3rem",
                          }}
                        >
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="mb-0">{u.name}</p>
                          <span className="text-muted">ID:{u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="ps-3">{u.email}</td>
                    <td className="ps-4">{u.age || "--"}</td>
                    <td className="ps-5">{u.ordersCount ?? 0}</td>
                    <td className="ps-4">${u.totalSpent ?? "0.00"}</td>
                    <td className="ps-2 ml-3 ">
                      <Badge
                        bg={u.role === "admin" ? "success" : "secondary"}
                        className="d-flex align-items-center gap-2 justify-content-center "
                      >
                        {u.role === "admin" ? (
                          <>
                            <i className="fa-solid fa-crown text-white" />
                            <span className="text-white ">Admin</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-user text-white" />
                            <span className="text-white ">User</span>
                          </>
                        )}
                      </Badge>
                    </td>

                    <td className="text-center">
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-emojiShow btn-sm me-2"
                          onClick={() => handleViewOrders(u.id)}
                        >
                          <i className="fa-solid fa-eye" />
                        </button>
                        <button
                          className="btn btn-emojiShow btn-sm me-2"
                          onClick={() => handleEditClick(u)}
                        >
                          <i className="fa-solid fa-pen-to-square" />
                        </button>
                        <button
                          className="btn btn-emojiDelete btn-sm"
                          onClick={() => handleDelete(u.id)}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
          </Table>
      </div>

      {/* Pagination bar (uses filteredUsers length) */}
      {filteredUsers.length > itemsPerPage && (
        <div className="pagination-bar d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            ‹ Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                className={`btn btn-sm ${
                  currentPage === pageNum ? "btn-success" : "btn-outline-secondary"
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={goToNextPage}
          >
            Next ›
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={editForm.name} onChange={handleEditFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={editForm.email} onChange={handleEditFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password (leave blank to keep current)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Re-enter Password</Form.Label>
              <Form.Control
                type="password"
                name="rePassword"
                value={editForm.rePassword}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control name="age" value={editForm.age} onChange={handleEditFormChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={editForm.role} onChange={handleEditFormChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal (rePassword included) */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                min={10}
                value={newUser.age}
                onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Re-enter Password</Form.Label>
              <Form.Control
                type="password"
                value={newUser.rePassword}
                onChange={(e) => setNewUser({ ...newUser, rePassword: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddUser}>
            Add User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Orders Modal */}
      <Modal show={showOrdersModal} onHide={() => setShowOrdersModal(false)} backdrop="static" keyboard={false} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Orders</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #ddd" }}>
            <h5 className="fw-bold mb-3">Customer Information</h5>
            {selectedOrders.length > 0 && (
              <div className="row g-3">
                <div className="col-md-6">
                  <strong>Name:</strong> {selectedOrders[0].userName}
                </div>
                <div className="col-md-6">
                  <strong>Email:</strong> {selectedOrders[0].email}
                </div>
                <div className="col-md-6">
                  <strong>Address:</strong> {selectedOrders[0].address}
                </div>
                <div className="col-md-6">
                  <strong>Phone:</strong> {selectedOrders[0].phone}
                </div>
              </div>
            )}
          </div>

          {selectedOrders.length === 0 ? (
            <p>No orders found for this user.</p>
          ) : (
            <Table hover responsive className="align-middle table-hover">
              <thead>
                <tr style={{ backgroundColor: "#79253D", color: "white" }}>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td>{o.id}</td>
                    <td>{o.userName}</td>
                    <td>{o.address}</td>
                    <td>{o.phone}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="fw-bold me-2">{o.items.length}x</span>
                        {o.items.map((item) => (
                          <img
                            key={item.id}
                            src={item.image}
                            alt={item.title}
                            title={`${item.title} (${item.quantity})`}
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "1px solid #ccc",
                            }}
                          />
                        ))}
                      </div>
                    </td>
                    <td>${o.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrdersModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersManagement;
