import { Anchor, Button, Container, Paper, PasswordInput, Text, TextInput, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function Login() {
  return (
    <Container size={420} my={40}>
      <Title ta="center">Login</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{" "}
        <Anchor component={Link} size="sm" to="/register">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Email" placeholder="Your email" required />
        <PasswordInput label="Password" placeholder="Your password" required mt="md" />
        <Button fullWidth mt="xl">
          Sign in
        </Button>
      </Paper>
    </Container>
  );
}
