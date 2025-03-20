
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionStatus, defaultSubscription } from '@/types/subscription';

/**
 * Hook to access the user's subscription status
 * Provides tier, status, and helper flags for subscription state
 * 
 * For guest users, returns the default free subscription
 */
export const useSubscription = (): SubscriptionStatus => {
  const { subscription, user } = useAuth();
  
  // If user is not authenticated (guest mode), return default subscription
  if (!user) {
    return defaultSubscription;
  }
  
  return subscription;
};

export default useSubscription;
