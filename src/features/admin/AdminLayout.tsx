import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

export default function AdminLayout(): React.ReactElement {
  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <aside className="col-12 col-md-3 col-lg-2 bg-light border-end p-3">
          <Link to="/" className="navbar-brand d-block mb-4 fw-bold">
            Admin
          </Link>
          <nav className="nav flex-column gap-1">
            <NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : "text-dark"}`}>Dashboard</NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : "text-dark"}`}>Products</NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : "text-dark"}`}>Orders</NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : "text-dark"}`}>Users</NavLink>
          </nav>
        </aside>

        <main className="col-12 col-md-9 col-lg-10 p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0">Admin Dashboard</h5>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}


