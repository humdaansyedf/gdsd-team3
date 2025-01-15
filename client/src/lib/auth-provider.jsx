import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext, useAuth } from "./auth-context";
import { Navigate } from "react-router-dom";

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch(`/api/me`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      queryClient.refetchQueries({
        queryKey: ["me"],
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        isLoading: meQuery.isLoading,
        user: meQuery.data,
        logout: logoutMutation.mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Routes for public only pages like login, signup, etc.
export const PublicOnlyRoute = ({ children }) => {
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
