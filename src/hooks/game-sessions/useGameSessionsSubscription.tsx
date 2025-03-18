
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sets up real-time subscriptions for game session changes
 */
export function useGameSessionsSubscription(fetchGameSessions: () => Promise<void>) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to game sessions changes for real-time updates
    const sessionsChannel = supabase
      .channel('game-sessions-changes')
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
      .subscribe();

    // Also subscribe to game_players table to detect when user is added/removed from games
    const playersChannel = supabase
      .channel('game-players-changes')
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
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [user, fetchGameSessions]);
}
