
import React, { ReactNode } from 'react';
import { AuthContext } from './AuthHooks';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { toast } from 'sonner';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, session, loading, refreshSession, subscription } = useAuthState();
  const { signInUser, signUpUser, signOutUser, resetPassword } = useAuthOperations();

  // Wrapper functions for auth operations
  const signIn = async (email: string, password: string) => {
    const result = await signInUser(email, password);
    return result;
  };

  const signUp = async (email: string, password: string) => {
    return await signUpUser(email, password);
  };

  const signOut = async () => {
    const { error } = await signOutUser();
    if (!error) {
      navigate('/');
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    resetPassword,
    subscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export useAuth
export { useAuth } from './AuthHooks';
export default AuthProvider;
