// client/src/pages/AdminLoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { FiLogIn } from 'react-icons/fi';

// ... (LoginPageContainer, LoginForm, FormTitle, InputGroup styled components remain the same)
const LoginPageContainer = styled.div` /* ... */ `;
const LoginForm = styled.form` /* ... */ `;
const FormTitle = styled.h1` /* ... */ `;
const InputGroup = styled.div` /* ... */ `;

// Keep or update your ErrorMessage styled component
const MessageText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  margin-top: -0.5rem;
  margin-bottom: 1rem; /* More space for messages */
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const ErrorMessage = styled(MessageText)`
  color: ${({ theme }) => theme.danger || '#dc3545'};
  background-color: ${({ theme }) => (theme.danger || '#dc3545')}1A;
`;

const InfoMessage = styled(MessageText)` // For info like "session expired"
  color: ${({ theme }) => theme.primary}; // Or a neutral info color
  background-color: ${({ theme }) => theme.primary}1A;
`;


const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, loadingAuth, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // To read query parameters

  const [pageMessage, setPageMessage] = useState(''); // For messages like "session expired"

  const from = location.state?.from?.pathname || "/admin/dashboard";

  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      setPageMessage("Your session has expired. Please log in again.");
      // Optional: remove the query param from URL history after displaying message
      // navigate('/admin/login', { replace: true }); 
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    return () => {
      if (authError) setAuthError(null); // Clear auth-specific errors on unmount or re-focus
    };
  }, [isAuthenticated, navigate, from, authError, setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageMessage(''); // Clear page message on new login attempt
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
        {pageMessage && <InfoMessage>{pageMessage}</InfoMessage>} {/* Display page-level messages */}
        {authError && <ErrorMessage>{authError}</ErrorMessage>} {/* Display login attempt errors */}
        <InputGroup>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setAuthError(null); setPageMessage(''); }} // Clear errors on input
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
            onChange={(e) => { setPassword(e.target.value); setAuthError(null); setPageMessage(''); }} // Clear errors on input
            placeholder="••••••••"
            required
            disabled={loadingAuth}
          />
        </InputGroup>
        <Button type="submit" variant="primary" isLoading={loadingAuth} disabled={loadingAuth} iconStart={<FiLogIn />}>
          {loadingAuth ? 'Logging In...' : 'Log In'}
        </Button>
      </LoginForm>
    </LoginPageContainer>
  );
};

export default AdminLoginPage;