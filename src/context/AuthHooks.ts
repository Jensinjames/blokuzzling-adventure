
import { createContext, useContext } from 'react';
import { AuthContextType } from './AuthTypes';

// Create context with undefined default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
