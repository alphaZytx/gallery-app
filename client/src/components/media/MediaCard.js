// client/src/components/media/MediaCard.js
import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { getMediaViewURL } from '../../api';
import { FiMaximize2, FiImage, FiAlertCircle, FiLoader } from 'react-icons/fi';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const CardWrapper = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.cardShadow};
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
              box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  display: flex;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  }
  &:hover .media-overlay { opacity: 1; }
`;

const ImageContainer = styled.div`
  width: 100%;
  /* Aspect Ratio: To make images taller, increase padding-top percentage.
     4:3 (landscape) => padding-top: 75%;
     1:1 (square)    => padding-top: 100%;
     3:4 (portrait)  => padding-top: 133.33%; 
     2:3 (portrait)  => padding-top: 150%;
  */
  padding-top: 133.33%; /* Aspect ratio 3:4 (taller images) */
  position: relative;
  background-color: ${({ theme }) => (theme.body === '#1A1D24' ? '#282c34' : '#f0f2f5')};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const StyledImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease-in-out 0.1s, transform 0.4s ease-out;

  ${CardWrapper}:hover & { transform: scale(1.05); }
  ${({ $loaded, $error }) => ($loaded && !$error) && css`opacity: 1;`}
`;

const StatusContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
`;

const StatusIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme, $isError }) => ($isError ? theme.danger : theme.secondary)}B3;
  ${({ $isLoading }) => $isLoading && css`
    svg {
      animation: ${keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`} 1s linear infinite;
    }
  `}
`;

const MediaOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.35s ease-in-out;
  padding: 0.8rem;
  text-align: center;
  box-sizing: border-box;
`;

const OverlayViewDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const OverlayIcon = styled(FiMaximize2)`
  font-size: 1.2rem;
`;

const DisplayNameInOverlay = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
`;

const MediaCard = ({ mediaItem, onClick }) => {
  const [isImageActuallyLoading, setIsImageActuallyLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const imageUrl = mediaItem?.pathname ? getMediaViewURL(mediaItem.pathname) : '';

  useEffect(() => {
    setIsImageActuallyLoading(true);
    setImageError(false);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setIsImageActuallyLoading(false);
    setImageError(false);
  };
  const handleImageError = () => {
    setIsImageActuallyLoading(false);
    setImageError(true);
  };
  
  let displayName = mediaItem?.name || "Untitled";
  if (mediaItem?.name?.match(/\.(jpeg|jpg|png|gif|webp|mp4|mov|webm)$/i) || 
      mediaItem?.name?.toLowerCase().startsWith("image") || 
      mediaItem?.name?.toLowerCase().startsWith("video")) {
    displayName = mediaItem.tags && mediaItem.tags.length > 0 
                  ? mediaItem.tags[0] 
                  : "Media Item";
  }
  displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <CardWrapper onClick={onClick} title={`View details for ${mediaItem?.name || 'this media'}`}>
      <ImageContainer> {/* This div now controls the aspect ratio */}
        <StatusContainer $show={isImageActuallyLoading || imageError}>
          {isImageActuallyLoading && !imageError && <StatusIcon as={FiLoader} $isLoading title="Loading image..." />}
          {imageError && <StatusIcon as={FiAlertCircle} $isError title="Error loading image" />}
          {!isImageActuallyLoading && !imageError && !imageUrl && 
            <StatusIcon as={FiImage} title="Image unavailable" />
          }
        </StatusContainer>

        {imageUrl && (
          <StyledImage
            src={imageUrl}
            alt={mediaItem?.name || 'Gallery item'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            $loaded={!isImageActuallyLoading && !imageError}
            $error={imageError}
            style={{ visibility: isImageActuallyLoading ? 'hidden' : 'visible' }}
            loading="lazy"
          />
        )}
        
        <MediaOverlay className="media-overlay">
          <OverlayViewDetails>
            <OverlayIcon />
            <span>View</span>
          </OverlayViewDetails>
          <DisplayNameInOverlay>{displayName}</DisplayNameInOverlay>
        </MediaOverlay>
      </ImageContainer>
      {/* No CardInfo block below the image */}
    </CardWrapper>
  );
};

export default React.memo(MediaCard);