
import { useAuth } from '@/context/AuthProvider';

/**
 * Hook to check if a user has access to specific subscription features
 * Returns utility functions to check feature access based on the user's subscription
 */
export const useSubscriptionFeatures = () => {
  const { subscription } = useAuth();
  
  // Check if user can access premium features
  const canAccessPremiumFeatures = () => {
    return subscription.isPremium || subscription.tier === 'pro';
  };
  
  // Check if user can access pro features
  const canAccessProFeatures = () => {
    return subscription.tier === 'pro';
  };
  
  // Check if user can access any paid features
  const canAccessPaidFeatures = () => {
    return subscription.isBasicOrHigher;
  };
  
  // Check if subscription is active
  const hasActiveSubscription = () => {
    return subscription.isActive;
  };
  
  // Check if subscription is expiring soon (within 7 days)
  const isSubscriptionExpiringSoon = () => {
    if (!subscription.expiresAt) return false;
    
    const now = new Date();
    const expiryDate = new Date(subscription.expiresAt);
    const daysDiff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return subscription.isActive && daysDiff <= 7;
  };
  
  return {
    canAccessPremiumFeatures,
    canAccessProFeatures,
    canAccessPaidFeatures,
    hasActiveSubscription,
    isSubscriptionExpiringSoon,
    subscription
  };
};

export default useSubscriptionFeatures;
