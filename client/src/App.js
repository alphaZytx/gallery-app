import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import PublicGalleryPage from './pages/PublicGalleryPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components'; // Renamed to avoid clash
import { useTheme } from './hooks/useTheme';


// AppContainer now uses the theme from styled-components ThemeProvider
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 1.5rem;
  padding-top: calc(60px + 1.5rem); /* Navbar height (approx 60px) + padding */
  max-width: 1600px;
  margin: 0 auto; /* Center content */
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1rem;
    padding-top: calc(55px + 1rem); /* Adjusted mobile navbar height */
  }
`;

function App() {
  const { theme } = useTheme(); // Get theme from our ThemeContext

  return (
    // Provide theme to styled-components
    <StyledThemeProvider theme={theme}>
      <AppContainer>
        <Navbar />
        <MainContent>
          <Routes>
            <Route path="/" element={<PublicGalleryPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Optional: A dedicated upload page for admin if not a modal */}
            {/* <Route
              path="/admin/upload"
              element={
                <ProtectedRoute>
                  <UploadPage /> {}
                </ProtectedRoute>
              }
            /> */}
            <Route path="/not-found" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </StyledThemeProvider>
  );
}

export default App;