import {
  ActionIcon,
  Avatar,
  Center,
  Container,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../lib/auth-context";
import classes from "./mymessages.module.css";

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
        setMessages((prevMessages) => [...prevMessages, { sender: data.from, content: data.content, align: "left" }]);
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === data.from ? { ...user, lastMessage: data.content } : user))
        );
      }
    };

    // Automatically fetch chat history if `selectedUserId` and `activePropertyId` are set
    if (selectedUserId && activePropertyId) {
      if (auth.user.id !== selectedUserId) {
        socket.emit("join_room", {
          propertyId: activePropertyId,
          currentUserId: auth.user.id,
          selectedUserId: selectedUserId,
        });
      } else {
        console.log("User clicked themselves; skipping room join.");
      }
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
  }, [auth?.user?.id, activePropertyId, selectedUserId]);

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

    setMessages((prevMessages) => [...prevMessages, { sender: "Me", content: messageContent, align: "right" }]);

    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === auth.user.id ? { ...user, lastMessage: messageContent } : user))
    );

    setNewMessage("");
  };

  const selectedUser = users.find((user) => user.id === selectedUserId);

  return (
    <Container fluid px={0} className={classes.chatContainer} data-active={selectedUserId !== null}>
      <Paper withBorder shadow="sm" className={classes.chatLeft}>
        {users.map((user, index) => (
          <UnstyledButton
            className={classes.chatListButton}
            key={index}
            onClick={() => handleUserClick(user)}
            data-active={selectedUserId === user.id}
          >
            <Group p="xs" gap="xs" wrap="nowrap">
              <Avatar />
              <Stack
                gap={0}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <Text size="sm" weight={500}>
                  {user.name}
                </Text>
                <Text
                  size="xs"
                  c="dimmed"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={user.lastMessage}
                >
                  {user.lastMessage}
                </Text>
              </Stack>
            </Group>
          </UnstyledButton>
        ))}
      </Paper>

      <Paper withBorder shadow="sm" className={classes.chatRight}>
        {!selectedUserId && (
          <Center h="100%">
            <Text align="center">Select a user to start chatting</Text>
          </Center>
        )}
        {selectedUserId && (
          <Group p="sm" gap="xs" style={{ borderBottom: "1px solid #e5e5e5" }}>
            <ActionIcon
              variant="subtle"
              color="green"
              size="lg"
              onClick={() => {
                setSelectedUserId(null);
                setMessages([]);
              }}
            >
              <IconArrowLeft />
            </ActionIcon>
            <Title order={3}>{selectedUser.name}</Title>
          </Group>
        )}
        <ScrollArea>
          <Stack p="xs">
            {messages.map((message, index) => (
              <Group
                key={index}
                align={message.align === "right" ? "flex-end" : "flex-start"}
                style={{
                  justifyContent: message.align === "right" ? "flex-end" : "flex-start",
                }}
              >
                {message.align === "left" && <Avatar radius="xl" />}
                <Paper withBorder p="xs" bg={message.align === "right" ? "green.1" : "gray.1"} maw="70%">
                  <Text size="sm">{message.content}</Text>
                </Paper>
              </Group>
            ))}
          </Stack>
        </ScrollArea>

        {selectedUserId && (
          <Group mt="auto" p="sm" gap="xs" style={{ borderTop: "1px solid #e5e5e5" }}>
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
            <ActionIcon variant="filled" color="green" size="lg" onClick={handleSendMessage}>
              <IconSend />
            </ActionIcon>
          </Group>
        )}
      </Paper>
    </Container>
  );
}
