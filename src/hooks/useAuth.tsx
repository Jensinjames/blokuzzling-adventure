
import { useAuth as useAuthContext } from '@/context/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Enhanced hook to access authentication context
 * Provides user, session, loading state, and authentication methods with subscription validation
 */
export const useAuth = () => {
  const authContext = useAuthContext();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if user has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!authContext.user) {
        setHasSubscription(null);
        return;
      }

      try {
        setCheckingSubscription(true);
        // In a real implementation, we would check for an actual subscription status
        // For now, we assume all authenticated users have access
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authContext.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setHasSubscription(false);
          return;
        }

        // For MVP, all authenticated users have access
        setHasSubscription(true);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [authContext.user]);

  // Protect routes that require subscription
  const requireSubscription = (callback: () => void) => {
    if (!authContext.user) {
      toast.error('You must be logged in to access this feature');
      navigate('/auth');
      return;
    }

    if (checkingSubscription) {
      // Waiting for subscription check
      toast.info('Checking your account status...');
      return;
    }

    if (hasSubscription === false) {
      toast.error('You need an active subscription to access this feature');
      navigate('/settings');
      return;
    }

    callback();
  };

  return {
    ...authContext,
    hasSubscription,
    checkingSubscription,
    requireSubscription
  };
};

export default useAuth;
