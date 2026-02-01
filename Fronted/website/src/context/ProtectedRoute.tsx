import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { ReactElement } from "react";

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();

  // אם לא מחובר → נשלח ל-login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}