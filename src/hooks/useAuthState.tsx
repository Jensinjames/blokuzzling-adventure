
import { useState, useEffect, useCallback } from 'react';
import { Session, User, supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useSubscriptionData } from './useSubscriptionData';

/**
 * Hook to manage authentication state, session handling and subscriptions
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { subscription, fetchSubscription, resetSubscription } = useSubscriptionData();
  const { refreshUserSession } = useAuthOperations();

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      console.log('[Auth Debug] Attempting to refresh session');
      const { data, error } = await refreshUserSession();
      
      if (error) {
        console.error('[Auth Debug] Session refresh error:', error);
        // If token refresh fails, redirect to login
        if (error.message?.includes('token') || error.message?.includes('session')) {
          console.log('[Auth Debug] Session expired or invalid, redirecting to auth page');
          toast.error('Your session has expired. Please sign in again.');
          await supabase.auth.signOut();
          navigate('/auth');
        }
      } else if (data) {
        console.log('[Auth Debug] Session refresh successful:', data.session ? 'Session found' : 'No session');
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          fetchSubscription(data.session.user.id);
        }
      }
    } catch (error) {
      console.error('[Auth Debug] Unexpected error refreshing session:', error);
      toast.error('An error occurred with your session. Please sign in again.');
      navigate('/auth');
    }
  }, [navigate, fetchSubscription, refreshUserSession]);

  // Handle auth state changes
  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    let refreshInterval: number | null = null;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log('[Auth Debug] Getting initial session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth Debug] Error getting initial session:', error);
          toast.error('Failed to retrieve your session');
        } else {
          console.log('[Auth Debug] Initial session retrieved:', data.session ? 'Session found' : 'No session');
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);

        // Fetch subscription if user is logged in
        if (data.session?.user) {
          await fetchSubscription(data.session.user.id);
        }

        // If no session, and we're not on the auth page or root, redirect to auth
        const currentPath = window.location.pathname;
        if (!data.session && currentPath !== '/auth' && currentPath !== '/') {
          console.log('[Auth Debug] No session detected, current path:', currentPath);
          navigate('/auth');
        }
      } catch (error) {
        console.error('[Auth Debug] Unexpected error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth changes
    const setupAuthListener = () => {
      console.log('[Auth Debug] Setting up auth state change listener');
      const { data } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log(`[Auth Debug] Auth state changed: ${event}`);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Fetch subscription on auth state change if user is logged in
          if (newSession?.user) {
            await fetchSubscription(newSession.user.id);
          } else {
            // Reset subscription to default if user is logged out
            resetSubscription();
          }
          
          setLoading(false);

          if (event === 'SIGNED_IN') {
            console.log('[Auth Debug] User signed in:', newSession?.user?.email);
            toast.success('Signed in successfully');
            
            // Properly redirect to home after sign in
            if (window.location.pathname === '/auth' || window.location.pathname === '/') {
              navigate('/home');
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[Auth Debug] User signed out');
            toast.info('Signed out');
            navigate('/');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('[Auth Debug] Token refreshed successfully');
          } else if (event === 'USER_UPDATED') {
            console.log('[Auth Debug] User updated');
          } else if (event === 'PASSWORD_RECOVERY') {
            console.log('[Auth Debug] Password recovery initiated');
            // If user is not on the password reset page, redirect
            if (!window.location.pathname.includes('/auth')) {
              navigate('/auth');
            }
          }
        }
      );
      
      return data;
    };

    // Initialize auth
    const initializeAuth = async () => {
      // First set up listener
      authListener = setupAuthListener();
      
      // Then get initial session
      await getInitialSession();
      
      // Set up session refresh interval if session exists
      if (session) {
        console.log('[Auth Debug] Setting up session refresh interval');
        refreshInterval = window.setInterval(() => {
          console.log('[Auth Debug] Auto-refreshing session...');
          refreshSession();
        }, 10 * 60 * 1000); // Refresh every 10 minutes
      }
    };
    
    initializeAuth();

    // Cleanup subscription and interval
    return () => {
      console.log('[Auth Debug] Cleaning up auth listeners and refresh interval');
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, refreshSession, fetchSubscription, resetSubscription]);

  return {
    user,
    session,
    loading,
    refreshSession,
    subscription
  };
};

export default useAuthState;
