import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { notifications } from "@mantine/notifications";

// Zod schema for validating the response
const publicFileUploadSchema = z.object({
  data: z.object({
    url: z.string().min(1), // Ensures `url` is a non-empty string
  }),
});

export const usePublicFileUpload = () => {
  return useMutation({
    mutationFn: async ({ file }) => {
      try {
        // Step 1: Get signed URL from the backend
        const res = await axios.post("/api/file", { name: file.name });

        // Step 2: Validate the response with zod
        const result = publicFileUploadSchema.parse(res.data);

        // Step 3: Upload the file to S3 using the signed URL
        const url = result.data.url;
        await axios.put(url, file, {
          headers: { "Content-Type": file.type },
        });

        // Step 4: Return the uploaded file URL
        return url.split("?")[0];
      } catch (error) {
        console.error("File upload error:", error);
        throw error;
      }
    },

    onError: (error) => {
      notifications.show({ message: "File Upload Error", color: "red" });
      console.error(error);
    },
  });
};