import { Router } from "express";
import { prisma } from "../prisma/index.js";
import { authMiddleware } from "./auth.js";

export const wishlistRouter = Router();

wishlistRouter.use(authMiddleware);

wishlistRouter.get("/wishlist", async (req, res) => {
  if (req.user.type !== "STUDENT") {
    return res.status(403).json({ message: "Only students can access wishlist" });
  }

  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          include: { media: true },
        },
      },
    });

    res.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
});

wishlistRouter.post("/wishlist", async (req, res) => {
  const { propertyId } = req.body;

  if (req.user.type !== "STUDENT") {
    return res.status(403).json({ message: "Only students can add to wishlist" });
  }

  try {
    await prisma.wishlist.create({
      data: { userId: req.user.id, propertyId },
    });
    res.json({ message: "Property added to wishlist" });
  } catch (error) {
    console.error("Error adding property to wishlist:", error);
    res.status(500).json({ message: "Error adding property to wishlist", error: error.message });
  }
});

wishlistRouter.patch("/wishlist/:propertyId/note", async (req, res) => {
  const { propertyId } = req.params;
  const { note } = req.body;

  // Only students can update the note
  if (req.user.type !== "STUDENT") {
    return res
      .status(403)
      .json({ message: "Only students can update wishlist notes" });
  }

  // propertyId in your DB is likely an integer
  const propertyIdNum = Number(propertyId);

  try {
    // Update the note field for the matching wishlist entry
    const updated = await prisma.wishlist.updateMany({
      where: {
        userId: req.user.id,
        propertyId: propertyIdNum,
      },
      data: { note },
    });

    // updateMany returns count of rows updated
    if (updated.count === 0) {
      return res
        .status(404)
        .json({ message: "No wishlist entry found to update" });
    }

    res.json({
      message: "Wishlist note updated successfully",
      note: note,
    });
  } catch (error) {
    console.error("Error updating wishlist note:", error);
    res.status(500).json({
      message: "Error updating wishlist note",
      error: error.message,
    });
  }
});

wishlistRouter.delete("/wishlist/:propertyId", async (req, res) => {
  const { propertyId } = req.params;

  if (req.user.type !== "STUDENT") {
    return res.status(403).json({ message: "Only students can remove from wishlist" });
  }

  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, propertyId: Number(propertyId) },
    });
    res.json({ message: "Property removed from wishlist" });
  } catch (error) {
    console.error("Error removing property from wishlist:", error);
    res.status(500).json({ message: "Error removing property from wishlist", error: error.message });
  }
});