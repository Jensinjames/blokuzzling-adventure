
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for authentication operations
 * Provides methods for sign in, sign up, sign out, and session refresh
 */
export const useAuthOperations = () => {
  // User sign in operation
  const signInUser = async (email: string, password: string) => {
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

  // User sign up operation
  const signUpUser = async (email: string, password: string) => {
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

  // User sign out operation
  const signOutUser = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'An error occurred during sign out');
      return { error };
    }
  };

  // Refresh user session operation
  const refreshUserSession = async () => {
    try {
      console.log('Manually refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return { error, data: null };
      } else if (data) {
        console.log('Session refreshed successfully');
        return { data, error: null };
      }
      return { data: null, error: null };
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
      return { error, data: null };
    }
  };

  // Request password reset operation
  const resetPassword = async (email: string) => {
    try {
      console.log('[Auth Debug] Requesting password reset for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
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

  return {
    signInUser,
    signUpUser,
    signOutUser,
    refreshUserSession,
    resetPassword
  };
};

export default useAuthOperations;
