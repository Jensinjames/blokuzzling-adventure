
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
      console.log('Updating game state for session:', gameId);
      
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

      // Check if the game is finished and handle saving game history and profile stats
      const isGameFinished = newState.gameStatus === 'finished';
      const winnerId = isGameFinished && newState.winner !== null ? 
        newState.players[newState.winner].id : null;
      
      // Update the game session with the new state
      const { error } = await supabase
        .from('game_sessions')
        .update({
          game_state: safeGameState,
          turn_history: safeGameState.turnHistory,
          status: isGameFinished ? 'completed' : 'active',
          winner_id: winnerId
        })
        .eq('id', gameId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Game state updated successfully');
      
      // Update profile stats if the game is finished
      if (isGameFinished && user) {
        await updateProfileStats(newState, user.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating game state:', error);
      toast.error('Failed to update game state');
      return false;
    }
  };

  // Helper function to update profile stats based on game result
  const updateProfileStats = async (gameState: GameState, userId: string) => {
    if (!gameState.players || gameState.gameStatus !== 'finished') return;
    
    try {
      console.log('Updating profile stats for user:', userId);
      
      // Find the player index in the game
      const playerIndex = gameState.players.findIndex(p => {
        // Safely handle different types of IDs with proper null/undefined checks
        if (p.id === undefined || p.id === null) return false;
        
        // Convert both IDs to strings for comparison
        const playerId = String(p.id);
        const currentUserId = String(userId);
        
        return playerId === currentUserId;
      });
      
      if (playerIndex === -1) {
        console.log('Player not found in game state, cannot update stats');
        return;
      }
      
      console.log('Found player at index:', playerIndex, 'Winner:', gameState.winner);
      
      // Get current profile
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('wins, losses, draws')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching profile stats:', fetchError);
        return;
      }
      
      // Determine what to update based on the game result
      let updateObj: {wins?: number, losses?: number, draws?: number} = {};
      
      if (gameState.winner === playerIndex) {
        updateObj.wins = (data.wins || 0) + 1;
        console.log('Updating wins for player', playerIndex);
      } else if (gameState.winner === null) {
        updateObj.draws = (data.draws || 0) + 1;
        console.log('Updating draws for player', playerIndex);
      } else {
        updateObj.losses = (data.losses || 0) + 1;
        console.log('Updating losses for player', playerIndex);
      }
      
      // Update profile stats
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateObj)
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating profile stats:', updateError);
        toast.error('Failed to update profile statistics');
      } else {
        console.log('Successfully updated profile stats with:', updateObj);
        toast.success('Game results saved to your profile');
      }
    } catch (e) {
      console.error('Error in updateProfileStats:', e);
    }
  };

  return { updateGameState };
}
