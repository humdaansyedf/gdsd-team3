import { ActionIcon, Button, Container, Flex, Table, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShare, IconTrash, IconUpload } from "@tabler/icons-react";
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

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    notifications.show({
      title: "Link Copied!",
      message: "The document link has been copied to clipboard.",
      color: "green",
      autoClose: 2000,
    });
  };

  return (
    <Container>
      {/* Header with Title and Upload Button */}
      <Flex justify="space-between" align="center" mt="md" mb="md">
        <Text size="xl" weight={600}>My Documents</Text>
        <Button size="sm" onClick={() => setModalOpen(true)} leftIcon={<IconUpload />}>
          Upload Document
        </Button>
      </Flex>

      {/* Table for Documents */}
      <Table withBorder withColumnBorders>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "12px" }}>Document Name</th>
            <th style={{ textAlign: "right", padding: "12px", width: "200px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <tr key={doc.key}>
                <td style={{ padding: "12px" }}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    {doc.fileName}
                  </a>
                </td>
                <td style={{ textAlign: "right", padding: "12px" }}>
                  <Flex justify="flex-end" gap="lg">
                    {/* Share Button */}
                    <Tooltip label="Copy link">
                      <ActionIcon color="blue" onClick={() => handleCopyLink(doc.url)}>
                        <IconShare />
                      </ActionIcon>
                    </Tooltip>

                    {/* Delete Button */}
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

      {/* Upload Document Modal */}
      {modalOpen && (
        <UploadDocumentModal opened={modalOpen} onClose={() => setModalOpen(false)} fetchDocuments={fetchDocuments} />
      )}
    </Container>
  );
};

export default MyDocuments;
