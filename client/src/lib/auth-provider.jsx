import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./auth-context";

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
