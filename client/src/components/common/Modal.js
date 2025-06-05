// client/src/components/common/Modal.js
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { IoClose } from 'react-icons/io5';

// Use $isOpen for transient prop
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.modalOverlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0s linear 0.3s;

  ${({ $isOpen }) =>
    $isOpen &&
    `
    opacity: 1;
    visibility: visible;
    transition: opacity 0.3s ease, visibility 0s linear 0s;
  `}
`;

// Use $isOpen for transient prop (if needed for conditional styling, here for consistency)
// Use $maxWidth for transient prop
const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.modalBg};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  width: 90%;
  max-width: ${({ $maxWidth }) => $maxWidth || '600px'};
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.9);
  transition: transform 0.3s ease;

  ${ModalOverlay}.open & { // This relies on className, not transient prop directly
    transform: scale(1);
  }
  /* Alternative if ModalOverlay doesn't get 'open' class:
  ${({ $isOpen }) => $isOpen && `transform: scale(1);`} 
  */


  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1.5rem;
    width: 95%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.primary};
  }
`;

const ModalBody = styled.div``;

const ModalFooter = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.borderColor};
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

// Rename props passed to styled components
const Modal = ({ isOpen, onClose, title, children, footerContent, maxWidth, showCloseButton = true }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen && typeof document === 'undefined') return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick} className={isOpen ? 'open' : ''}>
      <ModalContent $maxWidth={maxWidth} $isOpen={isOpen}> {/* Pass $isOpen if needed for direct styling */}
        {showCloseButton && (
          <CloseButton onClick={onClose} aria-label="Close modal">
            <IoClose />
          </CloseButton>
        )}
        {title && (
          <ModalHeader>
            <h2>{title}</h2>
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footerContent && <ModalFooter>{footerContent}</ModalFooter>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;