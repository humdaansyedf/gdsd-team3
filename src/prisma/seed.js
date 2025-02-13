// prisma/seed.ts
import { faker } from "@faker-js/faker";
import { hash } from "@node-rs/argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  //order matters!
  await prisma.message.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.session.deleteMany();
  await prisma.propertyMedia.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.document.deleteMany();
}

async function createUsers() {
  const passwordHash = await hash("fulda123", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const users = [
    {
      id: 1,
      email: "landlord1@gmail.com",
      passwordHash: passwordHash,
      type: "LANDLORD",
      name: "Landlord 1",
    },
    {
      id: 2,
      email: "landlord2@gmail.com",
      passwordHash: passwordHash,
      type: "LANDLORD",
      name: "Landlord 2",
    },
    {
      id: 3,
      email: "landlord3@gmail.com",
      passwordHash: passwordHash,
      type: "LANDLORD",
      name: "Landlord 3",
    },
    {
      id: 4,
      email: "student1@hs-fulda.de",
      passwordHash: passwordHash,
      type: "STUDENT",
      name: "Student 1",
    },
    {
      id: 5,
      email: "student2@hs-fulda.de",
      passwordHash: passwordHash,
      type: "STUDENT",
      name: "Student 2",
    },
    {
      id: 6,
      email: "student3@hs-fulda.de",
      passwordHash: passwordHash,
      type: "STUDENT",
      name: "Student 3",
    },
  ];
  await prisma.user.createMany({ data: users });
}

async function createProperties() {
  const properties = [
    // ACTIVE
    {
      id: 1,
      createdAt: "2024-11-01T14:30:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      title: "2 room apartment in city center",
      description:
        "Modern 2-room apartment in prime city center location. Bright living room, separate bedroom, and updated kitchen. Walking distance to shops, restaurants, and public transport. Secure building with well-maintained facilities.",
      longitude: 9.67,
      latitude: 50.52,
      totalRent: 1800,
      coldRent: 1400,
      additionalCosts: 400,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2800,
      numberOfRooms: 2,
      numberOfBeds: 1,
      numberOfBaths: 1,
      availableFrom: "2024-12-15T00:00:00Z",
      pets: false,
      smoking: true,
      creatorId: 1,
    },
    {
      id: 2,
      creatorId: 1,
      title: "Cozy studio near university",
      description:
        "Efficient studio apartment steps from campus. Recently renovated with modern appliances. Perfect for students. Includes high-speed internet and utilities.",
      numberOfRooms: 1,
      pets: false,
      smoking: true,
      totalRent: 1200,
      longitude: 9.73,
      latitude: 50.58,
      availableFrom: "2024-12-20T00:00:00Z",
      createdAt: "2024-10-15T09:45:00Z",
      status: "ACTIVE",
      propertyType: "STUDIO",
      coldRent: 900,
      additionalCosts: 300,
      heatingIncludedInAdditionalCosts: true,
      deposit: 1800,
      numberOfBeds: 1,
      numberOfBaths: 1,
    },
    {
      id: 3,
      creatorId: 1,
      title: "3 room apartment with balcony",
      description:
        "Spacious 3-room apartment featuring a sunny balcony. Updated kitchen, two bedrooms, and large living area. Quiet residential neighborhood with easy access to downtown.",
      numberOfRooms: 3,
      pets: true,
      smoking: false,
      totalRent: 2400,
      longitude: 9.55,
      latitude: 50.63,
      availableFrom: "2025-01-05T00:00:00Z",
      createdAt: "2024-11-05T16:20:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      coldRent: 1800,
      additionalCosts: 600,
      heatingIncludedInAdditionalCosts: true,
      deposit: 3600,
      numberOfBeds: 2,
      numberOfBaths: 2,
    },
    {
      id: 4,
      creatorId: 2,
      title: "Luxury 1 bedroom with river view",
      description:
        "High-end apartment overlooking the river. Premium finishes, floor-to-ceiling windows, and modern amenities. 24/7 concierge and fitness center included.",
      numberOfRooms: 1,
      pets: true,
      smoking: true,
      totalRent: 2200,
      longitude: 9.62,
      latitude: 50.48,
      availableFrom: "2024-12-10T00:00:00Z",
      createdAt: "2024-10-25T11:15:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      coldRent: 1700,
      additionalCosts: 500,
      heatingIncludedInAdditionalCosts: true,
      deposit: 3400,
      numberOfBeds: 1,
      numberOfBaths: 1,
    },
    {
      id: 5,
      creatorId: 2,
      title: "Garden level 2 room flat",
      description:
        "Charming ground floor apartment with private garden access. Two bright rooms, updated bathroom, and practical layout. Close to parks and local shops.",
      numberOfRooms: 2,
      pets: true,
      smoking: true,
      totalRent: 1600,
      longitude: 9.78,
      latitude: 50.55,
      availableFrom: "2024-12-28T00:00:00Z",
      createdAt: "2024-11-10T08:30:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      coldRent: 1200,
      additionalCosts: 400,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2400,
      numberOfBeds: 1,
      numberOfBaths: 1,
    },
    {
      id: 6,
      creatorId: 2,
      title: "Modern studio in business district",
      description:
        "Contemporary studio in the heart of the business district. Smart home features, built-in storage, and high-end appliances. Perfect for young professionals.",
      numberOfRooms: 1,
      pets: false,
      smoking: false,
      totalRent: 1500,
      longitude: 9.58,
      latitude: 50.67,
      availableFrom: "2025-01-15T00:00:00Z",
      createdAt: "2024-10-30T13:45:00Z",
      status: "ACTIVE",
      propertyType: "STUDIO",
      coldRent: 1150,
      additionalCosts: 350,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2300,
      numberOfBeds: 1,
      numberOfBaths: 1,
    },
    {
      id: 7,
      creatorId: 3,
      title: "4 room family apartment",
      description:
        "Generous family home with three bedrooms and spacious living room. Well-equipped kitchen, two bathrooms, and plenty of storage. Near schools and parks.",
      numberOfRooms: 4,
      pets: true,
      smoking: false,
      totalRent: 3000,
      longitude: 9.69,
      latitude: 50.51,
      availableFrom: "2025-01-20T00:00:00Z",
      createdAt: "2024-11-08T15:20:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      coldRent: 2300,
      additionalCosts: 700,
      heatingIncludedInAdditionalCosts: true,
      deposit: 4600,
      numberOfBeds: 3,
      numberOfBaths: 2,
    },
    {
      id: 8,
      creatorId: 3,
      title: "Penthouse with city views",
      description:
        "Exclusive top floor apartment with panoramic city views. Two bedrooms, designer kitchen, and private roof terrace. Premium building with secure parking.",
      numberOfRooms: 3,
      pets: true,
      smoking: false,
      totalRent: 3500,
      longitude: 9.75,
      latitude: 50.45,
      availableFrom: "2024-12-15T00:00:00Z",
      createdAt: "2024-10-20T10:30:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      coldRent: 2700,
      additionalCosts: 800,
      heatingIncludedInAdditionalCosts: true,
      deposit: 5400,
      numberOfBeds: 2,
      numberOfBaths: 2,
    },
    {
      id: 9,
      creatorId: 3,
      title: "Renovated 1 room near metro",
      description:
        "Fully renovated one-room apartment steps from metro station. Modern fixtures, efficient layout, and bright interiors. Ideal for city commuters.",
      numberOfRooms: 1,
      pets: false,
      smoking: false,
      totalRent: 1300,
      longitude: 9.63,
      latitude: 50.59,
      availableFrom: "2024-12-05T00:00:00Z",
      createdAt: "2024-11-02T09:15:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      coldRent: 1000,
      additionalCosts: 300,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2000,
      numberOfBeds: 1,
      numberOfBaths: 1,
      furnished: true,
      parking: true,
    },
    {
      id: 10,
      creatorId: 3,
      title: "2 room eco-friendly apartment",
      description:
        "Sustainable living space with solar panels and energy-efficient design. Two rooms, recycled materials, and green roof access. Low utility costs.",
      numberOfRooms: 2,
      pets: true,
      smoking: false,
      totalRent: 1900,
      longitude: 9.71,
      latitude: 50.64,
      availableFrom: "2025-01-10T00:00:00Z",
      createdAt: "2024-11-07T14:45:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      coldRent: 1500,
      additionalCosts: 400,
      heatingIncludedInAdditionalCosts: true,
      deposit: 3000,
      numberOfBeds: 1,
      numberOfBaths: 1,
      furnished: true,
      internet: true,
      parking: true,
    },
    {
      id: 11,
      creatorId: 3,
      title: "Bright 2 room apartment",
      description:
        "Sun-filled apartment with modern amenities. Open plan living area, updated kitchen, and quiet bedroom. Close to public transport and local amenities.",
      numberOfRooms: 2,
      pets: true,
      smoking: true,
      totalRent: 1750,
      longitude: 9.64,
      latitude: 50.53,
      availableFrom: "2024-12-18T00:00:00Z",
      createdAt: "2024-10-28T13:20:00Z",
      status: "ACTIVE",
      propertyType: "APARTMENT",
      coldRent: 1350,
      additionalCosts: 400,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2700,
      numberOfBeds: 1,
      numberOfBaths: 1,
      furnished: true,
      internet: true,
      parking: true,
      cellar: true,
    },
    // PENDING
    {
      id: 12,
      creatorId: 1,
      title: "Studio with balcony view",
      description:
        "Compact studio featuring private balcony. Efficient layout, modern appliances, and great city views. Perfect for single professionals.",
      numberOfRooms: 1,
      pets: false,
      smoking: true,
      totalRent: 1300,
      longitude: 9.72,
      latitude: 50.61,
      availableFrom: "2024-12-22T00:00:00Z",
      createdAt: "2024-11-01T10:15:00Z",
      status: "PENDING",
      propertyType: "STUDIO",
      coldRent: 1000,
      additionalCosts: 300,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2000,
      numberOfBeds: 1,
      numberOfBaths: 1,
      creatorComment: "alles gut, bitte genehmigen",
    },
    {
      id: 13,
      creatorId: 2,
      title: "3 room family home",
      description:
        "Spacious family apartment in quiet neighborhood. Three well-proportioned rooms, modern bathroom, and fitted kitchen. Near schools and parks.",
      numberOfRooms: 3,
      pets: true,
      smoking: false,
      totalRent: 2500,
      longitude: 9.57,
      latitude: 50.49,
      availableFrom: "2025-01-25T00:00:00Z",
      createdAt: "2024-10-15T16:45:00Z",
      status: "PENDING",
      propertyType: "APARTMENT",
      coldRent: 1900,
      additionalCosts: 600,
      heatingIncludedInAdditionalCosts: true,
      deposit: 3800,
      numberOfBeds: 2,
      numberOfBaths: 2,
      creatorComment: "All documents are attached. Please review and approve.",
    },
    {
      id: 14,
      creatorId: 3,
      title: "Modern 1 room apartment",
      description:
        "Contemporary one-room living space. High-quality finishes, smart home features, and efficient design. Central location with easy access to amenities.",
      numberOfRooms: 1,
      pets: false,
      smoking: false,
      totalRent: 1400,
      longitude: 9.68,
      latitude: 50.56,
      availableFrom: "2024-12-12T00:00:00Z",
      createdAt: "2024-11-05T09:30:00Z",
      status: "PENDING",
      propertyType: "APARTMENT",
      coldRent: 1100,
      additionalCosts: 300,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2200,
      numberOfBeds: 1,
      numberOfBaths: 1,
      creatorComment: "Please let me know if you need any additional information.",
    },
    // DRAFT
    {
      id: 15,
      creatorId: 1,
      title: "4 room luxury flat",
      description:
        "Premium apartment with high-end features. Four spacious rooms, designer kitchen, and two modern bathrooms. Exclusive residential area.",
      numberOfRooms: 4,
      pets: true,
      smoking: false,
      totalRent: 3300,
      longitude: 9.76,
      latitude: 50.65,
      availableFrom: "2025-01-15T00:00:00Z",
      createdAt: "2024-10-25T14:20:00Z",
      status: "DRAFT",
      propertyType: "APARTMENT",
      coldRent: 2600,
      additionalCosts: 700,
      heatingIncludedInAdditionalCosts: true,
      deposit: 5200,
      numberOfBeds: 3,
      numberOfBaths: 2,
    },
    {
      id: 16,
      creatorId: 2,
      title: "Cozy 2 room garden flat",
      description:
        "Ground floor apartment with garden access. Two comfortable rooms, updated features, and private outdoor space. Peaceful residential setting.",
      numberOfRooms: 2,
      pets: true,
      smoking: false,
      totalRent: 1850,
      longitude: 9.61,
      latitude: 50.54,
      availableFrom: "2024-12-08T00:00:00Z",
      createdAt: "2024-11-08T11:45:00Z",
      status: "DRAFT",
      propertyType: "APARTMENT",
      coldRent: 1450,
      additionalCosts: 400,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2900,
      numberOfBeds: 1,
      numberOfBaths: 1,
    },
    {
      id: 17,
      creatorId: 3,
      title: "Studio loft apartment",
      description:
        "Stylish loft-style studio with high ceilings. Modern design, open plan living, and excellent natural light. Trendy neighborhood location.",
      numberOfRooms: 1,
      pets: false,
      smoking: true,
      totalRent: 1450,
      longitude: 9.79,
      latitude: 50.47,
      availableFrom: "2025-01-05T00:00:00Z",
      createdAt: "2024-10-30T15:30:00Z",
      status: "DRAFT",
      propertyType: "STUDIO",
      coldRent: 1150,
      additionalCosts: 300,
      heatingIncludedInAdditionalCosts: true,
      deposit: 2300,
      numberOfBeds: 1,
      numberOfBaths: 1,
    },
    // REJECTED
    {
      id: 18,
      creatorId: 1,
      title: "3 room corner unit",
      description:
        "Bright corner apartment with dual aspect windows. Three well-sized rooms, modern kitchen, and plenty of storage. Convenient urban location.",
      numberOfRooms: 3,
      pets: true,
      smoking: true,
      totalRent: 2600,
      longitude: 9.66,
      latitude: 50.69,
      availableFrom: "2024-12-30T00:00:00Z",
      createdAt: "2024-11-10T12:15:00Z",
      status: "REJECTED",
      propertyType: "APARTMENT",
      coldRent: 2000,
      additionalCosts: 600,
      heatingIncludedInAdditionalCosts: true,
      deposit: 4000,
      numberOfBeds: 2,
      numberOfBaths: 2,
      adminComment: "Property is too expensive for the area.",
    },
    {
      id: 19,
      creatorId: 2,
      title: "Compact 1 room flat",
      description:
        "Efficiently designed one-room apartment. Modern amenities, built-in storage, and smart layout. Great starter home in central area.",
      numberOfRooms: 1,
      pets: false,
      smoking: false,
      totalRent: 1250,
      longitude: 9.53,
      latitude: 50.51,
      availableFrom: "2024-12-20T00:00:00Z",
      createdAt: "2024-10-20T08:45:00Z",
      status: "REJECTED",
      propertyType: "APARTMENT",
      coldRent: 950,
      additionalCosts: 300,
      heatingIncludedInAdditionalCosts: true,
      deposit: 1900,
      numberOfBeds: 1,
      numberOfBaths: 1,
      adminComment: "Property is too small for the price.",
    },
    {
      id: 20,
      creatorId: 3,
      title: "2 room riverside apartment",
      description:
        "Beautiful apartment near the river. Two spacious rooms, contemporary design, and water views. Walking distance to waterfront amenities.",
      numberOfRooms: 2,
      pets: true,
      smoking: false,
      totalRent: 1950,
      longitude: 9.74,
      latitude: 50.57,
      availableFrom: "2025-01-28T00:00:00Z",
      createdAt: "2024-11-03T17:30:00Z",
      status: "REJECTED",
      propertyType: "APARTMENT",
      coldRent: 1500,
      additionalCosts: 450,
      heatingIncludedInAdditionalCosts: true,
      deposit: 3000,
      numberOfBeds: 1,
      numberOfBaths: 1,
      adminComment: "Property is not suitable for pets.",
    },
  ];

  await prisma.property.createMany({ data: properties });

  // Seed property media
  const images = [
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-1.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-2.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-3.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-4.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/interior-1.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/interior-2.jpg",
    "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/interior-3.jpg",
  ];
  const propertyMedia = [];
  for (let i = 0; i < 40; i++) {
    const url = images[faker.number.int({ min: 0, max: 6 })];
    const name = url.split("amazonaws.com/")[1];
    const media = {
      status: "ACTIVE",
      type: "IMAGE",
      url: url,
      name: name,
      propertyId: faker.number.int({ min: 1, max: 20 }),
    };
    propertyMedia.push(media);
  }
  await prisma.propertyMedia.createMany({ data: propertyMedia });
}

async function createChats() {
  const chats = [
    { id: 1, propertyId: 1, lastMessageAt: "2024-12-01T12:00:00Z" },
    { id: 2, propertyId: 4, lastMessageAt: "2024-12-03T15:30:00Z" },
  ];

  await prisma.chat.createMany({ data: chats });
}

async function createChatParticipants() {
  const participants = [
    { chatid: 1, userid: 1 },
    { chatid: 1, userid: 4 },
    { chatid: 2, userid: 2 },
    { chatid: 2, userid: 4 },
  ];

  await prisma.chatParticipant.createMany({ data: participants });
}

async function createMessages() {
  const messages = [
    {
      id: 1,
      chatid: 1,
      userid: 4,
      content: "Hello! Is the apartment still available?",
      createdAt: "2024-12-01T12:00:00Z",
    },
    {
      id: 2,
      chatid: 1,
      userid: 1,
      content: "Yes, it is. When would you like to visit?",
      createdAt: "2024-12-01T12:05:00Z",
    },
    {
      id: 3,
      chatid: 2,
      userid: 4,
      content: "Can I get more details about the property?",
      createdAt: "2024-12-03T15:30:00Z",
    },
    {
      id: 4,
      chatid: 2,
      userid: 2,
      content: "Sure, I'll send you the brochure shortly.",
      createdAt: "2024-12-03T15:35:00Z",
    },
  ];

  await prisma.message.createMany({ data: messages });
}

async function createAdmin() {
  const passwordHash = await hash("gryffindor", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  await prisma.admin.create({
    data: {
      email: "ron.weasly@hogwarts.de",
      passwordHash: passwordHash,
    },
  });
}

async function createStudentDocuments() {
  const s3BucketName = process.env.APP_AWS_BUCKET_NAME; 
  const s3Region = process.env.APP_AWS_REGION; 
  const baseS3Url = `https://${s3BucketName}.s3.${s3Region}.amazonaws.com`;

  const documents = [
    {
      userId: 4, // Student 1
      fileName: "resume_student1.pdf",
      key: "user/4/1706300000-resume_student1.pdf",
      url: `${baseS3Url}/user/4/1706300000-resume_student1.pdf`,
      createdAt: new Date("2024-12-01T10:00:00Z"),
    },
    {
      userId: 4, // Student 1
      fileName: "transcript_student1.pdf",
      key: "user/4/1706300500-transcript_student1.pdf",
      url: `${baseS3Url}/user/4/1706300500-transcript_student1.pdf`,
      createdAt: new Date("2024-12-02T15:30:00Z"),
    },
    {
      userId: 5, // Student 2
      fileName: "internship_certificate.pdf",
      key: "user/5/1706301000-internship_certificate.pdf",
      url: `${baseS3Url}/user/5/1706301000-internship_certificate.pdf`,
      createdAt: new Date("2024-11-20T09:15:00Z"),
    },
    {
      userId: 6, // Student 3
      fileName: "cover_letter.pdf",
      key: "user/6/1706301500-cover_letter.pdf",
      url: `${baseS3Url}/user/6/1706301500-cover_letter.pdf`,
      createdAt: new Date("2024-11-25T14:45:00Z"),
    },
    {
      userId: 6, // Student 3
      fileName: "project_report.pdf",
      key: "user/6/1706302000-project_report.pdf",
      url: `${baseS3Url}/user/6/1706302000-project_report.pdf`,
      createdAt: new Date("2024-12-05T11:10:00Z"),
    },
  ];

  await prisma.document.createMany({ data: documents });
}

async function main() {
  await clearDatabase();
  await createUsers();
  await createProperties();
  await createChats();
  await createChatParticipants();
  await createMessages();
  await createAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
