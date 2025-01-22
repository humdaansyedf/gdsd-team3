import { useState } from "react";
import { Button, Select, NumberInput, SimpleGrid } from "@mantine/core";
import { useForm } from "@mantine/form";
import classes from "./creator-dashboard-style.module.css";
import { useLandlordAds } from "./creator-dashboard-queries.jsx";
import { useSearchParams } from "react-router-dom";

const DashboardFiltersSection = () => {
  const { data: ads, isLoading, error } = useLandlordAds();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialValues = {
    status: searchParams.get("status") || "All",
    minPrice: parseInt(searchParams.get("minPrice")) || 0,
    maxPrice: parseInt(searchParams.get("maxPrice")) || 5000,
  };
  const [showFilters, setShowFilters] = useState(true);
  const form = useForm({
    mode: "uncontrolled",
    initialValues,
  });
  const searchQuery = useLandlordAds();
  const handleSubmit = (values) => {
    const params = new URLSearchParams();
    if (values.status !== "All") params.set("status", values.status);
    if (values.minPrice !== 0) params.set("minPrice", values.minPrice);
    if (values.maxPrice !== 5000) params.set("maxPrice", values.maxPrice);

    setSearchParams(params);
  };
  return (
    <aside className={classes.filtersSection}>
      <div className={classes.filtersHeader}>
        <h2>Filters</h2>
        <Button size="compact-xs" color="gray" type="button" onClick={() => setShowFilters((prev) => !prev)}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showFilters && (
        <form className={classes.filters} onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <div className={classes.filter}>
            <h4>Status:</h4>
            <Select
              placeholder="Select Status"
              data={[
                { value: "All", label: "All" },
                { value: "ACTIVE", label: "Active" },
                { value: "PENDING", label: "Pending" },
                { value: "DRAFT", label: "Draft" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              {...form.getInputProps("status")}
            />
          </div>

          <div className={classes.filter}>
            <h4>Price Range:</h4>
            <SimpleGrid cols={2} spacing="xs">
              <NumberInput placeholder="Min. Rent" min={0} max={5000} step={50} {...form.getInputProps("minPrice")} />
              <NumberInput placeholder="Max. Rent" min={0} max={5000} step={50} {...form.getInputProps("maxPrice")} />
            </SimpleGrid>
          </div>

          <div className={classes.filterBtns}>
            <Button type="submit" className={classes.applyFiltersBtn}>
              Apply Filters
            </Button>
            <Button
              color="gray"
              type="button"
              className={classes.resetFiltersBtn}
              onClick={() => {
                form.reset();
                setSearchParams(new URLSearchParams());
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      )}
    </aside>
  );
};
export default DashboardFiltersSection;
