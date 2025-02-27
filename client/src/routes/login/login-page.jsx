import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

export function Login() {
  const queryClient = useQueryClient();
  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      const data = await response.json();
      queryClient.refetchQueries({
        queryKey: ["me"],
      });

      if (response.ok) {
        notifications.show({
          title: "Login successful",
          message: "You have successfully logged in",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Failed to login",
          message: data.message,
          color: "red",
        });
      }

      return data;
    },
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 8 ? "Password must have at least 8 letters" : null,
    },
  });

  return (
    <Container size={420} mt={20}>
      <Title ta="center">Login</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{" "}
        <Anchor component={Link} size="sm" to="/register">
          Create account
        </Anchor>
      </Text>

      <Paper
        component="form"
        withBorder
        shadow="md"
        p={30}
        mt={30}
        radius="md"
        onSubmit={form.onSubmit((values) => loginMutation.mutate(values))}
      >
        <TextInput
          label="Email"
          placeholder="Your email"
          {...form.getInputProps("email")}
          disabled={loginMutation.isPending}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          {...form.getInputProps("password")}
          disabled={loginMutation.isPending}
        />
        <Button
          type="submit"
          fullWidth
          mt="xl"
          loading={loginMutation.isPending}
        >
          Sign in
        </Button>
      </Paper>
    </Container>
  );
}
