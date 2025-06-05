// client/src/pages/PublicGalleryPage.js
// THIS IS THE CORRECTED CODE - MAKE SURE YOUR FILE MATCHES THIS
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MediaGrid from '../components/media/MediaGrid';
import ImageDetailModal from '../components/media/ImageDetailModal';
import Button from '../components/common/Button'; // This is used
import Spinner from '../components/common/Spinner';
import { getPublicGalleryImages } from '../api';
import { FiChevronLeft, FiChevronRight, FiAlertCircle, FiCameraOff } from 'react-icons/fi'; // These are used

const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px - 3rem); 
`;
const PageHeader = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  h1 {
    font-size: 2.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.primary};
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
  }
  p {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.secondary};
    max-width: 550px;
    margin: 0 auto;
    line-height: 1.5;
  }
   @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: 1.5rem;
    h1 { font-size: 2rem; }
    p { font-size: 0.95rem; }
  }
`;
const GridWrapper = styled.div`flex-grow: 1;`;
const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0 1rem 0;
  width: 100%;
  gap: 1rem;
  margin-top: auto;

  span {
    font-size: 0.95rem;
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    padding: 0 0.5rem;
  }
`;
const MessageDisplay = styled.div`
  text-align: center;
  font-size: 1.1rem;
  padding: 3rem 1rem;
  background-color: ${({ theme, type }) => {
    if (type === 'error') return `${theme.danger || '#dc3545'}1A`;
    return 'transparent';
  }};
  border: 1px solid ${({ theme, type }) => (type === 'error' ? (theme.danger || '#dc3545') : 'transparent')};
  color: ${({ theme, type }) => (type === 'error' ? (theme.danger || '#dc3545') : theme.secondary)};
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem auto;
  max-width: 500px;
  flex-grow: 1;
  min-height: 300px;

  svg {
    font-size: 2.5rem;
  }
`;

const PublicGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0); 

  const ITEMS_PER_PAGE = parseInt(process.env.REACT_APP_GALLERY_PAGE_LIMIT, 10) || 12;

  const fetchImages = useCallback(async (page) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getPublicGalleryImages(page, ITEMS_PER_PAGE);
      const fetchedImages = response.data.images || [];
      const validImages = Array.isArray(fetchedImages) 
                          ? fetchedImages.filter(img => img && img.id && typeof img.pathname === 'string' && img.pathname.trim() !== '') 
                          : [];
      setImages(validImages);
      setTotalPages(response.data.totalPages || 0);
      setCurrentPage(response.data.currentPage || 1);
      setTotalItems(response.data.totalItems || 0); 
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

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prevCurrentPage => { 
      if (prevCurrentPage > 1) {
        window.scrollTo(0, 0);
        return prevCurrentPage - 1;
      }
      return prevCurrentPage;
    });
  }, []); 

  const handleNextPage = useCallback(() => {
    setCurrentPage(prevCurrentPage => { 
      if (prevCurrentPage < totalPages) { 
        window.scrollTo(0, 0);
        return prevCurrentPage + 1;
      }
      return prevCurrentPage;
    });
  }, [totalPages]); 

  let content;
  if (isLoading) {
    content = <Spinner containerPadding="4rem 0" size="50px" />;
  } else if (error) {
    content = <MessageDisplay type="error"><FiAlertCircle />{error}</MessageDisplay>;
  } else if (images.length === 0 && totalItems === 0) { 
    content = <MessageDisplay><FiCameraOff />No images found in the gallery yet.</MessageDisplay>;
  } else if (images.length === 0 && totalItems > 0) { 
    content = <MessageDisplay><FiCameraOff />No images on this page. Try another page.</MessageDisplay>;
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
      {!isLoading && !error && totalPages > 1 && (images.length > 0 || (currentPage > 1 && totalItems > 0)) && (
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
      {selectedImage && <ImageDetailModal isOpen={!!selectedImage} onClose={closeModal} mediaItem={selectedImage} />}
    </PageContainer>
  );
};

export default PublicGalleryPage;