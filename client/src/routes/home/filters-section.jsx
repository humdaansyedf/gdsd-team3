import {
  Button,
  Drawer,
  Flex,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import classes from "./home-style.module.css";
import { useSearchParams } from "react-router-dom";

const AMENITIES = [
  {
    label: "Pets Allowed",
    value: "pets",
  },
  {
    label: "Smoking Allowed",
    value: "smoking",
  },
  {
    label: "Kitchen",
    value: "kitchen",
  },
  {
    label: "Furnished",
    value: "furnished",
  },
  {
    label: "Balcony",
    value: "balcony",
  },
  {
    label: "Cellar",
    value: "cellar",
  },
  {
    label: "Washing Machine",
    value: "washingMachine",
  },
  {
    label: "Elevator",
    value: "elevator",
  },
  {
    label: "Garden",
    value: "garden",
  },
  {
    label: "Parking",
    value: "parking",
  },
  {
    label: "Internet",
    value: "internet",
  },
  {
    label: "Cable TV",
    value: "cableTv",
  },
];

const Filters = ({ onFilter, onReset }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialValues = {
    title: searchParams.get("title") || "",
    minPrice: searchParams.get("minPrice") || 0,
    maxPrice: searchParams.get("maxPrice") || 5000,
    availableFrom: searchParams.get("availableFrom") || "",
    searchRadius: searchParams.get("searchRadius") || "whole area",
    amenities: searchParams.get("amenities") ? searchParams.get("amenities").split(",") : [],
  };

  const form = useForm({
    mode: "uncontrolled",
    initialValues: initialValues,
  });

  return (
    <Stack
      gap="sm"
      component="form"
      onSubmit={form.onSubmit((values) => {
        console.log(values);
        const params = new URLSearchParams();
        if (values.title) params.set("title", values.title);
        if (values.minPrice !== 0) params.set("minPrice", values.minPrice);
        if (values.maxPrice !== 5000) params.set("maxPrice", values.maxPrice);
        if (values.availableFrom) params.set("availableFrom", values.availableFrom);
        if (values.searchRadius !== "whole area") params.set("searchRadius", values.searchRadius);
        if (values.amenities && values.amenities.length) params.set("amenities", values.amenities.join(","));

        setSearchParams(params);
        if (onFilter) {
          onFilter();
        }
      })}
    >
      <Title order={3}>Filters</Title>
      <Stack gap={4}>
        <Title order={4}>Title:</Title>
        <TextInput placeholder="Enter query" key={form.key("title")} {...form.getInputProps("title")} />
      </Stack>

      <Stack gap={4}>
        <Title order={4}>Price Range:</Title>
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
      </Stack>

      <Stack gap={4}>
        <Title order={4}>Earliest available:</Title>
        <DateInput
          placeholder="Select date"
          minDate={new Date()}
          key={form.key("availableFrom")}
          {...form.getInputProps("availableFrom")}
        />
      </Stack>

      <Stack gap={4}>
        <Title order={4}>Search radius:</Title>
        <Select
          placeholder="Whole area"
          data={["Whole area", "+5km", "+10km", "+20km", "+100km", "200km"]}
          key={form.key("searchRadius")}
          {...form.getInputProps("searchRadius")}
        />
      </Stack>

      <Stack gap={4}>
        <Title order={4}>Amenities:</Title>
        <MultiSelect
          placeholder="Select amenities"
          checkIconPosition="right"
          clearable
          searchable
          data={AMENITIES}
          key={form.key("amenities")}
          {...form.getInputProps("amenities")}
        />
      </Stack>

      <Flex gap="xs" mt="xs">
        <Button type="submit" w="67%">
          Search
        </Button>
        <Button
          w="33%"
          color="gray"
          type="button"
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
            if (onReset) {
              onReset();
            }
          }}
        >
          Reset
        </Button>
      </Flex>
    </Stack>
  );
};

const DesktopFilters = ({ showFilters }) => {
  if (!showFilters) {
    return null;
  }

  return (
    <Paper withBorder p="md" shadow="sm" className={classes.filtersSection} visibleFrom="sm">
      <Filters />
    </Paper>
  );
};

const MobileFilters = ({ showFilters, toggleFilters }) => {
  return (
    <Drawer opened={showFilters} onClose={toggleFilters} hiddenFrom="sm">
      <Filters onFilter={toggleFilters} onReset={toggleFilters} />
    </Drawer>
  );
};

const FiltersSection = ({ showDesktopFilters, showMobileFilters, toggleMobileFilters }) => {
  return (
    <>
      <DesktopFilters showFilters={showDesktopFilters} />
      <MobileFilters showFilters={showMobileFilters} toggleFilters={toggleMobileFilters} />
    </>
  );
};

export default FiltersSection;
