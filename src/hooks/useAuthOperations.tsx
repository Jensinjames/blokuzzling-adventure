
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
      console.log('[Auth Debug] Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth Debug] Sign in error:', error);
        toast.error(error.message);
        return { error, data: null };
      }

      console.log('[Auth Debug] Sign in successful, session:', data.session ? 'exists' : 'null');
      toast.success('Signed in successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('[Auth Debug] Unexpected sign in error:', error);
      toast.error(error.message || 'An error occurred during sign in');
      return { error, data: null };
    }
  };

  // User sign up operation
  const signUpUser = async (email: string, password: string) => {
    try {
      console.log('[Auth Debug] Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      if (error) {
        console.error('[Auth Debug] Sign up error:', error);
        toast.error(error.message);
        return { error, data: null };
      }

      console.log('[Auth Debug] Sign up successful, email confirmation required:', data.session ? 'No' : 'Yes');
      toast.success('Signed up successfully! Check your email for confirmation.');
      return { data, error: null };
    } catch (error: any) {
      console.error('[Auth Debug] Unexpected sign up error:', error);
      toast.error(error.message || 'An error occurred during sign up');
      return { error, data: null };
    }
  };

  // User sign out operation
  const signOutUser = async () => {
    try {
      console.log('[Auth Debug] Signing out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[Auth Debug] Sign out error:', error);
        toast.error(error.message || 'An error occurred during sign out');
        return { error };
      }
      
      console.log('[Auth Debug] Sign out successful');
      return { error: null };
    } catch (error: any) {
      console.error('[Auth Debug] Unexpected sign out error:', error);
      toast.error(error.message || 'An error occurred during sign out');
      return { error };
    }
  };

  // Refresh user session operation
  const refreshUserSession = async () => {
    try {
      console.log('[Auth Debug] Manually refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[Auth Debug] Error refreshing session:', error);
        return { error, data: null };
      } else if (data) {
        console.log('[Auth Debug] Session refreshed successfully');
        return { data, error: null };
      }
      return { data: null, error: null };
    } catch (error) {
      console.error('[Auth Debug] Unexpected error refreshing session:', error);
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
