import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IOrder } from "./OrdersPage";
import { useDispatch } from "react-redux";
import { AppDispatch } from "src/app/store";
import { addToCart } from "../product/cartSlice";
import Swal from "sweetalert2";

export default function OrderDetails(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>();
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




   async function fetchProductByTitle(title: string) {
    const res = await axios.get(
      "https://68e43ee28e116898997b5bf8.mockapi.io/product"
    );
    const allProducts = res.data;
    return allProducts.find(
      (p: any) => p.title.toLowerCase() === title.toLowerCase()
    );
  }


  const handleReOrder = async () => {
    if (!order) return;

    Swal.fire({
      title: "Reorder Confirmation",
      text: "Do you want to reorder all items from this order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#79253D",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, reorder",
    }).then(async (result) => {
      if (result.isConfirmed) {
        let addedCount = 0;

        for (const item of order.items) {
          try {
            const productData = await fetchProductByTitle(item.title);
            if (!productData) {
              console.warn("Product not found:", item.title);
              continue;
            }

          
            if (productData.stock <= 0) {
              Swal.fire({
                icon: "warning",
                title: "Out of stock ❌",
                text: `${item.title} is currently out of stock.`,
                confirmButtonColor: "#79253D",
              });
              continue;
            }

          
            await dispatch(
              addToCart({
                ...productData,
                quantity: item.quantity,
              })
            );
            addedCount++;
          } catch (error) {
            console.error("Error reordering item:", error);
          }
        }

        if (addedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Order re-added to cart",
            text: `${addedCount} item(s) were successfully added to your cart.`,
            confirmButtonColor: "#79253D",
          });
        }
      }
    });
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
       <div className="d-flex justify-content-end ">
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
     <div className="d-flex justify-content-end ">
      <button className="btn btn-outline-success rounded-0 " onClick={handleReOrder}>reOrder</button>
     </div>
      
      <div className="pb-3" style={{borderBottom:"1px solid gray"}}>
        <div className="card-body">
          <h4 className="mb-3" style={{ color: "#79253D" }}>Customer Info</h4>
          <div className="row">
            <div className="col-12 col-md-4 col-lg-3">
              <p><strong>Name: </strong> {order.userName}</p>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <p><strong>Email: </strong> {order.email}</p>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <p><strong>Address: </strong> {order.address}</p>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
                <p><strong>Phone:</strong> {order.phone}</p>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-4 col-lg-3">
              <p>
                <strong>Status:</strong>{" "}
                <span className="badge text-white ms-2" style={{ backgroundColor:  getStatusBadgeColor(order.status) }}>
                  {order.status}
                </span>
              </p>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <p><strong>Total Price:</strong> ${parseFloat(order.totalPrice).toFixed(2)}</p>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <p><strong>Order ID:</strong> {order.id}</p>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <p><strong>Orderd At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      
      
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

                {item.discount && (
                  <p className="mb-1">
                    <i className="fa-solid fa-dollar-sign me-2 text-muted"></i>
                    <strong>Price:</strong> {item.discount}
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
