
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
  const [retryCount, setRetryCount] = useState(0);
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);

  const configureRealtime = async () => {
    try {
      console.log('Configuring Supabase Realtime connection...');
      setSyncStatus('syncing');
      
      // Clean up any existing channel before creating a new one
      if (channel) {
        await supabase.removeChannel(channel);
      }
      
      // Create a channel with unique name based on user ID or timestamp to prevent conflicts
      const channelId = `connection-${user?.id || 'anonymous'}-${Date.now()}`;
      const newChannel = supabase.channel(channelId, {
        config: {
          presence: {
            key: user?.id || 'anonymous'
          }
        }
      });
      
      newChannel
        .on('system', { event: 'online' }, () => {
          console.log('Supabase Realtime connection established');
          setIsConnected(true);
          setConnectionError(null);
          setSyncStatus('synced');
          setRetryCount(0); // Reset retry counter on successful connection
        })
        .on('system', { event: 'offline' }, () => {
          console.log('Supabase Realtime connection lost');
          setIsConnected(false);
          setConnectionError('Connection lost');
          setSyncStatus('error');
          
          // Only show toast if we were previously connected to avoid spam
          if (isConnected) {
            toast.error('Lost connection to the server. Attempting to reconnect...', {
              id: 'connection-error', // Use ID to prevent duplicate toasts
            });
          }
        })
        .on('presence', { event: 'sync' }, () => {
          const state = newChannel.presenceState();
          console.log('Presence state synced:', state);
          setSyncStatus('synced');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          console.log('Supabase channel subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setSyncStatus('synced');
            
            // Track user presence if authenticated
            if (user) {
              try {
                await newChannel.track({
                  user_id: user.id,
                  online_at: new Date().toISOString(),
                  status: 'online'
                });
              } catch (presenceErr) {
                console.error('Error tracking presence:', presenceErr);
              }
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            setIsConnected(false);
            const errorMsg = status === 'CHANNEL_ERROR' 
              ? 'Failed to connect to realtime service' 
              : 'Connection closed';
            setConnectionError(errorMsg);
            setSyncStatus('error');
            
            // Implement exponential backoff for reconnection
            if (retryCount < 5) {
              const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
              console.log(`Will attempt to reconnect in ${retryDelay/1000} seconds`);
              
              setTimeout(() => {
                setRetryCount(prevCount => prevCount + 1);
                reconnect();
              }, retryDelay);
            } else {
              toast.error('Connection error. Please refresh the page.', {
                id: 'connection-error',
                duration: 5000,
              });
            }
          }
        });

      setChannel(newChannel);
      return newChannel;
    } catch (err: any) {
      console.error('Error setting up realtime:', err);
      setConnectionError(err.message);
      setSyncStatus('error');
      toast.error(`Failed to connect: ${err.message}`, {
        id: 'connection-error',
      });
      return null;
    }
  };

  // Set up realtime connection when user or session changes
  useEffect(() => {
    let mounted = true;
    
    const setup = async () => {
      if (!mounted) return;
      
      try {
        const newChannel = await configureRealtime();
        if (mounted && newChannel) {
          setChannel(newChannel);
        }
      } catch (err) {
        console.error('Error during realtime setup:', err);
      }
    };
    
    // Reset connection state when user changes
    setIsConnected(false);
    setConnectionError(null);
    setSyncStatus('syncing');
    setRetryCount(0);
    
    setup();
    
    return () => {
      mounted = false;
      if (channel) {
        console.log('Cleaning up Supabase Realtime connection');
        supabase.removeChannel(channel).catch(err => {
          console.error('Error removing channel:', err);
        });
      }
    };
  }, [user?.id, session?.access_token]); // Reconnect when user or access token changes

  // Function to manually reconnect
  const reconnect = async () => {
    try {
      await configureRealtime();
    } catch (err) {
      console.error('Error during manual reconnection:', err);
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
