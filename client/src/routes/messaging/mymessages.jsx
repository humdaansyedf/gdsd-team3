import {
  ActionIcon,
  Avatar,
  Container,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconSend } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Connect to the Socket.IO server
const socket = io("http://localhost:3000");

export function Mymessages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [users, setUsers] = useState([
    {
      id: "User 1",
      lastMessage: "Hello there! I've been waiting.",
    },
    { id: "User 2", lastMessage: "How are you?" },
    {
      id: "User 3",
      lastMessage: "Are you coming?",
    },
    { id: "User 4", lastMessage: "Good morning!" },
    { id: "User 5", lastMessage: "I'm interested." },
  ]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("connect", () => {
      setCurrentUser(socket.id);
    });

    socket.on("receive_message", (data) => {
      if (data.from !== socket.id) {
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
    });

    return () => {
      socket.off("receive_message");
      socket.off("connect");
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = { content: newMessage };

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
          user.id === currentUser
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
      <Paper
        withBorder
        shadow="md"
        p={10}
        radius="md"
        style={{ width: "22%", minWidth: "220px" }}
      >
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
            >
              <Group spacing="sm" noWrap>
                <Avatar radius="xl" />
                <Stack spacing={0} style={{ flex: 1 }}>
                  <Text size="sm" weight={500}>
                    {user.id}
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
      <Paper
        withBorder
        shadow="md"
        radius="md"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {/* Messages */}
        <ScrollArea style={{ flex: 1, padding: "10px 20px" }}>
          <Stack>
            {messages.map((message, index) => (
              <Group
                key={index}
                align={message.align === "right" ? "flex-end" : "flex-start"}
                style={{
                  justifyContent:
                    message.align === "right" ? "flex-end" : "flex-start",
                }}
              >
                {message.align === "left" && <Avatar radius="xl" />}
                <Paper
                  shadow="sm"
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor:
                      message.align === "right" ? "#d4f8d4" : "#f5f5f5",
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
          <ActionIcon
            variant="filled"
            color="green"
            size="lg"
            radius="md"
            onClick={handleSendMessage}
          >
            <IconSend />
          </ActionIcon>
        </Group>
      </Paper>
    </Container>
  );
}
