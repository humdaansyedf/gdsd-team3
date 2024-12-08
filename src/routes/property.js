const { Router } = require("express");
const { prisma } = require("../prisma");

const propertyRouter = Router();

// Route to get multiple properties
propertyRouter.post("/property/search", async (req, res) => {
  const {
    title,
    pets,
    smoking,
    minPrice,
    maxPrice,
    availableFrom,
    searchRadius,
    page = 1,
  } = req.body;
  const limit = 50;
  const offset = (page - 1) * limit;

  const where = {};

  if (title) {
    where.title = {
      contains: title,
    };
  }

  if (pets) {
    where.petsAllowed = true;
  }

  if (smoking) {
    where.smokingAllowed = true;
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
  console.log("searchRadius" + radius);

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
  });

  // If no properties are found, return all properties
  if (properties.length === 0) {
    properties = await prisma.property.findMany({
      take: limit,
      skip: offset,
      include: {
        media: true,
      },
    });
  }

  res.json(
    properties.map((property) => {
      // Get the first media item as the featured image
      const featuredMedia = property.media[0];

      return {
        ...property,
        media: featuredMedia
          ? featuredMedia.url
          : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
      };
    })
  );
});

// Route to get a single property
propertyRouter.get("/property/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const property = await prisma.property.findUnique({
    where: {
      id,
    },
    include: {
      media: true,
    },
  });

  if (!property) {
    res.status(404).json({ error: "property not found" });
  } else {
    res.json(property);
  }
});

//API to update listing status
//requires status field in post body
//returns with message and property data
propertyRouter.patch("/property/:id/status", async (req, res) => {
  console.log("API hit");
  const { id } = req.params; // Get property ID from the URL
  const { status } = req.body; // Get the new status from the request body

  // Validate the status
  const validStatuses = ["PENDING", "ACTIVE", "RENTED", "ARCHIVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  // Update the status in the database
  const updatedProperty = await prisma.property.update({
    where: { id: parseInt(id, 10) },
    data: { status },
  });
  res.json({
    message: `Property status updated to ${status}`,
    property: updatedProperty,
  });
});

//API to get active listings
propertyRouter.get("/properties/active", async (req, res) => {
  properties = await prisma.property.findMany({
    where: { status: "ACTIVE" },

    include: {
      media: true,
    },
  });

  res.json(
    properties.map((property) => {
      // Get the first media item as the featured image
      const featuredMedia = property.media[0];

      return {
        ...property,
        media: featuredMedia
          ? featuredMedia.url
          : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
      };
    })
  );
});

module.exports = { propertyRouter };
