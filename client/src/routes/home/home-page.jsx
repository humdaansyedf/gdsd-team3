import { useState } from "react";
import { Switch } from "@mantine/core";
import { usePropertySearch } from "./home-queries";
import classes from "./home-style.module.css";
import { FeaturedCarousel } from "../../components/Carousel/Carousel";
import FiltersSection from "./filters-section";
import MapView from "./map-view";
import ListView from "./list-view";

export const Home = () => {
  const [isMapView, setIsMapView] = useState(false);
  const searchQuery = usePropertySearch();

  return (
    <>
      <FeaturedCarousel />
      <div className={classes.container}>
        <FiltersSection />

        <div className={classes.resultsSection}>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <Switch
              size="md"
              color="green"
              checked={isMapView}
              onChange={(event) => setIsMapView(event.currentTarget.checked)}
              label={isMapView ? "Map View" : "List View"}
            />
          </div>

          {searchQuery.isLoading && <p>Loading...</p>}
          {searchQuery.error && <p>Error: {searchQuery.error.message}</p>}

          {searchQuery.data &&
            (isMapView ? (
              <div style={{ height: "500px", width: "100%" }}>
                <MapView properties={searchQuery.data} />
              </div>
            ) : (
              <ListView properties={searchQuery.data} />
            ))}
        </div>
      </div>
    </>
  );
};
