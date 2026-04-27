import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");
  const isLoggedIn = userId && userRole;

  if (!isLoggedIn) {
    toast.error("Please login to continue");
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    toast.error(`Access denied. ${userRole}s cannot access this page`);
    
    // Redirect to appropriate dashboard based on role
    if (userRole === "student") return <Navigate to="/dashboard/overview" replace />;
    if (userRole === "teacher") return <Navigate to="/dashboard/dashboardindex" replace />;
    if (userRole === "staff") return <Navigate to="/dashboard/view" replace />;
    
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleBasedRoute;