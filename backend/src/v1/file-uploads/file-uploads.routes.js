const express = require('express');
const fileController = require('./file-uploads.controller');
const router = express.Router();

router.get('/get-presigned-url',fileController.getPresignedUrl );
router.get('/get-presigned-urls-for-get', fileController.getPresignedUrlsForGet);
router.get('/files', fileController.listFiles);

module.exports = router;
