
import { useState, useEffect } from 'react';
import { supabase, safeDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

export function useGameSessionsFetch() {
  const { user } = useAuth();
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [userSessions, setUserSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch game sessions with proper error handling
  useEffect(() => {
    if (!user) {
      setActiveSessions([]);
      setUserSessions([]);
      setLoading(false);
      return;
    }

    const fetchGameSessions = async () => {
      try {
        setLoading(true);
        
        // Fetch active sessions
        const { data: activeSessionsData, error: activeError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('status', 'waiting')
          .order('created_at', { ascending: false });

        if (activeError) {
          throw activeError;
        }

        // Fetch user's sessions (both as creator and participant)
        const [creatorResult, participantResult] = await Promise.all([
          // Sessions created by the user
          supabase
            .from('game_sessions')
            .select('*')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false }),
          
          // Sessions where the user is a participant
          supabase
            .from('game_players')
            .select('game_id')
            .eq('player_id', user.id)
        ]);

        if (creatorResult.error) {
          throw creatorResult.error;
        }

        if (participantResult.error) {
          throw participantResult.error;
        }

        // Get unique game IDs where user is a participant but not the creator
        const participantGameIds = participantResult.data
          .map(player => player.game_id)
          .filter(gameId => 
            !creatorResult.data.some(session => session.id === gameId)
          );

        // Fetch those games if there are any
        let participantGames: GameSession[] = [];
        if (participantGameIds.length > 0) {
          const { data: participantGamesData, error: participantError } = await supabase
            .from('game_sessions')
            .select('*')
            .in('id', participantGameIds)
            .order('created_at', { ascending: false });
            
          if (participantError) {
            throw participantError;
          }
          
          participantGames = safeDataCast<GameSession>(participantGamesData);
        }

        // Combine creator games and participant games for user sessions
        const allUserSessions = [
          ...safeDataCast<GameSession>(creatorResult.data),
          ...participantGames
        ];

        // Set state with typechecked data
        setActiveSessions(safeDataCast<GameSession>(activeSessionsData));
        setUserSessions(allUserSessions);
        
        console.log('Fetched sessions:', {
          active: activeSessionsData?.length || 0,
          user: allUserSessions.length
        });
      } catch (error: any) {
        console.error('Error fetching game sessions:', error);
        setError(error);
        toast.error(`Failed to load games: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGameSessions();

    // Subscribe to game sessions changes for real-time updates
    const sessionsChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        (payload) => {
          if (payload.new && 'id' in payload.new) {
            // Refresh sessions when there's a change
            fetchGameSessions();
          }
        }
      )
      .subscribe((status) => {
        console.log('Game sessions subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          toast.error('Lost connection to game server. Trying to reconnect...');
        }
      });

    // Also subscribe to game_players table to detect when the user is added/removed from games
    const playersChannel = supabase
      .channel('schema-db-players-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `player_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh sessions when the user's game participation changes
          fetchGameSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [user]);

  // Function to manually refresh game sessions
  const refreshSessions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch active sessions
      const { data: activeSessionsData, error: activeError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Fetch user's sessions
      const { data: userSessionsData, error: userError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      setActiveSessions(safeDataCast<GameSession>(activeSessionsData));
      setUserSessions(safeDataCast<GameSession>(userSessionsData));
    } catch (error: any) {
      console.error('Error refreshing game sessions:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeSessions,
    userSessions,
    loading,
    error,
    refreshSessions
  };
}
