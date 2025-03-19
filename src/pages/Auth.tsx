
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContainer from '@/components/auth/AuthContainer';
import { toast } from 'sonner';
import ResendConfirmation from '@/components/auth/ResendConfirmation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showResendTab, setShowResendTab] = useState(false);
  const [authProcessing, setAuthProcessing] = useState(false);

  // Get the return URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/home';
  const isReset = searchParams.get('reset') === 'true';
  const isConfirmation = searchParams.get('confirmation') === 'true';
  
  // Check if we have a session on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        setAuthProcessing(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[Auth Debug] Session check error:', error);
        } else if (data.session) {
          console.log('[Auth Debug] Found existing session, redirecting to:', returnTo);
          navigate(returnTo);
        }
      } catch (error) {
        console.error('[Auth Debug] Unexpected session check error:', error);
      } finally {
        setAuthProcessing(false);
      }
    };
    
    checkSession();
  }, [navigate, returnTo]);
  
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
      console.log(`[Auth Debug] User authenticated, redirecting to ${returnTo}`);
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

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      console.log('[Auth Debug] Attempting to sign in with Google from auth page');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        }
      });
      
      if (error) {
        console.error('[Auth Debug] Google sign in error:', error);
        toast.error(`Google sign in failed: ${error.message}`);
      }
    } catch (error: any) {
      console.error('[Auth Debug] Google sign in error:', error);
      toast.error(`Google sign in error: ${error.message || 'An unexpected error occurred'}`);
    }
  };

  if (authProcessing) {
    return (
      <div className="py-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse h-10 w-10 rounded-full bg-primary/50"></div>
      </div>
    );
  }

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
                onGoogleSignIn={handleGoogleSignIn}
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
            onGoogleSignIn={handleGoogleSignIn}
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
