import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  SegmentedControl,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

export function Register() {
  const registerMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(`/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          type: values.type,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: "Account created",
          message: "You have successfully created an account",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Failed to create account",
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
      password: "",
      type: "STUDENT",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name must have at least 3 letters" : null),
      email: (value, values) => {
        const isEmail = /^\S+@\S+$/.test(value);
        if (!isEmail) {
          return "Invalid email";
        }

        if (values.type === "STUDENT" && !value.endsWith(".hs-fulda.de")) {
          return "Please use your university email";
        }
      },
      password: (value) => (value.length < 8 ? "Password must have at least 8 letters" : null),
    },
  });

  return (
    <Container size={420} my={40}>
      <Title ta="center">Register</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Anchor component={Link} size="sm" to="/login">
          Sign in
        </Anchor>
      </Text>

      <Paper
        component="form"
        withBorder
        shadow="md"
        p={30}
        mt={30}
        radius="md"
        onSubmit={form.onSubmit((values) => registerMutation.mutate(values))}
      >
        <SegmentedControl
          data={[
            {
              value: "STUDENT",
              label: "Student",
            },
            {
              value: "LANDLORD",
              label: "Landlord",
            },
          ]}
          {...form.getInputProps("type")}
          fullWidth
          disabled={registerMutation.isPending}
        />
        <TextInput
          label="Name"
          placeholder="Your name"
          mt="md"
          {...form.getInputProps("name")}
          disabled={registerMutation.isPending}
        />
        <TextInput
          label="Email"
          placeholder="Your email"
          mt="md"
          type="email"
          {...form.getInputProps("email")}
          disabled={registerMutation.isPending}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          {...form.getInputProps("password")}
          disabled={registerMutation.isPending}
        />
        <Button type="submit" fullWidth mt="xl" loading={registerMutation.isPending}>
          Create account
        </Button>
      </Paper>
    </Container>
  );
}
