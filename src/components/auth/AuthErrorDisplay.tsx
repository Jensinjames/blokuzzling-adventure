
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthErrorDisplayProps {
  error: string | null;
}

export const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-300 text-sm flex items-start">
      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
};
