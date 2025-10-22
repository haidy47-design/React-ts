import React, { useEffect, useState, ChangeEvent } from "react";
import { Modal, Button, Form, Table, Badge, Spinner } from "react-bootstrap";
import "../../styles/main.css";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  ["re-password"]?: string;
  role: string;
  age?: string;
  createdAt?: string;
  ordersCount?: number;
  totalSpent?: string;
}

interface Order {
  id: string;
  userID: string;
  totalPrice: string;
  address: string;
  phone: string;
  userName: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    discount: string;
    image: string;
  }[];
  email?: string;
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
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
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
    age: "",
    role: "user",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch("https://68e83849f2707e6128ca32fb.mockapi.io/users"),
          fetch("https://68e43ee28e116898997b5bf8.mockapi.io/orders"),
        ]);

        const usersData: User[] = await usersRes.json();
        const ordersData: Order[] = await ordersRes.json();

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

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement| HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

 
  const validateForm = (isEdit = false) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

    if (isEdit) {
      if (editForm.email && !emailRegex.test(editForm.email)) {
        alert("❌ Invalid email format!");
        return false;
      }
      if (editForm.password || editForm.rePassword) {
        if (!passRegex.test(editForm.password)) {
          alert("❌ Password must be at least 8 chars, include uppercase, lowercase, and number.");
          return false;
        }
        if (editForm.password !== editForm.rePassword) {
          alert("❌ Passwords do not match!");
          return false;
        }
      }
      if (editForm.age && (isNaN(Number(editForm.age)) || Number(editForm.age) < 10)) {
        alert("❌ Please enter a valid age (10+).");
        return false;
      }
      return true;
    }

    if (!emailRegex.test(editForm.email)) {
      alert("❌ Invalid email format!");
      return false;
    }
    if (!passRegex.test(editForm.password)) {
      alert("❌ Password must be at least 8 characters, include uppercase, lowercase, and a number.");
      return false;
    }
    if (editForm.password !== editForm.rePassword) {
      alert("❌ Passwords do not match!");
      return false;
    }
    if (!editForm.age || isNaN(Number(editForm.age)) || Number(editForm.age) < 10) {
      alert("❌ Please enter a valid age (10+).");
      return false;
    }
    return true;
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      rePassword: "",
      role: user.role,
      age: user.age || "",
    });
    setShowEditModal(true);
  };

  
  const handleSaveChanges = async () => {
    if (!selectedUser || !validateForm(true)) return;

    try {
      const updatedData = {
        name: editForm.name || selectedUser.name,
        email: editForm.email || selectedUser.email,
        password: editForm.password ? editForm.password : selectedUser.password,
        role: editForm.role || selectedUser.role,
        age: editForm.age || selectedUser.age || "",
      };

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
      alert("✅ User updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update user.");
    }
  };

  
  const handleAddUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password || !newUser.age) {
        alert("Please fill in all fields.");
        return;
      }

      
      if (isNaN(Number(newUser.age)) || Number(newUser.age) < 10) {
        alert("❌ Please enter a valid age (10+).");
        return;
      }

     
      const res = await fetch("https://68e83849f2707e6128ca32fb.mockapi.io/users");
      const existingUsers: User[] = await res.json();

      const emailExists = existingUsers.some(
        (user) => user.email.toLowerCase() === newUser.email.toLowerCase()
      );

      if (emailExists) {
        alert("⚠️ This email already exists. Please use another one.");
        return;
      }

    
      const addRes = await fetch("https://68e83849f2707e6128ca32fb.mockapi.io/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const created = await addRes.json();

      alert("✅ User added successfully!");
      setShowAddModal(false);

     
      setUsers((prev) => [...prev, { ...(created as any), ordersCount: 0, totalSpent: "0.00" }]);

      
      setNewUser({
        name: "",
        email: "",
        password: "",
        age: "",
        role: "user",
      });
    } catch (error) {
      console.error("Error adding user:", error);
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
      alert("🗑️ User deleted successfully!");
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

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> Loading...
      </div>
    );

  return (
    <div className="mt-5 users-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{color:"#79253D"}}>Users Management</h2>
        <Button
          style={{backgroundColor:"#79253D"}}
          onClick={() => {
            setNewUser({
              name: "",
              email: "",
              password: "",
              age: "",
              role: "user",
            });
            setShowAddModal(true);
          }}
        >
          <i className="fa-solid fa-plus me-2" />
          Add User
        </Button>
      </div>

    
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <Table hover responsive className="align-middle rounded-4 table-hover">
         
              <tr className="rounded-4" style={{ backgroundColor: "#79253D", color: "white" }}>
                <th className="p-3">User Info</th>
                <th className="p-3">Email</th>
                <th className="p-3">Age</th>
                <th className="p-3">Role</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
           
            <tbody>
              {users.map((u) => (
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
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="mb-0">{u.name}</p>
                        <span className="text-muted">ID:{u.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="ps-3">{u.email}</td>
                  <td className="ps-4">{u.age || "--"}</td>
                  <td className="ps-2 text-center ml-3 ">
                    <Badge
                      bg={u.role === "admin" ? "danger" : "primary"}
                      className="d-flex align-items-center gap-4"
                    >
                      {u.role === "admin" ? (
                        <>
                          <i className="fa-solid fa-crown" />
                          Admin
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-user" />
                          User
                        </>
                      )}
                    </Badge>
                  </td>

                  <td className="ps-5">{u.ordersCount ?? 0}</td>
                  <td className="ps-4">${u.totalSpent ?? "0.00"}</td>

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
              ))}
            </tbody>
          </Table>
        </div>
      </div>

    
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={editForm.name} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={editForm.email} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Re-enter Password</Form.Label>
              <Form.Control
                type="password"
                name="rePassword"
                value={editForm.rePassword}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={editForm.role} onChange={handleFormChange}>
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
              
                <tr style={{ backgroundColor: "#79253D", color: "white" }}>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                </tr>
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
      </Modal>
    </div>
  );
};

export default UsersManagement;
