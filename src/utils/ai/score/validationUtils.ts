
import { isWithinBounds } from '@/utils/boardValidation';

// Helper to check if a cell is valid for a given player
export const isValidForPlayer = (
  row: number,
  col: number,
  board: any[][],
  playerIndex: number
): boolean => {
  // Check if cell is already occupied
  if (board[row][col].player !== null) {
    return false;
  }
  
  // Check adjacent orthogonal cells (if any are this player's, it's not valid)
  const orthogonalDirs = [
    { row: -1, col: 0 }, { row: 1, col: 0 },
    { row: 0, col: -1 }, { row: 0, col: 1 }
  ];
  
  for (const dir of orthogonalDirs) {
    const adjRow = row + dir.row;
    const adjCol = col + dir.col;
    
    if (isWithinBounds(adjRow, adjCol) && board[adjRow][adjCol].player === playerIndex) {
      return false;
    }
  }
  
  // Check diagonal cells (at least one should be this player's)
  const diagonalDirs = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];
  
  for (const dir of diagonalDirs) {
    const adjRow = row + dir.row;
    const adjCol = col + dir.col;
    
    if (isWithinBounds(adjRow, adjCol) && board[adjRow][adjCol].player === playerIndex) {
      return true;
    }
  }
  
  return false;
};
