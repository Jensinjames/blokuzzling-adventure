
import React, { useState } from 'react';
import AuthForm from './AuthForm';
import AuthLayout from './AuthLayout';

interface AuthContainerProps {
  defaultIsLogin?: boolean;
  onSuccessfulAuth: () => void;
  onGoogleSignIn?: () => Promise<void>;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ 
  defaultIsLogin = true,
  onSuccessfulAuth,
  onGoogleSignIn
}) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <AuthLayout 
      title="BloKu" 
      subtitle="A strategic puzzle game where players take turns placing pieces on the board"
    >
      <h2 className="text-xl font-semibold mb-6 text-center">
        {isLogin ? 'Sign In' : 'Create Account'}
      </h2>
      
      <AuthForm 
        isLogin={isLogin} 
        onToggleMode={toggleAuthMode} 
        onSuccess={onSuccessfulAuth}
        onGoogleSignIn={onGoogleSignIn}
      />
    </AuthLayout>
  );
};

export default AuthContainer;
