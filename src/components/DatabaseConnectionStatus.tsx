
import React from 'react';
import { useRealtimeStatus } from './SupabaseRealtimeProvider';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export const DatabaseConnectionStatus: React.FC = () => {
  const { isConnected, connectionError, reconnect } = useRealtimeStatus();

  // Only render when not connected
  if (isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 max-w-xs">
      <AlertCircle className="h-5 w-5" />
      <div className="flex-1">
        <p className="font-medium">Connection Error</p>
        <p className="text-sm">{connectionError || 'Unable to connect to the database'}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="ml-2 bg-red-200 dark:bg-red-800"
        onClick={(e) => {
          e.preventDefault();
          reconnect();
        }}
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Retry
      </Button>
    </div>
  );
};

export default DatabaseConnectionStatus;
