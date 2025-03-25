
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContainer from '@/components/auth/AuthContainer';
import { toast } from 'sonner';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/home';
  const isReset = searchParams.get('reset') === 'true';
  
  console.log('[Auth Page Debug] Render with user:', user ? 'logged in' : 'not logged in', 'loading:', loading);
  console.log('[Auth Page Debug] Return path:', returnTo);
  
  // Handle password reset flow
  useEffect(() => {
    if (isReset) {
      toast.info('Check your email for a password reset link');
    }
  }, [isReset]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log(`[Auth Page Debug] User already authenticated, redirecting to ${returnTo}`);
      navigate(returnTo);
    }
  }, [user, navigate, returnTo, loading]);

  const handleSuccessfulAuth = () => {
    // Navigation handled by auth state change listener in AuthProvider
    console.log('[Auth Page Debug] Auth successful, navigation will be handled by auth state listener');
  };

  // Show loading state if authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContainer 
      onSuccessfulAuth={handleSuccessfulAuth}
    />
  );
};

export default Auth;
