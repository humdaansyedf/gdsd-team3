import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { Paper, Text, Badge, ActionIcon, Flex, Tooltip } from "@mantine/core";
import { IconDog, IconSmoking } from "@tabler/icons-react";
import { useState } from "react";

export const WishlistMapView = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={{ lat: properties[0]?.latitude || 50.52, lng: properties[0]?.longitude || 9.67 }}
        defaultZoom={12}
        disableDefaultUI={true}
        style={{ width: "100%", height: "300px", marginTop: "20px", borderRadius: "8px" }}
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
