import React from "react";
import { useAppSelector } from "../hooks";

export default function OrdersPage(): React.ReactElement {
  const orders = useAppSelector((s) => s.order.orders);
  return (
    <div className="container py-4">
      <h3 className="mb-3">Orders</h3>
      {orders.length === 0 ? (
        <div className="alert alert-info">No orders yet.</div>
      ) : (
        <div className="row g-3">
          {orders.map((o) => (
            <div key={o.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <strong>Order #{o.id}</strong>
                    <span className="text-muted small">{new Date(o.createdAt).toLocaleString()}</span>
                  </div>
                  <ul className="mt-2 small text-muted">
                    {o.items.map((i) => (
                      <li key={i.id}>{i.title} × {i.quantity}</li>
                    ))}
                  </ul>
                  <div className="mt-2">Total: <strong>${o.total.toFixed(2)}</strong></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


