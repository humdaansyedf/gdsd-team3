import express from "express";
import { z } from "zod";
import { prisma } from "../prisma/index.js";
import { deleteImageFromS3 } from "../lib/s3.js";

export const landlordRouter = express.Router();

landlordRouter.use((req, res, next) => {
  // Check if the user is a landlord
  if (req.user.type !== "LANDLORD") {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  next();
});

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
  availableFrom: z.string().datetime(),
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
});

// Create a new property
landlordRouter.post("/landlord/property", async (req, res) => {
  const data = req.body; // Parse request body
  const result = createPropertySchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const landlord = req.user;

  try {
    const { media, ...propertyData } = result.data;

    const property = await prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          ...propertyData,
          landlordId: landlord.id,
        },
      });

      const propertyMedia = media.map(({ url }) => {
        const name = url.split("amazonaws.com/")[1];
        return {
          propertyId: property.id,
          status: "PENDING",
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
landlordRouter.get("/landlord/property", async (req, res) => {
  const landlord = req.user;

  const properties = await prisma.property.findMany({
    where: {
      landlordId: landlord.id,
    },
    include: ["media"],
  });

  res.json(
    properties.map((property) => {
      // Get the first media item as the featured image
      const featuredMedia = property.media[0];

      return {
        ...property,
        media: featuredMedia ? featuredMedia.url : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
      };
    })
  );
});

// Get a single property of the landlord
landlordRouter.get("/landlord/property/:id", async (req, res) => {
  const landlord = req.user;
  const id = req.params.id;

  const property = await prisma.property.findFirst({
    where: {
      id,
      landlordId: landlord.id,
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
landlordRouter.put("/landlord/property/:id", async (req, res) => {
  const data = req.body; // Parse request body
  const result = propertySchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const id = req.params.id;
  const landlord = req.user;

  try {
    const property = await prisma.property.update({
      where: {
        id,
        landlordId: landlord.id,
      },
      data: {
        ...result.data,
      },
    });

    res.json({
      message: "Property updated",
      data: { id: property.id },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update property",
    });
  }
});

// Delete a property of the landlord
landlordRouter.delete("/landlord/property/:id", async (req, res) => {
  const id = req.params.id;
  const landlord = req.user;

  try {
    await prisma.property.delete({
      where: {
        id,
        landlordId: landlord.id,
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
landlordRouter.patch("/landlord/property/:id/status", async (req, res) => {
  const data = req.body; // Parse request body
  const result = propertyStatusSchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const id = req.params.id;
  const landlord = req.user;

  try {
    const property = await prisma.property.update({
      where: {
        id,
        landlordId: landlord.id,
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
landlordRouter.post("/landlord/property/:id/media", async (req, res) => {
  const data = req.body; // Parse request body
  const result = propertyMediaSchema.safeParse(data); // Validate request using Zod schema

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const id = req.params.id;
  const landlord = req.user;

  const property = await prisma.property.findFirst({
    where: {
      id,
      landlordId: landlord.id,
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
landlordRouter.delete("/landlord/property/:propertyId/media/:id", async (req, res) => {
  const id = req.params.id;
  const landlord = req.user;

  try {
    // Verify the property exists and belongs to the landlord
    const property = await prisma.property.findFirst({
      where: {
        id,
        landlordId: landlord.id,
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
