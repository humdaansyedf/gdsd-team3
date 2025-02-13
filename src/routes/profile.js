import express from "express";
import multer from "multer";
import { uploadObject } from "../lib/s3.js"; // Adjust path if needed
import { prisma } from "../prisma/index.js"; // Adjust path if needed
import { authMiddleware } from "./auth.js"; // Use the existing auth middleware

const upload = multer();
const profileRouter = express.Router();

profileRouter.put("/profile", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  const userId = req.user.id;
  const { name, phone, address } = req.body;
  let profilePictureUrl = req.user.profilePicture;

  try {
    // Upload new profile picture if provided
    if (req.file) {
      const s3Key = `profile-pictures/${userId}-${Date.now()}-${req.file.originalname}`;

      await uploadObject({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      profilePictureUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
    }

    // Update user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address,
        profilePicture: profilePictureUrl,
      },
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

export { profileRouter };
