import { prisma } from "../prisma/index.js";

export const addInteraction = async (userId, propertyId, type) => {
  try {
    await prisma.interaction.upsert({
      where: {
        userId_propertyId_type: {
          userId,
          propertyId,
          type,
        },
      },
      update: { timestamp: new Date() },
      create: { userId, propertyId, type },
    });
  } catch (error) {
    console.error("couldnt add interaction", error);
  }
};

export const deleteInteraction = async (userId, propertyId, type) => {
  try {
    await prisma.interaction.deleteMany({
      where: {
        userId,
        propertyId,
        type,
      },
    });
  } catch (error) {
    console.error("couldnt remove interaction", error);
  }
};
