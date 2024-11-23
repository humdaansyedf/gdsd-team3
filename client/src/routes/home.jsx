import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export const Home = () => {
  const [title, setTitle] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["property", { title }],
    queryFn: async () => {
      const response = await fetch(`/api/property?title=${title}`);
      const data = await response.json();
      return data;
    },
  });

  return (
    <div>
      <h1>Home</h1>
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          setTitle(e.target.title.value);
        }}
      >
        <input name="title" />
        <button type="submit">Search</button>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data &&
        data.map((property) => (
          <div key={property.id} className="property-card">
            <img src={property.media} alt={property.title} />
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
