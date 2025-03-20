
import { useState, useEffect } from 'react';
import { User } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionDetails } from '@/types/subscription';

export const useSubscription = (user: User | null) => {
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionDetails>({
    tier: null,
    status: null,
    isActive: false,
    isPremium: false,
    isBasicOrHigher: false,
    expiry: null
  });

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setHasSubscription(false);
        setSubscriptionState({
          tier: null,
          status: null,
          isActive: false,
          isPremium: false,
          isBasicOrHigher: false,
          expiry: null
        });
        return;
      }

      setCheckingSubscription(true);
      
      try {
        console.log('Fetching subscription for user:', user.id);
        
        // Check profile for subscription information
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, subscription_expiry')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching subscription from profile:', profileError);
          throw profileError;
        }
        
        const tier = profile?.subscription_tier || null;
        const status = profile?.subscription_status || null;
        const expiry = profile?.subscription_expiry || null;
        
        // Calculate whether subscription is active
        const isActive = status === 'active' && 
          (!expiry || new Date(expiry) > new Date());
          
        // Set premium flag
        const isPremium = isActive && tier === 'premium';
        
        // Set basic or higher flag
        const isBasicOrHigher = isActive && 
          (tier === 'basic' || tier === 'premium');
        
        const subscriptionDetails: SubscriptionDetails = {
          tier,
          status,
          isActive,
          isPremium,
          isBasicOrHigher,
          expiry
        };
        
        console.log('Subscription details:', subscriptionDetails);
        
        setSubscriptionState(subscriptionDetails);
        setHasSubscription(isActive);
        
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscriptionState({
          tier: null,
          status: null,
          isActive: false,
          isPremium: false,
          isBasicOrHigher: false,
          expiry: null
        });
        setHasSubscription(false);
      } finally {
        setCheckingSubscription(false);
      }
    };

    fetchSubscription();
  }, [user]);

  return { 
    checkingSubscription, 
    hasSubscription, 
    subscriptionState 
  };
};
