import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import {
  fetchCartItems,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "./cartSlice";
import { useNavigate } from "react-router";
import "./CartPage.css"; 
import Spinner from "../../components/common/Spinner";

export default function CartPage(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const total = items.reduce((sum, i) => sum + i.discount * i.quantity, 0);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartQuantity({ id, quantity }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading)
    return (
      <Spinner/>
    );

  if (items.length === 0)
    return (
      <div className="cart-empty"><span className="display-1">🛒</span> Your cart is empty.</div>
    );

  return (
    <div className="cart-page">
      <div className="container cart-container">
        <div className="cart-grid">
          {/* 🛍 My Cart Section */}
          <div className="cart-section">
            <h2 className="">My Cart</h2>
            <div className="cart-divider"></div>

            {items.map((item) => (
              <div key={item.id} className="cart-item d-flex align-items-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="cart-item-img"
                />

                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.title}</h3>
                  <span className=" text-decoration-line-through">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <div className="cart-quantity-group">
                  <div className="cart-quantity-controls">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id!, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id!, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  
                </div>

                <div className="cart-item-total fw-semibold">
                  ${(item.discount * item.quantity).toFixed(2)}
                </div>
                <button
                    onClick={() => handleRemove(item.id!)}
                    className="main-color bg-transparent border-0"
                  >
                      <i className="fa-solid fa-trash m-1" />
                  </button>
              </div>
            ))}
          </div>

          {/* 🧾 Order Summary */}
          <div className="order-summary mt-3">
            <h5 className="">Order Summary</h5>
            <div className="cart-divider"></div>

            <div className="order-subtotal mt-5">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="order-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button onClick={handleCheckout} className="btn btn-success col-12 rounded-0 py-3">
              Checkout
            </button>

          
          </div>
        </div>
      </div>
    </div>
  );
}
