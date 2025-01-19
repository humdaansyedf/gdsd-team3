import { Router } from "express";
import { prisma } from "../prisma/index.js";
import { authMiddleware } from "./auth.js";

export const wishlistRouter = Router();

// Middleware to ensure only authenticated users can access these routes
wishlistRouter.use(authMiddleware);

// Get user's wishlist
wishlistRouter.get("/wishlist", async (req, res) => {
  if (req.user.type !== "STUDENT") {
    return res.status(403).json({ message: "Only students can access wishlist" });
  }

  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          include: { media: true }, // Ensure media is included
        },
      },
    });

    res.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
});

// Add property to wishlist
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

// Remove property from wishlist
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