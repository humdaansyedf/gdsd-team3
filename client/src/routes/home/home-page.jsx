import { useState } from "react";
import { Button, Center, Flex, SegmentedControl, Stack } from "@mantine/core";
import { IconMap, IconAdjustments, IconAdjustmentsOff, IconLayoutGrid } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { usePropertySearch } from "./home-queries";
import FiltersSection from "./filters-section";
import MapView from "./map-view";
import GridView from "./grid-view";

export const Home = () => {
  const [view, setView] = useState("grid");
  const searchQuery = usePropertySearch();
  const [showMobileFilters, { toggle: toggleMobileFilters }] = useDisclosure(false);
  const [showDesktopFilters, { toggle: toggleDesktopFilters }] = useDisclosure(true);

  return (
    <>
      <Flex gap="md" mt="mt">
        <FiltersSection
          showDesktopFilters={showDesktopFilters}
          showMobileFilters={showMobileFilters}
          toggleMobileFilters={toggleMobileFilters}
        />
        <Stack w="100%">
          <Flex justify="space-between">
            <Button
              color="dark"
              variant="light"
              onClick={() => toggleDesktopFilters()}
              leftSection={showDesktopFilters ? <IconAdjustmentsOff size={16} /> : <IconAdjustments size={16} />}
              visibleFrom="sm"
            >
              Filters
            </Button>
            <Button
              color="dark"
              variant="light"
              onClick={() => toggleMobileFilters()}
              leftSection={showMobileFilters ? <IconAdjustmentsOff size={16} /> : <IconAdjustments size={16} />}
              hiddenFrom="sm"
            >
              Filters
            </Button>
            <SegmentedControl
              value={view}
              onChange={setView}
              data={[
                {
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconLayoutGrid size={16} />
                      <span>Grid View</span>
                    </Center>
                  ),
                  value: "grid",
                },
                {
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconMap size={16} />
                      <span>Map View</span>
                    </Center>
                  ),
                  value: "map",
                },
              ]}
            />
          </Flex>

          {searchQuery.isLoading && <p>Loading...</p>}
          {searchQuery.error && <p>Error: {searchQuery.error.message}</p>}

          {searchQuery.data &&
            (view === "map" ? (
              <div style={{ height: "500px", width: "100%" }}>
                <MapView properties={searchQuery.data} />
              </div>
            ) : (
              <GridView properties={searchQuery.data} />
            ))}
        </Stack>
      </Flex>
    </>
  );
};
