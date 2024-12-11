import { Link } from "react-router-dom";
import { usePropertySearch } from "./home-queries";
import classes from "./home-style.module.css";
import { FeaturedCarousel } from "../../components/Carousel/Carousel";
import FiltersSection from "./filters-section";

export const Home = () => {
  const searchQuery = usePropertySearch();

  return (
    <>
      <FeaturedCarousel />
      <div className={classes.container}>
        <FiltersSection />
        <div className={classes.resultsSection}>
          {searchQuery.isLoading && <p>Loading...</p>}
          {searchQuery.error && <p>Error: {searchQuery.error.message}</p>}

          {searchQuery.data &&
            searchQuery.data.map((property) => (
              <div key={property.id} className={classes.propertyCard}>
                {property.media ? <img src={property.media} alt={property.title} /> : <div>No Image Available</div>}
                <div className={classes.propertyCardContent}>
                  <h2>{property.title}</h2>
                  <div className={classes.propertyCardTags}>
                    <span>€ {property.totalRent}</span>
                    {property.petsAllowed && <span>Pets Allowed</span>}
                    {property.smokingAllowed && <span>Smoking Allowed</span>}
                  </div>
                  <p>{property.description.slice(0, 50)}...</p>
                  <Link
                    to={`/property/${property.id}`}
                    style={{
                      display: "inline-block",
                      backgroundColor: "#d4f8d4",
                      color: "#000000",
                      padding: "0.5rem 1rem",
                      borderRadius: "10px",
                      textDecoration: "none",
                      fontWeight: "bold",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#c2edc2"; /* Hover effect */
                      e.target.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#d4f8d4"; /* Reset to original */
                      e.target.style.color = "#000000";
                    }}
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};
