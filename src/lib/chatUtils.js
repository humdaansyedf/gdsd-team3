import { prisma } from "../prisma/index.js";

export const getChatByParticipants = async (
  propertyId,
  currentUserId,
  selectedUserId,
) => {
  return await prisma.chat.findFirst({
    where: {
      propertyId: propertyId,
      AND: [
        { participants: { some: { userid: currentUserId } } },
        { participants: { some: { userid: selectedUserId } } },
      ],
    },
  });
};

export const getUserById = async (userId) => {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
  } catch (error) {
    console.log("error getting username", error);
  }
};

export const getPropertyTitle = async (propertyId) => {
  try {
    return await prisma.property.findUnique({
      where: { id: propertyId },
      select: { title: true },
    });
  } catch (error) {
    console.log("error getting username", error);
  }
};
