
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sets up real-time subscriptions for game session changes
 */
export function useGameSessionsSubscription(fetchGameSessions: () => Promise<void>) {
  const { user } = useAuth();
  const sessionsChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const playersChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Clean up any existing channels first
    const cleanup = () => {
      if (sessionsChannelRef.current) {
        console.log('Cleaning up sessions channel subscription');
        supabase.removeChannel(sessionsChannelRef.current);
        sessionsChannelRef.current = null;
      }
      
      if (playersChannelRef.current) {
        console.log('Cleaning up players channel subscription');
        supabase.removeChannel(playersChannelRef.current);
        playersChannelRef.current = null;
      }
    };
    
    cleanup();

    // Create unique channel names with user ID and timestamp to prevent conflicts
    const sessionsChannelName = `game-sessions-changes-${user.id}-${Date.now()}`;
    const playersChannelName = `game-players-changes-${user.id}-${Date.now()}`;

    // Subscribe to game sessions changes for real-time updates
    const sessionsChannel = supabase
      .channel(sessionsChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        (payload) => {
          console.log('Game session change detected:', payload);
          fetchGameSessions();
        }
      )
      .subscribe((status) => {
        console.log(`Sessions channel subscription status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to game sessions changes');
        }
      });
    
    sessionsChannelRef.current = sessionsChannel;

    // Also subscribe to game_players table to detect when user is added/removed from games
    const playersChannel = supabase
      .channel(playersChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Game player change detected:', payload);
          fetchGameSessions();
        }
      )
      .subscribe((status) => {
        console.log(`Players channel subscription status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to game players changes');
        }
      });
    
    playersChannelRef.current = playersChannel;

    return cleanup;
  }, [user, fetchGameSessions]);
}
