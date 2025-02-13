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
import {
  IconArrowLeft,
  IconSend,
  IconChecks,
  IconCheck,
} from "@tabler/icons-react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../lib/auth-context";
import classes from "./mymessages.module.css";
import {
  useChatUsers,
  useChatHistory,
  useUnreadMessages,
} from "./mymessages-queries.jsx";

// Connect to the Socket.IO server
const socket = io();

export function Mymessages() {
  const { state } = useLocation(); // Contains propertyId, otherUserId from propertyDetailsPage
  const { propertyId, selectedUserId: initialSelectedUserId } = state || {};
  const [selectedUserId, setSelectedUserId] = useState(
    initialSelectedUserId || null
  );

  const [activePropertyId, setActivePropertyId] = useState(propertyId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedUser, setSelectedUser] = useState({ name: null });

  // Logged-in user's details
  const auth = useAuth();
  const currentUserId = auth?.user?.id;

  const { data: fetchedUsers = [] } = useChatUsers(currentUserId);
  const { data: fetchedMessages = [] } = useChatHistory(
    activePropertyId,
    currentUserId,
    selectedUserId
  );
  const { data: fetchedUnreadMessages = [] } = useUnreadMessages(currentUserId);

  //Syncing above variables with local changes
  useEffect(() => {
    //fetch users list, unread messages and join notifications room, upon user login.
    if (currentUserId) {
      setUsers(fetchedUsers);
      setNotifications(fetchedUnreadMessages);
      socket.emit("join_notifications", {
        currentUserId,
      });
    }
  }, [currentUserId, fetchedUsers, fetchedUnreadMessages]);

  useEffect(() => {
    //fetch chat history for particular chat-depends on propertyId change
    if (fetchedMessages) {
      // console.log("fetched messages", fetchedMessages);
      const transformedMessages = fetchedMessages.map((msg) => ({
        ...msg,
        align: msg.userid === currentUserId ? "right" : "left",
      }));
      //to avoid infinite renders
      if (JSON.stringify(transformedMessages) !== JSON.stringify(messages)) {
        setMessages(transformedMessages);
      }
    }
  }, [fetchedMessages, activePropertyId]);

  useEffect(() => {
    if (!currentUserId) return;

    const handleReceiveMessage = (data) => {
      const isActiveChat = data.senderId === selectedUserId;

      // add to messages
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.id,
          senderId: data.senderId,
          content: data.content,
          align: "left",
          createdAt: data.createdAt,
          seenAt: data.seenAt,
        },
      ]);

      //update last message
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId
            ? { ...user, lastMessage: data.content }
            : user
        )
      );

      if (isActiveChat) {
        socket.emit("mark_notifications_as_read", {
          propertyId: activePropertyId,
          currentUserId: currentUserId,
          selectedUserId: selectedUserId,
        });
      }
    };

    const handleNewNotification = (notificationData) => {
      console.log("notification received", notificationData);
      // if not in active chat - update notification count
      if (notificationData.senderId !== selectedUserId) {
        setNotifications((prev) => [notificationData, ...prev]);
      }
      //update last message when notif received-important when chat not open
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === notificationData.senderId
            ? { ...user, lastMessage: notificationData.content }
            : user
        )
      );
    };

    const handleMessagesMarkedAsRead = ({ seenAt, senderId }) => {
      //update messages with seenAt time
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === senderId ? { ...msg, seenAt } : msg
        )
      );
      //update notifications count
      setNotifications((prev) => prev.filter((n) => n.senderId !== senderId));
    };

    //for socket errors
    const handleError = (errorMessage) => {
      console.error("Socket error:", errorMessage);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("new_notification", handleNewNotification);
    socket.on("messages_marked_as_read", handleMessagesMarkedAsRead);
    socket.on("error", handleError);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("new_notification", handleNewNotification);
      socket.off("messages_marked_as_read", handleMessagesMarkedAsRead);
      socket.off("error", handleError);
    };
  }, [auth?.user?.id, activePropertyId, selectedUserId]);

  const handleUserClick = (user) => {
    //reset messages state
    setMessages([]);

    //join/create a chatroom
    socket.emit("join_room", {
      propertyId: user.propertyId,
      currentUserId,
      selectedUserId: user.id,
    });
    setSelectedUser({ name: user.name }); //to display selected user name
    // console.log("selected user", selectedUser);
    setSelectedUserId(user.id); //important to fetch chat data

    const updatedPropertyId = user.propertyId || activePropertyId;
    setActivePropertyId(updatedPropertyId);

    //mark all messages read -internally marks only updates seen status for unread messages
    socket.emit("mark_notifications_as_read", {
      propertyId: updatedPropertyId,
      currentUserId: currentUserId,
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

    //add to messages
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        senderId: currentUserId,
        content: messageContent,
        align: "right",
        createdAt: new Date(),
      },
    ]);

    //update last message for sender
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUserId
          ? { ...user, lastMessage: messageContent }
          : user
      )
    );

    setNewMessage("");
  };

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
          <>
            <Group
              p="sm"
              gap="xs"
              style={{ borderBottom: "1px solid #e5e5e5" }}
            >
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

            <ScrollArea style={{ height: "70vh" }}>
              <Stack p="xs">
                {messages.map((message, index) => (
                  <Group
                    key={message.id} //was index
                    align="center"
                    justify={
                      message.align === "right" ? "flex-end" : "flex-start"
                    }
                  >
                    {message.align === "left" && <Avatar radius="xl" />}

                    <Stack gap={2} style={{ maxWidth: "80%" }}>
                      <Paper
                        withBorder
                        p="xs"
                        bg={message.align === "right" ? "green.1" : "gray.1"}
                        style={{
                          marginLeft: message.align === "right" ? "auto" : 0,
                          marginRight: message.align === "left" ? "auto" : 0,
                        }}
                      >
                        <Text size="sm">{message.content}</Text>
                      </Paper>

                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </Text>
                        {message.align === "right" &&
                          (message.seenAt ? (
                            <IconChecks size={14} color="green" />
                          ) : (
                            <IconCheck size={14} color="gray" />
                          ))}
                      </Group>
                    </Stack>
                  </Group>
                ))}
              </Stack>
            </ScrollArea>

            <Group p="sm" gap="xs" style={{ borderTop: "1px solid #e5e5e5" }}>
              <TextInput
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
          </>
        )}
      </Paper>
    </Container>
  );
}
