import express from "express";
import { z } from "zod";
import { prisma } from "../prisma/index.js";
import { deleteImageFromS3 } from "../lib/s3.js";

export const creatorRouter = express.Router();

const propertySchema = z.object({
  // status and type
  status: z.enum(["DRAFT", "PENDING"]),
  propertyType: z.enum(["APARTMENT", "HOUSE", "ROOM", "STUDIO", "SHARED_ROOM"]),
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  // location and address
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  // price and costs
  coldRent: z.number().min(0),
  additionalCosts: z.number().min(0).optional(),
  heatingIncludedInAdditionalCosts: z.boolean().default(false),
  deposit: z.number().min(0).optional(),
  // rooms and space
  numberOfRooms: z.number().min(1),
  numberOfBeds: z.number().min(0).optional(),
  numberOfBaths: z.number().min(0).optional(),
  totalFloors: z.number().min(1).optional(),
  floorNumber: z.number().min(0).optional(),
  livingSpaceSqm: z.number().min(1).optional(),
  yearBuilt: z.string().length(4).optional(),
  // availability and lease terms
  availableFrom: z.string().date(),
  minimumLeaseTermInMonths: z.number().min(1).optional(),
  maximumLeaseTermInMonths: z.number().min(1).optional(),
  noticePeriodInMonths: z.number().min(1).optional(),
  // amenities
  pets: z.boolean().default(false),
  smoking: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  furnished: z.boolean().default(false),
  balcony: z.boolean().default(false),
  cellar: z.boolean().default(false),
  washingMachine: z.boolean().default(false),
  elevator: z.boolean().default(false),
  garden: z.boolean().default(false),
  parking: z.boolean().default(false),
  internet: z.boolean().default(false),
  cableTv: z.boolean().default(false),
});

const createPropertySchema = propertySchema.extend({
  media: z
    .object({
      url: z.string().url(),
    })
    .array()
    .min(1)
    .max(15),
  creatorComment: z.string().optional(),
});

// Create a new property
creatorRouter.post("/property", async (req, res) => {
  const data = req.body; // Parse request body
  const result = createPropertySchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const user = req.user;

  try {
    const { media, ...propertyData } = result.data;
    const totalRent = propertyData.coldRent + (propertyData.additionalCosts || 0);
    const availableFrom = new Date(propertyData.availableFrom);

    const isSublet = req.user.type === "STUDENT";

    const property = await prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          ...propertyData,
          availableFrom,
          totalRent,
          creatorId: user.id,
          isSublet: isSublet,
        },
      });

      const propertyMedia = media.map(({ url }) => {
        const name = url.split("amazonaws.com/")[1];
        return {
          propertyId: property.id,
          status: "PENDING",
          type: "IMAGE",
          url,
          name,
        };
      });
      await tx.propertyMedia.createMany({
        data: propertyMedia,
      });

      return property;
    });

    res.json({
      message: "Property created",
      data: { id: property.id },
    });
  } catch (error) {
    //Rollback Media from S3 (i.e delete all files in the media array using DeleteObjectCommand)
    console.error("Property creation failed:", error);
    if (data.media) {
      for (const { url } of data.media) {
        const key = url.split("amazonaws.com/")[1];
        await deleteImageFromS3(key);
      }
    }
    res.status(500).json({
      message: "Failed to create property",
    });
  }
});

