import { useParams } from "react-router-dom";
import { useAdminProperty, useAdminPropertyUpdateStatus } from "./admin-queries";
import { Box, Group, Paper, Text, Title, Image, SimpleGrid, Badge, Divider, List, Button } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Carousel } from "@mantine/carousel";
import { getBadgeColor } from "./admin-utils";

const AdminUpdateStatus = ({ id, status }) => {
  const updateStatusMutation = useAdminPropertyUpdateStatus(id);

  return (
    <Group>
      {status !== "ACTIVE" && (
        <Button
          size="xl"
          color="green"
          loading={updateStatusMutation.isPending}
          onClick={() => updateStatusMutation.mutate("ACTIVE")}
          leftSection={<IconCheck />}
        >
          APPROVE
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button
          size="xl"
          color="red"
          loading={updateStatusMutation.isPending}
          onClick={() => updateStatusMutation.mutate("REJECTED")}
          leftSection={<IconX />}
        >
          REJECT
        </Button>
      )}
    </Group>
  );
};

export const AdminProperty = () => {
  const { id } = useParams();

  const propertyQuery = useAdminProperty(id);

  if (propertyQuery.isLoading) {
    return <Text>Loading...</Text>;
  }

  if (propertyQuery.error) {
    return <Text c="red">Error: {propertyQuery.error.message}</Text>;
  }

  if (!propertyQuery.data || propertyQuery.data.length === 0) {
    return <Text>No property found</Text>;
  }

  return (
    <Box py="lg">
      <Group justify="space-between" align="start" mb="md">
        <Title order={1}>Admin Dashboard</Title>
        <AdminUpdateStatus id={id} status={propertyQuery.data.status} />
      </Group>
      <Box>
        <Paper withBorder p="sm">
          <SimpleGrid cols={2} spacing="md">
            <Carousel loop height={300}>
              {propertyQuery.data.media.map((media) => (
                <Carousel.Slide key={media.id}>
                  <Image src={media.url} alt={media.title} />
                </Carousel.Slide>
              ))}
            </Carousel>
            <Box>
              <Group justify="space-between" align="start">
                <Title order={2}>{propertyQuery.data.title}</Title>
                <Group justify="end" align="start" gap="xs">
                  {propertyQuery.data.isSublet && (
                    <Badge radius="xs" size="xl" color="blue">
                      Sublet
                    </Badge>
                  )}
                  <Badge radius="xs" size="xl" color={getBadgeColor(propertyQuery.data.status)}>
                    {propertyQuery.data.status}
                  </Badge>
                </Group>
              </Group>

              <Text>Total rent: €{propertyQuery.data.totalRent}</Text>
              <Text>Cold rent: €{propertyQuery.data.coldRent}</Text>
              <Text>Additional costs: €{propertyQuery.data.additionalCosts}</Text>
              <Text>
                Available From:
                {new Date(propertyQuery.data.availableFrom).toLocaleDateString("en-GB")}
              </Text>
            </Box>
          </SimpleGrid>
          <Divider my="lg" />
          <Title order={3}>Description</Title>
          <Text>{propertyQuery.data.description}</Text>
          <Divider my="lg" />

          <Title order={3}>Amenities</Title>
          <List>
            <List.Item>Number of Rooms: {propertyQuery.data.numberOfRooms}</List.Item>
            <List.Item>Number of Baths: {propertyQuery.data.numberOfBaths}</List.Item>
            <List.Item>
              Heating included: {propertyQuery.data.heatingIncludedInAdditionalCosts ? "Yes" : "No"}
            </List.Item>
            <List.Item>Pets Allowed: {propertyQuery.data.petsAllowed ? "Yes" : "No"}</List.Item>
            <List.Item>Smoking Allowed: {propertyQuery.data.smokingAllowed ? "Yes" : "No"}</List.Item>
          </List>
        </Paper>
      </Box>
    </Box>
  );
};
