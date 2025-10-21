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
          const { data: products } = await axios.get(
            "https://68e43ee28e116898997b5bf8.mockapi.io/product"
          );

          const matchedProduct = products.find(
            (p: any) =>
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
      const restoreStockPromises = updatedOrder.items.map(async (item: any) => {
        try {
          const { data: products } = await axios.get(
            "https://68e43ee28e116898997b5bf8.mockapi.io/product"
          );

          const matchedProduct = products.find(
            (p: any) =>
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
        Failed to load orders 😔
      </div>
    );

  return (
    <div>
      {/* 🔹 Filters Section */}
      <div className="p-4 bg-white rounded-4 shadow-sm mb-4 ">
        <div className="d-md-flex justify-content-between flex-column ">
          <h4 className="fw-bold mb-4" style={{ color: "#79253D" }}>
            Orders Management
          </h4>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 ">
          <input
            type="text"
            placeholder="Search by user, phone or item..."
            style={{ width: "250px", height: "2.3rem" }}
            className="mt-3 form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Form.Select
            style={{
              width: "200px",
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

          <Button
            variant="outline-secondary"
            className="ms-auto col-12 col-md-2 col-lg-1 px-0"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* 🔹 Table View */}
      <div className="table-responsive mt-4 bg-white rounded-4 shadow-sm">
        <table className="table align-middle table-hover text-center">
          <tr style={{ backgroundColor: "#79253D", color: "white" }}>
            <th className="p-3">Order Id</th>
            <th className="p-3">User</th>
            <th className="p-3">Address</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Items Per Order</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
            <th className="p-3">Actions</th>
          </tr>

          {currentOrders.map((order) => (
            <tr key={order.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{order.id}</td>
              <td>{order.userName}</td>
              <td>{order.address}</td>
              <td>{order.phone}</td>
              <td>{order.items.length}</td>
              <td>${parseFloat(order.totalPrice).toFixed(2)}</td>

              <td>
              {editingOrderId === order.id ? (
                 order.status === "Cancelled" ? (
                   <span
                     className="badge text-white w-75"
                     style={{
                       backgroundColor: getStatusBadgeColor(order.status),
                       opacity: 0.7,
                       cursor: "not-allowed",
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
                               className="badge text-white w-75"
                               style={{
                                 backgroundColor: getStatusBadgeColor(order.status),
                               }}
                             >
                               {order.status}
                             </span>
                           )}

              </td>

              <td>{new Date(order.createdAt).toLocaleDateString()}</td>

              <td>
                <div className="d-flex justify-content-center bg-transparent">
                  <button
                    className="btn btn-emojiShow btn-sm"
                    onClick={() => handleShowModal(order)}
                  >
                    <i className="fa-solid fa-eye m-1" />
                  </button>

                  {editingOrderId === order.id ? (
                    <>
                      <button
                        className="btn btn-success btn-sm mx-1"
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
                      <i className="fa-solid fa-pen-to-square m-1"></i>
                    </button>
                  )}

                  <button
                    className="btn btn-emojiDelete btn-sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(order)}
                  >
                    {deleteMutation.isPending ? (
                      <i className="fa-solid fa-spinner fa-spin m-1" />
                    ) : (
                      <i className="fa-solid fa-trash m-1" />
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

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" className="my-5">
        <Modal.Header closeButton style={{backgroundColor:"#fad7a5ff"}}>
          <Modal.Title  className="main-color">Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{backgroundColor:"#F4EFE8"}}>
          {selectedOrder ? (
            <>
              
              
                <div className="row">
                  <div className="col-4">
                    <p><strong>UserName:</strong> {selectedOrder.userName}</p>
                  </div>
                  <div className="col-5">
                      <p><strong>Email:</strong> {selectedOrder.email}</p>
                  </div>
                  <div className="col-3">
                      <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                  </div>
                  
                </div>
              <div className="row">
                  <div className="col-4">
                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                  </div>
                    <div className="col-5">
                    <p><strong>Address:</strong> {selectedOrder.address}</p>
                  </div>
                  <div className="col-3">
                    <p><strong>Total:</strong> ${parseFloat(selectedOrder.totalPrice).toFixed(2)}</p>
                  </div>
              </div>
                  

              <h5 className="mt-3 mb-2 fw-bold main-color">Items:</h5>
              <ListGroup>
                {selectedOrder.items.map((item, idx) => (
                  <ListGroup.Item key={idx} className="d-flex justify-content-between p-3 align-items-center" style={{backgroundColor:"#F4EFE8"}}>
                  <div className="d-flex align-items-center">
                      <img src={item.image} className="rounded-3" alt="" style={{width:"100px",height:"100px"}} />
                      <div className="d-flex flex-column ms-3">
                        <span>{item.title}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                  </div>
                <p className="mb-0 fw-bold">${(item.discount * item.quantity).toFixed(2)}</p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : (
            <p>No data available</p>
          )}
        </Modal.Body>
        <Modal.Footer style={{backgroundColor:"#F4EFE8"}}>
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
    </div>
  );
};

export default Orders;
