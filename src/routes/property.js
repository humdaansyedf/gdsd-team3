const { Router } = require("express");
const { prisma } = require("../prisma");

const propertyRouter = Router();

// Route to get multiple properties
propertyRouter.post("/property/search", async (req, res) => {
  const { title, pets, smoking, minPrice, maxPrice, availableFrom, page = 1 } = req.body;
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

  let properties = [];

  properties = await prisma.property.findMany({
    take: limit,
    skip: offset,
    where: where,
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
        media: featuredMedia ? featuredMedia.url : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
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

module.exports = { propertyRouter };
