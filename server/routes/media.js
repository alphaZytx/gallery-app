// gallery-app/server/routes/media.js
import express from 'express';
import multer from 'multer';
import { put, del, list } from '@vercel/blob'; // Using 'list'
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';
import { protect } from '../middleware/authMiddleware.js';
import 'dotenv/config';
import { URL } from 'node:url'; // For parsing blobResult.url
import { Readable } from 'node:stream'; // For piping WHATWG stream to Node.js stream

const router = express.Router();
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const GALLERY_PAGE_LIMIT = parseInt(process.env.GALLERY_PAGE_LIMIT, 10) || 12;

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 100;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const fileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (isImage || isVideo) {
        if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
            return cb(new multer.MulterError('LIMIT_FILE_SIZE', `Image size exceeds ${MAX_IMAGE_SIZE_MB}MB limit.`), false);
        }
        if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
            return cb(new multer.MulterError('LIMIT_FILE_SIZE', `Video size exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`), false);
        }
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WEBP) and videos (MP4, WEBM, MOV) are allowed.'), false);
    }
};
const upload = multer({ storage: storage, limits: { fileSize: MAX_VIDEO_SIZE_BYTES }, fileFilter: fileFilter });
const generateSuggestedPathname = (originalName, type) => {
    const timestamp = Date.now();
    const randomSuffix = uuidv4().slice(0, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'bin';
    return `${type}/${timestamp}-${randomSuffix}.${extension}`;
};

// === PUBLIC ROUTES ===
router.get('/gallery', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || GALLERY_PAGE_LIMIT;
    const startIndex = (page - 1) * limit;

    if (!redisClient || redisClient._isDummy) {
        return res.status(503).json({ message: "Database service unavailable." });
    }
    try {
        const allMediaIds = await redisClient.zrange('media_by_date', 0, -1, { rev: true });
        if (!allMediaIds || allMediaIds.length === 0) {
            return res.json({ images: [], totalPages: 0, currentPage: page, totalItems: 0 });
        }
        const mediaPromises = allMediaIds.map(id => redisClient.hgetall(`media:${id}`));
        const allMediaItems = (await Promise.all(mediaPromises)).filter(item => item && item.id);
        const imageItems = allMediaItems.filter(item => item.type === 'image');
        const totalImageItems = imageItems.length;
        const paginatedImages = imageItems.slice(startIndex, startIndex + limit);
        const totalPages = Math.ceil(totalImageItems / limit);
        res.json({ images: paginatedImages, totalPages, currentPage: page, totalItems: totalImageItems });
    } catch (error) {
        console.error('Error fetching public gallery images:', error);
        res.status(500).json({ message: 'Server error fetching gallery.' });
    }
});

router.get('/view/:pathname(*)', async (req, res) => {
    const { pathname } = req.params;
    // console.log(`--- VIEW ROUTE HIT --- Attempting to view: "${pathname}"`);
    if (!BLOB_READ_WRITE_TOKEN || BLOB_READ_WRITE_TOKEN.includes('dummytoken')) {
        return res.status(500).json({ message: "Server configuration error (blob token)." });
    }
    try {
        const listResult = await list({ prefix: pathname, limit: 1, token: BLOB_READ_WRITE_TOKEN });
        // console.log(`VIEW ROUTE: Vercel Blob list() for prefix "${pathname}":`, JSON.stringify(listResult, null, 2));
        if (!listResult.blobs || listResult.blobs.length === 0 || !listResult.blobs[0].url) {
            return res.status(404).json({ message: `Media file not found for: ${pathname}` });
        }
        const blobToView = listResult.blobs[0];
        // console.log(`VIEW ROUTE: Fetching from Vercel Blob URL: ${blobToView.url}`);
        const fetchResponse = await fetch(blobToView.url);

        if (!fetchResponse.ok) {
            console.error(`VIEW ROUTE ERROR: Failed to fetch blob from Vercel. Status: ${fetchResponse.status}, URL: ${blobToView.url}`);
            throw new Error(`Failed to fetch blob: ${fetchResponse.status} ${fetchResponse.statusText}`);
        }
        if (!fetchResponse.body) {
            console.error(`VIEW ROUTE ERROR: Fetch response body is null for URL: ${blobToView.url}`);
            throw new Error("Fetch response body is null.");
        }

        res.setHeader('Content-Type', blobToView.contentType || 'application/octet-stream');
        res.setHeader('Content-Length', blobToView.size);
        
        const nodeReadableStream = Readable.fromWeb(fetchResponse.body);
        nodeReadableStream.pipe(res);
        nodeReadableStream.on('error', (streamError) => {
            console.error('VIEW ROUTE ERROR: Error piping stream to response:', streamError);
            if (!res.headersSent) res.status(500).json({ message: 'Error streaming file content.' });
        });

    } catch (error) {
        console.error(`Error in /view route for "${pathname}":`, error);
        if (!res.headersSent) res.status(500).json({ message: 'Error streaming media file.', details: error.message });
    }
});

