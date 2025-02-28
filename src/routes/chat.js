import { Router } from "express";
import { prisma } from "../prisma/index.js";
import { authMiddleware } from "./auth.js";
import { getChatByParticipants } from "../lib/chatUtils.js";

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
            property: true,
          },
        },
      },
    });
    // console.dir(chatrooms, { depth: null });

    const users = chatrooms.map((chatroom) => ({
      id: chatroom.chat.participants[0].user.id,
      name: chatroom.chat.participants[0].user.name,
      propertyId: chatroom.chat.propertyId,
      propertyTitle: chatroom.chat.property.title,
      lastMessage: chatroom.chat.messages[0]?.content || "No messages",
      lastMessageAt: chatroom.chat.lastMessageAt,
    }));
    console.log("sending users");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not fetch users list" });
  }
});

//route to get unread messages for this user
chatRouter.get("/messages/unread", async (req, res) => {
  const currentUserId = parseInt(req.query.currentUserId);
  // console.log("entered unread route", currentUserId);
  try {
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
        id: true,
        chatid: true,
        userid: true,
        content: true,
        createdAt: true,
        chat: {
          select: {
            propertyId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const unreadMessages = unreadMessagesList.map((unreadMessage) => ({
      messageId: unreadMessage.id,
      senderId: unreadMessage.userid,
      content: unreadMessage.content,
      createdAt: unreadMessage.createdAt,
      propertyId: unreadMessage.chat.propertyId,
    }));

    res.json(unreadMessages);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch unread mesages" });
  }
});
