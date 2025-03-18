
import { useAuth as useAuthContext } from '@/context/AuthProvider';

/**
 * Hook to access authentication context
 * Provides user, session, loading state, and authentication methods
 */
export const useAuth = () => {
  const authContext = useAuthContext();
  return authContext;
};

export default useAuth;
