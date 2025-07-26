const express = require('express');
const router = express.Router();
const { getUploadUrl } = require('../services/s3Service');

router.get('/upload-url', async (req, res) => {
  try {
    const { fileType } = req.query;
    if (!fileType) {
      return res.status(400).json({ message: 'File type is required' });
    }

    const { uploadUrl, key, publicUrl } = await getUploadUrl(fileType);
    
    res.json({ 
      uploadUrl, 
      key,
      publicUrl // Send this to frontend
    });
    
  } catch (error) {
    console.error('S3 Route Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate upload URL',
      error: error.message 
    });
  }
});

module.exports = router;