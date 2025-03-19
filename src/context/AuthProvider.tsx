
import React from 'react';
import { AuthProviderContent } from './auth/AuthProviderContent';

/**
 * Main AuthProvider component that wraps the application
 * Provides authentication context to all child components
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderContent>{children}</AuthProviderContent>;
};

// Re-export useAuth
export { useAuth } from './AuthHooks';
export default AuthProvider;
