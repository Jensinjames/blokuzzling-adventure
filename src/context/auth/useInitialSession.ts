
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Session } from '@/integrations/supabase/client';

interface UseInitialSessionOptions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Hook to fetch and set the initial session
 */
export const useInitialSession = ({ 
  setUser, 
  setSession, 
  setLoading 
}: UseInitialSessionOptions) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSessionChecked = useRef(false);

  useEffect(() => {
    // Only run once
    if (initialSessionChecked.current) {
      return;
    }
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        initialSessionChecked.current = true;
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
        // But don't redirect multiple times
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
  }, [setUser, setSession, setLoading, navigate, location.pathname]);
};
