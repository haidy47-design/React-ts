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

export default function CartPage(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

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
      <div className="cart-loading">Loading your cart...</div>
    );

  if (items.length === 0)
    return (
      <div className="cart-empty">🛒 Your cart is empty.</div>
    );

  return (
    <div className="cart-page">
      <div className="container cart-container">
        <div className="cart-grid">
          {/* 🛍 My Cart Section */}
          <div className="cart-section">
            <h1 className="cart-title">My Cart</h1>
            <div className="cart-divider"></div>

            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image}
                  alt={item.title}
                  className="cart-item-img"
                />

                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.title}</h3>
                  <span className="cart-item-price">
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

                  <button
                    onClick={() => handleRemove(item.id!)}
                    className="cart-remove-btn"
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* 🧾 Order Summary */}
          <div className="order-summary">
            <h3 className="order-title">Order Summary</h3>
            <div className="cart-divider"></div>

            <div className="order-subtotal">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="order-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button onClick={handleCheckout} className="checkout-btn">
              Checkout
            </button>

            <div className="secure-checkout">
              <i className="bi bi-lock-fill"></i>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
