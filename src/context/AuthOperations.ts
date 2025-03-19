
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Authentication operations
export const signInUser = async (email: string, password: string) => {
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

export const signUpUser = async (email: string, password: string) => {
  try {
    console.log('Signing up user:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/#/auth?confirmation=true`,
        data: {
          email_confirm_redirect_url: `${window.location.origin}/#/auth?confirmation=true`
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      toast.error(error.message);
      return { error, data: null };
    }

    console.log('Sign up successful, email confirmation may be required');
    
    // Check if email confirmation is needed
    if (data?.user?.identities?.length === 0 || data?.user?.email_confirmed_at === null) {
      toast.info('Please check your email to confirm your account before signing in.');
    } else {
      toast.success('Signed up successfully!');
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Unexpected sign up error:', error);
    toast.error(error.message || 'An error occurred during sign up');
    return { error, data: null };
  }
};

export const signOutUser = async () => {
  try {
    console.log('Signing out user');
    // Clear session but don't navigate (that's handled in AuthProvider)
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return { error };
    }
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const refreshUserSession = async () => {
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

// New function to delete a game session
export const deleteGameSession = async (gameId: string) => {
  try {
    console.log('Deleting game session:', gameId);
    
    // First, delete related game_players records
    const { error: playersError } = await supabase
      .from('game_players')
      .delete()
      .eq('game_id', gameId);
      
    if (playersError) {
      console.error('Error deleting game players:', playersError);
      toast.error('Failed to delete game players');
      return { error: playersError };
    }
    
    // Next, delete related game_invites records
    const { error: invitesError } = await supabase
      .from('game_invites')
      .delete()
      .eq('game_id', gameId);
      
    if (invitesError) {
      console.error('Error deleting game invites:', invitesError);
      toast.error('Failed to delete game invites');
      return { error: invitesError };
    }
    
    // Finally, delete the game session itself
    const { error: gameError } = await supabase
      .from('game_sessions')
      .delete()
      .eq('id', gameId);
      
    if (gameError) {
      console.error('Error deleting game session:', gameError);
      toast.error('Failed to delete game');
      return { error: gameError };
    }
    
    console.log('Game session deleted successfully');
    toast.success('Game deleted successfully');
    return { error: null };
  } catch (error: any) {
    console.error('Unexpected error deleting game session:', error);
    toast.error(error.message || 'An error occurred during game deletion');
    return { error };
  }
};
