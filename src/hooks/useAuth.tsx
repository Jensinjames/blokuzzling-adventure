
import { useAuth as useAuthContext } from '@/context/AuthProvider';

/**
 * Hook to access authentication context
 * Provides user, session, loading state, and authentication methods
 */
export const useAuth = () => {
  const authContext = useAuthContext();
  
  // Log auth state for debugging
  if (import.meta.env.DEV) {
    const { user, loading } = authContext;
    console.log(`Auth state: ${user ? 'authenticated' : 'unauthenticated'}, loading: ${loading}`);
  }
  
  return authContext;
};

export default useAuth;
