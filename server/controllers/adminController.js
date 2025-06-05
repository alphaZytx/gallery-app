// server/controllers/adminController.js
const jwt = require('jsonwebtoken');
// Remove: const { blob } = require('../config/vercelStorageConfig'); // We are not using Vercel Blob for now
const { kv } = require('../config/vercelStorageConfig'); // Keep for Upstash Redis
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system module
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// --- Configure multer for local disk storage ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads'); // Correct path to server/uploads
    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileId = uuidv4(); // Generate a unique ID for the filename
    const fileExtension = path.extname(file.originalname);
    cb(null, `${fileId}${fileExtension}`); // e.g., a1b2c3d4.png
  }
});

const localUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|wmv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
}).single('media'); // 'media' is the field name in FormData

// Keep adminLogin as is
exports.adminLogin = (req, res) => { /* ... existing code ... */ };

/**
 * Uploads media files to the local server's 'uploads' directory
 * and saves their metadata to Upstash Redis (KV).
 */
exports.uploadMedia = (req, res) => {
  localUpload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ msg: `Upload error (Multer): ${err.message}` });
    } else if (err) {
      return res.status(400).json({ msg: `Upload error: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    const { tags = '', name = '' } = req.body;
    const fileId = path.parse(req.file.filename).name; // Get the UUID part of the filename we generated

    try {
      // File is already saved to server/uploads/ by multer.
      // req.file contains information like:
      // - req.file.filename (e.g., a1b2c3d4.png)
      // - req.file.path (absolute path on server)
      // - req.file.mimetype
      // - req.file.size

      // For local testing, the 'url' will point to how it can be served locally.
      // This requires setting up a static route (see server.js modification).
      const localFileUrl = `/uploads/${req.file.filename}`;

      const mediaItem = {
        id: fileId, // Use the UUID part of the filename as the media ID
        name: name || req.file.originalname.split('.')[0],
        // Store local path information. `blobUrl` is a misnomer here, let's use `filePath`
        filePath: req.file.path, // Absolute path on server
        localUrl: localFileUrl,  // URL to access if served statically
        type: req.file.mimetype.startsWith('image') ? 'image' : 'video',
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        timestamp: new Date().toISOString(),
        originalFileName: req.file.originalname,
        size: req.file.size,
      };

      console.log('[LOCAL UPLOAD] File saved locally:', req.file.path);
      console.log('[LOCAL UPLOAD] Saving metadata to Upstash:', mediaItem);

      await kv.set(`media:${fileId}`, JSON.stringify(mediaItem));
      await kv.lpush('all_media_ids', fileId);

      // For frontend to display, it needs a usable URL.
      // We will return the mediaItem with the localUrl.
      // The actual file display/download will be handled by proxy routes
      // that now read from local disk.
      res.status(201).json({
        msg: 'File uploaded locally and metadata saved.',
        media: {
            ...mediaItem,
            // These URLs will be proxied by publicController to serve local files
            url: `/api/public/media/${fileId}/view`,
            downloadUrl: `/api/public/media/${fileId}/download`
        }
      });

    } catch (error) {
      console.error('[LOCAL UPLOAD] Error saving metadata to Upstash or other issue:', error);
      // If metadata saving fails, you might want to delete the locally uploaded file
      try {
        fs.unlinkSync(req.file.path);
        console.log('[LOCAL UPLOAD] Deleted orphaned local file due to error:', req.file.path);
      } catch (unlinkErr) {
        console.error('[LOCAL UPLOAD] Error deleting orphaned local file:', unlinkErr);
      }
      res.status(500).json({ msg: 'Failed to process file upload.', error: error.message });
    }
  });
};

// --- getAllMedia, updateMedia, deleteMedia ---
// These functions will also need adjustments if they interact with file paths
// or expect Vercel Blob URLs. For now, let's focus on upload and retrieval.
// `deleteMedia` will need to delete the local file using fs.unlinkSync(mediaItem.filePath).
// `updateMedia` mostly deals with metadata, so it should be largely fine.

exports.getAllMedia = async (req, res) => {
    try {
        const mediaIds = await kv.lrange('all_media_ids', 0, -1);
        const mediaPromises = mediaIds.map(id => kv.get(`media:${id}`));
        const mediaItemsJson = await Promise.all(mediaPromises);

        const media = mediaItemsJson
            .filter(item => item !== null)
            .map(item => JSON.parse(item));
        media.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Transform to include proxy URLs for local files
        const transformedMedia = media.map(item => ({
            ...item,
            url: `/api/public/media/${item.id}/view`, // These will be proxied
            downloadUrl: `/api/public/media/${item.id}/download`
        }));
        res.json(transformedMedia);
    } catch (error) {
        console.error('Error getting all media from KV:', error);
        res.status(500).json({ msg: 'Failed to retrieve media.', error: error.message });
    }
};

exports.updateMedia = async (req, res) => { /* ... similar to before, ensure no blob-specific logic ... */
    const { id } = req.params;
    const { name, tags } = req.body;

    try {
        const existingMediaJson = await kv.get(`media:${id}`);
        if (!existingMediaJson) {
            return res.status(404).json({ msg: 'Media not found.' });
        }
        let mediaItem = JSON.parse(existingMediaJson);
        if (name !== undefined) mediaItem.name = name;
        if (tags !== undefined) mediaItem.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

        await kv.set(`media:${id}`, JSON.stringify(mediaItem));
        res.json({ msg: 'Media updated successfully', media: mediaItem });
    } catch (error) /* ... */ {
        console.error('Error updating media in KV:', error);
        res.status(500).json({ msg: 'Failed to update media.', error: error.message });
    }
};


exports.deleteMedia = async (req, res) => {
    const { id } = req.params;
    try {
        const existingMediaJson = await kv.get(`media:${id}`);
        if (!existingMediaJson) {
            return res.status(404).json({ msg: 'Media metadata not found.' });
        }
        const mediaItem = JSON.parse(existingMediaJson);

        // Delete the local file
        if (mediaItem.filePath && fs.existsSync(mediaItem.filePath)) {
            try {
                fs.unlinkSync(mediaItem.filePath);
                console.log('[LOCAL DELETE] Successfully deleted local file:', mediaItem.filePath);
            } catch (unlinkErr) {
                console.error('[LOCAL DELETE] Error deleting local file:', mediaItem.filePath, unlinkErr);
                // Decide if you want to stop or just log and continue to delete metadata
            }
        } else {
            console.warn('[LOCAL DELETE] Local file not found or filePath not in metadata:', mediaItem.filePath);
        }

        // Delete metadata from Upstash
        await kv.del(`media:${id}`);
        await kv.lrem('all_media_ids', 0, id);

        res.json({ msg: 'Media (local file and metadata) deleted successfully' });
    } catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ msg: 'Failed to delete media.', error: error.message });
    }
};