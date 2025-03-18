
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';

// Context to track the realtime connection status
type RealtimeContextType = {
  isConnected: boolean;
  connectionError: string | null;
  syncStatus: 'synced' | 'syncing' | 'error';
  reconnect: () => Promise<void>;
};

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  connectionError: null,
  syncStatus: 'syncing',
  reconnect: async () => {}
});

export const useRealtimeStatus = () => useContext(RealtimeContext);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const SupabaseRealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');
  const { user, session } = useAuth();

  const configureRealtime = async () => {
    try {
      console.log('Configuring Supabase Realtime connection...');
      setSyncStatus('syncing');
      
      // Create a channel to test connection
      const channel = supabase.channel('connection-test', {
        config: {
          presence: {
            key: user?.id || 'anonymous'
          }
        }
      });
      
      channel
        .on('system', { event: 'online' }, () => {
          console.log('Supabase Realtime connection established');
          setIsConnected(true);
          setConnectionError(null);
          setSyncStatus('synced');
        })
        .on('system', { event: 'offline' }, () => {
          console.log('Supabase Realtime connection lost');
          setIsConnected(false);
          setConnectionError('Connection lost');
          setSyncStatus('error');
          toast.error('Lost connection to the server. Some features may not work properly.');
        })
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          console.log('Presence state synced:', state);
          setSyncStatus('synced');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe((status) => {
          console.log('Supabase channel subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setSyncStatus('synced');
            
            // Track user presence if authenticated
            if (user) {
              channel.track({
                user_id: user.id,
                online_at: new Date().toISOString(),
                status: 'online'
              });
            }
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            setConnectionError('Failed to connect to realtime service');
            setSyncStatus('error');
            toast.error('Connection error. Some features may not work properly.');
          }
        });

      return channel;
    } catch (err: any) {
      console.error('Error setting up realtime:', err);
      setConnectionError(err.message);
      setSyncStatus('error');
      toast.error(`Failed to connect: ${err.message}`);
      return null;
    }
  };

  // Set up realtime connection
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const setup = async () => {
      channel = await configureRealtime();
    };
    
    setup();
    
    return () => {
      if (channel) {
        console.log('Cleaning up Supabase Realtime connection');
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]); // Reconnect when user changes

  // Function to manually reconnect
  const reconnect = async () => {
    if (connectionError) {
      await configureRealtime();
    }
  };

  return (
    <RealtimeContext.Provider value={{ 
      isConnected, 
      connectionError, 
      syncStatus,
      reconnect
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default SupabaseRealtimeProvider;
