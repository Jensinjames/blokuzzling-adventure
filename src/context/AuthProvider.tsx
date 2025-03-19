
import React, { ReactNode } from 'react';
import { toast } from 'sonner';
import { AuthContext } from './AuthHooks';
import { signInUser, signUpUser, signOutUser } from './AuthOperations';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { supabase } from '@/integrations/supabase/client';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session, loading, refreshSession } = useSessionManager();
  const { subscription, loading: subscriptionLoading } = useSubscriptionCheck(user);

  // Wrapper functions for auth operations
  const signIn = async (email: string, password: string) => {
    return await signInUser(email, password);
  };

  const signUp = async (email: string, password: string) => {
    return await signUpUser(email, password);
  };

  const signOut = async () => {
    console.log('Signing out user from AuthProvider');
    try {
      const { error } = await signOutUser();
      if (error) {
        console.error('Error during sign out:', error);
        toast.error('Error signing out: ' + error.message);
      }
      
      // Force a full page reload to ensure clean state
      window.location.href = '/#/';
      return { error };
    } catch (error: any) {
      console.error('Unexpected error during sign out:', error);
      toast.error('Error signing out: ' + (error.message || 'Unknown error'));
      return { error };
    }
  };

  // Add resetPassword function
  const resetPassword = async (email: string) => {
    try {
      console.log('[Auth Debug] Requesting password reset for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/auth?reset=true`,
      });
      
      if (error) {
        console.error('[Auth Debug] Error requesting password reset:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('[Auth Debug] Unexpected error requesting password reset:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading: loading || subscriptionLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    resetPassword,
    subscription: {
      tier: subscription.tier,
      status: subscription.status,
      isActive: subscription.isActive,
      isPremium: subscription.isPremium
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export useAuth
export { useAuth } from './AuthHooks';
export default AuthProvider;
