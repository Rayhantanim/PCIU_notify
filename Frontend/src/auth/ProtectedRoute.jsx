import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  if (!userId || !role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}