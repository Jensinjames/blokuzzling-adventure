
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

type AuthCheckOptions = {
  /**
   * Route to redirect to if user is not authenticated
   * @default '/auth'
   */
  redirectTo?: string;
  
  /**
   * Query parameter to specify where to return after authentication
   * @default false
   */
  includeReturnTo?: boolean;
  
  /**
   * Custom message to display when redirecting
   * @default 'You must be logged in to access this page'
   */
  message?: string;
  
  /**
   * Skip the authentication check
   * @default false
   */
  skip?: boolean;
};

/**
 * Hook for consistent authentication checks across pages
 * Automatically redirects unauthenticated users
 */
export const useAuthCheck = (options: AuthCheckOptions = {}) => {
  const { 
    redirectTo = '/auth', 
    includeReturnTo = false,
    message = 'You must be logged in to access this page',
    skip = false
  } = options;
  
  const { user, session, loading: authLoading, refreshSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);
  
  // Perform auth check and redirect if needed, but only once
  useEffect(() => {
    const performCheck = async () => {
      if (skip || authLoading || hasChecked) return;
      
      if (!user || !session) {
        console.log('No authenticated user, redirecting to:', redirectTo);
        toast.error(message);
        
        // Add returnTo if needed
        if (includeReturnTo) {
          const currentPath = location.pathname;
          navigate(`${redirectTo}?returnTo=${encodeURIComponent(currentPath)}`);
        } else {
          navigate(redirectTo);
        }
      }
      
      // Prevent further checks
      setHasChecked(true);
    };
    
    performCheck();
  }, [user, session, authLoading, navigate, redirectTo, includeReturnTo, message, skip, location.pathname, hasChecked]);
  
  // Refresh session if it's expiring soon - only check once when component mounts
  useEffect(() => {
    if (session && session.expires_at && new Date(session.expires_at * 1000) < new Date(Date.now() + 5 * 60 * 1000)) {
      console.log('Session expiring soon, refreshing...');
      refreshSession();
    }
  }, [session, refreshSession]);
  
  return {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading: authLoading
  };
};

export default useAuthCheck;
