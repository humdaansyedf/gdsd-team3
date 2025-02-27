import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const PropertyMap = ({ data }) => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={{ lat: data.latitude, lng: data.longitude }}
        defaultZoom={15}
        disableDefaultUI={true}
      >
        <Marker position={{ lat: data.latitude, lng: data.longitude }} />
      </Map>
    </APIProvider>
  );
};

export default PropertyMap;
