import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GlobalStyles } from './styles/GlobalStyles';

// Import your custom ThemeProvider and the context itself if needed, or the hook
import { ThemeProvider as CustomThemeProvider, ThemeContext } from './context/ThemeContext';
// Import ThemeProvider from styled-components
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components';

// A helper component to bridge your custom theme context to styled-components' ThemeProvider
const AppWithThemeProviders = () => {
  // Consume the theme object from your custom ThemeContext
  const { theme } = React.useContext(ThemeContext); // Or use your useTheme() hook

  if (!theme) {
    // This can happen briefly if theme initialization is async or context not ready
    // Or if ThemeContext isn't providing 'theme' correctly
    console.error("Theme object is undefined in AppWithThemeProviders. Check ThemeContext.");
    // You might want to return a loading state or a default theme to prevent crashes
    // For now, if theme is truly undefined, styled-components will still fail.
    // This check is more for debugging. The context should always provide a theme.
    return <div>Loading theme...</div>; // Or null, or a fallback
  }

  return (
    <StyledComponentsThemeProvider theme={theme}>
      <GlobalStyles />
      <App />
    </StyledComponentsThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CustomThemeProvider> {/* Your custom provider that manages theme state */}
          <AppWithThemeProviders /> {/* This component now handles styled-components' ThemeProvider */}
        </CustomThemeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);