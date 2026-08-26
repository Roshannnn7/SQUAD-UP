const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { uploadFile } = require('../controllers/uploadController');

// Memory storage for stream uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;
