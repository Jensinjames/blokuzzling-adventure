
import { useState, useEffect, useCallback } from 'react';
import { Session, User, supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { refreshUserSession } from '@/context/AuthOperations';
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

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await refreshUserSession();
      
      if (error) {
        // If token refresh fails, redirect to login
        if (error.message.includes('token') || error.message.includes('session')) {
          console.log('Session expired or invalid, redirecting to auth page');
          toast.error('Your session has expired. Please sign in again.');
          await supabase.auth.signOut();
          navigate('/auth');
        }
      } else if (data) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          fetchSubscription(data.session.user.id);
        }
      }
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
      toast.error('An error occurred with your session. Please sign in again.');
      navigate('/auth');
    }
  }, [navigate, fetchSubscription]);

  // Handle auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log('Getting initial session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          toast.error('Failed to retrieve your session');
        } else {
          console.log('Initial session retrieved:', data.session ? 'Session found' : 'No session');
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);

        // Fetch subscription if user is logged in
        if (data.session?.user) {
          await fetchSubscription(data.session.user.id);
        }

        // If no session, and we're not on the auth page or root, redirect to auth
        if (!data.session && window.location.pathname !== '/auth' && window.location.pathname !== '/') {
          console.log('No session detected, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up interval to refresh session
    const refreshInterval = setInterval(() => {
      if (session) {
        console.log('Auto-refreshing session...');
        refreshSession();
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Auth state changed: ${event}`);
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
          console.log('User signed in:', newSession?.user?.email);
          toast.success('Signed in successfully');
          
          // Properly redirect to home after sign in
          if (window.location.pathname === '/auth' || window.location.pathname === '/') {
            navigate('/home');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          toast.info('Signed out');
          navigate('/');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery initiated');
          // If user is on the password reset page, don't redirect
          if (!window.location.pathname.includes('/auth')) {
            navigate('/auth');
          }
        }
      }
    );

    // Cleanup subscription and interval
    return () => {
      console.log('Cleaning up auth listeners and refresh interval');
      clearInterval(refreshInterval);
      authListener?.subscription.unsubscribe();
    };
  }, [navigate, refreshSession, fetchSubscription, resetSubscription, session]);

  return {
    user,
    session,
    loading,
    refreshSession,
    subscription
  };
};

export default useAuthState;
