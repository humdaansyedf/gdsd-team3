import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
  name: z.string().min(2).refine(
    (val) => {
      const parts = val.split(".");
      const extension = parts[parts.length - 1].toLowerCase();
      return ALLOWED_DOCUMENT_TYPES.includes(extension);
    },
    {
      message: `Invalid document type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`,
    }
  ),
});

// Generate Pre-Signed URL for Upload
documentRouter.post("/document", async (req, res) => {
  const data = req.body;
  const result = uploadDocumentSchema.safeParse(data);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid document data", errors: result.error.errors });
  }

  const { name } = result.data;
  const userId = req.user.id;
  const key = `user/${userId}/${Date.now()}-${name}`;

  try {
    const url = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.APP_AWS_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 5 }
    );

    const document = await prisma.document.create({
      data: { userId, fileName: name, key },
    });

    res.json({ message: "Document upload URL created", data: { url, key } });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
});

// Generate Pre-Signed URL for Download
documentRouter.get("/document/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.APP_AWS_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 5 }
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
    return res.status(403).json({ message: "Unauthorized: You can only delete your own files." });
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

// Get All Documents for a User
documentRouter.get("/documents", async (req, res) => {
  const userId = req.user.id;
  if (req.user.type !== "STUDENT") {
    return res.status(403).json({ message: "Access denied. Only students can access this." });
  }

  try {
    const documents = await prisma.document.findMany({ where: { userId } });
    const signedDocs = await Promise.all(
      documents.map(async (doc) => {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: process.env.APP_AWS_BUCKET_NAME,
            Key: doc.key,
          }),
          { expiresIn: 60 * 5 }
        );
        return { ...doc, url };
      })
    );
    res.json({ documents: signedDocs });
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
    return res.status(403).json({ message: "Unauthorized: You can only share your own files." });
  }

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.APP_AWS_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 * 60 } // 1-hour expiry
    );

    res.json({ message: "Generated shareable URL", url: signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ message: "Failed to generate shareable link" });
  }
});
