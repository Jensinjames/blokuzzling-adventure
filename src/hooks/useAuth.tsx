
import { useAuth as useAuthContext } from '@/context/AuthProvider';
import { AuthContextType } from '@/context/AuthTypes';

/**
 * Hook to access authentication context
 * Provides user, session, loading state, and authentication methods
 */
export const useAuth = (): AuthContextType => {
  const authContext = useAuthContext();
  return authContext;
};

export default useAuth;
