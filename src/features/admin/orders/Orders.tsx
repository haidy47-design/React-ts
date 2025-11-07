import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, Form, Button, Modal, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../components/common/CustomSwal";
import { IOrder } from "src/features/order/OrdersPage";
import { fetchOrders } from "../api";
import HelmetWrapper from "../../../components/common/HelmetWrapper";
import { Product } from "src/components/product/ProductCard";

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<IOrder[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: async (order: IOrder) => {
      await axios.delete(
        `https://68e43ee28e116898997b5bf8.mockapi.io/orders/${order.id}`
      );

      const restoreStockPromises = order.items.map(async (item) => {
        try {
          const { data: products } = await axios.get<Product[]>(
            "https://68e43ee28e116898997b5bf8.mockapi.io/product"
          );

          const matchedProduct = products.find(
            (p: Product) =>
              p.title.trim().toLowerCase() === item.title.trim().toLowerCase()
          );

          if (!matchedProduct) return null;

          const newStock =
            (Number(matchedProduct.stock) || 0) + Number(item.quantity);
          await axios.put(
            `https://68e43ee28e116898997b5bf8.mockapi.io/product/${matchedProduct.id}`,
            { ...matchedProduct, stock: newStock }
          );
        } catch (err) {
          console.error(`Error restoring stock for ${item.title}`, err);
        }
      });

      await Promise.all(restoreStockPromises);
    },
    onSuccess: (_, order) => {
      queryClient.setQueryData<IOrder[]>(["orders"], (old) =>
        old?.filter((o) => o.id !== order.id)
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccessAlert("Order deleted successfully!");
    },
    onError: () => showErrorAlert("Failed to delete order!"),
  });

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editedStatus, setEditedStatus] = useState<string>("");

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: updatedOrder } = await axios.put(
        `https://68e43ee28e116898997b5bf8.mockapi.io/orders/${id}`,
        { status }
      );

      if (status === "Cancelled") {
        const restoreStockPromises = updatedOrder.items.map( async (item: { title: string; image: string; quantity: number; discount: number }) => {
          try {
            const { data: products } = await axios.get(
              "https://68e43ee28e116898997b5bf8.mockapi.io/product"
            );

            const matchedProduct = products.find(
              (p: Product) =>
                p.title.trim().toLowerCase() === item.title.trim().toLowerCase()
            );

            if (!matchedProduct) return null;

            const newStock =
              (Number(matchedProduct.stock) || 0) + Number(item.quantity);

            await axios.put(
              `https://68e43ee28e116898997b5bf8.mockapi.io/product/${matchedProduct.id}`,
              { ...matchedProduct, stock: newStock }
            );
          } catch (err) {
            console.error(`Error restoring stock for ${item.title}`, err);
          }
        });

        await Promise.all(restoreStockPromises);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<IOrder[]>(["orders"], (old) =>
        old?.map((o) =>
          o.id === variables.id ? { ...o, status: variables.status } : o
        )
      );
      showSuccessAlert("Order status updated!");
      setEditingOrderId(null);
    },
    onError: () => showErrorAlert("Failed to update order status!"),
  });

  const handleSave = (order: IOrder) => {
    if (editedStatus !== order.status) {
      updateMutation.mutate({ id: order.id, status: editedStatus });
    } else {
      setEditingOrderId(null);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const orders = useMemo(() => data ?? [], [data]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((i) =>
          i.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDelete = async (order: IOrder) => {
    const confirmed = await showConfirmAlert(
      "Are you sure you want to delete this order?"
    );
    if (confirmed) deleteMutation.mutate(order);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#FFC107";
      case "Cancelled":
        return "#DC3545";
      case "Proccessing":
        return "#0D6EFD";
      case "Shipped":
        return "#24A167";
      case "Delivered":
        return "#79253D";
      default:
        return "#79253D";
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const handleShowModal = (order: IOrder) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  if (isLoading)
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" />
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-danger mt-4">
        Failed to load orders <span className="text-danger">X</span>
      </div>
    );

  return (
    <>
      <HelmetWrapper title="Orders" />
      
  
      <div className="p-3 p-md-4 bg-white rounded-4 shadow-sm mb-4">
        <div className="mb-3">
          <h3 className="fw-bold mb-2" style={{ color: "#79253D" }}>
            Orders Management
          </h3>
          <p className="text-muted mb-0">Total Orders: {orders.length}</p>
        </div>

        <div className="row g-2 g-md-3 align-items-end">
          <div className="col-12 col-md-4 col-lg-4">
            <input
              type="text"
              placeholder="Search by user, phone or item..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <Form.Select
              style={{
                backgroundColor: "#FDFBF8",
                border: "1px solid #79253D",
                color: "#79253D",
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Proccessing">Proccessing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </Form.Select>
          </div>

          <div className="col-12 col-md-4 col-lg-5 text-end ">
            <Button
              variant="outline-secondary"
              className="col-12 col-md-12 col-lg-3"
              onClick={handleReset}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

    
      <div className="d-none d-lg-block">
        <div className="table-responsive bg-white rounded-4 shadow-sm">
          <table className="table align-middle table-hover text-center mb-0">
          
              <tr className="bg-success text-white">
                <th className="p-3">Order Id</th>
                <th className="p-3">User</th>
                <th className="p-3">Address</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
          
          
              {currentOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{order.id}</td>
                  <td>{order.userName}</td>
                  <td className="text-truncate" style={{ maxWidth: "150px" }}>
                    {order.address}
                  </td>
                  <td>{order.phone}</td>
                  <td>{order.items.length}</td>
                  <td>${parseFloat(order.totalPrice).toFixed(2)}</td>
                  <td>
                    {editingOrderId === order.id ? (
                      order.status === "Cancelled" ? (
                        <span
                          className="badge text-white"
                          style={{
                            backgroundColor: getStatusBadgeColor(order.status),
                            opacity: 0.7,
                            cursor: "not-allowed",
                            minWidth: "100px",
                          }}
                        >
                          {order.status}
                        </span>
                      ) : (
                        <Form.Select
                          size="sm"
                          value={editedStatus}
                          onChange={(e) => setEditedStatus(e.target.value)}
                          style={{
                            border: "1px solid #79253D",
                            color: "#79253D",
                            fontWeight: "500",
                            minWidth: "120px",
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Proccessing">Proccessing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </Form.Select>
                      )
                    ) : (
                      <span
                        className="badge text-white"
                        style={{
                          backgroundColor: getStatusBadgeColor(order.status),
                          minWidth: "100px",
                        }}
                      >
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      <button
                        className="btn btn-emojiShow btn-sm"
                        onClick={() => handleShowModal(order)}
                      >
                        <i className="fa-solid fa-eye" />
                      </button>

                      {editingOrderId === order.id ? (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSave(order)}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <i className="fa-solid fa-spinner fa-spin" />
                            ) : (
                              <i className="fa-solid fa-check" />
                            )}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingOrderId(null)}
                          >
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-emojiShow btn-sm"
                          onClick={() => {
                            setEditingOrderId(order.id);
                            setEditedStatus(order.status);
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      )}

                      <button
                        className="btn btn-emojiDelete btn-sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(order)}
                      >
                        {deleteMutation.isPending ? (
                          <i className="fa-solid fa-spinner fa-spin" />
                        ) : (
                          <i className="fa-solid fa-trash" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            
          </table>

          {!currentOrders.length && (
            <div className="text-center text-muted py-5">No orders found</div>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-lg-none">
        {currentOrders.map((order) => (
          <div key={order.id} className="card mb-3 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="mb-1 fw-bold">Order #{order.id}</h6>
                  <small className="text-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </div>
                {editingOrderId === order.id ? (
                  order.status === "Cancelled" ? (
                    <span
                      className="badge text-white"
                      style={{
                        backgroundColor: getStatusBadgeColor(order.status),
                        opacity: 0.7,
                      }}
                    >
                      {order.status}
                    </span>
                  ) : (
                    <Form.Select
                      size="sm"
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                      style={{
                        border: "1px solid #79253D",
                        color: "#79253D",
                        fontWeight: "500",
                        width: "auto",
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Proccessing">Proccessing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </Form.Select>
                  )
                ) : (
                  <span
                    className="badge text-white"
                    style={{
                      backgroundColor: getStatusBadgeColor(order.status),
                    }}
                  >
                    {order.status}
                  </span>
                )}
              </div>

              <div className="mb-2">
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted">User:</small>
                    <div className="fw-semibold">{order.userName}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Phone:</small>
                    <div className="fw-semibold">{order.phone}</div>
                  </div>
                  <div className="col-12">
                    <small className="text-muted">Address:</small>
                    <div className="fw-semibold text-truncate">{order.address}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Items:</small>
                    <div className="fw-semibold">{order.items.length}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Total:</small>
                    <div className="fw-bold text-success">
                      ${parseFloat(order.totalPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3 ">
                <button
                  className="btn btn-emojiShow btn-sm col-4 "
                  onClick={() => handleShowModal(order)}
                >
                  <i className="fa-solid fa-eye me-1" />
                  View
                </button>

                {editingOrderId === order.id ? (
                  <>
                    <button
                      className="btn btn-success btn-sm  "
                      onClick={() => handleSave(order)}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <>
                          <i className="fa-solid fa-check me-1" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingOrderId(null)}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-emojiShow btn-sm col-4 "
                    onClick={() => {
                      setEditingOrderId(order.id);
                      setEditedStatus(order.status);
                    }}
                  >
                    <i className="fa-solid fa-pen-to-square me-1"></i>
                    Edit
                  </button>
                )}
                <button
                  className="btn btn-emojiDelete btn-sm col-4"
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(order)}
                >
                  {deleteMutation.isPending ? (
                    <i className="fa-solid fa-spinner fa-spin" />
                  ) : (
                    <i className="fa-solid fa-trash" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {!currentOrders.length && (
          <div className="text-center text-muted py-5 bg-white rounded-4">
            No orders found
          </div>
        )}
      </div>


      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" className="py-5 mt-2">
        <Modal.Header closeButton style={{ backgroundColor: "#fad7a5ff" }}>
          <Modal.Title className="main-color">Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#F4EFE8" }}>
          {selectedOrder ? (
            <>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <strong>UserName:</strong>
                  <p className="mb-0">{selectedOrder.userName}</p>
                </div>
                <div className="col-12 col-md-5">
                  <strong>Email:</strong>
                  <p className="mb-0 text-break">{selectedOrder.email}</p>
                </div>
                <div className="col-12 col-md-3">
                  <strong>Phone:</strong>
                  <p className="mb-0">{selectedOrder.phone}</p>
                </div>
              </div>

              <div className="row g-3 mt-2">
                <div className="col-12 col-md-4">
                  <strong>Status:</strong>
                  <p className="mb-0">{selectedOrder.status}</p>
                </div>
                <div className="col-12 col-md-5">
                  <strong>Address:</strong>
                  <p className="mb-0">{selectedOrder.address}</p>
                </div>
                <div className="col-12 col-md-3">
                  <strong>Total:</strong>
                  <p className="mb-0 fw-bold text-success">
                    ${parseFloat(selectedOrder.totalPrice).toFixed(2)}
                  </p>
                </div>
              </div>

              <h5 className="mt-4 mb-3 fw-bold main-color">Items:</h5>
              <ListGroup>
                {selectedOrder.items.map((item, idx) => (
                  <ListGroup.Item
                    key={idx}
                    className="p-3"
                    style={{ backgroundColor: "#F4EFE8" }}
                  >
                    <div className="d-flex flex-md-row justify-content-between align-items-center align-items-md-center gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={item.image}
                          className="rounded-3"
                          alt={item.title}
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                        />
                        <div>
                          <div className="fw-semibold">{item.title}</div>
                          <small className="text-muted">Qty: {item.quantity}</small>
                        </div>
                      </div>
                      <div>
                        <p className="mb-0 fw-bold">
                          ${(item.discount * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : (
            <p>No data available</p>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#F4EFE8" }}>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🔹 Pagination */}
      {filteredOrders.length > itemsPerPage && (
        <div className="pagination-bar d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ‹ Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                className={`btn btn-sm ${
                  currentPage === pageNum
                    ? "btn-success"
                    : "btn-outline-secondary"
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
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ›
          </button>
        </div>
      )}
    </>
  );
};

export default Orders;
