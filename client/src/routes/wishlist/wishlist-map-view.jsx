import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { Paper, Text, Badge, ActionIcon, Flex, Tooltip } from "@mantine/core";
import { IconDog, IconSmoking } from "@tabler/icons-react";
import { useState } from "react";

export const WishlistMapView = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const defaultBounds = {};
  defaultBounds.north = Math.max(...properties.map((p) => p.latitude));
  defaultBounds.south = Math.min(...properties.map((p) => p.latitude));
  defaultBounds.east = Math.max(...properties.map((p) => p.longitude));
  defaultBounds.west = Math.min(...properties.map((p) => p.longitude));
  const defaultCenter = {
    lat: (defaultBounds.north + defaultBounds.south) / 2,
    lng: (defaultBounds.east + defaultBounds.west) / 2,
  };
  const defaultZoom = 12;

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultBounds={defaultBounds}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        disableDefaultUI={true}
        style={{
          width: "100%",
          height: "300px",
          borderRadius: "8px",
        }}
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
                </Flex>
              </Flex>
            </Paper>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
};
