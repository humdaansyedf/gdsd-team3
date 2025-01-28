import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

// Fetch creator Ad Stats
export const useCreatorAdStats = () => {
  return useQuery({
    queryKey: ["creatorAdStats"],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch ad stats");
      }
      return response.json();
    },
    refetchInterval: 300000,
  });
};

// Fetch creator Ads
export const useCreatorAds = () => {
  const [searchParams] = useSearchParams();

  // Extract filters from searchParams
  const filters = {
    title: searchParams.get("title") || "",
    status: searchParams.get("status") || "All",
    minPrice: parseInt(searchParams.get("minPrice")) || 0,
    maxPrice: parseInt(searchParams.get("maxPrice")) || 5000,
  };

  return useQuery({
    queryKey: ["creatorAds", { filters }], // Include filters in the query key
    queryFn: async () => {
      const response = await fetch(`/api/property/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters), // Send filters to the backend
      });

      if (!response.ok) {
        throw new Error("Failed to fetch landlord ads");
      }

      const data = await response.json();
      return data;
    },
  });
};
