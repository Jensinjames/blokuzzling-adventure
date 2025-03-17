
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameSession, GamePlayer, Profile } from '@/types/database';
import { GameState } from '@/types/game';
import { toast } from 'sonner';
import { createInitialGameState } from '@/utils/gameUtils';

export function useGameData(gameId: string) {
  const { user } = useAuth();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<(GamePlayer & { profile: Profile })[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);

  // Load game data
  useEffect(() => {
    if (!user || !gameId) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        // Fetch game session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', gameId)
          .single();

        if (sessionError) throw sessionError;

        // Fetch players with profiles
        const { data: playersData, error: playersError } = await supabase
          .from('game_players')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('game_id', gameId)
          .order('player_number', { ascending: true });

        if (playersError) throw playersError;

        setGameSession(sessionData as GameSession);
        setPlayers(playersData as any);

        // Find current player's number
        const currentPlayer = playersData.find((p: GamePlayer) => p.player_id === user.id);
        if (currentPlayer) {
          setPlayerNumber(currentPlayer.player_number);
        }

        // Initialize or load game state
        if (sessionData.game_state && Object.keys(sessionData.game_state).length === 0) {
          // New game, initialize state
          const initialState = createInitialGameState(playersData.length);
          
          // Update player names and colors
          const updatedPlayers = initialState.players.map((p, idx) => {
            const playerData = playersData.find((pd: any) => pd.player_number === idx);
            if (playerData) {
              return {
                ...p,
                name: playerData.profile.username,
                id: idx
              };
            }
            return p;
          });

          const newGameState = {
            ...initialState,
            players: updatedPlayers
          };

          setGameState(newGameState);
          
          // Save initial state to database - need to handle JSON serialization
          await supabase
            .from('game_sessions')
            .update({
              game_state: newGameState as any
            })
            .eq('id', gameId);
        } else {
          // Load existing game state
          const loadedState = sessionData.game_state as unknown as GameState;
          setGameState(loadedState);
        }

      } catch (error) {
        console.error('Error fetching game data:', error);
        toast.error('Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();

    // Subscribe to game state changes
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
            setGameSession(payload.new as GameSession);
            setGameState(payload.new.game_state as unknown as GameState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, user]);

  return {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber
  };
}
