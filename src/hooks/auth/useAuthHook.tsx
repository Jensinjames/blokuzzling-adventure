
import { useAuth as useAuthContext } from '@/context/AuthProvider';
import { useSubscription } from './useSubscription';
import { useAccessControl } from './useAccessControl';
import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Enhanced hook to access authentication context
 * Provides user, session, loading state, and authentication methods with subscription validation
 */
export const useAuthHook = () => {
  const authContext = useAuthContext();
  const mountedRef = useRef(true);
  
  // Use subscription hook with memoization
  const { 
    hasSubscription, 
    checkingSubscription, 
    subscriptionState 
  } = useSubscription(authContext.user);
  
  // Set up access control
  const { requireSubscription } = useAccessControl(
    authContext.user, 
    subscriptionState, 
    checkingSubscription
  );

  // Track component mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Enhanced user object with subscription data - memoized to prevent rerenders
  const enhancedUser = useMemo(() => {
    if (!authContext.user) return null;
    
    return {
      ...authContext.user,
      subscription: subscriptionState
    };
  }, [authContext.user, subscriptionState]);

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
  }, [authContext.refreshSession]);

  // Memoize the entire return value to prevent unnecessary re-renders
  return useMemo(() => ({
    ...authContext,
    user: enhancedUser,
    hasSubscription,
    checkingSubscription,
    requireSubscription,
    subscription: subscriptionState,
    refreshSession
  }), [
    authContext,
    enhancedUser,
    hasSubscription,
    checkingSubscription,
    requireSubscription,
    subscriptionState,
    refreshSession
  ]);
};
