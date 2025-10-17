import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import '../../styles/orders.css'

export interface IOrder {
  id: string;
  userName: string;
  address: string;
  phone: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    price: number;
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

  // ✅ استخدم id بدل الإيميل
  const storedUser = localStorage.getItem("user");
  const currentUserID = storedUser ? JSON.parse(storedUser).id : null;

  const { data: allOrders, isLoading } = useQuery<IOrder[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axios.get("https://68e43ee28e116898997b5bf8.mockapi.io/orders");
      return res.data;
    },
  });

  // ✅ فلترة الطلبات حسب userID
  const userOrders = allOrders?.filter((o) => o.userID === currentUserID) || [];

const deleteMutation = useMutation({
  mutationFn: async (order: IOrder) => {
    // 1️⃣ امسح الـ order
    await axios.delete(`https://68e43ee28e116898997b5bf8.mockapi.io/orders/${order.id}`);
    
    // 2️⃣ ارجع الـ stock للمنتجات
  const restoreStockPromises = order.items.map(async (item) => {
  try {
    
    const { data: products } = await axios.get(
      "https://68e43ee28e116898997b5bf8.mockapi.io/product"
    );

    const matchedProduct = products.find(
      (p: any) => p.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );

    if (!matchedProduct) {
      console.warn(`⚠️ No matching product found for: ${item.title}`);
      return null;
    }

    const currentStock = Number(matchedProduct.stock) || 0;
    const returnedQty = Number(item.quantity) || 0;
    const newStock = currentStock + returnedQty;

    await axios.put(
      `https://68e43ee28e116898997b5bf8.mockapi.io/product/${matchedProduct.id}`,
      { ...matchedProduct, stock: newStock }
    );

    console.log(`✅ Returned ${returnedQty} to ${item.title}`);
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
    toast.success("Order deleted");
  },
  onError: () => {
    toast.error("Failed to delete order");
  },
});

  const handleDelete = (order: IOrder) => {
    toast((t) => (
      <div>
        <p className="mb-2">Are you sure you want to delete this order?</p>
        <div className="d-flex justify-content-between">
          <button
            className="btn btn-sm me-2 text-white rounded-0"
            style={{ backgroundColor: "#79253D" }}
            onClick={() => {
              toast.dismiss(t.id);
              deleteMutation.mutate(order);
            }}
          >
            Yes
          </button>
          <button
            className="btn btn-sm btn-secondary rounded-0"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
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
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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
      <Toaster position="top-center" />
      <h3 className="mb-4 text-center" style={{color:"#79253D"}}>Orders</h3>

      {/* 🔍 Search Input */}
      <div className="row justify-content-center">
        <div className="col-10 col-md-8 col-lg-6 ">
          <input
            type="text"
            placeholder="Search by name, phone, or status..."
            className="form-control  rounded-0 border-2"
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
        <div className="alert" style={{ backgroundColor: "#ec6e92ff" }}>
          No matching orders found.
        </div>
      ) : (
        <div className="table-responsive mt-5">
          <table className="table align-middle table-hover text-center">
            <tr className="text-center text-white" style={{ backgroundColor: "#79253D" }}>
              <th className="py-2">#</th>
              <th className="py-2">User Name</th>
              <th className="py-2">Address</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Items</th>
              <th className="py-2">Total</th>
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>

            {currentOrders?.map((o, index) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #79253D" }}>
                <td className="text-center fw-semibold">{startIndex +index + 1}</td>
                <td>{o.userName}</td>
                <td>{o.address}</td>
                <td>{o.phone}</td>
                <td>
                  <ul className="list-unstyled mb-0 small" style={{ backgroundColor: "transparent" }}>
                    {o.items?.map((i) => (
                      <li key={i.id} className="d-flex align-items-center justify-content-center mb-1">
                        {i.title} × {i.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>${parseFloat(o.totalPrice).toFixed(2)}</td>
                <td className="small text-muted">{new Date(o.createdAt).toLocaleString()}</td>
                <td>
                  <span className="badge text-white" style={{ backgroundColor: "#79253D" }}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex justify-content-center" style={{ backgroundColor: "transparent" }}>
                    <button className="btn btn-emojiShow btn-sm" onClick={() => navigate(`/orders/${o.id}`)}>
                      <i className="fa-solid fa-eye m-1" />
                    </button>
                    <button className="btn btn-emojiDelete btn-sm" onClick={() => handleDelete(o)}>
                      <i className="fa-solid fa-trash m-1" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </table>

          <div className="d-flex justify-content-center align-items-center mt-5">
            <button className="btn btn-sm btn-outline-secondary me-2" disabled={currentPage === 1} onClick={goToPreviousPage}>
              Previous
            </button>
            <span className="fw-bold">Page {currentPage} of {totalPages}</span>
            <button className="btn btn-sm btn-outline-success ms-2" disabled={currentPage === totalPages} onClick={goToNextPage}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
