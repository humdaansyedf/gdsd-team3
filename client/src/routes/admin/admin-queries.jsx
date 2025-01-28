import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAdminProperties = () => {
  const query = useQuery({
    queryKey: ["admin/property"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/property`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await response.json();
      return data;
    },
  });

  return query;
};

export const useAdminProperty = (id) => {
  const query = useQuery({
    queryKey: ["admin/property", { id }],
    queryFn: async () => {
      const response = await fetch(`/api/admin/property/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch property");
      }
      const data = await response.json();
      return data;
    },
  });

  return query;
};

export const useAdminPropertyUpdateStatus = (id) => {
  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      const response = await fetch(`/api/admin/property/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      queryClient.refetchQueries({
        queryKey: ["admin/property", { id }],
        exact: true,
      });
      queryClient.refetchQueries({
        queryKey: ["admin/property"],
        exact: true,
      });

      if (response.ok) {
        notifications.show({
          title: "Update successful",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Failed to update",
          color: "red",
        });
      }
    },
  });
  return updateStatusMutation;
};
