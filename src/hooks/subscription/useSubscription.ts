
import { User } from '@supabase/supabase-js';
import { useSubscriptionValidator } from './useSubscriptionValidator';
import { useSubscriptionProtection } from './useSubscriptionProtection';
import { SubscriptionDetails } from './subscriptionTypes';

/**
 * Hook that combines subscription validation and protection
 */
export const useSubscription = (user: User | null) => {
  const subscriptionCheck = useSubscriptionValidator(user);
  const { requireSubscription } = useSubscriptionProtection(user, subscriptionCheck);
  
  const { hasSubscription, checkingSubscription, subscriptionDetails } = subscriptionCheck;
  
  // Enhanced subscription details with computed properties
  const subscriptionWithStatus: SubscriptionDetails = {
    ...subscriptionDetails,
    isActive: !!hasSubscription,
    isPremium: !!hasSubscription && subscriptionDetails.tier === 'premium',
    isBasicOrHigher: !!hasSubscription && ['basic', 'premium'].includes(subscriptionDetails.tier || '')
  };

  return {
    hasSubscription,
    checkingSubscription,
    requireSubscription,
    subscription: subscriptionWithStatus
  };
};
