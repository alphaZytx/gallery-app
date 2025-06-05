// Common properties for both themes
const commonTheme = {
  fontFamily: "'Poppins', sans-serif",
  primaryFont: "'Poppins', sans-serif",
  secondaryFont: "'Roboto Mono', monospace",
  borderRadius: '8px',
  cardShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  transitionSpeed: '0.3s',

  // Breakpoints for responsive design (example)
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
  },
};

export const lightTheme = {
  ...commonTheme,
  body: '#F0F2F5', // Light grey background
  text: '#212529', // Dark grey text
  primary: '#007BFF', // Vibrant Blue
  primaryHover: '#0056b3',
  secondary: '#6c757d', // Muted Grey
  accent: '#28a745', // Green for success/accent
  cardBg: '#FFFFFF', // White card background
  borderColor: '#DEE2E6', // Light border color
  inputBg: '#FFFFFF',
  inputBorder: '#CED4DA',
  buttonText: '#FFFFFF',
  navbarBg: 'rgba(255, 255, 255, 0.9)',
  modalBg: 'rgba(250, 250, 250, 0.98)',
  modalOverlay: 'rgba(0, 0, 0, 0.6)',
  link: '#007BFF',
  linkHover: '#0056b3',
  codeBlockBg: '#f8f9fa',
  codeBlockText: '#e83e8c',
};

export const darkTheme = {
  ...commonTheme,
  body: '#1A1D24', // Very dark (almost black) blue/grey
  text: '#EAECEF', // Light grey/off-white text
  primary: '#00A6ED', // Bright Cyan/Blue
  primaryHover: '#007FAD',
  secondary: '#ADB5BD', // Lighter Grey
  accent: '#32CD32', // Lime Green for accent
  cardBg: '#2C303A', // Darker card background
  borderColor: '#495057', // Darker border color
  inputBg: '#252830',
  inputBorder: '#495057',
  buttonText: '#EAECEF',
  navbarBg: 'rgba(33, 37, 41, 0.9)', // Dark navbar
  modalBg: 'rgba(44, 48, 58, 0.98)',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  link: '#00A6ED',
  linkHover: '#36C2FF',
  codeBlockBg: '#212529',
  codeBlockText: '#20c997',
};