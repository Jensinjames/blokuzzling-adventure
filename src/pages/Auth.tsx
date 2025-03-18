
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContainer from '@/components/auth/AuthContainer';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/home';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log(`[Auth Debug] User already authenticated, redirecting to ${returnTo}`);
      navigate(returnTo);
    }
  }, [user, navigate, returnTo]);

  const handleSuccessfulAuth = () => {
    // Navigation handled by auth state change listener in AuthProvider
    console.log('[Auth Debug] Auth successful, navigation will be handled by auth state listener');
  };

  return (
    <AuthContainer 
      onSuccessfulAuth={handleSuccessfulAuth}
    />
  );
};

export default Auth;
