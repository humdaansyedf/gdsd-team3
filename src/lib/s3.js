import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadObject = async ({ Bucket, Key, Body, ContentType }) => {
  try {
    const command = new PutObjectCommand({
      Bucket,
      Key,
      Body,
      ContentType,
    });

    await s3Client.send(command);
    console.log(`File uploaded successfully to ${Bucket}/${Key}`);
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export const deleteImageFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.APP_AWS_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`File deleted from S3: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete file from S3: ${key}`, error);
    throw error;
  }
};
