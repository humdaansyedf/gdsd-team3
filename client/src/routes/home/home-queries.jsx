import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";

export const usePropertySearch = () => {
  const { user } = useAuth();
  const isStudent = user && user.type === "STUDENT";
  let [searchParams] = useSearchParams();

  const filters = {
    title: searchParams.get("title") || "",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : 0,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : 999999,
    availableFrom: searchParams.get("availableFrom") || "",
    searchRadius: searchParams.get("searchRadius") || "whole area",
    amenities: searchParams.get("amenities")
      ? searchParams.get("amenities").split(",")
      : [],
  };

  const query = useQuery({
    queryKey: ["property", { filters }],
    queryFn: async () => {
      const response = await fetch(`/api/public/property/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isStudent ? { "X-User-Id": user.id } : {}), //sending for recs
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
