
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
      const updatedPlayers = gameState.players.map(player => ({
        ...player,
        score: calculateScore(player.pieces)
      }));
      
      const winner = determineWinner(updatedPlayers);
      
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gameStatus: 'finished',
        winner
      }));
      
      toast(`Game Over! ${winner !== null ? `Player ${winner + 1} wins!` : 'It\'s a tie!'}`);
    }
  }, [gameState, setGameState]);
}