router.get('/download/:pathname(*)', async (req, res) => {
    const { pathname } = req.params;
    const userRequestedFilename = req.query.filename;
    // console.log(`--- DOWNLOAD ROUTE HIT --- Pathname: "${pathname}", User Filename: "${userRequestedFilename}"`);
    if (!BLOB_READ_WRITE_TOKEN || BLOB_READ_WRITE_TOKEN.includes('dummytoken')) {
        return res.status(500).json({ message: "Server configuration error (blob token)." });
    }
    try {
        const listResult = await list({ prefix: pathname, limit: 1, token: BLOB_READ_WRITE_TOKEN });
        console.log(`DOWNLOAD ROUTE: Vercel Blob list() for prefix "${pathname}":`, JSON.stringify(listResult, null, 2));
        if (!listResult.blobs || listResult.blobs.length === 0 || !listResult.blobs[0].url) {
            return res.status(404).json({ message: `Download media not found for: ${pathname}` });
        }
        const blobToDownload = listResult.blobs[0];
        console.log(`DOWNLOAD ROUTE: Fetching from Vercel Blob URL: ${blobToDownload.url}`);
        const fetchResponse = await fetch(blobToDownload.url);

        if (!fetchResponse.ok) {
            console.error(`DOWNLOAD ROUTE ERROR: Failed to fetch blob. Status: ${fetchResponse.status}, URL: ${blobToDownload.url}`);
            throw new Error(`Failed to fetch blob for download: ${fetchResponse.status} ${fetchResponse.statusText}`);
        }
        if (!fetchResponse.body) {
            console.error(`DOWNLOAD ROUTE ERROR: Fetch response body is null for URL: ${blobToDownload.url}`);
            throw new Error("Fetch response body is null for download.");
        }

        const downloadFilename = userRequestedFilename || blobToDownload.pathname.split('/').pop() || 'downloaded-media';
        res.setHeader('Content-Type', blobToDownload.contentType || 'application/octet-stream');
        res.setHeader('Content-Length', blobToDownload.size);
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        
        const nodeReadableStream = Readable.fromWeb(fetchResponse.body);
        nodeReadableStream.pipe(res);
        nodeReadableStream.on('error', (streamError) => {
            console.error('DOWNLOAD ROUTE ERROR: Error piping stream to response:', streamError);
            if (!res.headersSent) res.status(500).json({ message: 'Error streaming file for download.' });
        });

    } catch (error) {
        console.error(`Error in /download route for "${pathname}":`, error);
        if (!res.headersSent) res.status(500).json({ message: 'Error downloading media file.', details: error.message });
    }
});

