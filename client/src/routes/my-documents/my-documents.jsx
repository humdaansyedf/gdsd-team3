import { ActionIcon, Button, Container, Flex, Table, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEye, IconShare, IconTrash, IconUpload } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";
import UploadDocumentModal from "./upload-document-modal";

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/documents", {
        withCredentials: true,
      });
      setDocuments(response.data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDelete = async (key) => {
    try {
      await axios.delete("http://localhost:3000/api/document", {
        data: { key },
        withCredentials: true,
      });
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.key !== key));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleViewDocument = async (key) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/document`, {
        params: { key }, // Pass the key as a query parameter
        withCredentials: true,
      });
      window.open(response.data.url, "_blank");
    } catch (error) {
      console.error("Error fetching document URL:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch document.",
        color: "red",
      });
    }
  };

  const handleCopyLink = async (key) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/document`, {
        params: { key }, // Pass the key as a query parameter
        withCredentials: true,
      });
      navigator.clipboard.writeText(response.data.url);
      notifications.show({
        title: "Link Copied!",
        message: "The document link has been copied to clipboard.",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error generating shareable link:", error);
    }
  };

  return (
    <Container>
      <Flex justify="space-between" align="center" mt="md" mb="md">
        <Text size="xl" weight={600}>My Documents</Text>
        <Button size="sm" onClick={() => setModalOpen(true)} leftIcon={<IconUpload />}>
          Upload Document
        </Button>
      </Flex>

      <Table withBorder withColumnBorders>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "12px" }}>Document Name</th>
            <th style={{ textAlign: "right", padding: "12px", width: "250px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <tr key={doc.key}>
                <td style={{ padding: "12px" }}>{doc.fileName}</td>
                <td style={{ textAlign: "right", padding: "12px" }}>
                  <Flex justify="flex-end" gap="md">
                    <Tooltip label="View">
                      <ActionIcon color="blue" onClick={() => handleViewDocument(doc.key)}>
                        <IconEye />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Copy link">
                      <ActionIcon color="teal" onClick={() => handleCopyLink(doc.key)}>
                        <IconShare />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon color="red" onClick={() => handleDelete(doc.key)}>
                        <IconTrash />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={{ textAlign: "center", padding: "20px" }}>
                No documents uploaded yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {modalOpen && (
        <UploadDocumentModal opened={modalOpen} onClose={() => setModalOpen(false)} fetchDocuments={fetchDocuments} />
      )}
    </Container>
  );
};

export default MyDocuments;
