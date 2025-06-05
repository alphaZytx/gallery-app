// client/src/components/admin/UploadForm.js
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import Button from '../common/Button';
// Spinner import was previously unused based on linting, re-add if needed for visual loading within form itself
// import Spinner from '../common/Spinner';
import { FiUploadCloud, FiFileText, FiXCircle } from 'react-icons/fi';
import { uploadMedia } from '../../api';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

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
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
    }
  }
  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.danger || '#dc3545'};
  font-size: 0.85rem;
  margin-top: 0.25rem;
  text-align: center;
`;

const UploadForm = ({ onUploadSuccess, closeModal }) => {
  const [file, setFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const currentFile = acceptedFiles[0];
      console.log("React-Dropzone accepted file:", currentFile);
      console.log("React-Dropzone file type:", currentFile.type);
      console.log("React-Dropzone file size:", currentFile.size);

      const maxSize = currentFile.type.startsWith('image/') ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
      if (currentFile.size > maxSize) {
        setError(`File is too large. Max size for ${currentFile.type.startsWith('image/') ? 'images' : 'videos'} is ${maxSize / (1024*1024)}MB.`);
        setFile(null);
        return;
      }
      setFile(currentFile);
      setCustomName(currentFile.name.split('.').slice(0, -1).join('.'));
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ // 'isDragActive' is from the hook
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov', '.avi']
    },
    multiple: false,
  });

  const handleRemoveFile = () => {
    setFile(null);
    setCustomName('');
    setTags('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setIsLoading(true);
    setError('');

    console.log("UploadForm handleSubmit: File object before FormData:", file);
    console.log("UploadForm handleSubmit: File object type:", file?.constructor?.name);
    console.log("UploadForm handleSubmit: File name:", file?.name);
    console.log("UploadForm handleSubmit: File size:", file?.size);
    console.log("UploadForm handleSubmit: File type:", file?.type);

    const formData = new FormData();
    formData.append('mediaFile', file);
    if (customName.trim()) formData.append('name', customName.trim());
    if (tags.trim()) formData.append('tags', tags.trim());

    try {
      const response = await uploadMedia(formData);
      onUploadSuccess(response.data.media);
      setFile(null);
      setCustomName('');
      setTags('');
      if(closeModal) closeModal();
    } catch (err) {
      console.error('Upload failed in UploadForm:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* Pass $isDragActive (transient prop) to the styled component */}
      <DropzoneContainer {...getRootProps()} $isDragActive={isDragActive}> 
        <input {...getInputProps()} />
        <UploadIcon />
        {/* Use the original 'isDragActive' (boolean from the hook) for JS logic */}
        {isDragActive ? ( 
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag 'n' drop a file here, or click to select file</p>
        )}
        <small style={{ color: 'grey', marginTop: '5px', display: 'block' }}>Images up to 10MB. Videos up to 100MB.</small>
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

      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <InputGroup>
        <label htmlFor="customNameUploadForm">Custom Name (Optional)</label>
        <input
          type="text"
          id="customNameUploadForm"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="e.g., Sunset Over Mountains"
          disabled={isLoading}
        />
      </InputGroup>

      <InputGroup>
        <label htmlFor="tagsUploadForm">Tags (Optional, comma-separated)</label>
        <input
          type="text"
          id="tagsUploadForm"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., nature, landscape, sunset"
          disabled={isLoading}
        />
      </InputGroup>

      <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !file}>
        {isLoading ? 'Uploading...' : 'Upload Media'}
      </Button>
    </FormContainer>
  );
};

export default UploadForm;