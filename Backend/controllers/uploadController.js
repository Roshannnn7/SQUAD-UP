const asyncHandler = require('express-async-handler');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    // Check if Cloudinary credentials exist
    if (!isCloudinaryConfigured()) {
        // Fallback to base64 Data URI response if Cloudinary is not configured yet
        const base64 = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
        return res.status(200).json({
            url: dataUrl,
            public_id: null,
            message: 'Cloudinary credentials missing in .env — returned Data URL fallback',
        });
    }

    try {
        // Stream upload to Cloudinary
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'squadup',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const result = await uploadStream();

        res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500);
        throw new Error('Failed to upload file to Cloudinary');
    }
});

module.exports = {
    uploadFile,
};
