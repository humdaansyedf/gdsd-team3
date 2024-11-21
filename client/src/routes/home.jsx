import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

export const Home = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["property"],
    queryFn: async () => {
      const response = await fetch("/api/property");
      const data = await response.json();
      return data;
    },
  });

  return (
    <div>
      <h1>Home</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data &&
        data.map((property) => (
          <div key={property.id} className="property-card">
            <img src={property.image} alt={property.title} />
            <div>
              <h4>{property.title}</h4>
              <p>{property.description.slice(0, 50)}...</p>
              <Link to={`/property/${property.id}`}>View</Link>
            </div>
          </div>
        ))}
    </div>
  );
};
