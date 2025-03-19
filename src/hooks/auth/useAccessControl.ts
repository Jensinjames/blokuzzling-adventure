
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@/integrations/supabase/client';
import { SubscriptionDetails } from '@/types/subscription';

/**
 * Hook for handling access control based on authentication and subscription
 */
export function useAccessControl(
  user: User | null, 
  subscription: SubscriptionDetails, 
  checkingSubscription: boolean
) {
  const navigate = useNavigate();

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
      (subscription.tier === 'premium') || 
      (tier === 'basic' && ['basic', 'premium'].includes(subscription.tier || ''));

    if (!subscription.isActive || !hasSufficientTier) {
      toast.error(`You need an active ${tier} subscription to access this feature`);
      navigate('/settings');
      return;
    }

    callback();
  };

  return { requireSubscription };
}
