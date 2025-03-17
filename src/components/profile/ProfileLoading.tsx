
import React from 'react';
import { Loader2 } from 'lucide-react';

const ProfileLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
      </div>
    </div>
  );
};

export default ProfileLoading;
