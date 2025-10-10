import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { removeFromCart, clearCart } from "./cartSlice";
import { Link } from "react-router-dom";

export default function CartPage(): React.ReactElement {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <div className="container py-4">
      <h3 className="mb-3">Your Cart</h3>
      {items.length === 0 ? (
        <div className="alert alert-info">Cart is empty. Go to <Link to="/products">Shop</Link>.</div>
      ) : (
        <>
          <ul className="list-group mb-3">
            {items.map((i) => (
              <li key={i.id} className="list-group-item d-flex align-items-center">
                <img src={i.image} alt="" className="rounded me-3" style={{ width: 56, height: 56, objectFit: "cover" }} />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <strong>{i.title}</strong>
                    <span>${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-muted small">Qty: {i.quantity}</div>
                </div>
                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => dispatch(removeFromCart(i.id))}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="d-flex justify-content-between align-items-center">
            <button className="btn btn-link text-danger" onClick={() => dispatch(clearCart())}>Clear Cart</button>
            <div>
              <strong className="me-3">Total: ${total.toFixed(2)}</strong>
              <Link to="/checkout" className="btn btn-primary">Checkout</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


