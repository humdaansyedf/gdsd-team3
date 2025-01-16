import {
  Button,
  Checkbox,
  NumberInput,
  Select,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";
import classes from "./home-style.module.css";
import { useSearchParams } from "react-router-dom";

const FiltersSection = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialValues = {
    title: searchParams.get("title") || "",
    pets: searchParams.get("pets") === "true" || false,
    smoking: searchParams.get("smoking") === "true" || false,
    minPrice: searchParams.get("minPrice") || 0,
    maxPrice: searchParams.get("maxPrice") || 5000,
    availableFrom: searchParams.get("availableFrom") || "",
    searchRadius: searchParams.get("searchRadius") || "whole area",
  };

  console.log(initialValues);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: initialValues,
  });

  console.log(form);
  return (
    <aside className={classes.filtersSection}>
      <div className={classes.filtersHeader}>
        <h2>Filters</h2>
        <Button
          size="compact-xs"
          color="gray"
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showFilters && (
        <>
          <form
            className={classes.filters}
            onSubmit={form.onSubmit((values) => {
              const params = new URLSearchParams();
              if (values.title) params.set("title", values.title);
              if (values.pets) params.set("pets", values.pets);
              if (values.smoking) params.set("smoking", values.smoking);
              if (values.minPrice !== 0) params.minPrice = values.minPrice;
              if (values.maxPrice !== 5000) params.maxPrice = values.maxPrice;
              if (values.availableFrom)
                params.availableFrom = values.availableFrom;
              if (values.searchRadius !== "whole area")
                params.searchRadius = values.searchRadius;
              setSearchParams(params);
            })}
          >
            <div className={classes.filter}>
              <h4>Title:</h4>
              <TextInput
                placeholder="Enter query"
                key={form.key("title")}
                {...form.getInputProps("title")}
              />
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
              <h4>Search radius:</h4>
              <Select
                placeholder="Whole area"
                data={[
                  "Whole area",
                  "+5km",
                  "+10km",
                  "+20km",
                  "+100km",
                  "200km",
                ]}
                key={form.key("searchRadius")}
                {...form.getInputProps("searchRadius")}
              />
            </div>

            <div className={classes.filter}>
              <h4>Additional:</h4>
              <Checkbox
                label="Pets Allowed"
                className={classes.checkBox}
                key={form.key("pets")}
                {...form.getInputProps("pets", { type: "checkbox" })}
              />
              <Checkbox
                label="Smoking Allowed"
                className={classes.checkBox}
                key={form.key("smoking")}
                {...form.getInputProps("smoking", { type: "checkbox" })}
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
                  form.setValues({
                    title: "",
                    pets: false,
                    smoking: false,
                    minPrice: 0,
                    maxPrice: 5000,
                    availableFrom: "",
                    searchRadius: "whole area",
                  });
                  setSearchParams(new URLSearchParams());
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </>
      )}
    </aside>
  );
};

export default FiltersSection;
