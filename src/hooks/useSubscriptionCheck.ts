
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface Subscription {
  tier: string | null;
  status: string | null;
  isActive: boolean;
  isPremium: boolean;
}

export const useSubscriptionCheck = (user: User | null) => {
  const [subscription, setSubscription] = useState<Subscription>({
    tier: null,
    status: null,
    isActive: false,
    isPremium: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSubscription = async (userId: string) => {
      try {
        setLoading(true);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, subscription_expiry')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching subscription details:', error);
          return;
        }

        // Check if subscription is active and not expired
        const isSubscriptionActive = 
          profile.subscription_status === 'active' &&
          (!profile.subscription_expiry || new Date(profile.subscription_expiry) > new Date());
        
        setSubscription({
          tier: profile.subscription_tier || 'free',
          status: profile.subscription_status || 'inactive',
          isActive: isSubscriptionActive,
          isPremium: profile.subscription_tier === 'premium' && isSubscriptionActive
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkUserSubscription(user.id);
    } else {
      setSubscription({
        tier: null,
        status: null,
        isActive: false,
        isPremium: false
      });
      setLoading(false);
    }
  }, [user]);

  return { subscription, loading };
};
