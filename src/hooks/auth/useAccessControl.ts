
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@/integrations/supabase/client';
import { SubscriptionDetails } from '@/types/subscription';
import { useCallback } from 'react';

/**
 * Hook for handling access control based on authentication and subscription
 */
export function useAccessControl(
  user: User | null, 
  subscription: SubscriptionDetails, 
  checkingSubscription: boolean
) {
  const navigate = useNavigate();

  // Protect routes that require subscription - memoized to prevent recreating on each render
  const requireSubscription = useCallback((callback: () => void, tier: string = 'basic') => {
    if (!user) {
      toast.error('You must be logged in to access this feature');
      navigate('/auth', { state: { returnPath: window.location.pathname } });
      return;
    }

    if (checkingSubscription) {
      toast.info('Checking your account status...');
      return;
    }

    // For now, tier checking is simple - in a real app, we would have a hierarchy
    const hasSufficientTier = 
      tier === 'free' || 
      (subscription.tier === 'premium') || 
      (tier === 'basic' && ['basic', 'premium'].includes(subscription.tier || ''));

    if (!subscription.isActive || !hasSufficientTier) {
      toast.error(`You need an active ${tier} subscription to access this feature`);
      navigate('/settings', { state: { showSubscriptionInfo: true } });
      return;
    }

    callback();
  }, [user, checkingSubscription, subscription, navigate]);

  // Direct route protection for components that need it
  const checkAccess = useCallback((tier: string = 'basic'): boolean => {
    if (!user) return false;
    if (checkingSubscription) return false;

    const hasSufficientTier = 
      tier === 'free' || 
      (subscription.tier === 'premium') || 
      (tier === 'basic' && ['basic', 'premium'].includes(subscription.tier || ''));

    return subscription.isActive && hasSufficientTier;
  }, [user, checkingSubscription, subscription]);

  return { 
    requireSubscription,
    checkAccess,
    isAuthenticated: !!user,
    isSubscribed: subscription?.isActive || false
  };
}
