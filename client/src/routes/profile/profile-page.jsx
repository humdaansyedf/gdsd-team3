import { Avatar, Box, Button, Card, Group, Text, Title } from "@mantine/core";
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";

export function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Card
      shadow="md"
      padding="lg"
      radius="md"
      style={{
        maxWidth: 400,
        margin: "auto",
        marginTop: "40px",
        backgroundColor: "#ECF6E9",
        color: "#000",
        textAlign: "center",
      }}
    >
      {/* Profile Picture */}
      <Box
        style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
      >
        <Avatar size="xl" radius="xl" />
      </Box>

      {/* Type Tag */}
      <Box style={{ textAlign: "center", marginBottom: 10 }}>
        <Text
          size="sm"
          style={{
            display: "inline-block",
            padding: "4px 10px",
            border: "1px solid #000",
            borderRadius: 8,
          }}
        >
          {user.type}
        </Text>
      </Box>

      {/* Profile Info */}
      <Title order={3} style={{ fontFamily: "sans-serif", marginBottom: 10 }}>
        {user.name}
      </Title>
      <Text>Email: {user.email || "N/A"}</Text>
      <Text>Phone: {user.phone || "N/A"}</Text>
      <Text>Address: {user.address || "N/A"}</Text>

      {/* Buttons */}
      <Group position="center" mt="md">
        {/**<Button variant="outline" size="sm" onClick={() => console.log("Edit clicked!")}>
          Edit
        </Button>**/}
        <Button variant="filled" size="sm" color="red" onClick={logout}>
          Logout
        </Button>
      </Group>
    </Card>
  );
}
