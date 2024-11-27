import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

export const Home = () => {
  const [title, setTitle] = useState("");
  const [filters, setFilters] = useState({
    title: "",
    pets: false,
    smoking: false,
    minPrice: "",
    maxPrice: "",
    availableFrom: "",
  });
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    mutation.mutate({ title: "" });
  }, []);

  const handleFilterChange = (e) => {
    const { name, checked, value } = e.target;

    if (name === "pets" || name === "smoking") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: checked,
      }));
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: value,
      }));
    }
  };

  const mutation = useMutation({
    mutationFn: async (filterData) => {
      const response = await fetch("/api/property/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filterData),
      });

      if (!response.ok) {
        throw new Error("Error fetching properties");
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Fetched properties:", data);
    },
    onError: (error) => {
      console.error("Error:", error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const filterData = {
      title,
      pets: filters.pets,
      smoking: filters.smoking,
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 99999999,
      availableFrom: filters.availableFrom || "",
      page: 1,
    };

    if (!filters.pets) {
      delete filterData.pets;
    }

    if (!filters.smoking) {
      delete filterData.smoking;
    }
    console.log(filterData);

    mutation.mutate(filterData);
  };

  return (
    <div className="container">
      <aside className="filters-section">
        <button
          className="filter-button"
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {showFilters && (
          <div className="filters">
            <div className="column-style">
              <h4>Price Range:</h4>
              <label>
                Min:
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min Price"
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </label>
              <label>
                Max:
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max Price"
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </label>
            </div>

            <div>
              <h4>Earliest available:</h4>
              <label className="filter-input">
                Date:
                <input
                  name="availableFrom"
                  type="date"
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </label>
            </div>

            <div className="column-style">
              <h4>Additional:</h4>
              <label>
                <input
                  type="checkbox"
                  name="pets"
                  checked={filters.pets}
                  onChange={handleFilterChange}
                  className="checkBox"
                />
                Pets
              </label>
              <label>
                <input
                  type="checkbox"
                  name="smoking"
                  checked={filters.smoking}
                  onChange={handleFilterChange}
                  className="checkBox"
                />
                Smoking
              </label>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="apply-filter"
            >
              Apply Filters
            </button>
          </div>
        )}
      </aside>

      <main className="main-style">
        <h1>Home</h1>
        <form onSubmit={handleSubmit} className="search-form">
          <input
            name="title"
            placeholder="What are you looking for?"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <button type="submit">Search</button>
        </form>

        {mutation.isLoading && <p>Loading...</p>}
        {mutation.error && <p>Error: {mutation.error.message}</p>}

        {mutation.data &&
          mutation.data.map((property) => (
            <div key={property.id} className="property-card">
              {property.media ? (
                <img src={property.media} alt={property.title} />
              ) : (
                <div>No Image Available</div>
              )}
              <div>
                <h4>{property.title}</h4>
                <p>{property.description.slice(0, 50)}...</p>
                <Link to={`/property/${property.id}`}>View</Link>
              </div>
            </div>
          ))}
      </main>
    </div>
  );
};
