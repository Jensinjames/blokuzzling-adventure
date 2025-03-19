
import { useAuthHook } from './auth/useAuthHook';

/**
 * Enhanced hook to access authentication context
 * Provides user, session, loading state, and authentication methods with subscription validation
 */
export const useAuth = useAuthHook;

export default useAuth;
