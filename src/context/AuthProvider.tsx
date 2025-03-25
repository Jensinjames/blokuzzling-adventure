
import React, { ReactNode, useEffect, useRef } from 'react';
import { AuthContext } from './AuthHooks';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { toast } from 'sonner';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const mountedRef = useRef(false);
  const { user, session, loading, refreshSession, subscription } = useAuthState();
  const { signInUser, signUpUser, signOutUser, resetPassword } = useAuthOperations();

  // Prevent multiple initializations
  useEffect(() => {
    console.log('[Auth Provider] Initialized');
    
    if (mountedRef.current) {
      console.log('[Auth Provider] Already mounted, preventing duplicate initialization');
      return;
    }
    
    mountedRef.current = true;
    
    return () => {
      console.log('[Auth Provider] Unmounted');
      mountedRef.current = false;
    };
  }, []);

  // Wrapper functions for auth operations
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInUser(email, password);
      console.log('[Auth Provider] Sign in result:', result);
      return result;
    } catch (error) {
      console.error('[Auth Provider] Error in signIn wrapper:', error);
      return { error, data: null };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await signUpUser(email, password);
      console.log('[Auth Provider] Sign up result:', result);
      return result;
    } catch (error) {
      console.error('[Auth Provider] Error in signUp wrapper:', error);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth Provider] Attempting to sign out user');
      const { error } = await signOutUser();
      
      if (error) {
        console.error('[Auth Provider] Error during sign out:', error);
        toast.error(`Sign out failed: ${error.message}`);
        return { error };
      }
      
      console.log('[Auth Provider] Sign out successful, redirecting to home');
      navigate('/');
      return { error: null };
    } catch (error) {
      console.error('[Auth Provider] Unexpected error during sign out:', error);
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
