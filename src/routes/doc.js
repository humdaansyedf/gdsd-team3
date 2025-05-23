import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";
import express from "express";
import { z } from "zod";
import { deleteImageFromS3 } from "../lib/s3.js";

const prisma = new PrismaClient();
export const documentRouter = express.Router();

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_DOCUMENT_TYPES = ["pdf", "doc", "docx", "txt"];

const uploadDocumentSchema = z.object({
  name: z
    .string()
    .min(2)
    .refine(
      (val) => {
        const parts = val.split(".");
        const extension = parts[parts.length - 1].toLowerCase();
        return ALLOWED_DOCUMENT_TYPES.includes(extension);
      },
      {
        message: `Invalid document type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`,
      },
    ),
});

// Generate Pre-Signed URL for Upload
documentRouter.post("/document", async (req, res) => {
  console.log("Received Upload Request:", req.body);
  console.log("User ID:", req.user ? req.user.id : "No user data");

  const data = req.body;
  console.log("User Info:", req.user);
  const result = uploadDocumentSchema.safeParse(data);

  if (!result.success) {
    console.error("Invalid document data:", result.error.errors);
    return res
      .status(400)
      .json({ message: "Invalid document data", errors: result.error.errors });
  }

  const { name } = result.data;
  const userId = req.user.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized. User ID is missing." });
  }

  const key = `user/${userId}/${Date.now()}-${name}`;
  console.log("Generated S3 Key:", key);

  try {
    const url = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.APP_AWS_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 5 },
    );
    console.log("Generated S3 Signed URL:", url);

    const document = await prisma.document.create({
      data: { userId, fileName: name, key, url },
    });

    res.json({ message: "Document upload URL created", data: { url, key } });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
});

documentRouter.get("/document", async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ message: "Key is required" });
  }

  try {
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.APP_AWS_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 5 }, // 5 minutes
    );
    res.json({ url });
  } catch (error) {
    console.error("Error generating download URL:", error);
    res.status(500).json({ message: "Failed to generate download URL" });
  }
});

// Delete Document
documentRouter.delete("/document", async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ message: "S3 key is required" });
  }

  const userId = req.user.id;
  const document = await prisma.document.findUnique({ where: { key } });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.userId !== userId) {
    return res
      .status(403)
      .json({ message: "Unauthorized: You can only delete your own files." });
  }

  try {
    await deleteImageFromS3(key);
    await prisma.document.delete({ where: { key } });
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Failed to delete document" });
  }
});

// Updated Route: Get All Documents for a User (Without Signed URLs)
documentRouter.get("/documents", async (req, res) => {
  const userId = req.user.id;
  if (req.user.type !== "STUDENT") {
    return res
      .status(403)
      .json({ message: "Access denied. Only students can access this." });
  }

  try {
    const documents = await prisma.document.findMany({ where: { userId } });
    res.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Failed to retrieve documents" });
  }
});

documentRouter.post("/document/share", async (req, res) => {
  const { key } = req.body;
  const userId = req.user.id;

  if (!key) {
    return res.status(400).json({ message: "Document key is required" });
  }

  const document = await prisma.document.findUnique({
    where: { key },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.userId !== userId) {
    return res
      .status(403)
      .json({ message: "Unauthorized: You can only share your own files." });
  }

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.APP_AWS_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 60 },
    );

    res.json({ message: "Generated shareable URL", url: signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ message: "Failed to generate shareable link" });
  }
});
