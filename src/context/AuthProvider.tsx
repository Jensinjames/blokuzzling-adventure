
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
    try {
      const result = await signInUser(email, password);
      console.log('Sign in result:', result);
      return result;
    } catch (error) {
      console.error('Error in signIn wrapper:', error);
      return { error, data: null };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await signUpUser(email, password);
      console.log('Sign up result:', result);
      return result;
    } catch (error) {
      console.error('Error in signUp wrapper:', error);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out user');
      const { error } = await signOutUser();
      
      if (error) {
        console.error('Error during sign out:', error);
        toast.error(`Sign out failed: ${error.message}`);
        return { error };
      }
      
      console.log('Sign out successful, redirecting to home');
      navigate('/');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      return { error };
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
