
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionStatus, defaultSubscription } from '@/types/subscription';
import { User } from '@supabase/supabase-js';

/**
 * Hook to fetch and manage user subscription data
 */
export const useSubscriptionData = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>(defaultSubscription);

  const fetchSubscription = async (userId: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, subscription_expiry')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription details:', error);
        return;
      }

      if (data) {
        const expiryDate = data.subscription_expiry ? new Date(data.subscription_expiry) : null;
        const isActive = data.subscription_status === 'active' || 
                        (data.subscription_status === 'trial' && 
                        (expiryDate ? expiryDate > new Date() : false));
        
        const tier = data.subscription_tier as SubscriptionStatus['tier'];
        const status = data.subscription_status as SubscriptionStatus['status'];
        
        setSubscription({
          tier,
          status,
          isActive,
          isPremium: tier === 'premium' || tier === 'pro',
          isBasicOrHigher: Boolean(tier && tier !== 'free'),
          expiry: data.subscription_expiry,
          hasSubscription: Boolean(tier && tier !== 'free' && tier !== null),
          expiresAt: expiryDate,
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching subscription:', error);
    }
  };

  const resetSubscription = () => {
    setSubscription(defaultSubscription);
  };

  return {
    subscription,
    fetchSubscription,
    resetSubscription
  };
};

export default useSubscriptionData;
