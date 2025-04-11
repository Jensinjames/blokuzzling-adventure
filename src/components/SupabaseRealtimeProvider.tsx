
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timeouts and intervals
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
  }, []);

  const setupChannel = useCallback(() => {
    if (channelRef.current) {
      console.log('[Realtime Provider] Removing existing channel before creating a new one');
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('[Realtime Provider] Error removing channel:', error);
      }
      channelRef.current = null;
    }

    console.log('[Realtime Provider] Setting up new channel');
    try {
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
          clearTimers();
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
    } catch (error) {
      console.error('[Realtime Provider] Error setting up channel:', error);
      setConnectionError('Error creating connection channel');
      return null;
    }
  }, [connectionError, clearTimers]);

  const reconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('[Realtime Provider] Maximum reconnect attempts reached');
      toast.error('Could not reconnect after multiple attempts. Please refresh the page.');
      return;
    }

    // Clear any existing timeout
    clearTimers();

    reconnectAttempts.current += 1;
    console.log(`[Realtime Provider] Attempting to reconnect (attempt ${reconnectAttempts.current})`);
    toast.info('Attempting to reconnect...');
    
    setupChannel();
    
    // Set up periodic connection check
    connectionCheckIntervalRef.current = setInterval(() => {
      if (!isConnected && reconnectAttempts.current < maxReconnectAttempts) {
        console.log('[Realtime Provider] Periodic connection check failed, attempting reconnect');
        reconnect();
      } else if (isConnected) {
        clearTimers();
      }
    }, 30000); // Check every 30 seconds
  }, [isConnected, setupChannel, clearTimers]);

  useEffect(() => {
    console.log('[Realtime Provider] Initializing');
    
    const channel = setupChannel();

    // Set up connection check with fallback
    connectionCheckIntervalRef.current = setInterval(() => {
      if (!isConnected && channelRef.current && reconnectAttempts.current < maxReconnectAttempts) {
        console.log('[Realtime Provider] Connection check: Not connected, attempting reconnect');
        reconnect();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      console.log('[Realtime Provider] Cleaning up Supabase Realtime connection');
      clearTimers();
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('[Realtime Provider] Error removing channel during cleanup:', error);
        }
        channelRef.current = null;
      }
    };
  }, [setupChannel, reconnect, isConnected, clearTimers]);

  return (
    <RealtimeContext.Provider value={{ isConnected, connectionError, reconnect }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default SupabaseRealtimeProvider;
