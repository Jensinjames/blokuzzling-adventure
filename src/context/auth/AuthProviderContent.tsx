
import React, { useState, useCallback, useRef } from 'react';
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
  // Use refs to track initialization and prevent excessive state updates
  const isInitialized = useRef(false);
  const isLoading = useRef(true);
  const isMountedRef = useRef(false);
  
  // Combine state initializations to reduce render cycles
  const [authState, setAuthState] = useState({
    user: null as User | null,
    session: null as Session | null,
    loading: true,
    checkingSubscription: false,
    hasSubscription: false,
    subscription: {
      tier: null,
      status: null,
      isActive: false,
      isPremium: false,
      isBasicOrHigher: false,
      expiry: null
    } as SubscriptionDetails
  });
  
  // Use callback for batch-updating auth state to prevent multiple renders
  const updateAuthState = useCallback((updates: Partial<typeof authState>) => {
    if (!isMountedRef.current) return;
    
    setAuthState(prevState => {
      // Only update if there are actual changes to prevent unnecessary renders
      const hasChanges = Object.entries(updates).some(
        ([key, value]) => prevState[key as keyof typeof prevState] !== value
      );
      
      return hasChanges ? { ...prevState, ...updates } : prevState;
    });
  }, []);
  
  // Set loading state with debounce to prevent rapid toggle
  const setLoading = useCallback((loading: boolean) => {
    if (isLoading.current === loading) return;
    isLoading.current = loading;
    updateAuthState({ loading });
  }, [updateAuthState]);
  
  // User and session setters that prevent unnecessary updates
  const setUser = useCallback((user: User | null) => {
    updateAuthState({ user });
  }, [updateAuthState]);
  
  const setSession = useCallback((session: Session | null) => {
    updateAuthState({ session });
  }, [updateAuthState]);
  
  const setSubscription = useCallback((subscription: SubscriptionDetails) => {
    updateAuthState({ 
      subscription,
      hasSubscription: subscription.isActive
    });
  }, [updateAuthState]);
  
  // Get initial session - this only runs once
  useInitialSession({ 
    setUser, 
    setSession, 
    setLoading,
    isInitialized
  });

  // Set up session refresh
  const { refreshSession } = useSessionRefresh({ 
    session: authState.session, 
    setSession, 
    setUser 
  });

  // Set up auth listener
  useAuthListener({
    setUser,
    setSession,
    setLoading,
    setSubscription,
    isMountedRef
  });
  
  // Mark component as mounted after first render
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auth operation wrappers with proper memoization
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      return await signInUser(email, password);
    } catch (error: any) {
      console.error('Error during sign in:', error);
      return { error, data: null };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      return await signUpUser(email, password);
    } catch (error: any) {
      console.error('Error during sign up:', error);
      return { error, data: null };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('Signing out user from AuthProvider');
    try {
      const { error } = await signOutUser();
      if (error) {
        console.error('Error during sign out:', error);
        toast.error('Error signing out: ' + error.message);
        return { error };
      }
      
      // No need to reset state here as the auth listener will handle this
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during sign out:', error);
      toast.error('Error signing out: ' + (error.message || 'Unknown error'));
      return { error };
    }
  }, []);

  // Add resetPassword function
  const resetPassword = useCallback(async (email: string) => {
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
  }, []);

  // Provide context value
  const value = {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    resetPassword,
    subscription: authState.subscription,
    checkingSubscription: authState.checkingSubscription,
    hasSubscription: authState.hasSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
