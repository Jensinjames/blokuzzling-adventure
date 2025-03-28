
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ProfileErrorProps {
  error: string;
}

const ProfileError: React.FC<ProfileErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/home');
  };
  
  const getErrorMessage = (error: string) => {
    if (error.includes("permission denied for table users")) {
      return "We're unable to access user information. This is likely a database permissions issue that our team is working on.";
    }
    if (error.includes("schema")) {
      return "Database schema configuration error. Please try again or contact support.";
    }
    if (error.includes("supabase.from(...).schema is not a function")) {
      return "Database schema configuration error. The application is trying to access the database incorrectly.";
    }
    if (error.includes("has no call signatures")) {
      return "Database client configuration error. The application needs to be updated to match the new schema.";
    }
    return error;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Profile Error</h2>
        
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
        
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
          Technical details: {error}
        </p>
      </div>
    </div>
  );
};

export default ProfileError;
