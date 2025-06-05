import React from 'react';
import styled, { css } from 'styled-components';
import Spinner from './Spinner'; // Assuming Spinner.js is in the same common folder

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative; /* For absolute positioning of spinner */
  padding: 0.65rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitionSpeed} ease,
              border-color ${({ theme }) => theme.transitionSpeed} ease,
              color ${({ theme }) => theme.transitionSpeed} ease,
              opacity 0.2s ease, /* Added for disabled state */
              transform 0.15s ease;
  border: 1px solid transparent;
  white-space: nowrap;
  line-height: 1.5;
  user-select: none; /* Prevent text selection during click */

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:not(:disabled):active {
    transform: translateY(1px);
  }

  /* Variant styling */
  ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return css`
          background-color: ${theme.secondary};
          color: ${theme.body}; /* Better contrast for dark theme secondary */
          border-color: ${theme.secondary};
          &:hover:not(:disabled) {
            background-color: ${theme.secondaryHover || theme.primaryHover};
            border-color: ${theme.secondaryHover || theme.primaryHover};
          }
        `;
      case 'danger':
        return css`
          background-color: ${theme.danger || '#dc3545'};
          color: #ffffff; /* Ensure white text on danger red */
          border-color: ${theme.danger || '#dc3545'};
          &:hover:not(:disabled) {
            background-color: ${theme.dangerHover || '#c82333'};
            border-color: ${theme.dangerHover || '#c82333'};
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          color: ${theme.primary};
          border-color: ${theme.primary};
          &:hover:not(:disabled) {
            background-color: ${theme.primary};
            color: ${theme.body}; /* Or a specific button text color for primary bg */
          }
        `;
      case 'text':
        return css`
          background-color: transparent;
          color: ${theme.text};
          border-color: transparent;
          padding: 0.5rem 0.8rem;
          &:hover:not(:disabled) {
            background-color: ${theme.body === '#1A1D24' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
          }
        `;
      default: // Primary
        return css`
          background-color: ${theme.primary};
          color: ${theme.buttonText === theme.text ? theme.body : theme.buttonText}; // Default to theme.buttonText
          border-color: ${theme.primary};
          &:hover:not(:disabled) {
            background-color: ${theme.primaryHover};
            border-color: ${theme.primaryHover};
          }
        `;
    }
  }}

  /* Styling for loading state */
  ${({ $isLoading }) => $isLoading && css` // Using transient prop $isLoading for styling
    cursor: progress !important; /* More specific cursor for loading */
    /* Prevent interaction while loading */
    pointer-events: none; 

    .button-content-wrapper {
      visibility: hidden; /* Hide the wrapper for text and icons */
    }
  `}
`;

// Wrapper for text and icons to easily hide them
const ButtonContentWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em; /* Default gap between icon and text */
`;

const ButtonSpinnerContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex; /* To ensure spinner itself is centered if it has margin/padding */
  align-items: center;
  justify-content: center;
`;

const ButtonIconSpan = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0; /* Helps align icons better */
  svg {
    width: 1em; /* Relative to button font size */
    height: 1em; /* Relative to button font size */
  }
`;

const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  iconStart,
  iconEnd,
  type = 'button',
  size, // Example: 'small', 'large' - can be used for padding/font-size variants
  ...props // Pass down other props like onClick, disabled, aria-label, etc.
}) => {
  return (
    // Pass $isLoading to StyledButton for styling purposes
    <StyledButton type={type} variant={variant} $isLoading={isLoading} disabled={isLoading || props.disabled} {...props}>
      {isLoading && (
        <ButtonSpinnerContainer>
          {/* Use inline spinner and pass a contrast color if needed, or let it inherit */}
          <Spinner size="1.2em" thickness="2px" inline color="currentColor"/>
        </ButtonSpinnerContainer>
      )}
      <ButtonContentWrapper className="button-content-wrapper">
        {iconStart && <ButtonIconSpan className="button-icon-start">{iconStart}</ButtonIconSpan>}
        {children && <span className="button-text">{children}</span>}
        {iconEnd && <ButtonIconSpan className="button-icon-end">{iconEnd}</ButtonIconSpan>}
      </ButtonContentWrapper>
    </StyledButton>
  );
};

export default Button;