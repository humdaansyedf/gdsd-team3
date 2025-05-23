import { useQuery } from "@tanstack/react-query";

// fetch users current user has chatted with
export const useChatUsers = (currentUserId) => {
  return useQuery({
    queryKey: ["chatUsers", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const response = await fetch(
        `/api/chats/users?currentUserId=${currentUserId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat users");
      }
      return response.json();
    },
  });
};

export const useChatHistory = (propertyId, currentUserId, selectedUserId) => {
  return useQuery({
    queryKey: ["chatHistory", propertyId, currentUserId, selectedUserId],
    queryFn: async () => {
      if (!propertyId || !currentUserId || !selectedUserId) return [];
      const response = await fetch(
        `/api/chats/${propertyId}/${currentUserId}/${selectedUserId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }
      return response.json();
    },
    enabled: !!propertyId && !!currentUserId && !!selectedUserId, // Only run when IDs are available
  });
};

// Fetch unread messages
export const useUnreadMessages = (currentUserId) => {
  return useQuery({
    queryKey: ["unreadMessages", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const response = await fetch(
        `/api/messages/unread?currentUserId=${currentUserId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch unread messages");
      }
      const data = await response.json();
      console.log("unread:", data);
      return data;
    },
  });
};
