import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Image,
  Loader,
  Paper, Rating,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title, Tooltip,
} from "@mantine/core";
import { IconCalendar, IconCheck, IconMapPin, IconMessage, IconPhotoOff, IconShare, IconX,  IconInfoCircle} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useClipboard } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import { useGetPropertyById } from "./property-detail-queries";
import PropertyMap from "./property-map-view";
import dayjs from "dayjs";
import { useAuth } from "../../lib/auth-context";
import { WishlistButton } from "../../components/WishlistButton/WishlistButton";

const PropertyStat = ({ label, value }) => {
  return (
    <Flex align="center" justify="space-between">
      <Text size="sm" fw={700}>
        {label}
      </Text>
      <Text size="sm" c="dimmed">
        {value}
      </Text>
    </Flex>
  );
};

const PropertyBooleanStat = ({ label, value }) => {
  return (
    <Flex align="center" gap="xs">
      {value ? (
        <ThemeIcon color="green" variant="light" size="sm">
          <IconCheck />
        </ThemeIcon>
      ) : (
        <ThemeIcon color="red" variant="light" size="sm">
          <IconX />
        </ThemeIcon>
      )}
      <Text size="sm" fw={700}>
        {label}
      </Text>
    </Flex>
  );
};

export const PropertyDetailView = ({ data, isAdmin = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const clipboard = useClipboard();
  const labels = [
    { text: "Rather high price"},
    { text: "Higher price"},
    { text: "Good price"},
    { text: "Very good price"},
    { text: "Excellent price"},
  ];

  const infoTooltip = "This rating is calculated based on the estimated price range for similar properties.";
  const handleMessageClick = () => {
    if (data && data.creatorId) {
      navigate(`/messages`, {
        state: {
          propertyId: data.id,
          selectedUserId: data.creatorId,
          selectedUsername: data.user.name,
          propertyTitle: data.title,
        },
      });
    } else {
      console.log("Unable to retrieve owner information.");
    }
  };

  const handleShareClick = () => {
    try {
      const propertyUrl = `${window.location.href}`;
      clipboard.copy(propertyUrl);

      // Show success notification
      notifications.show({
        title: "Link Copied!",
        message: "The property link has been copied to your clipboard.",
        color: "green",
      });
    } catch (err) {
      console.log(err);
      // Show error notification
      notifications.show({
        title: "Copy Failed",
        message: "Failed to copy the property link.",
        color: "red",
      });
    }
  };

  const showMap = user || isAdmin;

  return (
    <Container px={0}>
      <Paper radius="sm" style={{ overflow: "hidden" }}>
        {data.media.length > 0 ? (
          <Carousel withIndicators loop height={400} bg="gray.2">
            {data.media.map((media) => (
              <Carousel.Slide key={media.id}>
                <Image
                  src={media.url}
                  alt={media.title}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : (
          <Center h={400} bg="gray.2" c="dimmed">
            <Stack align="center" gap="xs">
              <IconPhotoOff size={64} />
              No images available
            </Stack>
          </Center>
        )}
      </Paper>
      <Paper withBorder p="md" mt="md" shadow="sm">
        <Group gap="xs" justify="space-between">
          <Title order={2}>{data.title}</Title>

          {data.isSublet && (
            <Badge variant="light" color="blue" size="lg" radius="sm" ml="auto">
              Sublet Property
            </Badge>
          )}
          <WishlistButton propertyId={data.id} />
        </Group>
        <Group>
        <Badge variant="light" size="xl" radius="sm" mt="sm">
          {data.totalRent} €
        </Badge>

          {data.priceRating > 0 && (
        <Stack align="left" gap="0">
          <Group mt="sm">
        <Rating value={data.priceRating} readOnly count={5} color="green"/>
        <Tooltip label={infoTooltip} withArrow>
          <IconInfoCircle size={18} color="gray" style={{ cursor: "pointer" }} />
        </Tooltip>
      </Group>
      <Text weight={600} size="sm" c="dimmed">
        {labels[data.priceRating - 1].text}
      </Text>
        </Stack>
          )}

        </Group>
        <Stack gap={4} mt="sm" c="gray.7">
          {showMap && data.address1 && (
            <Group align="center" gap={4}>
              <IconMapPin size={14} />
              <Text size="sm">{data.address1}</Text>
            </Group>
          )}

          {data.createdAt && (
            <Group align="center" gap={4}>
              <IconCalendar size={14} />
              <Text size="sm">
                {dayjs(Date.createdAt).format("MMMM D, YYYY")}
              </Text>
            </Group>
          )}
        </Stack>
        {!isAdmin && (
          <Button.Group mt="lg">
            {user && user.id !== data.creatorId && (
              <Button
                variant="outline"
                size="md"
                onClick={handleMessageClick}
                rightSection={<IconMessage size={16} />}
              >
                Message
              </Button>
            )}
            <Button
              variant="outline"
              size="md"
              onClick={handleShareClick}
              rightSection={<IconShare size={16} />}
            >
              Share
            </Button>
          </Button.Group>
        )}
      </Paper>
      <Paper withBorder p="md" mt="md" shadow="sm">
        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
          }}
          spacing={{ base: "xl", sm: "4rem" }}
        >
          <Stack gap="xs">
            <PropertyStat label="Property type" value={data.propertyType} />
            <PropertyStat
              label="Available from"
              value={dayjs(data.availableFrom).format("MMMM D, YYYY")}
            />
            {data.livingSpaceSqm && (
              <PropertyStat
                label="Living space"
                value={
                  <>
                    {data.livingSpaceSqm} m<sup>2</sup>
                  </>
                }
              />
            )}
            {data.numberOfRooms && (
              <PropertyStat label="Rooms" value={`${data.numberOfRooms}`} />
            )}
            {data.numberOfBeds && (
              <PropertyStat label="Beds" value={`${data.numberOfBeds}`} />
            )}
            {data.numberOfBaths && (
              <PropertyStat label="Baths" value={`${data.numberOfBaths}`} />
            )}
            {data.totalFloors && (
              <PropertyStat
                label="Total floors"
                value={`${data.totalFloors}`}
              />
            )}
            {data.floorNumber && (
              <PropertyStat label="Floor" value={`${data.floorNumber}`} />
            )}
            {data.minimumLeaseTermInMonths && (
              <PropertyStat
                label="Minimum lease term"
                value={`${data.minimumLeaseTermInMonths} months`}
              />
            )}
            {data.maximumLeaseTermInMonths && (
              <PropertyStat
                label="Maximum lease term"
                value={`${data.maximumLeaseTermInMonths} months`}
              />
            )}
            {data.noticePeriodInMonths && (
              <PropertyStat
                label="Notice period"
                value={`${data.noticePeriodInMonths} months`}
              />
            )}
          </Stack>
          <Stack gap="xs">
            <PropertyStat label="Cold rent" value={`${data.coldRent} €`} />
            {data.additionalCosts && (
              <PropertyStat
                label="Additional costs"
                value={`${data.additionalCosts} €`}
              />
            )}
            {data.additionalCosts && (
              <PropertyStat
                label="Heating included in additional costs"
                value={data.heatingIncludedInAdditionalCosts ? "Yes" : "No"}
              />
            )}
            <PropertyStat label="Total rent" value={`${data.totalRent} €`} />
            {data.deposit && (
              <PropertyStat label="Deposit" value={`${data.deposit} €`} />
            )}
          </Stack>
        </SimpleGrid>
      </Paper>
      <Paper withBorder p="md" mt="md" shadow="sm">
        <Title order={4} mb="sm">
          Amenities
        </Title>
        <SimpleGrid
          cols={{
            base: 1,
            xs: 2,
            sm: 3,
            md: 4,
          }}
          spacing="xs"
        >
          <PropertyBooleanStat label="Pets Allowed" value={data.pets} />
          <PropertyBooleanStat label="Smoking Allowed" value={data.smoking} />
          <PropertyBooleanStat label="Kitchen" value={data.kitchen} />
          <PropertyBooleanStat label="Furnished" value={data.furnished} />
          <PropertyBooleanStat label="Balcony" value={data.balcony} />
          <PropertyBooleanStat label="Cellar" value={data.cellar} />
          <PropertyBooleanStat
            label="Washing Machine"
            value={data.washingMachine}
          />
          <PropertyBooleanStat label="Elevator" value={data.elevator} />
          <PropertyBooleanStat label="Garden" value={data.garden} />
          <PropertyBooleanStat label="Parking" value={data.parking} />
          <PropertyBooleanStat label="Internet" value={data.internet} />
          <PropertyBooleanStat label="Cable TV" value={data.cableTv} />
        </SimpleGrid>
      </Paper>
      <Paper withBorder p="md" mt="md" shadow="sm" h={400}>
        <Flex direction="column" h="100%">
          <Title order={4} mb="sm">
            Location
          </Title>
          {showMap && data.address1 && (
            <Group align="center" gap={4} mb="xs">
              <IconMapPin size={14} />
              <Text size="sm">{data.address1}</Text>
            </Group>
          )}
          <Box h="100%" style={{ flex: 1, position: "relative" }}>
            <PropertyMap data={data} />
            {!showMap && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backdropFilter: "blur(20px)",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Login to view map
              </div>
            )}
          </Box>
        </Flex>
      </Paper>
      <Paper withBorder p="md" mt="md" shadow="sm">
        <Flex direction="column" h="100%">
          <Title order={4} mb="sm">
            Description
          </Title>
          <Text
            size="sm"
            style={{
              whiteSpace: "pre-wrap",
            }}
          >
            {data.description}
          </Text>
        </Flex>
      </Paper>
    </Container>
  );
};

export const PropertyDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetPropertyById(id);

  return (
    <>
      {isLoading && <Loader />}
      {error && <p>Error: {error.message}</p>}
      {data && <PropertyDetailView data={data} />}
    </>
  );
};
