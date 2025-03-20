
import { useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Session } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubscriptionDetails } from '@/types/subscription';

// Define the auth listener reference type explicitly
type AuthSubscription = {
  data: {
    subscription: {
      unsubscribe: () => void;
    }
  }
};

interface UseAuthListenerOptions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setSubscription: (subscription: SubscriptionDetails) => void;
  isMountedRef: React.MutableRefObject<boolean>;
}

/**
 * Hook to handle Supabase auth state listener
 */
export const useAuthListener = ({
  setUser,
  setSession,
  setLoading,
  setSubscription,
  isMountedRef
}: UseAuthListenerOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authListenerRef = useRef<AuthSubscription | null>(null);
  const processingAuthChangeRef = useRef(false);
  const isRedirecting = useRef(false);
  
  // Memoize handler to prevent recreation on each render
  const handleAuthChange = useCallback(async (event: string, newSession: Session | null) => {
    // Don't process auth changes if component is unmounted
    if (!isMountedRef.current) return;
    
    // Prevent concurrent processing of auth changes
    if (processingAuthChangeRef.current) {
      console.log('Already processing an auth change, skipping...');
      return;
    }
    
    processingAuthChangeRef.current = true;
    console.log(`Auth state changed: ${event}`, newSession?.user?.id || 'no user');
    
    try {
      // Update session and user in a single pass to avoid multiple renders
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        
        // Batch state updates to prevent unnecessary re-renders
        setSession(null);
        setUser(null);
        setSubscription({
          tier: null,
          status: null,
          isActive: false,
          isPremium: false,
          isBasicOrHigher: false,
          expiry: null
        });
        
        // Navigate instead of full page reload to prevent potential loops
        if (!isRedirecting.current && location.pathname !== '/') {
          isRedirecting.current = true;
          toast.info('Signed out');
          navigate('/');
        }
      } else {
        // For other events, update session and user normally
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle other events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', newSession?.user?.email);
          
          // Properly redirect to home after sign in
          if (!isRedirecting.current && (location.pathname === '/auth' || location.pathname === '/')) {
            isRedirecting.current = true;
            toast.success('Signed in successfully');
            navigate('/home');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery initiated');
          // If user is on the password reset page, don't redirect
          if (!isRedirecting.current && !location.pathname.includes('/auth')) {
            isRedirecting.current = true;
            navigate('/auth');
          }
        }
      }
    } finally {
      // Reset processing flag after a short delay to prevent rapid consecutive events
      setTimeout(() => {
        processingAuthChangeRef.current = false;
        // Reset redirect flag after navigation is completed
        isRedirecting.current = false;
      }, 100);
    }
  }, [navigate, location.pathname, setUser, setSession, setSubscription, isMountedRef]);

  useEffect(() => {
    // Set up auth state listener
    const setupAuthListener = async () => {
      // Clean up previous listener if it exists
      if (authListenerRef.current) {
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
      
      console.log('Setting up auth listener...');
      const authListener = supabase.auth.onAuthStateChange(handleAuthChange);
      
      authListenerRef.current = authListener as unknown as AuthSubscription;
    };
    
    setupAuthListener();

    // Clean up subscription
    return () => {
      console.log('Cleaning up auth listeners');
      if (authListenerRef.current) {
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [handleAuthChange]);
};
