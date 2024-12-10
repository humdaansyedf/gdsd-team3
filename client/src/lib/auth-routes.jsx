import { Navigate } from "react-router-dom";
import { useAuth } from "./auth-context";

// Routes for public only pages like login, signup, etc.
export const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return null;
  }
  if (user) {
    return <Navigate to="/" />;
  }
  return children;
};

// Routes for private pages that require authentication
export const PrivateRoute = ({ children, userType }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (userType && user.type !== userType) {
    return <Navigate to="/" />;
  }
  return children;
};
