import { useState } from "react";
import { Link } from "react-router-dom";
import { usePropertySearch } from "./home-queries";
import classes from "./home-style.module.css";

export const Home = () => {
  const DEFAULT_FILTERS = {
    title: "",
    pets: false,
    smoking: false,
    minPrice: "",
    maxPrice: "",
    availableFrom: "",
  };
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const searchQuery = usePropertySearch(filters);

  const handleSubmit = (e) => {
    e.preventDefault();

    setFilters((prevFilters) => ({
      ...prevFilters,
      title: e.target.title.value,
      minPrice: e.target.minPrice.value,
      maxPrice: e.target.maxPrice.value,
      availableFrom: e.target.availableFrom.value,
      pets: e.target.pets.checked,
      smoking: e.target.smoking.checked,
    }));
  };

  return (
    <>
      <h1>Home</h1>

      <div className={classes.container}>
        <aside className={classes.filtersSection}>
          <div className={classes.filtersHeader}>
            <h2>Filters</h2>
            <button className={classes.toggleFiltersBtn} type="button" onClick={() => setShowFilters((prev) => !prev)}>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {showFilters && (
            <>
              <form className={classes.filters} onSubmit={handleSubmit}>
                <div className={classes.filter}>
                  <h4>Title:</h4>
                  <input name="title" placeholder="Enter query" />
                </div>

                <div className={classes.filter}>
                  <h4>Price Range:</h4>
                  <input type="number" name="minPrice" min={0} max={99999} placeholder="Min Price" />
                  <input type="number" name="maxPrice" min={0} max={99999} placeholder="Max Price" />
                </div>

                <div className={classes.filter}>
                  <h4>Earliest available:</h4>
                  <input name="availableFrom" type="date" />
                </div>

                <div className={classes.filter}>
                  <h4>Additional:</h4>
                  <label>
                    <input type="checkbox" name="pets" className={classes.checkBox} />
                    Pets Allowed
                  </label>
                  <label>
                    <input type="checkbox" name="smoking" className={classes.checkBox} />
                    Smoking Allowed
                  </label>
                </div>

                <div className={classes.filterBtns}>
                  <button type="submit" className={classes.applyFiltersBtn}>
                    Search
                  </button>
                  <button
                    type="button"
                    className={classes.resetFiltersBtn}
                    onClick={() => {
                      setFilters(DEFAULT_FILTERS);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </>
          )}
        </aside>

        <div className={classes.resultsSection}>
          {searchQuery.isLoading && <p>Loading...</p>}
          {searchQuery.error && <p>Error: {searchQuery.error.message}</p>}

          {searchQuery.data &&
            searchQuery.data.map((property) => (
              <div key={property.id} className={classes.propertyCard}>
                {property.media ? <img src={property.media} alt={property.title} /> : <div>No Image Available</div>}
                <div className={classes.propertyCardContent}>
                  <h4>{property.title}</h4>
                  <div className={classes.propertyCardTags}>
                    <span>€ {property.totalRent}</span>
                    {property.petsAllowed && <span>Pets Allowed</span>}
                    {property.smokingAllowed && <span>Smoking Allowed</span>}
                  </div>
                  <p>{property.description.slice(0, 50)}...</p>
                  <Link to={`/property/${property.id}`}>View →</Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};
