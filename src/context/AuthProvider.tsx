
import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { Session, User, supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthHooks';
import { signInUser, signUpUser, signOutUser, refreshUserSession } from './AuthOperations';
import { SubscriptionDetails } from '@/types/subscription';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionDetails>({
    tier: null,
    status: null,
    isActive: false,
    isPremium: false,
    isBasicOrHigher: false,
    expiry: null
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const refreshIntervalRef = useRef<number | undefined>();
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);

  // Function to refresh the session
  const refreshSession = async () => {
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
      }
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
      toast.error('An error occurred with your session. Please sign in again.');
      navigate('/auth');
    }
  };

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

        // If no session, and we're not on the auth page or root, redirect to auth
        if (!data.session && !location.pathname.match(/^\/(auth|)$/)) {
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
    if (refreshIntervalRef.current) {
      window.clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = window.setInterval(() => {
      if (session) {
        console.log('Auto-refreshing session...');
        refreshSession();
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    // Listen for auth changes
    const setupAuthListener = async () => {
      if (authListenerRef.current) {
        // Fix: Correctly access the unsubscribe method
        authListenerRef.current.data.subscription.unsubscribe();
      }
      
      authListenerRef.current = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log(`Auth state changed: ${event}`, newSession?.user?.id || 'no user');
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);

          if (event === 'SIGNED_IN') {
            console.log('User signed in:', newSession?.user?.email);
            toast.success('Signed in successfully');
            
            // Properly redirect to home after sign in
            if (location.pathname === '/auth' || location.pathname === '/') {
              navigate('/home');
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            toast.info('Signed out');
            setSubscription({
              tier: null,
              status: null,
              isActive: false,
              isPremium: false,
              isBasicOrHigher: false,
              expiry: null
            });
            // Force full page reload to clear any cached state
            window.location.href = '/#/';
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          } else if (event === 'USER_UPDATED') {
            console.log('User updated');
          } else if (event === 'PASSWORD_RECOVERY') {
            console.log('Password recovery initiated');
            // If user is on the password reset page, don't redirect
            if (!location.pathname.includes('/auth')) {
              navigate('/auth');
            }
          }
        }
      );
    };
    
    setupAuthListener();

    // Cleanup subscription and interval
    return () => {
      console.log('Cleaning up auth listeners and refresh interval');
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = undefined;
      }
      if (authListenerRef.current) {
        // Fix: Correctly access the unsubscribe method
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [navigate, location.pathname]);

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
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    resetPassword,
    subscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export useAuth
export { useAuth } from './AuthHooks';
export default AuthProvider;
