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
      console.log("Requesting signed URL...");
      const response = await axios.post("/api/document", { name: file.name }, { withCredentials: true });
      console.log("Signed URL response:", response.data);

      const uploadUrl = response.data.data.url; // Fix here
      if (!uploadUrl) {
        throw new Error("Failed to retrieve upload URL.");
      }

      console.log("Uploading file to S3...");
      const s3Response = await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });
      console.log("S3 Upload Response:", s3Response);

      fetchDocuments();
      onClose();
    } catch (error) {
      console.error("Error uploading document:", error.response?.data || error.message);
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
      {error && (
        <Text color="red" size="sm" mt="sm">
          {error}
        </Text>
      )}

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
