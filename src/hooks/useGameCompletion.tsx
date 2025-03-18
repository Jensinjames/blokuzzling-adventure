
import { useEffect } from 'react';
import { toast } from 'sonner';
import { GameState } from '@/types/game';
import { checkGameOver, determineWinner } from '@/utils/gameStateUtils';
import { calculateScore } from '@/utils/pieceManipulation';

export function useGameCompletion(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) {
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
      if (winner !== null) {
        const winnerName = updatedPlayers[winner].name;
        const isHuman = !updatedPlayers[winner].isAI;
        
        if (isHuman) {
          toast.success(`Congratulations! ${winnerName} wins!`);
        } else {
          toast.error(`${winnerName} won the game. Better luck next time!`);
        }
      } else {
        toast.info(`It's a tie!`);
      }
    }
  }, [gameState, setGameState]);
}
