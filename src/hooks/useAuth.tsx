
import { useAuth as useAuthContext } from '@/context/AuthProvider';
import { useSubscription } from './subscription/useSubscription';

/**
 * Enhanced hook to access authentication context
 * Provides user, session, loading state, and authentication methods with subscription validation
 */
export const useAuth = () => {
  const authContext = useAuthContext();
  const { 
    hasSubscription, 
    checkingSubscription, 
    requireSubscription, 
    subscription 
  } = useSubscription(authContext.user);

  return {
    ...authContext,
    hasSubscription,
    checkingSubscription,
    requireSubscription,
    subscription
  };
};

export default useAuth;
