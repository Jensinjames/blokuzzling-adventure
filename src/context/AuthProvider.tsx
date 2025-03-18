
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
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        // If token refresh fails, redirect to login
        if (error.message.includes('token') || error.message.includes('session')) {
          console.log('Session expired or invalid, redirecting to auth page');
          navigate('/auth');
        }
      } else if (data) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
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
        console.log('Refreshing session...');
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
          console.log('User signed in');
          if (window.location.pathname === '/auth' || window.location.pathname === '/') {
            navigate('/home');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          navigate('/');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
        }
      }
    );

    // Cleanup subscription and interval
    return () => {
      clearInterval(refreshInterval);
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error, data: null };
      }

      toast.success('Signed in successfully');
      return { data, error: null };
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in');
      return { error, data: null };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error, data: null };
      }

      toast.success('Signed up successfully! Check your email for confirmation.');
      return { data, error: null };
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
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
