
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
        
        // Fetch active sessions with creator profiles
        const { data: activeSessionsData, error: activeError } = await supabase
          .from('game_sessions')
          .select('*, creator:profiles!creator_id(username, avatar_url)')
          .eq('status', 'waiting')
          .order('created_at', { ascending: false });

        if (activeError) {
          throw activeError;
        }

        // Fetch user's created sessions with extended information
        const { data: createdGames, error: createdGamesError } = await supabase
          .from('game_sessions')
          .select('*, creator:profiles!creator_id(username, avatar_url)')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
          
        if (createdGamesError) {
          throw createdGamesError;
        }

        // Fetch games where the user is a participant
        const { data: participatedData, error: participatedError } = await supabase
          .from('game_players')
          .select('game_id')
          .eq('player_id', user.id);
          
        if (participatedError) {
          throw participatedError;
        }
        
        // Get unique participant game IDs
        const participantGameIds = participatedData
          ? participatedData.map(player => player.game_id)
          : [];
        
        // Fetch the games user is participating in but not creating
        let participantGames: GameSession[] = [];
        if (participantGameIds.length > 0) {
          const { data: participantGamesData, error: participantGamesError } = await supabase
            .from('game_sessions')
            .select('*, creator:profiles!creator_id(username, avatar_url)')
            .in('id', participantGameIds)
            .neq('creator_id', user.id)
            .order('created_at', { ascending: false });
            
          if (participantGamesError) {
            throw participantGamesError;
          }
          
          if (participantGamesData) {
            participantGames = safeDataCast<GameSession>(participantGamesData);
          }
        }

        // Combine creator games and participant games for user sessions
        const allUserSessions = [
          ...safeDataCast<GameSession>(createdGames || []),
          ...participantGames
        ];

        // Set state with typechecked data
        setActiveSessions(safeDataCast<GameSession>(activeSessionsData || []));
        setUserSessions(allUserSessions);
        
        console.log('Fetched sessions:', {
          active: activeSessionsData?.length || 0,
          created: createdGames?.length || 0,
          participating: participantGames.length,
          total_user: allUserSessions.length
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
  }, [user]);

  // Function to manually refresh game sessions
  const refreshSessions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch active sessions
      const { data: activeSessionsData, error: activeError } = await supabase
        .from('game_sessions')
        .select('*, creator:profiles!creator_id(username, avatar_url)')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Fetch user's created sessions
      const { data: userSessionsData, error: userError } = await supabase
        .from('game_sessions')
        .select('*, creator:profiles!creator_id(username, avatar_url)')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      setActiveSessions(safeDataCast<GameSession>(activeSessionsData || []));
      setUserSessions(safeDataCast<GameSession>(userSessionsData || []));
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
