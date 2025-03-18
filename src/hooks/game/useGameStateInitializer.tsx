
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameState, Player } from '@/types/game';
import { GameSession } from '@/types/database';
import { Profile, GamePlayer } from '@/types/database';
import { createInitialGameState } from '@/utils/gameUtils';
import { toast } from 'sonner';

export function useGameStateInitializer(
  gameSession: GameSession | null,
  players: (GamePlayer & { profile: Profile })[],
  gameId: string
) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameSession || players.length === 0 || !gameId) return;

    const initializeGameState = async () => {
      setLoading(true);
      try {
        // Initialize or load game state
        if (!gameSession.game_state || Object.keys(gameSession.game_state).length === 0) {
          console.log('Initializing new game state');
          // New game, initialize state
          const initialState = createInitialGameState(players.length);
          
          // Update player names and colors
          const updatedPlayers = initialState.players.map((p, idx) => {
            const playerData = players.find((pd) => pd.player_number === idx);
            if (playerData) {
              return {
                ...p,
                name: playerData.profile.username,
                id: playerData.player_id // Use the actual player UUID
              } as Player; // Type assertion to Player
            }
            return p;
          });

          const newGameState: GameState = {
            ...initialState,
            players: updatedPlayers
          };

          setGameState(newGameState);
          
          // Save initial state to database
          // Convert complex objects to JSON-compatible format
          const jsonSafeGameState = JSON.parse(JSON.stringify(newGameState));
          
          const { error: updateError } = await supabase
            .from('game_sessions')
            .update({ 
              game_state: jsonSafeGameState 
            })
            .eq('id', gameId);
            
          if (updateError) {
            throw updateError;
          }
        } else {
          // Load existing game state
          console.log('Loading existing game state');
          const loadedState = gameSession.game_state as unknown as GameState;
          setGameState(loadedState);
        }
      } catch (error: any) {
        console.error('Error initializing game state:', error);
        setError(error);
        toast.error('Failed to initialize game state');
      } finally {
        setLoading(false);
      }
    };

    initializeGameState();
  }, [gameSession, players, gameId]);

  // Update gameState when gameSession changes (for real-time updates)
  useEffect(() => {
    if (gameSession?.game_state && Object.keys(gameSession.game_state).length > 0) {
      setGameState(gameSession.game_state as unknown as GameState);
    }
  }, [gameSession?.game_state]);

  return { gameState, setGameState, loading, error };
}
