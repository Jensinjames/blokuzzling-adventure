
import { useEffect } from 'react';
import { toast } from 'sonner';
import { GameState } from '@/types/game';
import { checkGameOver, determineWinner } from '@/utils/gameStateUtils';
import { calculateScore } from '@/utils/pieceManipulation';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useGameCompletion(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && checkGameOver(gameState)) {
      console.log("Game over detected, calculating final scores");
      
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
      
      // Update profile statistics if we have a user
      if (user) {
        console.log("User detected, updating profile stats");
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
        return p.id && (typeof p.id === 'string' && p.id.toString() === user.id.toString());
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
          toast.error('Failed to update profile statistics');
        } else {
          console.log("Successfully updated profile stats");
          toast.success('Game results saved to your profile');
        }
      } else {
        console.warn("Player not found in game state:", gameState.players.map(p => p.id));
      }
      
      // Also save the completed game to game_sessions if it's not already there
      if (gameState.gameStatus === 'finished') {
        saveCompletedGame(gameState, winner);
      }
    } catch (e) {
      console.error('Error in updateProfileStats:', e);
    }
  };
  
  // Save a record of the completed game
  const saveCompletedGame = async (gameState: GameState, winner: number | null) => {
    if (!user) return;
    
    try {
      // Create a clean game state for storage
      const gameStateForStorage = {
        ...gameState,
        players: gameState.players.map(player => ({
          id: player.id,
          name: player.name,
          color: player.color,
          score: player.score,
          isAI: player.isAI,
        })),
        winner: winner
      };
      
      // Check if this game is from an existing session
      const gameSessionId = new URLSearchParams(window.location.search).get('id');
      
      if (gameSessionId) {
        // Update existing game session
        const { error } = await supabase
          .from('game_sessions')
          .update({
            status: 'completed',
            game_state: gameStateForStorage,
            winner_id: winner !== null && gameState.players[winner].id ? 
              gameState.players[winner].id.toString() : null
          })
          .eq('id', gameSessionId);
          
        if (error) {
          console.error('Error updating game session:', error);
        } else {
          console.log('Game session updated successfully');
        }
      } else {
        // Create a new game history record
        const { error } = await supabase
          .from('game_sessions')
          .insert({
            creator_id: user.id,
            status: 'completed',
            game_state: gameStateForStorage,
            winner_id: winner !== null && gameState.players[winner].id ? 
              gameState.players[winner].id.toString() : null,
            max_players: gameState.players.length,
            current_players: gameState.players.filter(p => !p.isAI).length,
            ai_enabled: gameState.players.some(p => p.isAI),
            ai_count: gameState.players.filter(p => p.isAI).length
          });
          
        if (error) {
          console.error('Error saving game history:', error);
        } else {
          console.log('Game history saved successfully');
        }
      }
    } catch (e) {
      console.error('Error saving completed game:', e);
    }
  };
}
