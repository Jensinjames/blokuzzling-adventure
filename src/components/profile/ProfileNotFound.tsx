
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProfileNotFoundProps {
  message?: string;
}

const ProfileNotFound: React.FC<ProfileNotFoundProps> = ({ 
  message = "We couldn't find your profile. This could be because you're new to the platform."
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Profile Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {message}
        </p>
        <div className="mt-4 space-x-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline"
            className="text-gray-600 dark:text-gray-400"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileNotFound;
