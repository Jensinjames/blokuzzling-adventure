
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameState, TurnHistoryItem, Move } from '@/types/game';
import { toast } from 'sonner';

export function useGameStateManager(
  gameId: string,
  gameState: GameState | null,
  playerNumber: number | null,
  gameSessionId?: string
) {
  const { user } = useAuth();
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Check if it's the current player's turn
  useEffect(() => {
    if (gameState && playerNumber !== null) {
      setIsMyTurn(gameState.currentPlayer === playerNumber);
    }
  }, [gameState, playerNumber]);

  // Update game state
  const updateGameState = async (newState: GameState) => {
    if (!user || !gameId || playerNumber === null || !isMyTurn) {
      return false;
    }

    try {
      // Convert complex objects to JSON-compatible format
      const jsonSafeGameState = JSON.parse(JSON.stringify(newState));
      
      // Add to turn history
      const newHistoryItem = {
        player: playerNumber,
        timestamp: Date.now(),
        action: 'move'
      };
      
      const jsonSafeTurnHistory = JSON.parse(
        JSON.stringify([...(gameState?.turnHistory || []), newHistoryItem])
      );

      // Update the game session with the new state
      const { error } = await supabase
        .from('game_sessions')
        .update({
          game_state: jsonSafeGameState,
          turn_history: jsonSafeTurnHistory
        } as any) // Type assertion to bypass strict checking
        .eq('id', gameId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating game state:', error);
      toast.error('Failed to update game state');
      return false;
    }
  };

  // Make a move
  const makeMove = async (type: 'place' | 'pass', piece?: string, position?: any) => {
    if (!user || !gameId || playerNumber === null || !isMyTurn || !gameState) {
      return false;
    }

    try {
      // Create a new move
      const move: Move = {
        type,
        piece,
        position,
        timestamp: Date.now()
      };

      // Add to history
      const historyItem: TurnHistoryItem = {
        type,
        player: playerNumber,
        piece,
        position,
        timestamp: Date.now()
      };

      // Update player's move history
      const updatedPlayers = [...gameState.players];
      updatedPlayers[playerNumber].moveHistory.push(move);

      // Update game state
      const updatedGameState = {
        ...gameState,
        players: updatedPlayers,
        turnHistory: [...gameState.turnHistory, historyItem],
        currentPlayer: (gameState.currentPlayer + 1) % gameState.players.length
      };

      await updateGameState(updatedGameState);
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Failed to make move');
      return false;
    }
  };

  return {
    isMyTurn,
    updateGameState,
    makeMove
  };
}
