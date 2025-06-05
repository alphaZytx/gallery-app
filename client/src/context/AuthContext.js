import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api'; // API client setup

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let token = null;
    let storedUser = null;
    try {
      token = localStorage.getItem('adminToken');
      storedUser = localStorage.getItem('adminUser');
    } catch (error) {
      console.warn("Could not access localStorage for auth.", error);
    }

    if (token && storedUser) {
      // Ideally, verify token with a backend endpoint here.
      // For this example, we'll trust the presence of the token.
      // You could decode the token to check expiry if not calling backend.
      setIsAuthenticated(true);
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored admin user:", e);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
      }
    }
    setLoadingAuth(false);
  }, []);

  const login = async (email, password) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password }); // Backend route is /api/auth/login
      const { token, admin } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Update apiClient header
      
      setIsAuthenticated(true);
      setAdminUser(admin);
      setLoadingAuth(false);
      navigate('/admin/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check credentials.';
      console.error('Login failed:', errorMessage, error);
      setAuthError(errorMessage);
      setIsAuthenticated(false);
      setAdminUser(null);
      setLoadingAuth(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    } catch (error) {
      console.warn("Could not clear auth from localStorage.", error);
    }
    delete apiClient.defaults.headers.common['Authorization']; // Remove token from apiClient
    setIsAuthenticated(false);
    setAdminUser(null);
    navigate('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminUser, loadingAuth, authError, login, logout, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};