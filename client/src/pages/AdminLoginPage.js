import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner'; // Import Spinner
import { FiLogIn } from 'react-icons/fi';

const LoginPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px); /* Adjust based on navbar height */
  padding: 2rem;
`;

const LoginForm = styled.form`
  background-color: ${({ theme }) => theme.cardBg};
  padding: 2.5rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.cardShadow};
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 2rem 1.5rem;
  }
`;

const FormTitle = styled.h1`
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    font-size: 0.9rem;
  }

  input {
    padding: 0.8rem 1rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.inputBorder};
    background-color: ${({ theme }) => theme.inputBg};
    color: ${({ theme }) => theme.text};
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}33; /* Subtle focus ring */
    }
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.danger || '#dc3545'};
  font-size: 0.9rem;
  text-align: center;
  margin-top: -0.5rem; /* Pull closer to the fields */
  margin-bottom: 0.5rem;
`;

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, loadingAuth, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin/dashboard";

  useEffect(() => {
    // If already authenticated, redirect from login page
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    // Clear previous auth errors when component mounts or user starts typing
    return () => {
      if (authError) setAuthError(null);
    };
  }, [isAuthenticated, navigate, from, authError, setAuthError]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }
    await login(email, password);
    // Navigation is handled within the login function on success
  };

  return (
    <LoginPageContainer>
      <LoginForm onSubmit={handleSubmit}>
        <FormTitle>Admin Login</FormTitle>
        {authError && <ErrorMessage>{authError}</ErrorMessage>}
        <InputGroup>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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