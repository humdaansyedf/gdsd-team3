import { useParams } from "react-router-dom";
import { useGetPropertyById } from "./property-detail-queries";

export const PropertyDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetPropertyById(id);

  return (
    <div>
      <h1>Property Detail</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};
