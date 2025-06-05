// client/src/components/common/Spinner.js
import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Use $thickness for transient prop
const StyledSpinner = styled.div`
  border: ${({ $thickness = '4px' }) => $thickness} solid ${({ theme, color }) => color || theme.secondary};
  border-top-color: ${({ theme, color }) => color || theme.primary};
  border-radius: 50%;
  width: ${({ size = '40px' }) => size};
  height: ${({ size = '40px' }) => size};
  animation: ${rotate} 0.8s linear infinite;
  display: inline-block;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: ${({ $containerPadding }) => $containerPadding || '1rem 0'};
`;

// Rename prop to $thickness when passing to StyledSpinner
const Spinner = ({ size, thickness = '4px', color, containerPadding, inline=false }) => {
  if (inline) {
    return <StyledSpinner size={size} $thickness={thickness} color={color} />;
  }
  return (
    <SpinnerContainer $containerPadding={containerPadding}>
      <StyledSpinner size={size} $thickness={thickness} color={color} />
    </SpinnerContainer>
  );
};

export default Spinner;