import { Link } from "react-router-dom";
import { ActionIcon, SimpleGrid, Badge, Button, Card, Flex, Image, Text, Title, Tooltip } from "@mantine/core";
import { IconArrowRight, IconDog, IconSmoking } from "@tabler/icons-react";

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
      <Flex gap={4} mt="xs">
        <Badge radius="xs" size="lg">
          € {property.totalRent}
        </Badge>
        {property.isSublet && (
          <Badge radius="xs" size="lg" color="blue">
            Sublet
          </Badge>
        )}
        <Flex gap={4} ml="auto">
          {property.pets && (
            <Tooltip label="Pets Allowed" position="bottom">
              <ActionIcon radius="xs" variant="light">
                <IconDog size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          {property.smoking && (
            <Tooltip label="Smoking Allowed" position="bottom">
              <ActionIcon radius="xs" variant="light">
                <IconSmoking size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>
      </Flex>
      <Text my="sm">{property.description.slice(0, 50)}...</Text>

      <Button
        mt="auto"
        variant="light"
        component={Link}
        to={`/property/${property.id}`}
        rightSection={<IconArrowRight size={16} />}
        justify="space-between"
      >
        View Details
      </Button>
    </Card>
  );
};

export const GridView = ({ properties }) => {
  return (
    <SimpleGrid
      cols={{
        base: 1,
        xs: 2,
        md: 3,
        lg: 4,
      }}
      gap="md"
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </SimpleGrid>
  );
};

export default GridView;
