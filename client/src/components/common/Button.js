// client/src/components/common/Button.js
import React from 'react';
import styled, { css } from 'styled-components';
import Spinner from './Spinner';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: ${({ $size }) => ($size === 'small' ? '0.4rem 0.8rem' : $size === 'large' ? '0.8rem 1.5rem' : '0.65rem 1.25rem')};
  font-size: ${({ $size }) => ($size === 'small' ? '0.85rem' : $size === 'large' ? '1.05rem' : '0.95rem')};
  font-weight: 500;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitionSpeed} ease,
              border-color ${({ theme }) => theme.transitionSpeed} ease,
              color ${({ theme }) => theme.transitionSpeed} ease,
              opacity 0.2s ease,
              transform 0.15s ease;
  border: 1px solid transparent;
  white-space: nowrap;
  line-height: 1.5;
  user-select: none;
  outline: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:not(:disabled):active {
    transform: translateY(1px);
  }

  ${({ $variant, theme }) => {
    // Your existing variant CSS (primary, secondary, danger, outline, text)
    // Ensure these are complete and correct from previous versions
    switch ($variant) {
      case 'secondary': return css` /* ... */ `;
      case 'danger': return css` /* ... */ `;
      case 'outline': return css`
          background-color: transparent;
          color: ${theme.primary};
          border-color: ${theme.primary};
          &:hover:not(:disabled) {
            background-color: ${theme.primary};
            color: ${theme.buttonText === theme.text ? theme.body : theme.buttonText};
          }
        `;
      default: // Primary
        return css`
          background-color: ${theme.primary};
          color: ${theme.buttonText === theme.text ? theme.body : theme.buttonText};
          border-color: ${theme.primary};
          &:hover:not(:disabled) {
            background-color: ${theme.primaryHover};
            border-color: ${theme.primaryHover};
          }
        `;
    }
  }}

  ${({ $isLoading }) => $isLoading && css`
    cursor: progress !important;
    pointer-events: none; 
    .button-content-wrapper {
      visibility: hidden;
      opacity: 0;
    }
  `}

  /* For icon-only buttons (when children are not present) */
  ${({ $iconOnly, $size }) => $iconOnly && css`
    padding: ${$size === 'small' ? '0.4rem' : $size === 'large' ? '0.6rem' : '0.5rem'};
    width: ${$size === 'small' ? 'calc(0.85rem + 0.8rem + 2px)' : $size === 'large' ? 'calc(1.05rem + 1.2rem + 2px)' : 'calc(0.95rem + 1rem + 2px)'}; /* Approx icon size + padding + border */
    height: ${$size === 'small' ? 'calc(0.85rem + 0.8rem + 2px)' : $size === 'large' ? 'calc(1.05rem + 1.2rem + 2px)' : 'calc(0.95rem + 1rem + 2px)'};
    .button-icon-start, .button-icon-end {
      margin: 0 !important; /* Remove margins if icon-only */
    }
  `}
`;

const ButtonContentWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  transition: opacity 0.2s ease-out, visibility 0s linear 0.2s;
`;

const ButtonSpinnerContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonIconSpan = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  svg {
    width: 1em; 
    height: 1em;
  }
`;

const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  iconStart,
  iconEnd,
  type = 'button',
  size = 'medium', // medium, small, large
  className, // Allow passing className
  ...props
}) => {
  const iconOnly = !children && (iconStart || iconEnd);
  return (
    <StyledButton 
      type={type} 
      $variant={variant} 
      $isLoading={isLoading} 
      $size={size}
      $iconOnly={iconOnly}
      disabled={isLoading || props.disabled} 
      className={className}
      {...props}
    >
      {isLoading && (
        <ButtonSpinnerContainer>
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

export default React.memo(Button);