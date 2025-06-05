// client/src/components/common/Modal.js
import React, { useEffect, useState } from 'react'; // <<--- IMPORT useState HERE
import styled, { keyframes, css } from 'styled-components';
import { IoClose } from 'react-icons/io5';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const scaleIn = keyframes`
  from { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
`;

const scaleOut = keyframes`
  from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  to { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.modalOverlay};
  /* display: flex; // display: flex removed as ModalContent is absolutely positioned
  justify-content: center;
  align-items: center; */
  z-index: 1000;
  opacity: 0;
  visibility: hidden;

  ${({ $isOpen, $isExiting }) => {
    if ($isOpen) { // When opening
      return css`
        visibility: visible;
        animation: ${fadeIn} 0.3s ease-out forwards;
      `;
    }
    if ($isExiting) { // When closing (during exit animation)
      return css`
        visibility: visible; /* Keep visible during fade out */
        animation: ${fadeOut} 0.3s ease-in forwards;
        animation-delay: 0.1s; /* Delay overlay fade slightly if content scales out first */
      `;
    }
    // Default (closed and not exiting)
    return css`
      visibility: hidden;
      opacity: 0;
    `;
  }}
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.modalBg};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  position: fixed; /* Changed to fixed for centering with top/left/transform */
  top: 50%;
  left: 50%;
  /* transform: translate(-50%, -50%) scale(0.95); // Initial state for animation */
  width: 90%;
  max-width: ${({ $maxWidth }) => $maxWidth || '600px'};
  max-height: 90vh;
  overflow-y: auto;
  opacity: 0; /* Start with opacity 0 for animation */
  visibility: hidden; /* Start hidden */

  ${({ $isOpen, $isExiting }) => {
    if ($isOpen) { // When opening
      return css`
        visibility: visible;
        animation: ${scaleIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; /* Spring-like ease */
      `;
    }
    if ($isExiting) { // When closing
      return css`
        visibility: visible; /* Keep visible during scale out */
        animation: ${scaleOut} 0.25s ease-in forwards;
      `;
    }
  }}

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
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
    transform: rotate(90deg);
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

const Modal = ({ isOpen, onClose, title, children, footerContent, maxWidth, showCloseButton = true }) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen); // Controls actual rendering

  useEffect(() => {
    let timer;
    if (isOpen) {
      setIsVisible(true); // Make modal content renderable
      setIsAnimatingOut(false); // Ensure not animating out
      document.body.classList.add('modal-open');
      const handleEsc = (event) => {
        if (event.key === 'Escape') onClose(); // Use event.key for modern approach
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        window.removeEventListener('keydown', handleEsc);
        document.body.classList.remove('modal-open');
      };
    } else if (!isOpen && isVisible) { // If isOpen becomes false but modal was visible
      setIsAnimatingOut(true); // Trigger exit animation
      timer = setTimeout(() => {
        setIsVisible(false); // After animation, make it truly not renderable
        setIsAnimatingOut(false); // Reset animation state
        document.body.classList.remove('modal-open');
      }, 300); // Duration should match your longest exit animation
    }
    return () => clearTimeout(timer);
  }, [isOpen, isVisible, onClose]); // isVisible added to dependencies

  if (!isVisible && !isAnimatingOut) return null; // Don't render if not visible and not animating out

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  
  return (
    <ModalOverlay $isOpen={isOpen && !isAnimatingOut} $isExiting={isAnimatingOut} onClick={handleOverlayClick}>
      <ModalContent $maxWidth={maxWidth} $isOpen={isOpen && !isAnimatingOut} $isExiting={isAnimatingOut}>
        {showCloseButton && (
          <CloseButton onClick={onClose} aria-label="Close modal">
            <IoClose />
          </CloseButton>
        )}
        {title && <ModalHeader><h2>{title}</h2></ModalHeader>}
        <ModalBody>{children}</ModalBody>
        {footerContent && <ModalFooter>{footerContent}</ModalFooter>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default React.memo(Modal);