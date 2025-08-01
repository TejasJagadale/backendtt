const AWS = require('aws-sdk');

// Configure AWS - add validation
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials not configured');
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4' // Important for presigned URLs
});

exports.getUploadUrl = async (fileType) => {
  try {
    if (!fileType) throw new Error('File type is required');
    
    const extension = fileType.split('/')[1] || 'bin';
    const key = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${extension}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: 60 * 5, // 5 minutes
      ACL: 'public-read'
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    
    // Construct public URL - use virtual hosted-style URL
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, key, publicUrl };
    
  } catch (error) {
    console.error('S3 Error Details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      region: process.env.AWS_REGION,
      bucket: process.env.S3_BUCKET_NAME
    });
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
};

exports.deletefile = async (key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  };

  await s3.deleteObject(params).promise();
};
