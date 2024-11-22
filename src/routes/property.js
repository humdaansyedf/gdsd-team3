const { Router } = require("express");
const { prisma } = require("../prisma");

const propertyRouter = Router();

// Route to get all property
propertyRouter.get("/property", async (req, res) => {
  const page = req.query.page || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const title = req.query.title || "";

  const where = {};

  if (title) {
    where.title = {
      contains: title,
    };
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
        media: featuredMedia ? featuredMedia.url : "https://via.placeholder.com/150?text=No+Image",
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
