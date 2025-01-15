import * as React from "react";
import { Link } from "react-router-dom";
import { IconArrowRight } from "@tabler/icons-react";
import { Badge, Box, Button, Card, Group, Image, SegmentedControl, SimpleGrid, Text, Title } from "@mantine/core";
import { useAdminProperties } from "./admin-queries";
import { getBadgeColor } from "./admin-utils";

const AdminProperties = ({ properties }) => {
  const [filteredProperties, setFilteredProperties] = React.useState(() => properties);

  return (
    <>
      <Box mb="lg">
        <SegmentedControl
          withItemsBorders={false}
          transitionDuration={0}
          data={["All", "PENDING", "ACTIVE", "REJECTED", "OTHER"]}
          onChange={(value) => {
            if (value === "All") {
              setFilteredProperties(properties);
              return;
            }

            if (value === "OTHER") {
              setFilteredProperties(
                properties.filter((property) => !["PENDING", "ACTIVE", "REJECTED"].includes(property.status))
              );
              return;
            }

            setFilteredProperties(properties.filter((property) => property.status === value));
          }}
        />
      </Box>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {filteredProperties.map((property) => {
          return (
            <Card key={property.id} shadow="sm" padding="sm" radius="md" withBorder>
              <Card.Section>
                <Image src={property.media} alt={property.title} h={200} />
              </Card.Section>
              <Title order={4} fw={500} mt="sm">
                {property.title}
              </Title>
              <Group gap="xs" mt="xs">
                <Badge radius="xs" size="lg" variant="light">
                  € {property.totalRent}
                </Badge>
                {property.petsAllowed && (
                  <Badge radius="xs" size="lg" variant="outline">
                    Pets Allowed
                  </Badge>
                )}
                {property.smokingAllowed && (
                  <Badge radius="xs" size="lg" variant="outline">
                    Smoking Allowed
                  </Badge>
                )}
              </Group>
              <Text mt="xs">{property.description.slice(0, 100)}...</Text>
              <Group gap="xs" mt="md">
                <Badge radius="xs" size="lg" color={getBadgeColor(property.status)}>
                  {property.status}
                </Badge>
                <Button
                  component={Link}
                  to={`/admin/property/${property.id}`}
                  ml="auto"
                  rightSection={<IconArrowRight size={16} />}
                  variant="light"
                >
                  View
                </Button>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>
    </>
  );
};

export const AdminDashboard = () => {
  const propertiesQuery = useAdminProperties();

  if (propertiesQuery.isLoading) {
    return <Text>Loading...</Text>;
  }

  if (propertiesQuery.error) {
    return <Text c="red">Error: {propertiesQuery.error.message}</Text>;
  }

  if (!propertiesQuery.data || propertiesQuery.data.length === 0) {
    return <Text>No properties found</Text>;
  }

  return (
    <Box py="lg">
      <Title order={1} mb="md">
        Admin Dashboard
      </Title>
      <AdminProperties
        properties={propertiesQuery.data.sort((a, b) => {
          // Sort by status
          if (a.status === "PENDING" && b.status !== "PENDING") {
            return -1;
          }
          if (a.status === "ACTIVE" && b.status === "REJECTED") {
            return -1;
          }
          if (a.status === "REJECTED" && b.status !== "REJECTED") {
            return -1;
          }
          return 0;
        })}
      />
    </Box>
  );
};
