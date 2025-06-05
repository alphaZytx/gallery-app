import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { IoSunny, IoMoon } from 'react-icons/io5'; // Using react-icons

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 1.5rem; /* Adjust size as needed */
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease, transform 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: 2px;
  }

  svg {
    transition: transform 0.5s ease-out;
  }
`;

const ThemeToggle = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <ToggleButton onClick={toggleTheme} aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
      {themeMode === 'light' ? <IoMoon /> : <IoSunny />}
    </ToggleButton>
  );
};

export default ThemeToggle;