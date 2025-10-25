import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Badge, Spinner, Alert } from "react-bootstrap";
import axiosInstance from "../../../app/axiosInstance";
import { IOrder } from "../../../features/order/OrdersPage";
import { z } from "zod";
import { ChangeEvent } from 'react';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "../../../components/common/CustomSwal";


const OrderItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string().optional(),
  quantity: z.number().or(z.string().transform((s) => Number(s))).optional(),
});

const OrderSchema = z.object({
  id: z.string(),
  userID: z.string().optional(),
  userName: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  items: z.array(OrderItemSchema).optional().default([]),
  totalPrice: z.union([z.string(), z.number()]).optional().default("0.00"),
});

const OrdersArraySchema = z.array(OrderSchema);

const UserSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  "re-password": z.string().optional(),
  age: z.number(),
  role: z.string(),
  blocked: z.boolean().optional().default(false),
});

export const UsersArraySchema = z.array(UserSchema);


const EditUserFormSchema = z.object({
  
  name: z.string()
    .nullable()
    .transform(e => (e === "" ? undefined : e))
    .pipe(z.string().min(2, "Name must be at least 2 characters").optional()),
    
  
  email: z.string()
    .nullable()
    .transform(e => (e === "" ? undefined : e))
    .pipe(z.string().email("Invalid email format").optional()),
    
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .optional()
    .or(z.literal("")),
    
  rePassword: z.string().optional().or(z.literal("")),
  
  role: z.enum(["user", "admin"]),
  
  
  age: z.string()
    .nullable()
    .transform(val => (val === "" ? undefined : val))
    .pipe(
        z.union([
            z.literal(undefined),
            z.string()
              .refine(val => !isNaN(Number(val)), { message: "Age must be a valid number" }) // إضافة فحص NaN
              .transform((val) => Number(val))
              .pipe(z.number().min(10, "Age must be at least 10"))
        ])
    ),
    
})
.refine((data) => {

  if (data.password === "") {
    return data.rePassword === "";
  }
  
  return data.password === data.rePassword;
}, {
  message: "Passwords do not match",
  path: ["rePassword"],
}); 

const NewUserFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  rePassword: z.string(),
  role: z.enum(["user", "admin"]),
  age: z.string()
    .transform((val) => Number(val))
    .pipe(z.number().min(10, "Age must be at least 10")),
}).refine((data) => data.password === data.rePassword, {
  message: "Passwords do not match",
  path: ["rePassword"],
});


type ZodUser = z.infer<typeof UserSchema>;

