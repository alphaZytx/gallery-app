import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    font-size: 16px; /* Base font size */
  }

  body {
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: ${({ theme }) => theme.fontFamily};
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: ${({ theme }) => theme.link};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitionSpeed} ease;

    &:hover {
      color: ${({ theme }) => theme.linkHover};
      text-decoration: underline;
    }
  }

  ul, ol {
    list-style: none;
  }

  img, video {
    max-width: 100%;
    height: auto;
    display: block;
  }

  button {
    font-family: ${({ theme }) => theme.fontFamily};
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, textarea, select {
    font-family: ${({ theme }) => theme.fontFamily};
  }

  /* For modal open state */
  body.modal-open {
    overflow: hidden;
  }

  /* Custom scrollbar (optional but nice for dark themes) */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.body};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.secondary};
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primary};
  }

  /* Utility classes (optional) */
  .text-center {
    text-align: center;
  }
  .sr-only { /* For screen readers only */
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;