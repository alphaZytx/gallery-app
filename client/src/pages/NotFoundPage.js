import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/common/Button'; // Your Button component
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: calc(100vh - 120px); /* Adjust based on navbar height */
  padding: 2rem;
`;

const IconWrapper = styled.div`
  font-size: 5rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite ease-in-out;

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 2.5rem;
  }
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.secondary};
  margin-bottom: 2rem;
  max-width: 500px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 1rem;
  }
`;

const NotFoundPage = () => {
  return (
    <NotFoundContainer>
      <IconWrapper>
        <FiAlertTriangle />
      </IconWrapper>
      <Title>404 - Page Not Found</Title>
      <Message>
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </Message>
      <Button as={Link} to="/" variant="primary" iconStart={<FiHome />}>
        Go to Homepage
      </Button>
    </NotFoundContainer>
  );
};

export default NotFoundPage;