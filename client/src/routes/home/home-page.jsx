import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Checkbox, TextInput, NumberInput, SimpleGrid } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { usePropertySearch } from "./home-queries";
import classes from "./home-style.module.css";

export const Home = () => {
  const DEFAULT_FILTERS = {
    title: "",
    pets: false,
    smoking: false,
    minPrice: 0,
    maxPrice: 5000,
    availableFrom: "",
  };
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const searchQuery = usePropertySearch(filters);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: DEFAULT_FILTERS,
  });

  return (
    <>
      <h1>Home</h1>
      <div className={classes.container}>
        <aside className={classes.filtersSection}>
          <div className={classes.filtersHeader}>
            <h2>Filters</h2>
            <Button size="compact-xs" color="gray" type="button" onClick={() => setShowFilters((prev) => !prev)}>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {showFilters && (
            <>
              <form className={classes.filters} onSubmit={form.onSubmit((values) => setFilters(values))}>
                <div className={classes.filter}>
                  <h4>Title:</h4>
                  <TextInput placeholder="Enter query" key={form.key("title")} {...form.getInputProps("title")} />
                </div>

                <div className={classes.filter}>
                  <h4>Price Range:</h4>
                  <SimpleGrid cols={2} spacing="xs">
                    <NumberInput
                      placeholder="Min. Rent"
                      min={0}
                      max={5000}
                      step={50}
                      prefix="€"
                      key={form.key("minPrice")}
                      {...form.getInputProps("minPrice")}
                    />
                    <NumberInput
                      placeholder="Max. Rent"
                      min={0}
                      max={5000}
                      step={50}
                      prefix="€"
                      key={form.key("maxPrice")}
                      {...form.getInputProps("maxPrice")}
                    />
                  </SimpleGrid>
                </div>

                <div className={classes.filter}>
                  <h4>Earliest available:</h4>
                  <DateInput
                    minDate={new Date()}
                    key={form.key("availableFrom")}
                    {...form.getInputProps("availableFrom")}
                  />
                </div>

                <div className={classes.filter}>
                  <h4>Additional:</h4>
                  <Checkbox
                    label="Pets Allowed"
                    className={classes.checkBox}
                    key={form.key("pets")}
                    {...form.getInputProps("pets")}
                  />
                  <Checkbox
                    label="Smoking Allowed"
                    className={classes.checkBox}
                    key={form.key("smoking")}
                    {...form.getInputProps("smoking")}
                  />
                </div>

                <div className={classes.filterBtns}>
                  <Button type="submit" className={classes.applyFiltersBtn}>
                    Search
                  </Button>
                  <Button
                    color="gray"
                    type="button"
                    className={classes.resetFiltersBtn}
                    onClick={() => {
                      form.reset();
                      setFilters(DEFAULT_FILTERS);
                    }}
                  >
                    Reset
                  </Button>
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
