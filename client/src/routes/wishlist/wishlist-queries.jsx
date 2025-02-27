import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth-context";

export const useWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist"],
    enabled: !!user && user.type === "STUDENT",
    queryFn: async () => {
      if (!user || user.type !== "STUDENT") {
        return [];
      }

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
        note: item.note,
        media:
          item.property.media.length > 0
            ? item.property.media[0].url
            : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
      }));
    },
    initialData: [],
  });
};

// Add property to wishlist
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
      queryClient.invalidateQueries(["wishlist"]); // Refresh wishlist data
    },
  });
};

// Remove property from wishlist
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
      queryClient.invalidateQueries(["wishlist"]); // Refresh wishlist data
    },
  });
};

export const useUpdatePropertyNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, note }) => {
      const response = await fetch(`/api/wishlist/${propertyId}/note`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Log the error response
        console.error("Failed to update note:", errorData);
        throw new Error("Failed to update property note");
      }

      return response.json(); // Ensure response is properly returned
    },
    onSuccess: (data) => {
      console.log("Note updated successfully:", data);
      queryClient.invalidateQueries(["wishlist"]); // Refresh wishlist data
    },
  });
};