interface AdminUser extends ZodUser {
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

interface FormErrors {
  [key: string]: string | undefined; 
}




const USERS_URL = "https://68e83849f2707e6128ca32fb.mockapi.io/users";
const ORDERS_URL = "https://68e43ee28e116898997b5bf8.mockapi.io/orders";

export const fetchUsers = async (): Promise<AdminUser[]> => {
  const { data } = await axiosInstance.get<AdminUser[]>(USERS_URL);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${USERS_URL}/${id}`);
};

export const toggleBlockUser = async (
  id: string,
  blocked: boolean
): Promise<AdminUser> => {
  const { data } = await axiosInstance.put<AdminUser>(`${USERS_URL}/${id}`, {
    blocked,
  });
  return data;
};

export const updateUser = async (
  id: string,
  userData: Partial<AdminUser>
): Promise<AdminUser> => {
  const { data } = await axiosInstance.put<AdminUser>(
    `${USERS_URL}/${id}`,
    userData
  );
  return data;
};

export const createUser = async (
  userData: Partial<AdminUser>
): Promise<AdminUser> => {
  const { data } = await axiosInstance.post<AdminUser>(USERS_URL, userData);
  return data;
};


const UsersManagement: React.FC = () => {
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
 


  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<IOrder[]>([]);

 
  const [editFormErrors, setEditFormErrors] = useState<FormErrors>({});
  const [newUserErrors, setNewUserErrors] = useState<FormErrors>({});

 
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

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "admin" | "user">("All");
  const [ageFilter, setAgeFilter] = useState<"All" | "lt18" | "gte18">("All");




  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersData, ordersRes] = await Promise.all([
          fetchUsers(),
          axiosInstance.get(ORDERS_URL),
        ]);

        const ordersParse = OrdersArraySchema.safeParse(ordersRes.data);
        if (!ordersParse.success) {
          console.warn("⚠️ Orders validation failed:", ordersParse.error.format());
        }
        const ordersData: IOrder[] = ordersParse.success
          ? (ordersParse.data as unknown as IOrder[])
          : [];

        const enrichedUsers = usersData.map((user) => {
          const userOrders = ordersData.filter((o) => (o as any).userID === user.id);
          const totalSpent = userOrders.reduce(
            (sum, o) => sum + parseFloat((o as any).totalPrice ?? "0"),
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
      } catch (err: any) {
        console.error(" Error fetching data:", err);
        setError(err.response?.data?.message || err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
  const normalize = (s?: string) => (s || "").toLowerCase();

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const matchesTerm =
        (u.id && u.id.toLowerCase().includes(term)) ||
        normalize(u.name).includes(term) ||
        normalize(u.email).includes(term);
      if (!matchesTerm) return false;
    }

    if (roleFilter !== "All" && u.role !== roleFilter) return false;

    if (ageFilter !== "All") {
      const ageNum = u.age ? Number(u.age) : NaN;
      if (ageFilter === "lt18" && !(ageNum && ageNum < 18)) return false;
      if (ageFilter === "gte18" && !(ageNum && ageNum >= 18)) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [filteredUsers.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  
  const handleEditFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNewUserChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    
    if (newUserErrors[name]) {
      setNewUserErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleEditClick = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      rePassword: "",
      role: user.role,
      age: user.age.toString(),
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

const handleSaveChanges = async () => {
    if (!selectedUser) return;
    
    
    const result = EditUserFormSchema.safeParse(editForm);
    
    
    if (!result.success) {
      const errors: FormErrors = {};
      
      result.error.issues.forEach((err) => { 
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      
      setEditFormErrors(errors);
      showErrorAlert("Please fix the validation errors");
      return; 
    }
    
 
    const validatedData = result.data; 
    
   
    const updatedData: any = {}; 

    
    
    
    if (validatedData.name !== undefined && validatedData.name !== selectedUser.name) {
        updatedData.name = validatedData.name;
    }
    
    
    if (validatedData.email !== undefined && validatedData.email !== selectedUser.email) {
        updatedData.email = validatedData.email;
    }
    
   
    if (validatedData.age !== undefined && validatedData.age !== selectedUser.age) {
        updatedData.age = validatedData.age;
    }
    
   
    if (validatedData.role !== selectedUser.role) {
        updatedData.role = validatedData.role;
    }

    
    const newPassword = validatedData.password;
    if (newPassword && newPassword.length > 0) {
        updatedData.password = newPassword;
       
        updatedData['re-password'] = validatedData.rePassword; 
    }

   
    if (Object.keys(updatedData).length === 0) {
      setShowEditModal(false);
      showErrorAlert("No changes were made.");
      return;
    }
    
    
    try {
     
      const updated = await updateUser(selectedUser.id, updatedData);
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
      );
      
      
      setEditForm(prev => ({ 
          ...prev, 
          password: "", 
          rePassword: "" 
      }));

      setShowEditModal(false);
      setEditFormErrors({}); 
      showSuccessAlert("User updated successfully!");
    } catch (err: any) {
      console.error(err);
      showErrorAlert( `Failed to update user: ${err.message}`);
    }
  };
 const handleAddUser = async () => {
    const result = NewUserFormSchema.safeParse(newUser);
    
    if (!result.success) {
      const errors: FormErrors = {};
      
      result.error.issues.forEach((err) => { 
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      
      setNewUserErrors(errors);
      showErrorAlert("Please fix the validation errors");
      return;
    }

    try {
      const existingUsers = await fetchUsers();
      const emailExists = existingUsers.some(
        (u) => u.email && u.email.toLowerCase() === newUser.email.toLowerCase()
      );

      if (emailExists) {
        setNewUserErrors({ email: "This email already exists" });
        showErrorAlert("This email already exists. Please use another one.");
        return;
      }

      
      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        age: Number(newUser.age),
        're-password': newUser.rePassword, 
      };

      const created = await createUser(payload as any);

      setUsers((prev) => [
        ...prev,
        { ...created, ordersCount: 0, totalSpent: "0.00" },
      ]);
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        rePassword: "",
        age: "",
        role: "user",
      });
      setNewUserErrors({});

      const afterFiltered = [...filteredUsers, created];
      const newTotalPages = Math.max(1, Math.ceil(afterFiltered.length / itemsPerPage));
      setCurrentPage(newTotalPages);
      
      showSuccessAlert("User added successfully!");
    } catch (err: any) {
      console.error("Error adding user:", err);
      
      showErrorAlert(`Failed to add user: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
  try {
   
    const confirmed = await showConfirmAlert("Are you sure you want to delete this user?");

    
    if (!confirmed) {
      console.log("Deletion cancelled by user.");
      return;
    }

    
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showSuccessAlert("User deleted successfully!");

  } catch (err: any) {
    console.error(err);
  
    const errorMessage = err.message || 'An unknown error occurred.';
    showErrorAlert(`Failed to delete user: ${errorMessage}`);
  }
};
 

