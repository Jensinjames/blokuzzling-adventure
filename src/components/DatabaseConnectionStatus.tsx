
import React from 'react';
import { useRealtimeStatus } from './SupabaseRealtimeProvider';
import { AlertCircle } from 'lucide-react';

export const DatabaseConnectionStatus: React.FC = () => {
  const { isConnected, connectionError } = useRealtimeStatus();

  if (isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 max-w-xs">
      <AlertCircle className="h-5 w-5" />
      <div>
        <p className="font-medium">Connection Error</p>
        <p className="text-sm">{connectionError || 'Unable to connect to the database'}</p>
      </div>
    </div>
  );
};

export default DatabaseConnectionStatus;
