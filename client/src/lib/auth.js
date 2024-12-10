import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch(`/api/me`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/logout`, { method: "POST" });
      queryClient.refetchQueries({
        queryKey: ["me"],
      });
    },
  });

  return {
    isLoading: meQuery.isLoading,
    user: meQuery.data,
    logout: logoutMutation.mutate,
  };
};
