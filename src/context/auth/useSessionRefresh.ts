
import { useRef, useEffect } from 'react';
import { Session } from '@/integrations/supabase/client';
import { refreshUserSession } from '../AuthOperations';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseSessionRefreshOptions {
  session: Session | null;
  setSession: (session: Session | null) => void;
  setUser: (user: any) => void;
}

/**
 * Hook to handle session refresh logic
 */
export const useSessionRefresh = ({ 
  session, 
  setSession, 
  setUser 
}: UseSessionRefreshOptions) => {
  const navigate = useNavigate();
  const refreshIntervalRef = useRef<number | undefined>();
  
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
  
  // Set up interval to refresh session
  useEffect(() => {
    if (refreshIntervalRef.current) {
      window.clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = window.setInterval(() => {
      if (session) {
        console.log('Auto-refreshing session...');
        refreshSession();
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes
    
    return () => {
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = undefined;
      }
    };
  }, [session]);
  
  return { refreshSession };
};
