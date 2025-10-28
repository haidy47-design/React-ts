import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { User } from "../auth/SignupPage";

export default function ProtectedAdmin({ children }: { children?: React.ReactNode }): React.ReactElement {
  // const user = useAppSelector((state) => state.user as User | null);
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {} as User;
    }
  })();
  const role = (stored as User)?.role ?? stored?.role;
  const isAdmin = role === "admin";
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children ?? <Outlet />}</>;
}