// === ADMIN PROTECTED ROUTES ===
router.post('/upload', protect, upload.single('mediaFile'), async (req, res) => {
    console.log("--- UPLOAD ROUTE HIT (Backend handles file) ---");
    
    // Check if Multer successfully processed a file
    if (!req.file) {
        console.error("UPLOAD ERROR: Multer did not find a file in the request. 'req.file' is undefined.");
        return res.status(400).json({ message: 'No media file was uploaded or the field name was incorrect.' });
    }
    
    console.log("UPLOAD: req.file received:", { name: req.file.originalname, size: req.file.size, type: req.file.mimetype });
    console.log("UPLOAD: req.body:", req.body);

    // Check for necessary environment variables
    if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN.includes('dummytoken')) {
        console.error("UPLOAD ERROR: BLOB_READ_WRITE_TOKEN is not configured.");
        return res.status(500).json({ message: "Server configuration error (blob token)." });
    }
    if (!redisClient || redisClient._isDummy) {
        console.error("UPLOAD ERROR: Redis client is unavailable.");
        return res.status(503).json({ message: "Database service unavailable." });
    }

    const { name, tags } = req.body;
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    const suggestedPathname = generateSuggestedPathname(req.file.originalname, fileType);

    try {
        console.log(`UPLOAD: Attempting to upload to Vercel Blob with suggested pathname: ${suggestedPathname}`);
        
        // Upload the file buffer to Vercel Blob
        const blobResult = await put(suggestedPathname, req.file.buffer, {
            access: 'public', // Set to public as per your store's requirement
            contentType: req.file.mimetype,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        console.log("UPLOAD: Vercel Blob upload successful. Full result:", JSON.stringify(blobResult, null, 2));

        // CRITICAL FIX: Derive the actual stored pathname from the returned blobResult.url
        let actualStoredPathname;
        if (blobResult && blobResult.url) {
            const parsedUrl = new URL(blobResult.url);
            // The pathname from URL object includes a leading slash, remove it to match Vercel's typical pathname format.
            actualStoredPathname = parsedUrl.pathname.startsWith('/') ? parsedUrl.pathname.substring(1) : parsedUrl.pathname;
        } else {
            // This is a critical failure if Vercel doesn't return a URL
            throw new Error("Vercel Blob upload result did not contain a valid URL.");
        }
        
        console.log("UPLOAD: Derived actual stored pathname for Redis:", actualStoredPathname);

        // Prepare metadata for Redis
        const mediaId = uuidv4();
        const uploadTimestamp = new Date();
        const mediaData = {
            id: mediaId,
            name: name || req.file.originalname,
            tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : [],
            url: blobResult.url,
            pathname: actualStoredPathname, // Use the CORRECT pathname with Vercel's suffix
            downloadUrl: blobResult.downloadUrl,
            contentType: req.file.mimetype,
            size: req.file.size.toString(),
            type: fileType,
            uploadedAt: uploadTimestamp.toISOString(),
            uploader: req.user.email, // From 'protect' middleware
        };

        // Save metadata to Redis
        console.log(`UPLOAD: Saving metadata to Redis for pathname: ${mediaData.pathname}`);
        const pipeline = redisClient.pipeline();
        pipeline.hset(`media:${mediaId}`, mediaData);
        pipeline.zadd('media_by_date', { score: uploadTimestamp.getTime(), member: mediaId });
        await pipeline.exec();
        console.log("UPLOAD: Redis metadata save successful.");
        
        // Send success response with the new media data
        res.status(201).json({ message: 'Media uploaded successfully.', media: mediaData });

    } catch (error) {
        console.error('UPLOAD: The upload process failed:', error);
        res.status(500).json({ message: 'An error occurred during the upload process.', error: error.message });
    }
});


router.get('/admin/all', protect, async (req, res) => {
    if (!redisClient || redisClient._isDummy) return res.status(503).json({ message: "Database unavailable." });
    try {
        const mediaIds = await redisClient.zrange('media_by_date', 0, -1, { rev: true });
        if (!mediaIds || mediaIds.length === 0) return res.json([]);
        const mediaPromises = mediaIds.map(id => redisClient.hgetall(`media:${id}`));
        const allMedia = (await Promise.all(mediaPromises)).filter(item => item && item.id);
        res.json(allMedia);
    } catch (error) {
        console.error('Error admin/all:', error);
        res.status(500).json({ message: 'Failed to fetch admin media.' });
    }
});

router.put('/edit/:mediaId', protect, async (req, res) => {
    const { mediaId } = req.params;
    const { name, tags } = req.body;
    if (!redisClient || redisClient._isDummy) return res.status(503).json({ message: "Database unavailable." });
    if (name === undefined && tags === undefined) return res.status(400).json({ message: 'No update data.' });
    try {
        const currentMedia = await redisClient.hgetall(`media:${mediaId}`);
        if (!currentMedia || Object.keys(currentMedia).length === 0) return res.status(404).json({ message: 'Not found.' });
        const updatesToApply = {};
        if (name !== undefined && name.trim() !== currentMedia.name) updatesToApply.name = name.trim();
        if (tags !== undefined) {
            const newTagsArr = Array.isArray(tags) ? tags.map(t=>t.trim().toLowerCase()).filter(Boolean) : (typeof tags === 'string' ? tags.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean) : currentMedia.tags);
            if (JSON.stringify(newTagsArr) !== JSON.stringify(currentMedia.tags || [])) updatesToApply.tags = newTagsArr;
        }
        if (Object.keys(updatesToApply).length === 0) return res.status(200).json({ message: 'No changes.', media: currentMedia });
        updatesToApply.lastModified = new Date().toISOString();
        await redisClient.hset(`media:${mediaId}`, updatesToApply);
        const updatedMedia = await redisClient.hgetall(`media:${mediaId}`);
        res.json({ message: 'Updated.', media: updatedMedia });
    } catch (error) {
        console.error(`Error updating ${mediaId}:`, error);
        res.status(500).json({ message: 'Update failed.' });
    }
});

router.delete('/delete/:mediaId', protect, async (req, res) => {
    const { mediaId } = req.params;
    if (!BLOB_READ_WRITE_TOKEN || BLOB_READ_WRITE_TOKEN.includes('dummytoken')) return res.status(500).json({ message: "Server config error (blob token)." });
    if (!redisClient || redisClient._isDummy) return res.status(503).json({ message: "Database unavailable." });
    try {
        const mediaData = await redisClient.hgetall(`media:${mediaId}`);
        if (!mediaData || !mediaData.url) return res.status(404).json({ message: 'Not found or URL missing.' });
        
        // Use mediaData.url for deletion as it's the direct Vercel Blob URL
        await del(mediaData.url, { token: BLOB_READ_WRITE_TOKEN });
        
        const pipeline = redisClient.pipeline();
        pipeline.del(`media:${mediaId}`);
        pipeline.zrem('media_by_date', mediaId);
        await pipeline.exec();
        res.json({ message: `"${mediaData.name || mediaId}" deleted.` });
    } catch (error) {
        console.error(`Error deleting ${mediaId}:`, error);
        res.status(500).json({ message: 'Delete failed.', details: error.message });
    }
});

export default router;