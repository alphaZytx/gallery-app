import { put } from '@vercel/blob';

// Initialize Vercel Blob with the token from environment variables
// The SDK automatically picks up BLOB_READ_WRITE_TOKEN from process.env

export const uploadFileToBlob = async (fileBuffer, originalName, mimeType) => {
    try {
        // Ensure fileBuffer is a Buffer (e.g., from Multer's memory storage)
        // And originalName includes the extension, e.g., 'image.jpg'
        // The filename passed to put should ideally be unique to avoid overwrites
        const filename = `uploads/<span class="math-inline">\{Date\.now\(\)\}\-</span>{originalName}`; // Example: creates a unique filename

        const blob = await put(filename, fileBuffer, {
            access: 'public', // Make the file publicly accessible
            contentType: mimeType,
        });

        console.log('File uploaded to Vercel Blob:', blob.url);
        return blob.url; // This is the public URL of the uploaded file
    } catch (error) {
        console.error('Error uploading file to Vercel Blob:', error);
        throw new Error('Failed to upload file to Vercel Blob.');
    }
};

// You might also want functions for deleting files if needed
// import { del } from '@vercel/blob';
// export const deleteFileFromBlob = async (url) => {
//     try {
//         await del(url);
//         console.log('File deleted from Vercel Blob:', url);
//     } catch (error) {
//         console.error('Error deleting file from Vercel Blob:', error);
//         throw new Error('Failed to delete file from Vercel Blob.');
//     }
// };