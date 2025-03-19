
import { useRef, useEffect } from 'react';
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

  useEffect(() => {
    // Set up auth state listener
    const setupAuthListener = async () => {
      if (authListenerRef.current) {
        // Correctly access the unsubscribe method
        authListenerRef.current.data.subscription.unsubscribe();
      }
      
      const authListener = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log(`Auth state changed: ${event}`, newSession?.user?.id || 'no user');
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);

          if (event === 'SIGNED_IN') {
            console.log('User signed in:', newSession?.user?.email);
            toast.success('Signed in successfully');
            
            // Properly redirect to home after sign in
            if (location.pathname === '/auth' || location.pathname === '/') {
              navigate('/home');
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            toast.info('Signed out');
            setSubscription({
              tier: null,
              status: null,
              isActive: false,
              isPremium: false,
              isBasicOrHigher: false,
              expiry: null
            });
            // Force full page reload to clear any cached state
            window.location.href = '/#/';
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
      );
      
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
  }, [navigate, location.pathname, setUser, setSession, setLoading, setSubscription]);
};
