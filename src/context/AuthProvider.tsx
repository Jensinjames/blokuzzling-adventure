
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Session, User } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      console.log('Manually refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        
        // If token refresh fails, redirect to login
        if (error.message.includes('token') || error.message.includes('session')) {
          console.log('Session expired or invalid, redirecting to auth page');
          toast.error('Your session has expired. Please sign in again.');
          await supabase.auth.signOut();
          navigate('/auth');
        }
      } else if (data) {
        console.log('Session refreshed successfully');
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
        setLoading(false);

        if (event === 'SIGNED_IN') {
          console.log('User signed in:', newSession?.user?.email);
          toast.success('Signed in successfully');
          
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
        }
      }
    );

    // Cleanup subscription and interval
    return () => {
      console.log('Cleaning up auth listeners and refresh interval');
      clearInterval(refreshInterval);
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return { error, data: null };
      }

      console.log('Sign in successful');
      toast.success('Signed in successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      toast.error(error.message || 'An error occurred during sign in');
      return { error, data: null };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message);
        return { error, data: null };
      }

      console.log('Sign up successful, email confirmation may be required');
      toast.success('Signed up successfully! Check your email for confirmation.');
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      toast.error(error.message || 'An error occurred during sign up');
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'An error occurred during sign out');
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
