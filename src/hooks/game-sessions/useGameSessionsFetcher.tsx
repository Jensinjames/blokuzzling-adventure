
import { useEffect } from 'react';
import { supabase, safeDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

/**
 * Fetches game sessions data from Supabase
 */
export function useGameSessionsFetcher(
  setActiveSessions: (sessions: GameSession[]) => void,
  setUserSessions: (sessions: GameSession[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
) {
  const { user } = useAuth();

  // Function to fetch game sessions with proper error handling
  const fetchGameSessions = async () => {
    if (!user) {
      setActiveSessions([]);
      setUserSessions([]);
      setLoading(false);
      return;
    }

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

  return { fetchGameSessions };
}
