// server/publicController.js
// Remove: const { blob } = require('../config/vercelStorageConfig');
const { kv } = require('../config/vercelStorageConfig'); // Keep for Upstash Redis
const fs = require('fs'); // File System module
const path = require('path'); // Path module

// getPublicImages remains largely the same for fetching metadata
exports.getPublicImages = async (req, res) => { /* ... existing logic ... */
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    try {
        const allMediaIds = await kv.lrange('all_media_ids', 0, -1);
        const mediaPromises = allMediaIds.map(id => kv.get(`media:${id}`));
        const allMediaItems = (await Promise.all(mediaPromises))
            .filter(item => item !== null)
            .map(item => JSON.parse(item));

        const images = allMediaItems
            .filter(item => item.type && item.type.startsWith('image')) // Ensure type exists
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const totalImages = images.length;
        const totalPages = Math.ceil(totalImages / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedImages = images.slice(startIndex, endIndex);

        const transformedPaginatedImages = paginatedImages.map(item => ({
            id: item.id,
            name: item.name,
            // These URLs will be proxied by this controller to serve local files
            url: `/api/public/media/${item.id}/view`,
            downloadUrl: `/api/public/media/${item.id}/download`,
            type: item.type,
            tags: item.tags,
            timestamp: item.timestamp,
            originalFileName: item.originalFileName,
            size: item.size,
        }));

        res.json({
            media: transformedPaginatedImages,
            currentPage: page,
            totalPages: totalPages,
            totalImages: totalImages,
        });
    } catch (error) { /* ... */ }
};

exports.viewMedia = async (req, res) => {
  const { id } = req.params;
  try {
    const mediaItemJson = await kv.get(`media:${id}`);
    if (!mediaItemJson) {
      return res.status(404).send('Media metadata not found.');
    }
    const mediaItem = JSON.parse(mediaItemJson);

    // mediaItem.filePath should contain the absolute path to the file on the server
    const localFilePath = mediaItem.filePath;

    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.error('Local file not found at path:', localFilePath);
      return res.status(404).send('Media file not found on server.');
    }

    res.setHeader('Content-Type', mediaItem.type);
    // For local files, streaming might be better for large files
    const fileStream = fs.createReadStream(localFilePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error viewing media (local):', error);
    res.status(500).send('Failed to view media.');
  }
};

exports.downloadMedia = async (req, res) => {
  const { id } = req.params;
  try {
    const mediaItemJson = await kv.get(`media:${id}`);
    if (!mediaItemJson) {
      return res.status(404).send('Media metadata not found.');
    }
    const mediaItem = JSON.parse(mediaItemJson);

    const localFilePath = mediaItem.filePath;

    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.error('Local file not found for download at path:', localFilePath);
      return res.status(404).send('Media file not found on server for download.');
    }

    res.setHeader('Content-Type', mediaItem.type);
    res.setHeader('Content-Disposition', `attachment; filename="${mediaItem.originalFileName || path.basename(localFilePath)}"`);
    
    const fileStream = fs.createReadStream(localFilePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading media (local):', error);
    res.status(500).send('Failed to download media.');
  }
};