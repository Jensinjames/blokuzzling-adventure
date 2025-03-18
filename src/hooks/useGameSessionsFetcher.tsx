
import { supabase, safeDataCast } from '@/integrations/supabase/client';
import { GameSession } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useState, useCallback } from 'react';

/**
 * Hook that fetches game sessions from the database
 */
export function useGameSessionsFetcher(
  setActiveSessions: (sessions: GameSession[]) => void,
  setUserSessions: (sessions: GameSession[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
) {
  const { user, subscription } = useAuth();
  const [limitReached, setLimitReached] = useState(false);

  const fetchGameSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active sessions
      const { data: activeSessionsData, error: activeSessionsError } = await supabase
        .from('game_sessions')
        .select(`
          *,
          creator:profiles!game_sessions_creator_id_fkey(username, avatar_url, id)
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (activeSessionsError) throw activeSessionsError;

      const activeSessionsWithCreator = safeDataCast<GameSession>(activeSessionsData);
      setActiveSessions(activeSessionsWithCreator);

      // Only fetch user sessions if user is authenticated
      if (user) {
        // Apply subscription limits if needed
        const sessionsLimit = subscription?.tier === 'premium' ? 
          100 : subscription?.tier === 'basic' ? 
          10 : 5; // Default limit for free users

        const { data: userSessionsData, error: userSessionsError } = await supabase
          .from('game_sessions')
          .select(`
            *,
            creator:profiles!game_sessions_creator_id_fkey(username, avatar_url, id)
          `)
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })
          .limit(sessionsLimit);

        if (userSessionsError) throw userSessionsError;

        const countQuery = await supabase
          .from('game_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', user.id);
        
        setLimitReached(countQuery.count !== null && countQuery.count > sessionsLimit);

        const userSessionsWithCreator = safeDataCast<GameSession>(userSessionsData);
        setUserSessions(userSessionsWithCreator);
      } else {
        setUserSessions([]);
      }
    } catch (error) {
      console.error('Error fetching game sessions:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [user, setActiveSessions, setUserSessions, setLoading, setError, subscription?.tier]);

  return {
    fetchGameSessions,
    limitReached
  };
}
