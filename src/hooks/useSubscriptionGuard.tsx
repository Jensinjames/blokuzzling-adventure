
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

type SubscriptionTier = 'basic' | 'premium' | 'pro';

interface UseSubscriptionGuardOptions {
  /**
   * The required subscription tier to access the content
   * @default 'basic'
   */
  requiredTier?: SubscriptionTier;
  
  /**
   * Where to redirect if the user doesn't have the required subscription
   * @default '/settings/subscription'
   */
  redirectTo?: string;
  
  /**
   * Custom message to display when redirecting
   */
  message?: string;
  
  /**
   * Whether to skip the subscription check
   * @default false
   */
  skip?: boolean;
}

/**
 * Hook for protecting routes based on subscription status
 * Returns whether the user has access based on their subscription
 */
export const useSubscriptionGuard = (options: UseSubscriptionGuardOptions = {}) => {
  const { 
    requiredTier = 'basic', 
    redirectTo = '/settings/subscription',
    message = `This content requires a ${requiredTier} subscription`,
    skip = false
  } = options;
  
  const { user, loading, subscription } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has required tier
  const hasRequiredTier = () => {
    if (!user) return false;
    
    if (requiredTier === 'basic') {
      return subscription.isBasicOrHigher;
    } else if (requiredTier === 'premium') {
      return subscription.isPremium;
    } else if (requiredTier === 'pro') {
      return subscription.tier === 'pro';
    }
    return false;
  };
  
  // Perform subscription check and redirect if needed
  useEffect(() => {
    if (skip || loading) return;
    
    if (!user) {
      toast.error('You need to be logged in to access this content');
      navigate('/auth');
      return;
    }
    
    if (!hasRequiredTier()) {
      toast.error(message);
      navigate(redirectTo);
    }
  }, [user, subscription, loading, navigate, requiredTier, redirectTo, message, skip]);
  
  return {
    hasAccess: hasRequiredTier(),
    isLoading: loading,
    subscription
  };
};

export default useSubscriptionGuard;
