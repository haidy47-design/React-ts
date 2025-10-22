import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../features/hooks";

export default function ProtectedRoute(): React.ReactElement {
  const location = useLocation();

  
  const user = useAppSelector((s) => s.auth);
  const storedUser = localStorage.getItem("user");

  const isAuthenticated = Boolean(user && Object.keys(user).length > 0 || storedUser);

  if (!isAuthenticated) {
 
    return <Navigate to="/" replace state={{ from: location }} />;
  }

 
  return <Outlet />;
}


