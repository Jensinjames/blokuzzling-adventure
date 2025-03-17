
import { useState, useEffect } from 'react';
import { supabase, safeDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';

export function useGameSessionsFetch() {
  const { user } = useAuth();
  const [activeSessions, setActiveSessions] = useState<GameSession[]>([]);
  const [userSessions, setUserSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch game sessions
  useEffect(() => {
    if (!user) return;

    const fetchGameSessions = async () => {
      try {
        // Fetch active sessions
        const { data: activeSessionsData, error: activeError } = await supabase
          .from('game_sessions')
          .select('*')
          .ilike('status', 'waiting')
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
      } catch (error) {
        console.error('Error fetching game sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameSessions();

    // Subscribe to game sessions
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
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
    };
  }, [user]);

  return {
    activeSessions,
    userSessions,
    loading
  };
}
