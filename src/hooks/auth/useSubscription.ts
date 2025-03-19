
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/integrations/supabase/client';
import { SubscriptionDetails } from '@/types/subscription';

/**
 * Hook to manage subscription state and checks
 */
export function useSubscription(user: User | null) {
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

  // Check if user has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
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
          .eq('id', user.id)
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
  }, [user]);

  // Check if the user has a premium subscription
  const isPremiumUser = subscriptionDetails.tier === 'premium' && hasSubscription;
  
  // Check if user has a basic or higher subscription
  const hasBasicOrHigher = ['basic', 'premium'].includes(subscriptionDetails.tier || '') && hasSubscription;

  return {
    hasSubscription,
    checkingSubscription,
    subscriptionDetails,
    subscriptionState: {
      tier: subscriptionDetails.tier,
      status: subscriptionDetails.status,
      expiry: subscriptionDetails.expiry,
      isActive: !!hasSubscription,
      isPremium: !!isPremiumUser,
      isBasicOrHigher: !!hasBasicOrHigher
    }
  };
}
