import { useQuery } from "@tanstack/react-query";

// Fetch Landlord Ad Stats
export const useAdStats = () => {
  const query = useQuery({
    queryKey: ["landlordAdStats"],
    queryFn: async () => {
      const response = await fetch(`/api/landlord/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ad stats");
      }

      const data = await response.json();
      return data; // Expected: { activeAds, disabledAds, newRequests }
    },
  });

  return query;
};

// Fetch Landlord Ads
export const useLandlordAds = () => {
  const query = useQuery({
    queryKey: ["landlordAds"],
    queryFn: async () => {
      const response = await fetch(`/api/landlord/property`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ads");
      }

      const data = await response.json();
      return data;
    },
  });

  return query;
};
