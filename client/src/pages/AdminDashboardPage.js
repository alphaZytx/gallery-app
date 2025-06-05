// client/src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MediaGrid from '../components/media/MediaGrid';
import UploadForm from '../components/admin/UploadForm';
import EditMediaForm from '../components/admin/EditMediaForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
// Spinner import was previously unused here by linting, re-add if needed for a page-level spinner
// import Spinner from '../components/common/Spinner';
import { getAllAdminMedia, deleteMedia } from '../api';
import { FiPlusCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const DashboardContainer = styled.div`
  padding: 1rem 0;
`;

const DashboardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};

  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    h1 {
      font-size: 1.75rem;
    }
  }
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.danger || '#dc3545'};
  font-size: 1.1rem;
  padding: 2rem;
  background-color: ${({ theme }) => (theme.danger || '#dc3545')}1A;
  border: 1px solid ${({ theme }) => (theme.danger || '#dc3545')};
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  svg {
    font-size: 1.3rem;
  }
`;

const SuccessMessage = styled.div`
  background-color: ${({ theme }) => (theme.accent || '#28a745')}2A;
  color: ${({ theme }) => (theme.accent || '#28a745')};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  svg {
    font-size: 1.3rem;
  }
`;

const ConfirmDialogContent = styled.div`
  p {
    margin-bottom: 1.5rem;
    font-size: 1.05rem;
    line-height: 1.6;
    strong {
      color: ${({ theme }) => theme.primary};
    }
  }
`;

const AdminDashboardPage = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  
  const [selectedMediaForEdit, setSelectedMediaForEdit] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);

  const fetchAdminMedia = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAllAdminMedia();
      // Ensure data is an array and filter out invalid items
      const validItems = Array.isArray(response.data) ? response.data.filter(item => item && item.id) : [];
      setMediaItems(validItems);
    } catch (err) {
      console.error("Failed to fetch admin media:", err);
      setError('Could not load media items. Please try refreshing.');
      setMediaItems([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminMedia();
  }, [fetchAdminMedia]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleUploadSuccess = (newMedia) => {
    if (newMedia && newMedia.id) { // Ensure newMedia is valid
      setMediaItems(prevItems => [newMedia, ...prevItems.filter(item => item && item.id)]);
    }
    setIsUploadModalOpen(false);
    setSuccessMessage('Media uploaded successfully!');
  };

  const handleEditClick = (mediaItem) => {
    setSelectedMediaForEdit(mediaItem);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = (updatedMedia) => {
    if (updatedMedia && updatedMedia.id) { // Ensure updatedMedia is valid
      setMediaItems(prevItems =>
        prevItems.map(item => (item && item.id === updatedMedia.id ? updatedMedia : item)).filter(item => item && item.id)
      );
    }
    setIsEditModalOpen(false);
    setSelectedMediaForEdit(null);
    setSuccessMessage('Media updated successfully!');
  };

  const handleDeleteClick = (mediaId, mediaName) => {
    setMediaToDelete({ id: mediaId, name: mediaName });
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete || !mediaToDelete.id) return;
    // setIsLoading(true); // Consider a more specific loading state for delete action
    try {
      await deleteMedia(mediaToDelete.id);
      setMediaItems(prevItems => prevItems.filter(item => item && item.id !== mediaToDelete.id));
      setSuccessMessage(`"${mediaToDelete.name}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete media:", err);
      setError(`Could not delete "${mediaToDelete.name}". Please try again.`);
    } finally {
      // setIsLoading(false);
      setIsConfirmDeleteModalOpen(false);
      setMediaToDelete(null);
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>Admin Dashboard</h1>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          variant="primary"
          iconStart={<FiPlusCircle />}
        >
          Upload New Media
        </Button>
      </DashboardHeader>

      {successMessage && (
        <SuccessMessage>
          <FiCheckCircle /> {successMessage}
        </SuccessMessage>
      )}
      {error && !isLoading && (
          <ErrorMessage>
            <FiAlertTriangle /> {error}
          </ErrorMessage>
      )}

      <MediaGrid
        items={mediaItems}
        isAdmin={true}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload New Media"
        maxWidth="700px"
      >
        <UploadForm
          onUploadSuccess={handleUploadSuccess}
          closeModal={() => setIsUploadModalOpen(false)}
        />
      </Modal>

      {selectedMediaForEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMediaForEdit(null);
          }}
          title={`Edit Media: ${selectedMediaForEdit.name}`}
          maxWidth="600px"
        >
          <EditMediaForm
            mediaItem={selectedMediaForEdit}
            onUpdateSuccess={handleUpdateSuccess}
            closeModal={() => {
              setIsEditModalOpen(false);
              setSelectedMediaForEdit(null);
            }}
          />
        </Modal>
      )}

      {mediaToDelete && (
        <Modal
            isOpen={isConfirmDeleteModalOpen}
            onClose={() => {
                setIsConfirmDeleteModalOpen(false);
                setMediaToDelete(null);
            }}
            title="Confirm Deletion"
            maxWidth="500px"
            footerContent={
                <>
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setIsConfirmDeleteModalOpen(false);
                            setMediaToDelete(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} /* isLoading={isLoadingDelete} */ >
                        Delete
                    </Button>
                </>
            }
        >
            <ConfirmDialogContent>
                <p>
                    Are you sure you want to permanently delete 
                    <strong> "{mediaToDelete.name}"</strong>? This action cannot be undone.
                </p>
            </ConfirmDialogContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboardPage;