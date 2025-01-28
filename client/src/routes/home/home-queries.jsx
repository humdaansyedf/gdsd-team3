import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

export const usePropertySearch = () => {
  let [searchParams] = useSearchParams();

  const filters = {
    title: searchParams.get("title") || "",
    pets: searchParams.get("pets") || false,
    smoking: searchParams.get("smoking") || false,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 999999,
    availableFrom: searchParams.get("availableFrom") || "",
    searchRadius: searchParams.get("searchRadius") || "whole area",
  };

  const query = useQuery({
    queryKey: ["property", { filters }],
    queryFn: async () => {
      const response = await fetch(`/api/public/property/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...filters,
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
