
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContainer from '@/components/auth/AuthContainer';
import { toast } from 'sonner';
import ResendConfirmation from '@/components/auth/ResendConfirmation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showResendTab, setShowResendTab] = useState(false);

  // Get the return URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/home';
  const isReset = searchParams.get('reset') === 'true';
  const isConfirmation = searchParams.get('confirmation') === 'true';
  
  // Handle password reset flow
  useEffect(() => {
    if (isReset) {
      toast.info('Check your email for a password reset link');
    }
    
    if (isConfirmation) {
      toast.success('Email confirmed successfully! You can now sign in.');
    }
  }, [isReset, isConfirmation]);

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

  const toggleResendTab = () => {
    setShowResendTab(!showResendTab);
  };

  return (
    <div className="py-6">
      {showResendTab ? (
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auth">Sign In/Up</TabsTrigger>
              <TabsTrigger value="resend">Confirm Email</TabsTrigger>
            </TabsList>
            <TabsContent value="auth">
              <AuthContainer 
                onSuccessfulAuth={handleSuccessfulAuth}
              />
              <div className="mt-4 text-center">
                <button 
                  onClick={toggleResendTab}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Need to confirm your email?
                </button>
              </div>
            </TabsContent>
            <TabsContent value="resend">
              <ResendConfirmation />
              <div className="mt-4 text-center">
                <button 
                  onClick={toggleResendTab}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <>
          <AuthContainer 
            onSuccessfulAuth={handleSuccessfulAuth}
          />
          <div className="mt-4 text-center">
            <button 
              onClick={toggleResendTab}
              className="text-sm text-blue-600 hover:underline"
            >
              Need to confirm your email?
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Auth;
