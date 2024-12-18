import express from "express";
import { deleteImageFromS3 } from "../lib/s3.js";

export const fileDeleteRouter = express.Router();

fileDeleteRouter.delete("/file", async (req, res) => {
    const { key } = req.body; // Get the S3 key from request body

    if (!key) {
      return res.status(400).json({ message: "S3 key is required" });
    }

  try {
    
    await deleteImageFromS3(key); // Call S3 deletion function
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Failed to delete file" });
  }
});