import { useParams, useNavigate } from "react-router-dom";
import { Badge, Button, Container, Group, Image, Loader, Paper, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useClipboard } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import { useGetPropertyById } from "./property-detail-queries";

import classes from "./property-detail-style.module.css";
import PropertyMap from "./property-map-view";

export const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Navigation hook
  const { data, isLoading, error } = useGetPropertyById(id);
  const clipboard = useClipboard();

  console.log(data);

  const handleMessageClick = () => {
    if (data && data.creatorId) {
      console.log(data.creatorId);
      console.log("Navigating to /mymessages with state:", {
        propertyId: data.id,
        selectedUserId: data.creatorId,
      });

      navigate(`/mymessages`, {
        state: { propertyId: data.id, selectedUserId: data.creatorId },
      });
    } else {
      alert("Unable to retrieve owner information.");
    }
  };

  const handleShareClick = () => {
    try {
      const propertyUrl = `${window.location.origin}/property/${id}`;
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

  return (
    <>
      {isLoading && <Loader />}
      {error && <p>Error: {error.message}</p>}

      {data && (
        // Outermost container
        <Container>
          <Paper radius="sm" style={{ overflow: "hidden" }}>
            <Carousel loop height={400} bg="gray.2">
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
          </Paper>
          <Paper withBorder p="md" mt="md" shadow="sm">
            <Title order={2}>{data.title}</Title>
            <Group mt="xs" gap="xs">
              <Badge variant="light" size="lg" radius="sm">
                €{data.totalRent}
              </Badge>
              {data.isSublet && (
                <Badge variant="light" size="lg" color="blue" radius="sm">
                  This property is a sublet
                </Badge>
              )}
            </Group>
            <Text>{data.createdAt}</Text>
          </Paper>

          <pre>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>

          <div className={classes.boxContainer}>
            {/* highlights container */}
            <div className={classes.titleSection}>
              {/* Image section - a large image with small images beside  */}
              <div className={classes.imageSection}>
                <div className={classes.largeImageBox}>
                  <img src={data.media[0]?.url} alt={data.title} />
                </div>

                <div className={classes.smallImageBoxes}>
                  <div className={classes.smallImageBox}>
                    <img src={data.media[0]?.url} alt={data.title} />
                  </div>
                  <div className={classes.smallImageBox}>
                    <img src={data.media[1]?.url} alt={data.title} />
                  </div>
                </div>
              </div>

              {/* Ad title, key info and buttons */}
              <div className={classes.infoContainer}>
                <h4>{data.title}</h4>
                {data.isSublet && (
                  <Badge radius="xs" size="md" color="blue">
                    This property is a sublet
                  </Badge>
                )}
                <p>Total rent: {data.totalRent}€</p>
                <p>
                  Cold rent:
                  {data.coldRent}€
                </p>
                <p>
                  Additional costs:
                  {data.additionalCosts}€
                </p>
                <p>
                  Deposit:
                  {data.deposit}€
                </p>
                <p>
                  Available From:
                  {new Date(data.availableFrom).toLocaleDateString("en-GB")}
                </p>

                <div className={classes.buttonGroup}>
                  <Button.Group>
                    <Button variant="filled" onClick={handleMessageClick}>
                      Message
                    </Button>
                    <Button variant="filled">Report</Button>
                    <Button variant="filled" onClick={handleShareClick}>
                      Share
                    </Button>
                  </Button.Group>
                </div>
              </div>

              {/* Map box */}
              <div className={classes.mapSection}>
                <h4>Location Map</h4>
                <PropertyMap data={data} />
              </div>
            </div>
          </div>

          <br></br>
          {/* Container to hold description and amenities */}
          <div className={classes.contentSection}>
            <div className={classes.descriptionSection}>
              <h4>Description</h4>
              <p>{data.description}</p>
              <br></br>
              <h4>More Details:</h4>
              <p>{data.description}</p>
            </div>
            <div className={classes.amenitiesSection}>
              <h4>Amenities</h4>
              <ul>
                <li>Number of Rooms: {data.numberOfRooms}</li>
                <li>Number of Baths: {data.numberOfBaths}</li>
                <li>Heating included: {data.heatingIncludedInAdditionalCosts ? "Yes" : "No"}</li>
                <li>Furnished: {data.furnished ? "Yes" : "No"}</li>
                <li>Internet: {data.internet ? "Yes" : "No"}</li>
                <li>Parking: {data.parking ? "Yes" : "No"}</li>
                <li>Cellar: {data.cellar ? "Yes" : "No"}</li>
              </ul>
            </div>
          </div>
        </Container>
      )}
    </>
  );
};
