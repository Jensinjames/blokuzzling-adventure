
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
    if (!gameSession || !gameId) return;

    const initializeGameState = async () => {
      setLoading(true);
      try {
        // Initialize or load game state
        if (!gameSession.game_state || Object.keys(gameSession.game_state).length === 0) {
          console.log('Initializing new game state');
          // New game, initialize state

          // Count the total players (human + AI)
          const totalPlayers = players.length;
          const aiCount = gameSession.ai_count || 0;
          const aiEnabled = gameSession.ai_enabled || false;
          const aiDifficulty = gameSession.ai_difficulty || 'medium';
          
          console.log('Game setup:', { 
            totalPlayers, 
            humanPlayers: players.length, 
            aiEnabled, 
            aiCount, 
            aiDifficulty 
          });
          
          // Create initial state with the correct number of players
          const initialState = createInitialGameState(
            aiEnabled ? players.length + aiCount : players.length
          );
          
          // Make a safe copy to avoid circular references
          const safeState = structuredClone(initialState);
          
          // Update player names and colors
          const updatedPlayers = safeState.players.map((p, idx) => {
            // For human players
            if (idx < players.length) {
              const playerData = players.find((pd) => pd.player_number === idx);
              if (playerData) {
                return {
                  ...p,
                  name: playerData.profile.username,
                  id: playerData.player_id // Use the actual player UUID
                } as Player;
              }
              return p;
            } 
            // For AI players
            else if (aiEnabled && idx >= players.length && idx < players.length + aiCount) {
              return {
                ...p,
                name: `AI Player ${idx - players.length + 1}`,
                isAI: true,
                aiDifficulty: aiDifficulty
              } as Player;
            }
            return p;
          });

          const newGameState: GameState = {
            ...safeState,
            players: updatedPlayers
          };

          setGameState(newGameState);
          
          // Save initial state to database - ensure we don't have circular references
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
          console.log('Loading existing game state:', gameSession.game_state);
          // Parse safely to avoid any circular references
          const loadedState = JSON.parse(JSON.stringify(gameSession.game_state)) as GameState;
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
      console.log('Received updated game state from server');
      // Parse safely to avoid any circular references
      const updatedState = JSON.parse(JSON.stringify(gameSession.game_state)) as GameState;
      setGameState(updatedState);
    }
  }, [gameSession?.game_state]);

  return { gameState, setGameState, loading, error };
}
