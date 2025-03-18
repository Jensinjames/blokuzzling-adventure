
import { useState, useEffect } from 'react';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

export function useGameSessionFetch(gameId: string) {
  const { user } = useAuth();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !gameId) return;

    const fetchGameSession = async () => {
      try {
        // Fetch game session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', gameId)
          .single();

        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData) {
          throw new Error("Game session not found");
        }
        
        // Safely cast to GameSession
        const typedSessionData = safeSingleDataCast<GameSession>(sessionData);
        setGameSession(typedSessionData);
      } catch (error: any) {
        console.error('Error fetching game session:', error);
        setError(error);
      }
    };

    fetchGameSession();
    
    // Subscribe to game session changes
    const gameChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          if (payload.new && 'id' in payload.new) {
            const newSession = payload.new as unknown as GameSession;
            setGameSession(newSession);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, user]);

  return { gameSession, setGameSession, loading, error };
}
