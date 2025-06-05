import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Modal from '../common/Modal'; // Ensure Modal uses transient props like $isOpen, $maxWidth
import Button from '../common/Button';
import { getMediaViewURL, getMediaDownloadURL } from '../../api';
import { formatDate, formatFileSize } from '../../utils/formatDate';
import { FiDownload, FiTag, FiCalendar, FiInfo, FiImage, FiFilm, FiLoader } from 'react-icons/fi';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ModalMediaContainer = styled.div`
  width: 100%;
  max-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: ${({ theme }) => (theme.body === '#1A1D24' ? '#20232a' : '#f0f2f5')};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  position: relative;
`;

const LoadingSpinnerIcon = styled(FiLoader)`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.primary};
  animation: ${keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `} 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ErrorIcon = styled(FiImage)` /* Or FiAlertCircle */
  font-size: 3rem;
  color: ${({ theme }) => theme.secondary};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ModalStyledMedia = styled.img`
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;

  ${({ $loaded }) => $loaded && css`
    opacity: 1;
    animation: ${fadeIn} 0.5s ease-in-out;
  `}
`;

const StyledVideo = styled.video`
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;

  ${({ $loaded }) => $loaded && css`
    opacity: 1;
    animation: ${fadeIn} 0.5s ease-in-out;
  `}
`;

// --- Styled-components for the details section ---
const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr; /* Label (icon + text) | Value */
  gap: 0.8rem 1rem; /* More row gap for separation, decent column gap */
  align-items: center; /* Vertically center items in each grid cell row */
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  margin-top: 1.5rem; /* Space above the details section */
  line-height: 1.6; /* Better readability for multi-line values */
`;

const DetailLabel = styled.strong`
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  display: inline-flex; /* Align icon and text on the same line */
  align-items: center; /* Vertically center icon with text */
  gap: 0.6rem; /* Space between icon and label text */
  white-space: nowrap; /* Prevent label text like "Uploaded:" from wrapping */
  
  svg {
    color: ${({ theme }) => theme.primary};
    font-size: 1.25rem; /* Consistent icon size */
    flex-shrink: 0; /* Prevent icon from shrinking if label text is long */
  }
`;

const DetailValue = styled.span`
  word-break: break-word; /* Allow long values to wrap */
  color: ${({ theme }) => theme.secondary}; /* Values can be slightly more muted */
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center; 
`;

const TagBadge = styled.span`
  background-color: ${({ theme }) => theme.primary}2A;
  color: ${({ theme }) => theme.primary};
  padding: 0.3rem 0.7rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.8rem;
  font-weight: 500;
`;
// --- End of styled-components for details ---

const ImageDetailModal = ({ isOpen, onClose, mediaItem }) => {
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && mediaItem) {
      setIsMediaLoaded(false);
      setMediaLoadError(false);
    }
  }, [isOpen, mediaItem]);

  if (!mediaItem || !mediaItem.id) return null;

  const mediaUrl = mediaItem.pathname ? getMediaViewURL(mediaItem.pathname) : '';
  const backendDownloadProxyUrl = mediaItem.pathname ? getMediaDownloadURL(mediaItem.pathname, mediaItem.name) : '';
  const isVideo = mediaItem.type === 'video';

  const handleMediaLoad = () => setIsMediaLoaded(true);
  const handleMediaError = () => setMediaLoadError(true);
  
  const handleDownload = async () => {
    if (!backendDownloadProxyUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(backendDownloadProxyUrl);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', mediaItem.name || 'download');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mediaItem.name || "Media Details"}
      maxWidth={isVideo ? "900px" : "800px"}
      footerContent={
        <Button 
          onClick={handleDownload} 
          iconStart={<FiDownload />}
          title={`Download ${mediaItem.name}`}
          disabled={!backendDownloadProxyUrl || isDownloading}
          isLoading={isDownloading}
        >
          Download
        </Button>
      }
    >
      <ModalMediaContainer>
        {!isMediaLoaded && !mediaLoadError && <LoadingSpinnerIcon title="Loading media..." />}
        {mediaLoadError && <ErrorIcon title="Error loading media" />}
        {isVideo ? (
          <StyledVideo 
            src={mediaUrl} controls $loaded={isMediaLoaded && !mediaLoadError}
            onLoadedData={handleMediaLoad} onError={handleMediaError}
            style={{ display: (!isMediaLoaded && !mediaLoadError) ? 'none' : 'block' }}
            title={mediaItem.name}
          > Your browser does not support the video tag. </StyledVideo>
        ) : (
          mediaUrl && (
            <ModalStyledMedia 
              src={mediaUrl} alt={mediaItem.name} $loaded={isMediaLoaded && !mediaLoadError}
              onLoad={handleMediaLoad} onError={handleMediaError}
              style={{ display: (!isMediaLoaded && !mediaLoadError) ? 'none' : 'block' }}
            />
          )
        )}
      </ModalMediaContainer>

      <DetailsGrid>
        {/* Row 1: Name */}
        <DetailLabel> 
          {isVideo ? <FiFilm /> : <FiImage />}
          Name
        </DetailLabel>
        <DetailValue>{mediaItem.name || 'N/A'}</DetailValue>

        {/* Row 2: Tags (conditionally rendered) */}
        {mediaItem.tags && mediaItem.tags.length > 0 && (
          <> {/* Fragment ensures these two elements form a pair for the grid */}
            <DetailLabel>
              <FiTag /> 
              Tags
            </DetailLabel>
            <TagsContainer>
              {mediaItem.tags.map((tag, index) => (
                <TagBadge key={index}>{tag}</TagBadge>
              ))}
            </TagsContainer>
          </>
        )}

        {/* Row 3: Uploaded */}
        <DetailLabel>
          <FiCalendar /> 
          Uploaded
        </DetailLabel>
        <DetailValue>{formatDate(mediaItem.uploadedAt)}</DetailValue>
        
        {/* Row 4: Size */}
        <DetailLabel>
          <FiInfo /> 
          Size
        </DetailLabel>
        <DetailValue>{formatFileSize(mediaItem.size)}</DetailValue>
      </DetailsGrid>
    </Modal>
  );
};

export default React.memo(ImageDetailModal);