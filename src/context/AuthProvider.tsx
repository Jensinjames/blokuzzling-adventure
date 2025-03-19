
import React from 'react';
import { AuthProviderContent } from './auth/AuthProviderContent';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderContent>{children}</AuthProviderContent>;
};

// Re-export useAuth
export { useAuth } from './AuthHooks';
export default AuthProvider;
