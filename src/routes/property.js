const { Router } = require("express");
const { prisma } = require("../prisma");

const propertyRouter = Router();

// Route to get all property
propertyRouter.get("/property", async (req, res) => {
  const page = req.query.page || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const property = await prisma.property.findMany({
    take: limit,
    skip: offset,
  });

  res.json(property);
});

// Route to get a single property
propertyRouter.get("/property/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const property = await prisma.property.findUnique({
    where: {
      id,
    },
  });

  if (!property) {
    res.status(404).json({ error: "property not found" });
  } else {
    res.json(property);
  }
});

module.exports = { propertyRouter };
