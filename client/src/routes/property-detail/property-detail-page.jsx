import { useParams } from "react-router-dom";
import { useGetPropertyById } from "./property-detail-queries";

import { Button } from "@mantine/core";

import classes from "./property-detail-style.module.css";

export const PropertyDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetPropertyById(id);

  console.log(data);

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data && (
        <div key={data.id} className={classes.container}>
          <div className={classes.boxContainer}>
            <div className={classes.titleSection}>
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

              <div className={classes.infoContainer}>
                <h4>{data.title}</h4>
                <p>Total rent: {data.totalRent}€</p>
                <p>
                  Available From:
                  {new Date(data.availableFrom).toLocaleDateString("en-GB")}
                </p>
                <p>
                  Last Updated:
                  {new Date(data.updatedAt).toLocaleDateString("en-GB")}
                </p>
                <p>
                  Available From:
                  {new Date(data.availableFrom).toLocaleDateString("en-GB")}
                </p>
                <div className={classes.buttonGroup}>
                  <Button.Group>
                    <Button variant="filled">Message</Button>
                    <Button variant="filled">Report</Button>
                    <Button variant="filled">Share</Button>
                  </Button.Group>
                </div>
              </div>

              <div className={classes.mapSection}>
                <h4>Location Map</h4>
              </div>
            </div>
          </div>

          <br></br>
          <div className={classes.contentSection}>
            <div className={classes.descriptionSection}>
              <h4>Description</h4>
              <p>{data.description}</p>
              <h4>More Details:</h4>
              <p>{data.description}</p>
            </div>
            <div className={classes.amenitiesSection}>
              <h4>Amenities</h4>
              <ul>
                <li>Number of Rooms: {data.numberOfRooms}</li>
                <li>Pets Allowed: {data.petsAllowed ? "Yes" : "No"}</li>
                <li>Smoking Allowed: {data.smokingAllowed ? "Yes" : "No"}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
