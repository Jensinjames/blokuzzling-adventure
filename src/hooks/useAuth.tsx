
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
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    tier: string | null;
    status: string | null;
    expiry: string | null;
  }>({
    tier: null,
    status: null,
    expiry: null
  });
  const navigate = useNavigate();

  // Check if user has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!authContext.user) {
        setHasSubscription(null);
        setSubscriptionDetails({
          tier: null,
          status: null,
          expiry: null
        });
        return;
      }

      try {
        setCheckingSubscription(true);
        
        // Fetch user profile to check subscription status
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, subscription_expiry')
          .eq('id', authContext.user.id)
          .single();

        if (error) {
          console.error('Error fetching subscription details:', error);
          setHasSubscription(false);
          return;
        }

        const typedProfile = profile as any;
        
        // Check if subscription is active and not expired
        const isSubscriptionActive = 
          typedProfile.subscription_status === 'active' &&
          (!typedProfile.subscription_expiry || new Date(typedProfile.subscription_expiry) > new Date());
        
        setHasSubscription(isSubscriptionActive);
        setSubscriptionDetails({
          tier: typedProfile.subscription_tier || 'free',
          status: typedProfile.subscription_status || 'inactive',
          expiry: typedProfile.subscription_expiry || null
        });
        
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
  const requireSubscription = (callback: () => void, tier: string = 'basic') => {
    if (!authContext.user) {
      toast.error('You must be logged in to access this feature');
      navigate('/auth');
      return;
    }

    if (checkingSubscription) {
      toast.info('Checking your account status...');
      return;
    }

    // For now, tier checking is simple - in a real app, we would have a hierarchy
    const hasSufficientTier = 
      tier === 'free' || 
      (subscriptionDetails.tier === 'premium') || 
      (tier === 'basic' && ['basic', 'premium'].includes(subscriptionDetails.tier || ''));

    if (!hasSubscription || !hasSufficientTier) {
      toast.error(`You need an active ${tier} subscription to access this feature`);
      navigate('/settings');
      return;
    }

    callback();
  };

  // Check if the user has a premium subscription
  const isPremiumUser = subscriptionDetails.tier === 'premium' && hasSubscription;
  
  // Check if user has a basic or higher subscription
  const hasBasicOrHigher = ['basic', 'premium'].includes(subscriptionDetails.tier || '') && hasSubscription;

  return {
    ...authContext,
    hasSubscription,
    checkingSubscription,
    requireSubscription,
    subscription: {
      tier: subscriptionDetails.tier,
      status: subscriptionDetails.status,
      expiry: subscriptionDetails.expiry,
      isActive: !!hasSubscription,
      isPremium: !!isPremiumUser,
      isBasicOrHigher: !!hasBasicOrHigher
    }
  };
};

export default useAuth;
