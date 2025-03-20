
import React, { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@/integrations/supabase/client';
import { AuthContext } from '../AuthHooks';
import { signInUser, signUpUser, signOutUser } from '../AuthOperations';
import { useAuthListener } from './useAuthListener';
import { useSessionRefresh } from './useSessionRefresh';
import { useInitialSession } from './useInitialSession';
import { SubscriptionDetails } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Main implementation of AuthProvider separate from the context provider wrapper
 */
export const AuthProviderContent: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionDetails>({
    tier: null,
    status: null,
    isActive: false,
    isPremium: false,
    isBasicOrHigher: false,
    expiry: null
  });

  // Set up session refresh
  const { refreshSession } = useSessionRefresh({ 
    session, 
    setSession, 
    setUser 
  });

  // Get initial session
  useInitialSession({ 
    setUser, 
    setSession, 
    setLoading 
  });

  // Update hasSubscription whenever subscription changes
  useEffect(() => {
    setHasSubscription(subscription?.isActive || false);
  }, [subscription.isActive]);

  // Set up auth listener with memoized setSubscription callback
  const memoizedSetSubscription = useCallback((newSubscription: SubscriptionDetails) => {
    setSubscription(newSubscription);
  }, []);

  // Set up auth listener
  useAuthListener({
    setUser,
    setSession,
    setLoading,
    setSubscription: memoizedSetSubscription
  });

  // Auth operation wrappers
  const signIn = async (email: string, password: string) => {
    return await signInUser(email, password);
  };

  const signUp = async (email: string, password: string) => {
    return await signUpUser(email, password);
  };

  const signOut = useCallback(async () => {
    console.log('Signing out user from AuthProvider');
    try {
      const { error } = await signOutUser();
      if (error) {
        console.error('Error during sign out:', error);
        toast.error('Error signing out: ' + error.message);
      }
      // Reset local state
      setUser(null);
      setSession(null);
      setSubscription({
        tier: null,
        status: null,
        isActive: false,
        isPremium: false,
        isBasicOrHigher: false,
        expiry: null
      });
      setHasSubscription(false);
      
      // Force a full page reload to ensure clean state
      window.location.href = '/#/';
      return { error };
    } catch (error: any) {
      console.error('Unexpected error during sign out:', error);
      toast.error('Error signing out: ' + (error.message || 'Unknown error'));
      return { error };
    }
  }, []);

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
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    resetPassword,
    subscription,
    checkingSubscription,
    hasSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
