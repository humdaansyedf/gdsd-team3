import { ActionIcon, Avatar, Container, Group, Paper, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../lib/auth-context";

// Connect to the Socket.IO server
const socket = io();

export function Mymessages() {

  const { state } = useLocation(); // Contains propertyId, otherUserId from propertyDetailsPage
  const { propertyId, selectedUserId: initialSelectedUserId } = state || {}; // Ensure state is destructured safely
  
  const [selectedUserId, setSelectedUserId] = useState(initialSelectedUserId || null); // Initialize selectedUserId from state
  const [activePropertyId, setActivePropertyId] = useState(propertyId || null); // Initialize activePropertyId from state

  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);

 

  const auth = useAuth(); // Logged-in user's details
  
  useEffect(() => {
    if (!auth?.user?.id) return;
  
    const currentUserId = auth.user.id;
    socket.emit("get_users_chatted_with", { currentUserId });
  
    const handleUsersChattedWith = (data) => setUsers(data);
    const handleReceiveMessage = (data) => {
      if (data.from !== currentUserId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: data.from, content: data.content, align: "left" },
        ]);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === data.from
              ? { ...user, lastMessage: data.content }
              : user
          )
        );
      }
    };
  
      // Automatically fetch chat history if `selectedUserId` and `activePropertyId` are set
  if (selectedUserId && activePropertyId) {
    joinRoomIfNotCurrentUser(selectedUserId, activePropertyId);
    socket.emit("getChatHistory", {
      propertyId: activePropertyId,
      currentUserId,
      selectedUserId,
    });
  }

  
    const handleChatHistory = (chatHistory) => {
      setMessages(
        chatHistory.map((msg) => ({
          sender: msg.userid === currentUserId ? "Me" : msg.userid,
          content: msg.content,
          align: msg.userid === currentUserId ? "right" : "left",
        }))
      );
    };
  
    socket.on("usersChattedWith", handleUsersChattedWith);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("chatHistory", handleChatHistory);
  
    //cleanup
    return () => {
      socket.off("usersChattedWith", handleUsersChattedWith);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("chatHistory", handleChatHistory);
    };
  }, [auth?.user?.id, activePropertyId, selectedUserId, socket]);

  //check usage
  const joinRoomIfNotCurrentUser = (selectedUserId, activePropertyId) => {
    if (auth.user.id !== selectedUserId) {
      socket.emit("join_room", {
        propertyId: activePropertyId,
        currentUserId: auth.user.id,
        selectedUserId: selectedUserId,
      });
    } else {
      console.log("User clicked themselves; skipping room join.");
    }
  };
  

  const handleUserClick = (user) => {
   
      console.log("handleUserClick: selected user", user);
      
        setSelectedUserId(user.id);
        setMessages([]);
        const updatedPropertyId = user.propertyId || activePropertyId;
        setActivePropertyId(updatedPropertyId);
    
        socket.emit("getChatHistory", {
          propertyId: updatedPropertyId,
          currentUserId: auth.user.id,
          selectedUserId: user.id,
        });
       
  };

  
  
  const handleSendMessage = () => {
    const messageContent = newMessage.trim();
    if (!messageContent || !auth.user.id) return;
  
    const messageData = {
      propertyId: activePropertyId,
      currentUserId: auth.user.id,
      selectedUserId,
      content: messageContent,
    };
  
    console.log("Sending message:", messageData);
    socket.emit("send_message", messageData);
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "Me", content: messageContent, align: "right" },
    ]);
  
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === auth.user.id
          ? { ...user, lastMessage: messageContent }
          : user
      )
    );
  
    setNewMessage("");
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
              backgroundColor: "#e8f5e9",
              width: "100%",
              cursor: "pointer", // Change cursor to pointer
              transition: "transform 0.3s ease, background-color 0.3s ease", // Smooth animation for scaling and background
            }}
            onClick={() => handleUserClick(user)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#c8e6c9"; // Hover background color
              e.currentTarget.style.transform = "scale(1.05)"; // Slightly enlarge the card
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#e8f5e9"; // Revert to original background color
              e.currentTarget.style.transform = "scale(1)"; // Reset size
            }}
          >
            <Group spacing="sm" noWrap>
              <Avatar radius="xl" />
              <Stack spacing={0} style={{ flex: 1 }}>
                <Text size="sm" weight={500}>
                  {user.name} {/* Updated with username */}
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
          <TextInput
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSendMessage(); 
              }
            }}
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