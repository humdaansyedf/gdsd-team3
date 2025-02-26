import { prisma } from "../prisma/index.js";

export const getChatByParticipants = async (
  propertyId,
  currentUserId,
  selectedUserId
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
