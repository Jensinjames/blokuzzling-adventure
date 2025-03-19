
import { useAuth as useAuthContext } from '@/context/AuthProvider';
import { useSubscription } from './useSubscription';
import { useAccessControl } from './useAccessControl';
import { useCallback } from 'react';

/**
 * Enhanced hook to access authentication context
 * Provides user, session, loading state, and authentication methods with subscription validation
 */
export const useAuthHook = () => {
  const authContext = useAuthContext();
  const { 
    hasSubscription, 
    checkingSubscription, 
    subscriptionState 
  } = useSubscription(authContext.user);
  
  const { requireSubscription } = useAccessControl(
    authContext.user, 
    subscriptionState, 
    checkingSubscription
  );

  // Enhanced user object with subscription data
  const enhancedUser = authContext.user ? {
    ...authContext.user,
    subscription: subscriptionState
  } : null;

  // Memoize the refreshSession function
  const refreshSession = useCallback(async () => {
    console.log('[Auth] Refreshing session');
    try {
      await authContext.refreshSession();
      return { error: null };
    } catch (error: any) {
      console.error('[Auth] Error refreshing session:', error);
      return { error };
    }
  }, [authContext]);

  return {
    ...authContext,
    user: enhancedUser,
    hasSubscription,
    checkingSubscription,
    requireSubscription,
    subscription: subscriptionState,
    refreshSession
  };
};
