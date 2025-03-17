
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProfileErrorProps {
  error: string;
}

const ProfileError: React.FC<ProfileErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/home');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Profile Error</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        <div className="mt-6 space-x-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </Button>
          <Button 
            onClick={handleGoHome} 
            variant="outline"
            className="text-gray-700 dark:text-gray-300"
          >
            Go Home
          </Button>
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          Error details: {error}
        </p>
      </div>
    </div>
  );
};

export default ProfileError;
