import { ActionIcon, Avatar, Container, Group, Paper, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconSend } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../lib/auth-context";

// Connect to the Socket.IO server
const socket = io("http://localhost:3000");

export function Mymessages() {

  const { state } = useLocation(); // Contains propertyId, otherUserId
  const { propertyId, selectedUserId: initialSelectedUserId } = state;

  const [selectedUserId, setSelectedUserId] = useState(initialSelectedUserId); // Local state for selectedUserId
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState();
  const [users, setUsers] = useState([]);

  const [chatId, setChatId] = useState(null); //default to 1
  
  const auth = useAuth(); // Get the logged-in user's details
  
  useEffect(() => {
    //console.log("authr", auth.user.id);
    if (auth && auth.user.id) {
      setCurrentUser(auth.user.id); //set current user id
      console.log("setting current user", auth.user.id, "propertyId, selectedUserId, state", propertyId, selectedUserId, state);
      
      // Only emit join_room if the current user and selected user are different
    if (auth.user.id !== selectedUserId) {
      // Emit join_room when the socket is connected and user is authenticated
      socket.emit("join_room", { propertyId, currentUserId: auth.user.id, selectedUserId: selectedUserId });
    } else {
      console.log("User is clicking on themselves, no need to join room.");
    }

      // Fetch users the current user has chatted with
      socket.emit("get_users_chatted_with", { currentUserId: auth.user.id });

      // Listen for the list of users and their last messages
      const handleUsersChattedWith = (data) => {
        console.log("Users list received in frontend:", data);
        setUsers(data);
      };

      socket.on("usersChattedWith", handleUsersChattedWith);

      // Fetch the chat history when the component mounts
      const fetchChatHistory = () => {
        socket.emit("getChatHistory", { propertyId, currentUserId: auth.user.id, selectedUserId });
      };

      socket.on("chatHistory", (chatHistory) => {
        console.log("Chat history received:", chatHistory);
        setMessages(chatHistory.map((msg) => ({
          sender: msg.userid === auth.user.id ? "Me" : msg.userid, // Set sender name based on user id
          content: msg.content,
          align: msg.userid === auth.user.id ? "right" : "left", // Align the message based on the sender
        })));
      });

      // Trigger fetch chat history when users are loaded
      fetchChatHistory();

      // Listen for incoming messages
      const handleReceiveMessage = (data) => {
        console.log("Message received:", data);

        if (data.from !== auth.user.id) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: data.from, content: data.content, align: "left" },
          ]);

          // Update the last message preview for the sender
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === data.from
                ? { ...user, lastMessage: data.content }
                : user
            )
          );
        }
      };

      socket.on("receive_message", handleReceiveMessage);

      // Cleanup listeners on unmount
      return () => {
        socket.off("usersChattedWith", handleUsersChattedWith);
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [auth, propertyId, selectedUserId]);

  const handleUserClick = (userId) => {
    
    // Emit join_room if the selected user is not the current user
    if (auth.user.id !== userId) {
      setSelectedUserId(userId);
      socket.emit("join_room", { propertyId, currentUserId: auth.user.id, selectedUserId: userId });
    } else {
      console.log("User is clicking on themselves, no need to join room. userId cuserId", userId, auth.user.id );
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && auth.user.id) {
      const messageData = { propertyId, currentUserId: auth.user.id, selectedUserId, content: newMessage };

      console.log("Sending message:", messageData);

      // Emit the message to the server
      socket.emit("send_message", messageData);

      // Add the message locally
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "Me", content: newMessage, align: "right" },
      ]);

      // Update the last message preview for the current user
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === auth.user.id
            ? { ...user, lastMessage: newMessage }
            : user
        )
      );

      setNewMessage(""); // Clear the input field
    }
  };
  return (
    <Container fluid my={20} style={{ display: "flex", gap: "20px" }}>
      {/* Left User List Section */}
      <Paper withBorder shadow="md" p={10} radius="md" style={{ width: "22%", minWidth: "220px" }}>
        <Stack spacing="sm">
          {users.map((user, index) => (
            <Paper
              key={index}
              withBorder
              p="sm"
              radius={20}
              shadow="xs"
              style={{
                backgroundColor: "#e8f5e9", // Light green background
                width: "100%", // Match the parent width
              }}
              onClick={() => handleUserClick(user.id)} // Add click handler
            >
              <Group spacing="sm" noWrap>
                <Avatar radius="xl" />
                <Stack spacing={0} style={{ flex: 1 }}>
                  <Text size="sm" weight={500}>
                    {user.name}
                  </Text>
                  <Text
                    size="xs"
                    color="dimmed"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={user.lastMessage} // Tooltip to show the full message
                  >
                    {user.lastMessage}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Paper>

      {/* Right Messaging Section */}
      <Paper withBorder shadow="md" radius="md" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Messages */}
        <ScrollArea style={{ flex: 1, padding: "10px 20px" }}>
          <Stack>
            {messages.map((message, index) => (
              <Group
                key={index}
                align={message.align === "right" ? "flex-end" : "flex-start"}
                style={{
                  justifyContent: message.align === "right" ? "flex-end" : "flex-start",
                }}
              >
                {message.align === "left" && <Avatar radius="xl" />}
                <Paper
                  shadow="sm"
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor: message.align === "right" ? "#d4f8d4" : "#f5f5f5",
                    maxWidth: "70%",
                  }}
                >
                  <Text size="sm">{message.content}</Text>
                </Paper>
              </Group>
            ))}
          </Stack>
        </ScrollArea>

        {/* Input Section */}
        <Group p="md" style={{ borderTop: "1px solid #e5e5e5" }}>
          <ActionIcon variant="light" size="lg" radius="md">
            <IconPlus />
          </ActionIcon>
          <TextInput
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1 }}
          />
          <ActionIcon variant="filled" color="green" size="lg" radius="md" onClick={handleSendMessage}>
            <IconSend />
          </ActionIcon>
        </Group>
      </Paper>
    </Container>
  );
}