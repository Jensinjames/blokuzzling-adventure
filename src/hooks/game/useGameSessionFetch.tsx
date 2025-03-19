
import { useState, useEffect, useRef } from 'react';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession } from '@/types/database';
import { toast } from 'sonner';

export function useGameSessionFetch(gameId: string) {
  const { user } = useAuth();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const gameChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user || !gameId) return;

    const fetchGameSession = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchGameSession();
    
    // Clean up previous channel if it exists
    if (gameChannelRef.current) {
      supabase.removeChannel(gameChannelRef.current);
      gameChannelRef.current = null;
    }
    
    // Create a unique channel name to prevent conflicts
    const channelName = `game-session-${gameId}-${user.id}-${Date.now()}`;
    
    // Subscribe to game session changes
    const gameChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Game session updated:', payload);
          if (payload.new && 'id' in payload.new) {
            const newSession = payload.new as unknown as GameSession;
            setGameSession(newSession);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Game session channel status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to game session updates');
        }
      });
    
    gameChannelRef.current = gameChannel;

    return () => {
      if (gameChannelRef.current) {
        console.log(`Cleaning up game session channel for ${gameId}`);
        supabase.removeChannel(gameChannelRef.current);
        gameChannelRef.current = null;
      }
    };
  }, [gameId, user]);

  return { gameSession, setGameSession, loading, error };
}
