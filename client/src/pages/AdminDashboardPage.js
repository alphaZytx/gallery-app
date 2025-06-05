// client/src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components'; // Added keyframes, css
import MediaGrid from '../components/media/MediaGrid';
import UploadForm from '../components/admin/UploadForm';
import EditMediaForm from '../components/admin/EditMediaForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { getAllAdminMedia, deleteMedia } from '../api';
import { FiPlusCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

// ... (DashboardContainer, DashboardHeader remain the same)
const DashboardContainer = styled.div` /* ... */ `;
const DashboardHeader = styled.header` /* ... */ `;

const fadeInSmooth = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOutSmooth = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
`;

// Message component for success/error with transitions
const AlertMessage = styled.div`
  color: ${({ theme, type }) => (type === 'error' ? (theme.danger || '#dc3545') : (theme.accent || '#28a745'))};
  background-color: ${({ theme, type }) => (type === 'error' ? (theme.danger || '#dc3545') : (theme.accent || '#28a745'))}1A;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0; /* Start hidden for animation */
  animation: ${({ $show }) => $show ? css`${fadeInSmooth} 0.4s ease-out forwards` : css`${fadeOutSmooth} 0.4s ease-in forwards`};
  
  svg {
    font-size: 1.3rem;
  }
`;

const ConfirmDialogContent = styled.div` /* ... (remains the same) ... */ `;


const AdminDashboardPage = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // For initial page load
  const [isProcessing, setIsProcessing] = useState(false); // For actions like delete
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  
  const [selectedMediaForEdit, setSelectedMediaForEdit] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);

  // Memoized fetch function
  const fetchAdminMedia = useCallback(async () => {
    setIsLoadingPage(true);
    setError('');
    try {
      const response = await getAllAdminMedia();
      const validItems = Array.isArray(response.data) ? response.data.filter(item => item && item.id) : [];
      setMediaItems(validItems);
    } catch (err) {
      console.error("Failed to fetch admin media:", err);
      setError('Could not load media items. Please try refreshing.');
      setMediaItems([]);
    } finally {
      setIsLoadingPage(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminMedia();
  }, [fetchAdminMedia]);

  // Auto-clear success/error messages
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => setSuccessMessage(''), 3500);
    }
    if (error) {
      timer = setTimeout(() => setError(''), 5000); // Errors persist a bit longer
    }
    return () => clearTimeout(timer);
  }, [successMessage, error]);

  // Memoized handlers
  const handleUploadSuccess = useCallback((newMedia) => {
    if (newMedia && newMedia.id) {
      setMediaItems(prevItems => [newMedia, ...prevItems.filter(item => item && item.id)]);
    }
    setIsUploadModalOpen(false);
    setSuccessMessage('Media uploaded successfully!');
  }, []);

  const handleEditClick = useCallback((mediaItem) => {
    setSelectedMediaForEdit(mediaItem);
    setIsEditModalOpen(true);
  }, []);

  const handleUpdateSuccess = useCallback((updatedMedia) => {
    if (updatedMedia && updatedMedia.id) {
      setMediaItems(prevItems =>
        prevItems.map(item => (item && item.id === updatedMedia.id ? updatedMedia : item)).filter(item => item && item.id)
      );
    }
    setIsEditModalOpen(false);
    setSelectedMediaForEdit(null);
    setSuccessMessage('Media updated successfully!');
  }, []);

  const handleDeleteClick = useCallback((mediaId, mediaName) => {
    setMediaToDelete({ id: mediaId, name: mediaName });
    setIsConfirmDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!mediaToDelete || !mediaToDelete.id) return;
    setIsProcessing(true); // Use specific loading state for delete
    setError(''); // Clear previous errors
    try {
      await deleteMedia(mediaToDelete.id);
      setMediaItems(prevItems => prevItems.filter(item => item && item.id !== mediaToDelete.id));
      setSuccessMessage(`"${mediaToDelete.name}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete media:", err);
      setError(`Could not delete "${mediaToDelete.name}". Please try again.`);
    } finally {
      setIsProcessing(false);
      setIsConfirmDeleteModalOpen(false);
      setMediaToDelete(null);
    }
  }, [mediaToDelete]);

  const closeUploadModal = useCallback(() => setIsUploadModalOpen(false), []);
  const closeEditModal = useCallback(() => { setIsEditModalOpen(false); setSelectedMediaForEdit(null); }, []);
  const closeConfirmDeleteModal = useCallback(() => { setIsConfirmDeleteModalOpen(false); setMediaToDelete(null); }, []);


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

      {/* Messages with transitions */}
      {successMessage && <AlertMessage $show={!!successMessage} type="success"><FiCheckCircle /> {successMessage}</AlertMessage>}
      {error && <AlertMessage $show={!!error} type="error"><FiAlertTriangle /> {error}</AlertMessage>}

      <MediaGrid
        items={mediaItems}
        isAdmin={true}
        isLoading={isLoadingPage} // MediaGrid spinner for page load
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <Modal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        title="Upload New Media"
        maxWidth="700px"
      >
        <UploadForm
          onUploadSuccess={handleUploadSuccess}
          closeModal={closeUploadModal}
        />
      </Modal>

      {selectedMediaForEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          title={`Edit Media: ${selectedMediaForEdit.name}`}
          maxWidth="600px"
        >
          <EditMediaForm
            mediaItem={selectedMediaForEdit}
            onUpdateSuccess={handleUpdateSuccess}
            closeModal={closeEditModal}
          />
        </Modal>
      )}

      {mediaToDelete && (
        <Modal
            isOpen={isConfirmDeleteModalOpen}
            onClose={closeConfirmDeleteModal}
            title="Confirm Deletion"
            maxWidth="500px"
            footerContent={
                <>
                    <Button variant="outline" onClick={closeConfirmDeleteModal} disabled={isProcessing}>
                        Cancel
                    </Button>
                    {/* Pass isProcessing to Button's isLoading prop */}
                    <Button variant="danger" onClick={confirmDelete} isLoading={isProcessing} disabled={isProcessing}>
                        Delete
                    </Button>
                </>
            }
        >
            <ConfirmDialogContent>
                <p>Are you sure you want to permanently delete <strong>"{mediaToDelete.name}"</strong>? This action cannot be undone.</p>
            </ConfirmDialogContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboardPage; // Typically pages are not memoized unless specific deep prop issues