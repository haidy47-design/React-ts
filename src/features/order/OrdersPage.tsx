import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/orders.css";
import {
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../components/common/CustomSwal";
import HelmetWrapper from "../../components/common/HelmetWrapper";

export interface IOrder {
  id: string;
  userName: string;
  email: string;
  address: string;
  phone: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    discount: number;
    category: string;
    image: string;
  }[];
  totalPrice: string;
  createdAt: string;
  status: string;
  userID: string;
}

export default function OrdersPage(): React.ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const storedUser = localStorage.getItem("user");
  const currentUserID = storedUser ? JSON.parse(storedUser).id : null;

  const { data: allOrders, isLoading } = useQuery<IOrder[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axios.get(
        "https://68e43ee28e116898997b5bf8.mockapi.io/orders"
      );
      return res.data;
    },
  });


  const userOrders = allOrders?.filter((o) => o.userID === currentUserID) || [];

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
            (Number(matchedProduct.stock) || 0) + (Number(item.quantity) || 0);

          await axios.put(
            `https://68e43ee28e116898997b5bf8.mockapi.io/product/${matchedProduct.id}`,
            { ...matchedProduct, stock: newStock }
          );

          
        } catch (error) {
          console.error(`Error restoring stock for ${item.title}`, error);
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
    onError: () => showErrorAlert("Failed to delete order. Please try again."),
  });

  const handleDelete = async (order: IOrder) => {
    const confirmed = await showConfirmAlert(
      "This will delete the order and restore stock."
    );
    if (confirmed) deleteMutation.mutate(order);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = userOrders.filter(
    (o) =>
      o.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some((i) =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        return "#6C757D";
    }
  };

  if (isLoading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-secondary" role="status"></div>
        <p className="mt-3">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
        <HelmetWrapper title="Orders" />
      <h3 className="mb-4 text-center" style={{ color: "#79253D" }}>
        Orders
      </h3>

      {/* 🔍 Search Input */}
      <div className="row justify-content-center">
        <div className="col-10 col-md-8 col-lg-6 ">
          <input
            type="text"
            placeholder="Search by name, phone, or product..."
            className="form-control rounded-0 border-2"
            style={{ borderColor: "#79253D" }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {!filteredOrders || filteredOrders.length === 0 ? (
        <div className="alert mt-4" style={{ backgroundColor: "#ec6e92ff" }}>
          No matching orders found.
        </div>
      ) : (
        <div
          className="mt-5"
          style={{
            overflow: "visible",
            maxWidth: "100%",
          }}
        >
          <table className="table align-middle table-hover text-center">
            <tr className="text-center text-white" style={{ backgroundColor: "#79253D" }}>
              <th className="py-2">#</th>
              <th className="py-2">User Name</th>
              <th className="py-2">Address</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Items Per Order</th>
              <th className="py-2">Total</th>
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>

            {currentOrders?.map((o, index) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #79253D" }}>
                <td className="text-center fw-semibold">
                  {startIndex + index + 1}
                </td>
                <td>{o.userName}</td>
                <td>{o.address}</td>
                <td>{o.phone}</td>
                <td>{o.items.length}</td>
                <td>${parseFloat(o.totalPrice).toFixed(2)}</td>
                <td className="small text-muted">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td>
                  <span
                    className="badge text-white w-75"
                    style={{
                      backgroundColor: getStatusBadgeColor(o.status),
                    }}
                  >
                    {o.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex justify-content-center bg-transparent">
                    <button
                      className="btn btn-emojiShow btn-sm"
                      onClick={() => navigate(`/orders/${o.id}`)}
                    >
                      <i className="fa-solid fa-eye m-1" />
                    </button>
                    <button
                      className="btn btn-emojiDelete btn-sm"
                      onClick={() => handleDelete(o)}
                    >
                      <i className="fa-solid fa-trash m-1" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </table>

          {/* ✅ Pagination */}
          {filteredOrders.length > itemsPerPage && (
            <div className="pagination-bar d-flex justify-content-center align-items-center mt-5 gap-2 flex-wrap">
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
      )}
    </div>
  );
}
