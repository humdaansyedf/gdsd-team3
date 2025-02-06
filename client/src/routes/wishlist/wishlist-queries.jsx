import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }

      const data = await response.json();

      return data.map((item) => ({
        ...item.property,
        media: item.property.media.length > 0
          ? item.property.media[0].url
          : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
      }));
    },
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId) => {
      const response = await fetch(`/api/wishlist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add property to wishlist");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist"]);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId) => {
      const response = await fetch(`/api/wishlist/${propertyId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to remove property from wishlist");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist"]);
    },
  });
};