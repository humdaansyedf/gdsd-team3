import { z } from "zod";
import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION, // AWS region
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID, // AWS access key
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY, // AWS secret key
  },
});

// Allowed file types
const ALLOWED_FILE_TYPES = ["png", "jpg", "jpeg"];

// Create Express Router
export const fileRouter = express.Router();

// Zod schema to validate incoming requests
const uploadFileSchema = z.object({
  name: z
    .string()
    .min(2) // Ensure file name is at least 2 characters
    .refine(
      (val) => {
        const parts = val.split(".");
        const extension = parts[parts.length - 1].toLowerCase();
        return ALLOWED_FILE_TYPES.includes(extension); // Validate file extension
      },
      {
        message: `Invalid file type. Allowed file types are: ${ALLOWED_FILE_TYPES.join(", ")}`,
      }
    ),
});

// Add the endpoint to the router
fileRouter.post("/file", async (req, res) => {
  const data = req.body; // Parse request body
  const result = uploadFileSchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const { name } = result.data;
  const key = `${Date.now()}-${name}`; // Generate unique file key

  try {
    // Generate signed URL for PUT request
    const url = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.APP_AWS_BUCKET_NAME, // S3 bucket name
        Key: `public/${key}`, // File key
      }),
      { expiresIn: 60 * 5 } // URL expiration time (5 minutes)
    );

    res.json({
      message: "File upload URL created",
      data: { url },
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({
      message: "Failed to generate upload URL",
    });
  }
});