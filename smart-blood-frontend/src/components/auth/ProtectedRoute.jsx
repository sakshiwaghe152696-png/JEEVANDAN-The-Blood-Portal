import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const token = localStorage.getItem("token");

  // 🔒 No token → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let decoded;

  try {
    decoded = jwtDecode(token);
  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // 🔒 Role missing
  if (!decoded?.role) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Role not allowed
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(decoded.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}