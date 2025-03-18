
import { GameState } from '@/types/game';
import { isWithinBounds } from '@/utils/boardValidation';

// Helper function to check for corner-to-corner connections with own pieces
export const checkCornerConnections = (
  row: number,
  col: number,
  gameState: GameState,
  playerIndex: number,
  score: number,
  bonusValue: number
): number => {
  const cornerDirections = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];
  
  let updatedScore = score;
  
  for (const dir of cornerDirections) {
    const adjRow = row + dir.row;
    const adjCol = col + dir.col;
    
    if (isWithinBounds(adjRow, adjCol) && 
        gameState.board[adjRow][adjCol].player === playerIndex) {
      updatedScore += bonusValue;
    }
  }
  
  return updatedScore;
};
