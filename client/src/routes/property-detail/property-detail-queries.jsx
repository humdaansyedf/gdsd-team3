import { useQuery } from "@tanstack/react-query";

export const useGetPropertyById = (id) => {
  const query = useQuery({
    queryKey: ["property", { id }],
    queryFn: async () => {
      const response = await fetch(`/api/public/property/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    },
  });

  return query;
};
