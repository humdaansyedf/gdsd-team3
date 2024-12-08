// prisma/seed.ts
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  // Clear the database
  await prisma.propertyMedia.deleteMany();
  await prisma.property.deleteMany();

  // Seed properties
  const properties = [
    {
      id: 1,
      title: "2 room apartment in city center",
      description:
        "Modern 2-room apartment in prime city center location. Bright living room, separate bedroom, and updated kitchen. Walking distance to shops, restaurants, and public transport. Secure building with well-maintained facilities.",
      numberOfRooms: 2,
      petsAllowed: false,
      smokingAllowed: false,
      totalRent: 1800,
      longitude: 9.67,
      latitude: 50.52,
      availableFrom: "2024-11-28T00:00:00Z",
      createdAt: "2024-11-01T14:30:00Z",
      postcode: "36037",
      status: "ACTIVE",
    },
    {
      id: 2,
      title: "Cozy studio near university",
      description:
        "Efficient studio apartment steps from campus. Recently renovated with modern appliances. Perfect for students. Includes high-speed internet and utilities.",
      numberOfRooms: 1,
      petsAllowed: false,
      smokingAllowed: false,
      totalRent: 1200,
      longitude: 9.73,
      latitude: 50.58,
      availableFrom: "2024-12-01T00:00:00Z",
      createdAt: "2024-10-15T09:45:00Z",
      postcode: "36039",
      status: "ACTIVE",
    },
    {
      id: 3,
      title: "3 room apartment with balcony",
      description:
        "Spacious 3-room apartment featuring a sunny balcony. Updated kitchen, two bedrooms, and large living area. Quiet residential neighborhood with easy access to downtown.",
      numberOfRooms: 3,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 2400,
      longitude: 9.55,
      latitude: 50.63,
      availableFrom: "2024-12-10T00:00:00Z",
      createdAt: "2024-11-05T16:20:00Z",
      postcode: "36041",
      status: "ACTIVE",
    },
    {
      id: 4,
      title: "Luxury 1 bedroom with river view",
      description:
        "High-end apartment overlooking the river. Premium finishes, floor-to-ceiling windows, and modern amenities. 24/7 concierge and fitness center included.",
      numberOfRooms: 1,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 2200,
      longitude: 9.62,
      latitude: 50.48,
      availableFrom: "2024-11-20T00:00:00Z",
      createdAt: "2024-10-25T11:15:00Z",
      postcode: "36043",
      status: "ACTIVE",
    },
    {
      id: 5,
      title: "Garden level 2 room flat",
      description:
        "Charming ground floor apartment with private garden access. Two bright rooms, updated bathroom, and practical layout. Close to parks and local shops.",
      numberOfRooms: 2,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 1600,
      longitude: 9.78,
      latitude: 50.55,
      availableFrom: "2024-12-05T00:00:00Z",
      createdAt: "2024-11-10T08:30:00Z",
      postcode: "36037",
      status: "ACTIVE",
    },
    {
      id: 6,
      title: "Modern studio in business district",
      description:
        "Contemporary studio in the heart of the business district. Smart home features, built-in storage, and high-end appliances. Perfect for young professionals.",
      numberOfRooms: 1,
      petsAllowed: false,
      smokingAllowed: false,
      totalRent: 1500,
      longitude: 9.58,
      latitude: 50.67,
      availableFrom: "2024-11-25T00:00:00Z",
      createdAt: "2024-10-30T13:45:00Z",
      postcode: "36039",
      status: "ACTIVE",
    },
    {
      id: 7,
      title: "4 room family apartment",
      description:
        "Generous family home with three bedrooms and spacious living room. Well-equipped kitchen, two bathrooms, and plenty of storage. Near schools and parks.",
      numberOfRooms: 4,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 3000,
      longitude: 9.69,
      latitude: 50.51,
      availableFrom: "2024-12-15T00:00:00Z",
      createdAt: "2024-11-08T15:20:00Z",
      postcode: "36041",
      status: "ACTIVE",
    },
    {
      id: 8,
      title: "Penthouse with city views",
      description:
        "Exclusive top floor apartment with panoramic city views. Two bedrooms, designer kitchen, and private roof terrace. Premium building with secure parking.",
      numberOfRooms: 3,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 3500,
      longitude: 9.75,
      latitude: 50.45,
      availableFrom: "2024-12-01T00:00:00Z",
      createdAt: "2024-10-20T10:30:00Z",
      postcode: "36043",
      status: "ACTIVE",
    },
    {
      id: 9,
      title: "Renovated 1 room near metro",
      description:
        "Fully renovated one-room apartment steps from metro station. Modern fixtures, efficient layout, and bright interiors. Ideal for city commuters.",
      numberOfRooms: 1,
      petsAllowed: false,
      smokingAllowed: false,
      totalRent: 1300,
      longitude: 9.63,
      latitude: 50.59,
      availableFrom: "2024-11-30T00:00:00Z",
      createdAt: "2024-11-02T09:15:00Z",
      postcode: "36037",
      status: "ACTIVE",
    },
    {
      id: 10,
      title: "2 room eco-friendly apartment",
      description:
        "Sustainable living space with solar panels and energy-efficient design. Two rooms, recycled materials, and green roof access. Low utility costs.",
      numberOfRooms: 2,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 1900,
      longitude: 9.71,
      latitude: 50.64,
      availableFrom: "2024-12-08T00:00:00Z",
      createdAt: "2024-11-07T14:45:00Z",
      postcode: "36039",
      status: "ACTIVE",
    },
    {
      id: 11,
      title: "Bright 2 room apartment",
      description:
        "Sun-filled apartment with modern amenities. Open plan living area, updated kitchen, and quiet bedroom. Close to public transport and local amenities.",
      numberOfRooms: 2,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 1750,
      longitude: 9.64,
      latitude: 50.53,
      availableFrom: "2024-11-25T00:00:00Z",
      createdAt: "2024-10-28T13:20:00Z",
      postcode: "36041",
      status: "ACTIVE",
    },
    {
      id: 12,
      title: "Studio with balcony view",
      description:
        "Compact studio featuring private balcony. Efficient layout, modern appliances, and great city views. Perfect for single professionals.",
      numberOfRooms: 1,
      petsAllowed: false,
      smokingAllowed: false,
      totalRent: 1300,
      longitude: 9.72,
      latitude: 50.61,
      availableFrom: "2024-12-05T00:00:00Z",
      createdAt: "2024-11-01T10:15:00Z",
      postcode: "36043",
      status: "ACTIVE",
    },
    {
      id: 13,
      title: "3 room family home",
      description:
        "Spacious family apartment in quiet neighborhood. Three well-proportioned rooms, modern bathroom, and fitted kitchen. Near schools and parks.",
      numberOfRooms: 3,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 2500,
      longitude: 9.57,
      latitude: 50.49,
      availableFrom: "2024-12-01T00:00:00Z",
      createdAt: "2024-10-15T16:45:00Z",
      postcode: "36037",
      status: "ACTIVE",
    },
    {
      id: 14,
      title: "Modern 1 room apartment",
      description:
        "Contemporary one-room living space. High-quality finishes, smart home features, and efficient design. Central location with easy access to amenities.",
      numberOfRooms: 1,
      petsAllowed: false,
      smokingAllowed: false,
      totalRent: 1400,
      longitude: 9.68,
      latitude: 50.56,
      availableFrom: "2024-11-30T00:00:00Z",
      createdAt: "2024-11-05T09:30:00Z",
      postcode: "36039",
      status: "ACTIVE",
    },
    {
      id: 15,
      title: "4 room luxury flat",
      description:
        "Premium apartment with high-end features. Four spacious rooms, designer kitchen, and two modern bathrooms. Exclusive residential area.",
      numberOfRooms: 4,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 3300,
      longitude: 9.76,
      latitude: 50.65,
      availableFrom: "2024-12-10T00:00:00Z",
      createdAt: "2024-10-25T14:20:00Z",
      postcode: "36041",
      status: "ACTIVE",
    },
    {
      id: 16,
      title: "Cozy 2 room garden flat",
      description:
        "Ground floor apartment with garden access. Two comfortable rooms, updated features, and private outdoor space. Peaceful residential setting.",
      numberOfRooms: 2,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 1850,
      longitude: 9.61,
      latitude: 50.54,
      availableFrom: "2024-11-28T00:00:00Z",
      createdAt: "2024-11-08T11:45:00Z",
      postcode: "36043",
      status: "ACTIVE",
    },
    {
      id: 17,
      title: "Studio loft apartment",
      description:
        "Stylish loft-style studio with high ceilings. Modern design, open plan living, and excellent natural light. Trendy neighborhood location.",
      numberOfRooms: 1,
      petsAllowed: false,
      smokingAllowed: false,
      totalRent: 1450,
      longitude: 9.79,
      latitude: 50.47,
      availableFrom: "2024-12-15T00:00:00Z",
      createdAt: "2024-10-30T15:30:00Z",
      postcode: "36037",
      status: "ACTIVE",
    },
    {
      id: 18,
      title: "3 room corner unit",
      description:
        "Bright corner apartment with dual aspect windows. Three well-sized rooms, modern kitchen, and plenty of storage. Convenient urban location.",
      numberOfRooms: 3,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 2600,
      longitude: 9.66,
      latitude: 50.69,
      availableFrom: "2024-12-01T00:00:00Z",
      createdAt: "2024-11-10T12:15:00Z",
      postcode: "36039",
      status: "ACTIVE",
    },
    {
      id: 19,
      title: "Compact 1 room flat",
      description:
        "Efficiently designed one-room apartment. Modern amenities, built-in storage, and smart layout. Great starter home in central area.",
      numberOfRooms: 1,
      petsAllowed: false,
      smokingAllowed: false,
      totalRent: 1250,
      longitude: 9.53,
      latitude: 50.51,
      availableFrom: "2024-11-20T00:00:00Z",
      createdAt: "2024-10-20T08:45:00Z",
      postcode: "36041",
      status: "ACTIVE",
    },
    {
      id: 20,
      title: "2 room riverside apartment",
      description:
        "Beautiful apartment near the river. Two spacious rooms, contemporary design, and water views. Walking distance to waterfront amenities.",
      numberOfRooms: 2,
      petsAllowed: true,
      smokingAllowed: false,
      totalRent: 1950,
      longitude: 9.74,
      latitude: 50.57,
      availableFrom: "2024-12-08T00:00:00Z",
      createdAt: "2024-11-03T17:30:00Z",
      postcode: "36043",
      status: "ACTIVE",
    },
  ];
  await prisma.property.createMany({ data: properties });

  const images = [
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-1.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-2.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-3.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-4.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/interior-1.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/interior-2.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/interior-3.jpg",
  ];

  // Seed property media
  const propertyMedia = [];
  for (let i = 0; i < 40; i++) {
    const media = {
      url: images[faker.number.int({ min: 0, max: 6 })],
      propertyId: faker.number.int({ min: 1, max: 20 }),
    };
    propertyMedia.push(media);
  }
  await prisma.propertyMedia.createMany({ data: propertyMedia });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
