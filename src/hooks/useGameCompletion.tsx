
import { useEffect } from 'react';
import { toast } from 'sonner';
import { GameState } from '@/types/game';
import { checkGameOver, determineWinner } from '@/utils/gameStateUtils';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Calculate scores based on remaining pieces
const calculateFinalScore = (players: GameState['players']): GameState['players'] => {
  return players.map(player => {
    const unusedPieces = player.pieces.filter(p => !p.used);
    // Calculate remaining cell count
    let remainingCellCount = 0;
    for (const piece of unusedPieces) {
      if (piece.shape) {
        remainingCellCount += piece.shape.flat().filter(cell => cell === 1).length;
      }
    }
    
    return {
      ...player,
      score: 89 - remainingCellCount // 89 is the total number of cells across all pieces
    };
  });
};

export function useGameCompletion(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && checkGameOver(gameState)) {
      console.log("Game over detected, calculating final scores");
      
      // Calculate scores for all players based on their pieces
      const updatedPlayers = calculateFinalScore(gameState.players);
      
      const winner = determineWinner(updatedPlayers);
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gameStatus: 'finished',
        winner
      }));
      
      // Show notification
      toast(`Game Over! ${winner !== null ? `Player ${winner + 1} wins!` : 'It\'s a tie!'}`);
      
      // Update profile statistics if we have a user
      if (user) {
        updateProfileStats(winner, gameState);
      }
    }
  }, [gameState, setGameState, user]);
  
  // Update profile stats based on game result
  const updateProfileStats = async (winner: number | null, gameState: GameState) => {
    if (!user) return;
    
    try {
      console.log("Updating profile stats for user:", user.id);
      
      // Get current profile
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('wins, losses, draws')
        .eq('id', user.id)
        .single();
      
      if (fetchError || !data) {
        console.error('Error fetching profile stats:', fetchError);
        return;
      }
      
      const profileData = safeSingleDataCast<{wins: number, losses: number, draws: number}>(data);
      
      // Determine what to update
      const playerIndex = gameState.players.findIndex(p => {
        return p.id && (p.id.toString() === user.id.toString());
      });
      
      console.log("Player index in game:", playerIndex, "Winner:", winner);
      
      if (playerIndex >= 0) {
        let updateObj: {wins?: number, losses?: number, draws?: number} = {};
        
        if (winner === playerIndex) {
          updateObj.wins = (profileData.wins || 0) + 1;
          console.log("Updating wins to:", updateObj.wins);
        } else if (winner === null) {
          updateObj.draws = (profileData.draws || 0) + 1;
          console.log("Updating draws to:", updateObj.draws);
        } else {
          updateObj.losses = (profileData.losses || 0) + 1;
          console.log("Updating losses to:", updateObj.losses);
        }
        
        // Update profile stats
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateObj)
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating profile stats:', updateError);
        } else {
          console.log("Successfully updated profile stats");
        }
      }
    } catch (e) {
      console.error('Error in updateProfileStats:', e);
    }
  };
}
