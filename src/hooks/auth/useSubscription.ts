
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { checkUserSubscription } from '@/utils/subscriptionUtils';
import { SubscriptionStatus } from '@/types/subscription';

/**
 * Hook to check and manage user subscription status
 * @param user The current user object
 * @returns Subscription status and checking state
 */
export const useSubscription = (user: User | null) => {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionStatus>({
    hasSubscription: false,
    tier: null,
    expiresAt: null,
    status: null,
    expiry: null,
    isActive: false,
    isPremium: false,
    isBasicOrHigher: false
  });
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    // Check subscription when user changes
    const checkSubscription = async () => {
      try {
        if (!user) {
          if (isMounted) {
            setSubscriptionState({
              hasSubscription: false,
              tier: null,
              expiresAt: null,
              status: null,
              expiry: null,
              isActive: false,
              isPremium: false,
              isBasicOrHigher: false
            });
            setCheckingSubscription(false);
          }
          return;
        }
        
        setCheckingSubscription(true);
        console.log('Checking subscription for user:', user.id);
        
        // Use the utility function to check subscription
        const status = await checkUserSubscription(user.id);
        
        // Enhance the response with additional derived properties
        const enhancedStatus: SubscriptionStatus = {
          ...status,
          status: status.tier ? 'active' : 'inactive',
          expiry: status.expiresAt,
          isActive: status.hasSubscription,
          isPremium: status.tier === 'premium',
          isBasicOrHigher: status.tier === 'basic' || status.tier === 'premium'
        };
        
        if (isMounted) {
          setSubscriptionState(enhancedStatus);
          console.log('Subscription status:', enhancedStatus);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        if (isMounted) {
          setSubscriptionState({
            hasSubscription: false,
            tier: null,
            expiresAt: null,
            status: null,
            expiry: null,
            isActive: false,
            isPremium: false,
            isBasicOrHigher: false
          });
        }
      } finally {
        if (isMounted) {
          setCheckingSubscription(false);
        }
      }
    };
    
    checkSubscription();
    
    return () => {
      isMounted = false;
    };
  }, [user]);
  
  // Include hasSubscription as a convenience property
  const hasSubscription = subscriptionState.hasSubscription;
  
  return {
    subscriptionState,
    checkingSubscription,
    hasSubscription,
  };
};
