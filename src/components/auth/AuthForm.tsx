
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import LoginSignupForm from './LoginSignupForm';
import ResetPasswordForm from './ResetPasswordForm';
import GoogleSignInButton from './GoogleSignInButton';

interface AuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
  onSuccess: () => void;
  onGoogleSignIn?: () => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ 
  isLogin, 
  onToggleMode, 
  onGoogleSignIn 
}) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      console.log('[Auth Debug] Attempting to sign in with Google');
      
      if (onGoogleSignIn) {
        await onGoogleSignIn();
      } else {
        toast.error('Google sign in is not configured properly');
      }
    } catch (error: any) {
      console.error('[Auth Debug] Google sign in error:', error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(`Google sign in error: ${error.message || 'An unexpected error occurred'}`);
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError(null);
  };

  if (isForgotPassword) {
    return <ResetPasswordForm onBack={toggleForgotPassword} />;
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-300 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <LoginSignupForm 
        isLogin={isLogin}
        onForgotPassword={toggleForgotPassword}
      />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
      </div>

      <GoogleSignInButton 
        isLogin={isLogin}
        loading={googleLoading}
        onClick={handleGoogleSignIn}
      />

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </>
  );
};

export default AuthForm;
