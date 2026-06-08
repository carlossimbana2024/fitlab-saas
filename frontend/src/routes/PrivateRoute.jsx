import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "owner") {
      return <Navigate to="/owner-dashboard" replace />;
    }

    if (user?.role === "client") {
      return <Navigate to="/client-dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;