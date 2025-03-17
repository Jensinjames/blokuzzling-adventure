
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Context to track the realtime connection status
type RealtimeContextType = {
  isConnected: boolean;
  connectionError: string | null;
};

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  connectionError: null
});

export const useRealtimeStatus = () => useContext(RealtimeContext);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const SupabaseRealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Enable and configure Supabase realtime
    const configureRealtime = async () => {
      try {
        console.log('Configuring Supabase Realtime connection...');
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Create a channel to test connection
        const channel = supabase.channel('connection-test');
        
        channel
          .on('system', { event: 'online' }, () => {
            console.log('Supabase Realtime connection established');
            setIsConnected(true);
            setConnectionError(null);
          })
          .on('system', { event: 'offline' }, () => {
            console.log('Supabase Realtime connection lost');
            setIsConnected(false);
            setConnectionError('Connection lost');
            toast.error('Lost connection to the server. Some features may not work properly.');
          })
          .subscribe((status) => {
            console.log('Supabase channel subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setConnectionError('Failed to connect to realtime service');
              toast.error('Connection error. Some features may not work properly.');
            }
          });

        return () => {
          console.log('Cleaning up Supabase Realtime connection');
          supabase.removeChannel(channel);
        };
      } catch (err: any) {
        console.error('Error setting up realtime:', err);
        setConnectionError(err.message);
        toast.error(`Failed to connect: ${err.message}`);
      }
    };

    configureRealtime();
  }, []);

  return (
    <RealtimeContext.Provider value={{ isConnected, connectionError }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default SupabaseRealtimeProvider;
