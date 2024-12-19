import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

// Function to delete an image from S3
export const deleteImageFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.APP_AWS_BUCKET_NAME,
      Key: key, // File key in the bucket
    });

    await s3Client.send(command);
    console.log(`File deleted from S3: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete file from S3: ${key}`, error);
    throw error;
  }
};