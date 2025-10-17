import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ProtectedRoute from "../components/common/ProtectedRoute";
import HomePage from "../features/home/HomePage";
import ProductsPage from "../features/product/ProductsPage";
import ProductDetailsPage from "../features/product/ProductDetailsPage";
import CartPage from "../features/product/CartPage";
import OrdersPage from "../features/order/OrdersPage";
import CheckoutPage from "../features/order/CheckoutPage";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import ProfilePage from "../features/auth/ProfilePage";
import About from "../features/home/About";
import Contact from "../features/home/Contact";
import OrderDetails from "../features/order/OrderDetails";
import ResetPassword from "../features/auth/ResetPassword";
import ProtectedAdmin from "../features/admin/ProtectedAdmin";
import AdminLayout from "../features/admin/AdminLayout";
import Dashboard from "../features/admin/Dashboard";
import Products from "../features/admin/Products";
import AdminOrders from "../features/admin/Orders";
import Users from "../features/admin/Users";

export default function AppRoutes(): React.ReactElement {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPassword  />} />

        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}


