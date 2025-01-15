import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Container, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { AdminAuthContext } from "./admin-auth-context";

function AdminLogin() {
  const queryClient = useQueryClient();
  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(`/api/admin/login`, {
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
        queryKey: ["admin/me"],
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
      password: (value) => (value.length < 8 ? "Password must have at least 8 letters" : null),
    },
  });

  return (
    <Container size={420} my={40}>
      <Title ta="center">Admin Login</Title>

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
          placeholder="Admin email"
          {...form.getInputProps("email")}
          disabled={loginMutation.isPending}
        />
        <PasswordInput
          label="Password"
          placeholder="Admin password"
          mt="md"
          {...form.getInputProps("password")}
          disabled={loginMutation.isPending}
        />
        <Button type="submit" fullWidth mt="xl" loading={loginMutation.isPending}>
          Sign in as admin
        </Button>
      </Paper>
    </Container>
  );
}

export const AdminAuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const adminQuery = useQuery({
    queryKey: ["admin/me"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/me`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/admin/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      queryClient.refetchQueries({
        queryKey: ["admin/me"],
      });
    },
  });

  console.log(adminQuery);

  // If the query is still loading, return null
  if (adminQuery.isLoading) {
    return null;
  }

  // If the query is done and the user is not an admin, show the login page
  if (!adminQuery.data) {
    return <AdminLogin />;
  }

  // If the user is an admin, show the children
  return (
    <AdminAuthContext.Provider
      value={{
        admin: adminQuery.data,
        logout: logoutMutation.mutate,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
