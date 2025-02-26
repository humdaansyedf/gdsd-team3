import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth-context";

export const useGetPropertyById = (id) => {
  const { user } = useAuth();
  const isStudent = user && user.type === "STUDENT";

  const query = useQuery({
    queryKey: ["property", { id }],
    queryFn: async () => {
      console.log("user info:", user);
      const response = await fetch(`/api/public/property/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(isStudent ? { "X-User-Id": user.id } : {}), //sending to track views
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }
      console.log("received:", data);
      return data;
    },
  });

  return query;
};
