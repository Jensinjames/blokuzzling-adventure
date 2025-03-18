
import { useAuth } from '@/hooks/useAuth';
import { supabase, safeDataCast } from '@/integrations/supabase/client';
import { GameSession } from '@/types/database';

/**
 * Provides functionality to manually refresh game sessions
 */
export function useGameSessionsRefresher(
  setActiveSessions: (sessions: GameSession[]) => void,
  setUserSessions: (sessions: GameSession[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
) {
  const { user } = useAuth();

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

  return { refreshSessions };
}
