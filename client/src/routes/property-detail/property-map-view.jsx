import React, { useState } from "react";
import {APIProvider, Map, Marker, InfoWindow} from '@vis.gl/react-google-maps';

const PropertyMap = ({ data }) => {
  // const [selectedProperty, setSelectedProperty] = useState(null); State for the selected property

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
    <Map
      defaultCenter={{lat: data.latitude, lng: data.longitude }}
      defaultZoom={15}
      gestureHandling={'greedy'}
      disableDefaultUI={true}>
    
      {/* Render markers for each property */}
        <Marker
          position={{ lat: data.latitude, lng: data.longitude }}
          // onClick={() => setSelectedProperty(property)} Show InfoWindow when a marker is clicked
        />

      {/* Render InfoWindow for the selected property
        <InfoWindow
          position={{
            lat: data.latitude,
            lng: data.longitude,
          }}
          // onCloseClick={() => setSelectedProperty(null)} // Close the InfoWindow
        >
          <div>
            <h4>{data.title}</h4>
            <p>{data.description.slice(0, 50)}...</p>
            <p>
              <strong>Rent: €{data.totalRent}</strong>
            </p>
          </div>
        </InfoWindow> */}
      </Map>
    </APIProvider>
  );
};

export default PropertyMap;