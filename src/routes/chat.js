import { Router } from "express";
import { prisma } from "../prisma/index.js";
import { authMiddleware } from "./auth.js";
import { getChatByParticipants } from "../../chatUtils.js";

export const chatRouter = Router();
chatRouter.use(authMiddleware);

// route to get chat history
chatRouter.get(
  "/chats/:propertyId/:currentUserId/:selectedUserId",
  async (req, res) => {
    let { propertyId, currentUserId, selectedUserId } = req.params;

    currentUserId = parseInt(currentUserId);
    selectedUserId = parseInt(selectedUserId);
    propertyId = parseInt(propertyId);
    // console.log("fetching chats", currentUserId, selectedUserId, propertyId);
    try {
      const chat = await getChatByParticipants(
        propertyId,
        currentUserId,
        selectedUserId
      );

      if (!chat) return res.json([]); // No chat found

      //get all messages in the chatroom
      const messages = await prisma.message.findMany({
        where: { chatid: chat.id },
        orderBy: { createdAt: "asc" },
      });

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Could not fetch chat history" });
    }
  }
);

// route to mark notifications as read
chatRouter.post("/notifications/mark-read", async (req, res) => {
  let { currentUserId, selectedUserId, propertyId } = req.body;

  currentUserId = parseInt(currentUserId);
  selectedUserId = parseInt(selectedUserId);
  propertyId = parseInt(propertyId);
  try {
    const chat = await getChatByParticipants(
      propertyId,
      currentUserId,
      selectedUserId
    );

    if (!chat) return res.status(404).json({ error: "Chat not found" });

    //update message seen status
    await prisma.message.updateMany({
      where: { chatid: chat.id, userid: selectedUserId, seenAt: null },
      data: { seenAt: new Date() },
    });

    //update readAt times
    await prisma.notification.updateMany({
      where: { userId: currentUserId, chatId: chat.id, readAt: null },
      data: { readAt: new Date() },
    });

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Could not mark notifications as read" });
  }
});

// route to get users the current user has chatted with
chatRouter.get("/chats/users", async (req, res) => {
  const currentUserId = parseInt(req.query.currentUserId);

  // console.log("Fetching users for:", { currentUserId });
  try {
    const chatrooms = await prisma.chatParticipant.findMany({
      where: { userid: currentUserId },
      include: {
        chat: {
          include: {
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
            participants: {
              where: { userid: { not: currentUserId } },
              include: { user: true },
            },
          },
        },
      },
    });
    // console.dir(chatrooms, { depth: null });

    const users = chatrooms.map((chatroom) => ({
      id: chatroom.chat.participants[0].user.id,
      name: chatroom.chat.participants[0].user.name,
      propertyId: chatroom.chat.propertyId,
      lastMessage: chatroom.chat.messages[0]?.content || "No messages",
      lastMessageAt: chatroom.chat.lastMessageAt,
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch chat data" });
  }
});

//route to get unread messages for this user
chatRouter.get("/messages/unread", async (req, res) => {
  const currentUserId = parseInt(req.query.currentUserId);

  const unreadMessagesList = await prisma.message.findMany({
    where: {
      userid: { not: currentUserId },
      seenAt: null,
      chat: {
        participants: {
          some: { userid: currentUserId },
        },
      },
    },
    select: {
      chatid: true,
      userid: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const unreadMessages = unreadMessagesList.map((unreadMessage) => ({
    senderId: unreadMessage.userid,
    content: unreadMessage.content,
    createdAt: unreadMessage.createdAt,
  }));

  console.log(unreadMessages);

  res.json(unreadMessages);
});
