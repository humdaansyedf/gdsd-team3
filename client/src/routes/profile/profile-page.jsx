import { Avatar, Badge, Button, Container, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";

export function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container size="xs" mt="xl">
      <Paper withBorder shadow="md" p="lg">
        <Stack align="center" spacing="xs">
          <Avatar size="xl" />

          <Badge size="lg" radius="sm" variant="light">
            {user.type}
          </Badge>

          <Flex direction="column" align="center">
            <Title order={3}>{user.name}</Title>
            <Text>Email: {user.email || "N/A"}</Text>
            <Text>Phone: {user.phone || "N/A"}</Text>
            <Text>Address: {user.address || "N/A"}</Text>
          </Flex>

          <Group position="center">
            <Button variant="filled" size="md" color="green" component={Link} to="/profile/edit">
              Edit Profile
            </Button>

            {user.type === "STUDENT" && (
              <Button variant="filled" size="md" color="blue" component={Link} to="/my-documents">
                My Documents
              </Button>
            )}

            <Button variant="filled" size="md" color="red" onClick={logout}>
              Logout
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
