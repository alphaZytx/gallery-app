// client/src/components/media/MediaCard.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getMediaViewURL } from '../../api';
import { FiMaximize2, FiImage } from 'react-icons/fi';

const CardWrapper = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.cardShadow};
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:hover .overlay {
    opacity: 1;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  padding-top: 75%; /* Aspect ratio 4:3 */
  position: relative;
  background-color: ${({ theme }) => (theme.body === '#1A1D24' ? '#282c34' : '#f0f2f5')};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.4s ease-in-out;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
`;

const PlaceholderIconContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const PlaceholderIcon = styled(FiImage)`
  font-size: 3rem;
  color: ${({ theme }) => theme.secondary};
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 1rem;
  text-align: center;
`;

const OverlayIcon = styled(FiMaximize2)`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const CardInfo = styled.div`
  padding: 0.8rem 1rem;
  h3 {
    font-size: 1.0rem; /* Adjusted for cleaner look */
    font-weight: 500; /* Slightly less bold */
    color: ${({ theme }) => theme.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
    line-height: 1.4;
  }
`;

const MediaCard = ({ mediaItem, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = mediaItem?.pathname ? getMediaViewURL(mediaItem.pathname) : '';

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]); // Reset when imageUrl changes (i.e., when mediaItem changes)

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = (e) => {
    console.error(`MediaCard: Failed to load image. URL: ${imageUrl}`, e);
    setImageError(true);
  };

  // Determine a user-friendly display name
  // If mediaItem.name looks like a typical uploaded filename (e.g., includes extension, or common prefixes),
  // try to make it cleaner. Otherwise, use it as is. This is a basic heuristic.
  let displayName = mediaItem?.name || "Untitled Media";
  if (displayName.match(/\.(jpeg|jpg|png|gif|webp|mp4|mov|webm)$/i) || displayName.startsWith("image") || displayName.startsWith("video")) {
    // If it has tags, prefer using the first tag as a title, or a generic title
    displayName = mediaItem.tags && mediaItem.tags.length > 0 ? mediaItem.tags[0] : "View Media";
    // Capitalize the first letter of the tag or "View Media"
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  }


  return (
    <CardWrapper onClick={onClick} title={`View ${mediaItem?.name || 'Details'}`}>
      <ImageContainer>
        {/* Show placeholder only if not loaded and no error yet, or if error occurred */}
        <PlaceholderIconContainer $visible={!imageLoaded || imageError}>
          <PlaceholderIcon title={imageError ? "Error loading image" : "Loading image..."} />
        </PlaceholderIconContainer>

        {imageUrl && ( // Only attempt to render image if URL is valid
          <StyledImage
            src={imageUrl}
            alt={mediaItem?.name || 'Gallery item'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            $loaded={imageLoaded && !imageError} // Image is fully visible only when loaded and no error
            style={{ display: (imageLoaded || imageError) ? 'block' : 'none' }} // Hide img tag until loaded/error to prevent broken icon
            loading="lazy"
          />
        )}
        <Overlay className="overlay">
          <OverlayIcon />
          <span>View Details</span>
        </Overlay>
      </ImageContainer>
      <CardInfo>
        <h3>{displayName}</h3>
      </CardInfo>
    </CardWrapper>
  );
};

export default MediaCard;