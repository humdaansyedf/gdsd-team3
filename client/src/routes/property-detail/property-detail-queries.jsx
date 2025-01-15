import { useQuery } from "@tanstack/react-query";

export const useGetPropertyById = (id) => {
  const query = useQuery({
    queryKey: ["property", { id }],
    queryFn: async () => {
      const response = await fetch(`/api/public/property/${id}`);
      const data = await response.json();
      return data;
    },
  });

  return query;
};
