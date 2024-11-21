import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export const PropertyDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["property", { id }],
    queryFn: async () => {
      const response = await fetch(`/api/property/${id}`);
      const data = await response.json();
      return data;
    },
  });

  return (
    <div>
      <h1>Home</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};
