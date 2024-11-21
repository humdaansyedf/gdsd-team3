// prisma/seed.ts
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  await prisma.property.deleteMany();

  const properties = [];
  for (let i = 0; i < 100; i++) {
    const property = {
      title: faker.location.streetAddress() + " - " + faker.lorem.words(3),
      description: faker.lorem.paragraphs(3),
      postcode: faker.helpers.arrayElement(["36037", "36039", "36041", "36043"]),
      // Fulda region coordinates. Fulda region approximate bounding box:
      // North: 50.7, South: 50.4, East: 9.8, West: 9.5
      longitude: faker.location.longitude({ min: 9.5, max: 9.8 }),
      latitude: faker.location.latitude({ min: 50.4, max: 50.7 }),
      totalRent: faker.number.float({ min: 500, max: 2000, precision: 0.01 }),
      numberOfRooms: faker.number.int({ min: 1, max: 5 }),
      petsAllowed: faker.datatype.boolean(),
      smokingAllowed: faker.datatype.boolean(),
      availableFrom: faker.date.soon({ days: 30 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
    };
    properties.push(property);
  }

  await prisma.property.createMany({ data: properties });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
