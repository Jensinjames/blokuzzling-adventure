
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
}

/**
 * Hook to handle Supabase auth state listener
 */
export const useAuthListener = ({
  setUser,
  setSession,
  setLoading,
  setSubscription
}: UseAuthListenerOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authListenerRef = useRef<AuthSubscription | null>(null);
  const processingAuthChangeRef = useRef(false);
  const initialized = useRef(false);
  
  // Memoize handler to prevent recreation on each render
  const handleAuthChange = useCallback(async (event: string, newSession: Session | null) => {
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
        
        // Wait until next event loop to ensure state updates have time to propagate
        setTimeout(() => {
          toast.info('Signed out');
          // Navigate instead of full page reload to prevent potential loops
          if (location.pathname !== '/') {
            navigate('/');
          }
        }, 0);
      } else {
        // For other events, update session and user normally
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle other events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', newSession?.user?.email);
          toast.success('Signed in successfully');
          
          // Properly redirect to home after sign in
          if (location.pathname === '/auth' || location.pathname === '/') {
            navigate('/home');
          }
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
    } finally {
      processingAuthChangeRef.current = false;
      if (!initialized.current) {
        setLoading(false);
        initialized.current = true;
      }
    }
  }, [navigate, location.pathname, setUser, setSession, setLoading, setSubscription]);

  useEffect(() => {
    if (authListenerRef.current) {
      return; // Already initialized
    }
    
    // Set up auth state listener
    const setupAuthListener = async () => {
      if (authListenerRef.current) {
        // Correctly access the unsubscribe method
        authListenerRef.current.data.subscription.unsubscribe();
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
        // Correctly access the unsubscribe method
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [handleAuthChange]);
};
