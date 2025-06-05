// client/src/components/media/ImageDetailModal.js
import React from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal'; // Ensure Modal uses transient props like $isOpen, $maxWidth
import Button from '../common/Button';
import { getMediaViewURL, getMediaDownloadURL } from '../../api';
import { formatDate, formatFileSize } from '../../utils/formatDate'; // Import from utils
import { FiDownload, FiTag, FiCalendar, FiInfo, FiImage, FiFilm } from 'react-icons/fi';

const ModalMediaContainer = styled.div`
  width: 100%;
  max-height: 70vh; /* Increased height for better viewing */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: ${({ theme }) => (theme.body === '#1A1D24' ? '#101216' : '#f8f9fa')};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

const ModalStyledMedia = styled.img` /* Can also be a video tag if you extend */
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px; /* Slight rounding if container has padding */
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem 1rem; /* Increased gap slightly */
  align-items: flex-start; /* Align items to start for multi-line content */
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};

  svg {
    color: ${({ theme }) => theme.primary};
    font-size: 1.25rem; /* Slightly larger icons */
    margin-right: 0.6rem;
    margin-top: 0.15rem; /* Align with first line of text */
  }

  strong {
    font-weight: 500;
    color: ${({ theme }) => theme.text}; /* Make label more prominent */
    display: flex;
    align-items: center;
  }
  span, div { /* Allow div for tags container */
    word-break: break-word;
    line-height: 1.5;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center; /* Align badges if they wrap */
`;

const TagBadge = styled.span`
  background-color: ${({ theme }) => theme.primary}2A;
  color: ${({ theme }) => theme.primary};
  padding: 0.3rem 0.7rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.8rem;
  font-weight: 500;
`;

const ImageDetailModal = ({ isOpen, onClose, mediaItem }) => {
  if (!mediaItem) return null;

  const mediaUrl = mediaItem.pathname ? getMediaViewURL(mediaItem.pathname) : '';
  const downloadUrl = mediaItem.pathname ? getMediaDownloadURL(mediaItem.pathname, mediaItem.name) : '';
  const isVideo = mediaItem.type === 'video';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mediaItem.name || "Media Details"}
      maxWidth={isVideo ? "900px" : "800px"} // Wider for videos if you support them
      footerContent={
        <Button 
          onClick={() => window.open(downloadUrl, '_blank')} 
          iconStart={<FiDownload />}
          title={`Download ${mediaItem.name}`}
          disabled={!downloadUrl}
        >
          Download
        </Button>
      }
    >
      <ModalMediaContainer>
        {isVideo ? (
          <video src={mediaUrl} controls style={{maxWidth: '100%', maxHeight: '100%', borderRadius: '4px'}} title={mediaItem.name}>
            Your browser does not support the video tag.
          </video>
        ) : (
          mediaUrl ? <ModalStyledMedia src={mediaUrl} alt={mediaItem.name} /> : <FiImage size="5em" color="grey" />
        )}
      </ModalMediaContainer>
      <DetailsGrid>
        {isVideo ? <strong><FiFilm /> Name:</strong> : <strong><FiImage /> Name:</strong>}
        <span>{mediaItem.name || 'N/A'}</span>

        {mediaItem.tags && mediaItem.tags.length > 0 && (
          <>
            <strong><FiTag /> Tags:</strong>
            <TagsContainer>
              {mediaItem.tags.map((tag, index) => (
                <TagBadge key={index}>{tag}</TagBadge>
              ))}
            </TagsContainer>
          </>
        )}

        <strong><FiCalendar /> Uploaded:</strong>
        <span>{formatDate(mediaItem.uploadedAt)}</span>
        
        <strong><FiInfo /> Size:</strong>
        <span>{formatFileSize(mediaItem.size)}</span>
      </DetailsGrid>
    </Modal>
  );
};

export default ImageDetailModal;