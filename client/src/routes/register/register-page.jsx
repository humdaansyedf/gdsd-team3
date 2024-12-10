import {
  Anchor,
  Button,
  Container,
  Group,
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
          phone: values.phone,
          address: values.address,
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
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
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
        return null;
      },
      phone: (value) => {
        if (!value) {
          return null;
        }
        const isGermanMobile = /^(\+49|0049|0)(15|16|17)\d{8,9}$/.test(value);
        if (!isGermanMobile) {
          return "Invalid phone number";
        }
        return null;
      },
      password: (value) => (value.length < 8 ? "Password must have at least 8 letters" : null),
      confirmPassword: (value, values) => (value !== values.password ? "Passwords do not match" : null),
    },
  });

  return (
    <Container size={600} my={40}>
      <Title ta="center">Register</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Anchor component={Link} size="sm" to="/login">
          Login
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
        <Title order={5} mt="md">
          Personal Details:
        </Title>
        <Group grow>
          <TextInput
            label="Name"
            placeholder="Your name"
            {...form.getInputProps("name")}
            disabled={registerMutation.isPending}
            withAsterisk
          />
          <TextInput
            label="Email"
            placeholder="Your email"
            {...form.getInputProps("email")}
            disabled={registerMutation.isPending}
            withAsterisk
          />
        </Group>
        <Group grow mt="md">
          <TextInput
            label="Phone"
            placeholder="Your phone"
            {...form.getInputProps("phone")}
            disabled={registerMutation.isPending}
          />
          <TextInput
            label="Address"
            placeholder="Your address"
            {...form.getInputProps("address")}
            disabled={registerMutation.isPending}
          />
        </Group>
        <Title order={5} mt="md">
          Password
        </Title>
        <Group grow>
          <PasswordInput
            label="Password"
            placeholder="Your password"
            {...form.getInputProps("password")}
            disabled={registerMutation.isPending}
            withAsterisk
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            {...form.getInputProps("confirmPassword")}
            disabled={registerMutation.isPending}
            withAsterisk
          />
        </Group>

        <Button type="submit" fullWidth mt="xl" loading={registerMutation.isPending}>
          Create account
        </Button>
      </Paper>
    </Container>
  );
}
