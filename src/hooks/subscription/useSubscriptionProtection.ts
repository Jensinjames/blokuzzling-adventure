
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { SubscriptionCheckResult } from './subscriptionTypes';

/**
 * Hook that provides subscription protection utilities
 */
export const useSubscriptionProtection = (
  user: User | null,
  subscriptionCheck: SubscriptionCheckResult
) => {
  const navigate = useNavigate();
  const { hasSubscription, checkingSubscription, subscriptionDetails } = subscriptionCheck;

  // Protect routes that require subscription
  const requireSubscription = (callback: () => void, tier: string = 'basic') => {
    if (!user) {
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

  return {
    requireSubscription
  };
};
