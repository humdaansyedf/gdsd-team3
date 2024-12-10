import { useQuery } from "@tanstack/react-query";

export const usePropertySearch = (filters) => {
  const query = useQuery({
    queryKey: ["property", { filters }],
    queryFn: async () => {
      const response = await fetch(`/api/property/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: filters.title || "",
          pets: filters.pets || false,
          smoking: filters.smoking || false,
          minPrice: filters.minPrice || 0,
          maxPrice: filters.maxPrice || 99999999,
          availableFrom: filters.availableFrom || "",
          searchRadius: filters.searchRadius || "whole area",
          page: 1,
        }),
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
