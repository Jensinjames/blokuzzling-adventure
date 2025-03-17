
import { useEffect } from 'react';
import { toast } from 'sonner';
import { GameState } from '@/types/game';
import { checkGameOver, determineWinner } from '@/utils/gameStateUtils';
import { calculateScore } from '@/utils/pieceManipulation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useGameCompletion(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && checkGameOver(gameState)) {
      // Calculate scores for all players based on their pieces
      const updatedPlayers = gameState.players.map(player => ({
        ...player,
        score: calculateScore(player.pieces)
      }));
      
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
      
      // Update profile statistics if we're in a multiplayer game with a real user
      if (user && gameState.players.length > 1) {
        updateProfileStats(winner);
      }
    }
  }, [gameState, setGameState, user]);
  
  // Update profile stats based on game result
  const updateProfileStats = async (winner: number | null) => {
    if (!user) return;
    
    try {
      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wins, losses, draws')
        .eq('id', user.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching profile stats:', fetchError);
        return;
      }
      
      // Determine what to update
      let updates = {};
      const playerIndex = gameState.players.findIndex(
        p => p.id.toString() === user.id.toString()
      );
      
      if (playerIndex >= 0) {
        if (winner === playerIndex) {
          updates = { wins: (profile.wins || 0) + 1 };
        } else if (winner === null) {
          updates = { draws: (profile.draws || 0) + 1 };
        } else {
          updates = { losses: (profile.losses || 0) + 1 };
        }
        
        // Update profile stats
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating profile stats:', updateError);
        }
      }
    } catch (e) {
      console.error('Error in updateProfileStats:', e);
    }
  };
}
