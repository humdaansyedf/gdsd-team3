import { Avatar, Badge, Button, Container, FileInput, Group, Notification, Paper, Stack, TextInput } from "@mantine/core";
import { IconCheck, IconPencil, IconX } from "@tabler/icons-react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";

export function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));
    if (profilePicture) formDataToSend.append("profilePicture", profilePicture);
  
    try {
      await axios.put("http://localhost:3000/api/profile", formDataToSend, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotification({ type: "success", message: "Profile updated successfully!" });
      setTimeout(() => {
      navigate("/profile");
      setTimeout(() => window.location.reload(), 1); 
    }, 1500);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({ type: "error", message: "Failed to update profile." });
    }
    
  };
  

  return (
    <Container size="xs" mt="xl">
      <Paper withBorder shadow="md" p="lg">
        <Stack align="center" spacing="md">
          <div style={{ position: "relative" }}>
            <Avatar size="xl" src={user.profilePicture} alt="Profile" />
            <Badge
              style={{ position: "absolute", bottom: 0, right: 5, cursor: "pointer"}}
              variant="filled"
              color="green"  
              p={2}
              onClick={() => document.getElementById("file-input").click()}
            >
              <IconPencil size={18} />
            </Badge>
            <FileInput
              id="file-input"
              style={{ display: "none" }}
              accept="image/*"
              onChange={(file) => setProfilePicture(file)}
            />
          </div>

          <TextInput label="Edit Name" name="name" value={formData.name} onChange={handleChange} />
          <TextInput label="Edit Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <TextInput label="Edit Address" name="address" value={formData.address} onChange={handleChange} />

          <Group position="center">
            <Button color="green" onClick={handleSubmit}>Done</Button>
          </Group>

          {notification && (
            <Notification
              icon={notification.type === "success" ? <IconCheck size={18} /> : <IconX size={18} />}
              color={notification.type === "success" ? "green" : "red"}
              onClose={() => setNotification(null)}
            >
              {notification.message}
            </Notification>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

export default ProfileEdit;
