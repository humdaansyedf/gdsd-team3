import { z } from "zod";
import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { deleteImageFromS3 } from "../lib/s3.js";

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_FILE_TYPES = ["png", "jpg", "jpeg"];

export const fileRouter = express.Router();

const uploadFileSchema = z.object({
  name: z
    .string()
    .min(2)
    .refine(
      (val) => {
        const parts = val.split(".");
        const extension = parts[parts.length - 1].toLowerCase();
        return ALLOWED_FILE_TYPES.includes(extension);
      },
      {
        message: `Invalid file type. Allowed file types are: ${ALLOWED_FILE_TYPES.join(", ")}`,
      },
    ),
});

fileRouter.post("/file", async (req, res) => {
  const data = req.body;
  const result = uploadFileSchema.safeParse(data);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const { name } = result.data;
  const key = `${Date.now()}-${name}`;

  try {
    const url = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.APP_AWS_BUCKET_NAME,
        Key: `public/${key}`,
      }),
      { expiresIn: 60 * 5 },
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

fileRouter.delete("/file", async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ message: "S3 key is required" });
  }

  try {
    await deleteImageFromS3(key);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Failed to delete file" });
  }
});
