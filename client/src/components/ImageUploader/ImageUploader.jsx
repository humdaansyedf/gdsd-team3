import { useState } from 'react';
import { Text, Image, SimpleGrid } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';

export function ImageUploader() {
  const [images, setImages] = useState([]);
  const fileUploadMutation = usePublicFileUpload();
  const previews = images.map((file, index) => {
    return <Image key={index} src={file.url} />;
  });

  return (
    <div>
      <Dropzone accept={IMAGE_MIME_TYPE} onDrop={(files) => {files.forEach((file) => {
            fileUploadMutation.mutate(
              { file },
              {
                onSuccess: (uploadedUrl) => {
                  // Add uploaded file URL to the state
                  setImages((prevImages) => [
                    ...prevImages,
                    { name: file.name, url: uploadedUrl },
                  ]);
                },
                onError: () => {
                  console.error(`Failed to upload ${file.name}`);
                },
              })
          })
        }}>
        <Text ta="center">Drop images here</Text>
      </Dropzone>

      <SimpleGrid cols={{ base: 1, sm: 4 }} mt={previews.length > 0 ? 'xl' : 0}>
        {previews}
      </SimpleGrid>
    </div>
  );
}