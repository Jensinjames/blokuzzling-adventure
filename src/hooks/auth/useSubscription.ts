
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Default subscription for when no user is present
  const defaultSubscription = useCallback((): SubscriptionDetails => ({
    tier: null,
    status: null,
    isActive: false,
    isPremium: false,
    isBasicOrHigher: false,
    expiry: null
  }), []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      // Skip if already fetching or no user
      if (fetchingRef.current || !user) {
        if (!user) {
          // Reset subscription if no user
          if (mountedRef.current) {
            setHasSubscription(false);
            setSubscriptionState(defaultSubscription());
          }
        }
        return;
      }

      fetchingRef.current = true;
      if (mountedRef.current) setCheckingSubscription(true);
      
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
        
        // Calculate subscription state
        const isActive = status === 'active' && 
          (!expiry || new Date(expiry) > new Date());
          
        const isPremium = isActive && tier === 'premium';
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
        
        // Only update state if component is still mounted
        if (mountedRef.current) {
          // Check if subscription state has actually changed before updating
          const hasChanged = JSON.stringify(subscriptionState) !== JSON.stringify(subscriptionDetails);
          
          if (hasChanged) {
            setSubscriptionState(subscriptionDetails);
            setHasSubscription(isActive);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        if (mountedRef.current) {
          setSubscriptionState(defaultSubscription());
          setHasSubscription(false);
        }
      } finally {
        if (mountedRef.current) setCheckingSubscription(false);
        fetchingRef.current = false;
      }
    };

    fetchSubscription();
  }, [user, defaultSubscription, subscriptionState]);

  return { 
    checkingSubscription, 
    hasSubscription, 
    subscriptionState 
  };
};
