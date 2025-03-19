
import React, { useState } from 'react';
import { toast } from 'sonner';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetForm } from './PasswordResetForm';

interface AuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggleMode, onSuccess }) => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSuccessfulSignUp = () => {
    toast.success('Account created successfully!');
    toast.info('Please check your email to confirm your account before signing in.');
    onSuccess();
    // Switch to login mode after successful signup
    if (!isLogin) {
      onToggleMode();
    }
  };

  const handleSuccessfulSignIn = () => {
    onSuccess();
  };

  const handlePasswordResetSuccess = () => {
    toast.success('Password reset email sent. Please check your inbox.');
    setIsForgotPassword(false);
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
  };

  if (isForgotPassword) {
    return <PasswordResetForm onBackToLogin={toggleForgotPassword} />;
  }

  return (
    <>
      {isLogin ? (
        <LoginForm 
          onSuccess={handleSuccessfulSignIn} 
          onForgotPassword={toggleForgotPassword} 
        />
      ) : (
        <SignUpForm 
          onSuccess={handleSuccessfulSignUp} 
        />
      )}

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
