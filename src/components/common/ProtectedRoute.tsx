import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../features/hooks";

// Guards private routes; redirects to /login if not authenticated
export default function ProtectedRoute(): React.ReactElement {
  const location = useLocation();
  const isAuthenticated = useAppSelector((s) => Boolean(s.auth.token));
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}


