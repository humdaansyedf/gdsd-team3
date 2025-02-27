import { useEffect, useRef, useState } from "react";
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
import { useForm } from "@mantine/form";
import { ImageUploader } from "../../components/ImageUploader/ImageUploader";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DateInput, YearPickerInput } from "@mantine/dates";
import { PriceRecommendationModal } from "../../components/PriceRecommendationModal/PriceRecommendationModal.jsx";
import { useDisclosure } from "@mantine/hooks";

const libraries = ["places"];

export const EditAdPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({});
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [recommendedPrice, setRecommendedPrice] = useState(null);
  const [finalPayload, setFinalPayload] = useState(null); // Store predicted price

  const form = useForm({
    initialValues: {}, // Initialized dynamically after fetching
    validate: {
      title: (value) =>
        value?.trim().length < 5 || value.trim().length > 100 ? "Title must be between 5 and 100 characters." : null,
      propertyType: (value) => (!value ? "Property Type is required" : null),
      description: (value) =>
        value?.trim().length < 10 || value.trim().length > 2000
          ? "Description must be between 10 and 2000 characters."
          : null,
      address1: (value) => (!value || !value.trim() ? "Address is required" : null),
      coldRent: (value) => (value <= 0 ? "Cold Rent must be greater than 0" : null),
      totalRent: (value) => (value <= 0 ? "Total Rent must be greater than 0" : null),
      additionalCosts: (value) => (value < 0 ? "Additional Costs cannot be negative" : null),
      deposit: (value) => (value < 0 ? "Deposit cannot be negative" : null),
      numberOfRooms: (value) => (value < 1 ? "Number of Rooms must be at least 1" : null),
      numberOfBeds: (value) => (value < 0 ? "Number of Beds cannot be negative" : null),
      numberOfBaths: (value) => (value < 0 ? "Number of Baths cannot be negative" : null),
      livingSpaceSqm: (value) => (value <= 0 ? "Living Space must be greater than 0" : null),
      availableFrom: (value) => (!value ? "Available From date is required" : null),
      yearBuilt: (value) => (value && isNaN(Number(value)) ? "Year Built must be a valid year" : null),
      media: (value) => (value.length === 0 ? "At least one image must be uploaded." : null),
    },
  });

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const response = await axios.get(`/api/property/${id}`);
        const propertyData = response.data.data;
        const parsedData = {
          ...propertyData,
          availableFrom: propertyData.availableFrom ? new Date(propertyData.availableFrom) : null,
          yearBuilt: propertyData.yearBuilt === "0000" ? null : propertyData.yearBuilt,
        };
        form.setValues(parsedData);
        setInitialData(parsedData);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch property data:", error);
        alert("Failed to load property data. Please try again later.");
      }
    };
    fetchPropertyData();
  }, [id]);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        form.setFieldValue("address1", place.formatted_address);
        form.setFieldValue("latitude", place.geometry.location.lat());
        form.setFieldValue("longitude", place.geometry.location.lng());

        place.address_components.forEach((component) => {
          const types = component.types;

          if (types.includes("postal_code")) {
            form.setFieldValue("postcode", component.long_name);
          }
          if (types.includes("locality")) {
            form.setFieldValue("city", component.long_name);
          }
          if (types.includes("administrative_area_level_1")) {
            form.setFieldValue("state", component.long_name);
          }
        });
      }
    }
  };

  const handleImageUpload = (uploadedUrl) => {
    form.setFieldValue("media", [...(form.values.media || []), { url: uploadedUrl }]);
    //form.setFieldValue("media", [...form.values.media, { url: uploadedUrl }]);
  };

  const handleImageDelete = (deletedUrl) => {
    const updatedMedia = form.values.media.filter((image) => image.url !== deletedUrl);
    form.setFieldValue("media", updatedMedia);
    console.log("Updated Media After Deletion:", updatedMedia);
  };

  const fetchRecommendedPrice = async (values) => {
    const payload = {
      balcony: values.balcony,
      hasKitchen: values.kitchen,
      lift: values.elevator,
      livingSpace: values.livingSpaceSqm,
      noRooms: values.numberOfRooms,
      numberOfYear: values.yearBuilt ? 2025 - parseInt(values.yearBuilt) : 1920,
    };

    try {
      const response = await axios.post("/predict-rent", payload);
      console.log("Prediction Response:", response.data);
      setRecommendedPrice(response.data.predicted_price);
      form.setFieldValue("recommendedPrice", response.data.predicted_price);
    } catch (error) {
      console.error("Prediction Error:", error);
      alert("Failed to predict price. Please try again.");
    }
  };

  const handleSubmit = async (values) => {
    // Only include fields that have changed or are not null/undefined
    const updatedFields = Object.keys(values).reduce((acc, key) => {
      if (values[key] !== initialData[key] && values[key] != null) {
        acc[key] = values[key];
      }
      return acc;
    }, {});

    // Add fields that are required by the backend but not included in the updatedFields
    const requiredFields = [
      "status",
      "propertyType",
      "title",
      "description",
      "numberOfRooms",
      "coldRent",
      "availableFrom",
      "longitude",
      "latitude",
    ];
    requiredFields.forEach((field) => {
      if (!(field in updatedFields)) {
        updatedFields[field] = values[field] || initialData[field];
      }
    });

    const payload = {
      ...updatedFields,
      status: "PENDING",
      availableFrom: values.availableFrom
        ? values.availableFrom.toISOString().substring(0, 10) // Convert to YYYY-MM-DD
        : null,
      media: updatedFields.media
        ? updatedFields.media.map((item) => ({ url: item.url }))
        : initialData.media.map((item) => ({ url: item.url })),
      yearBuilt: values.yearBuilt
        ? new Date(values.yearBuilt).getFullYear().toString() // Keep valid year as string
        : "0000", // Fallback value
    };
    await fetchRecommendedPrice(values);
    setFinalPayload(payload);
    openModal();
  };

  const submitAfterConfirmation = async (payload) => {
    try {
      console.log("Final Payload for Submission:", payload);
      await axios.put(`/api/property/${id}`, payload);
      closeModal();
      navigate("/property/submission-confirmation");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      alert("Failed to update property. Please try again.");
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Container px={0}>
      <Title order={2}>Update Property Listing</Title>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack mt="lg" gap="lg">
          <div>
            <ImageUploader
              onUpload={handleImageUpload}
              onDelete={handleImageDelete}
              existingImages={form.values.media ? form.values.media.map((media) => media.url) : []}
            />
            {form.errors.media && (
              <Text size="xs" c="red" mt={4}>
                {form.errors.media}
              </Text>
            )}
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="Ad Title" placeholder="Enter Ad Title" withAsterisk {...form.getInputProps("title")} />
            <Select
              label="Property Type"
              placeholder="Select Property Type"
              withAsterisk
              data={[
                { value: "APARTMENT", label: "Apartment" },
                { value: "HOUSE", label: "House" },
                { value: "STUDIO", label: "Studio" },
                { value: "ROOM", label: "Room" },
                { value: "SHARED_ROOM", label: "Shared Room" },
              ]}
              {...form.getInputProps("propertyType")}
            />
          </SimpleGrid>

          <Textarea
            label="Description"
            placeholder="Enter Description"
            withAsterisk
            autosize
            minRows={3}
            {...form.getInputProps("description")}
          />

          <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
            <Autocomplete
              options={{ componentRestrictions: { country: "de" } }}
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceChanged}
            >
              <TextInput label="Address" withAsterisk {...form.getInputProps("address1")} />
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
                withAsterisk
                {...form.getInputProps("coldRent")}
              />
              <NumberInput
                label="Deposit (€)"
                min={0}
                description="Base rent"
                withAsterisk
                {...form.getInputProps("deposit")}
              />
            </Group>

            <Stack gap="xs">
              <Group grow align="start">
                <NumberInput
                  label="Additional Costs (€)"
                  description="e.g. Heating, Water, etc."
                  min={0}
                  {...form.getInputProps("additionalCosts")}
                />
                <NumberInput
                  label="Total Rent (€)"
                  withAsterisk
                  readOnly
                  description="Cold Rent + Additional Costs."
                  value={form.values.coldRent + (form.values.additionalCosts || 0)}
                />
              </Group>
              <Checkbox
                label="Heating included in Additional Costs"
                {...form.getInputProps("heatingIncludedInAdditionalCosts", {
                  type: "checkbox",
                })}
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
              withAsterisk
              value={form.values.availableFrom} // Ensure value is a Date object
              onChange={(value) => {
                form.setFieldValue("availableFrom", value); // Set the raw Date object
              }}
              error={form.errors.availableFrom}
            />
            <Group grow align="start">
              <NumberInput label="Rooms" min={1} withAsterisk {...form.getInputProps("numberOfRooms")} />
              <NumberInput label="Beds" min={0} withAsterisk {...form.getInputProps("numberOfBeds")} />
              <NumberInput min={0} label="Baths" withAsterisk {...form.getInputProps("numberOfBaths")} />
            </Group>
            <Group grow align="start">
              <NumberInput min={1} label="Total Floors" {...form.getInputProps("totalFloors")} />
              <NumberInput min={0} label="Floor Number" {...form.getInputProps("floorNumber")} />
              <NumberInput min={0} label="Living Space (sqm)" withAsterisk {...form.getInputProps("livingSpaceSqm")} />
            </Group>
            <Group grow align="start">
              <YearPickerInput
                label="Year Built"
                maxDate={new Date()}
                valueFormat="YYYY"
                placeholder="YYYY"
                value={form.values.yearBuilt ? new Date(`${form.values.yearBuilt}-01-01`) : null}
                onChange={(value) => {
                  form.setFieldValue("yearBuilt", value ? value.getFullYear().toString() : null);
                }}
              />
              <NumberInput label="Notice Period (months)" min={0} {...form.getInputProps("noticePeriodInMonths")} />
            </Group>
            <Group grow align="start">
              <NumberInput
                label="Minimum Lease Term (months)"
                min={0}
                {...form.getInputProps("minimumLeaseTermInMonths")}
              />
              <NumberInput
                label="Maximum Lease Term (months)"
                min={0}
                {...form.getInputProps("maximumLeaseTermInMonths")}
              />
            </Group>
          </SimpleGrid>

          <Paper p="sm" withBorder>
            <Title order={6} mb="xs">
              Amenities
            </Title>
            <SimpleGrid
              cols={{
                base: 1,
                xs: 2,
                sm: 3,
                md: 4,
                lg: 5,
              }}
            >
              {[
                { label: "Pets Allowed", field: "pets" },
                { label: "Smoking Allowed", field: "smoking" },
                { label: "Kitchen", field: "kitchen" },
                { label: "Furnished", field: "furnished" },
                { label: "Balcony", field: "balcony" },
                { label: "Cellar", field: "cellar" },
                { label: "Washing Machine", field: "washingMachine" },
                { label: "Elevator", field: "elevator" },
                { label: "Garden", field: "garden" },
                { label: "Parking", field: "parking" },
                { label: "Internet", field: "internet" },
                { label: "Cable TV", field: "cableTv" },
              ].map((amenity) => (
                <Checkbox
                  key={amenity.field}
                  label={amenity.label}
                  {...form.getInputProps(amenity.field, { type: "checkbox" })}
                />
              ))}
            </SimpleGrid>
          </Paper>
          <Textarea
            label="Creator comment"
            placeholder="Add any additional comments for the admin"
            autosize
            minRows={3}
            {...form.getInputProps("creatorComment")}
          />
          <Button fullWidth color="green" type="submit" radius="md" size="lg" my="xl">
            Submit for review
          </Button>
          <PriceRecommendationModal
            isOpen={isModalOpen}
            onClose={closeModal}
            recommendedPrice={recommendedPrice}
            form={form}
            setFinalPayload={setFinalPayload}
            submitAfterConfirmation={submitAfterConfirmation}
          />
        </Stack>
      </form>
    </Container>
  );
};
