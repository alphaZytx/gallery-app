// client/src/pages/PublicGalleryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MediaGrid from '../components/media/MediaGrid';
import ImageDetailModal from '../components/media/ImageDetailModal';
import Button from '../components/common/Button';
// Spinner is now rendered by MediaGrid when isLoading is true
// import Spinner from '../components/common/Spinner'; 
import { getPublicGalleryImages } from '../api';
import { FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';

const PageContainer = styled.div`
  max-width: 1600px; /* Wider for gallery */
  margin: 0 auto;
  padding: 1rem;
`;

const PageHeader = styled.header`
  text-align: center;
  margin-bottom: 2.5rem; /* More space */
  h1 {
    font-size: 2.8rem; /* Larger title */
    font-weight: 700;
    color: ${({ theme }) => theme.primary};
    margin-bottom: 0.75rem;
  }
  p {
    font-size: 1.15rem;
    color: ${({ theme }) => theme.secondary};
    max-width: 600px;
    margin: 0 auto; /* Center subtext */
  }

   @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: 2rem;
    h1 {
      font-size: 2.2rem;
    }
    p {
      font-size: 1rem;
    }
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  gap: 1rem;

  span {
    font-size: 1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    padding: 0 0.5rem;
  }
`;

const ErrorDisplay = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.danger || '#dc3545'};
  font-size: 1.1rem;
  padding: 2rem;
  background-color: ${({ theme }) => (theme.danger || '#dc3545')}1A;
  border: 1px solid ${({ theme }) => (theme.danger || '#dc3545')};
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 2rem auto;
  max-width: 500px;

  svg {
    font-size: 2rem;
  }
`;

const PublicGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const ITEMS_PER_PAGE = parseInt(process.env.REACT_APP_GALLERY_PAGE_LIMIT, 10) || 12;

  const fetchImages = useCallback(async (page) => {
    setIsLoading(true);
    setError('');
    // console.log(`Fetching images for page: ${page}`);
    try {
      const response = await getPublicGalleryImages(page, ITEMS_PER_PAGE);
      const fetchedImages = response.data.images || [];
      // console.log("Fetched raw data:", response.data);
      // Ensure fetchedImages is an array and filter any invalid items before setting state
      const validImages = Array.isArray(fetchedImages) ? fetchedImages.filter(img => img && img.id && img.pathname) : [];
      
      setImages(validImages);
      // console.log("Set images in state:", validImages);
      setTotalPages(response.data.totalPages || 0);
      setCurrentPage(response.data.currentPage || 1);
    } catch (err) {
      console.error("Failed to fetch gallery images:", err.response?.data?.message || err.message);
      setError('Could not load images. Please try refreshing the page or check back later.');
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [ITEMS_PER_PAGE]); // Added ITEMS_PER_PAGE to dependency array

  useEffect(() => {
    fetchImages(currentPage);
  }, [fetchImages, currentPage]);

  const handleCardClick = (image) => {
    // console.log("PublicGalleryPage: handleCardClick triggered with image:", image);
    if (image && image.id) { // Ensure a valid image object is passed
        setSelectedImage(image);
    } else {
        console.warn("Attempted to open modal with invalid image object:", image);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>Welcome to Our Gallery</h1>
        <p>Discover amazing images shared with the world.</p>
      </PageHeader>

      {error && !isLoading && (
        <ErrorDisplay>
          <FiAlertCircle />
          {error}
        </ErrorDisplay>
      )}

      <MediaGrid
        items={images}
        isLoading={isLoading}
        onCardClick={handleCardClick}
        isAdmin={false}
      />

      {!isLoading && !error && totalPages > 0 && images.length > 0 && (
        <PaginationControls>
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            variant="outline"
            iconStart={<FiChevronLeft />}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
            iconEnd={<FiChevronRight />}
          >
            Next
          </Button>
        </PaginationControls>
      )}
      
      {/* Conditionally render modal only if selectedImage is not null */}
      {selectedImage && (
        <ImageDetailModal
          isOpen={!!selectedImage} // Ensures isOpen is boolean
          onClose={closeModal}
          mediaItem={selectedImage}
        />
      )}
    </PageContainer>
  );
};

export default PublicGalleryPage;