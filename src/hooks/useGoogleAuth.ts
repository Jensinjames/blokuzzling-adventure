
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signInWithGoogle = async (redirectTo: string = '/home'): Promise<{ error: any | null }> => {
    try {
      setLoading(true);
      console.log('[Auth Debug] Attempting to sign in with Google');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#${redirectTo}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('[Auth Debug] Google sign in error:', error);
        toast.error(`Google sign in failed: ${error.message}`);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('[Auth Debug] Google sign in error:', error);
      toast.error(`Google sign in error: ${error.message || 'An unexpected error occurred'}`);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading
  };
}
