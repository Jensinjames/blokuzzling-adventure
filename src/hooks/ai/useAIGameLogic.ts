
import { GameState } from '@/types/game';
import { hasValidMoves } from '@/utils/gameLogic';
import { toast } from 'sonner';

// Helper function to calculate player scores based on remaining pieces
export const calculateFinalScores = (players: GameState['players']): GameState['players'] => {
  return players.map(player => {
    const unusedPieces = player.pieces.filter(p => !p.used);
    // Score is 89 (total of all piece cells) minus remaining pieces' cells
    let remainingCellCount = 0;
    for (const piece of unusedPieces) {
      remainingCellCount += piece.shape.flat().filter(cell => cell === 1).length;
    }
    return {
      ...player,
      score: 89 - remainingCellCount // 89 is the total number of cells in all pieces
    };
  });
};

export function useAIGameLogic() {
  const checkGameEnd = (
    gameState: GameState,
    humanPlayerIndex: number, 
    aiPlayerIndex: number
  ): { 
    gameEnded: boolean; 
    updatedPlayers?: GameState['players']; 
    winner?: number | null 
  } => {
    // Check if human player has valid moves
    const humanHasValidMoves = hasValidMoves(gameState, humanPlayerIndex);
    
    // If neither player has valid moves, the game should end
    if (!humanHasValidMoves) {
      // Both players are out of moves, calculate final scores and determine winner
      const updatedPlayers = calculateFinalScores(gameState.players);
      
      // Determine winner based on highest score
      const winner = updatedPlayers[0].score > updatedPlayers[1].score ? 0 : 
                    updatedPlayers[0].score < updatedPlayers[1].score ? 1 : null;
      
      // Show appropriate notification
      if (winner === humanPlayerIndex) {
        toast.success("Congratulations! You've won the game!");
      } else if (winner === aiPlayerIndex) {
        toast.error("AI won the game. Better luck next time!");
      } else {
        toast.info("The game ended in a tie!");
      }
      
      return { gameEnded: true, updatedPlayers, winner };
    }
    
    return { gameEnded: false };
  };

  return { checkGameEnd };
}
