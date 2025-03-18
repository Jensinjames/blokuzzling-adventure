
import React from 'react';
import { Loader2 } from 'lucide-react';

const LobbyLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};

export default LobbyLoading;
