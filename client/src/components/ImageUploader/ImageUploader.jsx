import { useState } from "react";
import { Text, Image, SimpleGrid, ActionIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconTrash } from "@tabler/icons-react";
import { usePublicFileUpload } from "./fileUpload";
import axios from "axios";

export function ImageUploader() {
  const [images, setImages] = useState([]);
  const fileUploadMutation = usePublicFileUpload();

  // Function to delete the image
  const deleteImage = async (index, url) => {
    try {
      const key = url.split("amazonaws.com/")[1]; // Extract S3 key from URL
      // Call backend endpoint to delete the image from S3
      await axios.delete("/api/file", {
        data: { key }, // Send the file URL to identify and delete the S3 object
      });

      // Remove the image from the frontend state
      setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

// Previews with delete button
  const previews = images.map((file, index) => (
    <div key={index} style={{ position: "relative" }}>
      <Image src={file.url} />
      <ActionIcon
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          backgroundColor: "white",
          borderRadius: "50%",
        }}
        onClick={() => deleteImage(index, file.url)} // Trigger delete
        title="Delete image"
        size="sm"
      >
        <IconTrash 
          size={16}
          color = "red" />
      </ActionIcon>
    </div>
  ));

  return (
    <div>
      <Dropzone
        accept={IMAGE_MIME_TYPE}
        onDrop={(files) => {
          files.forEach((file) => {
            fileUploadMutation.mutate(
              { file },
              {
                onSuccess: (uploadedUrl) => {
                  // Add uploaded file URL to the state
                  setImages((prevImages) => [...prevImages, { name: file.name, url: uploadedUrl }]);
                },
                onError: () => {
                  console.error(`Failed to upload ${file.name}`);
                },
              }
            );
          });
        }}
      >
        <Text ta="center">Drop images here or click to Browse</Text>
      </Dropzone>

      <SimpleGrid cols={{ base: 1, sm: 4 }} mt={previews.length > 0 ? "xl" : 0}>
        {previews}
      </SimpleGrid>
    </div>
  );
}