
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Context to track the realtime connection status
type RealtimeContextType = {
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
};

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  connectionError: null,
  reconnect: () => {}
});

export const useRealtimeStatus = () => useContext(RealtimeContext);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const SupabaseRealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const setupChannel = () => {
    if (channelRef.current) {
      console.log('[Realtime Provider] Removing existing channel before creating a new one');
      supabase.removeChannel(channelRef.current);
    }

    console.log('[Realtime Provider] Setting up new channel');
    const channel = supabase.channel('connection-test', {
      config: {
        broadcast: { self: true },
      }
    });
    
    channel
      .on('system', { event: 'online' }, () => {
        console.log('[Realtime Provider] Supabase Realtime connection established');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      })
      .on('system', { event: 'offline' }, () => {
        console.log('[Realtime Provider] Supabase Realtime connection lost');
        setIsConnected(false);
        setConnectionError('Connection lost');
        
        if (!connectionError) {
          toast.error('Lost connection to the server. Some features may not work properly.');
        }
      })
      .subscribe((status) => {
        console.log('[Realtime Provider] Supabase channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionError('Failed to connect to realtime service');
          
          if (!connectionError) {
            toast.error('Connection error. Some features may not work properly.');
          }
        }
      });

    channelRef.current = channel;
    return channel;
  };

  const reconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('[Realtime Provider] Maximum reconnect attempts reached');
      toast.error('Could not reconnect after multiple attempts. Please refresh the page.');
      return;
    }

    reconnectAttempts.current += 1;
    console.log(`[Realtime Provider] Attempting to reconnect (attempt ${reconnectAttempts.current})`);
    toast.info('Attempting to reconnect...');
    
    setupChannel();
  };

  useEffect(() => {
    console.log('[Realtime Provider] Initializing');
    
    const channel = setupChannel();

    return () => {
      console.log('[Realtime Provider] Cleaning up Supabase Realtime connection');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ isConnected, connectionError, reconnect }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default SupabaseRealtimeProvider;
