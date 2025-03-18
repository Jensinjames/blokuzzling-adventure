
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { GameState } from '@/types/game';
import { toast } from 'sonner';

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
      // Create a clean copy of the state to avoid circular references
      // Explicitly extract only the needed properties
      const safeGameState = {
        board: newState.board.map(row => 
          row.map(cell => ({ 
            player: cell.player,
            powerup: cell.powerup
          }))
        ),
        currentPlayer: newState.currentPlayer,
        players: newState.players.map(player => ({
          id: player.id,
          name: player.name,
          color: player.color,
          score: player.score,
          isAI: player.isAI,
          aiDifficulty: player.aiDifficulty,
          pieces: player.pieces.map(piece => ({
            id: piece.id,
            shape: piece.shape,
            size: piece.size,
            used: piece.used
          })),
          powerups: player.powerups
        })),
        gameOver: newState.gameOver,
        winningPlayers: newState.winningPlayers,
        turnHistory: [...(gameState?.turnHistory || []), {
          player: playerNumber,
          timestamp: Date.now(),
          action: 'move'
        }]
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
