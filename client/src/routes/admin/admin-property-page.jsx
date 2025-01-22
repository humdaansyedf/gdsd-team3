import { useParams } from "react-router-dom";
import { useAdminProperty, useAdminPropertyUpdateStatus } from "./admin-queries";
import { Box, Group, Text, Title, SimpleGrid, Badge, Button, Container } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { getBadgeColor } from "./admin-utils";
import { PropertyDetailView } from "../property-detail/property-detail-page";

const AdminUpdateStatus = ({ id, status }) => {
  const updateStatusMutation = useAdminPropertyUpdateStatus(id);

  if (!["ACTIVE", "REJECTED", "PENDING"].includes(status)) {
    return null;
  }

  return (
    <SimpleGrid cols={2} spacing="xs">
      {status !== "ACTIVE" && (
        <Button
          size="lg"
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
          size="lg"
          color="red"
          loading={updateStatusMutation.isPending}
          onClick={() => updateStatusMutation.mutate("REJECTED")}
          leftSection={<IconX />}
        >
          REJECT
        </Button>
      )}
    </SimpleGrid>
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
      <Group justify="space-between" align="center" mb="md">
        <Title order={1}>Admin Dashboard</Title>
        <Badge mr="auto" radius="sm" variant="light" size="xl" color={getBadgeColor(propertyQuery.data.status)}>
          {propertyQuery.data.status}
        </Badge>
      </Group>
      <PropertyDetailView data={propertyQuery.data} isAdmin />
      <Container my="xl" px={0}>
        <AdminUpdateStatus id={id} status={propertyQuery.data.status} />
      </Container>
    </Box>
  );
};
