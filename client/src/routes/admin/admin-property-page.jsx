import { useParams } from "react-router-dom";
import {
  useAdminProperty,
  useAdminPropertyUpdateStatus,
} from "./admin-queries";
import {
  Box,
  Group,
  Text,
  Title,
  SimpleGrid,
  Badge,
  Button,
  Container,
  Textarea,
  Paper,
  Flex,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { getBadgeColor } from "./admin-utils";
import { PropertyDetailView } from "../property-detail/property-detail-page";
import { useState } from "react";

const AdminUpdateStatus = ({ defaultValue, id, status }) => {
  const [adminComment, setAdminComment] = useState(defaultValue);
  const updateStatusMutation = useAdminPropertyUpdateStatus(id);

  if (!["ACTIVE", "REJECTED", "PENDING"].includes(status)) {
    return null;
  }

  return (
    <SimpleGrid cols={2} spacing="xs" mt="xl">
      <Box
        style={{
          gridColumn: "1 / span 2",
        }}
      >
        <Textarea
          placeholder="Add a comment for the landlord..."
          value={adminComment}
          autosize
          minRows={2}
          maxRows={4}
          label="Admin comment"
          onChange={(e) => setAdminComment(e.target.value)}
        />
      </Box>

      {status !== "ACTIVE" && (
        <Button
          size="lg"
          color="green"
          loading={updateStatusMutation.isPending}
          onClick={() =>
            updateStatusMutation.mutate({ status: "ACTIVE", adminComment })
          }
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
          onClick={() =>
            updateStatusMutation.mutate({ status: "REJECTED", adminComment })
          }
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
        <Badge
          mr="auto"
          radius="sm"
          variant="light"
          size="xl"
          color={getBadgeColor(propertyQuery.data.status)}
        >
          {propertyQuery.data.status}
        </Badge>
      </Group>
      <PropertyDetailView data={propertyQuery.data} isAdmin />

      <Container mb="xl" px={0}>
        <Paper withBorder p="md" my="md" shadow="sm">
          <Flex direction="column" h="100%">
            <Title order={4} mb="sm">
              Landlord&apos;s Comments
            </Title>
            <Text
              size="sm"
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              {propertyQuery.data.creatorComment}
            </Text>
          </Flex>
        </Paper>
        <AdminUpdateStatus
          id={id}
          status={propertyQuery.data.status}
          defaultValue={propertyQuery.data.adminComment}
        />
      </Container>
    </Box>
  );
};
