// client/src/pages/AdminLoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { FiLogIn } from 'react-icons/fi';

const LoginPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px); /* Full viewport height minus navbar */
  padding: 2rem 1rem; /* Add some padding for smaller screens */
  box-sizing: border-box; /* Ensure padding doesn't add to width/height */
`;

const LoginForm = styled.form`
  background-color: ${({ theme }) => theme.cardBg};
  padding: 2.5rem; /* Consistent padding */
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.cardShadow};
  width: 100%;
  max-width: 420px; /* Slightly increased max-width */
  display: flex;
  flex-direction: column;
  gap: 1.75rem; /* Increased gap between elements */

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 2rem 1.5rem;
    gap: 1.5rem;
  }
`;

const FormTitle = styled.h1`
  text-align: center;
  font-size: 2rem; /* Slightly larger title */
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem; /* Adjusted margin */
  letter-spacing: -0.5px; /* Subtle letter spacing */
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem; /* Space between label and input */

  label {
    font-weight: 500;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text};
  }

  input {
    padding: 0.85rem 1rem; /* Slightly more padding */
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.inputBorder};
    background-color: ${({ theme }) => theme.inputBg};
    color: ${({ theme }) => theme.text};
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &::placeholder { /* Style placeholder text */
        color: ${({ theme }) => theme.secondary};
        opacity: 0.7;
    }

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}4D; /* Adjusted focus ring color/opacity */
    }
  }
`;

const MessageText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  /* margin-top: -0.5rem; // Removed negative margin for better flow */
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  line-height: 1.4;
`;

const ErrorMessage = styled(MessageText)`
  color: ${({ theme }) => theme.danger || '#dc3545'};
  background-color: ${({ theme }) => (theme.danger || '#dc3545')}1A;
  border: 1px solid ${({ theme }) => (theme.danger || '#dc3545')}33; /* Subtle border */
`;

const InfoMessage = styled(MessageText)`
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.primary}1A;
  border: 1px solid ${({ theme }) => theme.primary}33; /* Subtle border */
`;


const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, loadingAuth, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [pageMessage, setPageMessage] = useState('');

  const from = location.state?.from?.pathname || "/admin/dashboard";

  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      setPageMessage("Your session has expired. Please log in again.");
      // Clean the URL by removing the query parameter after displaying the message
      // This will happen on the next navigation or if you manually do it here.
      // For simplicity, we'll let it clear on next input change.
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    // Clear auth-specific errors when component unmounts or user re-focuses
    return () => {
      if (authError) setAuthError(null); 
    };
  }, [isAuthenticated, navigate, from, authError, setAuthError]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (authError) setAuthError(null); // Clear API error on input
    if (pageMessage) setPageMessage(''); // Clear session expired message on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageMessage(''); 
    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }
    await login(email, password);
  };

  return (
    <LoginPageContainer>
      <LoginForm onSubmit={handleSubmit}>
        <FormTitle>Admin Login</FormTitle>
        {pageMessage && <InfoMessage>{pageMessage}</InfoMessage>}
        {authError && <ErrorMessage>{authError}</ErrorMessage>}
        <InputGroup>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleInputChange(setEmail)}
            placeholder="admin@example.com"
            required
            disabled={loadingAuth}
          />
        </InputGroup>
        <InputGroup>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handleInputChange(setPassword)}
            placeholder="••••••••"
            required
            disabled={loadingAuth}
          />
        </InputGroup>
        <Button 
            type="submit" 
            variant="primary" 
            isLoading={loadingAuth} 
            disabled={loadingAuth} 
            iconStart={<FiLogIn />}
            style={{width: '100%', marginTop: '0.5rem'}} // Make button full width and add some top margin
        >
          {loadingAuth ? 'Logging In...' : 'Log In'}
        </Button>
      </LoginForm>
    </LoginPageContainer>
  );
};

export default AdminLoginPage;