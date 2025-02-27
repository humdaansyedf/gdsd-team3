import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Image,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconMessage, IconPlus } from "@tabler/icons-react";
import { useCreatorAds, useCreatorAdStats } from "./creator-dashboard-queries.jsx";
import { Link } from "react-router-dom";
import DashboardFiltersSection from "./creator-dashboard-filters-section.jsx";
import { useAuth } from "../../lib/auth-context.jsx";
import { getBadgeColor } from "../admin/admin-utils.jsx";

const StudentDashboard = ({ adsQuery }) => {
  return (
    <Container px={0}>
      <Stack>
        <Paper p="md" withBorder shadow="sm" bg="gray.0">
          <Title order={2}>Student Dashboard</Title>
          <Text mt="sm">Welcome to the student dashboard. Here you can list your property for rent as a sublet</Text>

          <Group gap="xs" mt="lg">
            {adsQuery.data.length === 0 && (
              <Button size="lg" component={Link} to="/property/new" rightSection={<IconPlus />}>
                Create Ad
              </Button>
            )}
            <Button size="lg" variant="light" component={Link} to="/messages" rightSection={<IconMessage />}>
              Messages
            </Button>
          </Group>
          {adsQuery.data.length > 0 && (
            <Alert mt="xs" color="blue">
              You have already listed a property as sublet. Archive it to list another
            </Alert>
          )}
        </Paper>
        {adsQuery.error && <Alert color="red">Error Loading Ad</Alert>}
        {adsQuery.data.length > 0 ? (
          <SimpleGrid
            cols={{
              base: 1,
              xs: 2,
              md: 3,
            }}
            gap="md"
          >
            {adsQuery.data.map((property) => {
              return <PropertyCard key={property.id} property={property} />;
            })}
          </SimpleGrid>
        ) : (
          <Alert color="gray">No Ad Yet</Alert>
        )}
      </Stack>
    </Container>
  );
};

const PropertyCard = ({ property }) => {
  return (
    <Card withBorder p="md" shadow="sm">
      <Card.Section>
        <Image
          src={property.media}
          alt={property.title}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
          }}
        />
      </Card.Section>
      <Title mt="sm" order={4}>
        {property.title}
      </Title>
      <Flex justify="space-between" gap={4} mt="xs">
        <Badge radius="xs" size="lg">
          € {property.totalRent}
        </Badge>
        <Badge variant="light" radius="xs" size="lg" color={getBadgeColor(property.status)}>
          {property.status}
        </Badge>
      </Flex>
      <Text my="sm">{property.description.slice(0, 50)}...</Text>

      <Button
        mt="auto"
        variant="light"
        component={Link}
        to={`/property/${property.id}/edit`}
        rightSection={<IconArrowRight size={16} />}
        justify="space-between"
        onClick={() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }}
      >
        Edit
      </Button>
    </Card>
  );
};

const LandlordDashboard = ({ adsQuery, adStatsQuery }) => {
  return (
    <Container px={0}>
      <Stack>
        <Paper p="md" withBorder shadow="sm" bg="gray.0">
          <Title order={2}>Landlord Dashboard</Title>
          {adStatsQuery.error && <Alert color="red">Error Loading Stats</Alert>}
          {adStatsQuery.data && (
            <SimpleGrid
              mt="xl"
              cols={{
                base: 1,
                sm: 3,
              }}
            >
              <Paper p="md" withBorder shadow="none" bg="white">
                <Flex justify="space-between">
                  <Title order={4}>Ads Created</Title>
                  <Text size="3rem" c="blue">
                    {adStatsQuery.data.allAds || 0}
                  </Text>
                </Flex>
              </Paper>
              <Paper p="md" withBorder shadow="none" bg="white">
                <Flex justify="space-between">
                  <Title order={4}>Ads Active</Title>
                  <Text size="3rem" c="blue">
                    {adStatsQuery.data.activeAds || 0}
                  </Text>
                </Flex>{" "}
              </Paper>
              <Paper p="md" withBorder shadow="none" bg="white">
                <Flex justify="space-between">
                  <Title order={4}>Ads Pending</Title>
                  <Text size="3rem" c="blue">
                    {adStatsQuery.data.pendingAds || 0}
                  </Text>
                </Flex>{" "}
              </Paper>
            </SimpleGrid>
          )}
          <Group gap="xs" mt="xl">
            <Button size="lg" component={Link} to="/property/new" rightSection={<IconPlus />}>
              Create Ad
            </Button>
            <Button size="lg" variant="light" component={Link} to="/messages" rightSection={<IconMessage />}>
              Messages
            </Button>
          </Group>
        </Paper>
        <DashboardFiltersSection />
        {adsQuery.error && <Alert color="red">Error Loading Ads</Alert>}
        {adsQuery.data.length > 0 ? (
          <SimpleGrid
            cols={{
              base: 1,
              xs: 2,
              md: 3,
            }}
            gap="md"
          >
            {adsQuery.data.map((property) => {
              return <PropertyCard key={property.id} property={property} />;
            })}
          </SimpleGrid>
        ) : (
          <Alert color="gray">No Ads Yet</Alert>
        )}
      </Stack>
    </Container>
  );
};

export const CreatorDashboardPage = () => {
  const { user } = useAuth();
  const adsQuery = useCreatorAds();
  const adStatsQuery = useCreatorAdStats();

  const isLandlord = user?.type === "LANDLORD";

  if (adsQuery.isLoading || adStatsQuery.isLoading) {
    return <Loader />;
  }

  if (isLandlord) {
    return <LandlordDashboard adsQuery={adsQuery} adStatsQuery={adStatsQuery} />;
  }

  return <StudentDashboard adsQuery={adsQuery} />;
};
