import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import { updateMedia } from '../../api'; // API function

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

  input[type="text"] {
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
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.danger || '#dc3545'};
  font-size: 0.85rem;
  margin-top: 0.25rem;
  text-align: center;
`;

const CurrentPreview = styled.div`
  margin-bottom: 1rem;
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.secondary};
    strong { color: ${({ theme }) => theme.text}; }
    word-break: break-all;
  }
  img, video {
    max-width: 150px;
    max-height: 100px;
    border-radius: ${({ theme }) => theme.borderRadius};
    margin-top: 0.5rem;
    border: 1px solid ${({ theme }) => theme.borderColor};
  }
`;


const EditMediaForm = ({ mediaItem, onUpdateSuccess, closeModal }) => {
  const [name, setName] = useState('');
  const [tags, setTags] = useState(''); // Stored as a comma-separated string for the input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mediaItem) {
      setName(mediaItem.name || '');
      setTags(mediaItem.tags ? mediaItem.tags.join(', ') : '');
    }
  }, [mediaItem]);

  if (!mediaItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const updatedData = {
      name: name.trim(),
      // Backend expects tags as a comma-separated string or will parse it
      tags: tags.trim(), 
    };

    try {
      const response = await updateMedia(mediaItem.id, updatedData);
      onUpdateSuccess(response.data.media); // Pass the updated media item back
      if(closeModal) closeModal();
    } catch (err) {
      console.error('Update failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <CurrentPreview>
        <p><strong>Editing:</strong> {mediaItem.name}</p>
        {/* Optional: Show a small preview of the image/video */}
        {/* {mediaItem.type === 'image' && <img src={getMediaViewURL(mediaItem.pathname)} alt="preview" />} */}
      </CurrentPreview>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <InputGroup>
        <label htmlFor="editName">Name</label>
        <input
          type="text"
          id="editName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Media name"
          required
          disabled={isLoading}
        />
      </InputGroup>

      <InputGroup>
        <label htmlFor="editTags">Tags (Comma-separated)</label>
        <input
          type="text"
          id="editTags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., nature, holiday, family"
          disabled={isLoading}
        />
      </InputGroup>

      <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </FormContainer>
  );
};

export default EditMediaForm;