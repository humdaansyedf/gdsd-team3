import {
  Button,
  Select,
  NumberInput,
  SimpleGrid,
  Paper,
  Flex,
  Title,
  Group,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSearchParams } from "react-router-dom";

const DashboardFiltersSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialValues = {
    status: searchParams.get("status") || "All",
    minPrice: parseInt(searchParams.get("minPrice")) || 0,
    maxPrice: parseInt(searchParams.get("maxPrice")) || 5000,
  };
  const form = useForm({
    mode: "uncontrolled",
    initialValues,
  });
  const handleSubmit = (values) => {
    const params = new URLSearchParams();
    if (values.status !== "All") params.set("status", values.status);
    if (values.minPrice !== 0) params.set("minPrice", values.minPrice);
    if (values.maxPrice !== 5000) params.set("maxPrice", values.maxPrice);

    setSearchParams(params);
  };
  return (
    <Paper withBorder p="md" shadow="sm">
      <Flex
        align="flex-end"
        gap="md"
        wrap="wrap"
        component="form"
        onSubmit={form.onSubmit((values) => handleSubmit(values))}
      >
        <Box>
          <Title order={4}>Status:</Title>
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
        </Box>

        <Box>
          <Title order={4}>Price Range:</Title>
          <SimpleGrid cols={2} spacing="xs">
            <NumberInput
              placeholder="Min. Rent"
              min={0}
              max={5000}
              step={50}
              {...form.getInputProps("minPrice")}
            />
            <NumberInput
              placeholder="Max. Rent"
              min={0}
              max={5000}
              step={50}
              {...form.getInputProps("maxPrice")}
            />
          </SimpleGrid>
        </Box>

        <Group gap="xs">
          <Button type="submit">Apply Filters</Button>
          <Button
            color="gray"
            type="button"
            onClick={() => {
              form.reset();
              setSearchParams(new URLSearchParams());
            }}
          >
            Reset
          </Button>
        </Group>
      </Flex>
    </Paper>
  );
};
export default DashboardFiltersSection;
