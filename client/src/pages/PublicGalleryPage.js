// client/src/pages/PublicGalleryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MediaGrid from '../components/media/MediaGrid';
import ImageDetailModal from '../components/media/ImageDetailModal';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { getPublicGalleryImages } from '../api';
import { FiChevronLeft, FiChevronRight, FiAlertCircle, FiCameraOff } from 'react-icons/fi';

const PageContainer = styled.div` /* ... (keep existing styles) ... */ `;
const PageHeader = styled.header` /* ... (keep existing styles) ... */ `;
const GridWrapper = styled.div`flex-grow: 1;`;
const PaginationControls = styled.div` /* ... (keep existing styles for centering) ... */ `;
const MessageDisplay = styled.div` /* ... (keep existing styles) ... */ `;

const PublicGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // For overall page data fetching
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const ITEMS_PER_PAGE = parseInt(process.env.REACT_APP_GALLERY_PAGE_LIMIT, 10) || 12;

  const fetchImages = useCallback(async (page) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getPublicGalleryImages(page, ITEMS_PER_PAGE);
      const fetchedImages = response.data.images || [];
      // Crucial: Ensure each item has a valid pathname before setting state
      const validImages = Array.isArray(fetchedImages) 
                          ? fetchedImages.filter(img => img && img.id && typeof img.pathname === 'string' && img.pathname.trim() !== '') 
                          : [];
      
      setImages(validImages);
      setTotalPages(response.data.totalPages || 0);
      setCurrentPage(response.data.currentPage || 1);
      setTotalItems(response.data.totalItems || 0);

      if (validImages.length !== fetchedImages.length) {
          console.warn("PublicGalleryPage: Some fetched images had invalid pathnames and were filtered out.");
      }

    } catch (err) {
      console.error("PublicGalleryPage: Failed to fetch gallery images:", err.response?.data?.message || err.message);
      setError('Could not load images. Please try refreshing.');
      setImages([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [ITEMS_PER_PAGE]);

  useEffect(() => {
    fetchImages(currentPage);
  }, [fetchImages, currentPage]);

  const handleCardClick = useCallback((image) => {
    if (image && image.id) setSelectedImage(image);
  }, []);

  const closeModal = useCallback(() => setSelectedImage(null), []);
  const handleNextPage = useCallback(() => { /* ... (no change) ... */ }, [currentPage, totalPages]);
  const handlePreviousPage = useCallback(() => { /* ... (no change) ... */ }, [currentPage]);

  let content;
  if (isLoading) {
    content = <Spinner containerPadding="4rem 0" size="50px" />;
  } else if (error) {
    content = <MessageDisplay type="error"><FiAlertCircle />{error}</MessageDisplay>;
  } else if (images.length === 0) { // Simplified: if images array is empty after fetch & filter
    content = <MessageDisplay><FiCameraOff />No images found in the gallery yet.</MessageDisplay>;
  } else {
    content = <MediaGrid items={images} isLoading={false} onCardClick={handleCardClick} isAdmin={false} />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <h1>Welcome to Our Gallery</h1>
        <p>Discover amazing images shared with the world.</p>
      </PageHeader>
      <GridWrapper>{content}</GridWrapper>
      {!isLoading && !error && totalPages > 1 && images.length > 0 && (
        <PaginationControls>
          {/* ... Pagination buttons ... */}
        </PaginationControls>
      )}
      {selectedImage && <ImageDetailModal isOpen={!!selectedImage} onClose={closeModal} mediaItem={selectedImage} />}
    </PageContainer>
  );
};

export default PublicGalleryPage;