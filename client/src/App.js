// client/src/App.js
import React, { Suspense } from 'react'; // Import Suspense
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
// Removed direct imports of pages, will use React.lazy
// import PublicGalleryPage from './pages/PublicGalleryPage';
// import AdminLoginPage from './pages/AdminLoginPage';
// import AdminDashboardPage from './pages/AdminDashboardPage';
// import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useTheme } from './hooks/useTheme';
import Spinner from './components/common/Spinner'; // For Suspense fallback

// Code-split page components
const PublicGalleryPage = React.lazy(() => import('./pages/PublicGalleryPage'));
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

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
  padding-top: calc(60px + 1.5rem); /* Navbar height + padding */
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1rem;
    padding-top: calc(55px + 1rem);
  }
`;

// Fallback UI for React.Suspense
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)', width: '100%' }}>
    <Spinner size="50px" />
  </div>
);

function App() {
  const { theme } = useTheme();

  return (
    <StyledThemeProvider theme={theme}>
      <AppContainer>
        <Navbar />
        <MainContent>
          <Suspense fallback={<PageLoader />}> {/* Wrap Routes with Suspense */}
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
              <Route path="/not-found" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
          </Suspense>
        </MainContent>
      </AppContainer>
    </StyledThemeProvider>
  );
}

export default App;