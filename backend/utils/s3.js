const AWS = require('aws-sdk');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// Initialize AWS SDK for S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Uploads a file to S3.
 * @param {Object} file - The file object from Multer.
 * @param {string} folder - The folder name in S3 where the file will be uploaded.
 * @returns {Promise<string>} - Resolves with the file URL.
 */
const uploadToS3 = async (file, folder) => {
  const fileName = `${folder}/${uuidv4()}_${path.basename(file.originalname)}`; // Unique filename
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // S3 URL
  } catch (error) {
    console.error('Error uploading to S3:', error.message);
    throw new Error('Failed to upload to S3');
  }
};

const deleteFromS3 = async (imageUrls) => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('No image URLs provided for deletion');
    }
  
    const keys = imageUrls.map((imageUrl) => {
      if (typeof imageUrl !== 'string') {
        throw new Error(`Invalid image URL: ${imageUrl}`);
      }
      const parts = imageUrl.split('/');
      return parts[parts.length - 1]; // Extract the key from the URL
    });
  
    const params = {
      Bucket: process.env.S3_BUCKET,
      Delete: {
        Objects: keys.map((key) => ({ Key: `gallery-images/${key}` })), // Add the correct prefix
      },
    };
  
    try {
      const result = await s3.deleteObjects(params).promise();
      console.log('Deleted from S3:', result);
      return result;
    } catch (error) {
      console.error('Error deleting from S3:', error);
      throw error;
    }
  };

module.exports = { uploadToS3, deleteFromS3 };
