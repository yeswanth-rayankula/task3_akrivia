const AWS = require('aws-sdk');
require('dotenv').config();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const getPresignedUrl = (fileName, fileType) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `yes/files/${fileName}`,
    Expires: 300, 
    ContentType: fileType,
  };
  return s3.getSignedUrlPromise('putObject', params);
};

const getPresignedUrlsForGet = (fileNames) => {
  const files = fileNames.split(',');
  return files.map((fileName) => ({
    fileName,
    url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/yes/files/${fileName}`,
  }));
};

const listFiles = async () => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: 'yes/files/',
  };

  const data = await s3.listObjectsV2(params).promise();

  if (!data.Contents || data.Contents.length === 0) {
    throw new Error('No files found in the S3 bucket');
  }

  return data.Contents.map((file) => ({
    name: file.Key.replace('yes/files/', ''),
    lastModified: file.LastModified,
    size: file.Size,
  }));
};

module.exports = {
  getPresignedUrl,
  getPresignedUrlsForGet,
  listFiles,
};
