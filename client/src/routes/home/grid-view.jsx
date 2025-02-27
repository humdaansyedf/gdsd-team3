import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Flex,
  Image,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowRight, IconDog, IconSmoking } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { WishlistButton } from "../../components/WishlistButton/WishlistButton";
import "./grid-view.css";

const DefaultPropertyCard = ({ property }) => {
  return (
    <Card withBorder p="md" shadow="sm">
      {property.isRecommended && (
        <Badge
          variant="gradient"
          gradient={{ from: "teal", to: "lime", deg: 105 }}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
          }}
        >
          Recommended
        </Badge>
      )}
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
          <WishlistButton propertyId={property.id} />
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

export const GridView = ({ properties, renderCard }) => {
  return (
    <div className="property-grid">
      {properties.map((property) => {
        const CardComponent = renderCard || DefaultPropertyCard;
        return <CardComponent key={property.id} property={property} />;
      })}
    </div>
  );
};

export default GridView;
