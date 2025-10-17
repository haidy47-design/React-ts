import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks";

export default function ProtectedAdmin({ children }: { children?: React.ReactNode }): React.ReactElement {
  const user = useAppSelector((s) => (s as any).user);
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {} as any;
    }
  })();
  const role = (user as any)?.role ?? stored?.role;
  const isAdmin = role === "admin";
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children ?? <Outlet />}</>;
}


