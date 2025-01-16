import { useState } from "react";
import { Text, Image, SimpleGrid, Button, Loader } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { usePublicFileUpload } from "./fileUpload";
import axios from "axios";
import { notifications } from "@mantine/notifications";

export const ImageUploader = ({ onUpload }) => {
  const [images, setImages] = useState([]); // State to hold uploaded images
  const fileUploadMutation = usePublicFileUpload(); // Mutation hook for uploading images
  const [loading, setLoading] = useState(false); // Loading state for file upload

  // Handle file uploads (using dropzone or manual selection)
  const handleFilesUpload = (files) => {
    setLoading(true);

    files.forEach((file) => {
      fileUploadMutation.mutate(
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
        },
      );
    });
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
      <Dropzone
        accept={IMAGE_MIME_TYPE}
        onDrop={handleFilesUpload}
        multiple
        disabled={loading}
      >
        {loading ? (
          <Loader />
        ) : (
          <Text ta="center" size="sm" color="dimmed">
            Drag & Drop images here or click to{" "}
            <span style={{ color: "blue" }}>Browse</span>
          </Text>
        )}
      </Dropzone>

      {/* Image Previews */}
      {images.length > 0 && (
        <SimpleGrid cols={4} mt="md">
          {images.map((image, index) => (
            <div key={index} style={{ position: "relative" }}>
              <Image
                src={image.url}
                alt={image.name}
                height={100}
                radius="sm"
                withPlaceholder
              />
              <Button
                size="xs"
                color="red"
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  padding: "0 6px",
                }}
                onClick={() => handleDeleteImage(index, image.url)}
              >
                &times;
              </Button>
            </div>
          ))}
        </SimpleGrid>
      )}
    </div>
  );
};
