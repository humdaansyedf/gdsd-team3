import { useQuery } from "@tanstack/react-query";

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
