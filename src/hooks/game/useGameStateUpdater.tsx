
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { GameState } from '@/types/game';
import { toast } from 'sonner';
import { createSafePieceCopy } from '@/utils/pieceUtils';

export function useGameStateUpdater(
  gameId: string,
  playerNumber: number | null
) {
  const { user } = useAuth();

  // Update game state
  const updateGameState = async (newState: GameState, gameState: GameState | null) => {
    if (!user || !gameId || playerNumber === null) {
      return false;
    }

    try {
      // Compare versions to avoid unnecessary updates
      const currentVersion = gameState?.version || 0;
      const newVersion = currentVersion + 1;
      
      // Create a clean and efficient copy of the state to avoid circular references
      const safeGameState = {
        // Board with minimal properties
        board: newState.board.map(row => 
          row.map(cell => ({ 
            player: cell.player,
            hasPowerup: cell.hasPowerup,
            powerupType: cell.powerupType,
            pieceId: cell.pieceId
          }))
        ),
        currentPlayer: newState.currentPlayer,
        // Players with safe piece copies
        players: newState.players.map(player => ({
          id: player.id,
          name: player.name,
          color: player.color,
          score: player.score,
          isAI: player.isAI,
          aiDifficulty: player.aiDifficulty,
          pieces: player.pieces.map(piece => createSafePieceCopy(piece)),
          powerups: player.powerups
        })),
        gameStatus: newState.gameStatus,
        winner: newState.winner,
        turnHistory: [...(gameState?.turnHistory || []), {
          player: playerNumber,
          timestamp: Date.now(),
          action: 'move',
          type: 'place'
        }],
        version: newVersion,
        lastUpdate: Date.now()
      };

      // Update the game session with the new state
      const { error } = await supabase
        .from('game_sessions')
        .update({
          game_state: safeGameState,
          turn_history: safeGameState.turnHistory
        })
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

  return { updateGameState };
}
