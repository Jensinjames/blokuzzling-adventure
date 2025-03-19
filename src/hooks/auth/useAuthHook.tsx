
import { useAuth as useAuthContext } from '@/context/AuthProvider';
import { useSubscription } from './useSubscription';
import { useAccessControl } from './useAccessControl';

/**
 * Enhanced hook to access authentication context
 * Provides user, session, loading state, and authentication methods with subscription validation
 */
export const useAuthHook = () => {
  const authContext = useAuthContext();
  const { 
    hasSubscription, 
    checkingSubscription, 
    subscriptionState 
  } = useSubscription(authContext.user);
  
  const { requireSubscription } = useAccessControl(
    authContext.user, 
    subscriptionState, 
    checkingSubscription
  );

  return {
    ...authContext,
    hasSubscription,
    checkingSubscription,
    requireSubscription,
    subscription: subscriptionState
  };
};
