import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IOrder } from "./OrdersPage";

export default function OrderDetails(): React.ReactElement {
  const { id } = useParams<{ id: string }>();

  const {data: order, isLoading, isError} = useQuery<IOrder>({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await axios.get(
        `https://68e43ee28e116898997b5bf8.mockapi.io/orders/${id}`
      );
      return res.data;
    },
    enabled: !!id,
  });
console.log(order?.items)
  if (isLoading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-secondary" role="status"></div>
        <p className="mt-3">Loading order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container py-4 text-center">
        <div className="alert alert-danger">Failed to load order details.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center" style={{ color: "#79253D" }}>
        Order Details
      </h3>
       <div className="d-flex justify-content-end">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <NavLink to="/orders" className="text-decoration-none  text-secondary" >
              Orders
            </NavLink>
          </li>
          <p className="breadcrumb-item" aria-current="page" style={{color:"#79253D"}}>
            Order Details
          </p>
        </ol>
      </nav>
    </div>

      
      <div className="pb-3" style={{borderBottom:"1px solid gray"}}>
        <div className="card-body">
          <h4 className="mb-3" style={{ color: "#79253D" }}>Customer Info</h4>
          <p><strong>Name: </strong> {order.userName}</p>
          <p><strong>Address: </strong> {order.address}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="badge text-white ms-2" style={{ backgroundColor: "#79253D" }}>
              {order.status}
            </span>
          </p>
          <p><strong>Total Price:</strong> ${parseFloat(order.totalPrice).toFixed(2)}</p>
          <p><strong>Orderd At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Items Section */}
      
      <div className="row g-4 mt-2 ">
        <h4 className="mb-1 text-center text-md-start text-lg-start" style={{ color: "#79253D" }}>Order Items</h4>

        {order.items.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-lg-4 mb-2 ">
            <div>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    height: "400px",
                    objectFit: "cover",
                  }}
                  className="col-12"
                />
              <div className="mt-3 text-center">
                <h6 className="fw-bold mb-2" style={{ color: "#79253D" }}>
                  {item.title}
                </h6>

                <p className="mb-1">
                  <i className="fa-solid fa-layer-group me-2 text-muted"></i>
                  <strong>Quantity:</strong> {item.quantity}
                </p>

                {item.price && (
                  <p className="mb-1">
                    <i className="fa-solid fa-dollar-sign me-2 text-muted"></i>
                    <strong>Price:</strong> ${item.price}
                  </p>
                )}

                {item.category && (
                  <p className="mb-1">
                    <i className="fa-solid fa-tag me-2 text-muted"></i>
                    <strong>Category:</strong> {item.category}
                  </p>
                )}  
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
