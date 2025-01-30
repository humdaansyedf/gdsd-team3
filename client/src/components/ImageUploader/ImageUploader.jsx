import { useState, useEffect } from "react";
import { Text, Image, SimpleGrid, Loader, ActionIcon, Group } from "@mantine/core";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { usePublicFileUpload } from "./fileUpload";
import axios from "axios";
import { notifications } from "@mantine/notifications";

export const ImageUploader = ({ onUpload, existingImages = [] }) => {
  const [images, setImages] = useState([]); // State to hold uploaded images
  const fileUploadMutation = usePublicFileUpload(); // Mutation hook for uploading images
  const [loading, setLoading] = useState(false); // Loading state for file upload

  // Preload existing images on component mount
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      setImages(existingImages.map((url) => ({ name: "", url })));
    }
  }, [existingImages]);

  // Handle file uploads (using dropzone or manual selection)
  const handleFilesUpload = async (files) => {
    console.log(files);
    setLoading(true);

    // mutate one by one for awiat loop
    for await (const file of files) {
      await fileUploadMutation.mutateAsync(
        { file },
        {
          onSuccess: (uploadedUrl) => {
            // Add the uploaded file URL to state
            const newImage = { name: file.name, url: uploadedUrl };
            setImages((prevImages) => [...prevImages, newImage]);

            // Send uploaded URL to the parent component (CreateAdModal)
            if (onUpload) onUpload(uploadedUrl);

            notifications.show({
              title: "Success",
              message: `${file.name} uploaded successfully`,
              color: "green",
            });
          },
          onError: (error) => {
            console.log(error);
            console.error("Upload failed for", file.name, error);
            notifications.show({
              title: "Error",
              message: `Failed to upload ${file.name}`,
              color: "red",
            });
          },
          onSettled: () => {
            setLoading(false);
          },
        }
      );
    }
  };

  const handleDeleteImage = async (index, url) => {
    try {
      const key = url.split("amazonaws.com/")[1]; // Extract S3 key from URL
      // Call backend endpoint to delete the image from S3
      await axios
        .delete("/api/file", {
          data: { key }, // Send the file URL to identify and delete the S3 object
        })
        .then(() => {
          // Remove the image from the frontend state
          setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        });
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  return (
    <div>
      {/* Dropzone for selecting files */}
      <Dropzone accept={IMAGE_MIME_TYPE} onDrop={handleFilesUpload} multiple disabled={loading}>
        <Group justify="center" gap="xs" mih={120} style={{ pointerEvents: "none" }}>
          {loading ? (
            <Loader />
          ) : (
            <>
              <IconUpload size={40} color="var(--mantine-color-dimmed)" stroke={1.5} />
              <div>
                <Text inline>Drag images here or click to select files</Text>
                <Text size="xs" c="dimmed" inline mt={7}>
                  Attach as many files as you like, each file should not exceed 5mb
                </Text>
              </div>
            </>
          )}
        </Group>
      </Dropzone>

      {/* Image Previews */}
      {images.length > 0 && (
        <SimpleGrid
          cols={{
            base: 2,
            sm: 3,
            md: 4,
          }}
          spacing="xs"
          mt="md"
        >
          {images.map((image, index) => (
            <div key={index} style={{ position: "relative" }}>
              <Image
                src={image.url}
                alt={image.name}
                height={150}
                radius="sm"
                withPlaceholder
                bg="gray.2"
                style={{
                  objectFit: "contain",
                }}
              />
              <ActionIcon
                size="sm"
                color="red"
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                }}
                onClick={() => handleDeleteImage(index, image.url)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </div>
          ))}
        </SimpleGrid>
      )}
    </div>
  );
};
