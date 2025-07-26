const AWS = require("aws-sdk");

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

exports.getUploadUrl = async (fileType) => {
  const extension = fileType.split("/")[1]; // Get file extension
  const key = `uploads/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}.${extension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    Expires: 60 * 5, // 5 minutes
    ACL: "public-read" // Make uploaded files publicly accessible
  };

  try {
    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    return {
      uploadUrl,
      key,
      publicUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
  } catch (error) {
    console.error("Error generating S3 URL:", error);
    throw error;
  }
};

exports.deletefile = async (key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  };

  await s3.deleteObject(params).promise();
};
