
import { useAuth as useAuthContext } from '@/context/AuthProvider';

/**
 * Hook to access authentication context
 * Provides user, session, loading state, and authentication methods
 */
export const useAuth = () => {
  const authContext = useAuthContext();
  
  // Enhanced logging for authentication debugging
  if (import.meta.env.DEV) {
    const { user, session, loading } = authContext;
    console.log(`Auth state: ${user ? 'authenticated' : 'unauthenticated'}, loading: ${loading}`);
    
    if (session) {
      // Log session expiry time to help debug token issues
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const minutesUntilExpiry = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60));
      
      console.log(`Session valid: expires in ${minutesUntilExpiry} minutes (${expiresAt.toLocaleTimeString()})`);
    }
  }
  
  return authContext;
};

export default useAuth;
