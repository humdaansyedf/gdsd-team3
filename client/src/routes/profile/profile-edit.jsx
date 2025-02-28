import { Button, Container, Group, Paper, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

export function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));

    try {
      await axios.put("/api/profile", formDataToSend, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      notifications.show({
        message: "Profile updated successfully",
        color: "green",
      });
      queryClient.refetchQueries({ queryKey: ["me"] });
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      notifications.show({
        message: "Error updating profile",
        color: "red",
      });
    }
  };

  return (
    <Container size="xs" mt="xl">
      <Paper withBorder shadow="md" p="lg">
        <Stack spacing="md">
          <TextInput fullWidth label="Edit Name" name="name" value={formData.name} onChange={handleChange} />
          <TextInput fullWidth label="Edit Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <TextInput fullWidth label="Edit Address" name="address" value={formData.address} onChange={handleChange} />

          <Group position="center">
            <Button color="green" onClick={handleSubmit}>
              Save
            </Button>
            <Button color="green" variant="outline" onClick={() => navigate("/profile")}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}

export default ProfileEdit;
