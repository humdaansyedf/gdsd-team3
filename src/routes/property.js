import { Router } from "express";
import { prisma } from "../prisma/index.js";
import { addInteraction } from "../lib/interaction.js";
import { getUserRecommendations } from "../lib/recommendationService.js";

export const publicPropertyRouter = Router();
export const propertyRouter = Router();

const AMENITIES = [
  "pets",
  "smoking",
  "kitchen",
  "furnished",
  "balcony",
  "cellar",
  "washingMachine",
  "elevator",
  "garden",
  "parking",
  "internet",
  "cableTv",
];

// Route to get multiple properties
publicPropertyRouter.post("/public/property/search", async (req, res) => {
  const {
    title,
    amenities,
    minPrice,
    maxPrice,
    availableFrom,
    searchRadius,
    page = 1,
  } = req.body;
  const userId = req.headers["x-user-id"];
  const limit = 50;
  const offset = (page - 1) * limit;
  try {
    const isSearching =
      (title && title.trim() !== "") ||
      (amenities && amenities.length > 0) ||
      (minPrice && minPrice > 0) ||
      (maxPrice && maxPrice < 999999) ||
      (availableFrom && availableFrom.trim() !== "") ||
      (searchRadius && searchRadius !== "whole area");

    const where = {
      status: "ACTIVE",
    };

    if (title) {
      where.title = {
        contains: title,
      };
    }

    if (amenities) {
      for (const amenity of amenities) {
        if (AMENITIES.includes(amenity)) {
          where[amenity] = true;
        }
      }
    }

    if (minPrice || maxPrice) {
      where.totalRent = {
        gte: minPrice || 0,
        lte: maxPrice || 99999999,
      };
    }

    if (availableFrom && availableFrom != "") {
      const validAvailableFrom = new Date(availableFrom);
      if (!isNaN(validAvailableFrom.getTime())) {
        where.availableFrom = {
          gte: validAvailableFrom,
        };
      }
    }

    var numberPattern = /\d+/g;
    const radius = searchRadius?.match(numberPattern);

    // Fulda's coordinates (center of the search area)
    const fuldaLat = 50.5528;
    const fuldaLon = 9.6753;

    if (radius != null) {
      // Convert radius to meters
      const radiusInMeters = radius * 1000;
      const query = await prisma.$queryRaw`
      SELECT id
      FROM property
      WHERE ST_Distance_Sphere(
        POINT(longitude, latitude),
        POINT(${fuldaLon}, ${fuldaLat})
      ) <= ${radiusInMeters}
    `;

      where.id = {
        in: query.map(({ id }) => id), // Filter properties by the IDs returned
      };
    }

    let properties = [];

    properties = await prisma.property.findMany({
      where: where,
      take: limit,
      skip: offset,
      include: {
        media: true,
      },
      omit: {
        creatorComment: true,
        adminComment: true,
      },
    });

    // If no properties are found, return all properties
    if (properties.length === 0 && isSearching) {
      properties = await prisma.property.findMany({
        take: limit,
        skip: offset,
        include: { media: true },
        omit: { creatorComment: true, adminComment: true },
      });
    }

    let recommendedPropertyIds = [];
    if (userId && !isSearching) {
      recommendedPropertyIds = await getUserRecommendations(userId);
    }

    let formattedProperties = properties.map((property) => ({
      ...property,
      isRecommended: recommendedPropertyIds.includes(property.id),
    }));

    // recommended properties on top
    const recommended = formattedProperties.filter((p) => p.isRecommended);
    const nonRecommended = formattedProperties.filter((p) => !p.isRecommended);
    formattedProperties = [...recommended, ...nonRecommended];

    res.json(
      formattedProperties.map((property) => {
        const featuredMedia = property.media[0];
        return {
          ...property,
          media: featuredMedia
            ? featuredMedia.url
            : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
        };
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get a single property
publicPropertyRouter.get("/public/property/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.headers["x-user-id"];
  // console.log("in backend:", userId);
  const property = await prisma.property.findUnique({
    where: {
      id,
      status: "ACTIVE",
    },
    include: {
      media: true,
      user: {
        select: {
          name: true, // Only fetch the creator's name
        },
      },
    },
    omit: {
      creatorComment: true,
      adminComment: true,
    },
  });

  if (!property) {
    res.status(404).json({ error: "property not found" });
    return;
  }

  res.json(property);

  if (userId) {
    //recording interaction
    setImmediate(async () => {
      try {
        addInteraction(parseInt(userId), id, "view");
        // console.log("added view");
      } catch (error) {
        console.error(
          "Warning: Error recording interaction (background):",
          error
        );
      }
    });
  }

  return;
});
