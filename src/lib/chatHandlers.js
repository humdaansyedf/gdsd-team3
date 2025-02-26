import { prisma } from "../prisma/index.js";
import { getChatByParticipants } from "./chatUtils.js";

export const chatHandlers = (io, socket) => {
  socket.on(
    "join_room",
    async ({ propertyId, currentUserId, selectedUserId }) => {
      try {
        const chat = await getChatByParticipants(
          propertyId,
          currentUserId,
          selectedUserId
        );
        if (!chat) {
          socket.emit("error", "Chat not found");
          return;
        }

        const chatId = chat.id;
        socket.join(chatId);
        socket.to(chatId).emit("user_joined", { userId: currentUserId });
      } catch (error) {
        socket.emit("error", "Could not join the room");
      }
    }
  );

  socket.on("join_notifications", ({ currentUserId }) => {
    //for fix- added pId
    try {
      const notificationsRoom = `notifications_${currentUserId}`;

      socket.join(notificationsRoom);
      // console.log(`User ${currentUserId} joined notifications room`);
    } catch (error) {
      socket.emit("error", "Could not join notifications room");
    }
  });

  socket.on(
    "send_message",
    async ({ propertyId, currentUserId, selectedUserId, content }) => {
      try {
        let chat = await getChatByParticipants(
          propertyId,
          currentUserId,
          selectedUserId
        );

        //create chatroom if not present
        if (!chat) {
          chat = await prisma.chat.create({
            data: {
              propertyId: propertyId,
              lastMessageAt: new Date(),
              participants: {
                create: [{ userid: currentUserId }, { userid: selectedUserId }],
              },
            },
          });
        }

        const chatId = chat.id;
        socket.join(chatId);

        //create message
        const message = await prisma.message.create({
          data: {
            chatid: chatId,
            userid: currentUserId,
            content: content,
          },
        });

        //update last message time
        await prisma.chat.update({
          where: { id: chatId },
          data: { lastMessageAt: new Date() },
        });

        //create notification
        await prisma.notification.create({
          data: {
            userId: selectedUserId,
            chatId: chatId,
            messageId: message.id,
          },
        });

        //send notification - for fix
        socket.to(`notifications_${selectedUserId}`).emit("new_notification", {
          type: "message",
          chatId: chat.id,
          messageId: message.id,
          propertyId: propertyId,
          senderId: currentUserId,
          content,
          createdAt: message.createdAt,
        });

        //send message  -new fix
        // socket.broadcast.to(chatId).emit("receive_message", {
        //   id: message.id,
        //   chatId: chatId,
        //   senderId: currentUserId,
        //   content: content,
        //   createdAt: message.createdAt,
        //   seenAt: null,
        // });

        socket.to(chatId).emit("receive_message", {
          id: message.id,
          chatId: chatId,
          messageId: message.id,
          propertyId: propertyId,
          senderId: currentUserId,
          content: content,
          createdAt: message.createdAt,
          seenAt: null,
        });
      } catch (error) {
        socket.emit("error", "Could not send message");
      }
    }
  );

  socket.on(
    "mark_notifications_as_read",
    async ({ currentUserId, selectedUserId, propertyId }) => {
      try {
        let chat = await getChatByParticipants(
          propertyId,
          currentUserId,
          selectedUserId
        );

        //update messages table
        await prisma.message.updateMany({
          where: {
            chatid: chat.id,
            userid: selectedUserId,
            seenAt: null,
          },
          data: {
            seenAt: new Date(),
          },
        });

        //update readAt times in notification table
        await prisma.notification.updateMany({
          where: {
            userId: currentUserId,
            chatId: chat.id,
            readAt: { equals: null },
          },
          data: { readAt: new Date() },
        });

        socket.broadcast.to(chat.id).emit("messages_marked_as_read", {
          seenAt: new Date(),
          senderId: selectedUserId,
        });
      } catch (error) {
        socket.emit("error", "Could not mark notifications as read", error);
      }
    }
  );
};
