import { useState, useRef } from "react";
import { Button, TextInput, Textarea, NumberInput, Select, Checkbox, Group } from "@mantine/core";
import { Autocomplete, LoadScript} from "@react-google-maps/api";
import classes from "./create-ad-style.module.css";
import { ImageUploader } from "../../components/ImageUploader/ImageUploader";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {DateInput} from "@mantine/dates";
const libraries = ["places"];
//const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const apiKey = "AIzaSyC6IIx7btkk6TtHmFjUoJAnQ_tJxlQRBPI";

export const CreateAdPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    totalRent: 0,
    coldRent: 0,
    additionalCosts: 0,
    heatingIncludedInAdditionalCosts: false,
    deposit: 0,
    numberOfRooms: 1,
    numberOfBeds: 0,
    numberOfBaths: 0,
    availableFrom: "",
    latitude: null,
    longitude: null,
    pets: false,
    smoking: false,
    media: [], // Image URLs
  });

  const [errors, setErrors] = useState({});
  const [address, setAddress] = useState("");
  const autocompleteRef = useRef(null);
  const navigate = useNavigate();

  // Handle place selection
  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        setAddress(place.formatted_address);
        setFormData((prev) => ({
          ...prev,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        }));
        setErrors((prev) => ({ ...prev, address: null }));
      }
    }
  };



  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle image upload
  const handleImageUpload = (uploadedUrl) => {
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, { url: uploadedUrl }],
    }));
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updatedForm = { ...prev, [field]: value };

      if (field === "coldRent" || field === "additionalCosts") {
        updatedForm.totalRent = updatedForm.coldRent + (updatedForm.additionalCosts || 0);
      }

      setErrors((prev) => ({ ...prev, [field]: null }));
      return updatedForm;
    });
  };

  // Validate fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim() || formData.title.length < 5 || formData.title.length > 100) {
      newErrors.title = "Title must be between 5 and 100 characters.";
    }
    if (!formData.propertyType) newErrors.propertyType = "Property Type is required";
    if (!formData.availableFrom) newErrors.availableFrom = "Available From is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!formData.description.trim() || formData.description.length < 10 || formData.description.length > 2000) {
      newErrors.description = "Description must be between 10 and 2000 characters.";
    }
    if (formData.totalRent <= 0) newErrors.totalRent = "Total Rent must be greater than 0";
    if (formData.media.length === 0) newErrors.media = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    const payload = {
      status: "PENDING",
      propertyType: formData.propertyType,
      title: formData.title,
      description: formData.description,
      totalRent: formData.totalRent,
      coldRent: formData.coldRent,
      additionalCosts: formData.additionalCosts,
      heatingIncludedInAdditionalCosts: formData.heatingIncludedInAdditionalCosts,
      deposit: formData.deposit,
      numberOfRooms: formData.numberOfRooms,
      numberOfBeds: formData.numberOfBeds,
      numberOfBaths: formData.numberOfBaths,
      availableFrom: formData.availableFrom,
      latitude: formData.latitude,
      longitude: formData.longitude,
      pets: formData.pets,
      smoking: formData.smoking,
      media: formData.media,
    };

    try {
      await axios.post("/api/property", payload);
      navigate("/property/submission-confirmation")
    } catch (error) {
      alert("Failed to create property. Please try again.");
    }
  };

  return (
      <div className={classes.pageContainer}>
        <h1>Create Property Listing</h1>
        <div className={classes.container}>
          {/* Image Uploader */}
          <div className={classes.section}>
            <ImageUploader onUpload={handleImageUpload}/>
            {errors.media && <div className={classes.error}>{errors.media}</div>}
          </div>

          {/* Property Details */}
          <div className={classes.propertyDetails}>
            <TextInput
                label="Ad Title"
                placeholder="Enter Ad Title"
                error={errors.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
            />
            <Select
                label="Property Type"
                placeholder="Select Property Type"
                error={errors.propertyType}
                data={[
                  {value: "APARTMENT", label: "Apartment"},
                  {value: "HOUSE", label: "House"},
                  {value: "STUDIO", label: "Studio"},
                  {value: "ROOM", label: "Room"},
                  {value: "SHARED_ROOM", label: "Shared Room"},
                ]}
                onChange={(value) => handleInputChange("propertyType", value)}
            />
            <Group grow>
              <NumberInput
                  min={1}
                  label="Rooms"
                  onChange={(value) => handleInputChange("numberOfRooms", value)}
              />
              <NumberInput
                  min={0}
                  label="Beds"
                  onChange={(value) => handleInputChange("numberOfBeds", value)}
              />
              <NumberInput
                  min={0}
                  label="Baths"
                  onChange={(value) => handleInputChange("numberOfBaths", value)}
              />
            </Group>
            <DateInput
                label="Available From"
                minDate={new Date()}
                valueFormat="YYYY-MM-DD"
                placeholder="YYYY-MM-DD"
                error={errors.availableFrom}
                onChange={(value) => handleInputChange("availableFrom", value ? value.toISOString().substring(0, 10) : "")}
            />
          </div>

          <Group mt="md" grow>
            <NumberInput
                label="Cold Rent (€)"
                min={0}
                description="Base rent with no additional costs included."
                onChange={(value) => handleInputChange("coldRent", value)}
            />
            <NumberInput
                label="Additional Costs (€)"
                min={0}
                description="e.g. Heating, Water and sewage, etc."
                onChange={(value) => handleInputChange("additionalCosts", value)}
            />
            <NumberInput
                label="Total Rent (€)"
                value={formData.totalRent}
                error={errors.totalRent}
                readOnly
                description="This is calculated as Cold Rent + Additional Costs."
            />
            <NumberInput
                label="Deposit (€)"
                min={0}
                description="One-off payment made by a tenant"
                onChange={(value) => handleInputChange("deposit", value)}
            />
          </Group>
          <Group mt="md">
            <Checkbox
                label="Heating Included"
                checked={formData.heatingIncludedInAdditionalCosts}
                onChange={() => handleCheckboxChange("heatingIncludedInAdditionalCosts")}
            />
            <Checkbox label="Pets Allowed" checked={formData.pets}
                      onChange={() => handleCheckboxChange("pets")}/>
            <Checkbox label="Smoking Allowed" checked={formData.smoking}
                      onChange={() => handleCheckboxChange("smoking")}/>
          </Group>

          {/* Google Maps Autocomplete */}
          <div className={classes.section}>
            <LoadScript
                googleMapsApiKey={apiKey}
                libraries={libraries}
            >
              <Autocomplete
                  options={{componentRestrictions: {country: "de"}}}
                  onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                  onPlaceChanged={handlePlaceChanged}
              >
                <TextInput label="Address" error={errors.address} placeholder="Enter Address"/>
              </Autocomplete>
            </LoadScript>
          </div>

          {/* Description */}
          <Textarea
              label="Description"
              placeholder="Enter Description"
              error={errors.description}
              autosize
              minRows={3}
              mb="xl"
              onChange={(e) => handleInputChange("description", e.target.value)}
          />

          {/* Submit Button */}
          <Button fullWidth color="green" onClick={handleSubmit} radius="md" size="lg">
            Submit
          </Button>
        </div>
      </div>
  );
};