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
export const useLandlordAds = (filters) => {
    const query = useQuery({
        queryKey: ["landlordAds", { filters }],
        queryFn: async () => {
            const response = await fetch(`/api/landlord/ads`, {
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
                    page: 1,
                }),
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