import React, { useState } from 'react';
import styled from 'styled-components';
import { getMediaViewURL } from '../../api';
import Button from '../common/Button';
import { FiEdit, FiTrash2, FiImage, FiVideo } from 'react-icons/fi'; // Icons
import { format } from 'date-fns';

const CardWrapper = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.cardShadow};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
`;

const MediaPreviewContainer = styled.div`
  width: 100%;
  padding-top: 66.66%; /* 3:2 Aspect ratio for preview */
  position: relative;
  background-color: ${({ theme }) => theme.body === '#1A1D24' ? '#252930' : '#e9ecef'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img, video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FileTypeIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.secondary};
`;

const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const MediaName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
  word-break: break-all; /* Break long names */
  line-height: 1.3;
`;

const MediaInfo = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondary};
  margin-bottom: 0.75rem;
  line-height: 1.4;

  p {
    margin-bottom: 0.25rem;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
`;

const TagBadge = styled.span`
  background-color: ${({ theme }) => theme.primary}2A;
  color: ${({ theme }) => theme.primary};
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: auto; /* Pushes actions to the bottom */
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.borderColor};
`;

const AdminMediaCard = ({ mediaItem, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const previewUrl = mediaItem.pathname ? getMediaViewURL(mediaItem.pathname) : null;

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(parseInt(bytes))) return 'N/A';
    const b = parseInt(bytes, 10);
    if (b === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <CardWrapper>
      <MediaPreviewContainer>
        {mediaItem.type === 'image' && previewUrl && !imageError ? (
          <img src={previewUrl} alt={mediaItem.name || 'Media preview'} onError={handleImageError} />
        ) : mediaItem.type === 'video' && previewUrl && !imageError ? (
          <video src={previewUrl} onError={handleImageError} controls={false} muted loop playsInline preload="metadata" />
        ) : mediaItem.type === 'image' ? (
          <FileTypeIcon title="Image"><FiImage /></FileTypeIcon>
        ) : mediaItem.type === 'video' ? (
          <FileTypeIcon title="Video"><FiVideo /></FileTypeIcon>
        ) : (
           <FileTypeIcon title="File type unknown">?</FileTypeIcon>
        )}
      </MediaPreviewContainer>
      <CardContent>
        <div>
          <MediaName title={mediaItem.name}>{mediaItem.name}</MediaName>
          <MediaInfo>
            <p><strong>Type:</strong> {mediaItem.type || 'N/A'}</p>
            <p><strong>Size:</strong> {formatFileSize(mediaItem.size)}</p>
            <p>
              <strong>Uploaded:</strong>{' '}
              {mediaItem.uploadedAt ? format(new Date(mediaItem.uploadedAt), 'MMM d, yyyy, h:mm a') : 'N/A'}
            </p>
            {mediaItem.uploader && <p><strong>By:</strong> {mediaItem.uploader}</p>}
          </MediaInfo>
          {mediaItem.tags && mediaItem.tags.length > 0 && (
            <TagsContainer>
              {mediaItem.tags.map((tag, index) => (
                <TagBadge key={`${tag}-${index}`}>{tag}</TagBadge>
              ))}
            </TagsContainer>
          )}
        </div>
        <ActionsContainer>
          <Button onClick={onEdit} variant="outline" size="small" iconStart={<FiEdit />}>
            Edit
          </Button>
          <Button onClick={onDelete} variant="danger" size="small" iconStart={<FiTrash2 />}>
            Delete
          </Button>
        </ActionsContainer>
      </CardContent>
    </CardWrapper>
  );
};

export default AdminMediaCard;