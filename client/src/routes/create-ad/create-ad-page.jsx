import { useState, useRef } from "react";
import {
  Button,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Checkbox,
  Group,
  Container,
  Title,
  Stack,
  SimpleGrid,
  Paper,
  Text,
} from "@mantine/core";
import { Autocomplete, LoadScriptNext } from "@react-google-maps/api";
import { ImageUploader } from "../../components/ImageUploader/ImageUploader";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DateInput, YearPickerInput } from "@mantine/dates";

const libraries = ["places"];

export const CreateAdPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    description: "",
    latitude: null,
    longitude: null,
    address1: null,
    address2: null,
    city: null,
    state: null,
    postcode: null,
    totalRent: 0,
    coldRent: 0,
    additionalCosts: 0,
    heatingIncludedInAdditionalCosts: false,
    deposit: 0,
    numberOfRooms: 1,
    numberOfBeds: 0,
    numberOfBaths: 0,
    totalFloors: null,
    floorNumber: null,
    livingSpaceSqm: null,
    yearBuilt: null,
    availableFrom: null,
    minimumLeaseTermInMonths: null,
    maximumLeaseTermInMonths: null,
    noticePeriodInMonths: null,
    pets: false,
    smoking: false,
    kitchen: false,
    furnished: false,
    balcony: false,
    cellar: false,
    washingMachine: false,
    elevator: false,
    garden: false,
    parking: false,
    internet: false,
    cableTv: false,
    media: [], // Image URLs
  });

  const [errors, setErrors] = useState({});
  const autocompleteRef = useRef(null);
  const navigate = useNavigate();

  // Handle place selection
  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        setFormData((prev) => ({
          ...prev,
          address1: place.formatted_address,
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
    if (!formData.address1.trim()) newErrors.address1 = "Address is required";
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
      title: formData.title,
      propertyType: formData.propertyType,
      description: formData.description,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address1: formData.address1,
      address2: formData.address2 || "",
      city: formData.city || "",
      state: formData.state || "",
      postcode: formData.postcode || "",
      totalRent: formData.totalRent,
      coldRent: formData.coldRent,
      additionalCosts: formData.additionalCosts,
      heatingIncludedInAdditionalCosts: formData.heatingIncludedInAdditionalCosts,
      deposit: formData.deposit,
      numberOfRooms: formData.numberOfRooms,
      numberOfBeds: formData.numberOfBeds,
      numberOfBaths: formData.numberOfBaths,
      totalFloors: formData.totalFloors,
      floorNumber: formData.floorNumber,
      livingSpaceSqm: formData.livingSpaceSqm,
      yearBuilt: formData.yearBuilt,
      availableFrom: formData.availableFrom,
      minimumLeaseTermInMonths: formData.minimumLeaseTermInMonths,
      maximumLeaseTermInMonths: formData.maximumLeaseTermInMonths,
      noticePeriodInMonths: formData.noticePeriodInMonths,
      pets: formData.pets,
      smoking: formData.smoking,
      kitchen: formData.kitchen,
      furnished: formData.furnished,
      balcony: formData.balcony,
      cellar: formData.cellar,
      washingMachine: formData.washingMachine,
      elevator: formData.elevator,
      garden: formData.garden,
      parking: formData.parking,
      internet: formData.internet,
      cableTv: formData.cableTv,
      media: formData.media,
    };

    try {
      await axios.post("/api/property", payload);
      navigate("/property/submission-confirmation");
    } catch (error) {
      console.log(error);
      alert("Failed to create property. Please try again.");
    }
  };

  return (
    <Container px={0}>
      <Title order={2}>Create Property Listing</Title>
      <Stack mt="lg" gap="lg">
        <div>
          <ImageUploader onUpload={handleImageUpload} />
          {errors.media && (
            <Text size="xs" c="red" mt={4}>
              {errors.media}
            </Text>
          )}
        </div>

        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
          }}
        >
          <TextInput
            label="Ad Title"
            placeholder="Enter Ad Title"
            error={errors.title}
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
          <Select
            label="Property Type"
            placeholder="Select Property Type"
            error={errors.propertyType}
            data={[
              { value: "APARTMENT", label: "Apartment" },
              { value: "HOUSE", label: "House" },
              { value: "STUDIO", label: "Studio" },
              { value: "ROOM", label: "Room" },
              { value: "SHARED_ROOM", label: "Shared Room" },
            ]}
            value={formData.propertyType}
            onChange={(value) => handleInputChange("propertyType", value)}
          />
        </SimpleGrid>

        <Textarea
          label="Description"
          placeholder="Enter Description"
          error={errors.description}
          autosize
          minRows={3}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />

        <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
          <Autocomplete
            options={{ componentRestrictions: { country: "de" } }}
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
          >
            <TextInput label="Address" error={errors.address1} placeholder="Enter Address" />
          </Autocomplete>
        </LoadScriptNext>

        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
          }}
        >
          <Group grow align="start">
            <NumberInput
              label="Cold Rent (€)"
              min={0}
              description="Base rent"
              value={formData.coldRent}
              onChange={(value) => handleInputChange("coldRent", value)}
            />
            <NumberInput
              label="Deposit (€)"
              min={0}
              description="One-off payment by the tenant"
              value={formData.deposit}
              onChange={(value) => handleInputChange("deposit", value)}
            />
          </Group>

          <Stack gap="xs">
            <Group grow align="start">
              <NumberInput
                label="Additional Costs (€)"
                min={0}
                description="e.g. Heating, Water, etc."
                value={formData.additionalCosts}
                onChange={(value) => handleInputChange("additionalCosts", value)}
              />
              <NumberInput
                label="Total Rent (€)"
                value={formData.totalRent}
                error={errors.totalRent}
                readOnly
                description="Cold Rent + Additional Costs."
              />
            </Group>
            <Checkbox
              label="Heating included in Additional Costs"
              checked={formData.heatingIncludedInAdditionalCosts}
              onChange={() => handleCheckboxChange("heatingIncludedInAdditionalCosts")}
            />
          </Stack>
        </SimpleGrid>

        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
          }}
        >
          <DateInput
            label="Available From"
            minDate={new Date()}
            valueFormat="YYYY-MM-DD"
            placeholder="YYYY-MM-DD"
            error={errors.availableFrom}
            onChange={(value) => handleInputChange("availableFrom", value ? value.toISOString().substring(0, 10) : "")}
          />
          <Group grow align="start">
            <NumberInput
              min={1}
              label="Rooms"
              value={formData.numberOfRooms}
              onChange={(value) => handleInputChange("numberOfRooms", value)}
            />
            <NumberInput
              min={0}
              label="Beds"
              value={formData.numberOfBeds}
              onChange={(value) => handleInputChange("numberOfBeds", value)}
            />
            <NumberInput
              min={0}
              label="Baths"
              value={formData.numberOfBaths}
              onChange={(value) => handleInputChange("numberOfBaths", value)}
            />
          </Group>
          <Group grow align="start">
            <NumberInput
              min={1}
              label="Total Floors"
              value={formData.totalFloors}
              onChange={(value) => handleInputChange("totalFloors", value)}
            />
            <NumberInput
              min={0}
              label="Floor Number"
              value={formData.floorNumber}
              onChange={(value) => handleInputChange("floorNumber", value)}
            />
            <NumberInput
              min={0}
              label="Living Space (sqm)"
              value={formData.livingSpaceSqm}
              onChange={(value) => handleInputChange("livingSpaceSqm", value)}
            />
          </Group>
          <Group grow align="start">
            <YearPickerInput
              label="Year Built"
              maxDate={new Date()}
              valueFormat="YYYY"
              placeholder="YYYY"
              error={errors.yearBuilt}
              value={formData.yearBuilt ? new Date(formData.yearBuilt) : null}
              onChange={(value) => {
                handleInputChange("yearBuilt", value ? value.getFullYear().toString() : "");
              }}
            />
            <NumberInput
              label="Notice Period (months)"
              min={0}
              value={formData.noticePeriodInMonths}
              onChange={(value) => handleInputChange("noticePeriodInMonths", value)}
            />
          </Group>
          <Group grow align="start">
            <NumberInput
              label="Minimum Lease Term (months)"
              min={0}
              value={formData.minimumLeaseTermInMonths}
              onChange={(value) => handleInputChange("minimumLeaseTermInMonths", value)}
            />
            <NumberInput
              label="Maximum Lease Term (months)"
              min={0}
              value={formData.maximumLeaseTermInMonths}
              onChange={(value) => handleInputChange("maximumLeaseTermInMonths", value)}
            />
          </Group>
        </SimpleGrid>

        <Paper p="sm" withBorder>
          <Title order={6} mb="xs">
            Amenities
          </Title>
          <SimpleGrid
            mb="xs"
            cols={{
              base: 1,
              xs: 2,
              sm: 3,
              md: 4,
              lg: 5,
            }}
          >
            <Checkbox label="Pets Allowed" checked={formData.pets} onChange={() => handleCheckboxChange("pets")} />
            <Checkbox
              label="Smoking Allowed"
              checked={formData.smoking}
              onChange={() => handleCheckboxChange("smoking")}
            />
            <Checkbox label="Kitchen" checked={formData.kitchen} onChange={() => handleCheckboxChange("kitchen")} />
            <Checkbox
              label="Furnished"
              checked={formData.furnished}
              onChange={() => handleCheckboxChange("furnished")}
            />
            <Checkbox label="Balcony" checked={formData.balcony} onChange={() => handleCheckboxChange("balcony")} />
            <Checkbox label="Cellar" checked={formData.cellar} onChange={() => handleCheckboxChange("cellar")} />
            <Checkbox
              label="Washing Machine"
              checked={formData.washingMachine}
              onChange={() => handleCheckboxChange("washingMachine")}
            />
            <Checkbox label="Elevator" checked={formData.elevator} onChange={() => handleCheckboxChange("elevator")} />
            <Checkbox label="Garden" checked={formData.garden} onChange={() => handleCheckboxChange("garden")} />
            <Checkbox label="Parking" checked={formData.parking} onChange={() => handleCheckboxChange("parking")} />
            <Checkbox label="Internet" checked={formData.internet} onChange={() => handleCheckboxChange("internet")} />
            <Checkbox label="Cable TV" checked={formData.cableTv} onChange={() => handleCheckboxChange("cableTv")} />
          </SimpleGrid>
        </Paper>

        <Button fullWidth color="green" onClick={handleSubmit} radius="md" size="lg" my="xl">
          Submit for review
        </Button>
      </Stack>
    </Container>
  );
};
