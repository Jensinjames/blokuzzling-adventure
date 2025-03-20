
import { useAuth } from '@/context/AuthProvider';
import { SubscriptionStatus } from '@/types/subscription';

/**
 * Hook to access the user's subscription status
 * Provides tier, status, and helper flags for subscription state
 */
export const useSubscription = (): SubscriptionStatus => {
  const { subscription } = useAuth();
  return subscription;
};

export default useSubscription;
