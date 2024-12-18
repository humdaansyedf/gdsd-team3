export const chatHandlers = (io, socket, prisma) => {
    // Join a chat room
    /*
    socket.on('join_room', ({ chatId, currentUserId }) => {
        socket.join(chatId); // Join the chat room
        console.log(`${currentUserId} joined room: ${chatId}`);
      });
      */
      socket.on('join_room', async ({ propertyId, currentUserId, selectedUserId }) => {
        try {
          // Find the chat by propertyId and both user IDs
          let chat = await prisma.chat.findFirst({
            where: {
              propertyid: propertyId,
              participants: {
                every: {
                  OR: [
                    
                    { userid: currentUserId },
                    { userid: selectedUserId },
                  ],
                },
              },
            },
          });
      
          console.log("Chat room lookup result:", chat);
      
          // If the chat doesn't exist, create it
          if (!chat) {
            chat = await prisma.chat.create({
              data: {
                propertyId: propertyId,
                lastMessageAt: new Date(),
                participants: {
                  create: [
                    { userid: currentUserId },
                    { userid: selectedUserId },
                  ],
                },
              },
            });
            console.log(`Created new chat room: ${chat.id}`);
          }
      
          const chatId = chat.id;
      
          // Join the room
          socket.join(chatId);
          console.log(`${currentUserId} joined room: ${chatId}`);
      
          // Notify other users in the room
          socket.to(chatId).emit('user_joined', { userId: currentUserId });
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', 'Could not join the room');
        }
      });
      
      
      
  
      socket.on('send_message', async ({ propertyId, currentUserId, selectedUserId, content }) => {
        console.log("Message being created");
      
        try {
          // Find or create the chat room based on propertyId, currentUserId, and selectedUserId
          let chat = await prisma.chat.findFirst({
            where: {
              propertyId: propertyId,
              participants: {
                every: {
                  OR: [
                    { userid: currentUserId },
                    { userid: selectedUserId },
                  ],
                },
              },
            },
          });
      
          // Retrieve the chatId from the found or created chat
          const chatId = chat.id;
      
          // Save the message in the database
          const message = await prisma.message.create({
            data: {
              chatid: chatId,
              userid: parseInt(currentUserId), // Ensure the currentUserId is an integer
              content,
            },
          });
      
          console.log("Message created:", message);
      
          // Emit the message to everyone in the room
          io.to(`chat_${chatId}`).emit('receive_message', {
            id: message.id,
            chatId: message.chatid,
            userId: message.userid,
            content: message.content,
            createdAt: message.createdAt,
          });
      
        } catch (error) {
          console.error('Error saving message:', error);
          socket.emit('error', 'Could not send message');
        }
      });
  
      socket.on('getChatHistory', async ({ propertyId, currentUserId, selectedUserId }) => {
        try {
          // Find the chat room using propertyId, currentUserId, and selectedUserId
          const chat = await prisma.chat.findFirst({
            where: {
              propertyId: propertyId,
              participants: {
                every: {
                  OR: [
                    { userid: currentUserId },
                    { userid: selectedUserId },
                  ],
                },
              },
            },
          });
      
          // If no chat room exists, return an empty history or notify the user
          if (!chat) {
            socket.emit('chatHistory', []);
            return;
          }
      
          const chatId = chat.id;
      
          // Fetch the messages for the chat room
          const messages = await prisma.message.findMany({
            where: { chatid: chatId },
            orderBy: { createdAt: 'asc' },
          });
      
          // Emit the chat history to the client
          socket.emit('chatHistory', messages);
        } catch (error) {
          console.error('Error fetching chat history:', error);
          socket.emit('error', 'Could not fetch chat history');
        }
      });
      

    socket.on('get_users_chatted_with', async ({ currentUserId }) => {
        try {
          // Step 1: Fetch all chatrooms where the user is a participant
          const chatrooms = await prisma.chatParticipant.findMany({
            where: {
              userid: currentUserId, 
            },
            include: {
              chat: {
                include: {
                  messages: {
                    orderBy: {
                      createdAt: 'desc',
                    },
                    take: 1, // Get the most recent message
                  },
                  participants: {
                    where: {
                      userid: {
                        not: currentUserId, // Exclude the current user
                      },
                    },
                    include: {
                      user: true, // Include user data (name, id, etc.) of the other participant
                    },
                  },
                },
              },
            },
          });
      
          // Step 2: Format the result
          const users = chatrooms.map(chatroom => {
            const participant = chatroom.chat.participants[0];  // Get the other participant(s)
            const lastMessage = chatroom.chat.messages[0];  // Get the last message in the chat
      
            return {
              id: participant.user.id,  // The other user in the chat
              name: participant.user.name,
              lastMessage: lastMessage ? lastMessage.content : "No messages",  // The last message, or a default if no messages
              
            };
          });
      
          // Step 3: Emit the result back to the client
          socket.emit('usersChattedWith', users);
        } catch (error) {
          console.error('Error fetching users the current user has chatted with:', error);
          socket.emit('error', 'Could not fetch chat data');
        }
      });
      

  };
  