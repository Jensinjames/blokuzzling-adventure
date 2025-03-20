
import { useAuth as useAuthContext } from '@/context/AuthProvider';
import { AuthContextType } from '@/context/AuthTypes';

/**
 * Hook to access authentication context
 * Provides user, session, loading state, and authentication methods
 */
export const useAuth = (): AuthContextType => {
  const authContext = useAuthContext();
  
  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return authContext;
};

export default useAuth;
