import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Check for undefined specifically
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};