// Get all properties of the landlord
creatorRouter.post("/property/search", async (req, res) => {
  const user = req.user; // Ensure this contains the landlord's ID
  const { title, status, minPrice, maxPrice } = req.body;

  const where = {
    creatorId: user.id, // Ensure only properties belonging to the landlord are returned
  };

  if (title) {
    where.title = {
      contains: title,
    };
  }

  if (status && status !== "All") {
    where.status = status;
  }

  if (minPrice || maxPrice) {
    where.totalRent = {
      gte: parseInt(minPrice) || 0,
      lte: parseInt(maxPrice) || 99999999,
    };
  }

  try {
    const properties = await prisma.property.findMany({
      where,
      include: {
        media: true,
      },
    });

    res.json(
      properties.map((property) => ({
        ...property,
        media:
          property.media.length > 0
            ? property.media[0].url
            : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
      }))
    );
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

// Get stats
creatorRouter.get("/dashboard/stats", async (req, res) => {
  const user = req.user;

  const [allAdsCount, activeAdsCount, pendingAdsCount] = await Promise.all([
    prisma.property.count({
      where: {
        creatorId: user.id,
      },
    }),
    prisma.property.count({
      where: {
        creatorId: user.id,
        status: "ACTIVE",
      },
    }),
    prisma.property.count({
      where: {
        creatorId: user.id,
        status: "PENDING",
      },
    }),
  ]);

  res.json({
    allAds: allAdsCount,
    activeAds: activeAdsCount,
    pendingAds: pendingAdsCount,
  });
});

// Get a single property of the landlord
creatorRouter.get("/property/:id", async (req, res) => {
  const user = parseInt(req.user);
  const id = parseInt(req.params.id);

  const property = await prisma.property.findFirst({
    where: {
      id,
      creatorId: user.id,
    },
    include: {
      media: true,
    },
  });

  if (!property) {
    return res.status(404).json({
      message: "Property not found",
    });
  }

  res.json({
    data: property,
  });
});

// Update a property of the landlord
creatorRouter.put("/property/:id", async (req, res) => {
  const data = req.body; // Parse request body
  const result = createPropertySchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const id = parseInt(req.params.id);
  const user = req.user;

  if (!user || !user.id) {
    return res.status(403).json({ message: "Unauthorized: No user ID found" });
  }

  if (!id) {
    return res.status(400).json({ message: "Invalid property ID" });
  }

  try {
    const { media, ...propertyData } = result.data;
    const totalRent = propertyData.coldRent + (propertyData.additionalCosts || 0);
    const availableFrom = new Date(propertyData.availableFrom);
    const where = {
        id,
        creatorId: user.id
      };
    console.log("Received Request Body:", req.body);
    console.log("Updating Property:", where);
    console.log("Available From:", availableFrom);
    console.log("Property Data:", propertyData);
    console.log("Media Data:", media);
    const isSublet = req.user.type === "STUDENT";
    console.log(media);
    const property = await prisma.$transaction(async (tx) => {
      const updatedProperty = await tx.property.update({
        where,
        data: {
          ...propertyData,
          availableFrom,
          totalRent,
          isSublet,
        },
      });

      console.log("Media Data Before Update:", media);
      // Step 2: Handle Image Upload (Only if media is provided)
      if (Array.isArray(media) && media.length > 0) {
        console.log("Updating media for property:", id);

        // Step 2a: Delete Old Images (Optional: If replacing images)
        await tx.propertyMedia.deleteMany({
          where: { propertyId: id },
        });

        // Step 2b: Add New Images
        const propertyMedia = media.map(({ url }) => {
          const name = url.split("amazonaws.com/")[1]; // Extract filename
          return {
            propertyId: updatedProperty.id,
            status: "PENDING",
            type: "IMAGE",
            url,
            name,
          };
        });

        await tx.propertyMedia.createMany({
          data: propertyMedia,
        });
      }

      return updatedProperty;
    });

    res.json({
      message: "Property updated successfully",
      data: { id: property.id },
    });
  } catch (error) {
    console.error("Property update failed:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a property of the landlord
creatorRouter.delete("/property/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.user;

  try {
    await prisma.property.delete({
      where: {
        id,
        creatorId: user.id,
      },
    });

    res.json({
      message: "Property deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete property",
    });
  }
});

const propertyStatusSchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "RENTED", "ARCHIVED"]),
});

// Update the status of a property
creatorRouter.patch("/property/:id/status", async (req, res) => {
  const data = req.body; // Parse request body
  const result = propertyStatusSchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const id = req.params.id;
  const user = req.user;

  try {
    const property = await prisma.property.update({
      where: {
        id,
        creatorId: user.id,
      },
      data: {
        status: result.data.status,
      },
    });

    res.json({
      message: "Property status updated",
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update property status",
    });
  }
});

const propertyMediaSchema = z.object({
  url: z.string().url(),
});

// Add a media to a property
creatorRouter.post("/property/:id/media", async (req, res) => {
  const data = req.body; // Parse request body
  const result = propertyMediaSchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const id = parseInt(req.params.id);
  const user = req.user;

  const property = await prisma.property.findFirst({
    where: {
      id,
      creatorId: user.id,
    },
  });

  if (!property) {
    return res.status(404).json({
      message: "Property not found",
    });
  }

  try {
    const propertyMedia = await prisma.propertyMedia.create({
      data: {
        propertyId: property.id,
        status: "PENDING",
        url: result.data.url,
        name: result.data.url.split("amazonaws.com/")[1],
      },
    });

    res.json({
      message: "Media added",
      data: propertyMedia,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add media",
    });
  }
});

// Delete a media from a property
creatorRouter.delete("/property/:propertyId/media/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.user;

  try {
    // Verify the property exists and belongs to the landlord
    const property = await prisma.property.findFirst({
      where: {
        id,
        creatorId: user.id,
      },
    });

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Retrieve the media to get the S3 key (file URL)
    const media = await prisma.propertyMedia.findUnique({
      where: { id: id },
    });

    if (!media) {
      return res.status(404).json({
        message: "Media not found",
      });
    }

    // Extract file key from the S3 URL
    const key = media.url.split("amazonaws.com/")[1];

    // Step 1: Delete media from S3
    await deleteImageFromS3(key);

    // Step 2: Delete the database entry
    await prisma.propertyMedia.delete({
      where: {
        id: id,
      },
    });

    res.json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete media:", error);
    res.status(500).json({
      message: "Failed to delete media",
    });
  }
});
