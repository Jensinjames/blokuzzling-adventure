
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

type AuthCheckOptions = {
  /**
   * Route to redirect to if user is not authenticated
   * @default '/auth'
   */
  redirectTo?: string;
  
  /**
   * Query parameter to specify where to return after authentication
   * @default false
   */
  includeReturnTo?: boolean;
  
  /**
   * Custom message to display when redirecting
   * @default 'You must be logged in to access this page'
   */
  message?: string;
  
  /**
   * Skip the authentication check
   * @default false
   */
  skip?: boolean;
  
  /**
   * Check if subscription is required
   * @default false
   */
  requireSubscription?: boolean;
  
  /**
   * Minimum subscription tier required
   * @default 'basic'
   */
  subscriptionTier?: 'free' | 'basic' | 'premium';
};

/**
 * Hook for consistent authentication checks across pages
 * Automatically redirects unauthenticated users
 */
export const useAuthCheck = (options: AuthCheckOptions = {}) => {
  const { 
    redirectTo = '/auth', 
    includeReturnTo = false,
    message = 'You must be logged in to access this page',
    skip = false,
    requireSubscription = false,
    subscriptionTier = 'basic'
  } = options;
  
  const { 
    user, 
    session, 
    loading: authLoading, 
    refreshSession,
    subscription,
    checkingSubscription,
    hasSubscription
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);
  
  // Memoize the check function to prevent recreating it on each render
  const performCheck = useCallback(async () => {
    // Don't perform check if we should skip, are still loading, or have already checked
    if (skip || authLoading || hasChecked) return;
    
    // Mark as checked first to prevent multiple checks
    setHasChecked(true);
    
    if (!user || !session) {
      console.log('No authenticated user, redirecting to:', redirectTo);
      toast.error(message);
      
      // Add returnTo if needed
      if (includeReturnTo) {
        const currentPath = location.pathname;
        navigate(`${redirectTo}?returnTo=${encodeURIComponent(currentPath)}`);
      } else {
        navigate(redirectTo);
      }
      return;
    }
    
    // Check subscription if required
    if (requireSubscription && !checkingSubscription) {
      const hasSufficientTier = 
        subscriptionTier === 'free' || 
        (subscription.tier === 'premium') || 
        (subscriptionTier === 'basic' && ['basic', 'premium'].includes(subscription.tier || ''));
      
      if (!subscription.isActive || !hasSufficientTier) {
        toast.error(`You need an active ${subscriptionTier} subscription to access this feature`);
        navigate('/settings');
        return;
      }
    }
  }, [
    skip, 
    authLoading, 
    hasChecked, 
    user, 
    session, 
    requireSubscription, 
    checkingSubscription, 
    subscription, 
    subscriptionTier,
    message,
    redirectTo,
    includeReturnTo,
    location.pathname,
    navigate
  ]);
  
  // Perform auth check and redirect if needed, but only once
  useEffect(() => {
    if (!authLoading) {
      performCheck();
    }
    
    // Cleanup function to handle component unmounting
    return () => {};
  }, [authLoading, performCheck]);
  
  // Refresh session if it's expiring soon - only check once when component mounts
  useEffect(() => {
    // Only check if we have a session
    if (session && session.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      
      if (expiryTime < fiveMinutesFromNow) {
        console.log('Session expiring soon, refreshing...');
        refreshSession();
      }
    }
  }, [session, refreshSession]);
  
  return {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading: authLoading,
    hasSubscription: !!hasSubscription,
    subscriptionTier: subscription?.tier || 'free'
  };
};

export default useAuthCheck;