  const handleViewOrders = (userId: string) => {
    const userOrders = orders.filter((o) => (o as any).userID === userId);
    setSelectedOrders(userOrders);
    setShowOrdersModal(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setAgeFilter("All");
    setCurrentPage(1);
  };

  
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> Loading users...
      </div>
    );
  }

  return (
    <div className="users-container">
      
      

      
      <div className="p-4 bg-white rounded-4 shadow-sm mb-4">
        <div className="d-md-flex justify-content-between d-flex-column">
          <h4 className="fw-bold mb-4 main-color">Users Management</h4>
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
              setNewUserErrors({});
              setShowAddModal(true);
            }}
          >
            Add User
          </button>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3">
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
         
          <tbody>
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
                  <td className="ps-2 ml-3">
                    <Badge
                      bg={u.role === "admin" ? "success" : "secondary"}
                      className="d-flex align-items-center gap-2 justify-content-center"
                    >
                      {u.role === "admin" ? (
                        <>
                          <i className="fa-solid fa-crown text-white" />
                          <span className="text-white">Admin</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-user text-white" />
                          <span className="text-white">User</span>
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
          </tbody>
        </Table>
      </div>

      
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

   
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={editForm.name}
                onChange={handleEditFormChange}
                isInvalid={!!editFormErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {editFormErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                isInvalid={!!editFormErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {editFormErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password (leave blank to keep current)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleEditFormChange}
                isInvalid={!!editFormErrors.password}
              />
              <Form.Control.Feedback type="invalid">
                {editFormErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Re-enter Password</Form.Label>
              <Form.Control
                type="password"
                name="rePassword"
                value={editForm.rePassword}
                onChange={handleEditFormChange}
                isInvalid={!!editFormErrors.rePassword}
              />
              <Form.Control.Feedback type="invalid">
                {editFormErrors.rePassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                name="age"
                value={editForm.age}
                onChange={handleEditFormChange}
                isInvalid={!!editFormErrors.age}
              />
              <Form.Control.Feedback type="invalid">
                {editFormErrors.age}
              </Form.Control.Feedback>
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
          <Button variant="primary" onClick={()=>handleSaveChanges()}>
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
                onChange={handleNewUserChange}
                isInvalid={!!newUserErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {newUserErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                isInvalid={!!newUserErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {newUserErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                min={10}
                value={newUser.age}
                onChange={handleNewUserChange}
                isInvalid={!!newUserErrors.age}
              />
              <Form.Control.Feedback type="invalid">
                {newUserErrors.age}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                isInvalid={!!newUserErrors.password}
              />
              <Form.Control.Feedback type="invalid">
                {newUserErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Re-enter Password</Form.Label>
              <Form.Control
                type="password"
                name="rePassword"
                value={newUser.rePassword}
                onChange={handleNewUserChange}
                isInvalid={!!newUserErrors.rePassword}
              />
              <Form.Control.Feedback type="invalid">
                {newUserErrors.rePassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={newUser.role}
                onChange={handleNewUserChange}
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
                            key={(item as any).id}
                            src={(item as any).image}
                            alt={(item as any).title}
                            title={`${(item as any).title} (${(item as any).quantity})`}
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