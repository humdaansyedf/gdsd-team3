import { Button, Title } from "@mantine/core";
import { useAuth } from "../../lib/auth-context";
import { Navigate } from "react-router-dom";

export function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Title>Profile</Title>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <Button onClick={logout}>Logout</Button>
    </>
  );
}
