import { useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { Paper, Button, Image, Text, Badge, ActionIcon, Flex, Tooltip } from "@mantine/core";
import { IconArrowRight, IconDog, IconSmoking } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { WishlistButton } from "../../components/WishlistButton/WishlistButton";

const MapView = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <Paper radius="sm" style={{ overflow: "hidden" }}>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: "100%", height: "500px" }}
          defaultCenter={{ lat: 50.52, lng: 9.67 }}
          defaultZoom={12}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        >
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={{ lat: property.latitude, lng: property.longitude }}
              onClick={() => setSelectedProperty(property)}
            />
          ))}

          {selectedProperty && (
            <InfoWindow
              position={{
                lat: selectedProperty.latitude,
                lng: selectedProperty.longitude,
              }}
              onCloseClick={() => setSelectedProperty(null)}
            >
              <Paper shadow="sm" p="sm" radius="md" style={{ width: 220 }}>
                <Image
                  src={
                    selectedProperty.media?.length > 0
                      ? selectedProperty.media
                      : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png"
                  }
                  alt={selectedProperty.title}
                  height={100}
                  radius="sm"
                  fallbackSrc="https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png"
                  style={{ objectFit: "cover" }}
                />

                <Text fw={700} size="sm" mt="xs">
                  {selectedProperty.title}
                </Text>

                <Flex gap={4} mt="xs" align="center">
                  <Badge radius="xs" size="lg">
                    € {selectedProperty.totalRent}
                  </Badge>
                  {selectedProperty.isSublet && (
                    <Badge radius="xs" size="lg" color="blue">
                      Sublet
                    </Badge>
                  )}
                  <Flex gap={4} ml="auto">
                    {selectedProperty.pets && (
                      <Tooltip label="Pets Allowed" position="bottom">
                        <ActionIcon radius="xs" variant="light">
                          <IconDog size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {selectedProperty.smoking && (
                      <Tooltip label="Smoking Allowed" position="bottom">
                        <ActionIcon radius="xs" variant="light">
                          <IconSmoking size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <WishlistButton propertyId={selectedProperty.id} />
                  </Flex>
                </Flex>

                <Text size="xs" c="dimmed" lineClamp={2} my="xs">
                  {selectedProperty.description.slice(0, 50)}...
                </Text>

                <Button
                  mt="xs"
                  variant="light"
                  component={Link}
                  to={`/property/${selectedProperty.id}`}
                  rightSection={<IconArrowRight size={16} />}
                  fullWidth
                >
                  View Details
                </Button>
              </Paper>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </Paper>
  );
};

export default MapView;