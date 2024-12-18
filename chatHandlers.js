export const chatHandlers = (io, socket, prisma) => {
    // Join a chat room //check need?
    //find existing chatrooms for given property and user ids
    socket.on('join_room', async ({ propertyId, currentUserId, selectedUserId }) => {
      try {
        let chat = await prisma.chat.findFirst({
          where: {
            propertyId: propertyId,
            AND: [
              { participants: { some: { userid: currentUserId } } },
              { participants: { some: { userid: selectedUserId } } },
            ],
          },
        });   
        const chatId = chat.id;
    
        // Join the room
        socket.join(chatId);
        // console.log(`${currentUserId} joined room: ${chatId}`);
    
        // Notify other users in the room
        socket.to(chatId).emit('user_joined', { userId: currentUserId });
      } catch (error) {
        // console.error('Error joining room:', error);
        socket.emit('error', 'Could not join the room');
      }
    });
    
      
  //Send message logic
  //find existing chatrooms for given property and user ids-create room if not found
  //save message in db and broadcast to users in the room excluding current user
    socket.on('send_message', async ({ propertyId, currentUserId, selectedUserId, content }) => {
      try {
        let chat = await prisma.chat.findFirst({
          where: {
            propertyId: propertyId,
            AND: [
              { participants: { some: { userid: currentUserId } } },
              { participants: { some: { userid: selectedUserId } } },
            ],
          },
        });
    
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
          // console.log(`Created new chat room: ${chat.id}`);
        }
    
        const chatId = chat.id;
    
        // Join the room (in case the user hasn't joined yet)
        socket.join(chatId);
    
        // Save the message
        const message = await prisma.message.create({
          data: {
            chatid: chatId,
            userid: currentUserId,
            content: content,
          },
        });
    
        // Emit the message
        socket.broadcast.to(chatId).emit('receive_message', {
          id: message.id,
          chatId: chatId,
          userId: currentUserId,
          content: content,
          createdAt: message.createdAt,
        });
      } catch (error) {
        // console.error('Error sending message:', error);
        socket.emit('error', 'Could not send message');
      }
    });
    
  //chat history logic
  //find existing chatrooms for given property and user ids- send messages of that chatroomid
      socket.on('getChatHistory', async ({ propertyId, currentUserId, selectedUserId }) => {
        try {
          const chat = await prisma.chat.findFirst({
            where: {
              propertyId: propertyId,
              AND: [
                { participants: { some: { userid: currentUserId } } },
                { participants: { some: { userid: selectedUserId } } },
              ],
            },
          });
      
          if (!chat) {
            socket.emit('chatHistory', []); // No chat found
            return;
          }
      
          const messages = await prisma.message.findMany({
            where: { chatid: chat.id },
            orderBy: { createdAt: 'asc' },
          });
      
          socket.emit('chatHistory', messages);
        } catch (error) {
          // console.error('Error fetching chat history:', error);
          socket.emit('error', 'Could not fetch chat history');
        }
      });
      
//Fetch users this user has chatted with
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
            const propertyId = chatroom.chat.propertyId; 
            console.log("propertyId",propertyId);
            return {
              id: participant.user.id,  // The other user in the chat
              name: participant.user.name,
              propertyId:propertyId,
              lastMessage: lastMessage ? lastMessage.content : "No messages",  // The last message, or a default if no messages
              
            };
          });
      
          // Step 3: Emit the result back to the client
          socket.emit('usersChattedWith', users);
        } catch (error) {
          // console.error('Error fetching users the current user has chatted with:', error);
          socket.emit('error', 'Could not fetch chat data');
        }
      });
      

  };
  