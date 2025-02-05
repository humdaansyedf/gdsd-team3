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
  Indicator,
} from "@mantine/core";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../lib/auth-context";
import classes from "./mymessages.module.css";
import {
  useChatUsers,
  useChatHistory,
  useMarkNotificationsAsRead,
  useUnreadMessages,
} from "./mymessages-queries.jsx";

// Connect to the Socket.IO server
const socket = io();

export function Mymessages() {
  const { state } = useLocation(); // Contains propertyId, otherUserId from propertyDetailsPage
  const { propertyId, selectedUserId: initialSelectedUserId } = state || {}; // Ensure state is destructured safely

  const [selectedUserId, setSelectedUserId] = useState(
    initialSelectedUserId || null
  ); // Initialize selectedUserId from state
  const [activePropertyId, setActivePropertyId] = useState(propertyId || null); // Initialize activePropertyId from state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const auth = useAuth(); // Logged-in user's details
  const currentUserId = auth?.user?.id;

  // fetch users that the current user has chatted with
  const {
    data: fetchedUsers = [],
    isLoading: loadingUsers,
    error: usersError,
  } = useChatUsers(currentUserId);

  // sync with local
  useEffect(() => {
    setUsers(fetchedUsers);
  }, [fetchedUsers]);

  // fetch chat history for the selected user and property
  const {
    data: fetchedMessages = [],
    isLoading: loadingMessages,
    error: messagesError,
  } = useChatHistory(activePropertyId, currentUserId, selectedUserId);

  // sync with local
  useEffect(() => {
    if (fetchedMessages) {
      const transformedMessages = fetchedMessages.map((msg) => ({
        ...msg,
        align: msg.userid === currentUserId ? "right" : "left",
      }));
      setMessages(transformedMessages);
    }
  }, [fetchedMessages, currentUserId]);

  //fetch unread messages
  const {
    data: fetchedUnreadMessages = [],
    isLoading: loadingUnreadMessages,
    error: Error,
  } = useUnreadMessages(currentUserId);

  //sync with local
  useEffect(() => {
    setNotifications(fetchedUnreadMessages);
  }, [fetchedUnreadMessages]);

  console.log("fetchedUnreadMessages", users);

  // mark notifications as read using a mutation
  const { mutate: markNotificationsAsRead } = useMarkNotificationsAsRead();

  useEffect(() => {
    if (!currentUserId) return;

    const handleReceiveMessage = (data) => {
      console.log("received nessage", data);
      // data: { id, chatId, userId, content, createdAt }
      if (data.userId !== currentUserId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: data.userId,
            content: data.content,
            align: "left",
            createdAt: data.createdAt,
          },
        ]);
      }
    };

    const handleNewNotification = (notificationData) => {
      // notificationData: { chatId, senderId, messageId, content, createdAt }
      console.log("notifications", notificationData);
      if (notificationData.senderId !== selectedUserId) {
        setNotifications((prev) => [notificationData, ...prev]);
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === notificationData.senderId
            ? { ...user, lastMessage: notificationData.content }
            : user
        )
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("new_notification", handleNewNotification);

    socket.emit("join_room", {
      propertyId: activePropertyId,
      currentUserId,
      selectedUserId,
    });

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("new_notification", handleNewNotification);
    };
  }, [currentUserId, activePropertyId, selectedUserId]);

  const handleUserClick = (user) => {
    setSelectedUserId(user.id);
    setMessages([]);

    const updatedPropertyId = user.propertyId || activePropertyId;
    setActivePropertyId(updatedPropertyId);

    markNotificationsAsRead({
      propertyId: updatedPropertyId,
      currentUserId,
      selectedUserId: user.id,
    });
    setNotifications((prev) => prev.filter((n) => n.senderId !== user.id));
  };

  const handleSendMessage = () => {
    const messageContent = newMessage.trim();
    if (!messageContent || !currentUserId) return;

    const messageData = {
      propertyId: activePropertyId,
      currentUserId,
      selectedUserId,
      content: messageContent,
    };

    socket.emit("send_message", messageData);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: currentUserId,
        content: messageContent,
        align: "right",
        createdAt: new Date(),
      },
    ]);

    setNewMessage("");
  };

  const selectedUser = users.find((user) => user.id === selectedUserId);

  return (
    <Container
      fluid
      px={0}
      className={classes.chatContainer}
      data-active={selectedUserId !== null}
    >
      <Paper withBorder shadow="sm" className={classes.chatLeft}>
        {users.map((user) => (
          <UnstyledButton
            key={user.id}
            onClick={() => handleUserClick(user)}
            data-active={selectedUserId === user.id}
          >
            <Group p="xs" gap="xs" wrap="nowrap">
              <Indicator
                label={
                  notifications.filter((n) => n.senderId === user.id).length
                }
                size={16}
                disabled={
                  notifications.filter((n) => n.senderId === user.id).length ===
                  0
                }
              >
                <Avatar />
              </Indicator>
              <Stack gap={0}>
                <Text size="sm" weight={500}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed">
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
              onClick={() => setSelectedUserId(null)}
            >
              <IconArrowLeft />
            </ActionIcon>
            <Title order={3}>{selectedUser.name}</Title>
          </Group>
        )}

        <ScrollArea>
          <Stack p="xs">
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  maxWidth: "70%",
                  marginLeft: message.align === "right" ? "auto" : undefined,
                  marginRight: message.align === "left" ? "auto" : undefined,
                }}
              >
                <Group
                  align={message.align === "right" ? "flex-end" : "flex-start"}
                  style={{
                    justifyContent:
                      message.align === "right" ? "flex-end" : "flex-start",
                  }}
                >
                  {message.align === "left" && <Avatar radius="xl" />}
                  <Paper
                    withBorder
                    p="xs"
                    bg={message.align === "right" ? "green.1" : "gray.1"}
                  >
                    <Text size="sm">{message.content}</Text>
                  </Paper>
                </Group>

                <Text
                  size="xs"
                  c="dimmed"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: message.align === "left" ? "100%" : undefined,
                    right: message.align === "right" ? "100%" : undefined,
                    marginLeft: message.align === "left" ? 8 : undefined,
                    marginRight: message.align === "right" ? 8 : undefined,
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </Text>

                {message.align === "right" && message.seenAt && (
                  <Text
                    size="xs"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: -48,
                      color: "gray",
                    }}
                  >
                    ✔
                  </Text>
                )}
              </div>
            ))}
          </Stack>
        </ScrollArea>

        {selectedUserId && (
          <Group
            mt="auto"
            p="sm"
            gap="xs"
            style={{ borderTop: "1px solid #e5e5e5" }}
          >
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
            <ActionIcon
              variant="filled"
              color="green"
              size="lg"
              onClick={handleSendMessage}
            >
              <IconSend />
            </ActionIcon>
          </Group>
        )}
      </Paper>
    </Container>
  );
}
