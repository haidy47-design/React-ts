import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { placeOrder } from "./orderSlice";
import { clearCart } from "../product/cartSlice";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage(): React.ReactElement {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const handlePlace = () => {
    dispatch(placeOrder({ items, total }));
    dispatch(clearCart());
    navigate("/orders");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Checkout</h3>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <p className="mb-1">Items: {items.length}</p>
          <p className="mb-3">Total: <strong>${total.toFixed(2)}</strong></p>
          <button className="btn btn-success" onClick={handlePlace} disabled={!items.length}>Place Order (COD)</button>
        </div>
      </div>
    </div>
  );
}


