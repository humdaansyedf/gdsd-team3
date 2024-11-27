const { Router } = require("express");
const { prisma } = require("../prisma");

const propertyRouter = Router();

// Route to get property
propertyRouter.post("/property/search", async (req, res) => {
  console.log(req.body);

  const {
    title,
    pets,
    smoking,
    minPrice,
    maxPrice,
    availableFrom,
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

  if (pets !== undefined) {
    where.petsAllowed = pets;
  }

  if (smoking !== undefined) {
    where.smokingAllowed = smoking;
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

  const properties = await prisma.property.findMany({
    take: limit,
    skip: offset,
    where: where,
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
          : "https://via.placeholder.com/150?text=No+Image",
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
