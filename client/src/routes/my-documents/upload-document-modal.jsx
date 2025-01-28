import { Button, FileInput, Group, Modal, Text } from "@mantine/core";
import axios from "axios";
import { useState } from "react";

const UploadDocumentModal = ({ opened, onClose, fetchDocuments }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a document to upload.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Step 1: Get a pre-signed URL from the backend
      const response = await axios.post(
        "http://localhost:3000/api/document",
        { name: file.name },
        { withCredentials: true }
      );

      const uploadUrl = response.data.data.uploadUrl;
      if (!uploadUrl) {
        throw new Error("Failed to retrieve upload URL.");
      }

      // Step 2: Upload the file to S3
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // Step 3: Refresh document list after successful upload
      fetchDocuments();
      onClose();
    } catch (error) {
      console.error("Error uploading document:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Upload Document" centered>
      <FileInput
        label="Select Document"
        placeholder="Choose a file"
        accept=".pdf,.doc,.docx,.txt"
        value={file}
        onChange={setFile}
      />
      {error && <Text color="red" size="sm" mt="sm">{error}</Text>}

      <Group position="right" mt="md">
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleUpload} loading={uploading} disabled={!file}>
          Upload
        </Button>
      </Group>
    </Modal>
  );
};

export default UploadDocumentModal;
