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

    // If no search results, return all properties (fallback)
    if (properties.length === 0 && isSearching) {
      properties = await prisma.property.findMany({
        take: limit,
        skip: offset,
        include: { media: true },
        omit: { creatorComment: true, adminComment: true },
      });
    }

    // fetch recommendations when user browsing
    let recommendedProperties = [];
    if (userId && !isSearching) {
      recommendedProperties = await getUserRecommendations(userId);
    }
    // converting to a set
    const recommendedPropertyIds = new Set(
      recommendedProperties.map((p) => p.propertyId)
    );
    // Format function to structure properties
    const formatProperty = (property, isRecommended = false) => ({
      ...property,
      isRecommended,
    });

    // Format all properties
    let formattedProperties = properties.map((property) =>
      formatProperty(property, recommendedPropertyIds.has(property.id))
    );

    // Blend recommended properties *only if browsing normally*
    if (!isSearching && recommendedProperties.length > 0) {
      const formattedRecommended = recommendedProperties.map((p) =>
        formatProperty(p.property, true)
      );

      // Remove duplicate recommended properties from normal search results
      formattedProperties = formattedProperties.filter(
        (property) => !recommendedPropertyIds.has(property.id)
      );

      // Blend recommendations into top
      formattedProperties = [...formattedRecommended, ...formattedProperties];
    }

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
