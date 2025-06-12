// client/src/components/admin/UploadForm.js
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import Button from '../common/Button'; // Optimized Button handles its own spinner
import { FiUploadCloud, FiFileText, FiXCircle } from 'react-icons/fi';
import { uploadMedia } from '../../api';
import imageCompression from 'browser-image-compression';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Using $isDragActive transient prop for styling
const DropzoneContainer = styled.div`
  border: 2px dashed ${({ theme, $isDragActive }) => ($isDragActive ? theme.primary : theme.borderColor)};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  background-color: ${({ theme, $isDragActive }) => ($isDragActive ? `${theme.primary}1A` : theme.body === '#1A1D24' ? '#252830' : '#f8f9fa')};

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.secondary};
    font-size: 0.95rem;
  }
`;

const UploadIcon = styled(FiUploadCloud)`
  font-size: 3rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.75rem;
`;

const FilePreviewContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => (theme.body === '#1A1D24' ? '#2C303A' : '#e9ecef')};
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  animation: fadeInAnimation 0.3s ease-out; /* Added fade-in for preview */
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  word-break: break-all;

  svg {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.primary};
    flex-shrink: 0;
  }
`;

const RemoveFileButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.danger || '#dc3545'};
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.dangerHover || '#c82333'};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text};
  }

  input[type="text"],
  textarea {
    width: 100%;
    padding: 0.75rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.inputBorder};
    background-color: ${({ theme }) => theme.inputBg};
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
    transition: border-color 0.3s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}33;
    }
  }
  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

const MessageText = styled.p` // Generic message component
  font-size: 0.9rem;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  animation: fadeInAnimation 0.3s ease-out;
`;

const ErrorMessage = styled(MessageText)`
  color: ${({ theme }) => theme.danger || '#dc3545'};
  background-color: ${({ theme }) => (theme.danger || '#dc3545')}1A; // Light background for error
`;

const StatusText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.secondary};
  font-weight: 500;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
`;


const UploadForm = ({ onUploadSuccess, closeModal }) => {
    const [file, setFile] = useState(null);
    const [customName, setCustomName] = useState('');
    const [tags, setTags] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusText, setStatusText] = useState(''); // To show "Compressing..." feedback

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setCustomName(acceptedFiles[0].name.split('.').slice(0, -1).join('.'));
            setError('');
            setStatusText('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
            'video/*': ['.mp4', '.webm', '.mov'] // Videos will not be compressed
        },
        multiple: false,
    });

    const handleRemoveFile = () => {
        setFile(null);
        setCustomName('');
        setTags('');
        setError('');
        setStatusText('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        setIsLoading(true);
        setError('');
        setStatusText('');

        let fileToUpload = file;

        // --- IMAGE COMPRESSION LOGIC ---
        // Only compress if it's an image and larger than a certain threshold (e.g., 200KB)
        if (file.type.startsWith('image/') && file.size > 200 * 1024) {
            setStatusText('Compressing image...');
            console.log(`Original image size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            try {
                const options = {
                    maxSizeMB: 4.0,          // Target size to be well under Vercel's limit
                    maxWidthOrHeight: 1920,  // Resize large images to a reasonable web dimension
                    useWebWorker: true,      // Use a web worker for smoother performance
                    onProgress: (p) => setStatusText(`Compressing... ${p}%`) // Show compression progress
                };
                const compressedFile = await imageCompression(file, options);
                console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
                fileToUpload = new File([compressedFile], file.name, { type: file.type }); // Re-create as a File object with original name
            } catch (compressionError) {
                console.error('Image compression failed:', compressionError);
                setError('Could not compress image. Please try a smaller file.');
                setIsLoading(false);
                return;
            }
        }

        // Check video size before attempting upload
        if (file.type.startsWith('video/') && file.size > 4.5 * 1024 * 1024) {
            setError('Video file is too large (max ~4.5MB). This app does not support video compression.');
            setIsLoading(false);
            return;
        }
        // --- END OF COMPRESSION LOGIC ---

        setStatusText('Uploading file...');
        const formData = new FormData();
        formData.append('mediaFile', fileToUpload);
        if (customName.trim()) formData.append('name', customName.trim());
        if (tags.trim()) formData.append('tags', tags.trim());

        try {
            const response = await uploadMedia(formData); // This should now work for compressed images
            onUploadSuccess(response.data.media);
            handleRemoveFile(); // Clear form on success
            if(closeModal) closeModal();
        } catch (err) {
            console.error('Upload failed:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setIsLoading(false);
            setStatusText('');
        }
    };

    return (
        <FormContainer onSubmit={handleSubmit}>
            <DropzoneContainer {...getRootProps()} $isDragActive={isDragActive}>
                <input {...getInputProps()} />
                <UploadIcon />
                <p>Drag 'n' drop a file here, or click to select</p>
                <small style={{ color: 'grey', marginTop: '5px', display: 'block' }}>Images will be compressed. Videos max ~4.5MB.</small>
            </DropzoneContainer>

            {file && (
                <FilePreviewContainer>
                    <FileInfo>
                        <FiFileText />
                        <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </FileInfo>
                    <RemoveFileButton type="button" onClick={handleRemoveFile} aria-label="Remove file">
                        <FiXCircle />
                    </RemoveFileButton>
                </FilePreviewContainer>
            )}

            {statusText && !error && <StatusText>{statusText}</StatusText>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <InputGroup>
                <label htmlFor="customNameUploadForm">Custom Name (Optional)</label>
                <input
                    type="text" id="customNameUploadForm" value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Sunset Over Mountains"
                    disabled={isLoading}
                />
            </InputGroup>

            <InputGroup>
                <label htmlFor="tagsUploadForm">Tags (Optional, comma-separated)</label>
                <input
                    type="text" id="tagsUploadForm" value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., nature, landscape, sunset"
                    disabled={isLoading}
                />
            </InputGroup>

            <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !file}>
                {isLoading ? (statusText || 'Processing...') : 'Upload Media'}
            </Button>
        </FormContainer>
    );
};

export default React.memo(UploadForm);