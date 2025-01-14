import React, { useState } from "react";
import {APIProvider, Map, Marker, InfoWindow} from '@vis.gl/react-google-maps';

const MapView = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState(null); // State for the selected property

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
    <Map
      style={{width: '100%', height: '500px'}}
      defaultCenter={{lat: 50.52, lng: 9.67 }}
      defaultZoom={12}
      gestureHandling={'greedy'}
      disableDefaultUI={true}>
    
      {/* Render markers for each property */}
      {properties.map((property) => (
        <Marker
          key={property.id} // doubt
          position={{ lat: property.latitude, lng: property.longitude }}
          onClick={() => setSelectedProperty(property)} // Show InfoWindow when a marker is clicked
        />
      ))}

      {/* Render InfoWindow for the selected property */}
      {selectedProperty && (
        <InfoWindow
          position={{
            lat: selectedProperty.latitude,
            lng: selectedProperty.longitude,
          }}
          onCloseClick={() => setSelectedProperty(null)} // Close the InfoWindow
        >
          <div>
            <h4>{selectedProperty.title}</h4>
            <p>{selectedProperty.description.slice(0, 50)}...</p>
            <p>
              <strong>Rent: €{selectedProperty.totalRent}</strong> {/* displaying total rent here */}
            </p>
          </div>
        </InfoWindow>
      )}
      </Map>
    </APIProvider>
  );
};

export default MapView;